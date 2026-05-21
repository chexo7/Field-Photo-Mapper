import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Marker, Polygon, Popup } from 'react-leaflet';
import type { FieldPhoto } from '../models/FieldPhoto';
import { formatDateTime } from '../utils/dateUtils';
import { buildVisionConeLatLngs, formatCoordinate, isValidCoordinate } from '../utils/geoUtils';

interface PhotoMarkerLayerProps {
  photos: FieldPhoto[];
  selectedPhotoId?: string;
  selectedHeadingPreview?: number;
  orientationEditMode?: boolean;
  onPhotoSelect?: (photo: FieldPhoto) => void;
}

const photoIcon = L.divIcon({
  className: 'photo-marker-icon',
  html: '<span></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -28]
});

export function PhotoMarkerLayer({
  photos,
  selectedPhotoId,
  selectedHeadingPreview,
  orientationEditMode = false,
  onPhotoSelect
}: PhotoMarkerLayerProps) {
  const locatedPhotos = photos.filter((photo) => isValidCoordinate(photo.latitude, photo.longitude));

  return (
    <>
      {locatedPhotos.map((photo) => {
        const position: [number, number] = [photo.latitude as number, photo.longitude as number];
        return (
          <Marker
            key={photo.id}
            position={position}
            icon={photoIcon}
            eventHandlers={{
              click: () => {
                if (orientationEditMode) {
                  onPhotoSelect?.(photo);
                }
              }
            }}
          >
            <Popup>
              <div className="map-photo-popup">
                <strong>{photo.fileName}</strong>
                <span>
                  {formatCoordinate(photo.latitude)}, {formatCoordinate(photo.longitude)}
                </span>
                <span>Saved {formatDateTime(photo.savedAt)}</span>
                {typeof photo.headingUsed === 'number' ? <span>Heading {Math.round(photo.headingUsed)} deg</span> : null}
                <Link to={`/photos/${photo.id}`}>Open details</Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {locatedPhotos.map((photo) => {
        const isSelected = photo.id === selectedPhotoId;
        const heading =
          isSelected && orientationEditMode && typeof selectedHeadingPreview === 'number'
            ? selectedHeadingPreview
            : photo.headingUsed;

        if (typeof heading !== 'number') {
          return null;
        }

        const cone = buildVisionConeLatLngs(
          { latitude: photo.latitude as number, longitude: photo.longitude as number },
          heading
        );

        return (
          <Polygon
            key={`${photo.id}-vision-cone`}
            positions={cone}
            pathOptions={{
              color: isSelected ? '#0f5132' : '#e85d2a',
              fillColor: isSelected ? '#0f5132' : '#e85d2a',
              fillOpacity: isSelected ? 0.28 : 0.2,
              opacity: 0.9,
              weight: isSelected ? 3 : 2
            }}
          />
        );
      })}
    </>
  );
}
