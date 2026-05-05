import type { Geometry } from 'geojson';

export type SupportedGeometryType =
  | 'Point'
  | 'MultiPoint'
  | 'LineString'
  | 'MultiLineString'
  | 'Polygon'
  | 'MultiPolygon'
  | 'GeometryCollection';

export interface GeoFeature {
  id: string;
  projectId: string;
  sourceFileId: string;
  sourceFileName: string;
  name: string;
  description?: string;
  geometryType: SupportedGeometryType;
  geometry: Geometry;
  properties: Record<string, unknown>;
  createdAt: string;
}

