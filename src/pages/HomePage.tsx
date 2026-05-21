import { Camera, Download, FolderKanban, Map, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import { downloadCsv, downloadHtmlDeliverable, downloadZipPackage } from '../services/exportService';
import { getProjectFeatures, getProjectPhotos } from '../services/storageService';
import { formatDateTime } from '../utils/dateUtils';

export function HomePage() {
  const { activeProject, activeProjectStats } = useActiveProject();
  const [photos, setPhotos] = useState<FieldPhoto[]>([]);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    void Promise.all([getProjectPhotos(activeProject.id), getProjectFeatures(activeProject.id)]).then(
      ([nextPhotos, nextFeatures]) => {
        setPhotos(nextPhotos);
        setFeatures(nextFeatures);
      }
    );
  }, [activeProject]);

  async function exportCsv() {
    if (!activeProject) {
      return;
    }
    await downloadCsv(activeProject, photos);
    setMessage('CSV export prepared.');
  }

  async function exportZip() {
    if (!activeProject) {
      return;
    }
    await downloadZipPackage(activeProject, photos, features);
    setMessage('ZIP package export prepared.');
  }

  async function exportHtmlDeliverable() {
    if (!activeProject) {
      return;
    }
    await downloadHtmlDeliverable(activeProject, photos, features);
    setMessage('HTML deliverable prepared. Extract the ZIP and double-click field-photo-map.html.');
  }

  return (
    <div className="page-stack">
      <section className="hero-workspace">
        <div className="hero-copy">
          <h2>Field Photo Mapper</h2>
          <p>
            Collect geotagged photos, bring in KML/KMZ field features, correct heading, and export
            review packages from one browser workspace.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/map">
              <Map size={18} />
              Open map
            </Link>
            <Link className="button secondary" to="/capture">
              <Camera size={18} />
              Capture photo
            </Link>
          </div>
        </div>
        <div className="hero-map-visual" aria-hidden="true">
          <div className="map-river" />
          <div className="map-road road-one" />
          <div className="map-road road-two" />
          <div className="map-road road-three" />
          <div className="map-feature polygon" />
          <div className="map-pin pin-one" />
          <div className="map-pin pin-two" />
          <div className="map-pin pin-three" />
        </div>
      </section>

      <section className="stats-band" aria-label="Project status">
        <div>
          <span>Photos</span>
          <strong>{activeProjectStats?.photoCount ?? 0}</strong>
        </div>
        <div>
          <span>Located</span>
          <strong>{activeProjectStats?.locatedPhotoCount ?? 0}</strong>
        </div>
        <div>
          <span>Imports</span>
          <strong>{activeProjectStats?.importedFileCount ?? 0}</strong>
        </div>
        <div>
          <span>Features</span>
          <strong>{activeProjectStats?.featureCount ?? 0}</strong>
        </div>
      </section>

      <section className="workflow-grid">
        <Link className="workflow-row" to="/projects">
          <FolderKanban size={20} />
          <div>
            <strong>Project workflow</strong>
            <span>{activeProject?.name ?? 'Loading active project'}</span>
          </div>
        </Link>
        <Link className="workflow-row" to="/import">
          <UploadCloud size={20} />
          <div>
            <strong>KML/KMZ overlays</strong>
            <span>Import points, lines, and polygons for the active project.</span>
          </div>
        </Link>
        <button className="workflow-row" type="button" onClick={() => void exportCsv()}>
          <Download size={20} />
          <div>
            <strong>CSV export</strong>
            <span>Download photo metadata for Excel or office review.</span>
          </div>
        </button>
        <button className="workflow-row" type="button" onClick={() => void exportZip()}>
          <Download size={20} />
          <div>
            <strong>ZIP/KMZ package</strong>
            <span>Bundle CSV, JSON, KML/KMZ, and locally saved photos.</span>
          </div>
        </button>
        <button className="workflow-row" type="button" onClick={() => void exportHtmlDeliverable()}>
          <Download size={20} />
          <div>
            <strong>HTML deliverable</strong>
            <span>Export a double-click map with images and editable vision cones.</span>
          </div>
        </button>
      </section>

      {message ? <p className="status-message">{message}</p> : null}

      <section className="work-panel">
        <div className="section-title-row">
          <Camera size={20} />
          <h2>Recent field photos</h2>
        </div>
        {photos.length === 0 ? (
          <div className="empty-state compact">
            <p>No photos saved yet.</p>
            <Link className="inline-link" to="/capture">
              Capture the first record
            </Link>
          </div>
        ) : (
          <div className="data-list">
            {photos.slice(0, 6).map((photo) => (
              <Link key={photo.id} className="data-row" to={`/photos/${photo.id}`}>
                <div>
                  <strong>{photo.fileName}</strong>
                  <span>{photo.note || 'No note'}</span>
                </div>
                <time>{formatDateTime(photo.savedAt)}</time>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
