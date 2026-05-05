import L from 'leaflet';
import { Circle, Marker, Popup } from 'react-leaflet';
import type { LocationReading } from '../services/locationService';
import { formatDateTime } from '../utils/dateUtils';
import { formatCoordinate } from '../utils/geoUtils';

interface CurrentLocationMarkerProps {
  location: LocationReading | null;
}

const currentLocationIcon = L.divIcon({
  className: 'current-location-icon',
  html: '<span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export function CurrentLocationMarker({ location }: CurrentLocationMarkerProps) {
  if (!location) {
    return null;
  }

  const position: [number, number] = [location.latitude, location.longitude];

  return (
    <>
      <Marker position={position} icon={currentLocationIcon}>
        <Popup>
          <strong>Current GPS position</strong>
          <br />
          {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
          <br />
          Accuracy: {location.accuracyMeters ? `${Math.round(location.accuracyMeters)} m` : 'Not reported'}
          <br />
          Updated: {formatDateTime(location.capturedAt)}
        </Popup>
      </Marker>
      {location.accuracyMeters ? (
        <Circle
          center={position}
          radius={location.accuracyMeters}
          pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.14, weight: 1 }}
        />
      ) : null}
    </>
  );
}

