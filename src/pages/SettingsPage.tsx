import { RotateCcw, Save, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppSettings, BasemapId } from '../models/AppSettings';
import { getDefaultSettings, getSettings, resetSettings, saveSettings } from '../services/settingsService';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const saved = saveSettings(settings);
    setSettings(saved);
    setMessage('Settings saved locally.');
  }

  function reset() {
    const defaults = resetSettings();
    setSettings(defaults);
    setMessage('Settings reset to defaults.');
  }

  return (
    <div className="settings-grid">
      <section className="work-panel settings-panel">
        <div className="section-title-row">
          <Settings size={20} />
          <h2>App settings</h2>
        </div>
        <div className="form-grid">
          <label className="field-control">
            <span>Google Maps API key</span>
            <input
              value={settings.googleApiKey}
              type="password"
              autoComplete="off"
              onChange={(event) => updateSetting('googleApiKey', event.target.value)}
              placeholder="Optional"
            />
            <small>Satellite is gated by this key, but official Google rendering remains a configured enhancement.</small>
          </label>

          <label className="field-control">
            <span>Default basemap</span>
            <select
              value={settings.defaultBasemap}
              onChange={(event) => updateSetting('defaultBasemap', event.target.value as BasemapId)}
            >
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="google-satellite" disabled={!settings.googleApiKey.trim()}>
                Google Satellite
              </option>
            </select>
          </label>

          <label className="field-control">
            <span>Coordinate display</span>
            <select value={settings.coordinateDisplayFormat} disabled>
              <option value="decimal">Decimal latitude/longitude</option>
            </select>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.enableHeadingCapture}
              onChange={(event) => updateSetting('enableHeadingCapture', event.target.checked)}
            />
            <span>
              <strong>Enable heading capture</strong>
              <small>Uses DeviceOrientation when browser and device support it.</small>
            </span>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.savePhotosLocally}
              onChange={(event) => updateSetting('savePhotosLocally', event.target.checked)}
            />
            <span>
              <strong>Save photo blobs locally</strong>
              <small>Stores original images in IndexedDB for ZIP export when quota allows.</small>
            </span>
          </label>

          {message ? <p className="status-message">{message}</p> : null}

          <div className="split-actions">
            <button className="button primary" type="button" onClick={save}>
              <Save size={18} />
              Save settings
            </button>
            <button className="button secondary" type="button" onClick={reset}>
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="work-panel notes-panel">
        <h2>Configuration notes</h2>
        <ul className="check-list">
          <li>OpenStreetMap is the default free basemap.</li>
          <li>Google Satellite needs a valid Maps Platform key and billing before production use.</li>
          <li>Automatic heading is browser-dependent; manual correction is always available.</li>
          <li>Offline app shell is enabled, but offline basemap packages are a future phase.</li>
          <li>Photos can be captured immediately or selected later from device storage.</li>
        </ul>
      </section>
    </div>
  );
}

