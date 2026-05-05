import { ArrowLeft, Download, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';
import { HeadingEditor } from '../components/HeadingEditor';
import { PhotoMetadataPanel } from '../components/PhotoMetadataPanel';
import type { FieldPhoto } from '../models/FieldPhoto';
import { downloadBlob } from '../services/exportService';
import { deletePhoto, getPhoto, updatePhoto } from '../services/storageService';
import { getPhotoObjectUrl, resolveHeading } from '../services/photoService';

export function PhotoDetailPage() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const { refreshProjects } = useActiveProject();
  const [photo, setPhoto] = useState<FieldPhoto | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [manualHeading, setManualHeading] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let objectUrl: string | null = null;

    if (!photoId) {
      return;
    }

    void getPhoto(photoId).then((loadedPhoto) => {
      setPhoto(loadedPhoto ?? null);
      setNote(loadedPhoto?.note ?? '');
      setManualHeading(
        typeof loadedPhoto?.headingDegreesManual === 'number' ? String(loadedPhoto.headingDegreesManual) : ''
      );
      objectUrl = loadedPhoto ? getPhotoObjectUrl(loadedPhoto) : null;
      setPhotoUrl(objectUrl);
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photoId]);

  const parsedManualHeading = useMemo(() => {
    if (!manualHeading.trim()) {
      return undefined;
    }
    const value = Number(manualHeading);
    return Number.isFinite(value) ? ((value % 360) + 360) % 360 : undefined;
  }, [manualHeading]);

  async function saveChanges() {
    if (!photo) {
      return;
    }

    await updatePhoto(photo.id, {
      note,
      headingDegreesManual: parsedManualHeading,
      headingUsed: resolveHeading(photo.headingDegreesAuto, parsedManualHeading)
    });
    const updatedPhoto = await getPhoto(photo.id);
    setPhoto(updatedPhoto ?? photo);
    await refreshProjects();
    setMessage('Photo metadata updated.');
  }

  async function removePhoto() {
    if (!photo) {
      return;
    }

    const confirmed = window.confirm('Delete this photo record from the local project?');
    if (!confirmed) {
      return;
    }
    await deletePhoto(photo.id);
    await refreshProjects();
    navigate('/map');
  }

  function downloadOriginal() {
    if (!photo?.imageBlob) {
      setMessage('This record does not include a locally saved image blob.');
      return;
    }
    downloadBlob(photo.fileName, photo.imageBlob);
  }

  if (!photo) {
    return (
      <div className="empty-state">
        <p>Photo record not found.</p>
        <Link className="inline-link" to="/map">
          Return to map
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-grid">
      <section className="work-panel photo-detail-visual">
        <div className="detail-toolbar">
          <Link className="button ghost compact-button" to="/map">
            <ArrowLeft size={17} />
            Map
          </Link>
          <button className="button secondary compact-button" type="button" onClick={downloadOriginal}>
            <Download size={17} />
            Original
          </button>
        </div>
        <div className="detail-image-frame">
          {photoUrl ? (
            <img src={photoUrl} alt={photo.fileName} />
          ) : (
            <div className="empty-state compact">
              <p>Image blob was not saved locally for this record.</p>
            </div>
          )}
        </div>
      </section>

      <section className="work-panel detail-editor">
        <div className="section-title-row">
          <Save size={20} />
          <h2>Photo metadata</h2>
        </div>
        <PhotoMetadataPanel photo={photo} />

        <HeadingEditor
          autoHeading={photo.headingDegreesAuto}
          manualHeading={manualHeading}
          onManualHeadingChange={setManualHeading}
        />

        <label className="field-control">
          <span>Note</span>
          <textarea rows={6} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>

        {message ? <p className="status-message">{message}</p> : null}

        <div className="split-actions">
          <button className="button primary" type="button" onClick={() => void saveChanges()}>
            <Save size={18} />
            Save changes
          </button>
          <button className="button danger-button" type="button" onClick={() => void removePhoto()}>
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
