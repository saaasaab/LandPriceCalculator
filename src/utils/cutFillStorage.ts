import type { BoundaryCorner, BoundaryPoint, ContourLine, CutFillWorkflowStep } from './cutFillCalculations';

export const CUT_FILL_STORAGE_KEY = 'cut-fill-calculator-project';

export type CutFillSavedProject = {
  version: 1;
  step: CutFillWorkflowStep;
  boundary: BoundaryPoint[];
  boundaryClosed: boolean;
  corners: BoundaryCorner[];
  contours: ContourLine[];
  ftPerPixel: number | null;
  draftContourPoints: BoundaryPoint[];
  draftContourElev: string;
  targetElevationFt: number;
  zScaleMultiplier: number;
  savedAt: string;
};

export function saveCutFillProject(project: Omit<CutFillSavedProject, 'version' | 'savedAt'>): void {
  const payload: CutFillSavedProject = {
    version: 1,
    ...project,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(CUT_FILL_STORAGE_KEY, JSON.stringify(payload));
}

export function loadCutFillProject(): CutFillSavedProject | null {
  try {
    const raw = localStorage.getItem(CUT_FILL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CutFillSavedProject;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCutFillProject(): void {
  localStorage.removeItem(CUT_FILL_STORAGE_KEY);
}
