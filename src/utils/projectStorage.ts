import { EPageNames } from './types';
import { DEFAULT_VALUES } from './constants';

export type SavedProjectSummary = {
  id: string;
  page: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedProject = SavedProjectSummary & {
  inputs: Record<string, unknown>;
};

const getProjectsCacheKey = (page: EPageNames): string => {
  try {
    const storedUser = localStorage.getItem('user');
    const email = storedUser ? JSON.parse(storedUser)?.email : null;
    return `lpc-project-summaries:${email ?? 'anonymous'}:${page}`;
  } catch {
    return `lpc-project-summaries:anonymous:${page}`;
  }
};

export const readProjectsCache = (page: EPageNames): SavedProjectSummary[] | null => {
  try {
    const raw = sessionStorage.getItem(getProjectsCacheKey(page));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeProjectsCache = (page: EPageNames, projects: SavedProjectSummary[]): void => {
  sessionStorage.setItem(getProjectsCacheKey(page), JSON.stringify(projects));
};

export const toProjectSummary = (project: SavedProject | SavedProjectSummary): SavedProjectSummary => ({
  id: project.id,
  page: project.page,
  title: project.title,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

export const collectPageInputs = (page: EPageNames): Record<string, unknown> => {
  const defaults = DEFAULT_VALUES[page] ?? {};
  const inputs: Record<string, unknown> = {};

  for (const key of Object.keys(defaults)) {
    const storageKey = `${page}_${key}`;
    const stored = localStorage.getItem(storageKey);

    if (stored !== null) {
      try {
        inputs[key] = JSON.parse(stored);
      } catch {
        inputs[key] = defaults[key as keyof typeof defaults];
      }
    } else {
      inputs[key] = defaults[key as keyof typeof defaults];
    }
  }

  return inputs;
};

export const applyPageInputs = (page: EPageNames, inputs: Record<string, unknown>): void => {
  for (const [key, value] of Object.entries(inputs)) {
    localStorage.setItem(`${page}_${key}`, JSON.stringify(value));
  }
};

export const formatProjectDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
