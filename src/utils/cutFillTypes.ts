export type CutFillWorkflowStep =
  | 'upload'
  | 'boundary'
  | 'corners'
  | 'contours'
  | 'terrain'
  | 'cutfill';

export type CutFillTotals = {
  cutCuYd: number;
  fillCuYd: number;
  netCuYd: number;
  triangleCount: number;
  propertyAreaSqFt: number;
};

export function formatCuYd(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
