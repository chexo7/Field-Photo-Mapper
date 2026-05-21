import { Compass, Crosshair, Download, LocateFixed, PauseCircle, PlayCircle, RefreshCw, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';
import { BasemapSwitcher } from '../components/BasemapSwitcher';
import { MapView } from '../components/MapView';
import type { BasemapId } from '../models/AppSettings';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import { countFeatures } from '../services/featureLayerService';
import { downloadHtmlDeliverable } from '../services/exportService';
import {
  clearWatch,
  getCurrentPosition,
  watchPosition,
  type LocationFailure,
  type LocationReading
} from '../services/locationService';
import { getSettings } from '../services/settingsService';
import { getProjectFeatures, getProjectPhotos, updatePhoto } from '../services/storageService';

export function MapPage() {
  const { activeProject, refreshProjects } = useActiveProject();
  const [photos, setPhotos] = useState<FieldPhoto[]>([]);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [location, setLocation] = useState<LocationReading | null>(null);
  const [message, setMessage] = useState('');
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapId>(getSettings().defaultBasemap);
  const [isTracking, setIsTracking] = useState(false);
  const [orientationEditMode, setOrientationEditMode] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>();
  const [headingDraft, setHeadingDraft] = useState(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeProject) {
      return;
    }
    void loadData();
  }, [activeProject?.id]);

  useEffect(() => {
    return () => clearWatch(watchIdRef.current);
  }, []);

  async function loadData() {
    if (!activeProject) {
      return;
    }
    const [nextPhotos, nextFeatures] = await Promise.all([
      getProjectPhotos(activeProject.id),
      getProjectFeatures(activeProject.id)
    ]);
    setPhotos(nextPhotos);
    setFeatures(nextFeatures);
    await refreshProjects();
  }

  async function locate() {
    setMessage('');
    try {
      const nextLocation = await getCurrentPosition();
      setLocation(nextLocation);
      setMessage('GPS position updated.');
    } catch (error) {
      setMessage((error as LocationFailure).message ?? 'Unable to read location.');
    }
  }

  function startTracking() {
    setMessage('');
    clearWatch(watchIdRef.current);
    watchIdRef.current = watchPosition(
      (nextLocation) => {
        setLocation(nextLocation);
        setMessage('Live tracking active.');
      },
      (error) => {
        setMessage(error.message);
        setIsTracking(false);
      }
    );
    setIsTracking(true);
  }

  function stopTracking() {
    clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setIsTracking(false);
    setMessage('Live tracking stopped.');
  }

  function selectPhotoForOrientation(photo: FieldPhoto) {
    setSelectedPhotoId(photo.id);
    setHeadingDraft(Math.round(photo.headingUsed ?? photo.headingDegreesManual ?? photo.headingDegreesAuto ?? 0));
  }

  async function saveOrientation() {
    const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId);
    if (!selectedPhoto) {
      setMessage('Select a located photo before saving orientation.');
      return;
    }

    const normalizedHeading = ((headingDraft % 360) + 360) % 360;
    await updatePhoto(selectedPhoto.id, {
      headingDegreesManual: normalizedHeading,
      headingUsed: normalizedHeading
    });
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === selectedPhoto.id
          ? {
              ...photo,
              headingDegreesManual: normalizedHeading,
              headingUsed: normalizedHeading,
              updatedAt: new Date().toISOString()
            }
          : photo
      )
    );
    await refreshProjects();
    setMessage(`Orientation saved for ${selectedPhoto.fileName}.`);
  }

  async function exportHtmlDeliverable() {
    if (!activeProject) {
      return;
    }
    await downloadHtmlDeliverable(activeProject, photos, features);
    setMessage('HTML deliverable prepared. Extract the ZIP and double-click field-photo-map.html.');
  }

  if (!activeProject) {
    return <div className="empty-state">Loading map project...</div>;
  }

  const featureCounts = countFeatures(features);
  const locatedPhotos = photos.filter((photo) => !photo.locationMissing);
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId);
  const visiblePhotos = orientationEditMode ? photos : photos.slice(0, 5);

  return (
    <div className="map-page-grid">
      <section className="map-workspace">
        <div className="map-toolbar">
          <div className="toolbar-group">
            <button className="button secondary compact-button" type="button" onClick={() => void locate()}>
              <LocateFixed size={17} />
              Locate me
            </button>
            {isTracking ? (
              <button className="button secondary compact-button" type="button" onClick={stopTracking}>
                <PauseCircle size={17} />
                Stop
              </button>
            ) : (
              <button className="button secondary compact-button" type="button" onClick={startTracking}>
                <PlayCircle size={17} />
                Track
              </button>
            )}
            <button className="button ghost compact-button" type="button" onClick={() => void loadData()}>
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
          <BasemapSwitcher selectedBasemap={selectedBasemap} onBasemapChange={setSelectedBasemap} />
        </div>

        <MapView
          project={activeProject}
          selectedBasemap={selectedBasemap}
          currentLocation={location}
          photos={photos}
          features={features}
          selectedPhotoId={selectedPhotoId}
          selectedHeadingPreview={headingDraft}
          orientationEditMode={orientationEditMode}
          onPhotoSelect={selectPhotoForOrientation}
        />
      </section>

      <aside className="map-side-panel">
        <div className="section-title-row">
          <Crosshair size={20} />
          <h2>Field layers</h2>
        </div>
        {message ? <p className="status-message">{message}</p> : null}
        <div className="layer-summary">
          <div>
            <span>Photo markers</span>
            <strong>{photos.filter((photo) => !photo.locationMissing).length}</strong>
          </div>
          <div>
            <span>Points</span>
            <strong>{featureCounts.points}</strong>
          </div>
          <div>
            <span>Lines</span>
            <strong>{featureCounts.lines}</strong>
          </div>
          <div>
            <span>Polygons</span>
            <strong>{featureCounts.polygons}</strong>
          </div>
        </div>

        <div className="panel-actions">
          <Link className="button primary full-width" to="/capture">
            Capture photo
          </Link>
          <Link className="button secondary full-width" to="/import">
            Import KML/KMZ
          </Link>
          <button
            className={`button ${orientationEditMode ? 'primary' : 'secondary'} full-width`}
            type="button"
            onClick={() => {
              const nextMode = !orientationEditMode;
              setOrientationEditMode(nextMode);
              if (nextMode && !selectedPhotoId && locatedPhotos[0]) {
                selectPhotoForOrientation(locatedPhotos[0]);
              }
            }}
          >
            <Compass size={18} />
            {orientationEditMode ? 'Editing orientation' : 'Edit orientation'}
          </button>
          <button className="button secondary full-width" type="button" onClick={() => void exportHtmlDeliverable()}>
            <Download size={18} />
            Export HTML deliverable
          </button>
        </div>

        {orientationEditMode ? (
          <div className="orientation-editor">
            <div className="section-title-row">
              <Compass size={18} />
              <h3>Vision cone</h3>
            </div>
            {selectedPhoto ? (
              <>
                <p className="orientation-photo-name">{selectedPhoto.fileName}</p>
                <label className="field-control">
                  <span>Heading degrees</span>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={headingDraft}
                    onChange={(event) => setHeadingDraft(Number(event.target.value))}
                  />
                </label>
                <label className="field-control">
                  <span>Manual value</span>
                  <input
                    type="number"
                    min="0"
                    max="359"
                    step="1"
                    value={headingDraft}
                    onChange={(event) => setHeadingDraft(Number(event.target.value))}
                  />
                </label>
                <div className="orientation-compass" aria-label={`Heading ${headingDraft} degrees`}>
                  <span style={{ transform: `rotate(${headingDraft}deg)` }} />
                  <strong>{Math.round(((headingDraft % 360) + 360) % 360)} deg</strong>
                </div>
                <button className="button primary full-width" type="button" onClick={() => void saveOrientation()}>
                  <Save size={18} />
                  Save orientation
                </button>
              </>
            ) : (
              <p className="subtle-text">No located photo is selected.</p>
            )}
          </div>
        ) : null}

        <div className="map-list-block">
          <h3>{orientationEditMode ? 'All photos' : 'Latest photos'}</h3>
          <div className="data-list compact-list">
            {visiblePhotos.map((photo) => (
              orientationEditMode ? (
                <button
                  key={photo.id}
                  className={`data-row selectable-row ${photo.id === selectedPhotoId ? 'selected' : ''}`}
                  type="button"
                  disabled={photo.locationMissing}
                  onClick={() => selectPhotoForOrientation(photo)}
                >
                  <div>
                    <strong>{photo.fileName}</strong>
                    <span>
                      {photo.locationMissing
                        ? 'Missing location'
                        : `${photo.latitude?.toFixed(5)}, ${photo.longitude?.toFixed(5)} - ${
                            Math.round(photo.headingUsed ?? 0)
                          } deg`}
                    </span>
                  </div>
                </button>
              ) : (
                <Link key={photo.id} className="data-row" to={`/photos/${photo.id}`}>
                  <div>
                    <strong>{photo.fileName}</strong>
                    <span>
                      {photo.locationMissing
                        ? 'Missing location'
                        : `${photo.latitude?.toFixed(5)}, ${photo.longitude?.toFixed(5)}`}
                    </span>
                  </div>
                </Link>
              )
            ))}
            {photos.length === 0 ? <p className="subtle-text">No photo markers yet.</p> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
