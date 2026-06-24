import type { ElevPoint } from '../../utils/cutFillTin';

export type Scene3dCamera = {
  cx: number;
  cy: number;
  minZ: number;
  xyScale: number;
  zScale: number;
};

export function computeScene3dCamera(
  points: ElevPoint[],
  zScaleMultiplier: number,
): Scene3dCamera | null {
  if (points.length === 0) return null;

  const xs = points.map((pt) => pt.x);
  const ys = points.map((pt) => pt.y);
  const zs = points.map((pt) => pt.z);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const elevRange = Math.max(maxZ - minZ, 1);
  const maxDim = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  const xyScale = 220 / maxDim;
  // 1x maps the full elevation range to ~25 scene units; 10x exaggerates vertically.
  const zScale = (25 / elevRange) * xyScale * 0.35 * zScaleMultiplier;
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    minZ,
    xyScale,
    zScale,
  };
}
/** Map feet (x, y) + elevation z to p5 WEBGL scene coords matching the 2D plan orientation. */
export function feetToScene3d(
  pt: ElevPoint,
  camera: Scene3dCamera,
): { x: number; y: number; z: number } {
  return {
    x: (pt.x - camera.cx) * camera.xyScale,
    // p5 WEBGL y-axis points down — negate so higher elevations render above lower ones.
    y: -(pt.z - camera.minZ) * camera.zScale,
    z: (pt.y - camera.cy) * camera.xyScale,
  };
}

export function defaultOrbitDistance(points: ElevPoint[]): number {
  if (points.length === 0) return 400;
  const xs = points.map((pt) => pt.x);
  const ys = points.map((pt) => pt.y);
  const maxDim = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  return Math.max(maxDim * 1.4, 280);
}
