export type BasemapId = 'openstreetmap' | 'google-satellite';

export type CoordinateDisplayFormat = 'decimal';

export interface AppSettings {
  googleApiKey: string;
  defaultBasemap: BasemapId;
  coordinateDisplayFormat: CoordinateDisplayFormat;
  enableHeadingCapture: boolean;
  savePhotosLocally: boolean;
  appVersion: string;
}

