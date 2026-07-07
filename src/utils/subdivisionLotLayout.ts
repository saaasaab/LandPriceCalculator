import { Delaunay } from 'd3-delaunay';
import polygonClipping from 'polygon-clipping';
import type { BoundaryPoint } from './siteMapCalculations';
import { getBoundaryBounds } from './siteMapCalculations';
import type { RoadEndpointRole, RoadNetwork } from './roadNetwork';
import {
  buildRoadPathOptionsForChain,
  extractRenderPolylines,
  polylineControlPoints,
} from './roadNetwork';
import { buildRoadPath, denseSampleRoadPath } from './roadGeometry';

export type SpawnSide = 'left' | 'right';

export type SpawnPoint = {
  id: string;
  x: number;
  y: number;
  seedX: number;
  seedY: number;
  side: SpawnSide;
  segmentId: string;
  tangentX: number;
  tangentY: number;
};

export type LotCell = {
  id: string;
  spawnPointId: string;
  side: SpawnSide;
  polygon: BoundaryPoint[];
  areaSqFt: number;
};

/** Default target area for each lot (sq ft, excluding road). */
export const DEFAULT_TARGET_LOT_SIZE_SQFT = 8000;

/** Starting lot-row count when developable area is unknown. */
export const DEFAULT_LOT_PAIR_COUNT = 2;

/** Max lot length:width ratio (depth along road vs frontage). */
export const MAX_LOT_ASPECT_RATIO = 3;

function sanitizeRing(ring: [number, number][]): [number, number][] {
  if (ring.length === 0) return [];

  let open = ring.slice();
  if (open.length > 1) {
    const first = open[0];
    const last = open[open.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) {
      open = open.slice(0, -1);
    }
  }

  const deduped: [number, number][] = [];
  for (const pt of open) {
    const prev = deduped[deduped.length - 1];
    if (!prev || Math.hypot(pt[0] - prev[0], pt[1] - prev[1]) > 1e-8) {
      deduped.push(pt);
    }
  }

  if (deduped.length < 3) return [];

  const closed = [...deduped, deduped[0]];
  return closed.length >= 4 ? closed : [];
}

function toMultiPolygon(ring: [number, number][]): polygonClipping.MultiPolygon {
  const sanitized = sanitizeRing(ring);
  if (sanitized.length < 4) return [];
  return [[sanitized]];
}

function safeIntersection(
  a: polygonClipping.MultiPolygon,
  b: polygonClipping.MultiPolygon,
): polygonClipping.MultiPolygon {
  if (a.length === 0 || b.length === 0) return [];
  try {
    return polygonClipping.intersection(a, b);
  } catch {
    return [];
  }
}

function safeDifference(
  subject: polygonClipping.MultiPolygon,
  clip: polygonClipping.MultiPolygon,
): polygonClipping.MultiPolygon {
  if (subject.length === 0) return [];
  if (clip.length === 0) return subject;

  let result = subject;
  for (const poly of clip) {
    if (poly.length === 0) continue;
    try {
      result = polygonClipping.difference(result, [poly]);
    } catch {
      // Skip road pieces that produce invalid clip geometry.
    }
  }
  return result;
}

function closeRing(pts: BoundaryPoint[]): [number, number][] {
  if (pts.length === 0) return [];
  const ring = pts.map((p) => [p.x, p.y] as [number, number]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }
  return ring;
}

function ringToPoints(ring: [number, number][]): BoundaryPoint[] {
  const pts = ring.map(([x, y]) => ({ x, y }));
  if (pts.length > 1) {
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (first.x === last.x && first.y === last.y) pts.pop();
  }
  return pts;
}

function dedupePolygonVertices(polygon: BoundaryPoint[], minDistPx = 0.35): BoundaryPoint[] {
  return polygon.filter((point, i) => {
    const prev = polygon[(i - 1 + polygon.length) % polygon.length];
    return Math.hypot(point.x - prev.x, point.y - prev.y) > minDistPx;
  });
}

function polygonAreaSqFt(polygon: BoundaryPoint[], ftPerPixel: number): number {
  if (polygon.length < 3 || ftPerPixel <= 0) return 0;
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2) * ftPerPixel * ftPerPixel;
}

function ringAreaPx(ring: [number, number][]): number {
  const open = sanitizeRing(ring);
  if (open.length < 4) return 0;
  const pts = ringToPoints(open);
  if (pts.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    total += pts[i].x * next.y - next.x * pts[i].y;
  }
  return Math.abs(total / 2);
}

function multiPolygonAreaSqFt(
  multi: polygonClipping.MultiPolygon,
  ftPerPixel: number,
): number {
  if (multi.length === 0 || ftPerPixel <= 0) return 0;

  let areaPx = 0;
  for (const poly of multi) {
    if (poly.length === 0) continue;
    areaPx += ringAreaPx(poly[0]);
    for (let h = 1; h < poly.length; h++) {
      areaPx -= ringAreaPx(poly[h]);
    }
  }

  return Math.max(0, areaPx) * ftPerPixel * ftPerPixel;
}

/** Site area minus road pavement — the area available for lots. */
export function computeDevelopableAreaSqFt(
  boundary: BoundaryPoint[],
  roadMulti: polygonClipping.MultiPolygon,
  ftPerPixel: number,
): number {
  if (boundary.length < 3 || ftPerPixel <= 0) return 0;

  const boundaryPoly = toMultiPolygon(closeRing(boundary));
  if (boundaryPoly.length === 0) return 0;

  const developable = safeDifference(boundaryPoly, roadMulti);
  return multiPolygonAreaSqFt(developable, ftPerPixel);
}

function sampleOnSegment(
  a: BoundaryPoint,
  b: BoundaryPoint,
  t: number,
): { point: BoundaryPoint; tangent: BoundaryPoint } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) {
    return { point: { ...a }, tangent: { x: 1, y: 0 } };
  }
  return {
    point: { x: a.x + dx * t, y: a.y + dy * t },
    tangent: { x: dx / len, y: dy / len },
  };
}

function segmentLength(a: BoundaryPoint, b: BoundaryPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

type RenderedRoadSampleChain = {
  samples: BoundaryPoint[];
  chainIndex: number;
};

function renderedRoadSampleChains(
  network: RoadNetwork,
  boundary: BoundaryPoint[],
  ftPerPixel: number,
  nodeRoles: Map<string, RoadEndpointRole>,
): RenderedRoadSampleChain[] {
  if (network.segments.length === 0 || ftPerPixel <= 0) return [];

  const polylines = network.polylines ?? [];
  if (polylines.length > 0) {
    return polylines
      .map((pl, chainIndex) => {
        const chain = polylineControlPoints(network, pl);
        if (chain.length < 2) return null;
        const path = buildRoadPath(
          chain,
          ftPerPixel,
          buildRoadPathOptionsForChain(
            chain,
            network,
            boundary,
            ftPerPixel,
            nodeRoles,
            pl.nodeIds,
          ),
        );
        const samples = denseSampleRoadPath(path.segments, 2);
        return samples.length >= 2 ? { samples, chainIndex } : null;
      })
      .filter((chain): chain is RenderedRoadSampleChain => chain !== null);
  }

  return extractRenderPolylines(network)
    .map((chain, chainIndex) => {
      if (chain.length < 2) return null;
      const path = buildRoadPath(
        chain,
        ftPerPixel,
        buildRoadPathOptionsForChain(chain, network, boundary, ftPerPixel, nodeRoles),
      );
      const samples = denseSampleRoadPath(path.segments, 2);
      return samples.length >= 2 ? { samples, chainIndex } : null;
    })
    .filter((chain): chain is RenderedRoadSampleChain => chain !== null);
}


let spawnIdCounter = 0;

export function createSpawnPointId(): string {
  spawnIdCounter += 1;
  return `sp-${Date.now()}-${spawnIdCounter}`;
}

/** Total spawn points from developable area and minimum lot size (one lot per spawn). */
export function estimateSpawnPointCount(
  developableAreaSqFt: number,
  minLotSizeSqFt: number,
): number {
  if (minLotSizeSqFt <= 0) return DEFAULT_LOT_PAIR_COUNT * 2;
  if (developableAreaSqFt <= 0) return DEFAULT_LOT_PAIR_COUNT * 2;
  return Math.max(1, Math.floor(developableAreaSqFt / minLotSizeSqFt));
}

/** @deprecated Use estimateSpawnPointCount; returns row pairs for legacy callers. */
export function estimateLotPairCount(
  developableAreaSqFt: number,
  targetLotSizeSqFt: number,
): number {
  return Math.max(1, Math.ceil(estimateSpawnPointCount(developableAreaSqFt, targetLotSizeSqFt) / 2));
}

/** Spacing between lot centers along the road for roughly uniform lot areas. */
export function lotSpacingPx(targetLotSizeSqFt: number, ftPerPixel: number): number {
  if (targetLotSizeSqFt <= 0 || ftPerPixel <= 0) return 40;
  return (Math.sqrt(targetLotSizeSqFt) * 0.82) / ftPerPixel;
}

/** Voronoi helper sites along the property boundary so edge lots stay near target size. */
export function generateBoundaryVoronoiSeeds(
  boundary: BoundaryPoint[],
  targetLotSizeSqFt: number,
  ftPerPixel: number,
): BoundaryPoint[] {
  if (boundary.length < 3 || targetLotSizeSqFt <= 0 || ftPerPixel <= 0) return [];

  const spacingPx = lotSpacingPx(targetLotSizeSqFt, ftPerPixel);
  const seeds: BoundaryPoint[] = [];
  const n = boundary.length;

  for (let i = 0; i < n; i++) {
    const a = boundary[i];
    const b = boundary[(i + 1) % n];
    const edgeLen = segmentLength(a, b);
    const count = Math.max(1, Math.round(edgeLen / spacingPx));
    for (let j = 0; j < count; j++) {
      const t = (j + 0.5) / count;
      seeds.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      });
    }
  }

  return seeds;
}

function roadBoundaryOffsetPx(roadWidthFt: number, ftPerPixel: number): number {
  if (roadWidthFt <= 0 || ftPerPixel <= 0) return 0;
  return roadWidthFt / 2 / ftPerPixel;
}

function lotSeedOffsetPx(
  targetLotSizeSqFt: number,
  roadWidthFt: number,
  ftPerPixel: number,
): number {
  const halfWidthPx = roadWidthFt / 2 / ftPerPixel;
  if (targetLotSizeSqFt <= 0 || ftPerPixel <= 0) return halfWidthPx * 0.92;

  const minFrontageFt = Math.sqrt(targetLotSizeSqFt / MAX_LOT_ASPECT_RATIO);
  const idealDepthFt = targetLotSizeSqFt / Math.max(minFrontageFt, 1);
  const depthPx = (idealDepthFt * 0.45) / ftPerPixel;
  return halfWidthPx + depthPx;
}

function normalizeVec(dx: number, dy: number): BoundaryPoint {
  const len = Math.hypot(dx, dy);
  if (len < 1e-10) return { x: 0, y: 1 };
  return { x: dx / len, y: dy / len };
}

function polygonCentroid(polygon: BoundaryPoint[]): BoundaryPoint {
  if (polygon.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const p of polygon) {
    x += p.x;
    y += p.y;
  }
  return { x: x / polygon.length, y: y / polygon.length };
}

function pointInPolygon(point: BoundaryPoint, polygon: BoundaryPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y || 1e-10) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Perpendicular from the road centerline that points into developable land. */
function lotSidePerpendicular(
  point: BoundaryPoint,
  tangent: BoundaryPoint,
  boundary: BoundaryPoint[],
  side: SpawnSide,
): BoundaryPoint {
  const perpA = normalizeVec(-tangent.y, tangent.x);
  const perpB = { x: -perpA.x, y: -perpA.y };
  const probe = 12;

  const aInside = pointInPolygon(
    { x: point.x + perpA.x * probe, y: point.y + perpA.y * probe },
    boundary,
  );
  const bInside = pointInPolygon(
    { x: point.x + perpB.x * probe, y: point.y + perpB.y * probe },
    boundary,
  );

  let leftPerp = perpA;
  if (!aInside && bInside) leftPerp = perpB;
  else if (!aInside && !bInside) {
    const centroid = polygonCentroid(boundary);
    leftPerp = normalizeVec(centroid.x - point.x, centroid.y - point.y);
  }

  const rightPerp = { x: -leftPerp.x, y: -leftPerp.y };
  const chosen = side === 'left' ? leftPerp : rightPerp;

  if (
    !pointInPolygon(
      { x: point.x + chosen.x * probe, y: point.y + chosen.y * probe },
      boundary,
    )
  ) {
    return { x: -chosen.x, y: -chosen.y };
  }

  return chosen;
}

function sidePerpendicular(tangent: BoundaryPoint, side: SpawnSide): BoundaryPoint {
  const perpX = -tangent.y;
  const perpY = tangent.x;
  return side === 'left' ? { x: perpX, y: perpY } : { x: -perpX, y: -perpY };
}

function addSpawn(
  spawns: SpawnPoint[],
  point: BoundaryPoint,
  tangent: BoundaryPoint,
  perp: BoundaryPoint,
  boundaryOffsetPx: number,
  seedOffsetPx: number,
  side: SpawnSide,
  segmentId: string,
  boundary: BoundaryPoint[],
) {
  const frontage = {
    x: point.x + perp.x * boundaryOffsetPx,
    y: point.y + perp.y * boundaryOffsetPx,
  };
  const seed = {
    x: point.x + perp.x * seedOffsetPx,
    y: point.y + perp.y * seedOffsetPx,
  };

  if (!pointInPolygon(seed, boundary) && !pointInPolygon(frontage, boundary)) return;

  spawns.push({
    id: createSpawnPointId(),
    x: frontage.x,
    y: frontage.y,
    seedX: seed.x,
    seedY: seed.y,
    side,
    segmentId,
    tangentX: tangent.x,
    tangentY: tangent.y,
  });
}

/** Distribute spawn points along road chains (one per estimated lot). */
export function generateSpawnPoints(
  network: RoadNetwork,
  spawnCount: number,
  roadWidthFt: number,
  ftPerPixel: number,
  targetLotSizeSqFt: number,
  boundary: BoundaryPoint[],
  nodeRoles: Map<string, RoadEndpointRole>,
): SpawnPoint[] {
  if (spawnCount <= 0 || network.segments.length === 0 || ftPerPixel <= 0) return [];

  const boundaryOffsetPx = roadBoundaryOffsetPx(roadWidthFt, ftPerPixel);
  const seedOffsetPx = lotSeedOffsetPx(targetLotSizeSqFt, roadWidthFt, ftPerPixel);
  const chains = renderedRoadSampleChains(network, boundary, ftPerPixel, nodeRoles);

  type ChainSeg = { a: BoundaryPoint; b: BoundaryPoint; len: number; segmentId: string };
  const chainSegments: ChainSeg[] = [];

  for (const chain of chains) {
    for (let i = 0; i < chain.samples.length - 1; i++) {
      const a = chain.samples[i];
      const b = chain.samples[i + 1];
      const len = segmentLength(a, b);
      if (len < 1e-6) continue;
      chainSegments.push({
        a,
        b,
        len,
        segmentId: `curve-${chain.chainIndex}-${i}`,
      });
    }
  }

  if (chainSegments.length === 0) return [];

  const totalLen = chainSegments.reduce((sum, s) => sum + s.len, 0);
  if (totalLen < 1e-6) return [];

  const spawns: SpawnPoint[] = [];

  for (let i = 0; i < spawnCount; i++) {
    const targetDistance = totalLen * ((i + 0.5) / spawnCount);
    let distanceSoFar = 0;
    for (const { a, b, len, segmentId } of chainSegments) {
      const nextDistance = distanceSoFar + len;
      if (targetDistance > nextDistance && nextDistance < totalLen) {
        distanceSoFar = nextDistance;
        continue;
      }
      const t = Math.max(0, Math.min(1, (targetDistance - distanceSoFar) / len));
      const { point, tangent } = sampleOnSegment(a, b, t);
      const side: SpawnSide = i % 2 === 0 ? 'left' : 'right';
      const perp = lotSidePerpendicular(point, tangent, boundary, side);
      addSpawn(
        spawns,
        point,
        tangent,
        perp,
        boundaryOffsetPx,
        seedOffsetPx,
        side,
        segmentId,
        boundary,
      );
      break;
    }
  }

  return spawns;
}

function polygonsFromMulti(multi: polygonClipping.MultiPolygon): BoundaryPoint[][] {
  const polygons: BoundaryPoint[][] = [];
  for (const poly of multi) {
    if (poly.length === 0) continue;
    const pts = ringToPoints(poly[0]);
    if (pts.length >= 3) polygons.push(pts);
  }
  return polygons;
}

function unionLotPolygons(lots: LotCell[]): polygonClipping.MultiPolygon {
  let result: polygonClipping.MultiPolygon = [];
  for (const lot of lots) {
    const poly = toMultiPolygon(closeRing(lot.polygon));
    if (poly.length === 0) continue;
    if (result.length === 0) {
      result = poly;
      continue;
    }
    try {
      result = polygonClipping.union(result, poly);
    } catch {
      // Keep merging other lots if one union fails.
    }
  }
  return result;
}

function largestPolygonFromMulti(multi: polygonClipping.MultiPolygon): BoundaryPoint[] {
  let best: BoundaryPoint[] = [];
  let bestArea = 0;

  for (const poly of multi) {
    if (poly.length === 0) continue;
    const pts = ringToPoints(poly[0]);
    const area = Math.abs(
      pts.reduce((sum, p, i) => {
        const next = pts[(i + 1) % pts.length];
        return sum + p.x * next.y - next.x * p.y;
      }, 0) / 2,
    );
    if (area > bestArea) {
      bestArea = area;
      best = pts;
    }
  }

  return best;
}

/** Clip Voronoi cells to the site boundary minus the road polygon. */
export function computeLotCells(
  boundary: BoundaryPoint[],
  roadMulti: polygonClipping.MultiPolygon,
  spawnPoints: SpawnPoint[],
  ftPerPixel: number,
): LotCell[] {
  if (boundary.length < 3 || spawnPoints.length === 0 || ftPerPixel <= 0) return [];

  const coords: [number, number][] = spawnPoints.map((s) => [s.seedX, s.seedY]);
  const delaunay = Delaunay.from(coords);
  const bounds = getBoundaryBounds(boundary);
  const pad = Math.max(bounds.width, bounds.height) * 0.25;
  const voronoi = delaunay.voronoi([
    bounds.minX - pad,
    bounds.minY - pad,
    bounds.maxX + pad,
    bounds.maxY + pad,
  ]);

  const boundaryPoly = toMultiPolygon(closeRing(boundary));
  if (boundaryPoly.length === 0) return [];

  const lots: LotCell[] = [];

  for (let i = 0; i < spawnPoints.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell || cell.length < 4) continue;

    const cellPoly = toMultiPolygon(cell as [number, number][]);
    if (cellPoly.length === 0) continue;

    let clipped = safeIntersection(boundaryPoly, cellPoly);
    if (clipped.length === 0) continue;

    if (roadMulti.length > 0) {
      clipped = safeDifference(clipped, roadMulti);
    }

    if (clipped.length === 0) continue;

    const spawn = spawnPoints[i];
    const polygon = dedupePolygonVertices(chooseRoadConnectedFragment(clipped, spawn));
    if (polygon.length < 3) continue;

    lots.push({
      id: `lot-${spawn.id}`,
      spawnPointId: spawn.id,
      side: spawn.side,
      polygon,
      areaSqFt: polygonAreaSqFt(polygon, ftPerPixel),
    });
  }

  return mergeDevelopableGapsIntoLots(boundary, roadMulti, lots, spawnPoints, ftPerPixel);
}

function distancePointToPolygon(point: BoundaryPoint, polygon: BoundaryPoint[]): number {
  if (polygon.length === 0) return Infinity;
  if (pointInPolygon(point, polygon)) return 0;

  let min = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t =
      lengthSq <= 1e-10
        ? 0
        : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq));
    min = Math.min(min, Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t)));
  }
  return min;
}

function polygonsTouch(a: BoundaryPoint[], b: BoundaryPoint[], tolerancePx = 1.5): boolean {
  for (const point of a) {
    if (distancePointToPolygon(point, b) <= tolerancePx) return true;
  }
  for (const point of b) {
    if (distancePointToPolygon(point, a) <= tolerancePx) return true;
  }
  return false;
}

function chooseRoadConnectedFragment(
  clipped: polygonClipping.MultiPolygon,
  spawn: SpawnPoint,
): BoundaryPoint[] {
  const fragments = polygonsFromMulti(clipped);
  if (fragments.length === 0) return [];

  const seed = { x: spawn.seedX, y: spawn.seedY };
  let best = fragments[0];
  let bestScore = Infinity;

  for (const polygon of fragments) {
    const score = distancePointToPolygon(seed, polygon);
    if (score < bestScore) {
      bestScore = score;
      best = polygon;
    }
  }

  return best;
}

/** Width along road vs depth away from road; returns max/min dimension ratio. */
export function lotAspectRatio(
  polygon: BoundaryPoint[],
  spawn: SpawnPoint,
  ftPerPixel: number,
): number {
  if (polygon.length < 3 || ftPerPixel <= 0) return 1;

  const tangent = { x: spawn.tangentX, y: spawn.tangentY };
  const perp = sidePerpendicular(tangent, spawn.side);

  let minT = Infinity;
  let maxT = -Infinity;
  let minP = Infinity;
  let maxP = -Infinity;

  for (const p of polygon) {
    const dx = p.x - spawn.x;
    const dy = p.y - spawn.y;
    const along = dx * tangent.x + dy * tangent.y;
    const across = dx * perp.x + dy * perp.y;
    minT = Math.min(minT, along);
    maxT = Math.max(maxT, along);
    minP = Math.min(minP, across);
    maxP = Math.max(maxP, across);
  }

  const widthFt = Math.max(maxT - minT, 1e-6) * ftPerPixel;
  const depthFt = Math.max(maxP - minP, 1e-6) * ftPerPixel;
  const major = Math.max(widthFt, depthFt);
  const minor = Math.max(Math.min(widthFt, depthFt), 1e-3);
  return major / minor;
}

function unionPolygons(a: BoundaryPoint[], b: BoundaryPoint[]): BoundaryPoint[] {
  const union = polygonClipping.union(
    toMultiPolygon(closeRing(a)),
    toMultiPolygon(closeRing(b)),
  );
  return largestPolygonFromMulti(union);
}

/** Assign all remaining developable area to the nearest lot until the site is fully covered. */
export function mergeDevelopableGapsIntoLots(
  boundary: BoundaryPoint[],
  roadMulti: polygonClipping.MultiPolygon,
  lotCells: LotCell[],
  spawnPoints: SpawnPoint[],
  ftPerPixel: number,
): LotCell[] {
  if (lotCells.length === 0 || boundary.length < 3 || ftPerPixel <= 0) return lotCells;

  const boundaryPoly = toMultiPolygon(closeRing(boundary));
  if (boundaryPoly.length === 0) return lotCells;

  const developableBase = safeDifference(boundaryPoly, roadMulti);
  if (developableBase.length === 0) return lotCells;

  const spawnById = new Map(spawnPoints.map((s) => [s.id, s]));
  const lots = lotCells.map((lot) => ({ ...lot, polygon: [...lot.polygon] }));

  const findLotIndexForGap = (gap: BoundaryPoint[], centroid: BoundaryPoint): number => {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < lots.length; i++) {
      if (!polygonsTouch(lots[i].polygon, gap, 5)) continue;
      const spawn = spawnById.get(lots[i].spawnPointId);
      if (!spawn) continue;
      const d = Math.hypot(centroid.x - spawn.x, centroid.y - spawn.y);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) return bestIdx;

    for (let i = 0; i < lots.length; i++) {
      const spawn = spawnById.get(lots[i].spawnPointId);
      if (!spawn) continue;
      const d = Math.hypot(centroid.x - spawn.x, centroid.y - spawn.y);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  for (let pass = 0; pass < 12; pass++) {
    const lotsUnion = unionLotPolygons(lots);
    const remaining = safeDifference(developableBase, lotsUnion);
    if (remaining.length === 0) break;

    const gapPolygons = polygonsFromMulti(remaining);
    if (gapPolygons.length === 0) break;

    let mergedAny = false;
    const gaps = gapPolygons
      .map((polygon) => ({
        polygon,
        areaSqFt: polygonAreaSqFt(polygon, ftPerPixel),
        centroid: polygonCentroid(polygon),
      }))
      .sort((a, b) => b.areaSqFt - a.areaSqFt);

    for (const gap of gaps) {
      if (gap.areaSqFt <= 0) continue;
      const bestIdx = findLotIndexForGap(gap.polygon, gap.centroid);
      if (bestIdx < 0) continue;

      const merged = unionPolygons(lots[bestIdx].polygon, gap.polygon);
      if (merged.length < 3) continue;
      const polygon = dedupePolygonVertices(merged);

      lots[bestIdx] = {
        ...lots[bestIdx],
        polygon,
        areaSqFt: polygonAreaSqFt(polygon, ftPerPixel),
      };
      mergedAny = true;
    }

    if (!mergedAny) break;
  }

  return lots.map((lot) => {
    const polygon = dedupePolygonVertices(lot.polygon);
    return {
      ...lot,
      polygon,
      areaSqFt: polygonAreaSqFt(polygon, ftPerPixel),
    };
  });
}
