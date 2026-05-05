export interface LocationReading {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number | null;
  altitudeAccuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMetersPerSecond?: number | null;
  capturedAt: string;
}

export interface LocationFailure {
  code: number;
  message: string;
}

const defaultOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5000
};

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

export function normalizePosition(position: GeolocationPosition): LocationReading {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy,
    altitudeMeters: position.coords.altitude,
    altitudeAccuracyMeters: position.coords.altitudeAccuracy,
    headingDegrees: position.coords.heading,
    speedMetersPerSecond: position.coords.speed,
    capturedAt: new Date(position.timestamp).toISOString()
  };
}

export function formatLocationError(error: GeolocationPositionError): LocationFailure {
  const messageByCode: Record<number, string> = {
    [error.PERMISSION_DENIED]: 'Location permission was denied.',
    [error.POSITION_UNAVAILABLE]: 'Current position is unavailable.',
    [error.TIMEOUT]: 'Location request timed out.'
  };

  return {
    code: error.code,
    message: messageByCode[error.code] ?? error.message ?? 'Unable to read current position.'
  };
}

export function getCurrentPosition(options: PositionOptions = defaultOptions): Promise<LocationReading> {
  if (!isGeolocationSupported()) {
    return Promise.reject({ code: 0, message: 'This browser does not support geolocation.' });
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(normalizePosition(position)),
      (error) => reject(formatLocationError(error)),
      options
    );
  });
}

export function watchPosition(
  onPosition: (position: LocationReading) => void,
  onError: (error: LocationFailure) => void,
  options: PositionOptions = defaultOptions
): number {
  if (!isGeolocationSupported()) {
    onError({ code: 0, message: 'This browser does not support geolocation.' });
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => onPosition(normalizePosition(position)),
    (error) => onError(formatLocationError(error)),
    options
  );
}

export function clearWatch(watchId: number | null): void {
  if (watchId !== null && watchId >= 0 && isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
}

