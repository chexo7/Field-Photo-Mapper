import JSZip from 'jszip';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import type { Project } from '../models/Project';
import { compactDateStamp } from '../utils/dateUtils';
import { sanitizeFileName } from '../utils/fileUtils';
import { destinationPoint, isValidCoordinate } from '../utils/geoUtils';

const CSV_FIELDS = [
  'PhotoId',
  'ProjectName',
  'FileName',
  'Latitude',
  'Longitude',
  'HeadingDegreesAuto',
  'HeadingDegreesManual',
  'HeadingUsed',
  'PhotoTakenAt',
  'PhotoSavedAt',
  'Note',
  'NearestFeatureName',
  'NearestFeatureType',
  'NearestFeatureDistance'
];

export function buildPhotoCsv(project: Project, photos: FieldPhoto[]): string {
  const rows = photos.map((photo) => [
    photo.id,
    project.name,
    photo.fileName,
    photo.latitude ?? '',
    photo.longitude ?? '',
    photo.headingDegreesAuto ?? '',
    photo.headingDegreesManual ?? '',
    photo.headingUsed ?? '',
    photo.takenAt ?? '',
    photo.savedAt,
    photo.note,
    photo.nearestFeature?.featureName ?? '',
    photo.nearestFeature?.featureType ?? '',
    photo.nearestFeature ? Math.round(photo.nearestFeature.distanceMeters * 10) / 10 : ''
  ]);

  return [CSV_FIELDS, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
}

export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildPhotoKml(project: Project, photos: FieldPhoto[]): string {
  const photoPlacemarks = photos
    .filter((photo) => isValidCoordinate(photo.latitude, photo.longitude))
    .map((photo) => {
      const description = [
        `File: ${escapeXml(photo.fileName)}`,
        `Saved: ${escapeXml(photo.savedAt)}`,
        photo.note ? `Note: ${escapeXml(photo.note)}` : '',
        photo.nearestFeature ? `Nearest feature: ${escapeXml(photo.nearestFeature.featureName)}` : ''
      ]
        .filter(Boolean)
        .join('<br/>');

      return `<Placemark>
  <name>${escapeXml(photo.fileName)}</name>
  <description><![CDATA[${description}]]></description>
  <Point><coordinates>${photo.longitude},${photo.latitude},0</coordinates></Point>
</Placemark>`;
    });

  const arrowPlacemarks = photos
    .filter((photo) => isValidCoordinate(photo.latitude, photo.longitude) && typeof photo.headingUsed === 'number')
    .map((photo) => {
      const end = destinationPoint(
        { latitude: photo.latitude as number, longitude: photo.longitude as number },
        photo.headingUsed as number,
        25
      );

      return `<Placemark>
  <name>${escapeXml(photo.fileName)} heading</name>
  <Style><LineStyle><color>ff2a5de8</color><width>3</width></LineStyle></Style>
  <LineString><coordinates>${photo.longitude},${photo.latitude},0 ${end.longitude},${end.latitude},0</coordinates></LineString>
</Placemark>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(project.name)} Photos</name>
    ${photoPlacemarks.join('\n')}
    ${arrowPlacemarks.join('\n')}
  </Document>
</kml>`;
}

export function buildMetadataJson(project: Project, photos: FieldPhoto[], features: GeoFeature[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      project,
      photos: photos.map(({ imageBlob: _imageBlob, thumbnailBlob: _thumbnailBlob, ...photo }) => photo),
      features
    },
    null,
    2
  );
}

export async function downloadCsv(project: Project, photos: FieldPhoto[]): Promise<void> {
  const fileName = `FieldPhotoMapper_${sanitizeFileName(project.name)}_Photos_${compactDateStamp()}.csv`;
  downloadTextFile(fileName, buildPhotoCsv(project, photos), 'text/csv;charset=utf-8');
}

export async function downloadZipPackage(
  project: Project,
  photos: FieldPhoto[],
  features: GeoFeature[]
): Promise<void> {
  const safeProjectName = sanitizeFileName(project.name);
  const dateStamp = compactDateStamp();
  const csv = buildPhotoCsv(project, photos);
  const kml = buildPhotoKml(project, photos);
  const metadata = buildMetadataJson(project, photos, features);
  const packageZip = new JSZip();
  const kmz = new JSZip();

  packageZip.file('metadata/photos.csv', csv);
  packageZip.file('metadata/metadata.json', metadata);
  packageZip.file('gis/photo-points-and-headings.kml', kml);
  kmz.file('doc.kml', kml);

  for (const photo of photos) {
    if (photo.imageBlob) {
      packageZip.file(`photos/${sanitizeFileName(photo.id)}_${sanitizeFileName(photo.fileName)}`, photo.imageBlob);
    }
  }

  const kmzBlob = await kmz.generateAsync({ type: 'blob', mimeType: 'application/vnd.google-earth.kmz' });
  packageZip.file('gis/photo-points-and-headings.kmz', kmzBlob);

  const zipBlob = await packageZip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  downloadBlob(`FieldPhotoMapper_${safeProjectName}_Export_${dateStamp}.zip`, zipBlob);
}

export function downloadTextFile(fileName: string, text: string, mimeType = 'text/plain;charset=utf-8'): void {
  downloadBlob(fileName, new Blob([text], { type: mimeType }));
}

export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

