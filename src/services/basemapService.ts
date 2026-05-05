import type { AppSettings, BasemapId } from '../models/AppSettings';

export interface BasemapDefinition {
  id: BasemapId;
  label: string;
  attribution: string;
  tileUrl?: string;
  enabled: boolean;
  statusText?: string;
}

const osmAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function getAvailableBasemaps(settings: AppSettings): BasemapDefinition[] {
  const hasGoogleKey = settings.googleApiKey.trim().length > 0;

  return [
    {
      id: 'openstreetmap',
      label: 'OpenStreetMap',
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: osmAttribution,
      enabled: true,
      statusText: 'Free default basemap'
    },
    {
      id: 'google-satellite',
      label: 'Google Satellite',
      tileUrl: undefined,
      attribution: 'Google Maps Platform satellite integration pending official implementation',
      enabled: hasGoogleKey,
      statusText: hasGoogleKey
        ? 'API key saved. Official Maps JavaScript integration is documented as a remaining configuration item.'
        : 'Requires a Google Maps API key in Settings'
    }
  ];
}

export function resolveBasemap(settings: AppSettings, selectedBasemap: BasemapId): BasemapDefinition {
  const basemaps = getAvailableBasemaps(settings);
  const requested = basemaps.find((basemap) => basemap.id === selectedBasemap);

  if (requested?.enabled && requested.tileUrl) {
    return requested;
  }

  return basemaps[0];
}

