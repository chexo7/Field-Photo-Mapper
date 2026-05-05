export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  defaultLatitude: number;
  defaultLongitude: number;
  notes: string;
}

export interface ProjectStats {
  photoCount: number;
  locatedPhotoCount: number;
  importedFileCount: number;
  featureCount: number;
  lastUpdatedAt?: string;
}

