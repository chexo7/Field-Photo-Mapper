import { db } from '../db/indexedDb';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import type { KmzFileRecord } from '../models/KmzFileRecord';
import type { Project, ProjectStats } from '../models/Project';

const ACTIVE_PROJECT_KEY = 'field-photo-mapper-active-project';

export function createId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${randomPart}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(projectId: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
}

export async function ensureDefaultProject(): Promise<Project> {
  const existingProjects = await db.projects.toArray();
  existingProjects.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const activeProjectId = getActiveProjectId();
  const activeProject = activeProjectId ? await db.projects.get(activeProjectId) : undefined;

  if (activeProject) {
    return activeProject;
  }

  if (existingProjects.length > 0) {
    setActiveProjectId(existingProjects[0].id);
    return existingProjects[0];
  }

  const timestamp = nowIso();
  const project: Project = {
    id: createId('project'),
    name: 'Default Field Project',
    createdAt: timestamp,
    updatedAt: timestamp,
    defaultLatitude: 29.7604,
    defaultLongitude: -95.3698,
    notes: 'Starter project centered on Houston for map testing.'
  };

  await db.projects.add(project);
  setActiveProjectId(project.id);
  return project;
}

export async function listProjects(): Promise<Project[]> {
  const projects = await db.projects.toArray();
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(projectId: string): Promise<Project | undefined> {
  return db.projects.get(projectId);
}

export async function createProject(input: {
  name: string;
  defaultLatitude?: number;
  defaultLongitude?: number;
  notes?: string;
}): Promise<Project> {
  const timestamp = nowIso();
  const project: Project = {
    id: createId('project'),
    name: input.name.trim() || 'Untitled Project',
    createdAt: timestamp,
    updatedAt: timestamp,
    defaultLatitude: input.defaultLatitude ?? 29.7604,
    defaultLongitude: input.defaultLongitude ?? -95.3698,
    notes: input.notes?.trim() ?? ''
  };

  await db.projects.add(project);
  setActiveProjectId(project.id);
  return project;
}

export async function updateProject(project: Project): Promise<void> {
  await db.projects.put({ ...project, updatedAt: nowIso() });
}

export async function deleteProject(projectId: string): Promise<void> {
  await db.transaction('rw', db.projects, db.photos, db.features, db.importedFiles, async () => {
    await db.photos.where('projectId').equals(projectId).delete();
    await db.features.where('projectId').equals(projectId).delete();
    await db.importedFiles.where('projectId').equals(projectId).delete();
    await db.projects.delete(projectId);
  });

  const remaining = await listProjects();
  if (remaining[0]) {
    setActiveProjectId(remaining[0].id);
  } else {
    await ensureDefaultProject();
  }
}

export async function touchProject(projectId: string): Promise<void> {
  const project = await db.projects.get(projectId);
  if (project) {
    await db.projects.update(projectId, { updatedAt: nowIso() });
  }
}

export async function getProjectPhotos(projectId: string): Promise<FieldPhoto[]> {
  return db.photos.where('projectId').equals(projectId).reverse().sortBy('savedAt');
}

export async function getPhoto(photoId: string): Promise<FieldPhoto | undefined> {
  return db.photos.get(photoId);
}

export async function savePhoto(photo: FieldPhoto): Promise<void> {
  await db.photos.put(photo);
  await touchProject(photo.projectId);
}

export async function updatePhoto(photoId: string, patch: Partial<FieldPhoto>): Promise<void> {
  const existing = await db.photos.get(photoId);
  if (!existing) {
    return;
  }
  const updatedPhoto = { ...existing, ...patch, updatedAt: nowIso() };
  await db.photos.put(updatedPhoto);
  await touchProject(updatedPhoto.projectId);
}

export async function deletePhoto(photoId: string): Promise<void> {
  const existing = await db.photos.get(photoId);
  if (!existing) {
    return;
  }
  await db.photos.delete(photoId);
  await touchProject(existing.projectId);
}

export async function getProjectFeatures(projectId: string): Promise<GeoFeature[]> {
  return db.features.where('projectId').equals(projectId).toArray();
}

export async function getImportedFiles(projectId: string): Promise<KmzFileRecord[]> {
  return db.importedFiles.where('projectId').equals(projectId).reverse().sortBy('importedAt');
}

export async function saveImport(record: KmzFileRecord, features: GeoFeature[]): Promise<void> {
  await db.transaction('rw', db.importedFiles, db.features, db.projects, async () => {
    await db.importedFiles.put(record);
    await db.features.bulkPut(features);
    await touchProject(record.projectId);
  });
}

export async function deleteImport(recordId: string): Promise<void> {
  const record = await db.importedFiles.get(recordId);
  if (!record) {
    return;
  }
  await db.transaction('rw', db.importedFiles, db.features, db.projects, async () => {
    await db.features.where('sourceFileId').equals(recordId).delete();
    await db.importedFiles.delete(recordId);
    await touchProject(record.projectId);
  });
}

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const [photos, importedFiles, features, project] = await Promise.all([
    getProjectPhotos(projectId),
    getImportedFiles(projectId),
    getProjectFeatures(projectId),
    getProject(projectId)
  ]);

  const latestPhoto = latestString(photos.map((photo) => photo.updatedAt));

  const latestImport = latestString(importedFiles.map((file) => file.importedAt));

  return {
    photoCount: photos.length,
    locatedPhotoCount: photos.filter((photo) => !photo.locationMissing).length,
    importedFileCount: importedFiles.length,
    featureCount: features.length,
    lastUpdatedAt: latestString([project?.updatedAt, latestPhoto, latestImport].filter(Boolean) as string[])
  };
}

function latestString(values: string[]): string | undefined {
  const sorted = [...values].sort();
  return sorted.length > 0 ? sorted[sorted.length - 1] : undefined;
}
