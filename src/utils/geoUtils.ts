import type {
  Feature,
  Geometry,
  GeometryCollection,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  Position
} from 'geojson';
import type { NearestFeatureAssociation } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';

const EARTH_RADIUS_METERS = 6371008.8;

export interface LatLon {
  latitude: number;
  longitude: number;
}

export function isValidCoordinate(latitude?: number, longitude?: number): latitude is number {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function formatCoordinate(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Missing';
  }
  return value.toFixed(6);
}

export function haversineDistanceMeters(a: LatLon, b: LatLon): number {
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLon = toRadians(b.longitude - a.longitude);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function destinationPoint(origin: LatLon, headingDegrees: number, distanceMeters: number): LatLon {
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;
  const bearing = toRadians(headingDegrees);
  const lat1 = toRadians(origin.latitude);
  const lon1 = toRadians(origin.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: toDegrees(lat2),
    longitude: ((toDegrees(lon2) + 540) % 360) - 180
  };
}

export function distanceToGeometryMeters(point: LatLon, geometry: Geometry): number {
  switch (geometry.type) {
    case 'Point':
      return distanceToPosition(point, (geometry as Point).coordinates);
    case 'MultiPoint':
      return minDistance((geometry as MultiPoint).coordinates.map((position) => distanceToPosition(point, position)));
    case 'LineString':
      return distanceToLineString(point, geometry as LineString);
    case 'MultiLineString':
      return minDistance(
        (geometry as MultiLineString).coordinates.map((coordinates) =>
          distanceToLineString(point, { type: 'LineString', coordinates })
        )
      );
    case 'Polygon':
      return distanceToPolygon(point, geometry as Polygon);
    case 'MultiPolygon':
      return minDistance(
        (geometry as MultiPolygon).coordinates.map((coordinates) =>
          distanceToPolygon(point, { type: 'Polygon', coordinates })
        )
      );
    case 'GeometryCollection':
      return minDistance(
        (geometry as GeometryCollection).geometries.map((childGeometry) =>
          distanceToGeometryMeters(point, childGeometry)
        )
      );
    default:
      return Number.POSITIVE_INFINITY;
  }
}

export function findNearestFeature(
  point: LatLon,
  features: GeoFeature[]
): NearestFeatureAssociation | undefined {
  let nearest: NearestFeatureAssociation | undefined;

  for (const feature of features) {
    const distanceMeters = distanceToGeometryMeters(point, feature.geometry);
    if (!Number.isFinite(distanceMeters)) {
      continue;
    }

    if (!nearest || distanceMeters < nearest.distanceMeters) {
      nearest = {
        featureId: feature.id,
        featureName: feature.name || 'Unnamed feature',
        featureType: feature.geometryType,
        distanceMeters
      };
    }
  }

  return nearest;
}

export function geometryToFeature(feature: GeoFeature): Feature {
  return {
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
      ...feature.properties,
      id: feature.id,
      name: feature.name,
      description: feature.description,
      sourceFileName: feature.sourceFileName
    }
  };
}

function distanceToPolygon(point: LatLon, polygon: Polygon): number {
  if (polygon.coordinates.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (isPointInPolygon(point, polygon.coordinates)) {
    return 0;
  }

  return minDistance(
    polygon.coordinates.flatMap((ring) =>
      ring.slice(1).map((position, index) => distanceToSegmentMeters(point, ring[index], position))
    )
  );
}

function distanceToLineString(point: LatLon, lineString: LineString): number {
  if (lineString.coordinates.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (lineString.coordinates.length === 1) {
    return distanceToPosition(point, lineString.coordinates[0]);
  }

  return minDistance(
    lineString.coordinates
      .slice(1)
      .map((position, index) => distanceToSegmentMeters(point, lineString.coordinates[index], position))
  );
}

function distanceToPosition(point: LatLon, position: Position): number {
  return haversineDistanceMeters(point, {
    latitude: position[1],
    longitude: position[0]
  });
}

function distanceToSegmentMeters(point: LatLon, start: Position, end: Position): number {
  const originLat = point.latitude;
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = metersPerDegreeLat * Math.cos(toRadians(originLat));

  const pointXY = { x: point.longitude * metersPerDegreeLon, y: point.latitude * metersPerDegreeLat };
  const startXY = { x: start[0] * metersPerDegreeLon, y: start[1] * metersPerDegreeLat };
  const endXY = { x: end[0] * metersPerDegreeLon, y: end[1] * metersPerDegreeLat };
  const dx = endXY.x - startXY.x;
  const dy = endXY.y - startXY.y;

  if (dx === 0 && dy === 0) {
    return distanceToPosition(point, start);
  }

  const t = Math.max(
    0,
    Math.min(1, ((pointXY.x - startXY.x) * dx + (pointXY.y - startXY.y) * dy) / (dx * dx + dy * dy))
  );
  const projected = {
    x: startXY.x + t * dx,
    y: startXY.y + t * dy
  };

  return Math.hypot(pointXY.x - projected.x, pointXY.y - projected.y);
}

function isPointInPolygon(point: LatLon, rings: Position[][]): boolean {
  if (!rings[0] || !isPointInRing(point, rings[0])) {
    return false;
  }

  return !rings.slice(1).some((hole) => isPointInRing(point, hole));
}

function isPointInRing(point: LatLon, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function minDistance(values: number[]): number {
  return values.reduce((minimum, value) => Math.min(minimum, value), Number.POSITIVE_INFINITY);
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

