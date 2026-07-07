import { Delaunay } from 'd3-delaunay';
import type { BoundaryPoint, ContourLine } from './siteMapCalculations';
import { boundaryToFeet, calculateBoundaryAreaSqFt, isInsideBoundary } from './siteMapCalculations';
import type { CutFillTotals } from './cutFillTypes';

export type ElevPoint = { x: number; y: number; z: number };

export type TinTriangle = { a: number; b: number; c: number };

const SQFT_PER_CU_YD = 27;

export function buildElevPoints(
  boundaryPixels: BoundaryPoint[],
  corners: { elevationFt: number }[],
  contours: ContourLine[],
  ftPerPixel: number,
): ElevPoint[] {
  const boundaryFt = boundaryToFeet(boundaryPixels, ftPerPixel);
  const points: ElevPoint[] = boundaryFt.map((p, i) => ({
    x: p.x,
    y: p.y,
    z: corners[i]?.elevationFt ?? 100,
  }));

  for (const contour of contours) {
    if (contour.points.length < 2) continue;
    for (const pt of contour.points) {
      const feet = { x: pt.x * ftPerPixel, y: pt.y * ftPerPixel };
      points.push({ x: feet.x, y: feet.y, z: contour.elevationFt });
    }
  }

  return points;
}

export function triangulateSurface(
  points: ElevPoint[],
  boundaryPixels: BoundaryPoint[],
  ftPerPixel: number,
): TinTriangle[] {
  if (points.length < 3) return [];

  const boundaryFt = boundaryToFeet(boundaryPixels, ftPerPixel);
  const delaunay = Delaunay.from(points, (p) => p.x, (p) => p.y);
  const triangles: TinTriangle[] = [];

  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    const a = delaunay.triangles[i];
    const b = delaunay.triangles[i + 1];
    const c = delaunay.triangles[i + 2];
    const cx = (points[a].x + points[b].x + points[c].x) / 3;
    const cy = (points[a].y + points[b].y + points[c].y) / 3;
    if (isInsideBoundary(boundaryFt, cx, cy)) {
      triangles.push({ a, b, c });
    }
  }

  return triangles;
}

function triangleArea2D(p1: ElevPoint, p2: ElevPoint, p3: ElevPoint) {
  return Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;
}

export function calculateTinCutFill(
  points: ElevPoint[],
  triangles: TinTriangle[],
  targetElevFt: number,
  boundaryPixels: BoundaryPoint[],
  ftPerPixel: number,
): CutFillTotals {
  let cutCuFt = 0;
  let fillCuFt = 0;

  for (const tri of triangles) {
    const p1 = points[tri.a];
    const p2 = points[tri.b];
    const p3 = points[tri.c];
    const area = triangleArea2D(p1, p2, p3);
    const avgExisting = (p1.z + p2.z + p3.z) / 3;
    const delta = avgExisting - targetElevFt;

    if (delta > 0) cutCuFt += area * delta;
    else fillCuFt += area * (-delta);
  }

  return {
    cutCuYd: cutCuFt / SQFT_PER_CU_YD,
    fillCuYd: fillCuFt / SQFT_PER_CU_YD,
    netCuYd: (cutCuFt - fillCuFt) / SQFT_PER_CU_YD,
    triangleCount: triangles.length,
    propertyAreaSqFt: calculateBoundaryAreaSqFt(boundaryPixels, ftPerPixel),
  };
}

export function triangleCutFillDelta(points: ElevPoint[], tri: TinTriangle, targetElevFt: number) {
  const p1 = points[tri.a];
  const p2 = points[tri.b];
  const p3 = points[tri.c];
  return (p1.z + p2.z + p3.z) / 3 - targetElevFt;
}

function barycentricElevation(
  x: number,
  y: number,
  a: ElevPoint,
  b: ElevPoint,
  c: ElevPoint,
  eps = -1e-8,
): number | null {
  const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  if (Math.abs(denom) < 1e-12) return null;

  const wA = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / denom;
  const wB = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / denom;
  const wC = 1 - wA - wB;

  if (wA < eps || wB < eps || wC < eps) return null;
  return wA * a.z + wB * b.z + wC * c.z;
}

export function sampleTinElevation(
  x: number,
  y: number,
  points: ElevPoint[],
  triangles: TinTriangle[],
  boundaryEpsilon = 0,
): number | null {
  const eps = boundaryEpsilon > 0 ? -boundaryEpsilon : -1e-8;
  for (const tri of triangles) {
    const z = barycentricElevation(x, y, points[tri.a], points[tri.b], points[tri.c], eps);
    if (z !== null) return z;
  }
  return null;
}

function elevationAlongPolyline(
  x: number,
  y: number,
  verticesFt: { x: number; y: number }[],
  vertexZs: number[],
  closed: boolean,
): number {
  const n = verticesFt.length;
  const edgeCount = closed ? n : n - 1;
  let bestDist = Infinity;
  let bestZ = vertexZs[0] ?? 0;

  for (let i = 0; i < edgeCount; i++) {
    const p0 = verticesFt[i];
    const p1 = verticesFt[(i + 1) % n];
    const z0 = vertexZs[i] ?? bestZ;
    const z1 = vertexZs[(i + 1) % n] ?? bestZ;
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const lenSq = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - p0.x) * dx + (y - p0.y) * dy) / lenSq));
    const px = p0.x + t * dx;
    const py = p0.y + t * dy;
    const dist = Math.hypot(x - px, y - py);
    if (dist < bestDist) {
      bestDist = dist;
      bestZ = z0 + t * (z1 - z0);
    }
  }

  return bestZ;
}

/** Subdivide a plan-view polyline and sample Z from the TIN at each point. */
export function drapePolylineOnTin(
  verticesFt: { x: number; y: number }[],
  tinPoints: ElevPoint[],
  triangles: TinTriangle[],
  closed: boolean,
  segmentsPerEdge = 20,
  vertexZs?: number[],
): ElevPoint[] {
  if (verticesFt.length < 2 || triangles.length === 0) return [];

  const zs =
    vertexZs ??
    verticesFt.map((v) => sampleTinElevation(v.x, v.y, tinPoints, triangles, 0.02) ?? tinPoints[0]?.z ?? 0);

  const sampleOr = (x: number, y: number) => {
    const onSurface = sampleTinElevation(x, y, tinPoints, triangles, 0.02);
    if (onSurface !== null) return onSurface;
    return elevationAlongPolyline(x, y, verticesFt, zs, closed);
  };

  const out: ElevPoint[] = [];
  const n = verticesFt.length;
  const edgeCount = closed ? n : n - 1;

  for (let i = 0; i < edgeCount; i++) {
    const p0 = verticesFt[i];
    const p1 = verticesFt[(i + 1) % n];
    const steps = segmentsPerEdge;

    for (let s = 0; s < steps; s++) {
      if (i > 0 && s === 0) continue;
      const t = s / steps;
      const x = p0.x + (p1.x - p0.x) * t;
      const y = p0.y + (p1.y - p0.y) * t;
      out.push({ x, y, z: sampleOr(x, y) });
    }
  }

  if (closed) {
    const start = verticesFt[0];
    out.push({ x: start.x, y: start.y, z: sampleOr(start.x, start.y) });
  } else {
    const last = verticesFt[n - 1];
    out.push({ x: last.x, y: last.y, z: sampleOr(last.x, last.y) });
  }

  return out;
}
