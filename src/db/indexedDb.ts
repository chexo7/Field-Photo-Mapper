import Dexie, { type Table } from 'dexie';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import type { KmzFileRecord } from '../models/KmzFileRecord';
import type { Project } from '../models/Project';

export class FieldPhotoMapperDatabase extends Dexie {
  projects!: Table<Project, string>;
  photos!: Table<FieldPhoto, string>;
  features!: Table<GeoFeature, string>;
  importedFiles!: Table<KmzFileRecord, string>;

  constructor() {
    super('FieldPhotoMapperDb');

    this.version(1).stores({
      projects: 'id, name, updatedAt',
      photos: 'id, projectId, savedAt, updatedAt, latitude, longitude',
      features: 'id, projectId, sourceFileId, geometryType, name',
      importedFiles: 'id, projectId, importedAt, fileName'
    });

    this.version(2).stores({
      projects: 'id, name, createdAt, updatedAt',
      photos: 'id, projectId, savedAt, updatedAt, latitude, longitude',
      features: 'id, projectId, sourceFileId, geometryType, name',
      importedFiles: 'id, projectId, importedAt, fileName'
    });
  }
}

export const db = new FieldPhotoMapperDatabase();
