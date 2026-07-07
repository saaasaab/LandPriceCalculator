import polygonClipping from 'polygon-clipping';
import type { BoundaryPoint } from './siteMapCalculations';
import {
  buildRoadPath,
  denseSampleRoadPath,
  type RoadPathSegment,
} from './roadGeometry';
import {
  buildRoadPathOptionsForChain,
  extractRenderPolylines,
  polylineControlPoints,
  type RoadEndpointRole,
  type RoadNetwork,
} from './roadNetwork';

/** Typical local residential street pavement width. */
export const DEFAULT_ROAD_WIDTH_FT = 24;

type ClipRing = [number, number][];

function closeRing(pts: BoundaryPoint[]): ClipRing {
  if (pts.length === 0) return [];
  const ring = pts.map((p) => [p.x, p.y] as [number, number]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }
  return ring;
}

function lineIntersection(
  a1: BoundaryPoint,
  a2: BoundaryPoint,
  b1: BoundaryPoint,
  b2: BoundaryPoint,
): BoundaryPoint | null {
  const dax = a2.x - a1.x;
  const day = a2.y - a1.y;
  const dbx = b2.x - b1.x;
  const dby = b2.y - b1.y;
  const denom = dax * dby - day * dbx;
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / denom;
  return { x: a1.x + t * dax, y: a1.y + t * day };
}

function pushDeduped(out: BoundaryPoint[], pt: BoundaryPoint) {
  const last = out[out.length - 1];
  if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 0.25) {
    out.push(pt);
  }
}

/** Offset one side of a sampled centerline with miter joins on outer corners and bevels on inner corners. */
type OffsetEndpointOptions = {
  startTravel?: BoundaryPoint;
  endTravel?: BoundaryPoint;
};

function offsetSide(
  samples: BoundaryPoint[],
  halfWidth: number,
  side: 'left' | 'right',
  endpoints?: OffsetEndpointOptions,
): BoundaryPoint[] {
  const sign = side === 'left' ? 1 : -1;
  const n = samples.length;
  if (n < 2) return [];

  const out: BoundaryPoint[] = [];

  for (let i = 0; i < n; i++) {
    const prev = samples[Math.max(0, i - 1)];
    const curr = samples[i];
    const next = samples[Math.min(n - 1, i + 1)];

    let tIn: BoundaryPoint;
    let tOut: BoundaryPoint;
    if (i === 0) {
      if (endpoints?.startTravel) {
        tIn = tOut = endpoints.startTravel;
      } else {
        tIn = tOut = {
          x: next.x - curr.x,
          y: next.y - curr.y,
        };
        const len = Math.hypot(tOut.x, tOut.y);
        if (len < 1e-10) continue;
        tIn = tOut = { x: tOut.x / len, y: tOut.y / len };
      }
      const nx = -tOut.y * sign * halfWidth;
      const ny = tOut.x * sign * halfWidth;
      pushDeduped(out, { x: curr.x + nx, y: curr.y + ny });
      continue;
    }
    if (i === n - 1) {
      if (endpoints?.endTravel) {
        tIn = endpoints.endTravel;
      } else {
        tIn = { x: curr.x - prev.x, y: curr.y - prev.y };
        const len = Math.hypot(tIn.x, tIn.y);
        if (len < 1e-10) continue;
        tIn = { x: tIn.x / len, y: tIn.y / len };
      }
      const nx = -tIn.y * sign * halfWidth;
      const ny = tIn.x * sign * halfWidth;
      pushDeduped(out, { x: curr.x + nx, y: curr.y + ny });
      continue;
    }

    tIn = { x: curr.x - prev.x, y: curr.y - prev.y };
    tOut = { x: next.x - curr.x, y: next.y - curr.y };
    const lenIn = Math.hypot(tIn.x, tIn.y);
    const lenOut = Math.hypot(tOut.x, tOut.y);
    if (lenIn < 1e-10 || lenOut < 1e-10) continue;
    tIn = { x: tIn.x / lenIn, y: tIn.y / lenIn };
    tOut = { x: tOut.x / lenOut, y: tOut.y / lenOut };

    const nIn = { x: -tIn.y * sign * halfWidth, y: tIn.x * sign * halfWidth };
    const nOut = { x: -tOut.y * sign * halfWidth, y: tOut.x * sign * halfWidth };
    const pIn = { x: curr.x + nIn.x, y: curr.y + nIn.y };
    const pOut = { x: curr.x + nOut.x, y: curr.y + nOut.y };

    const cross = tIn.x * tOut.y - tIn.y * tOut.x;
    const turnLeft = cross > 1e-6;
    const isInnerCorner = (side === 'left' && !turnLeft) || (side === 'right' && turnLeft);

    if (isInnerCorner) {
      pushDeduped(out, pIn);
      pushDeduped(out, pOut);
      continue;
    }

    const miter = lineIntersection(
      pIn,
      { x: pIn.x + tIn.x, y: pIn.y + tIn.y },
      pOut,
      { x: pOut.x + tOut.x, y: pOut.y + tOut.y },
    );
    const miterLimit = halfWidth * 3;
    if (
      miter &&
      Math.hypot(miter.x - curr.x, miter.y - curr.y) <= miterLimit
    ) {
      pushDeduped(out, miter);
    } else {
      pushDeduped(out, pIn);
      pushDeduped(out, pOut);
    }
  }

  return out;
}

function buildOffsetEndpoints(
  pathOptions: ReturnType<typeof buildRoadPathOptionsForChain>,
): OffsetEndpointOptions {
  const endpoints: OffsetEndpointOptions = {};

  if (pathOptions.startEntrance) {
    endpoints.startTravel = pathOptions.startEntrance.inwardNormal;
  }

  if (pathOptions.endEntrance) {
    const inward = pathOptions.endEntrance.inwardNormal;
    endpoints.endTravel = { x: -inward.x, y: -inward.y };
  }

  return endpoints;
}

/** Sample interval (px) when building road pavement polygons for clipping and display. */
const ROAD_POLYGON_SAMPLE_PX = 1.5;

function offsetPathToRing(
  segments: RoadPathSegment[],
  halfWidthPx: number,
  endpoints?: OffsetEndpointOptions,
): BoundaryPoint[] | null {
  const samples = denseSampleRoadPath(segments, ROAD_POLYGON_SAMPLE_PX);
  if (samples.length < 2) return null;

  const left = offsetSide(samples, halfWidthPx, 'left', endpoints);
  const right = offsetSide(samples, halfWidthPx, 'right', endpoints);
  if (left.length < 2 || right.length < 2) return null;

  return [...left, ...right.reverse()];
}

function chainToPolygon(
  chain: BoundaryPoint[],
  roadWidthFt: number,
  ftPerPixel: number,
  network: RoadNetwork,
  boundary: BoundaryPoint[],
  nodeRoles: Map<string, RoadEndpointRole>,
  polylineNodeIds?: string[],
): polygonClipping.MultiPolygon | null {
  const pathOptions = buildRoadPathOptionsForChain(
    chain,
    network,
    boundary,
    ftPerPixel,
    nodeRoles,
    polylineNodeIds,
  );
  const path = buildRoadPath(chain, ftPerPixel, pathOptions);
  const halfWidthPx = roadWidthFt / 2 / ftPerPixel;
  const offsetEndpoints = buildOffsetEndpoints(pathOptions);
  const ringPts = offsetPathToRing(path.segments, halfWidthPx, offsetEndpoints);
  if (!ringPts || ringPts.length < 4) return null;

  const ring = closeRing(ringPts);
  if (ring.length < 4) return null;

  try {
    const cleaned = polygonClipping.union([[ring]], [[ring]]);
    if (cleaned.length > 0) return cleaned;
  } catch {
    // Fall back to the raw ring when union cleanup fails.
  }

  return [[ring]];
}

/** Combined paved road surface along connected centerline chains. */
export function buildRoadPolygonMulti(
  network: RoadNetwork,
  roadWidthFt: number,
  ftPerPixel: number,
  boundary: BoundaryPoint[],
  nodeRoles: Map<string, RoadEndpointRole>,
): polygonClipping.MultiPolygon {
  if (network.segments.length === 0 || ftPerPixel <= 0 || roadWidthFt <= 0) return [];

  const polylines = network.polylines ?? [];
  let union: polygonClipping.MultiPolygon | null = null;

  if (polylines.length > 0) {
    for (const pl of polylines) {
      const chain = polylineControlPoints(network, pl);
      if (chain.length < 2) continue;
      const piece = chainToPolygon(
        chain,
        roadWidthFt,
        ftPerPixel,
        network,
        boundary,
        nodeRoles,
        pl.nodeIds,
      );
      if (!piece) continue;
      try {
        union = union ? polygonClipping.union(union, piece) : piece;
      } catch {
        // Keep prior union if a chain produces invalid clip geometry.
      }
    }
  } else {
    const chains = extractRenderPolylines(network);
    for (const chain of chains) {
      const piece = chainToPolygon(chain, roadWidthFt, ftPerPixel, network, boundary, nodeRoles);
      if (!piece) continue;
      try {
        union = union ? polygonClipping.union(union, piece) : piece;
      } catch {
        // Keep prior union if a chain produces invalid clip geometry.
      }
    }
  }

  return union ?? [];
}

export type RoadPolygonPiece = {
  outer: BoundaryPoint[];
  holes: BoundaryPoint[][];
};

/** Flat rings for canvas fill, plus paired outer/hole groups for correct hole rendering. */
export function roadPolygonToRings(multi: polygonClipping.MultiPolygon): {
  outers: BoundaryPoint[][];
  holes: BoundaryPoint[][];
  pieces: RoadPolygonPiece[];
} {
  const outers: BoundaryPoint[][] = [];
  const holes: BoundaryPoint[][] = [];
  const pieces: RoadPolygonPiece[] = [];

  for (const poly of multi) {
    if (poly.length === 0) continue;
    const outer = poly[0].map(([x, y]) => ({ x, y }));
    const pieceHoles: BoundaryPoint[][] = [];
    outers.push(outer);
    for (let i = 1; i < poly.length; i++) {
      const hole = poly[i].map(([x, y]) => ({ x, y }));
      pieceHoles.push(hole);
      holes.push(hole);
    }
    pieces.push({ outer, holes: pieceHoles });
  }

  return { outers, holes, pieces };
}

export function buildRoadPolygonRings(
  network: RoadNetwork,
  roadWidthFt: number,
  ftPerPixel: number,
  boundary: BoundaryPoint[],
  nodeRoles: Map<string, RoadEndpointRole>,
): { outers: BoundaryPoint[][]; holes: BoundaryPoint[][]; pieces: RoadPolygonPiece[] } {
  return roadPolygonToRings(
    buildRoadPolygonMulti(network, roadWidthFt, ftPerPixel, boundary, nodeRoles),
  );
}

export function buildNetworkCenterlinePaths(
  network: RoadNetwork,
  ftPerPixel: number,
  boundary: BoundaryPoint[],
  nodeRoles: Map<string, RoadEndpointRole>,
): { chainIndex: number; path: ReturnType<typeof buildRoadPath> }[] {
  const polylines = network.polylines ?? [];
  if (polylines.length > 0) {
    return polylines
      .map((pl, chainIndex) => {
        const chain = polylineControlPoints(network, pl);
        if (chain.length < 2) return null;
        return {
          chainIndex,
          path: buildRoadPath(
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
          ),
        };
      })
      .filter((x): x is { chainIndex: number; path: ReturnType<typeof buildRoadPath> } => x !== null);
  }

  return extractRenderPolylines(network).map((chain, chainIndex) => ({
    chainIndex,
    path: buildRoadPath(
      chain,
      ftPerPixel,
      buildRoadPathOptionsForChain(chain, network, boundary, ftPerPixel, nodeRoles),
    ),
  }));
}
