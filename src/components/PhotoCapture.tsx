import { Camera, FileImage, LocateFixed, Save, Satellite, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';
import type { PhotoSource } from '../models/FieldPhoto';
import { getProjectFeatures, savePhoto } from '../services/storageService';
import { getSettings } from '../services/settingsService';
import { findNearestFeature, isValidCoordinate } from '../utils/geoUtils';
import {
  getCurrentPosition,
  type LocationFailure,
  type LocationReading
} from '../services/locationService';
import {
  requestHeadingPermission,
  startHeadingWatch,
  type HeadingReading
} from '../services/headingService';
import {
  buildPhotoRecord,
  prepareImage,
  revokeImagePreview,
  type PreparedImage
} from '../services/photoService';
import { HeadingEditor } from './HeadingEditor';

export function PhotoCapture() {
  const { activeProject, refreshProjects } = useActiveProject();
  const navigate = useNavigate();
  const settings = getSettings();
  const [preparedImage, setPreparedImage] = useState<PreparedImage | null>(null);
  const [source, setSource] = useState<PhotoSource>('file');
  const [note, setNote] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [manualHeading, setManualHeading] = useState('');
  const [autoHeading, setAutoHeading] = useState<HeadingReading | null>(null);
  const [location, setLocation] = useState<LocationReading | null>(null);
  const [message, setMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const stopHeadingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      revokeImagePreview(preparedImage?.previewUrl ?? null);
      stopHeadingRef.current?.();
    };
  }, [preparedImage?.previewUrl]);

  const parsedManualHeading = useMemo(() => {
    if (!manualHeading.trim()) {
      return undefined;
    }
    const value = Number(manualHeading);
    return Number.isFinite(value) ? ((value % 360) + 360) % 360 : undefined;
  }, [manualHeading]);

  async function handleFile(file: File | undefined, nextSource: PhotoSource) {
    if (!file) {
      return;
    }

    try {
      revokeImagePreview(preparedImage?.previewUrl ?? null);
      const nextImage = await prepareImage(file);
      setPreparedImage(nextImage);
      setSource(nextSource);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to prepare image.');
    }
  }

  async function locate() {
    setIsLocating(true);
    setMessage('');
    try {
      const nextLocation = await getCurrentPosition();
      setLocation(nextLocation);
      setLatitude(nextLocation.latitude.toFixed(7));
      setLongitude(nextLocation.longitude.toFixed(7));
      setMessage('GPS position captured.');
    } catch (error) {
      const failure = error as LocationFailure;
      setMessage(failure.message ?? 'Unable to read GPS position.');
    } finally {
      setIsLocating(false);
    }
  }

  async function enableHeading() {
    setMessage('');
    const permission = await requestHeadingPermission();
    if (permission !== 'granted') {
      setMessage(
        permission === 'unsupported'
          ? 'This browser does not expose device orientation heading.'
          : 'Heading permission was denied.'
      );
      return;
    }

    stopHeadingRef.current?.();
    stopHeadingRef.current = startHeadingWatch(setAutoHeading);
    setMessage('Heading capture is listening. Rotate the device to update auto heading.');
  }

  async function save() {
    if (!activeProject || !preparedImage) {
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const lat = latitude.trim() ? Number(latitude) : undefined;
      const lon = longitude.trim() ? Number(longitude) : undefined;
      const locationMetadata =
        isValidCoordinate(lat, lon)
          ? {
              latitude: lat,
              longitude: lon,
              accuracyMeters: location?.accuracyMeters,
              altitudeMeters: location?.altitudeMeters,
              altitudeAccuracyMeters: location?.altitudeAccuracyMeters,
              capturedAt: location?.capturedAt
            }
          : undefined;

      const photo = buildPhotoRecord({
        projectId: activeProject.id,
        file: preparedImage.file,
        note,
        source,
        location: locationMetadata,
        headingDegreesAuto: autoHeading?.headingDegrees,
        headingDegreesManual: parsedManualHeading,
        headingCapturedAt: autoHeading?.capturedAt,
        width: preparedImage.width,
        height: preparedImage.height,
        saveImageBlob: settings.savePhotosLocally
      });

      if (!photo.locationMissing && typeof photo.latitude === 'number' && typeof photo.longitude === 'number') {
        const features = await getProjectFeatures(activeProject.id);
        photo.nearestFeature = findNearestFeature(
          { latitude: photo.latitude, longitude: photo.longitude },
          features
        );
      }

      await savePhoto(photo);
      await refreshProjects();
      navigate(`/photos/${photo.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save photo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="capture-grid">
      <section className="work-panel capture-panel">
        <div className="section-title-row">
          <Camera size={20} />
          <h2>Photo capture</h2>
        </div>
        <div className="capture-actions">
          <label className="button primary">
            <Camera size={18} />
            Take photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => void handleFile(event.target.files?.[0], 'camera')}
            />
          </label>
          <label className="button secondary">
            <FileImage size={18} />
            Select image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => void handleFile(event.target.files?.[0], 'file')}
            />
          </label>
          {preparedImage ? (
            <button
              className="button ghost"
              type="button"
              onClick={() => {
                revokeImagePreview(preparedImage.previewUrl);
                setPreparedImage(null);
              }}
            >
              <X size={18} />
              Clear
            </button>
          ) : null}
        </div>

        <div className="preview-frame">
          {preparedImage ? (
            <img src={preparedImage.previewUrl} alt="Selected field capture preview" />
          ) : (
            <div className="empty-state">
              <Camera size={34} />
              <p>Select or take a photo to start a field record.</p>
            </div>
          )}
        </div>
      </section>

      <section className="work-panel capture-form">
        <div className="section-title-row">
          <Satellite size={20} />
          <h2>Metadata</h2>
        </div>

        <div className="form-grid two-column">
          <label className="field-control">
            <span>Latitude</span>
            <input
              value={latitude}
              inputMode="decimal"
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="29.760400"
            />
          </label>
          <label className="field-control">
            <span>Longitude</span>
            <input
              value={longitude}
              inputMode="decimal"
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="-95.369800"
            />
          </label>
        </div>

        <button className="button secondary full-width" type="button" onClick={() => void locate()} disabled={isLocating}>
          <LocateFixed size={18} />
          {isLocating ? 'Reading GPS...' : 'Use current GPS'}
        </button>

        {settings.enableHeadingCapture ? (
          <button className="button secondary full-width" type="button" onClick={() => void enableHeading()}>
            <Satellite size={18} />
            Capture device heading
          </button>
        ) : null}

        <HeadingEditor
          autoHeading={autoHeading?.headingDegrees}
          manualHeading={manualHeading}
          onManualHeadingChange={setManualHeading}
        />

        <label className="field-control">
          <span>Note</span>
          <textarea
            value={note}
            rows={5}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Observed condition, station, access notes, or photo context."
          />
        </label>

        {message ? <p className="status-message">{message}</p> : null}

        <button
          className="button primary full-width"
          type="button"
          disabled={!preparedImage || isSaving}
          onClick={() => void save()}
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save field photo'}
        </button>
      </section>
    </div>
  );
}

