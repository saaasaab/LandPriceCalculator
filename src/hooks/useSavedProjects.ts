import { useCallback, useEffect, useState } from 'react';
import { deleteRequest, getRequest, postRequest, putRequest } from '../utils/api';
import {
  readProjectsCache,
  SavedProject,
  SavedProjectSummary,
  toProjectSummary,
  writeProjectsCache,
} from '../utils/projectStorage';
import { EPageNames } from '../utils/types';

type ProjectsResponse = {
  success: boolean;
  data: SavedProjectSummary[];
};

type ProjectResponse = {
  success: boolean;
  data: SavedProject;
};

const updateCache = (page: EPageNames, projects: SavedProjectSummary[]) => {
  writeProjectsCache(page, projects);
};

export const useSavedProjects = (page: EPageNames, enabled = true) => {
  const [projects, setProjects] = useState<SavedProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setProjectsAndCache = useCallback(
    (nextProjects: SavedProjectSummary[]) => {
      setProjects(nextProjects);
      updateCache(page, nextProjects);
    },
    [page],
  );

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRequest<ProjectsResponse>(
        `/land-price-calculator/projects?page=${encodeURIComponent(page)}`,
      );
      setProjectsAndCache(response.data ?? []);
    } catch {
      setError('Could not load saved projects.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, setProjectsAndCache]);

  useEffect(() => {
    if (!enabled) {
      setProjects([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const cachedProjects = readProjectsCache(page);
    if (cachedProjects) {
      setProjects(cachedProjects);
      setError(null);
      setIsLoading(false);
      return;
    }

    fetchProjects();
  }, [fetchProjects, enabled, page]);

  const loadProject = async (id: string): Promise<SavedProject> => {
    const response = await getRequest<ProjectResponse>(`/land-price-calculator/projects/${id}`);
    return response.data;
  };

  const saveProject = async (title: string, inputs: Record<string, unknown>) => {
    const response = await postRequest<ProjectResponse>('/land-price-calculator/projects', {
      title,
      page,
      inputs,
    });

    const summary = toProjectSummary(response.data);
    setProjects((current) => {
      const next = [summary, ...current];
      updateCache(page, next);
      return next;
    });
    return response.data;
  };

  const updateProject = async (
    id: string,
    data: { title: string; inputs: Record<string, unknown> },
  ) => {
    const response = await putRequest<ProjectResponse>(`/land-price-calculator/projects/${id}`, data);

    const summary = toProjectSummary(response.data);
    setProjects((current) => {
      const next = [summary, ...current.filter((project) => project.id !== id)];
      updateCache(page, next);
      return next;
    });
    return response.data;
  };

  const deleteProject = async (id: string) => {
    await deleteRequest(`/land-price-calculator/projects/${id}`);
    setProjects((current) => {
      const next = current.filter((project) => project.id !== id);
      updateCache(page, next);
      return next;
    });
  };

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    loadProject,
    saveProject,
    updateProject,
    deleteProject,
  };
};
