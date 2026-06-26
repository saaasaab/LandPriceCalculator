import type { BoundaryPoint } from './cutFillCalculations';
import { boundaryToFeet, calculateBoundaryAreaSqFt, isInsideBoundary } from './cutFillCalculations';
import type { ElevPoint, TinTriangle } from './cutFillTin';
import { sampleTinElevation } from './cutFillTin';

export type TopologySetupStep = 'upload' | 'boundary' | 'corners' | 'contours';

export type TopologyAnalysisView =
  | 'overview'
  | 'terrain3d'
  | 'elevation'
  | 'slope'
  | 'aspect'
  | 'hillshade'
  | 'buildable'
  | 'drainage'
  | 'generated-contours'
  | 'cutfill';

export type TopologyWorkflowStep = TopologySetupStep | TopologyAnalysisView;

export type TerrainGridCell = {
  xFt: number;
  yFt: number;
  elevationFt: number | null;
  slopePct: number | null;
  aspectDeg: number | null;
};

export type DevelopmentMetrics = {
  grossAcres: number;
  netBuildableAcres: number;
  netBuildablePct: number;
  avgSlopePct: number;
  medianSlopePct: number;
  maxSlopePct: number;
  elevationMinFt: number;
  elevationMaxFt: number;
  elevationRangeFt: number;
  highestPoint: { xFt: number; yFt: number; zFt: number };
  lowestPoint: { xFt: number; yFt: number; zFt: number };
  steepSlopePct: number;
  flatAreaPct: number;
  triangleCount: number;
  pointCount: number;
};

export type FlatPad = {
  id: string;
  slopeThresholdPct: number;
  areaSqFt: number;
  areaAcres: number;
  pctOfSite: number;
  centroid: { xFt: number; yFt: number };
};

export type DealKillerCheck = {
  id: string;
  label: string;
  triggered: boolean;
  severity: 'warning' | 'info';
  detail: string;
};

export type SiteScoreCategory = {
  id: string;
  label: string;
  score: number;
  note: string;
};

export type SiteScores = {
  categories: SiteScoreCategory[];
  overall: number;
};

export type DrainagePath = {
  points: { xFt: number; yFt: number }[];
};

export type GeneratedContour = {
  elevationFt: number;
  segments: { x1: number; y1: number; x2: number; y2: number }[];
};

const SQFT_PER_ACRE = 43560;

function sampleSlopeAspect(
  xFt: number,
  yFt: number,
  points: ElevPoint[],
  triangles: TinTriangle[],
  sampleDistFt: number,
): { slopePct: number | null; aspectDeg: number | null } {
  const z = sampleTinElevation(xFt, yFt, points, triangles, 0.02);
  const zx = sampleTinElevation(xFt + sampleDistFt, yFt, points, triangles, 0.02);
  const zy = sampleTinElevation(xFt, yFt + sampleDistFt, points, triangles, 0.02);
  if (z === null || zx === null || zy === null) return { slopePct: null, aspectDeg: null };

  const dzdx = (zx - z) / sampleDistFt;
  const dzdy = (zy - z) / sampleDistFt;
  const slopeRatio = Math.hypot(dzdx, dzdy);
  const slopePct = slopeRatio * 100;
  let aspectDeg = (Math.atan2(dzdx, dzdy) * 180) / Math.PI;
  if (aspectDeg < 0) aspectDeg += 360;
  return { slopePct, aspectDeg };
}

export function buildTerrainGrid(
  boundaryPixels: BoundaryPoint[],
  ftPerPixel: number,
  points: ElevPoint[],
  triangles: TinTriangle[],
  gridStepFt = 8,
): TerrainGridCell[] {
  if (boundaryPixels.length < 3 || triangles.length === 0) return [];

  const boundaryFt = boundaryToFeet(boundaryPixels, ftPerPixel);
  const xs = boundaryFt.map((p) => p.x);
  const ys = boundaryFt.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const sampleDist = Math.max(gridStepFt * 0.5, 2);
  const cells: TerrainGridCell[] = [];

  for (let xFt = minX; xFt <= maxX; xFt += gridStepFt) {
    for (let yFt = minY; yFt <= maxY; yFt += gridStepFt) {
      if (!isInsideBoundary(boundaryFt, xFt, yFt)) continue;
      const elevationFt = sampleTinElevation(xFt, yFt, points, triangles, 0.02);
      if (elevationFt === null) continue;
      const { slopePct, aspectDeg } = sampleSlopeAspect(xFt, yFt, points, triangles, sampleDist);
      cells.push({ xFt, yFt, elevationFt, slopePct, aspectDeg });
    }
  }

  return cells;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computeDevelopmentMetrics(
  boundaryPixels: BoundaryPoint[],
  ftPerPixel: number,
  points: ElevPoint[],
  triangles: TinTriangle[],
  grid: TerrainGridCell[],
  buildableSlopePct = 15,
): DevelopmentMetrics {
  const grossSqFt = calculateBoundaryAreaSqFt(boundaryPixels, ftPerPixel);
  const grossAcres = grossSqFt / SQFT_PER_ACRE;

  const slopes = grid.map((c) => c.slopePct).filter((v): v is number => v !== null);
  const elevations = grid.map((c) => c.elevationFt).filter((v): v is number => v !== null);

  const steepCount = slopes.filter((s) => s > 25).length;
  const flatCount = slopes.filter((s) => s <= 5).length;
  const buildableCount = slopes.filter((s) => s <= buildableSlopePct).length;

  let highest = points[0];
  let lowest = points[0];
  for (const pt of points) {
    if (pt.z > highest.z) highest = pt;
    if (pt.z < lowest.z) lowest = pt;
  }

  return {
    grossAcres,
    netBuildableAcres: (buildableCount / Math.max(slopes.length, 1)) * grossAcres,
    netBuildablePct: slopes.length ? (buildableCount / slopes.length) * 100 : 0,
    avgSlopePct: slopes.length ? slopes.reduce((a, b) => a + b, 0) / slopes.length : 0,
    medianSlopePct: median(slopes),
    maxSlopePct: slopes.length ? Math.max(...slopes) : 0,
    elevationMinFt: elevations.length ? Math.min(...elevations) : 0,
    elevationMaxFt: elevations.length ? Math.max(...elevations) : 0,
    elevationRangeFt:
      elevations.length > 0 ? Math.max(...elevations) - Math.min(...elevations) : 0,
    highestPoint: { xFt: highest.x, yFt: highest.y, zFt: highest.z },
    lowestPoint: { xFt: lowest.x, yFt: lowest.y, zFt: lowest.z },
    steepSlopePct: slopes.length ? (steepCount / slopes.length) * 100 : 0,
    flatAreaPct: slopes.length ? (flatCount / slopes.length) * 100 : 0,
    triangleCount: triangles.length,
    pointCount: points.length,
  };
}

export function detectFlatPads(
  grid: TerrainGridCell[],
  grossSqFt: number,
  thresholds = [2, 5, 10],
): FlatPad[] {
  const cellAreaSqFt = 64;
  return thresholds.map((threshold) => {
    const matching = grid.filter((c) => c.slopePct !== null && c.slopePct <= threshold);
    const areaSqFt = matching.length * cellAreaSqFt;
    const cx =
      matching.length > 0
        ? matching.reduce((sum, c) => sum + c.xFt, 0) / matching.length
        : 0;
    const cy =
      matching.length > 0
        ? matching.reduce((sum, c) => sum + c.yFt, 0) / matching.length
        : 0;
    return {
      id: `pad-${threshold}`,
      slopeThresholdPct: threshold,
      areaSqFt,
      areaAcres: areaSqFt / SQFT_PER_ACRE,
      pctOfSite: grossSqFt > 0 ? (areaSqFt / grossSqFt) * 100 : 0,
      centroid: { xFt: cx, yFt: cy },
    };
  });
}

export function computeDealKillers(
  metrics: DevelopmentMetrics,
  cutCuYd: number,
  fillCuYd: number,
  buildableSlopePct: number,
): DealKillerCheck[] {
  const netEarthwork = Math.abs(cutCuYd - fillCuYd);
  const totalEarthwork = cutCuYd + fillCuYd;
  const imbalanceRatio = totalEarthwork > 0 ? netEarthwork / totalEarthwork : 0;

  return [
    {
      id: 'steep-slopes',
      label: 'More than 25% steep slopes',
      triggered: metrics.steepSlopePct > 25,
      severity: 'warning',
      detail: `${metrics.steepSlopePct.toFixed(1)}% of sampled area exceeds 25% slope`,
    },
    {
      id: 'cut-fill-imbalance',
      label: 'Large cut/fill imbalance',
      triggered: imbalanceRatio > 0.35 && totalEarthwork > 50,
      severity: 'warning',
      detail: `Net ${netEarthwork.toFixed(0)} cu yd imbalance across ${totalEarthwork.toFixed(0)} cu yd total`,
    },
    {
      id: 'limited-flat',
      label: 'Limited flat building area',
      triggered: metrics.flatAreaPct < 15,
      severity: 'warning',
      detail: `Only ${metrics.flatAreaPct.toFixed(1)}% of site is under 5% slope`,
    },
    {
      id: 'excessive-grade-change',
      label: 'Excessive grade change',
      triggered: metrics.elevationRangeFt > 40,
      severity: 'warning',
      detail: `${metrics.elevationRangeFt.toFixed(1)} ft elevation range across parcel`,
    },
    {
      id: 'low-buildable',
      label: `Less than 50% buildable at ${buildableSlopePct}% slope`,
      triggered: metrics.netBuildablePct < 50,
      severity: 'warning',
      detail: `${metrics.netBuildablePct.toFixed(1)}% of site under ${buildableSlopePct}% slope`,
    },
    {
      id: 'wetlands',
      label: 'Wetland impacts',
      triggered: false,
      severity: 'info',
      detail: 'Requires wetland delineation data — not available from topo image alone',
    },
    {
      id: 'floodplain',
      label: 'Floodplain crossing',
      triggered: false,
      severity: 'info',
      detail: 'Requires FEMA flood map overlay — not available from topo image alone',
    },
    {
      id: 'sewer-uphill',
      label: 'Sewer uphill',
      triggered: false,
      severity: 'info',
      detail: 'Requires utility alignment and outlet elevation — add manually',
    },
    {
      id: 'legal-access',
      label: 'No legal access',
      triggered: false,
      severity: 'info',
      detail: 'Requires title and easement review — not detected from topography',
    },
  ];
}

export function computeSiteScores(
  metrics: DevelopmentMetrics,
  cutCuYd: number,
  fillCuYd: number,
): SiteScores {
  const terrain = Math.max(
    0,
    Math.min(100, 100 - metrics.avgSlopePct * 2 - metrics.steepSlopePct * 0.5),
  );
  const grading = Math.max(
    0,
    Math.min(100, 100 - metrics.elevationRangeFt * 1.2 - Math.abs(cutCuYd - fillCuYd) * 0.05),
  );
  const drainage = Math.max(0, Math.min(100, 70 + metrics.flatAreaPct * 0.3 - metrics.maxSlopePct));
  const construction = Math.max(0, Math.min(100, metrics.netBuildablePct * 0.9));
  const environmental = 85;
  const utilities = 65;
  const access = 75;

  const categories: SiteScoreCategory[] = [
    { id: 'terrain', label: 'Terrain', score: Math.round(terrain), note: 'Based on slope distribution' },
    { id: 'grading', label: 'Grading', score: Math.round(grading), note: 'Elevation range and earthwork balance' },
    { id: 'drainage', label: 'Drainage', score: Math.round(drainage), note: 'Flat area and max slope proxy' },
    { id: 'construction', label: 'Construction', score: Math.round(construction), note: 'Buildable area at 15% slope' },
    { id: 'environmental', label: 'Environmental', score: environmental, note: 'Placeholder — add wetland/flood data' },
    { id: 'utilities', label: 'Utilities', score: utilities, note: 'Placeholder — add utility maps' },
    { id: 'access', label: 'Access', score: access, note: 'Placeholder — add road frontage data' },
  ];

  const overall = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );

  return { categories, overall };
}

export function generateContourSegments(
  grid: TerrainGridCell[],
  intervalFt: number,
): GeneratedContour[] {
  if (grid.length === 0 || intervalFt <= 0) return [];

  const elevations = grid.map((c) => c.elevationFt).filter((v): v is number => v !== null);
  const minZ = Math.min(...elevations);
  const maxZ = Math.max(...elevations);
  const start = Math.ceil(minZ / intervalFt) * intervalFt;
  const contours: GeneratedContour[] = [];

  const cellSize = grid.length > 1 ? Math.abs(grid[1].xFt - grid[0].xFt) || 8 : 8;
  const gridMap = new Map<string, TerrainGridCell>();
  for (const cell of grid) {
    gridMap.set(`${cell.xFt},${cell.yFt}`, cell);
  }

  for (let level = start; level <= maxZ; level += intervalFt) {
    const segments: GeneratedContour['segments'] = [];
    for (const cell of grid) {
      const right = gridMap.get(`${cell.xFt + cellSize},${cell.yFt}`);
      const down = gridMap.get(`${cell.xFt},${cell.yFt + cellSize}`);
      if (cell.elevationFt === null) continue;

      if (right?.elevationFt != null) {
        const a = cell.elevationFt - level;
        const b = right.elevationFt - level;
        if (a * b < 0) {
          const t = a / (a - b);
          const x = cell.xFt + t * cellSize;
          segments.push({ x1: x, y1: cell.yFt, x2: x, y2: cell.yFt });
        }
      }
      if (down?.elevationFt != null) {
        const a = cell.elevationFt - level;
        const b = down.elevationFt - level;
        if (a * b < 0) {
          const t = a / (a - b);
          const y = cell.yFt + t * cellSize;
          segments.push({ x1: cell.xFt, y1: y, x2: cell.xFt, y2: y });
        }
      }
    }
    if (segments.length > 0) contours.push({ elevationFt: level, segments });
  }

  return contours;
}

export function computeDrainagePaths(
  grid: TerrainGridCell[],
  maxPaths = 12,
): DrainagePath[] {
  const sorted = [...grid]
    .filter((c) => c.elevationFt !== null)
    .sort((a, b) => (b.elevationFt ?? 0) - (a.elevationFt ?? 0));
  const cellSize =
    grid.length > 1 ? Math.hypot(grid[1].xFt - grid[0].xFt, grid[1].yFt - grid[0].yFt) || 8 : 8;
  const paths: DrainagePath[] = [];

  for (let i = 0; i < Math.min(maxPaths, sorted.length); i++) {
    const start = sorted[i];
    const points: { xFt: number; yFt: number }[] = [{ xFt: start.xFt, yFt: start.yFt }];
    let cx = start.xFt;
    let cy = start.yFt;
    let cz = start.elevationFt ?? 0;

    for (let step = 0; step < 40; step++) {
      let best: TerrainGridCell | null = null;
      let bestDrop = 0;
      for (const cell of grid) {
        if (cell.elevationFt === null) continue;
        const dist = Math.hypot(cell.xFt - cx, cell.yFt - cy);
        if (dist > cellSize * 1.6 || dist < 0.1) continue;
        const drop = cz - cell.elevationFt;
        if (drop > bestDrop) {
          bestDrop = drop;
          best = cell;
        }
      }
      if (!best || bestDrop < 0.05) break;
      cx = best.xFt;
      cy = best.yFt;
      cz = best.elevationFt ?? cz;
      points.push({ xFt: cx, yFt: cy });
    }

    if (points.length >= 3) paths.push({ points });
  }

  return paths;
}

export function elevationColor(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(49 + clamped * 180);
  const g = Math.round(54 + clamped * 120);
  const b = Math.round(149 - clamped * 100);
  return [r, g, b];
}

export function slopeColor(slopePct: number, maxSlope = 35): [number, number, number] {
  const t = Math.max(0, Math.min(1, slopePct / maxSlope));
  if (t < 0.33) return [34, 139, 34];
  if (t < 0.66) return [234, 179, 8];
  return [220, 50, 45];
}

export function aspectColor(aspectDeg: number): [number, number, number] {
  const hue = aspectDeg;
  const rad = (hue * Math.PI) / 180;
  const r = Math.round(127 + 127 * Math.sin(rad));
  const g = Math.round(127 + 127 * Math.sin(rad + (2 * Math.PI) / 3));
  const b = Math.round(127 + 127 * Math.sin(rad + (4 * Math.PI) / 3));
  return [r, g, b];
}
