import { Crosshair, LocateFixed, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';
import { BasemapSwitcher } from '../components/BasemapSwitcher';
import { MapView } from '../components/MapView';
import type { BasemapId } from '../models/AppSettings';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import { countFeatures } from '../services/featureLayerService';
import {
  clearWatch,
  getCurrentPosition,
  watchPosition,
  type LocationFailure,
  type LocationReading
} from '../services/locationService';
import { getSettings } from '../services/settingsService';
import { getProjectFeatures, getProjectPhotos } from '../services/storageService';

export function MapPage() {
  const { activeProject, refreshProjects } = useActiveProject();
  const [photos, setPhotos] = useState<FieldPhoto[]>([]);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [location, setLocation] = useState<LocationReading | null>(null);
  const [message, setMessage] = useState('');
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapId>(getSettings().defaultBasemap);
  const [isTracking, setIsTracking] = useState(false);
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

  if (!activeProject) {
    return <div className="empty-state">Loading map project...</div>;
  }

  const featureCounts = countFeatures(features);

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
        </div>

        <div className="map-list-block">
          <h3>Latest photos</h3>
          <div className="data-list compact-list">
            {photos.slice(0, 5).map((photo) => (
              <Link key={photo.id} className="data-row" to={`/photos/${photo.id}`}>
                <div>
                  <strong>{photo.fileName}</strong>
                  <span>{photo.locationMissing ? 'Missing location' : `${photo.latitude?.toFixed(5)}, ${photo.longitude?.toFixed(5)}`}</span>
                </div>
              </Link>
            ))}
            {photos.length === 0 ? <p className="subtle-text">No photo markers yet.</p> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

