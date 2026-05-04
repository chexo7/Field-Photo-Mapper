# Field Photo Mapper Web

**Field Photo Mapper Web** is a browser-based field-mapping application designed as a **Progressive Web App (PWA)**. The app supports field photo collection, map-based navigation, KMZ/KML overlays, GPS position tracking, and photo metadata storage.

The updated development path is now focused on a **webapp first**, instead of a native Android app.

---

## 1. Project Purpose

The purpose of Field Photo Mapper Web is to support field inspections by allowing the user to:

- Open a map in a browser or installed PWA.
- Use **OpenStreetMap** as the default free basemap.
- Optionally use **Google Satellite** if a Google Maps API key is provided.
- Import KML/KMZ files.
- Display point, polyline, and polygon features from imported files.
- Read current GPS position.
- Take photos using the device camera where supported by the browser.
- Select existing images from the device.
- Store every photo with complete metadata.
- Save photo location using decimal latitude/longitude.
- Capture heading/orientation when browser/device support allows it.
- Allow manual heading correction after capture.
- Display field photos as map markers with optional direction arrows.
- Store data locally for field use.
- Build the application in independent modules so each feature can be developed and tested step by step.

---

## 2. Updated Technology Stack

### Frontend Framework

- **React**
- **TypeScript**
- **Vite**

React and TypeScript will provide a modular structure for pages, components, services, and models. Vite will provide a fast local development environment.

### Map Engine

- **Leaflet**

Leaflet will be used as the primary web map engine because it is lightweight, widely supported, and works well with OpenStreetMap, markers, polylines, polygons, and GeoJSON overlays.

### Default Basemap

- **OpenStreetMap**

OpenStreetMap will be the default basemap for the MVP because it can be used without requiring a Google API key.

### Optional Satellite Basemap

- **Google Satellite**
- Enabled only if a valid API key is provided by the user.

The app should keep OpenStreetMap as the default and make Google Satellite optional through the Settings page.

### KML/KMZ Processing

Recommended libraries:

- **JSZip** for reading KMZ files as ZIP archives.
- **@tmcw/togeojson** for converting KML to GeoJSON.

Alternative:

- **leaflet-kmz** if a direct Leaflet KMZ loader is preferred.

### Local Storage

- **IndexedDB**

IndexedDB will store projects, imported features, photo metadata, app settings, and references to stored image blobs.

Recommended wrapper:

- **Dexie.js**

Dexie.js simplifies IndexedDB access and makes local database code easier to maintain.

### Camera and Images

- Browser camera access using `getUserMedia()` where supported.
- File input using `input type="file"` for selecting existing images.
- Optional image capture through mobile browser file input using `capture="environment"`.

### GPS Location

- Browser Geolocation API.

### Heading / Orientation

- Browser DeviceOrientation APIs where available.
- Manual heading correction is required because browser-based heading support varies by browser and device.

### PWA Support

- Web App Manifest.
- Service Worker.
- Offline shell caching.
- Local data persistence using IndexedDB.

---

## 3. App Architecture

Recommended structure:

```text
FieldPhotoMapperWeb/
│
├── public/
│   ├── manifest.webmanifest
│   ├── icons/
│   └── sample-data/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── appConfig.ts
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── MapPage.tsx
│   │   ├── PhotoCapturePage.tsx
│   │   ├── PhotoDetailPage.tsx
│   │   ├── KmzImportPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ProjectPage.tsx
│   │
│   ├── components/
│   │   ├── MapView.tsx
│   │   ├── BasemapSwitcher.tsx
│   │   ├── CurrentLocationMarker.tsx
│   │   ├── PhotoMarkerLayer.tsx
│   │   ├── FeatureLayer.tsx
│   │   ├── PhotoCapture.tsx
│   │   ├── PhotoMetadataPanel.tsx
│   │   └── HeadingEditor.tsx
│   │
│   ├── models/
│   │   ├── Project.ts
│   │   ├── FieldPhoto.ts
│   │   ├── GeoFeature.ts
│   │   ├── KmzFileRecord.ts
│   │   └── AppSettings.ts
│   │
│   ├── services/
│   │   ├── mapService.ts
│   │   ├── basemapService.ts
│   │   ├── locationService.ts
│   │   ├── photoService.ts
│   │   ├── headingService.ts
│   │   ├── kmzParserService.ts
│   │   ├── featureLayerService.ts
│   │   ├── storageService.ts
│   │   ├── exportService.ts
│   │   └── settingsService.ts
│   │
│   ├── db/
│   │   ├── indexedDb.ts
│   │   └── schema.ts
│   │
│   ├── utils/
│   │   ├── geoUtils.ts
│   │   ├── fileUtils.ts
│   │   ├── dateUtils.ts
│   │   └── imageUtils.ts
│   │
│   ├── styles/
│   │   ├── app.css
│   │   └── map.css
│   │
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. Development Roadmap

The app should be developed in independent modules. Each module should be completed and tested before starting the next one.

---

# Module 0 — Web Project Setup

## Goal

Create the base React + TypeScript + Vite project and confirm that the webapp runs locally.

## Tasks

- Create the Vite React TypeScript project.
- Install initial dependencies.
- Set up folder structure.
- Create placeholder pages.
- Add basic routing.
- Confirm the app runs locally.

## Initial Pages

```text
HomePage
MapPage
PhotoCapturePage
PhotoDetailPage
KmzImportPage
SettingsPage
ProjectPage
```

## Deliverable

A running local webapp with basic navigation.

## Acceptance Criteria

- App runs with `npm run dev`.
- User can open the app in the browser.
- User can navigate between placeholder pages.
- Project folder structure is ready for modular development.

---

# Module 1 — Leaflet Map with OpenStreetMap

## Goal

Add a Leaflet map using OpenStreetMap as the default basemap.

## Tasks

- Install Leaflet and React Leaflet.
- Add Leaflet CSS.
- Create `MapView` component.
- Add OpenStreetMap tile layer.
- Center the map on a default location.
- Enable zoom and pan.

## Deliverable

A working map page with OpenStreetMap.

## Acceptance Criteria

- Map loads on `MapPage`.
- User can pan and zoom.
- OpenStreetMap is the default basemap.
- Map takes the full available screen height on mobile.

---

# Module 2 — App Settings

## Goal

Create a settings system to store user preferences locally.

## Initial Settings

```text
GoogleApiKey
DefaultBasemap
CoordinateDisplayFormat
EnableHeadingCapture
SavePhotosLocally
```

## Required Defaults

```text
DefaultBasemap = OpenStreetMap
CoordinateDisplayFormat = Decimal Lat/Lon
EnableHeadingCapture = true
SavePhotosLocally = true
GoogleApiKey = empty
```

## Tasks

- Create `AppSettings` model.
- Create `settingsService.ts`.
- Create `SettingsPage`.
- Add input for Google API key.
- Add default basemap selector.
- Add heading capture toggle.
- Store settings in IndexedDB or local storage.

## Deliverable

A functional settings page.

## Acceptance Criteria

- Settings persist after page refresh.
- Google API key can be added, edited, and removed.
- OpenStreetMap remains default unless user changes it.
- Google Satellite remains disabled if no API key exists.

---

# Module 3 — Basemap Switcher

## Goal

Allow the user to switch between OpenStreetMap and Google Satellite when a Google API key exists.

## Basemap Options

```text
OpenStreetMap
Google Satellite, if API key exists
```

## Tasks

- Create `BasemapSwitcher` component.
- Create `basemapService.ts`.
- Keep OpenStreetMap available by default.
- Detect whether Google API key exists.
- Disable Google Satellite when no API key is configured.
- Preserve overlays when switching basemaps.

## Deliverable

A working basemap selector.

## Acceptance Criteria

- OpenStreetMap works without API key.
- Google Satellite option is disabled when API key is empty.
- Google Satellite option is enabled when API key exists.
- Switching basemap does not remove photo markers or imported features.

---

# Module 4 — GPS Location Tracking

## Goal

Read and display the current GPS position on the map.

## Tasks

- Create `locationService.ts`.
- Request browser location permission.
- Get current position.
- Watch position if user enables live tracking.
- Display current position marker on map.
- Store latest position in app state.

## Location Metadata

```text
Latitude
Longitude
Altitude
Accuracy
AltitudeAccuracy
Heading
Speed
Timestamp
```

## Coordinate Format

Use decimal latitude/longitude.

Example:

```text
Latitude: 39.952583
Longitude: -75.165222
```

## Deliverable

Current GPS location shown on the map.

## Acceptance Criteria

- Browser requests location permission.
- Current location appears on the map.
- Accuracy is displayed when available.
- User can refresh current location.

---

# Module 5 — Photo Capture and Image Selection

## Goal

Allow the user to take a photo or select an existing image.

## Tasks

- Create `photoService.ts`.
- Create `PhotoCapture` component.
- Add button for camera capture.
- Add button for existing image selection.
- Support mobile browser capture where possible.
- Preview the selected image.
- Prepare image for local storage.

## Required Photo Actions

```text
Take Photo
Select Existing Image
Preview Photo
Delete Photo
Add Note
Save Photo
```

## Deliverable

User can capture or select an image from the browser.

## Acceptance Criteria

- User can open camera where browser/device supports it.
- User can select an existing image.
- Image preview works.
- User can cancel or save the photo.

---

# Module 6 — Local Database with IndexedDB

## Goal

Implement persistent browser storage for projects, photos, features, and settings.

## Recommended Library

```text
Dexie.js
```

## Initial Stores

```text
projects
fieldPhotos
kmzFiles
geoFeatures
appSettings
```

## Projects Store

```text
projectId
projectName
createdAt
updatedAt
defaultLatitude
defaultLongitude
notes
```

## Field Photos Store

```text
photoId
projectId
imageBlob
thumbnailBlob
fileName
originalFileName
mimeType
latitude
longitude
altitude
horizontalAccuracy
verticalAccuracy
headingDegreesAuto
headingDegreesManual
headingWasManuallyCorrected
photoTakenAt
photoSavedAt
note
nearestFeatureId
nearestFeatureName
imageWidth
imageHeight
browserName
deviceInfo
appVersion
```

## KMZ Files Store

```text
kmzFileId
projectId
fileName
fileBlob
importedAt
featureCount
```

## Geo Features Store

```text
featureId
kmzFileId
projectId
featureName
featureType
geometryGeoJson
propertiesJson
styleJson
description
folderPath
importedAt
```

## App Settings Store

```text
settingKey
settingValue
updatedAt
```

## Deliverable

A local persistent database.

## Acceptance Criteria

- Data persists after page refresh.
- Photos are linked to projects.
- Features are linked to imported KML/KMZ files.
- Settings persist locally.

---

# Module 7 — Photo Metadata

## Goal

Save complete metadata for every photo.

## Required Metadata

```text
PhotoId
ProjectId
ImageBlob
ThumbnailBlob
FileName
OriginalFileName
MimeType
Latitude
Longitude
Altitude
HorizontalAccuracy
VerticalAccuracy
HeadingDegreesAuto
HeadingDegreesManual
HeadingWasManuallyCorrected
PhotoTakenAt
PhotoSavedAt
Note
NearestFeatureId
NearestFeatureName
ImageWidth
ImageHeight
BrowserName
DeviceInfo
AppVersion
```

## Notes

- Store metadata in IndexedDB.
- Do not depend only on EXIF metadata.
- Save decimal latitude/longitude.
- Save automatic heading if available.
- Always allow manual heading correction.
- Preserve the original automatic heading even if manual correction is entered.

## Deliverable

Each saved photo has a full metadata record.

## Acceptance Criteria

- Photo location is saved.
- Timestamp is saved.
- Heading is saved when available.
- Manual heading can be entered or edited.
- Manual heading does not overwrite automatic heading.
- Note can be added or edited.

---

# Module 8 — Heading and Orientation

## Goal

Capture automatic heading when browser/device support allows it and allow manual correction.

## Tasks

- Create `headingService.ts`.
- Attempt to read device heading/orientation.
- Store automatic heading as `HeadingDegreesAuto`.
- Add manual correction field as `HeadingDegreesManual`.
- Add boolean flag `HeadingWasManuallyCorrected`.
- Display heading arrow on map when heading exists.

## Heading Logic

```text
If HeadingDegreesManual exists:
    Use manual heading for display.
Else if HeadingDegreesAuto exists:
    Use automatic heading for display.
Else:
    Show marker without direction arrow.
```

## Deliverable

Photo orientation can be saved and corrected.

## Acceptance Criteria

- Automatic heading is captured where possible.
- User can manually correct heading.
- Direction arrow uses manual heading when available.
- Original automatic heading remains stored.

---

# Module 9 — Photo Markers on Map

## Goal

Display saved photos on the map.

## Tasks

- Create `PhotoMarkerLayer` component.
- Load saved photos from IndexedDB.
- Display each photo as a marker.
- Display direction arrow when heading exists.
- Open `PhotoDetailPage` when marker is selected.
- Show photo preview and metadata.

## Deliverable

Saved photos are visible on the map.

## Acceptance Criteria

- Every saved photo appears as a map marker.
- Photo marker opens photo details.
- Direction arrow displays when heading exists.
- Manual heading correction updates map display.

---

# Module 10 — KML/KMZ Import

## Goal

Import KML/KMZ files and parse point, polyline, and polygon features.

## Supported Geometry Types in MVP

```text
Points
Polylines
Polygons
```

## Not Supported in MVP

```text
Ground overlays
Network links
3D models
Advanced KML styles
Time animations
Complex nested style maps
```

## Tasks

- Create `kmzParserService.ts`.
- Add file picker for `.kml` and `.kmz` files.
- If `.kmz`, unzip using JSZip.
- Extract main KML file.
- Convert KML to GeoJSON.
- Store features in IndexedDB.
- Link features to current project.

## Deliverable

Imported KML/KMZ features stored as GeoJSON.

## Acceptance Criteria

- User can import `.kml` file.
- User can import `.kmz` file.
- Points are parsed.
- Polylines are parsed.
- Polygons are parsed.
- Features persist after page refresh.

---

# Module 11 — Feature Layers on Map

## Goal

Draw imported KML/KMZ features on top of the selected basemap.

## Tasks

- Create `FeatureLayer` component.
- Load features from IndexedDB.
- Display GeoJSON features on Leaflet map.
- Style points, polylines, and polygons.
- Add click/tap popups.
- Preserve feature layers when switching basemaps.

## Layer Order

```text
1. Basemap
2. Imported polygons
3. Imported polylines
4. Imported points
5. Photo markers
6. Current GPS position
```

## Deliverable

Imported GIS features are visible and selectable on the map.

## Acceptance Criteria

- Points display as markers.
- Polylines display as line features.
- Polygons display as filled or outlined areas.
- Feature popup shows feature name and description.
- Features remain visible after switching basemaps.

---

# Module 12 — Nearest Feature Association

## Goal

Automatically associate each saved photo with the nearest imported feature.

## Tasks

- Create nearest feature utility in `geoUtils.ts`.
- Compare photo point against imported point, polyline, and polygon features.
- Store nearest feature ID and name in photo metadata.
- Display nearest feature on photo detail page.
- Allow manual override later.

## Deliverable

Photos are linked to nearby imported GIS features.

## Acceptance Criteria

- New photos are assigned nearest feature when imported features exist.
- Nearest feature name appears on photo details.
- App handles no-feature case without error.

---

# Module 13 — Project Workflow

## Goal

Support multiple field projects.

## Tasks

- Create project list page.
- Create new project workflow.
- Open existing project.
- Delete project.
- Store photos and imported features by project.
- Show project summary.

## Deliverable

User can manage multiple projects.

## Acceptance Criteria

- User can create a project.
- User can open a project.
- User can import KML/KMZ into a project.
- User can save photos under a project.
- Projects remain separated.

---

# Module 14 — Export CSV

## Goal

Export collected photo metadata to CSV for office review.

## CSV Fields

```text
PhotoId
ProjectName
FileName
Latitude
Longitude
HeadingDegreesAuto
HeadingDegreesManual
HeadingUsed
PhotoTakenAt
PhotoSavedAt
Note
NearestFeatureName
```

## Tasks

- Create `exportService.ts`.
- Build CSV from IndexedDB photo records.
- Download CSV from browser.

## Deliverable

CSV export file.

## Acceptance Criteria

- CSV downloads from browser.
- CSV opens in Excel.
- Decimal latitude/longitude values are included.
- Heading fields are included.

---

# Module 15 — Export KMZ / ZIP Package

## Goal

Export field data in GIS-friendly and archive-friendly formats.

## KMZ Export Should Include

```text
Photo point locations
Photo direction arrows, if heading exists
Photo notes
Links or references to image files
Optional imported features
```

## ZIP Export Should Include

```text
CSV metadata
KMZ file
Photos folder
Metadata JSON
```

## Tasks

- Generate GeoJSON or KML from saved photos.
- Package data using JSZip.
- Include image blobs in export package.
- Trigger browser download.

## Deliverable

Downloadable ZIP/KMZ package.

## Acceptance Criteria

- ZIP contains CSV, KMZ, photos, and JSON metadata.
- KMZ opens in Google Earth or compatible GIS software.
- Photo locations are preserved.
- Heading arrows are included where possible.

---

# Module 16 — PWA Installation and Offline Shell

## Goal

Make the webapp installable and usable as a basic offline shell.

## Tasks

- Add `manifest.webmanifest`.
- Add app icons.
- Add service worker.
- Cache app shell files.
- Allow app to open without network.
- Keep IndexedDB data available offline.

## Deliverable

Installable PWA.

## Acceptance Criteria

- Browser offers install option where supported.
- Installed app opens from phone home screen.
- App shell loads without internet.
- Previously saved data remains available offline.

---

# Module 17 — Offline Maps, Future Phase

## Goal

Support field use when internet access is poor or unavailable.

## Possible Offline Map Approaches

```text
Pre-cached OpenStreetMap tiles
User-defined offline map areas
MBTiles through a compatible web approach
Static project basemap packages
```

## Notes

Offline basemaps are more complex than offline app data. This module should be treated as a future phase after the core photo, GPS, KML/KMZ, and export workflow works.

## Deliverable

Offline map support.

## Acceptance Criteria

- User can open project without internet.
- Imported features remain visible offline.
- Saved photos remain visible offline.
- Basemap remains visible if offline tiles were prepared.

---

## 5. Recommended Build Order

The recommended order is:

```text
Module 0  - Web Project Setup
Module 1  - Leaflet Map with OpenStreetMap
Module 2  - App Settings
Module 3  - Basemap Switcher
Module 4  - GPS Location Tracking
Module 5  - Photo Capture and Image Selection
Module 6  - Local Database with IndexedDB
Module 7  - Photo Metadata
Module 8  - Heading and Orientation
Module 9  - Photo Markers on Map
Module 10 - KML/KMZ Import
Module 11 - Feature Layers on Map
Module 12 - Nearest Feature Association
Module 13 - Project Workflow
Module 14 - Export CSV
Module 15 - Export KMZ / ZIP Package
Module 16 - PWA Installation and Offline Shell
Module 17 - Offline Maps, Future Phase
```

---

## 6. MVP v0.1 Scope

The first working MVP should include:

```text
React + TypeScript + Vite app
Leaflet map
OpenStreetMap basemap
Settings page
Current GPS position
Take/select photo
Save photo metadata locally
Save decimal Lat/Lon
Save timestamp
Manual heading input
Show photo marker on map
Open photo detail page
```

---

## 7. MVP v0.2 Scope

The second version should include:

```text
IndexedDB database with Dexie.js
Automatic heading capture where browser supports it
Manual heading correction
Photo direction arrows
Google API key setting
Google Satellite optional basemap
```

---

## 8. MVP v0.3 Scope

The third version should include:

```text
KML/KMZ import
Point features
Polyline features
Polygon features
Feature layer display
Nearest feature association
```

---

## 9. MVP v0.4 Scope

The fourth version should include:

```text
Project management
CSV export
KMZ export
ZIP package with photos
Basic PWA install support
Offline app shell
```

---

## 10. Design Principles

The app should follow these principles:

- Build one module at a time.
- Keep components small and reusable.
- Keep map logic separate from UI pages.
- Keep services independent.
- Store all important metadata in IndexedDB.
- Do not depend only on EXIF metadata.
- Keep basemaps separate from overlays.
- Keep imported features separate from photo markers.
- Always preserve original automatic heading.
- Always allow manual heading correction.
- Use decimal latitude/longitude as the first coordinate format.
- Add State Plane, UTM, or other coordinate systems later if needed.
- Make OpenStreetMap the default free basemap.
- Make Google Satellite optional and API-key based.
- Treat offline maps as a future phase, not part of the first MVP.

---

## 11. Initial Development Goal

The first development goal is not a complete app.

The first goal is:

```text
Open webapp locally
Open MapPage
Show OpenStreetMap
Show current GPS position
Take or select a photo
Save photo with decimal Lat/Lon
Show photo marker on map
Open photo detail page
View metadata
Edit heading manually
```

Once this workflow works, the app can grow into the KML/KMZ and GIS feature workflow.

---

## 12. Suggested Initial Commands

Create the project:

```bash
npm create vite@latest field-photo-mapper-web -- --template react-ts
cd field-photo-mapper-web
npm install
npm run dev
```

Install initial map dependencies:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

Install storage and file-processing dependencies later:

```bash
npm install dexie jszip @tmcw/togeojson
```

Optional PWA plugin later:

```bash
npm install -D vite-plugin-pwa
```

---

## 13. Development Notes

For field use, test on actual mobile browsers early.

Recommended test targets:

```text
Android Chrome
Android Edge
iPhone Safari, optional later
Desktop Chrome for debugging
```

Important browser features to validate early:

```text
Camera access
Image file selection
GPS permission
Heading/orientation support
IndexedDB storage capacity
PWA install behavior
```

---

## 14. Current Decision Log

```text
App name: Field Photo Mapper
Development path: Webapp / PWA
Primary framework: React + TypeScript + Vite
Map engine: Leaflet
Default basemap: OpenStreetMap
Optional basemap: Google Satellite with API key
Geometry support: Points, polylines, polygons
Coordinate display: Decimal Lat/Lon
Photo metadata: Store full metadata locally
Heading: Capture automatic if available, allow manual correction
Local database: IndexedDB
Initial deployment: Local development, later GitHub Pages or Azure Static Web Apps
```
