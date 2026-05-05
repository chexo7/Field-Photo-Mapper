import type { BasemapId } from '../models/AppSettings';
import { getAvailableBasemaps } from '../services/basemapService';
import { getSettings } from '../services/settingsService';

interface BasemapSwitcherProps {
  selectedBasemap: BasemapId;
  onBasemapChange: (basemapId: BasemapId) => void;
}

export function BasemapSwitcher({ selectedBasemap, onBasemapChange }: BasemapSwitcherProps) {
  const settings = getSettings();
  const basemaps = getAvailableBasemaps(settings);
  const selected = basemaps.find((basemap) => basemap.id === selectedBasemap) ?? basemaps[0];

  return (
    <label className="field-control basemap-switcher">
      <span>Basemap</span>
      <select
        value={selectedBasemap}
        onChange={(event) => onBasemapChange(event.target.value as BasemapId)}
      >
        {basemaps.map((basemap) => (
          <option key={basemap.id} value={basemap.id} disabled={!basemap.enabled}>
            {basemap.label}
            {!basemap.enabled ? ' (API key required)' : ''}
          </option>
        ))}
      </select>
      {selected.statusText ? <small>{selected.statusText}</small> : null}
    </label>
  );
}

