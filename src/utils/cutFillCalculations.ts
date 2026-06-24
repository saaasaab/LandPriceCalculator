import classifyPoint from 'robust-point-in-polygon';

export type BoundaryPoint = { x: number; y: number };

export type CutFillWorkflowStep =
  | 'upload'
  | 'boundary'
  | 'corners'
  | 'contours'
  | 'terrain'
  | 'cutfill';

export type BoundaryCorner = BoundaryPoint & { elevationFt: number };

export type ContourLine = {
  id: string;
  points: BoundaryPoint[];
  elevationFt: number;
};

export type CutFillTotals = {
  cutCuYd: number;
  fillCuYd: number;
  netCuYd: number;
  triangleCount: number;
  propertyAreaSqFt: number;
};

export function boundaryEdgeLength(boundary: BoundaryPoint[], edgeIndex: number): number {
  const start = boundary[edgeIndex];
  const end = boundary[(edgeIndex + 1) % boundary.length];
  return Math.hypot(end.x - start.x, end.y - start.y);
}

export function computeFtPerPixel(boundary: BoundaryPoint[], edgeIndex: number, lengthFt: number): number {
  const pixelLen = boundaryEdgeLength(boundary, edgeIndex);
  if (pixelLen < 0.001 || lengthFt <= 0) return 0;
  return lengthFt / pixelLen;
}

export function pixelToFeet(point: BoundaryPoint, ftPerPixel: number): BoundaryPoint {
  return { x: point.x * ftPerPixel, y: point.y * ftPerPixel };
}

export function distancePointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq < 1e-10) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export function getBoundaryBounds(boundary: BoundaryPoint[]) {
  const xs = boundary.map((p) => p.x);
  const ys = boundary.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX || 1,
    height: maxY - minY || 1,
  };
}

export function calculateBoundaryAreaSqFt(boundary: BoundaryPoint[], ftPerPixel: number): number {
  if (boundary.length < 3 || ftPerPixel <= 0) return 0;
  let total = 0;
  for (let i = 0; i < boundary.length; i++) {
    const next = (i + 1) % boundary.length;
    total += boundary[i].x * boundary[next].y - boundary[next].x * boundary[i].y;
  }
  const areaSqPixels = Math.abs(total / 2);
  return areaSqPixels * ftPerPixel * ftPerPixel;
}

export function isInsideBoundary(boundary: BoundaryPoint[], x: number, y: number): boolean {
  if (boundary.length < 3) return false;
  const poly = boundary.map((p) => [p.x, p.y] as [number, number]);
  return classifyPoint(poly, [x, y]) < 0;
}

export function formatCuYd(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function boundaryToFeet(boundary: BoundaryPoint[], ftPerPixel: number): BoundaryPoint[] {
  return boundary.map((p) => pixelToFeet(p, ftPerPixel));
}

export function cornersFromBoundary(boundary: BoundaryPoint[], defaultElev = 100): BoundaryCorner[] {
  return boundary.map((p) => ({ ...p, elevationFt: defaultElev }));
}
