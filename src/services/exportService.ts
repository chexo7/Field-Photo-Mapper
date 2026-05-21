import JSZip from 'jszip';
import type { FieldPhoto } from '../models/FieldPhoto';
import type { GeoFeature } from '../models/GeoFeature';
import type { Project } from '../models/Project';
import { compactDateStamp } from '../utils/dateUtils';
import { sanitizeFileName } from '../utils/fileUtils';
import { destinationPoint, isValidCoordinate } from '../utils/geoUtils';

const CSV_FIELDS = [
  'PhotoId',
  'ProjectName',
  'FileName',
  'Latitude',
  'Longitude',
  'HeadingDegreesAuto',
  'HeadingDegreesManual',
  'HeadingUsed',
  'PhotoTakenAt',
  'PhotoSavedAt',
  'Note',
  'NearestFeatureName',
  'NearestFeatureType',
  'NearestFeatureDistance'
];

export function buildPhotoCsv(project: Project, photos: FieldPhoto[]): string {
  const rows = photos.map((photo) => [
    photo.id,
    project.name,
    photo.fileName,
    photo.latitude ?? '',
    photo.longitude ?? '',
    photo.headingDegreesAuto ?? '',
    photo.headingDegreesManual ?? '',
    photo.headingUsed ?? '',
    photo.takenAt ?? '',
    photo.savedAt,
    photo.note,
    photo.nearestFeature?.featureName ?? '',
    photo.nearestFeature?.featureType ?? '',
    photo.nearestFeature ? Math.round(photo.nearestFeature.distanceMeters * 10) / 10 : ''
  ]);

  return [CSV_FIELDS, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
}

export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildPhotoKml(project: Project, photos: FieldPhoto[]): string {
  const photoPlacemarks = photos
    .filter((photo) => isValidCoordinate(photo.latitude, photo.longitude))
    .map((photo) => {
      const description = [
        `File: ${escapeXml(photo.fileName)}`,
        `Saved: ${escapeXml(photo.savedAt)}`,
        photo.note ? `Note: ${escapeXml(photo.note)}` : '',
        photo.nearestFeature ? `Nearest feature: ${escapeXml(photo.nearestFeature.featureName)}` : ''
      ]
        .filter(Boolean)
        .join('<br/>');

      return `<Placemark>
  <name>${escapeXml(photo.fileName)}</name>
  <description><![CDATA[${description}]]></description>
  <Point><coordinates>${photo.longitude},${photo.latitude},0</coordinates></Point>
</Placemark>`;
    });

  const arrowPlacemarks = photos
    .filter((photo) => isValidCoordinate(photo.latitude, photo.longitude) && typeof photo.headingUsed === 'number')
    .map((photo) => {
      const end = destinationPoint(
        { latitude: photo.latitude as number, longitude: photo.longitude as number },
        photo.headingUsed as number,
        25
      );

      return `<Placemark>
  <name>${escapeXml(photo.fileName)} heading</name>
  <Style><LineStyle><color>ff2a5de8</color><width>3</width></LineStyle></Style>
  <LineString><coordinates>${photo.longitude},${photo.latitude},0 ${end.longitude},${end.latitude},0</coordinates></LineString>
</Placemark>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(project.name)} Photos</name>
    ${photoPlacemarks.join('\n')}
    ${arrowPlacemarks.join('\n')}
  </Document>
</kml>`;
}

export function buildMetadataJson(project: Project, photos: FieldPhoto[], features: GeoFeature[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      project,
      photos: photos.map(({ imageBlob: _imageBlob, thumbnailBlob: _thumbnailBlob, ...photo }) => photo),
      features
    },
    null,
    2
  );
}

export async function downloadCsv(project: Project, photos: FieldPhoto[]): Promise<void> {
  const fileName = `FieldPhotoMapper_${sanitizeFileName(project.name)}_Photos_${compactDateStamp()}.csv`;
  downloadTextFile(fileName, buildPhotoCsv(project, photos), 'text/csv;charset=utf-8');
}

export async function downloadZipPackage(
  project: Project,
  photos: FieldPhoto[],
  features: GeoFeature[]
): Promise<void> {
  const safeProjectName = sanitizeFileName(project.name);
  const dateStamp = compactDateStamp();
  const csv = buildPhotoCsv(project, photos);
  const kml = buildPhotoKml(project, photos);
  const metadata = buildMetadataJson(project, photos, features);
  const packageZip = new JSZip();
  const kmz = new JSZip();

  packageZip.file('metadata/photos.csv', csv);
  packageZip.file('metadata/metadata.json', metadata);
  packageZip.file('gis/photo-points-and-headings.kml', kml);
  kmz.file('doc.kml', kml);

  for (const photo of photos) {
    if (photo.imageBlob) {
      packageZip.file(`photos/${sanitizeFileName(photo.id)}_${sanitizeFileName(photo.fileName)}`, photo.imageBlob);
    }
  }

  const kmzBlob = await kmz.generateAsync({ type: 'blob', mimeType: 'application/vnd.google-earth.kmz' });
  packageZip.file('gis/photo-points-and-headings.kmz', kmzBlob);

  const zipBlob = await packageZip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  downloadBlob(`FieldPhotoMapper_${safeProjectName}_Export_${dateStamp}.zip`, zipBlob);
}

export async function downloadHtmlDeliverable(
  project: Project,
  photos: FieldPhoto[],
  features: GeoFeature[]
): Promise<void> {
  const safeProjectName = sanitizeFileName(project.name);
  const dateStamp = compactDateStamp();
  const packageZip = new JSZip();
  const deliverablePhotos = photos.map((photo) => {
    const imageFileName = photo.imageBlob ? buildExportImageName(photo) : null;
    if (photo.imageBlob && imageFileName) {
      packageZip.file(`images/${imageFileName}`, photo.imageBlob);
    }

    return {
      id: photo.id,
      fileName: photo.fileName,
      imagePath: imageFileName ? `images/${imageFileName}` : null,
      latitude: photo.latitude ?? null,
      longitude: photo.longitude ?? null,
      headingDegreesAuto: photo.headingDegreesAuto ?? null,
      headingDegreesManual: photo.headingDegreesManual ?? null,
      headingUsed: photo.headingUsed ?? null,
      note: photo.note,
      savedAt: photo.savedAt,
      nearestFeature: photo.nearestFeature ?? null
    };
  });

  const deliverableData = {
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      notes: project.notes,
      defaultLatitude: project.defaultLatitude,
      defaultLongitude: project.defaultLongitude
    },
    photos: deliverablePhotos,
    features: features.map((feature) => ({
      id: feature.id,
      name: feature.name,
      geometryType: feature.geometryType,
      geometry: feature.geometry,
      sourceFileName: feature.sourceFileName
    }))
  };

  packageZip.file('field-photo-map.html', buildStandaloneHtml(deliverableData));
  packageZip.file('metadata/photos.csv', buildPhotoCsv(project, photos));
  packageZip.file('metadata/metadata.json', JSON.stringify(deliverableData, null, 2));

  const zipBlob = await packageZip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  downloadBlob(`FieldPhotoMapper_${safeProjectName}_HTML_Deliverable_${dateStamp}.zip`, zipBlob);
}

export function downloadTextFile(fileName: string, text: string, mimeType = 'text/plain;charset=utf-8'): void {
  downloadBlob(fileName, new Blob([text], { type: mimeType }));
}

export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildExportImageName(photo: FieldPhoto): string {
  const extension = readImageExtension(photo);
  const baseName = photo.fileName.replace(/\.[a-z0-9]+$/i, '');
  return `${sanitizeFileName(photo.id)}_${sanitizeFileName(baseName)}${extension}`;
}

function readImageExtension(photo: FieldPhoto): string {
  const fileExtension = photo.fileName.match(/\.[a-z0-9]+$/i)?.[0];
  if (fileExtension) {
    return fileExtension.toLowerCase();
  }

  const mimeExtension: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };

  return mimeExtension[photo.mimeType] ?? '.jpg';
}

function buildStandaloneHtml(data: unknown): string {
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Field Photo Map Deliverable</title>
  <style>
    :root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17211c;background:#f5f8f6;--green:#0f5132;--orange:#e85d2a;--muted:#66736d;--border:#d9e3dc}
    *{box-sizing:border-box} body{margin:0;background:#f5f8f6;color:#17211c} button,input,textarea{font:inherit} button:disabled,input:disabled,textarea:disabled{cursor:not-allowed;opacity:.62}
    .shell{min-height:100vh;display:grid;grid-template-columns:minmax(280px,360px) minmax(0,1fr) minmax(310px,420px)}
    .panel{background:#fff;border-right:1px solid var(--border);padding:16px;overflow:auto}.right{border-left:1px solid var(--border);border-right:0}
    .brand{display:flex;align-items:center;gap:10px;margin-bottom:16px}.mark{width:38px;height:38px;border-radius:8px;background:#f6a21a;display:grid;place-items:center;font-weight:900}
    h1,h2,h3,p{margin-top:0} h1{font-size:20px;margin-bottom:2px} h2{font-size:16px} h3{font-size:14px}.muted{color:var(--muted);font-size:13px;line-height:1.45}
    .map-wrap{position:relative;min-height:100vh;padding:18px;background:#edf3ef}.map-card{height:calc(100vh - 36px);min-height:520px;border:1px solid var(--border);border-radius:8px;background:#d7e9d8;overflow:hidden;box-shadow:0 18px 45px rgba(26,47,36,.12)}
    svg{width:100%;height:100%;display:block}.grid-line{stroke:rgba(255,255,255,.62);stroke-width:1}.feature-line{stroke:#2563eb;stroke-width:3;fill:none}.feature-poly{stroke:#12745b;stroke-width:2;fill:rgba(18,116,91,.14)}.feature-point{fill:#f59f00;stroke:#0f5132;stroke-width:2}
    .cone{fill:rgba(232,93,42,.24);stroke:#e85d2a;stroke-width:2}.cone.selected{fill:rgba(15,81,50,.28);stroke:#0f5132;stroke-width:3}.marker{cursor:pointer}.marker circle{fill:#e85d2a;stroke:#fff;stroke-width:4}.marker text{font-size:12px;font-weight:900;fill:#fff;text-anchor:middle;dominant-baseline:central;pointer-events:none}
    .photo-list{display:grid;gap:8px}.photo-row{width:100%;display:grid;grid-template-columns:54px 1fr;gap:10px;align-items:center;text-align:left;border:1px solid var(--border);border-radius:8px;background:#f8fafc;padding:8px;cursor:pointer}.photo-row.selected{border-color:#0f5132;background:#eef9f0}.thumb{width:54px;height:42px;border-radius:6px;object-fit:cover;background:#edf2ee}
    .toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.btn{min-height:38px;border:1px solid var(--border);border-radius:8px;background:#e9f4ed;color:#0f5132;font-weight:800;padding:0 12px;cursor:pointer}.btn.primary{background:#0f5132;color:white}.btn.danger{background:#fff1ef;color:#b42318}.field{display:grid;gap:6px;margin:12px 0}.field span{font-size:12px;font-weight:800;color:#2d3d34}.field input,.field textarea{width:100%;border:1px solid #b8c9bd;border-radius:8px;padding:9px 10px;background:#fff}.field input[type=range]{padding:0}.preview{width:100%;max-height:280px;border-radius:8px;object-fit:contain;background:#edf2ee;border:1px solid var(--border)}.compass{height:150px;border:1px solid var(--border);border-radius:8px;display:grid;place-items:center;background:#f8fafc;position:relative}.needle{width:6px;height:58px;background:#e85d2a;border-radius:999px;transform-origin:50% 100%;position:absolute;bottom:75px}.needle:after{content:"";position:absolute;top:-7px;left:-7px;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:14px solid #e85d2a}.value{font-size:28px;font-weight:900;color:#0f5132;margin-top:78px}
    .save-state{font-size:12px;color:#0f5132;font-weight:800}.empty{border:1px dashed #b8c9bd;border-radius:8px;padding:18px;text-align:center;color:#66736d;background:#f8fafc}.view-only .right{opacity:.92}
    @media(max-width:980px){.shell{grid-template-columns:1fr}.map-wrap{min-height:auto}.map-card{height:72vh;min-height:420px}.right{border-left:0;border-top:1px solid var(--border)}}
  </style>
</head>
<body>
  <script id="fpm-data" type="application/json">${safeJson}</script>
  <div class="shell">
    <aside class="panel">
      <div class="brand"><div class="mark">FPM</div><div><h1 id="projectName">Field Photo Mapper</h1><p class="muted" id="exportInfo"></p></div></div>
      <div class="toolbar">
        <button class="btn primary" id="editToggle" type="button">Enter edit mode</button>
        <button class="btn" id="downloadHtml" type="button">Download edited HTML</button>
      </div>
      <p class="save-state" id="saveState">Ready</p>
      <h2>Photos</h2>
      <div class="photo-list" id="photoList"></div>
    </aside>
    <main class="map-wrap"><div class="map-card"><svg id="mapSvg" viewBox="0 0 1000 700" role="img" aria-label="Photo orientation map"></svg></div></main>
    <aside class="panel right">
      <h2 id="detailTitle">Select a photo</h2>
      <img class="preview" id="preview" alt="" hidden />
      <p class="muted" id="detailMeta"></p>
      <label class="field"><span>Heading</span><input id="headingRange" type="range" min="0" max="359" value="0" /></label>
      <label class="field"><span>Manual value</span><input id="headingNumber" type="number" min="0" max="359" step="1" value="0" /></label>
      <div class="compass"><span class="needle" id="needle"></span><strong class="value" id="headingValue">0 deg</strong></div>
      <label class="field"><span>Note</span><textarea id="note" rows="5"></textarea></label>
      <div class="toolbar">
        <button class="btn" id="rotateLeft" type="button">-5 deg</button>
        <button class="btn" id="rotateRight" type="button">+5 deg</button>
        <button class="btn primary" id="savePhoto" type="button">Save orientation</button>
      </div>
    </aside>
  </div>
  <script>
    const originalData = JSON.parse(document.getElementById('fpm-data').textContent);
    const storeKey = 'field-photo-map:' + originalData.project.id + ':' + originalData.exportedAt;
    let data = originalData;
    try {
      data = JSON.parse(localStorage.getItem(storeKey) || 'null') || originalData;
    } catch (error) {
      data = originalData;
    }
    let selectedId = data.photos[0] ? data.photos[0].id : null;
    let editMode = false;
    const mapSvg = document.getElementById('mapSvg');
    const photoList = document.getElementById('photoList');
    const headingRange = document.getElementById('headingRange');
    const headingNumber = document.getElementById('headingNumber');
    const headingValue = document.getElementById('headingValue');
    const needle = document.getElementById('needle');
    const note = document.getElementById('note');
    const preview = document.getElementById('preview');
    const detailTitle = document.getElementById('detailTitle');
    const detailMeta = document.getElementById('detailMeta');
    const saveState = document.getElementById('saveState');
    const editToggle = document.getElementById('editToggle');
    const rotateLeft = document.getElementById('rotateLeft');
    const rotateRight = document.getElementById('rotateRight');
    const savePhoto = document.getElementById('savePhoto');
    document.getElementById('projectName').textContent = data.project.name;
    document.getElementById('exportInfo').textContent = 'Exported ' + new Date(data.exportedAt).toLocaleString();

    function locatedPhotos(){ return data.photos.filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)); }
    function allCoordinates(){
      const coords = locatedPhotos().map((p) => [p.longitude, p.latitude]);
      for (const feature of data.features || []) collectGeometry(feature.geometry, coords);
      if (!coords.length) coords.push([data.project.defaultLongitude || 0, data.project.defaultLatitude || 0]);
      return coords;
    }
    function collectGeometry(geometry, coords){
      if (!geometry) return;
      if (geometry.type === 'Point') coords.push(geometry.coordinates);
      if (geometry.type === 'MultiPoint' || geometry.type === 'LineString') coords.push(...geometry.coordinates);
      if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') geometry.coordinates.forEach((part) => coords.push(...part));
      if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach((poly) => poly.forEach((ring) => coords.push(...ring)));
      if (geometry.type === 'GeometryCollection') geometry.geometries.forEach((child) => collectGeometry(child, coords));
    }
    function bounds(){
      const coords = allCoordinates();
      let minLon = Math.min(...coords.map((c) => c[0]));
      let maxLon = Math.max(...coords.map((c) => c[0]));
      let minLat = Math.min(...coords.map((c) => c[1]));
      let maxLat = Math.max(...coords.map((c) => c[1]));
      if (minLon === maxLon) { minLon -= .001; maxLon += .001; }
      if (minLat === maxLat) { minLat -= .001; maxLat += .001; }
      return { minLon, maxLon, minLat, maxLat };
    }
    function project(lon, lat){
      const b = bounds();
      const pad = 70;
      return {
        x: pad + ((lon - b.minLon) / (b.maxLon - b.minLon)) * (1000 - pad * 2),
        y: 700 - pad - ((lat - b.minLat) / (b.maxLat - b.minLat)) * (700 - pad * 2)
      };
    }
    function conePath(photo){
      const origin = project(photo.longitude, photo.latitude);
      const heading = Number(photo.headingUsed ?? photo.headingDegreesManual ?? photo.headingDegreesAuto ?? 0);
      const length = 112;
      const half = 29;
      const points = [];
      for (let i = 0; i <= 14; i += 1) {
        const degrees = heading - half + (half * 2 * i) / 14;
        const rad = degrees * Math.PI / 180;
        points.push({ x: origin.x + Math.sin(rad) * length, y: origin.y - Math.cos(rad) * length });
      }
      return 'M ' + origin.x + ' ' + origin.y + ' L ' + points.map((p) => p.x + ' ' + p.y).join(' L ') + ' Z';
    }
    function featureSvg(feature){
      return geometrySvg(feature.geometry, feature.name || 'Feature');
    }
    function geometrySvg(g, name){
      if (!g) return '';
      if (g.type === 'Point') {
        const p = project(g.coordinates[0], g.coordinates[1]);
        return '<circle class="feature-point" cx="' + p.x + '" cy="' + p.y + '" r="6"><title>' + escapeHtml(name) + '</title></circle>';
      }
      if (g.type === 'MultiPoint') return g.coordinates.map((coordinates) => geometrySvg({ type: 'Point', coordinates }, name)).join('');
      if (g.type === 'LineString') return '<polyline class="feature-line" points="' + g.coordinates.map((c) => { const p = project(c[0], c[1]); return p.x + ',' + p.y; }).join(' ') + '"></polyline>';
      if (g.type === 'MultiLineString') return g.coordinates.map((coordinates) => geometrySvg({ type: 'LineString', coordinates }, name)).join('');
      if (g.type === 'Polygon') return g.coordinates.map((ring) => '<polygon class="feature-poly" points="' + ring.map((c) => { const p = project(c[0], c[1]); return p.x + ',' + p.y; }).join(' ') + '"></polygon>').join('');
      if (g.type === 'MultiPolygon') return g.coordinates.map((coordinates) => geometrySvg({ type: 'Polygon', coordinates }, name)).join('');
      if (g.type === 'GeometryCollection') return g.geometries.map((geometry) => geometrySvg(geometry, name)).join('');
      return '';
    }
    function renderMap(){
      const grid = Array.from({length:12},(_,i)=>'<line class="grid-line" x1="'+(i*90)+'" y1="0" x2="'+(i*90)+'" y2="700"></line><line class="grid-line" x1="0" y1="'+(i*70)+'" x2="1000" y2="'+(i*70)+'"></line>').join('');
      const features = (data.features || []).map(featureSvg).join('');
      const cones = locatedPhotos().map((photo) => '<path class="cone '+(photo.id===selectedId?'selected':'')+'" d="'+conePath(photo)+'"></path>').join('');
      const markers = locatedPhotos().map((photo, index) => { const p = project(photo.longitude, photo.latitude); return '<g class="marker" data-id="'+photo.id+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="15"></circle><text x="'+p.x+'" y="'+p.y+'">'+(index+1)+'</text></g>'; }).join('');
      mapSvg.innerHTML = grid + features + cones + markers;
      mapSvg.querySelectorAll('.marker').forEach((marker) => marker.addEventListener('click', () => selectPhoto(marker.dataset.id)));
    }
    function renderList(){
      photoList.innerHTML = data.photos.map((photo) => {
        const thumb = photo.imagePath ? '<img class="thumb" src="'+photo.imagePath+'" alt="">' : '<span class="thumb"></span>';
        return '<button class="photo-row '+(photo.id===selectedId?'selected':'')+'" data-id="'+photo.id+'" type="button">'+thumb+'<span><strong>'+escapeHtml(photo.fileName)+'</strong><br><small>'+formatCoord(photo.latitude)+', '+formatCoord(photo.longitude)+' - '+Math.round(photo.headingUsed || 0)+' deg</small></span></button>';
      }).join('') || '<div class="empty">No photos in this export.</div>';
      photoList.querySelectorAll('.photo-row').forEach((row) => row.addEventListener('click', () => selectPhoto(row.dataset.id)));
    }
    function selectPhoto(id){
      selectedId = id;
      const photo = data.photos.find((candidate) => candidate.id === selectedId);
      if (!photo) return;
      const heading = normalize(photo.headingUsed ?? photo.headingDegreesManual ?? photo.headingDegreesAuto ?? 0);
      headingRange.value = heading;
      headingNumber.value = heading;
      headingValue.textContent = Math.round(heading) + ' deg';
      needle.style.transform = 'rotate(' + heading + 'deg)';
      note.value = photo.note || '';
      detailTitle.textContent = photo.fileName;
      detailMeta.textContent = formatCoord(photo.latitude) + ', ' + formatCoord(photo.longitude) + (photo.nearestFeature ? ' - nearest: ' + photo.nearestFeature.featureName : '');
      if (photo.imagePath) { preview.src = photo.imagePath; preview.hidden = false; } else { preview.hidden = true; }
      renderMap(); renderList();
    }
    function setHeading(value){
      if (!editMode) return;
      const heading = normalize(Number(value) || 0);
      headingRange.value = heading; headingNumber.value = heading; headingValue.textContent = Math.round(heading) + ' deg';
      needle.style.transform = 'rotate(' + heading + 'deg)';
      const photo = data.photos.find((candidate) => candidate.id === selectedId);
      if (photo) { photo.headingDegreesManual = heading; photo.headingUsed = heading; renderMap(); }
    }
    function saveCurrent(){
      const photo = data.photos.find((candidate) => candidate.id === selectedId);
      if (!photo) return;
      photo.note = note.value;
      persistState();
      renderList();
    }
    function persistState(){
      localStorage.setItem(storeKey, JSON.stringify(data));
      saveState.textContent = 'Saved locally ' + new Date().toLocaleTimeString();
    }
    function downloadEditedHtml(){
      const photo = data.photos.find((candidate) => candidate.id === selectedId);
      if (photo && editMode) photo.note = note.value;
      persistState();
      const source = '<!doctype html>\\n' + document.documentElement.outerHTML;
      const json = JSON.stringify(data).replace(/</g, '\\\\u003c');
      const updated = source.replace(/<script id="fpm-data" type="application\\/json">[\\s\\S]*?<\\/script>/, '<script id="fpm-data" type="application/json">' + json + '<\\/script>');
      const blob = new Blob([updated], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'field-photo-map-edited.html'; anchor.click();
      URL.revokeObjectURL(url);
    }
    function updateEditMode(){
      document.body.classList.toggle('view-only', !editMode);
      editToggle.textContent = editMode ? 'Exit edit mode' : 'Enter edit mode';
      [headingRange, headingNumber, note, rotateLeft, rotateRight, savePhoto].forEach((control) => {
        control.disabled = !editMode;
      });
      saveState.textContent = editMode ? 'Edit mode active' : 'View mode';
    }
    function normalize(value){ return ((Number(value) % 360) + 360) % 360; }
    function formatCoord(value){ return Number.isFinite(value) ? Number(value).toFixed(6) : 'missing'; }
    function escapeHtml(value){ return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }
    headingRange.addEventListener('input', (event) => setHeading(event.target.value));
    headingNumber.addEventListener('input', (event) => setHeading(event.target.value));
    rotateLeft.addEventListener('click', () => setHeading(Number(headingRange.value) - 5));
    rotateRight.addEventListener('click', () => setHeading(Number(headingRange.value) + 5));
    savePhoto.addEventListener('click', saveCurrent);
    document.getElementById('downloadHtml').addEventListener('click', downloadEditedHtml);
    editToggle.addEventListener('click', () => { editMode = !editMode; updateEditMode(); });
    updateEditMode(); renderMap(); renderList(); if (selectedId) selectPhoto(selectedId);
  </script>
</body>
</html>`;
}
