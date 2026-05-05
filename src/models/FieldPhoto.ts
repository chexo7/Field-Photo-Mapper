export type PhotoSource = 'camera' | 'file';

export interface PhotoLocationMetadata {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  altitudeMeters?: number | null;
  altitudeAccuracyMeters?: number | null;
  capturedAt?: string;
  locationMissing: boolean;
}

export interface NearestFeatureAssociation {
  featureId: string;
  featureName: string;
  featureType: string;
  distanceMeters: number;
}

export interface FieldPhoto extends PhotoLocationMetadata {
  id: string;
  projectId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  imageBlob?: Blob;
  thumbnailBlob?: Blob;
  width?: number;
  height?: number;
  source: PhotoSource;
  headingDegreesAuto?: number;
  headingDegreesManual?: number;
  headingUsed?: number;
  headingCapturedAt?: string;
  note: string;
  takenAt?: string;
  savedAt: string;
  updatedAt: string;
  nearestFeature?: NearestFeatureAssociation;
}

