import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Marker, Polyline, Popup } from 'react-leaflet';
import type { FieldPhoto } from '../models/FieldPhoto';
import { formatDateTime } from '../utils/dateUtils';
import { destinationPoint, formatCoordinate, isValidCoordinate } from '../utils/geoUtils';

interface PhotoMarkerLayerProps {
  photos: FieldPhoto[];
}

const photoIcon = L.divIcon({
  className: 'photo-marker-icon',
  html: '<span></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -28]
});

export function PhotoMarkerLayer({ photos }: PhotoMarkerLayerProps) {
  const locatedPhotos = photos.filter((photo) => isValidCoordinate(photo.latitude, photo.longitude));

  return (
    <>
      {locatedPhotos.map((photo) => {
          const position: [number, number] = [photo.latitude as number, photo.longitude as number];
          return (
            <Marker key={photo.id} position={position} icon={photoIcon}>
              <Popup>
                <div className="map-photo-popup">
                  <strong>{photo.fileName}</strong>
                  <span>
                    {formatCoordinate(photo.latitude)}, {formatCoordinate(photo.longitude)}
                  </span>
                  <span>Saved {formatDateTime(photo.savedAt)}</span>
                  {typeof photo.headingUsed === 'number' ? <span>Heading {Math.round(photo.headingUsed)}°</span> : null}
                  <Link to={`/photos/${photo.id}`}>Open details</Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      {locatedPhotos.map((photo) => {
        if (typeof photo.headingUsed !== 'number') {
          return null;
        }
        const position: [number, number] = [photo.latitude as number, photo.longitude as number];
        const headingEnd = destinationPoint(
          { latitude: position[0], longitude: position[1] },
          photo.headingUsed,
          30
        );

        return (
          <Polyline
            key={`${photo.id}-heading`}
            positions={[
              position,
              [headingEnd.latitude, headingEnd.longitude]
            ]}
            pathOptions={{ color: '#e85d2a', weight: 3, opacity: 0.9 }}
          />
        );
      })}
    </>
  );
}
