import type { FieldPhoto, PhotoLocationMetadata, PhotoSource } from '../models/FieldPhoto';
import { createId, nowIso } from './storageService';

const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

export interface PreparedImage {
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
}

export interface BuildPhotoInput {
  projectId: string;
  file: File;
  note: string;
  source: PhotoSource;
  location?: Omit<PhotoLocationMetadata, 'locationMissing'>;
  headingDegreesAuto?: number;
  headingDegreesManual?: number;
  headingCapturedAt?: string;
  width?: number;
  height?: number;
  saveImageBlob: boolean;
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Select an image file.';
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'Images over 30 MB are not accepted in this MVP.';
  }

  return null;
}

export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreview(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read image dimensions.'));
    };
    image.src = objectUrl;
  });
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const validationMessage = validateImageFile(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const previewUrl = createImagePreview(file);
  try {
    const dimensions = await readImageDimensions(file);
    return {
      file,
      previewUrl,
      ...dimensions
    };
  } catch {
    return {
      file,
      previewUrl
    };
  }
}

export function resolveHeading(autoHeading?: number, manualHeading?: number): number | undefined {
  if (typeof manualHeading === 'number' && Number.isFinite(manualHeading)) {
    return manualHeading;
  }

  if (typeof autoHeading === 'number' && Number.isFinite(autoHeading)) {
    return autoHeading;
  }

  return undefined;
}

export function buildPhotoRecord(input: BuildPhotoInput): FieldPhoto {
  const timestamp = nowIso();
  const locationMissing =
    typeof input.location?.latitude !== 'number' || typeof input.location?.longitude !== 'number';
  const headingUsed = resolveHeading(input.headingDegreesAuto, input.headingDegreesManual);

  return {
    id: createId('photo'),
    projectId: input.projectId,
    fileName: input.file.name,
    mimeType: input.file.type || 'application/octet-stream',
    sizeBytes: input.file.size,
    imageBlob: input.saveImageBlob ? input.file : undefined,
    width: input.width,
    height: input.height,
    source: input.source,
    latitude: input.location?.latitude,
    longitude: input.location?.longitude,
    accuracyMeters: input.location?.accuracyMeters,
    altitudeMeters: input.location?.altitudeMeters,
    altitudeAccuracyMeters: input.location?.altitudeAccuracyMeters,
    capturedAt: input.location?.capturedAt,
    locationMissing,
    headingDegreesAuto: input.headingDegreesAuto,
    headingDegreesManual: input.headingDegreesManual,
    headingUsed,
    headingCapturedAt: input.headingCapturedAt,
    note: input.note.trim(),
    takenAt: input.file.lastModified ? new Date(input.file.lastModified).toISOString() : undefined,
    savedAt: timestamp,
    updatedAt: timestamp
  };
}

export function getPhotoObjectUrl(photo: FieldPhoto): string | null {
  if (!photo.imageBlob) {
    return null;
  }
  return URL.createObjectURL(photo.imageBlob);
}

