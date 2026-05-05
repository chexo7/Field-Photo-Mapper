import type { AppSettings, BasemapId } from '../models/AppSettings';

const SETTINGS_KEY = 'field-photo-mapper-settings';

export function getDefaultSettings(): AppSettings {
  return {
    googleApiKey: '',
    defaultBasemap: 'openstreetmap',
    coordinateDisplayFormat: 'decimal',
    enableHeadingCapture: true,
    savePhotosLocally: true,
    appVersion: '0.4.0'
  };
}

export function isBasemapId(value: string): value is BasemapId {
  return value === 'openstreetmap' || value === 'google-satellite';
}

export function getSettings(): AppSettings {
  const defaults = getDefaultSettings();
  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...defaults,
      ...parsed,
      defaultBasemap:
        parsed.defaultBasemap && isBasemapId(parsed.defaultBasemap)
          ? parsed.defaultBasemap
          : defaults.defaultBasemap,
      coordinateDisplayFormat: 'decimal'
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: AppSettings): AppSettings {
  const sanitized: AppSettings = {
    ...getDefaultSettings(),
    ...settings,
    googleApiKey: settings.googleApiKey.trim(),
    defaultBasemap: isBasemapId(settings.defaultBasemap) ? settings.defaultBasemap : 'openstreetmap',
    coordinateDisplayFormat: 'decimal'
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new CustomEvent<AppSettings>('field-photo-mapper:settings', { detail: sanitized }));
  return sanitized;
}

export function resetSettings(): AppSettings {
  const defaults = getDefaultSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
  window.dispatchEvent(new CustomEvent<AppSettings>('field-photo-mapper:settings', { detail: defaults }));
  return defaults;
}

