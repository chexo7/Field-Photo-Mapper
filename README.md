# Field Photo Mapper Web — Perfect Development Roadmap

**Field Photo Mapper Web** is a browser-based field-mapping application designed as a **Progressive Web App (PWA)**. The app supports field photo collection, map-based navigation, KML/KMZ overlays, GPS position tracking, photo metadata storage, and export workflows.

This README is written as a **module-by-module development roadmap**. Each module is designed to be built independently, tested independently, committed independently, and integrated only after the acceptance criteria are met.

---

## 1. Product Vision

Field Photo Mapper Web should allow a field user to:

- Open a map in a browser or installed PWA.
- Use **OpenStreetMap** as the default free basemap.
- Optionally use **Google Satellite** if a Google Maps API key is provided.
- Import KML/KMZ files.
- Display point, polyline, and polygon features from imported files.
- Read current GPS position.
- Take photos using the device camera where supported by the browser.
- Select existing images from the device.
- Store every photo with full metadata.
- Save photo location using decimal latitude/longitude.
- Capture heading/orientation when browser/device support allows it.
- Allow manual heading correction after capture.
- Display field photos as map markers with optional direction arrows.
- Store data locally for field use.
- Export data for office review.

---

## 2. Development Philosophy

The app must be developed using the following principles:

1. **Build vertically, not horizontally.**  
   Each milestone should produce a usable field workflow, not just disconnected components.

2. **One module per commit group.**  
   A module should be completed, tested, and committed before starting the next module.

3. **Keep map, storage, camera, and export logic separated.**  
   Pages should call services. Pages should not contain business logic.

4. **Keep the MVP small.**  
   The first goal is not a perfect app. The first goal is one reliable field workflow.

5. **Always preserve raw data.**  
   Never overwrite original GPS, timestamp, automatic heading, or source file information. Corrections should be stored separately.

6. **Field reliability comes first.**  
   The app should handle denied permissions, missing GPS, weak internet, unsupported sensors, and browser differences gracefully.

7. **Use decimal latitude/longitude first.**  
   State Plane, UTM, and other coordinate systems can be added later.

---

## 3. Technology Stack

### Frontend

- React
- TypeScript
- Vite

### Map

- Leaflet
- React Leaflet
- OpenStreetMap default basemap
- Google Satellite optional basemap if API key exists

### KML/KMZ

- JSZip for KMZ extraction
- `@tmcw/togeojson` for KML to GeoJSON conversion

### Local Database

- IndexedDB
- Dexie.js wrapper

### Browser APIs

- Geolocation API
- Media Capture / file input APIs
- DeviceOrientation API where supported

### PWA

- Web App Manifest
- Service Worker
- Optional `vite-plugin-pwa`

---

## 4. Recommended Repository Structure

```text
field-photo-mapper-web/
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
│   │   ├── HeadingEditor.tsx
│   │   └── AppLayout.tsx
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

## 5. Branching and Commit Strategy

Use a simple structure:

```text
main
└── dev
    ├── feature/module-00-project-setup
    ├── feature/module-01-leaflet-map
    ├── feature/module-02-settings
    └── ...
```

### Commit Style

Use clear commits:

```text
feat(map): add OpenStreetMap Leaflet basemap
feat(location): add current GPS marker
feat(photo): add photo capture input
fix(map): correct mobile map height
refactor(storage): isolate IndexedDB access
```

### Module Completion Rule

A module is not complete until:

- It builds without TypeScript errors.
- It works on desktop browser.
- It is tested on Android Chrome or Edge if device APIs are involved.
- Acceptance criteria are met.
- Known limitations are documented.

---

# 6. Module-by-Module Roadmap

---

# Module 0 — Web Project Setup

## Goal

Create the base React + TypeScript + Vite project and prepare the app structure for modular development.

## Why This Module Matters

This module defines the foundation. If the folder structure, routing, TypeScript configuration, and app layout are messy, every later module becomes harder.

## Development Steps

### Step 0.1 — Create the Vite App

```bash
npm create vite@latest field-photo-mapper-web -- --template react-ts
cd field-photo-mapper-web
npm install
npm run dev
```

### Step 0.2 — Clean the Starter App

Remove unnecessary starter content:

```text
src/assets/react.svg
src/App.css default demo content
src/App.tsx demo counter
```

Keep the app minimal.

### Step 0.3 — Create Folder Structure

Create:

```text
src/app
src/pages
src/components
src/models
src/services
src/db
src/utils
src/styles
```

### Step 0.4 — Add Placeholder Pages

Create placeholder pages:

```text
HomePage
MapPage
PhotoCapturePage
PhotoDetailPage
KmzImportPage
SettingsPage
ProjectPage
```

Each page should initially render only:

```text
Page title
Short purpose
Navigation back/home if needed
```

### Step 0.5 — Add Routing

Install router:

```bash
npm install react-router-dom
```

Create routes for all placeholder pages.

### Step 0.6 — Add App Layout

Create `AppLayout.tsx` with:

```text
Header
Main content area
Simple navigation links
Mobile-friendly spacing
```

Do not spend too much time on design yet.

## Optimal Development Notes

- Do not install Leaflet yet.
- Do not install Dexie yet.
- Keep this module focused on structure and navigation only.
- Avoid over-designing CSS at this stage.
- Make the app easy to inspect on mobile browser.

## Deliverable

A clean Vite React TypeScript app with page navigation and project structure.

## Acceptance Criteria

- App runs with `npm run dev`.
- No TypeScript errors.
- User can navigate to all placeholder pages.
- Folder structure matches the roadmap.
- The app works on desktop browser and mobile browser over local network if tested.

## Suggested Commit

```text
feat(app): initialize React TypeScript Vite project structure
```

---

# Module 1 — Leaflet Map with OpenStreetMap

## Goal

Add a Leaflet map using OpenStreetMap as the default basemap.

## Why This Module Matters

The map is the center of the app. All future data layers—photos, GPS, KML/KMZ features, direction arrows—will depend on a stable map component.

## Development Steps

### Step 1.1 — Install Dependencies

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Step 1.2 — Import Leaflet CSS

Import Leaflet CSS once, preferably in `main.tsx` or a global CSS file.

### Step 1.3 — Create `MapView.tsx`

The component should accept props later, but initially it only needs:

```text
center latitude
center longitude
zoom level
OpenStreetMap tile layer
```

### Step 1.4 — Fix Map Height

Leaflet maps do not display correctly unless the container has a defined height.

Create `map.css` with rules for:

```text
map page wrapper
map container
mobile viewport height
```

### Step 1.5 — Add Map to `MapPage`

`MapPage` should render:

```text
Page title or toolbar
MapView
```

### Step 1.6 — Default Map Center

Use a default center appropriate for testing. This can later be replaced by project location or GPS location.

## Optimal Development Notes

- Do not add GPS in this module.
- Do not add basemap switching in this module.
- Do not add photo markers yet.
- Keep the map component reusable.
- Avoid hardcoding everything inside `MapPage`; keep map setup inside `MapView`.

## Deliverable

A working Leaflet map with OpenStreetMap.

## Acceptance Criteria

- Map loads on `MapPage`.
- User can pan and zoom.
- OpenStreetMap is visible.
- Map height works on desktop and mobile.
- No console errors related to missing Leaflet assets.

## Suggested Commit

```text
feat(map): add Leaflet OpenStreetMap basemap
```

---

# Module 2 — App Settings

## Goal

Create a settings system to store user preferences locally.

## Why This Module Matters

Settings must exist before adding Google Satellite, heading toggles, and user preferences. The app should not rely on hardcoded values long-term.

## Initial Settings

```text
GoogleApiKey
DefaultBasemap
CoordinateDisplayFormat
EnableHeadingCapture
SavePhotosLocally
```

## Defaults

```text
DefaultBasemap = OpenStreetMap
CoordinateDisplayFormat = Decimal Lat/Lon
EnableHeadingCapture = true
SavePhotosLocally = true
GoogleApiKey = empty
```

## Development Steps

### Step 2.1 — Create `AppSettings` Model

Create a TypeScript interface with the settings above.

### Step 2.2 — Create `settingsService.ts`

Start simple. Use `localStorage` first if desired. Later, settings can be moved into IndexedDB.

The service should support:

```text
getSettings
saveSettings
resetSettings
getDefaultSettings
```

### Step 2.3 — Create `SettingsPage`

Add fields for:

```text
Google API key
Default basemap
Enable heading capture
Save photos locally
Coordinate display format
```

### Step 2.4 — Add Validation

Validation rules:

```text
Google API key can be empty
Default basemap must be valid
Coordinate format initially only supports Decimal Lat/Lon
```

### Step 2.5 — Persist and Reload

After saving settings:

```text
Refresh page
Confirm values remain
Reset values
Confirm defaults return
```

## Optimal Development Notes

- Start with localStorage for speed.
- Move to IndexedDB in Module 6 if needed.
- Do not validate whether Google API key actually works yet.
- Do not load Google Satellite yet.

## Deliverable

Functional settings page.

## Acceptance Criteria

- Settings persist after refresh.
- Google API key can be saved, edited, and cleared.
- OpenStreetMap remains default unless changed.
- Invalid basemap values cannot break the app.

## Suggested Commit

```text
feat(settings): add persistent app settings
```

---

# Module 3 — Basemap Switcher

## Goal

Allow the user to switch between OpenStreetMap and Google Satellite when a Google API key exists.

## Why This Module Matters

The basemap must be independent from overlays. Switching from OpenStreetMap to Google Satellite should not remove photo markers, GPS location, or imported features.

## Basemap Options

```text
OpenStreetMap
Google Satellite, if API key exists
```

## Development Steps

### Step 3.1 — Create Basemap Types

Create a type or enum:

```text
openstreetmap
google-satellite
```

### Step 3.2 — Create `basemapService.ts`

The service should:

```text
return available basemaps
check if Google Satellite is enabled
return tile/source configuration
```

### Step 3.3 — Create `BasemapSwitcher.tsx`

The component should:

```text
show current basemap
allow switching
show disabled Google option if no API key exists
explain that Google Satellite requires API key
```

### Step 3.4 — Preserve Overlay Layers

Basemap should be rendered as one layer group. Overlays should be separate:

```text
Basemap layer
Feature overlays
Photo overlays
GPS overlay
```

### Step 3.5 — Implement Google Satellite Carefully

For the MVP, choose one implementation approach and document limitations:

```text
Option A: use an approved Google Maps JavaScript API integration
Option B: defer actual Google Satellite rendering and keep API key/settings ready
```

Because Google basemap terms and integration methods matter, do not rely on unofficial tile URLs for a production workflow.

## Optimal Development Notes

- Keep OpenStreetMap fully functional without Google.
- Do not block the app if Google API key is missing.
- Treat Google Satellite as optional enhancement.
- Add clear UI feedback if Google Satellite is unavailable.

## Deliverable

Basemap selector with OpenStreetMap default and Google Satellite option gated by API key.

## Acceptance Criteria

- OpenStreetMap works without API key.
- Google Satellite option is disabled when API key is empty.
- Google Satellite option becomes available when API key exists.
- Switching basemaps does not remove overlays.
- Missing/invalid Google API key does not crash the app.

## Suggested Commit

```text
feat(map): add basemap switcher with Google satellite option
```

---

# Module 4 — GPS Location Tracking

## Goal

Read and display the current GPS position on the map.

## Why This Module Matters

Field photos are only valuable if location capture is reliable. GPS must be tested early on real mobile hardware.

## Development Steps

### Step 4.1 — Create `locationService.ts`

The service should support:

```text
isGeolocationSupported
getCurrentPosition
watchPosition
clearWatch
```

### Step 4.2 — Handle Permissions

Handle these cases:

```text
Permission granted
Permission denied
Position unavailable
Timeout
Browser does not support geolocation
```

### Step 4.3 — Create `CurrentLocationMarker.tsx`

Show:

```text
current position marker
accuracy circle if accuracy exists
last updated timestamp
```

### Step 4.4 — Add GPS Button to Map

Add buttons:

```text
Locate me
Start live tracking
Stop live tracking
```

### Step 4.5 — Store Last Known Position in State

Do not store every watch update in database yet. Save only current app state in this module.

## Optimal Development Notes

- Test on actual Android Chrome early.
- Use a timeout to avoid hanging location requests.
- Show accuracy in feet/meters if useful later.
- Do not auto-request GPS on page load unless necessary; user action is better.
- Gracefully handle denied permissions.

## Deliverable

GPS current location displayed on the map.

## Acceptance Criteria

- Browser requests location permission.
- Current location appears on the map.
- Accuracy circle appears when available.
- User can refresh location.
- Denied permission shows a clear message.

## Suggested Commit

```text
feat(location): add GPS location marker and tracking controls
```

---

# Module 5 — Photo Capture and Image Selection

## Goal

Allow the user to take a photo or select an existing image.

## Why This Module Matters

Photo collection is the core field operation. The first version should prioritize reliability over advanced camera features.

## Development Steps

### Step 5.1 — Create `photoService.ts`

The service should handle:

```text
file validation
image preview URL creation
image metadata reading where possible
thumbnail generation later
```

### Step 5.2 — Create `PhotoCapture.tsx`

Add controls:

```text
Take photo
Select existing image
Preview selected image
Cancel
Save draft
```

### Step 5.3 — Use File Input First

Start with:

```text
input type="file"
accept="image/*"
capture="environment"
```

This is simpler and more mobile-friendly than building a custom live camera view first.

### Step 5.4 — Add Optional `getUserMedia()` Later

Only add live camera preview if the file input approach is insufficient.

### Step 5.5 — Attach Current GPS Data

When the user saves the photo, attach current GPS state if available.

If no GPS exists, save the photo but flag location as missing.

## Optimal Development Notes

- Do not store images in IndexedDB until Module 6.
- In this module, preview in memory only.
- Validate file type and size.
- Use object URLs carefully and revoke them when no longer needed.
- Keep capture UI simple for field use.

## Deliverable

User can capture or select and preview an image.

## Acceptance Criteria

- User can select existing image.
- User can open camera on supported mobile browser.
- Preview works.
- User can cancel selection.
- App does not crash with unsupported file types.

## Suggested Commit

```text
feat(photo): add image capture and selection workflow
```

---

# Module 6 — Local Database with IndexedDB

## Goal

Implement persistent browser storage for projects, photos, features, and settings.

## Why This Module Matters

Field data must survive refreshes, browser restarts, and temporary loss of network. IndexedDB is the core of the local-first architecture.

## Recommended Library

```bash
npm install dexie
```

## Initial Stores

```text
projects
fieldPhotos
kmzFiles
geoFeatures
appSettings
```

## Development Steps

### Step 6.1 — Create Database Schema

Create `schema.ts` and `indexedDb.ts`.

Initial tables:

```text
projects
fieldPhotos
kmzFiles
geoFeatures
appSettings
```

### Step 6.2 — Create Storage Service

Create `storageService.ts` with clean methods:

```text
createProject
getProjects
savePhoto
getPhotosByProject
saveKmzFile
saveGeoFeatures
getFeaturesByProject
getSettings
saveSettings
```

### Step 6.3 — Add Database Versioning

Use Dexie versioning from the start.

Rules:

```text
Never casually delete stores
Increment version when schema changes
Document schema changes in README or changelog
```

### Step 6.4 — Store Photo Blobs

Store:

```text
imageBlob
thumbnailBlob later
metadata fields
```

### Step 6.5 — Add Basic Data Debug Page or Console Utility

During development, create a temporary debug view or console helper to list database records.

Remove or hide before production.

## Optimal Development Notes

- Keep all database calls inside services.
- Pages should not call Dexie directly.
- Avoid storing huge uncompressed images if possible.
- Consider generating smaller thumbnails in a later module.
- Add error handling for browser storage quota issues.

## Deliverable

Local persistent database with project/photo/settings storage.

## Acceptance Criteria

- Data persists after refresh.
- Settings can be read from database or migrated from localStorage.
- Photos can be saved and retrieved.
- Project records can be created and listed.
- No direct Dexie calls from page components.

## Suggested Commit

```text
feat(storage): add IndexedDB local database with Dexie
```

---

# Module 7 — Photo Metadata

## Goal

Save complete metadata for every photo.

## Why This Module Matters

The photo is only useful if metadata is reliable, auditable, and exportable.

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

## Development Steps

### Step 7.1 — Create `FieldPhoto` Model

Define all required fields, allowing nullable values where needed.

### Step 7.2 — Create Photo Save Workflow

When saving a photo:

```text
Generate PhotoId
Capture current timestamp
Attach selected image blob
Attach current GPS if available
Attach heading if available
Attach user note
Save to IndexedDB
```

### Step 7.3 — Read Image Dimensions

Use browser image loading to determine:

```text
ImageWidth
ImageHeight
```

### Step 7.4 — Add Metadata Panel

Create `PhotoMetadataPanel.tsx` to display saved metadata.

### Step 7.5 — Add Missing Data Flags

If GPS, heading, or accuracy are missing, display clearly:

```text
Location not captured
Heading not available
Accuracy unknown
```

## Optimal Development Notes

- Never overwrite `HeadingDegreesAuto` with manual correction.
- Never overwrite original filename.
- Store `PhotoSavedAt` separately from `PhotoTakenAt`.
- Keep metadata display clear and field-friendly.
- Do not depend only on EXIF.

## Deliverable

Saved photos with complete metadata records.

## Acceptance Criteria

- Photo metadata persists after refresh.
- Location is saved when available.
- Missing location is handled gracefully.
- Image dimensions are saved.
- Metadata panel shows all key fields.

## Suggested Commit

```text
feat(photo): persist full photo metadata
```

---

# Module 8 — Heading and Orientation

## Goal

Capture automatic heading when supported and allow manual correction.

## Why This Module Matters

Field photos often need direction context. However, browser heading support can vary, so manual correction must be a first-class feature.

## Development Steps

### Step 8.1 — Create `headingService.ts`

The service should support:

```text
isHeadingSupported
requestPermissionIfNeeded
startHeadingWatch
stopHeadingWatch
getLatestHeading
```

### Step 8.2 — Capture Automatic Heading

When the user saves a photo, attach latest heading if available:

```text
HeadingDegreesAuto
```

### Step 8.3 — Create `HeadingEditor.tsx`

The editor should allow:

```text
manual heading entry from 0 to 360 degrees
clear manual heading
save correction
```

### Step 8.4 — Display Heading Used

Define display logic:

```text
If HeadingDegreesManual exists:
    HeadingUsed = HeadingDegreesManual
Else if HeadingDegreesAuto exists:
    HeadingUsed = HeadingDegreesAuto
Else:
    HeadingUsed = null
```

### Step 8.5 — Add Validation

Valid heading range:

```text
0 <= heading < 360
```

## Optimal Development Notes

- Treat automatic heading as optional.
- Always allow manual correction.
- Keep automatic and manual heading fields separate.
- Document browser/device limitations.
- Test on actual phone.

## Deliverable

Photo heading can be captured, displayed, and corrected.

## Acceptance Criteria

- Automatic heading is saved when available.
- User can manually enter heading.
- Manual heading does not overwrite automatic heading.
- Heading validation works.
- Metadata panel shows both automatic and manual values.

## Suggested Commit

```text
feat(heading): add automatic heading capture and manual correction
```

---

# Module 9 — Photo Markers on Map

## Goal

Display saved photos on the map with optional direction arrows.

## Why This Module Matters

This completes the first real field workflow: capture photo, save metadata, and see the photo on the map.

## Development Steps

### Step 9.1 — Create `PhotoMarkerLayer.tsx`

The component should:

```text
load photos for active project
create markers at photo coordinates
skip or list photos without coordinates
```

### Step 9.2 — Add Marker Popup

Popup should show:

```text
thumbnail or small preview
photo timestamp
note preview
heading used
open details button
```

### Step 9.3 — Add Direction Arrow

If heading exists, show a small arrow or rotated marker.

Use heading logic from Module 8.

### Step 9.4 — Link to `PhotoDetailPage`

Clicking a photo marker should open details.

### Step 9.5 — Refresh Map After Save

After saving a photo, the map should update without requiring page refresh.

## Optimal Development Notes

- Keep marker rendering separate from map initialization.
- Do not store Leaflet objects in IndexedDB.
- Store data only; generate map layers at runtime.
- Use simple marker icons first.
- Improve styling later.

## Deliverable

Saved photos appear on the map.

## Acceptance Criteria

- Photos with coordinates appear as markers.
- Photos without coordinates are handled gracefully.
- Marker popup opens.
- Photo detail page opens from marker.
- Direction arrow appears when heading exists.

## Suggested Commit

```text
feat(map): display saved photo markers and heading arrows
```

---

# Module 10 — KML/KMZ Import

## Goal

Import KML/KMZ files and parse point, polyline, and polygon features.

## Why This Module Matters

Imported GIS features turn the app into a field navigation and inspection tool, not just a photo logger.

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

## Development Steps

### Step 10.1 — Install Dependencies

```bash
npm install jszip @tmcw/togeojson
```

### Step 10.2 — Create `kmzParserService.ts`

The service should support:

```text
parseKmlFile
parseKmzFile
extractKmlFromKmz
convertKmlToGeoJson
normalizeFeatureProperties
```

### Step 10.3 — Add File Import UI

On `KmzImportPage`, add file picker:

```text
accept .kml,.kmz
```

### Step 10.4 — Parse and Validate

Check:

```text
file extension
file size
whether KML exists inside KMZ
whether GeoJSON has features
```

### Step 10.5 — Store Imported File and Features

Save:

```text
original file blob
imported file record
parsed GeoJSON features
feature count
project ID
```

## Optimal Development Notes

- Keep parsing isolated from map display.
- Do not draw features directly from import page.
- Store normalized GeoJSON in IndexedDB.
- Warn user if unsupported KML elements are skipped.
- Test with small sample KML before large KMZ.

## Deliverable

KML/KMZ files can be imported and converted to stored GeoJSON features.

## Acceptance Criteria

- User can import `.kml`.
- User can import `.kmz`.
- Points are parsed.
- Polylines are parsed.
- Polygons are parsed.
- Unsupported elements do not crash the app.
- Feature count is shown after import.

## Suggested Commit

```text
feat(kmz): import KML and KMZ files as GeoJSON features
```

---

# Module 11 — Feature Layers on Map

## Goal

Draw imported KML/KMZ features on top of the selected basemap.

## Why This Module Matters

This module completes the GIS overlay workflow. Field users can now see project features, navigate to them, and collect photos around them.

## Development Steps

### Step 11.1 — Create `FeatureLayer.tsx`

The component should:

```text
load features for active project
render GeoJSON layer
style geometry by type
add popups
```

### Step 11.2 — Define Layer Order

Use this order:

```text
1. Basemap
2. Imported polygons
3. Imported polylines
4. Imported points
5. Photo markers
6. Current GPS position
```

### Step 11.3 — Style Features Simply

Initial styles:

```text
Polygons: transparent fill, colored outline
Polylines: colored line
Points: simple marker or circle marker
```

### Step 11.4 — Add Feature Popup

Popup should show:

```text
feature name
geometry type
description if available
source KMZ/KML file
```

### Step 11.5 — Preserve Layers During Basemap Switch

Basemap switching should only affect the basemap layer.

## Optimal Development Notes

- Use GeoJSON rendering rather than custom geometry conversion if possible.
- Keep feature styling centralized.
- Avoid loading all projects' features at once.
- Watch performance with large KMZ files.
- Add feature count display.

## Deliverable

Imported GIS features are visible and selectable on the map.

## Acceptance Criteria

- Points display correctly.
- Polylines display correctly.
- Polygons display correctly.
- Feature popups work.
- Features remain visible after basemap switch.
- Features persist after refresh.

## Suggested Commit

```text
feat(map): render imported KML KMZ feature layers
```

---

# Module 12 — Nearest Feature Association

## Goal

Automatically associate each saved photo with the nearest imported feature.

## Why This Module Matters

This improves office review by connecting photos to nearby design/inspection features.

## Development Steps

### Step 12.1 — Create Geometry Utility Functions

In `geoUtils.ts`, add utilities for:

```text
point-to-point distance
point-to-polyline distance
point-in-polygon check
point-to-polygon distance or centroid fallback
```

### Step 12.2 — Define Association Rules

Suggested rules:

```text
If photo is inside polygon: associate with polygon
Else find nearest point/polyline/polygon
Store nearest feature ID/name/type/distance
```

### Step 12.3 — Save Association During Photo Save

When a photo is saved:

```text
load project features
compute nearest feature
save nearest feature fields in photo metadata
```

### Step 12.4 — Display on Photo Details

Show:

```text
nearest feature name
feature type
distance
manual override option later
```

## Optimal Development Notes

- Keep distance calculations approximate at first.
- For MVP, haversine distance is acceptable for point-to-point.
- Avoid complex geodesic computations until needed.
- Add clear behavior when no features exist.
- Do not block photo save if association fails.

## Deliverable

Photos are automatically linked to nearby imported GIS features.

## Acceptance Criteria

- New photos receive nearest feature when features exist.
- No-feature case does not error.
- Nearest feature appears on photo detail page.
- Association does not prevent saving a photo.

## Suggested Commit

```text
feat(photo): associate photos with nearest imported feature
```

---

# Module 13 — Project Workflow

## Goal

Support multiple field projects.

## Why This Module Matters

Field work should be organized by project. Photos, imported files, and settings need project-level separation.

## Development Steps

### Step 13.1 — Create Project Model

Fields:

```text
ProjectId
ProjectName
CreatedAt
UpdatedAt
DefaultLatitude
DefaultLongitude
Notes
```

### Step 13.2 — Create Project Page

Add:

```text
project list
create project
open project
delete project
project summary
```

### Step 13.3 — Active Project State

The app should know the active project.

Options:

```text
URL route param
React context
local setting for last active project
```

### Step 13.4 — Filter All Data by Project

Photos, features, and imported files must be filtered by project.

### Step 13.5 — Add Project Summary

Show:

```text
photo count
imported file count
feature count
last modified date
```

## Optimal Development Notes

- Do not allow orphaned photos without a project after this module.
- Keep project deletion safe; ask for confirmation.
- Consider soft delete later.
- Active project should be visible in the UI.

## Deliverable

User can manage multiple projects.

## Acceptance Criteria

- User can create project.
- User can open project.
- User can save photos under active project.
- User can import KML/KMZ under active project.
- Projects remain separated.

## Suggested Commit

```text
feat(projects): add multi-project workflow
```

---

# Module 14 — Export CSV

## Goal

Export collected photo metadata to CSV for office review.

## Why This Module Matters

CSV is the simplest useful export. It allows quick review in Excel and integration into other workflows.

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
NearestFeatureType
NearestFeatureDistance
```

## Development Steps

### Step 14.1 — Create `exportService.ts`

Add:

```text
buildPhotoCsv
escapeCsvValue
downloadTextFile
```

### Step 14.2 — Query Project Data

Get:

```text
active project
photos for active project
nearest feature fields
```

### Step 14.3 — Build CSV Safely

Handle:

```text
commas
quotes
line breaks
null values
dates
```

### Step 14.4 — Trigger Browser Download

Filename example:

```text
FieldPhotoMapper_ProjectName_Photos_YYYYMMDD.csv
```

## Optimal Development Notes

- Make CSV export work before KMZ/ZIP export.
- Keep export logic independent of UI.
- Include decimal latitude/longitude.
- Include both automatic and manual heading.
- Include `HeadingUsed` for convenience.

## Deliverable

Downloadable CSV export.

## Acceptance Criteria

- CSV downloads successfully.
- CSV opens in Excel.
- Rows match saved photos.
- Special characters in notes do not break CSV.
- Missing values are handled cleanly.

## Suggested Commit

```text
feat(export): add CSV photo metadata export
```

---

# Module 15 — Export KMZ / ZIP Package

## Goal

Export field data in GIS-friendly and archive-friendly formats.

## Why This Module Matters

KMZ/ZIP exports make the collected field data easier to review in GIS tools, Google Earth, and project archives.

## KMZ Export Should Include

```text
Photo point locations
Photo direction arrows if heading exists
Photo notes
References to image files
Optional imported features
```

## ZIP Export Should Include

```text
CSV metadata
KMZ file
Photos folder
Metadata JSON
```

## Development Steps

### Step 15.1 — Generate Photo GeoJSON or KML

Start with GeoJSON internally, then generate KML if needed.

### Step 15.2 — Add Direction Arrows

Represent direction arrows as short line features calculated from:

```text
photo location
heading used
fixed arrow length
```

### Step 15.3 — Package Files with JSZip

Include:

```text
metadata CSV
metadata JSON
photos
KML/KMZ output
```

### Step 15.4 — Trigger ZIP Download

Filename example:

```text
FieldPhotoMapper_ProjectName_Export_YYYYMMDD.zip
```

## Optimal Development Notes

- Do CSV first; reuse CSV in ZIP.
- Keep images organized by folder.
- Keep JSON export complete for machine-readable backup.
- Do not assume every photo has coordinates.
- Validate KMZ in Google Earth or GIS software.

## Deliverable

Downloadable ZIP/KMZ package.

## Acceptance Criteria

- ZIP contains CSV, JSON, photos, and GIS output.
- KMZ opens in compatible GIS software.
- Photo point locations are correct.
- Direction arrows appear where heading exists.
- Export works for photos with and without heading.

## Suggested Commit

```text
feat(export): add KMZ and ZIP field package export
```

---

# Module 16 — PWA Installation and Offline Shell

## Goal

Make the webapp installable and usable as a basic offline shell.

## Why This Module Matters

Field users benefit from app-like behavior, home screen launch, and offline availability of previously loaded app assets.

## Development Steps

### Step 16.1 — Add PWA Plugin

```bash
npm install -D vite-plugin-pwa
```

### Step 16.2 — Add Manifest

Include:

```text
app name
short name
icons
start URL
display mode
background color
theme color
```

### Step 16.3 — Add Service Worker

Cache:

```text
app shell
static assets
icons
core CSS/JS
```

### Step 16.4 — Test Installability

Test on:

```text
Android Chrome
Android Edge
Desktop Chrome
```

### Step 16.5 — Confirm IndexedDB Offline Data

Previously saved data should remain visible offline.

## Optimal Development Notes

- Do not promise offline maps yet.
- Offline shell is not the same as offline basemap.
- Keep service worker config simple first.
- Watch for stale cache during development.
- Add visible app version number to help debug deployed builds.

## Deliverable

Installable PWA with offline app shell.

## Acceptance Criteria

- Browser offers install option where supported.
- Installed app opens from phone home screen.
- App shell loads offline.
- IndexedDB data remains accessible offline.
- User understands if basemap tiles are unavailable offline.

## Suggested Commit

```text
feat(pwa): add installable offline app shell
```

---

# Module 17 — Offline Maps, Future Phase

## Goal

Support field use when internet access is poor or unavailable.

## Why This Module Matters

Offline app data is easy compared with offline basemaps. This module should come after the core workflow works.

## Possible Offline Map Approaches

```text
pre-cached OpenStreetMap tiles
user-defined offline map areas
static project basemap packages
MBTiles-like workflow through compatible browser tooling
```

## Development Steps

### Step 17.1 — Define Offline Map Requirements

Decide:

```text
project area size
zoom levels
storage limit
basemap source
update frequency
```

### Step 17.2 — Prototype Tile Cache

Start with a small test area and limited zoom range.

### Step 17.3 — Add Offline Area Manager

Allow user to:

```text
select area
select zoom levels
download/cache tiles
delete cached tiles
see cache size
```

### Step 17.4 — Add Offline Status

Show:

```text
online/offline status
basemap cache availability
missing tile warning
```

## Optimal Development Notes

- Do not include this in the first MVP.
- Be careful with tile provider terms of use.
- Keep cache sizes controlled.
- Add user warning before large downloads.
- Test storage limits on actual devices.

## Deliverable

Offline map support for selected project areas.

## Acceptance Criteria

- User can open project offline.
- Imported features remain visible offline.
- Saved photos remain visible offline.
- Cached basemap remains visible in selected areas.
- App handles missing tiles gracefully.

## Suggested Commit

```text
feat(offline): add offline basemap cache workflow
```

---

## 7. Recommended Build Order

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

## 8. MVP Scopes

## MVP v0.1 — First Useful Field Workflow

```text
React + TypeScript + Vite app
Leaflet map
OpenStreetMap basemap
Current GPS position
Take/select photo
Save photo metadata locally
Save decimal Lat/Lon
Save timestamp
Manual heading input
Show photo marker on map
Open photo detail page
```

## MVP v0.2 — Robust Local Data and Heading

```text
IndexedDB database with Dexie.js
Automatic heading capture where supported
Manual heading correction
Photo direction arrows
Settings page
Google API key setting
Google Satellite optional basemap
```

## MVP v0.3 — GIS Overlay Workflow

```text
KML/KMZ import
Point features
Polyline features
Polygon features
Feature layer display
Nearest feature association
```

## MVP v0.4 — Project and Export Workflow

```text
Project management
CSV export
KMZ export
ZIP package with photos
Basic PWA install support
Offline app shell
```

## Future v0.5 — Offline Map Workflow

```text
Offline map area selection
Tile cache management
Offline basemap status
Offline-first project package
```

---

## 9. Testing Roadmap

## Desktop Browser Testing

Use desktop browser for:

```text
routing
map rendering
settings
IndexedDB
KML/KMZ import
exports
basic UI debugging
```

## Mobile Browser Testing

Use actual Android Chrome or Edge for:

```text
GPS
camera capture
file selection
heading/orientation
PWA install
field usability
storage behavior
```

## Field Testing Checklist

Before considering the app field-ready, test:

```text
Can the user create/open a project?
Can the user open the map outside office Wi-Fi?
Can the user locate current GPS position?
Can the user take/select photo?
Does the photo save with coordinates?
Does the marker appear in the correct location?
Can heading be corrected manually?
Can KML/KMZ features be imported?
Can exported CSV open in Excel?
Can exported ZIP preserve photos and metadata?
```

---

## 10. Risk Register

| Risk | Impact | Mitigation |
|---|---:|---|
| Browser heading support is inconsistent | High | Treat automatic heading as optional and manual heading as required |
| Google Satellite API/key/billing complexity | Medium | Keep OpenStreetMap as default and Google Satellite optional |
| Large photos exceed storage quota | High | Add image compression and thumbnails in future module |
| Large KMZ files slow browser | Medium | Start with point/line/polygon only and warn on large files |
| Offline maps are complex | High | Defer offline basemaps to future phase |
| GPS permission denied | Medium | Allow photo save without location and clearly flag missing location |
| Inconsistent mobile browser behavior | High | Test on real Android devices early |

---

## 11. Definition of Done

A module is done only when:

```text
Code builds without TypeScript errors
No critical console errors
Feature works on desktop browser
Mobile-specific feature works on Android Chrome or Edge
Acceptance criteria are satisfied
Data persists if persistence is required
Errors are handled gracefully
README or notes are updated if behavior changed
Commit is clean and descriptive
```

---

## 12. Initial Commands

Create project:

```bash
npm create vite@latest field-photo-mapper-web -- --template react-ts
cd field-photo-mapper-web
npm install
npm run dev
```

Install router:

```bash
npm install react-router-dom
```

Install map dependencies:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

Install storage and KML/KMZ dependencies later:

```bash
npm install dexie jszip @tmcw/togeojson
```

Install PWA dependency later:

```bash
npm install -D vite-plugin-pwa
```

---

## 13. Current Decision Log

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
Storage wrapper: Dexie.js
Initial deployment: Local development, later GitHub Pages or Azure Static Web Apps
```

---

## 14. First Sprint Plan

The first sprint should complete:

```text
Module 0 - Project setup
Module 1 - Leaflet OpenStreetMap
Module 2 - Settings page
```

Sprint goal:

```text
Open the app, navigate pages, open a map, and save basic settings.
```

Do not start GPS, camera, database, or KML/KMZ until the first sprint is stable.

---

## 15. Second Sprint Plan

The second sprint should complete:

```text
Module 3 - Basemap switcher
Module 4 - GPS location tracking
Module 5 - Photo capture and image selection
```

Sprint goal:

```text
Open the map, show current GPS position, and capture/select a photo preview.
```

---

## 16. Third Sprint Plan

The third sprint should complete:

```text
Module 6 - IndexedDB
Module 7 - Photo metadata
Module 8 - Heading and orientation
Module 9 - Photo markers on map
```

Sprint goal:

```text
Take/select a photo, save it locally with metadata, and see it on the map.
```

This is the first true MVP.

---

## 17. Fourth Sprint Plan

The fourth sprint should complete:

```text
Module 10 - KML/KMZ import
Module 11 - Feature layers
Module 12 - Nearest feature association
```

Sprint goal:

```text
Import field features and associate photos with nearby GIS features.
```

---

## 18. Fifth Sprint Plan

The fifth sprint should complete:

```text
Module 13 - Project workflow
Module 14 - CSV export
Module 15 - KMZ/ZIP export
Module 16 - PWA install/offline shell
```

Sprint goal:

```text
Organize field data by project and export a complete field package.
```

---

## 19. Final North Star Workflow

The final app should support this workflow:

```text
1. Open Field Photo Mapper Web
2. Select or create a project
3. Open map
4. Import KML/KMZ features
5. View current GPS position
6. Navigate to field location
7. Take/select photo
8. Save photo with Lat/Lon, timestamp, heading, note, and nearest feature
9. View photo marker and direction arrow on map
10. Correct heading if needed
11. Export CSV/KMZ/ZIP package for office review
```
