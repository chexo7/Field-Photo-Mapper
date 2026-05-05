import { FileUp, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveProject } from '../app/ActiveProjectContext';
import type { KmzFileRecord } from '../models/KmzFileRecord';
import { parseKmlOrKmz } from '../services/kmzParserService';
import { deleteImport, getImportedFiles, saveImport } from '../services/storageService';
import { formatDateTime } from '../utils/dateUtils';

export function KmzImportPage() {
  const { activeProject, refreshProjects } = useActiveProject();
  const [imports, setImports] = useState<KmzFileRecord[]>([]);
  const [message, setMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!activeProject) {
      return;
    }
    void loadImports();
  }, [activeProject?.id]);

  async function loadImports() {
    if (!activeProject) {
      return;
    }
    setImports(await getImportedFiles(activeProject.id));
  }

  async function handleFile(file: File | undefined) {
    if (!activeProject || !file) {
      return;
    }

    setIsImporting(true);
    setMessage('');
    try {
      const result = await parseKmlOrKmz(file, activeProject.id);
      await saveImport(result.record, result.features);
      await loadImports();
      await refreshProjects();
      setMessage(`Imported ${result.record.featureCount} features from ${result.record.fileName}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to import KML/KMZ.');
    } finally {
      setIsImporting(false);
    }
  }

  async function removeImport(recordId: string) {
    await deleteImport(recordId);
    await loadImports();
    await refreshProjects();
  }

  return (
    <div className="page-stack">
      <section className="work-panel">
        <div className="section-title-row">
          <UploadCloud size={22} />
          <h2>KML/KMZ import</h2>
        </div>
        <p className="subtle-text">
          Imported features are stored as normalized GeoJSON in IndexedDB and rendered on the active project map.
        </p>

        <label className="import-dropzone">
          <FileUp size={28} />
          <strong>{isImporting ? 'Importing...' : 'Choose KML or KMZ'}</strong>
          <span>Points, polylines, and polygons are supported for the MVP.</span>
          <input
            type="file"
            accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz"
            disabled={isImporting}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
        </label>
        <a className="inline-link" href="/sample-data/sample-project.kml" download>
          Download sample KML
        </a>
        {message ? <p className="status-message">{message}</p> : null}
      </section>

      <section className="work-panel">
        <div className="section-title-row">
          <FileUp size={20} />
          <h2>Imported files</h2>
        </div>
        {imports.length === 0 ? (
          <div className="empty-state compact">
            <p>No imports for this project.</p>
          </div>
        ) : (
          <div className="data-list">
            {imports.map((record) => (
              <div className="data-row import-row" key={record.id}>
                <div>
                  <strong>{record.fileName}</strong>
                  <span>
                    {record.featureCount} features · {record.pointCount} points · {record.lineCount} lines ·{' '}
                    {record.polygonCount} polygons
                  </span>
                  <span>{formatDateTime(record.importedAt)}</span>
                  {record.warningMessages.map((warning) => (
                    <small key={warning}>{warning}</small>
                  ))}
                </div>
                <button className="icon-button danger" type="button" onClick={() => void removeImport(record.id)}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

