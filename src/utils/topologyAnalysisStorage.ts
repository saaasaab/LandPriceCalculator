import type { BoundaryCorner, BoundaryPoint, ContourLine } from './siteMapCalculations';
import type { TopologyAnalysisView } from './topologyAnalysis';

export const TOPOLOGY_STORAGE_KEY = 'topology-analysis-project';

export type TopologySavedProject = {
  step: TopologyAnalysisView | 'upload' | 'boundary' | 'corners' | 'contours';
  boundary: BoundaryPoint[];
  boundaryClosed: boolean;
  corners: BoundaryCorner[];
  contours: ContourLine[];
  ftPerPixel: number | null;
  draftContourPoints: BoundaryPoint[];
  draftContourElev: string;
  targetElevationFt: number;
  zScaleMultiplier: number;
  buildableSlopePct: number;
  contourIntervalFt: number;
  savedAt: string;
};

export function saveTopologyProject(data: Omit<TopologySavedProject, 'savedAt'>) {
  const payload: TopologySavedProject = { ...data, savedAt: new Date().toISOString() };
  localStorage.setItem(TOPOLOGY_STORAGE_KEY, JSON.stringify(payload));
}

export function loadTopologyProject(): TopologySavedProject | null {
  try {
    const raw = localStorage.getItem(TOPOLOGY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TopologySavedProject;
  } catch {
    return null;
  }
}

export function clearTopologyProject() {
  localStorage.removeItem(TOPOLOGY_STORAGE_KEY);
}
