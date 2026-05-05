import { Navigate, Route, Routes } from 'react-router-dom';
import { ActiveProjectProvider } from './ActiveProjectContext';
import { AppLayout } from '../components/AppLayout';
import { HomePage } from '../pages/HomePage';
import { KmzImportPage } from '../pages/KmzImportPage';
import { MapPage } from '../pages/MapPage';
import { PhotoCapturePage } from '../pages/PhotoCapturePage';
import { PhotoDetailPage } from '../pages/PhotoDetailPage';
import { ProjectPage } from '../pages/ProjectPage';
import { SettingsPage } from '../pages/SettingsPage';

export function App() {
  return (
    <ActiveProjectProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="capture" element={<PhotoCapturePage />} />
          <Route path="photos/:photoId" element={<PhotoDetailPage />} />
          <Route path="import" element={<KmzImportPage />} />
          <Route path="projects" element={<ProjectPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ActiveProjectProvider>
  );
}

