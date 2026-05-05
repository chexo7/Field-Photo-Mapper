import L from 'leaflet';
import { GeoJSON } from 'react-leaflet';
import type { Feature, Point } from 'geojson';
import type { GeoFeature } from '../models/GeoFeature';
import { getFeaturePathStyle } from '../services/featureLayerService';
import { geometryToFeature } from '../utils/geoUtils';

interface FeatureLayerProps {
  features: GeoFeature[];
}

export function FeatureLayer({ features }: FeatureLayerProps) {
  if (features.length === 0) {
    return null;
  }

  const featureCollection = {
    type: 'FeatureCollection' as const,
    features: features.map(geometryToFeature)
  };

  return (
    <GeoJSON
      key={features.map((feature) => feature.id).join('|')}
      data={featureCollection}
      style={getFeaturePathStyle}
      pointToLayer={(feature, latlng) => {
        const pointFeature = feature as Feature<Point>;
        return L.circleMarker(latlng, {
          radius: pointFeature.geometry.type === 'Point' ? 7 : 5,
          color: '#0f5132',
          fillColor: '#f59f00',
          fillOpacity: 0.92,
          weight: 2
        });
      }}
      onEachFeature={(feature, layer) => {
        const properties = feature.properties ?? {};
        const popupContent = document.createElement('div');
        popupContent.className = 'leaflet-rich-popup';
        popupContent.innerHTML = `
          <strong>${escapeHtml(String(properties.name ?? 'Unnamed feature'))}</strong>
          <span>${escapeHtml(feature.geometry?.type ?? 'Unknown geometry')}</span>
          ${
            properties.description
              ? `<p>${escapeHtml(String(properties.description))}</p>`
              : ''
          }
          <small>${escapeHtml(String(properties.sourceFileName ?? 'Imported file'))}</small>
        `;
        layer.bindPopup(popupContent);
      }}
    />
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
