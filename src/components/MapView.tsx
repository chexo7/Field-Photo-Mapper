import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { BasemapId } from '../models/AppSettings';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import type { Project } from '../models/Project';
import { getSettings } from '../services/settingsService';
import { resolveBasemap } from '../services/basemapService';
import type { LocationReading } from '../services/locationService';
import { CurrentLocationMarker } from './CurrentLocationMarker';
import { FeatureLayer } from './FeatureLayer';
import { PhotoMarkerLayer } from './PhotoMarkerLayer';

interface MapViewProps {
  project: Project;
  selectedBasemap: BasemapId;
  currentLocation: LocationReading | null;
  photos: FieldPhoto[];
  features: GeoFeature[];
  selectedPhotoId?: string;
  selectedHeadingPreview?: number;
  orientationEditMode?: boolean;
  onPhotoSelect?: (photo: FieldPhoto) => void;
}

export function MapView({
  project,
  selectedBasemap,
  currentLocation,
  photos,
  features,
  selectedPhotoId,
  selectedHeadingPreview,
  orientationEditMode,
  onPhotoSelect
}: MapViewProps) {
  const settings = getSettings();
  const basemap = resolveBasemap(settings, selectedBasemap);
  const center: [number, number] = [project.defaultLatitude, project.defaultLongitude];

  return (
    <MapContainer center={center} zoom={15} className="map-container" scrollWheelZoom>
      <TileLayer attribution={basemap.attribution} url={basemap.tileUrl ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
      <FeatureLayer features={features} />
      <PhotoMarkerLayer
        photos={photos}
        selectedPhotoId={selectedPhotoId}
        selectedHeadingPreview={selectedHeadingPreview}
        orientationEditMode={orientationEditMode}
        onPhotoSelect={onPhotoSelect}
      />
      <CurrentLocationMarker location={currentLocation} />
      <MapFocus project={project} currentLocation={currentLocation} photos={photos} features={features} />
    </MapContainer>
  );
}

function MapFocus({
  project,
  currentLocation,
  photos,
  features
}: Pick<MapViewProps, 'project' | 'currentLocation' | 'photos' | 'features'>) {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.flyTo([currentLocation.latitude, currentLocation.longitude], Math.max(map.getZoom(), 16), {
        duration: 0.8
      });
    }
  }, [currentLocation, map]);

  useEffect(() => {
    const locatedPhotos = photos.filter(
      (photo) => typeof photo.latitude === 'number' && typeof photo.longitude === 'number'
    );
    if (locatedPhotos.length > 0 || features.length > 0) {
      return;
    }

    map.setView([project.defaultLatitude, project.defaultLongitude], 15);
  }, [features.length, map, photos, project.defaultLatitude, project.defaultLongitude]);

  return null;
}
