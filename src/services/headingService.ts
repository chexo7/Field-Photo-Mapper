export interface HeadingReading {
  headingDegrees: number;
  capturedAt: string;
  source: 'webkitCompassHeading' | 'deviceOrientationAlpha';
}

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

type CompassOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export function normalizeHeading(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function getHeadingFromEvent(event: DeviceOrientationEvent): HeadingReading | null {
  const compassEvent = event as CompassOrientationEvent;
  if (typeof compassEvent.webkitCompassHeading === 'number') {
    return {
      headingDegrees: normalizeHeading(compassEvent.webkitCompassHeading),
      capturedAt: new Date().toISOString(),
      source: 'webkitCompassHeading'
    };
  }

  if (typeof event.alpha === 'number') {
    return {
      headingDegrees: normalizeHeading(360 - event.alpha),
      capturedAt: new Date().toISOString(),
      source: 'deviceOrientationAlpha'
    };
  }

  return null;
}

export function isHeadingSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

export async function requestHeadingPermission(): Promise<PermissionState> {
  if (!isHeadingSupported()) {
    return 'unsupported';
  }

  const orientationEvent = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
  if (typeof orientationEvent.requestPermission === 'function') {
    const result = await orientationEvent.requestPermission();
    return result;
  }

  return 'granted';
}

export function startHeadingWatch(onHeading: (reading: HeadingReading) => void): () => void {
  const handler = (event: DeviceOrientationEvent) => {
    const heading = getHeadingFromEvent(event);
    if (heading) {
      onHeading(heading);
    }
  };

  window.addEventListener('deviceorientation', handler, true);
  return () => window.removeEventListener('deviceorientation', handler, true);
}

