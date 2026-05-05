import { FolderKanban, MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveProject } from '../app/ActiveProjectContext';
import { formatDateTime } from '../utils/dateUtils';

export function ProjectPage() {
  const {
    activeProject,
    projects,
    statsByProject,
    createProject,
    openProject,
    removeProject,
    isLoading
  } = useActiveProject();
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  async function submitProject() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage('Project name is required.');
      return;
    }

    await createProject({
      name: trimmedName,
      defaultLatitude: latitude.trim() ? Number(latitude) : undefined,
      defaultLongitude: longitude.trim() ? Number(longitude) : undefined,
      notes
    });
    setName('');
    setLatitude('');
    setLongitude('');
    setNotes('');
    setMessage('Project created and opened.');
  }

  async function deleteProject(projectId: string) {
    const project = projects.find((candidate) => candidate.id === projectId);
    const confirmed = window.confirm(
      `Delete "${project?.name ?? 'this project'}" and all local photos/imports attached to it?`
    );
    if (!confirmed) {
      return;
    }
    await removeProject(projectId);
    setMessage('Project deleted.');
  }

  return (
    <div className="project-grid">
      <section className="work-panel">
        <div className="section-title-row">
          <Plus size={20} />
          <h2>Create project</h2>
        </div>
        <div className="form-grid">
          <label className="field-control">
            <span>Project name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="North access inspection" />
          </label>
          <div className="form-grid two-column">
            <label className="field-control">
              <span>Default latitude</span>
              <input
                value={latitude}
                inputMode="decimal"
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="29.760400"
              />
            </label>
            <label className="field-control">
              <span>Default longitude</span>
              <input
                value={longitude}
                inputMode="decimal"
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="-95.369800"
              />
            </label>
          </div>
          <label className="field-control">
            <span>Notes</span>
            <textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          {message ? <p className="status-message">{message}</p> : null}
          <button className="button primary full-width" type="button" onClick={() => void submitProject()}>
            <Plus size={18} />
            Create and open
          </button>
        </div>
      </section>

      <section className="work-panel">
        <div className="section-title-row">
          <FolderKanban size={20} />
          <h2>Projects</h2>
        </div>
        {isLoading ? (
          <p className="subtle-text">Loading projects...</p>
        ) : (
          <div className="data-list project-list">
            {projects.map((project) => {
              const stats = statsByProject[project.id];
              const isActive = project.id === activeProject?.id;
              return (
                <div className={`data-row project-row ${isActive ? 'selected' : ''}`} key={project.id}>
                  <button className="project-open" type="button" onClick={() => openProject(project.id)}>
                    <MapPin size={18} />
                    <div>
                      <strong>{project.name}</strong>
                      <span>
                        {stats?.photoCount ?? 0} photos · {stats?.featureCount ?? 0} features ·{' '}
                        {formatDateTime(stats?.lastUpdatedAt ?? project.updatedAt)}
                      </span>
                    </div>
                  </button>
                  <div className="row-actions">
                    <Link className="button ghost compact-button" to="/map" onClick={() => openProject(project.id)}>
                      Open map
                    </Link>
                    <button className="icon-button danger" type="button" onClick={() => void deleteProject(project.id)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

