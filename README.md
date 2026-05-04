# Field Photo Mapper

**Field Photo Mapper** is a mobile field-mapping application for Android built with **.NET MAUI**, **C#**, and **Mapsui**. The app is intended for field inspections where the user needs to view GIS features, navigate using a map, take georeferenced photos, and store photo metadata such as location, heading, timestamp, and notes.

The initial version will focus on Android only.

---

## 1. Project Purpose

The purpose of Field Photo Mapper is to support field work by allowing the user to:

- View a map in the field.
- Use OpenStreetMap as the default free basemap.
- Optionally switch to Google Satellite if a Google API key is provided.
- Import KMZ files.
- Display KMZ features on the map.
- Track the current GPS position.
- Take photos or attach existing images.
- Store each photo with complete metadata.
- Save photo location using decimal latitude/longitude.
- Save automatic heading at the time of capture.
- Allow manual correction of the saved heading.
- Display field photos as map markers.
- Build the app in independent modules so each feature can be tested separately.

---

## 2. Technology Stack

### Core Framework

- **.NET MAUI**
- **C#**
- **Android target first**

.NET MAUI provides device APIs such as camera/media picker and geolocation, which are required for taking photos, selecting images, and reading device GPS coordinates.

### Map Engine

- **Mapsui**

Mapsui supports .NET MAUI, map layers, OpenStreetMap tiles, custom geometries, and offline map workflows through MBTiles, which makes it suitable for a custom GIS-style field app.

### KMZ/KML Reader

- **SharpKml.Core**

SharpKML can read and write KML and KMZ files in C#, which makes it appropriate for importing field features from KMZ files.

### Local Storage

- **SQLite**

SQLite will be used to store projects, imported KMZ metadata, parsed GIS features, photo records, notes, heading information, and user settings.

---

## 3. App Architecture

The application should be built in independent modules. Each module should compile and work by itself before moving to the next module.

Recommended structure:

```text
FieldPhotoMapper/
│
├── Pages/
│   ├── HomePage.xaml
│   ├── MapPage.xaml
│   ├── PhotoCapturePage.xaml
│   ├── PhotoDetailPage.xaml
│   ├── KmzImportPage.xaml
│   └── SettingsPage.xaml
│
├── Models/
│   ├── Project.cs
│   ├── FieldPhoto.cs
│   ├── GeoFeature.cs
│   ├── KmzFileRecord.cs
│   └── AppSettings.cs
│
├── Services/
│   ├── MapService.cs
│   ├── BasemapService.cs
│   ├── LocationService.cs
│   ├── PhotoService.cs
│   ├── HeadingService.cs
│   ├── KmzParserService.cs
│   ├── FeatureLayerService.cs
│   ├── DatabaseService.cs
│   └── SettingsService.cs
│
├── Data/
│   └── Local SQLite database
│
├── Resources/
│   ├── Images/
│   ├── Fonts/
│   └── Styles/
│
└── Platforms/
    └── Android/
```

---

## 4. Development Roadmap

The app should be developed in phases.

---

# Module 0 — Project Setup

## Goal

Create the base .NET MAUI Android project and confirm that the development environment works.

## Tasks

- Create a new `.NET MAUI App`.
- Target Android first.
- Confirm that the app runs on:
  - Android Emulator.
  - Physical Android device, if available.
- Add basic app navigation.
- Create placeholder pages:
  - HomePage
  - MapPage
  - SettingsPage
  - PhotoCapturePage
  - PhotoDetailPage
  - KmzImportPage

## Deliverable

A blank app with working navigation.

## Acceptance Criteria

- App builds successfully.
- App runs on Android.
- User can navigate between placeholder pages.

---

# Module 1 — Base Map with Mapsui

## Goal

Add a map view using Mapsui and display OpenStreetMap as the default basemap.

## Tasks

- Install Mapsui MAUI package.
- Add `MapPage`.
- Add a Mapsui map control.
- Load OpenStreetMap as the default basemap.
- Center the map on a default location.
- Add basic zoom and pan support.

## Deliverable

A working map screen using OpenStreetMap.

## Acceptance Criteria

- Map loads when opening `MapPage`.
- User can pan and zoom.
- OpenStreetMap appears by default.

---

# Module 2 — Basemap Switcher

## Goal

Add a basemap selector that supports:

```text
OpenStreetMap
Google Satellite, if API key exists
```

## Tasks

- Create `BasemapService`.
- Add a basemap dropdown or segmented control.
- Set OpenStreetMap as default.
- Add setting for Google API key.
- If Google API key is empty:
  - Disable Google Satellite option.
  - Show message: `Google Satellite requires an API key.`
- If Google API key exists:
  - Enable Google Satellite layer.
- Allow the user to switch between basemaps.

## Deliverable

A map layer switcher.

## Acceptance Criteria

- OpenStreetMap works without API key.
- Google Satellite option is visible but disabled when no API key exists.
- Google Satellite can be enabled when an API key is saved.
- Switching basemaps does not remove KMZ overlays or photo markers.

---

# Module 3 — App Settings

## Goal

Create a settings system for storing user preferences.

## Initial Settings

```text
GoogleApiKey
DefaultBasemap
SavePhotosToInternalStorage
CoordinateDisplayFormat
EnableHeadingCapture
```

## Required Defaults

```text
DefaultBasemap = OpenStreetMap
CoordinateDisplayFormat = Decimal Lat/Lon
SavePhotosToInternalStorage = true
EnableHeadingCapture = true
```

## Tasks

- Create `AppSettings` model.
- Create `SettingsService`.
- Create `SettingsPage`.
- Add input for Google API key.
- Add map basemap preference.
- Add heading capture toggle.
- Save settings locally.

## Deliverable

A functional settings page.

## Acceptance Criteria

- Settings persist after closing and reopening the app.
- Google API key can be entered, saved, edited, and removed.
- Default map remains OpenStreetMap unless changed by user.

---

# Module 4 — Location Tracking

## Goal

Read and display the user’s current GPS position.

## Tasks

- Create `LocationService`.
- Request Android location permissions.
- Get last known location.
- Get current location.
- Display current location on the map.
- Store:
  - Latitude
  - Longitude
  - Altitude, if available
  - Accuracy
  - Timestamp

## Coordinate Format

Use:

```text
Decimal Latitude / Longitude
```

Example:

```text
Latitude: 39.952583
Longitude: -75.165222
```

## Deliverable

Current GPS position shown on the map.

## Acceptance Criteria

- App requests location permission.
- App reads current position.
- Current position appears as a map marker.
- GPS accuracy is available to the user when possible.

---

# Module 5 — Photo Capture and Image Selection

## Goal

Allow the user to take a photo or select an existing image.

## Tasks

- Create `PhotoService`.
- Add button:
  - `Take Photo`
- Add button:
  - `Select Existing Image`
- Use MAUI MediaPicker for camera and file selection.
- Save a copy of the image inside the app storage folder.
- Create a photo record in SQLite.
- Link the photo to the current project.

## Required Photo Actions

```text
Take Photo
Select Existing Image
Preview Photo
Delete Photo
Add Note
```

## Deliverable

The user can take or select a photo and save it in the app.

## Acceptance Criteria

- Camera opens successfully.
- User can select existing image.
- Image is copied to internal app storage.
- Image preview works.
- Photo record is created in database.

---

# Module 6 — Photo Metadata

## Goal

Save complete metadata for every photo.

## Required Metadata

```text
PhotoId
ProjectId
FilePath
OriginalFileName
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
DeviceModel
AppVersion
```

## Notes

- Automatic heading should be captured at the time of photo capture.
- Manual heading correction should be allowed after saving.
- Metadata must be stored in SQLite.
- Do not rely only on EXIF metadata.

## Deliverable

Each photo has a complete metadata record.

## Acceptance Criteria

- Photo location is saved.
- Photo timestamp is saved.
- Photo heading is saved when available.
- User can manually edit heading.
- Edited heading does not overwrite the original automatic heading.
- Photo note can be added or edited.

---

# Module 7 — Heading and Orientation

## Goal

Capture the phone heading when a photo is taken and allow manual correction.

## Tasks

- Create `HeadingService`.
- Read compass/heading sensor.
- Save automatic heading as:

```text
HeadingDegreesAuto
```

- Add manual correction field:

```text
HeadingDegreesManual
```

- Add flag:

```text
HeadingWasManuallyCorrected
```

## Map Display

Photos should be shown using:

```text
Point marker + direction arrow
```

If manual heading exists, use manual heading for the arrow.

If manual heading does not exist, use automatic heading.

## Deliverable

Photo orientation is saved and displayed.

## Acceptance Criteria

- Automatic heading is captured when possible.
- User can correct heading manually.
- Map arrow updates after manual correction.
- Original automatic heading remains stored.

---

# Module 8 — Local Database

## Goal

Implement persistent local storage using SQLite.

## Initial Tables

```text
Projects
FieldPhotos
KmzFiles
GeoFeatures
AppSettings
```

## Projects Table

Stores project-level information.

```text
ProjectId
ProjectName
CreatedAt
UpdatedAt
DefaultLatitude
DefaultLongitude
Notes
```

## FieldPhotos Table

Stores photo records and metadata.

```text
PhotoId
ProjectId
FilePath
OriginalFileName
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
DeviceModel
AppVersion
```

## KmzFiles Table

Stores imported KMZ file records.

```text
KmzFileId
ProjectId
FileName
FilePath
ImportedAt
FeatureCount
```

## GeoFeatures Table

Stores parsed KMZ features.

```text
FeatureId
KmzFileId
ProjectId
FeatureName
FeatureType
GeometryJson
StyleJson
Description
FolderPath
ImportedAt
```

## AppSettings Table

Stores app settings.

```text
SettingKey
SettingValue
UpdatedAt
```

## Deliverable

All project, photo, KMZ, feature, and settings data persist locally.

## Acceptance Criteria

- Data remains available after app restart.
- Photos are linked to projects.
- Features are linked to imported KMZ files.
- Settings persist.

---

# Module 9 — KMZ Import

## Goal

Import a KMZ file and parse basic GIS features.

## Initial Supported Geometry Types

```text
Points
Polylines
Polygons
```

## Not Supported in MVP

```text
Ground overlays
Network links
Advanced KML styles
Custom icon rendering
3D models
Time animations
```

## Tasks

- Create `KmzParserService`.
- Let user select a `.kmz` file.
- Extract KML from KMZ.
- Parse placemarks.
- Identify geometry type:
  - Point
  - LineString
  - Polygon
- Save features to SQLite.
- Convert features into map layers.

## Deliverable

KMZ features displayed on the map.

## Acceptance Criteria

- User can import a KMZ.
- Points display as markers.
- Polylines display as lines.
- Polygons display as filled or outlined shapes.
- Imported features persist after app restart.

---

# Module 10 — Feature Layers

## Goal

Draw imported KMZ features on top of the basemap.

## Tasks

- Create `FeatureLayerService`.
- Load features from SQLite.
- Convert features to Mapsui geometries.
- Add feature layers above basemap.
- Keep feature layers visible when switching basemaps.
- Add tap/click support for features.
- Display feature name and description.

## Layer Order

```text
1. Basemap
2. KMZ polygons
3. KMZ polylines
4. KMZ points
5. Photo markers
6. Current GPS position
```

## Deliverable

Imported KMZ features are visible and selectable.

## Acceptance Criteria

- Features are drawn in correct layer order.
- Feature labels or popups show basic information.
- Features remain visible when switching from OpenStreetMap to Google Satellite.

---

# Module 11 — Photo Markers on Map

## Goal

Show saved photos as markers on the map.

## Tasks

- Load saved photos from SQLite.
- Display each photo as a marker.
- Display heading arrow.
- Open `PhotoDetailPage` when marker is tapped.
- Show photo preview, metadata, and notes.
- Allow manual heading correction.

## Deliverable

Photo locations and orientations are visible on the map.

## Acceptance Criteria

- Each saved photo appears on map.
- Photo marker opens detail page.
- Heading arrow displays correctly.
- Manual correction updates the displayed arrow.

---

# Module 12 — Nearest Feature Association

## Goal

Automatically associate each photo with the nearest KMZ feature.

## Tasks

- When a photo is saved, compare photo location with imported features.
- Find nearest point, line, or polygon.
- Save:

```text
NearestFeatureId
NearestFeatureName
```

- Display nearest feature on photo detail page.

## Deliverable

Photos are linked to nearby GIS features.

## Acceptance Criteria

- New photos get nearest feature automatically when KMZ features exist.
- User can manually override nearest feature if needed.
- Nearest feature appears on photo detail page.

---

# Module 13 — Project Workflow

## Goal

Support multiple field projects.

## Tasks

- Create project list.
- Create new project.
- Open existing project.
- Delete project.
- Store KMZ files and photos by project.
- Show project summary.

## Deliverable

User can manage multiple projects.

## Acceptance Criteria

- User can create a project.
- User can import KMZ into a project.
- User can save photos under a project.
- Projects remain separated.

---

# Module 14 — Export, Phase 2

## Goal

Export collected data for use outside the app.

## Export Formats

Priority order:

```text
1. CSV
2. KMZ
3. ZIP package with photos
4. PDF report
```

## CSV Export

Should include:

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
Note
NearestFeatureName
```

## KMZ Export

Should include:

```text
Photo points
Photo direction arrows
Notes
Links to image files
Original imported features, optional
```

## ZIP Export

Should include:

```text
CSV
KMZ
Photos folder
Metadata JSON
```

## PDF Report

Should include:

```text
Project summary
Map screenshots
Photo table
Individual photo sheets
Metadata
Notes
```

## Deliverable

Export package for office review.

## Acceptance Criteria

- CSV opens in Excel.
- KMZ opens in Google Earth or GIS software.
- ZIP contains all images and metadata.
- PDF report is readable and organized.

---

# Module 15 — Future Offline Mode

## Goal

Support offline field use.

## Possible Offline Features

```text
Cached OpenStreetMap tiles
MBTiles support
Offline project package
Offline KMZ layers
Offline photo storage
Delayed export/sync
```

## Deliverable

Offline-ready field workflow.

## Acceptance Criteria

- User can open project without internet.
- Imported KMZ features remain visible.
- Saved photos remain available.
- Map basemap is available if offline tiles were prepared.

---

## 5. Recommended Build Order

The recommended order is:

```text
Module 0  - Project Setup
Module 1  - Base Map with Mapsui
Module 3  - App Settings
Module 2  - Basemap Switcher
Module 4  - Location Tracking
Module 8  - Local Database
Module 5  - Photo Capture and Image Selection
Module 6  - Photo Metadata
Module 7  - Heading and Orientation
Module 9  - KMZ Import
Module 10 - Feature Layers
Module 11 - Photo Markers on Map
Module 12 - Nearest Feature Association
Module 13 - Project Workflow
Module 14 - Export
Module 15 - Offline Mode
```

---

## 6. MVP v0.1 Scope

The first working MVP should include:

```text
Android app
OpenStreetMap basemap
Settings page
Google API key field
Current GPS position
Take photo
Select existing image
Save photo internally
Save decimal Lat/Lon
Save timestamp
Save automatic heading
Allow manual heading correction
Store all metadata in SQLite
Show photo marker on map
```

---

## 7. MVP v0.2 Scope

The second version should include:

```text
Google Satellite optional basemap
KMZ import
Point features
Polyline features
Polygon features
Feature layer display
Photo-to-nearest-feature association
```

---

## 8. MVP v0.3 Scope

The third version should include:

```text
Project management
CSV export
KMZ export
ZIP package with photos
Basic field report
```

---

## 9. Design Principles

The app should follow these principles:

- Build one module at a time.
- Keep services independent.
- Avoid putting business logic directly inside pages.
- Store all important metadata in SQLite.
- Do not depend only on EXIF metadata.
- Keep map layers separate.
- Keep basemaps separate from overlays.
- Allow field correction of automatically captured data.
- Always preserve original automatic heading.
- Use decimal latitude/longitude as the first coordinate format.
- Add State Plane, UTM, or other coordinate systems later if needed.

---

## 10. Initial Development Goal

The first development goal is not a complete app.

The first goal is:

```text
Open Android app
Open MapPage
Show OpenStreetMap
Show current GPS position
Take a photo
Save photo with decimal Lat/Lon
Show photo marker on map
Open photo detail page
View metadata
Edit heading manually
```

Once this workflow works, the app can grow into the KMZ and GIS feature workflow.
