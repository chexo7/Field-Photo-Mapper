import { kml as kmlToGeoJson } from '@tmcw/togeojson';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import JSZip from 'jszip';
import type { GeoFeature, SupportedGeometryType } from '../models/GeoFeature';
import type { KmzFileRecord } from '../models/KmzFileRecord';
import { createId, nowIso } from './storageService';

export interface ImportResult {
  record: KmzFileRecord;
  features: GeoFeature[];
}

export async function parseKmlOrKmz(file: File, projectId: string): Promise<ImportResult> {
  const fileName = file.name;
  const fileType = fileName.toLowerCase().endsWith('.kmz') ? 'kmz' : 'kml';
  const warningMessages: string[] = [];
  const kmlText = fileType === 'kmz' ? await extractKmlFromKmz(file, warningMessages) : await file.text();
  const parser = new DOMParser();
  const document = parser.parseFromString(kmlText, 'application/xml');
  const parseError = document.querySelector('parsererror');

  if (parseError) {
    throw new Error('The selected file could not be parsed as KML.');
  }

  const geoJson = kmlToGeoJson(document, { skipNullGeometry: true }) as FeatureCollection<Geometry>;
  const sourceFileId = createId('import');
  const timestamp = nowIso();
  const features = geoJson.features
    .filter((feature): feature is Feature<Geometry> => Boolean(feature.geometry))
    .flatMap((feature, index) =>
      normalizeFeature(feature, {
        index,
        projectId,
        sourceFileId,
        sourceFileName: fileName,
        createdAt: timestamp,
        warningMessages
      })
    );

  const record: KmzFileRecord = {
    id: sourceFileId,
    projectId,
    fileName,
    fileType,
    importedAt: timestamp,
    featureCount: features.length,
    pointCount: features.filter((feature) => feature.geometryType.includes('Point')).length,
    lineCount: features.filter((feature) => feature.geometryType.includes('LineString')).length,
    polygonCount: features.filter((feature) => feature.geometryType.includes('Polygon')).length,
    warningMessages
  };

  return { record, features };
}

async function extractKmlFromKmz(file: File, warningMessages: string[]): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const kmlEntries = Object.values(zip.files).filter(
    (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.kml')
  );

  if (kmlEntries.length === 0) {
    throw new Error('The KMZ file does not contain a KML document.');
  }

  if (kmlEntries.length > 1) {
    warningMessages.push(`KMZ contained ${kmlEntries.length} KML files; imported ${kmlEntries[0].name}.`);
  }

  return kmlEntries[0].async('text');
}

interface NormalizeContext {
  index: number;
  projectId: string;
  sourceFileId: string;
  sourceFileName: string;
  createdAt: string;
  warningMessages: string[];
}

function normalizeFeature(feature: Feature<Geometry>, context: NormalizeContext): GeoFeature[] {
  if (!isSupportedGeometryType(feature.geometry.type)) {
    context.warningMessages.push(`Skipped unsupported geometry ${feature.geometry.type}.`);
    return [];
  }

  return [
    {
      id: createId('feature'),
      projectId: context.projectId,
      sourceFileId: context.sourceFileId,
      sourceFileName: context.sourceFileName,
      name: readFeatureName(feature, context.index),
      description: readFeatureDescription(feature),
      geometryType: feature.geometry.type,
      geometry: feature.geometry,
      properties: { ...(feature.properties ?? {}) },
      createdAt: context.createdAt
    }
  ];
}

function readFeatureName(feature: Feature<Geometry>, index: number): string {
  const properties = feature.properties ?? {};
  const rawName = properties.name ?? properties.Name ?? properties.title ?? properties.Title;
  return typeof rawName === 'string' && rawName.trim() ? rawName.trim() : `Feature ${index + 1}`;
}

function readFeatureDescription(feature: Feature<Geometry>): string | undefined {
  const properties = feature.properties ?? {};
  const rawDescription = properties.description ?? properties.Description;
  return typeof rawDescription === 'string' && rawDescription.trim() ? rawDescription.trim() : undefined;
}

function isSupportedGeometryType(value: string): value is SupportedGeometryType {
  return [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection'
  ].includes(value);
}

