import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Project, ProjectStats } from '../models/Project';
import {
  createProject as createProjectRecord,
  deleteProject,
  ensureDefaultProject,
  getActiveProjectId,
  getProjectStats,
  listProjects,
  setActiveProjectId
} from '../services/storageService';

const provisionalProject: Project = {
  id: 'project_default_pending',
  name: 'Default Field Project',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  defaultLatitude: 29.7604,
  defaultLongitude: -95.3698,
  notes: 'Starter project used while local storage initializes.'
};

const emptyStats: ProjectStats = {
  photoCount: 0,
  locatedPhotoCount: 0,
  importedFileCount: 0,
  featureCount: 0
};

interface CreateProjectInput {
  name: string;
  defaultLatitude?: number;
  defaultLongitude?: number;
  notes?: string;
}

interface ActiveProjectContextValue {
  activeProject?: Project;
  activeProjectStats?: ProjectStats;
  projects: Project[];
  statsByProject: Record<string, ProjectStats>;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  openProject: (projectId: string) => void;
  removeProject: (projectId: string) => Promise<void>;
}

const ActiveProjectContext = createContext<ActiveProjectContextValue | undefined>(undefined);

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([provisionalProject]);
  const [statsByProject, setStatsByProject] = useState<Record<string, ProjectStats>>({
    [provisionalProject.id]: emptyStats
  });
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    getActiveProjectId() ?? provisionalProject.id
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const ensuredProject = await ensureDefaultProject();
      const loadedProjects = await listProjects();
      const nextActiveProjectId = getActiveProjectId() ?? ensuredProject.id;
      const statsEntries = await Promise.all(
        loadedProjects.map(async (project) => [project.id, await getProjectStats(project.id)] as const)
      );

      setProjects(loadedProjects);
      setStatsByProject(Object.fromEntries(statsEntries));
      setActiveProjectIdState(nextActiveProjectId);
    } catch (error) {
      console.error('Unable to initialize IndexedDB project state.', error);
      setProjects([provisionalProject]);
      setStatsByProject({ [provisionalProject.id]: emptyStats });
      setActiveProjectIdState(provisionalProject.id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId, projects]
  );

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      const project = await createProjectRecord(input);
      await refreshProjects();
      return project;
    },
    [refreshProjects]
  );

  const openProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setActiveProjectIdState(projectId);
  }, []);

  const removeProject = useCallback(
    async (projectId: string) => {
      await deleteProject(projectId);
      await refreshProjects();
    },
    [refreshProjects]
  );

  const value = useMemo<ActiveProjectContextValue>(
    () => ({
      activeProject,
      activeProjectStats: activeProject ? statsByProject[activeProject.id] : undefined,
      projects,
      statsByProject,
      isLoading,
      refreshProjects,
      createProject,
      openProject,
      removeProject
    }),
    [
      activeProject,
      createProject,
      isLoading,
      openProject,
      projects,
      refreshProjects,
      removeProject,
      statsByProject
    ]
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject() {
  const value = useContext(ActiveProjectContext);
  if (!value) {
    throw new Error('useActiveProject must be used inside ActiveProjectProvider.');
  }
  return value;
}
