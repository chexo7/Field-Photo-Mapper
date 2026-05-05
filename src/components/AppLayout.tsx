import {
  Camera,
  FolderKanban,
  Home,
  Map,
  Menu,
  Settings,
  UploadCloud,
  WifiOff,
  X
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/capture', label: 'Capture', icon: Camera },
  { to: '/import', label: 'Import', icon: UploadCloud },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function AppLayout() {
  const { activeProject, activeProjectStats } = useActiveProject();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${navOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">FPM</div>
          <div>
            <p className="brand-title">Field Photo Mapper</p>
            <p className="brand-subtitle">PWA field workflow</p>
          </div>
          <button className="icon-button sidebar-close" type="button" onClick={() => setNavOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setNavOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-project">
          <p className="eyebrow">Active project</p>
          <strong>{activeProject?.name ?? 'Loading project'}</strong>
          <span>
            {activeProjectStats?.photoCount ?? 0} photos · {activeProjectStats?.featureCount ?? 0} features
          </span>
        </div>

        <div className="offline-note">
          <WifiOff size={16} />
          <span>Offline shell ready. Basemap tiles still need network unless already cached.</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="icon-button mobile-menu" type="button" onClick={() => setNavOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <p className="topbar-label">Active project</p>
            <h1>{activeProject?.name ?? 'Field Photo Mapper'}</h1>
          </div>
          <div className="topbar-stats">
            <span>{activeProjectStats?.photoCount ?? 0} photos</span>
            <span>{activeProjectStats?.featureCount ?? 0} features</span>
          </div>
        </header>
        <main className="content-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

