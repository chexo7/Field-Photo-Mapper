import type { PathOptions } from 'leaflet';
import type { GeoFeature } from '../models/GeoFeature';

export interface FeatureCounts {
  points: number;
  lines: number;
  polygons: number;
  other: number;
}

export function countFeatures(features: GeoFeature[]): FeatureCounts {
  return features.reduce<FeatureCounts>(
    (counts, feature) => {
      if (feature.geometryType.includes('Point')) {
        counts.points += 1;
      } else if (feature.geometryType.includes('LineString')) {
        counts.lines += 1;
      } else if (feature.geometryType.includes('Polygon')) {
        counts.polygons += 1;
      } else {
        counts.other += 1;
      }
      return counts;
    },
    { points: 0, lines: 0, polygons: 0, other: 0 }
  );
}

export function getFeaturePathStyle(feature?: GeoJSON.Feature): PathOptions {
  const type = feature?.geometry?.type ?? '';

  if (type.includes('Polygon')) {
    return {
      color: '#12745b',
      weight: 3,
      opacity: 0.9,
      fillColor: '#42b883',
      fillOpacity: 0.12
    };
  }

  if (type.includes('LineString')) {
    return {
      color: '#2563eb',
      weight: 4,
      opacity: 0.85
    };
  }

  return {
    color: '#0f5132',
    weight: 2,
    opacity: 0.9,
    fillColor: '#f59f00',
    fillOpacity: 0.9
  };
}

