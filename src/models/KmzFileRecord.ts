export interface KmzFileRecord {
  id: string;
  projectId: string;
  fileName: string;
  fileType: 'kml' | 'kmz';
  importedAt: string;
  featureCount: number;
  pointCount: number;
  lineCount: number;
  polygonCount: number;
  warningMessages: string[];
}

