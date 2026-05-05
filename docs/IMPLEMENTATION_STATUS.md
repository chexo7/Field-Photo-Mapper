# Field Photo Mapper Implementation Status

Last updated: 2026-05-04

## Completed in this pass

- React + TypeScript + Vite app shell with PWA build configuration.
- Responsive desktop/tablet/mobile layout with compact navigation and map-first workflow.
- Project workflow with active project persistence, create/open/delete, and project summaries.
- Leaflet + OpenStreetMap default basemap.
- Settings storage in `localStorage`, including Google API key, default basemap, heading capture toggle, and local photo storage toggle.
- Basemap switcher with OpenStreetMap active and Google Satellite gated by API key.
- GPS locate and live tracking controls with permission/error handling.
- Photo workflow with both immediate camera capture and later image selection from device storage.
- Manual latitude/longitude entry for photos uploaded later or saved without GPS permission.
- Device heading capture where supported, plus manual heading correction stored separately.
- IndexedDB/Dexie storage for projects, photos, imported files, and GeoJSON features.
- Photo detail page with metadata, heading edit, note edit, original image download, and delete.
- Photo markers and heading arrows on the map.
- KML/KMZ import using JSZip and `@tmcw/togeojson`.
- Imported point, line, and polygon rendering with popups.
- Approximate nearest-feature association for new located photos.
- CSV export for photo metadata.
- ZIP export containing CSV, metadata JSON, KML, KMZ, and locally saved image blobs.
- PWA manifest/service-worker generation and offline app shell precache.
- Sample KML file for quick import testing.

## Known limitations to finish later

- Google Satellite is not rendered yet. The app stores the API key and enables the UI option, but production use should integrate Google Maps JavaScript API through an official supported approach rather than unofficial tile URLs.
- Offline basemaps are not implemented. The PWA caches the app shell and may cache recently loaded OSM tiles, but deliberate offline map package selection is a future phase.
- Mobile-only APIs still need real-device validation on Android Chrome/Edge and iOS Safari: camera capture, geolocation accuracy, heading/orientation permission behavior, PWA install flow, and IndexedDB quota.
- EXIF metadata extraction is not implemented yet. The app preserves browser file metadata, GPS/manual metadata, and field notes, but does not parse embedded camera EXIF GPS/heading.
- Image compression and thumbnail generation are future work. Original images can be stored in IndexedDB when enabled, but large photo sets may hit browser storage quota.
- Nearest-feature distance is intentionally approximate for MVP field workflows. More precise geodesic/polyline/polygon distance can be added later if survey-grade association is required.
- KML/KMZ support focuses on standard point, polyline, and polygon features. Ground overlays, style fidelity, network links, very large KMZs, and complex nested documents need additional hardening.
- Export validation in Google Earth/GIS tools still needs manual review with real project data.
- Deployment target is not configured. The app can build locally; GitHub Pages, Azure Static Web Apps, or Vercel deployment can be added next.

## Suggested next validation pass

1. Run `npm.cmd run dev -- --host 0.0.0.0` and open the app from an Android device on the same network.
2. Create a project, import `public/sample-data/sample-project.kml`, locate GPS, capture a new photo, and upload an existing image.
3. Confirm the uploaded-later image can be saved with manual coordinates and manual heading.
4. Confirm markers, heading arrows, and imported features survive a browser refresh.
5. Export CSV and ZIP, then inspect the CSV in Excel and the KMZ in Google Earth or a GIS viewer.

