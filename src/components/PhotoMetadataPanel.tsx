import { Link } from 'react-router-dom';
import type { FieldPhoto } from '../models/FieldPhoto';
import { formatDateTime } from '../utils/dateUtils';
import { formatBytes } from '../utils/fileUtils';
import { formatCoordinate } from '../utils/geoUtils';

interface PhotoMetadataPanelProps {
  photo: FieldPhoto;
}

export function PhotoMetadataPanel({ photo }: PhotoMetadataPanelProps) {
  return (
    <dl className="metadata-grid">
      <div>
        <dt>File</dt>
        <dd>{photo.fileName}</dd>
      </div>
      <div>
        <dt>Size</dt>
        <dd>{formatBytes(photo.sizeBytes)}</dd>
      </div>
      <div>
        <dt>Latitude</dt>
        <dd>{formatCoordinate(photo.latitude)}</dd>
      </div>
      <div>
        <dt>Longitude</dt>
        <dd>{formatCoordinate(photo.longitude)}</dd>
      </div>
      <div>
        <dt>Accuracy</dt>
        <dd>{photo.accuracyMeters ? `${Math.round(photo.accuracyMeters)} m` : 'Not recorded'}</dd>
      </div>
      <div>
        <dt>Heading used</dt>
        <dd>{typeof photo.headingUsed === 'number' ? `${Math.round(photo.headingUsed)} deg` : 'Not recorded'}</dd>
      </div>
      <div>
        <dt>Saved</dt>
        <dd>{formatDateTime(photo.savedAt)}</dd>
      </div>
      <div>
        <dt>Taken</dt>
        <dd>{formatDateTime(photo.takenAt)}</dd>
      </div>
      <div>
        <dt>Nearest feature</dt>
        <dd>
          {photo.nearestFeature ? (
            <>
              {photo.nearestFeature.featureName}
              <span>{Math.round(photo.nearestFeature.distanceMeters)} m</span>
            </>
          ) : (
            'None associated'
          )}
        </dd>
      </div>
      <div>
        <dt>Map</dt>
        <dd>
          {photo.locationMissing ? (
            'Missing location'
          ) : (
            <Link to="/map" className="inline-link">
              Open marker
            </Link>
          )}
        </dd>
      </div>
    </dl>
  );
}
