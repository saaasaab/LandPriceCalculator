import type { BoundaryPoint } from './siteMapCalculations';

export type TopoBaseStep = 'upload' | 'boundary';

export type TopoWorkflowStepConfig<T extends string = string> = {
  id: T;
  label: string;
  description: string;
};

export type TopoDigitizationSnapshot<TStep extends string = TopoBaseStep> = {
  step: TStep;
  boundary: BoundaryPoint[];
  boundaryClosed: boolean;
  ftPerPixel: number | null;
};

export function isScaleDefined(ftPerPixel: number | null): boolean {
  return ftPerPixel !== null && ftPerPixel > 0;
}

export function canProceedToScale(boundary: BoundaryPoint[], boundaryClosed: boolean): boolean {
  return boundaryClosed && boundary.length >= 3;
}

export function canProceedFromBoundary(
  boundary: BoundaryPoint[],
  boundaryClosed: boolean,
  ftPerPixel: number | null,
): boolean {
  return boundaryClosed && boundary.length >= 3 && isScaleDefined(ftPerPixel);
}

export function canReachTopoBaseStep(
  target: TopoBaseStep,
  imageUrl: string | null,
  canProceed: boolean,
): boolean {
  if (target === 'upload') return true;
  if (target === 'boundary') return Boolean(imageUrl);
  return canProceed;
}

export function mapToBoundaryCanvasStep(step: string): 'upload' | 'boundary' {
  return step === 'upload' ? 'upload' : 'boundary';
}
