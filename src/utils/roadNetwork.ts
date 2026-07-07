import type { BoundaryPoint } from './siteMapCalculations';
import { distancePointToSegment, isInsideBoundary } from './siteMapCalculations';
import {
  buildRoadPath,
  denseSampleRoadPath,
  type BuildRoadPathOptions,
  type RoadPathResult,
} from './roadGeometry';

/** Distance in feet within which a point is considered on the property boundary. */
export const BOUNDARY_CONNECTION_THRESHOLD_FT = 20;

/** Distance in feet within which clicks snap to an existing road node. */
export const NODE_SNAP_THRESHOLD_FT = 12;

/** Distance in feet within which clicks insert a point on an existing road segment. */
export const SEGMENT_INSERT_THRESHOLD_FT = 12;

export type RoadEndpointRole = 'entrance' | 'dead-end' | 'junction';

export type RoadNode = {
  id: string;
  x: number;
  y: number;
};

export type RoadSegment = {
  id: string;
  startNodeId: string;
  endNodeId: string;
  /** Ordered control points from start node to end node (includes both endpoints). */
  points: BoundaryPoint[];
  /** Geometry group — segments from the same placement share one independent centerline. */
  polylineId?: string;
};

/** Ordered node ids for one independently-drawn road centerline. */
export type RoadPolyline = {
  id: string;
  nodeIds: string[];
};

export type RoadNetwork = {
  nodes: RoadNode[];
  segments: RoadSegment[];
  polylines: RoadPolyline[];
};

export type RoadDrawingState = {
  points: BoundaryPoint[];
  fromNodeId: string | null;
};

let idCounter = 0;

export function createRoadNodeId(): string {
  idCounter += 1;
  return `rn-${Date.now()}-${idCounter}`;
}

export function createRoadSegmentId(): string {
  idCounter += 1;
  return `rs-${Date.now()}-${idCounter}`;
}

export function createRoadPolylineId(): string {
  idCounter += 1;
  return `rpl-${Date.now()}-${idCounter}`;
}

export function emptyRoadNetwork(): RoadNetwork {
  return { nodes: [], segments: [], polylines: [] };
}

export function distancePointToBoundary(boundary: BoundaryPoint[], point: BoundaryPoint): number {
  if (boundary.length < 2) return Infinity;
  let min = Infinity;
  const n = boundary.length;
  for (let i = 0; i < n; i++) {
    const a = boundary[i];
    const b = boundary[(i + 1) % n];
    const d = distancePointToSegment(point.x, point.y, a.x, a.y, b.x, b.y);
    if (d < min) min = d;
  }
  return min;
}

export function isNearBoundary(
  boundary: BoundaryPoint[],
  point: BoundaryPoint,
  ftPerPixel: number,
  thresholdFt = BOUNDARY_CONNECTION_THRESHOLD_FT,
): boolean {
  if (boundary.length < 2 || ftPerPixel <= 0) return false;
  const distPx = distancePointToBoundary(boundary, point);
  return distPx * ftPerPixel <= thresholdFt;
}

export function snapToBoundary(
  boundary: BoundaryPoint[],
  point: BoundaryPoint,
): BoundaryPoint | null {
  if (boundary.length < 2) return null;
  let best: BoundaryPoint | null = null;
  let bestDist = Infinity;
  const n = boundary.length;
  for (let i = 0; i < n; i++) {
    const a = boundary[i];
    const b = boundary[(i + 1) % n];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    let projX = a.x;
    let projY = a.y;
    if (lengthSq >= 1e-10) {
      const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq));
      projX = a.x + t * dx;
      projY = a.y + t * dy;
    }
    const d = Math.hypot(point.x - projX, point.y - projY);
    if (d < bestDist) {
      bestDist = d;
      best = { x: projX, y: projY };
    }
  }
  return best;
}

export function snapRoadPoint(
  boundary: BoundaryPoint[],
  point: BoundaryPoint,
  ftPerPixel: number,
  network: RoadNetwork | null,
): { point: BoundaryPoint; snappedNodeId: string | null; snappedToNetworkPoint: boolean } {
  const thresholdPx = NODE_SNAP_THRESHOLD_FT / ftPerPixel;
  let bestDist = thresholdPx;
  let bestPoint: BoundaryPoint | null = null;
  let bestNodeId: string | null = null;

  if (network) {
    for (const node of network.nodes) {
      const d = Math.hypot(point.x - node.x, point.y - node.y);
      if (d < bestDist) {
        bestDist = d;
        bestPoint = { x: node.x, y: node.y };
        bestNodeId = node.id;
      }
    }

    for (const segment of network.segments) {
      segment.points.forEach((pt, i) => {
        const d = Math.hypot(point.x - pt.x, point.y - pt.y);
        if (d < bestDist) {
          bestDist = d;
          bestPoint = { x: pt.x, y: pt.y };
          if (i === 0) {
            bestNodeId = segment.startNodeId;
          } else if (i === segment.points.length - 1) {
            bestNodeId = segment.endNodeId;
          } else {
            bestNodeId = null;
          }
        }
      });
    }
  }

  if (bestPoint) {
    return { point: bestPoint, snappedNodeId: bestNodeId, snappedToNetworkPoint: true };
  }

  if (isNearBoundary(boundary, point, ftPerPixel)) {
    const onBoundary = snapToBoundary(boundary, point);
    if (onBoundary) {
      return { point: onBoundary, snappedNodeId: null, snappedToNetworkPoint: false };
    }
  }

  return { point, snappedNodeId: null, snappedToNetworkPoint: false };
}

export type SegmentEdgeHit = {
  segmentId: string;
  insertIndex: number;
  point: BoundaryPoint;
};

type SegmentEdgeCandidate = {
  hit: SegmentEdgeHit;
  dist: number;
};

function projectPointOnSegment(
  point: BoundaryPoint,
  a: BoundaryPoint,
  b: BoundaryPoint,
): { point: BoundaryPoint; t: number } | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq < 1e-10) return null;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq));
  return { point: { x: a.x + t * dx, y: a.y + t * dy }, t };
}

function closestPointOnPolylineSamples(
  point: BoundaryPoint,
  samples: BoundaryPoint[],
): BoundaryPoint | null {
  let best: { point: BoundaryPoint; dist: number } | null = null;
  for (let i = 0; i < samples.length - 1; i++) {
    const projected = projectPointOnSegment(point, samples[i], samples[i + 1]);
    if (!projected) continue;
    const dist = Math.hypot(point.x - projected.point.x, point.y - projected.point.y);
    if (!best || dist < best.dist) {
      best = { point: projected.point, dist };
    }
  }
  return best?.point ?? null;
}

export function findSegmentEdgeHit(
  network: RoadNetwork,
  point: BoundaryPoint,
  ftPerPixel: number,
  boundary: BoundaryPoint[] = [],
): SegmentEdgeHit | null {
  const thresholdPx = SEGMENT_INSERT_THRESHOLD_FT / ftPerPixel;
  let best: SegmentEdgeCandidate | null = null;

  for (const node of network.nodes) {
    if (Math.hypot(point.x - node.x, point.y - node.y) <= thresholdPx) {
      return null;
    }
  }

  const candidateForSegment = (
    segment: RoadSegment,
    projected: BoundaryPoint,
    dist: number,
  ): SegmentEdgeCandidate | null => {
    if (dist > thresholdPx) return null;
    return {
      hit: {
        segmentId: segment.id,
        insertIndex: Math.max(1, segment.points.length - 1),
        point: projected,
      },
      dist,
    };
  };

  const closestGraphSegment = (polylineId: string | undefined, projected: BoundaryPoint) => {
    const candidates = network.segments.filter((seg) => seg.polylineId === polylineId);
    let match: { segment: RoadSegment; dist: number } | null = null;
    for (const segment of candidates) {
      const start = findNode(network, segment.startNodeId);
      const end = findNode(network, segment.endNodeId);
      if (!start || !end) continue;
      const proj = projectPointOnSegment(projected, start, end);
      if (!proj) continue;
      const dist = Math.hypot(projected.x - proj.point.x, projected.y - proj.point.y);
      if (!match || dist < match.dist) {
        match = { segment, dist };
      }
    }
    return match?.segment ?? null;
  };

  if ((network.polylines?.length ?? 0) > 0 && boundary.length >= 2) {
    const nodeRoles = getNodeRoles(network, boundary, ftPerPixel);
    for (const polyline of network.polylines) {
      const chain = polylineControlPoints(network, polyline);
      if (chain.length < 2) continue;
      const path = buildRoadPath(
        chain,
        ftPerPixel,
        buildRoadPathOptionsForChain(
          chain,
          network,
          boundary,
          ftPerPixel,
          nodeRoles,
          polyline.nodeIds,
        ),
      );
      const samples = denseSampleRoadPath(path.segments, 2);
      for (let i = 0; i < samples.length - 1; i++) {
        const proj = projectPointOnSegment(point, samples[i], samples[i + 1]);
        if (!proj || proj.t <= 0.02 || proj.t >= 0.98) continue;
        const dist = Math.hypot(point.x - proj.point.x, point.y - proj.point.y);
        const segment = closestGraphSegment(polyline.id, proj.point);
        const candidate = segment ? candidateForSegment(segment, proj.point, dist) : null;
        if (candidate && (!best || candidate.dist < best.dist)) best = candidate;
      }
    }
    return best?.hit ?? null;
  }

  for (const segment of network.segments) {
    for (const pt of segment.points) {
      if (Math.hypot(point.x - pt.x, point.y - pt.y) <= thresholdPx) {
        return null;
      }
    }

    for (let i = 0; i < segment.points.length - 1; i++) {
      const a = segment.points[i];
      const b = segment.points[i + 1];
      const proj = projectPointOnSegment(point, a, b);
      if (!proj || proj.t <= 0.08 || proj.t >= 0.92) continue;

      const dist = Math.hypot(point.x - proj.point.x, point.y - proj.point.y);
      const candidate = candidateForSegment(segment, proj.point, dist);
      if (candidate && (!best || candidate.dist < best.dist)) best = candidate;
    }
  }

  return best?.hit ?? null;
}

function normalizeVec(dx: number, dy: number): BoundaryPoint {
  const len = Math.hypot(dx, dy);
  if (len < 1e-10) return { x: 1, y: 0 };
  return { x: dx / len, y: dy / len };
}

/** Inward unit normal at the closest property boundary edge to a point. */
export function inwardNormalAtBoundary(
  boundary: BoundaryPoint[],
  point: BoundaryPoint,
): BoundaryPoint | null {
  if (boundary.length < 2) return null;

  let bestA: BoundaryPoint | null = null;
  let bestB: BoundaryPoint | null = null;
  let bestDist = Infinity;
  const n = boundary.length;

  for (let i = 0; i < n; i++) {
    const a = boundary[i];
    const b = boundary[(i + 1) % n];
    const d = distancePointToSegment(point.x, point.y, a.x, a.y, b.x, b.y);
    if (d < bestDist) {
      bestDist = d;
      bestA = a;
      bestB = b;
    }
  }

  if (!bestA || !bestB) return null;

  const tangent = normalizeVec(bestB.x - bestA.x, bestB.y - bestA.y);
  const perpA = { x: -tangent.y, y: tangent.x };
  const perpB = { x: tangent.y, y: -tangent.x };
  const probe = 4;

  if (isInsideBoundary(boundary, point.x + perpA.x * probe, point.y + perpA.y * probe)) {
    return perpA;
  }
  if (isInsideBoundary(boundary, point.x + perpB.x * probe, point.y + perpB.y * probe)) {
    return perpB;
  }

  return perpA;
}

export function buildRoadPathOptionsForChain(
  chain: BoundaryPoint[],
  network: RoadNetwork,
  boundary: BoundaryPoint[],
  ftPerPixel: number,
  nodeRoles: Map<string, RoadEndpointRole>,
  polylineNodeIds?: string[],
): BuildRoadPathOptions {
  if (chain.length < 2 || boundary.length < 2 || ftPerPixel <= 0) return {};

  const thresholdPx = NODE_SNAP_THRESHOLD_FT / ftPerPixel;
  const opts: BuildRoadPathOptions = {};

  const startId = findNodeIdAtPoint(network, chain[0], thresholdPx);
  if (startId && nodeRoles.get(startId) === 'entrance') {
    const inward = inwardNormalAtBoundary(boundary, chain[0]);
    if (inward) opts.startEntrance = { inwardNormal: inward };
  }

  const endId = findNodeIdAtPoint(network, chain[chain.length - 1], thresholdPx);
  if (endId && nodeRoles.get(endId) === 'entrance') {
    const inward = inwardNormalAtBoundary(boundary, chain[chain.length - 1]);
    if (inward) opts.endEntrance = { inwardNormal: inward };
  }

  if (polylineNodeIds && polylineNodeIds.length === chain.length) {
    const junctionCornerIndices = new Set<number>();
    for (let i = 1; i < polylineNodeIds.length - 1; i++) {
      if (countNodeConnections(network, polylineNodeIds[i]) >= 3) {
        junctionCornerIndices.add(i);
      }
    }
    if (junctionCornerIndices.size > 0) {
      opts.junctionCornerIndices = junctionCornerIndices;
    }
  }

  return opts;
}

export function buildRoadPathOptionsForDrawing(
  drawing: RoadDrawingState,
  network: RoadNetwork,
  boundary: BoundaryPoint[],
  ftPerPixel: number,
  nodeRoles: Map<string, RoadEndpointRole>,
): BuildRoadPathOptions {
  if (drawing.points.length < 2 || boundary.length < 2 || ftPerPixel <= 0) return {};

  const opts: BuildRoadPathOptions = {};
  const thresholdPx = NODE_SNAP_THRESHOLD_FT / ftPerPixel;

  if (drawing.fromNodeId && nodeRoles.get(drawing.fromNodeId) === 'entrance') {
    const inward = inwardNormalAtBoundary(boundary, drawing.points[0]);
    if (inward) opts.startEntrance = { inwardNormal: inward };
  } else {
    const startId = findNodeIdAtPoint(network, drawing.points[0], thresholdPx);
    if (startId && nodeRoles.get(startId) === 'entrance') {
      const inward = inwardNormalAtBoundary(boundary, drawing.points[0]);
      if (inward) opts.startEntrance = { inwardNormal: inward };
    }
  }

  return opts;
}

export function insertPointOnSegment(network: RoadNetwork, hit: SegmentEdgeHit): RoadNetwork {
  return {
    ...network,
    segments: network.segments.map((segment) => {
      if (segment.id !== hit.segmentId) return segment;
      const points = [...segment.points];
      points.splice(hit.insertIndex, 0, { ...hit.point });
      return { ...segment, points };
    }),
  };
}

export type SegmentInsertResult = {
  network: RoadNetwork;
  insertedPoint: BoundaryPoint;
  nodeId: string;
};

export function tryInsertPointOnSegment(
  network: RoadNetwork,
  point: BoundaryPoint,
  ftPerPixel: number,
  boundary: BoundaryPoint[] = [],
): SegmentInsertResult | null {
  const hit = findSegmentEdgeHit(network, point, ftPerPixel, boundary);
  if (!hit) return null;
  const inserted = insertPointOnSegment(network, hit);
  const promoted = promoteJunctionAtPoint(inserted, hit.point, ftPerPixel);
  return {
    network: normalizeRoadNetwork(promoted.network, ftPerPixel),
    insertedPoint: hit.point,
    nodeId: promoted.nodeId,
  };
}

export function countNodeConnections(network: RoadNetwork, nodeId: string): number {
  return network.segments.filter((s) => s.startNodeId === nodeId || s.endNodeId === nodeId).length;
}

export function classifyNodeRole(
  node: RoadNode,
  boundary: BoundaryPoint[],
  ftPerPixel: number,
  connectionCount: number,
): RoadEndpointRole {
  if (connectionCount >= 2) return 'junction';
  if (isNearBoundary(boundary, node, ftPerPixel)) return 'entrance';
  return 'dead-end';
}

export function getNodeRoles(
  network: RoadNetwork,
  boundary: BoundaryPoint[],
  ftPerPixel: number | null,
): Map<string, RoadEndpointRole> {
  const roles = new Map<string, RoadEndpointRole>();
  if (!ftPerPixel) return roles;
  for (const node of network.nodes) {
    const count = countNodeConnections(network, node.id);
    roles.set(node.id, classifyNodeRole(node, boundary, ftPerPixel, count));
  }
  return roles;
}

export function findNode(network: RoadNetwork, nodeId: string): RoadNode | undefined {
  return network.nodes.find((n) => n.id === nodeId);
}

function findOrCreateNode(network: RoadNetwork, point: BoundaryPoint, existingId?: string | null): RoadNode {
  if (existingId) {
    const existing = findNode(network, existingId);
    if (existing) return existing;
  }
  const node: RoadNode = { id: createRoadNodeId(), x: point.x, y: point.y };
  network.nodes.push(node);
  return node;
}

function snapThresholdPx(ftPerPixel: number): number {
  return NODE_SNAP_THRESHOLD_FT / ftPerPixel;
}

function pointsNear(a: BoundaryPoint, b: BoundaryPoint, thresholdPx: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= thresholdPx;
}

function findNodeIdAtPoint(
  network: RoadNetwork,
  point: BoundaryPoint,
  thresholdPx: number,
): string | null {
  let bestId: string | null = null;
  let bestDist = thresholdPx;

  for (const node of network.nodes) {
    const d = Math.hypot(point.x - node.x, point.y - node.y);
    if (d < bestDist) {
      bestDist = d;
      bestId = node.id;
    }
  }

  for (const seg of network.segments) {
    const last = seg.points.length - 1;
    seg.points.forEach((pt, i) => {
      const d = Math.hypot(point.x - pt.x, point.y - pt.y);
      if (d >= bestDist) return;
      if (i === 0) {
        bestDist = d;
        bestId = seg.startNodeId;
      } else if (i === last) {
        bestDist = d;
        bestId = seg.endNodeId;
      }
    });
  }

  return bestId;
}

function resolveRoadNode(
  network: RoadNetwork,
  point: BoundaryPoint,
  ftPerPixel: number,
  preferredId?: string | null,
): RoadNode {
  if (preferredId) {
    const preferred = findNode(network, preferredId);
    if (preferred) return preferred;
  }
  const existingId = findNodeIdAtPoint(network, point, snapThresholdPx(ftPerPixel));
  if (existingId) {
    const existing = findNode(network, existingId);
    if (existing) return existing;
  }
  return findOrCreateNode(network, point);
}

function pruneOrphanNodes(network: RoadNetwork): RoadNetwork {
  const used = new Set<string>();
  for (const seg of network.segments) {
    used.add(seg.startNodeId);
    used.add(seg.endNodeId);
  }
  return {
    ...network,
    polylines: network.polylines ?? [],
    nodes: network.nodes.filter((n) => used.has(n.id)),
  };
}

function syncSegmentEndpointsToNodes(network: RoadNetwork): RoadNetwork {
  const nodeById = new Map(network.nodes.map((n) => [n.id, n]));
  return {
    nodes: network.nodes,
    polylines: network.polylines ?? [],
    segments: network.segments.map((seg) => {
      const start = nodeById.get(seg.startNodeId);
      const end = nodeById.get(seg.endNodeId);
      if (!start || !end) return seg;
      return {
        ...seg,
        points: [
          { x: start.x, y: start.y },
          { x: end.x, y: end.y },
        ],
      };
    }),
  };
}

function dedupeSegments(network: RoadNetwork): RoadNetwork {
  const seen = new Set<string>();
  const segments = network.segments.filter((seg) => {
    const key = [seg.startNodeId, seg.endNodeId].sort().join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return seg.startNodeId !== seg.endNodeId;
  });
  return { ...network, segments };
}

function mergeCoincidentNodes(network: RoadNetwork, ftPerPixel: number): RoadNetwork {
  const thresholdPx = snapThresholdPx(ftPerPixel);
  const parent = new Map<string, string>();

  const findRoot = (id: string): string => {
    const p = parent.get(id);
    if (!p || p === id) return id;
    const root = findRoot(p);
    parent.set(id, root);
    return root;
  };

  const union = (a: string, b: string) => {
    const ra = findRoot(a);
    const rb = findRoot(b);
    if (ra !== rb) parent.set(rb, ra);
  };

  for (const node of network.nodes) parent.set(node.id, node.id);

  for (let i = 0; i < network.nodes.length; i++) {
    for (let j = i + 1; j < network.nodes.length; j++) {
      const a = network.nodes[i];
      const b = network.nodes[j];
      if (pointsNear(a, b, thresholdPx)) union(a.id, b.id);
    }
  }

  const hasMerge = network.nodes.some((n) => findRoot(n.id) !== n.id);
  if (!hasMerge) return network;

  const rootIds = [...new Set(network.nodes.map((n) => findRoot(n.id)))];
  const mergedNodes: RoadNode[] = rootIds.map((rootId) => {
    const cluster = network.nodes.filter((n) => findRoot(n.id) === rootId);
    const x = cluster.reduce((sum, n) => sum + n.x, 0) / cluster.length;
    const y = cluster.reduce((sum, n) => sum + n.y, 0) / cluster.length;
    return { id: rootId, x, y };
  });

  const segments = network.segments.map((seg) => ({
    ...seg,
    startNodeId: findRoot(seg.startNodeId),
    endNodeId: findRoot(seg.endNodeId),
  }));

  const polylines = (network.polylines ?? []).map((pl) => ({
    id: pl.id,
    nodeIds: dedupeConsecutiveNodeIds(pl.nodeIds.map((id) => findRoot(id))),
  }));

  return { nodes: mergedNodes, segments, polylines };
}

function clonePolylines(polylines: RoadPolyline[] | undefined): RoadPolyline[] {
  return (polylines ?? []).map((pl) => ({ id: pl.id, nodeIds: [...pl.nodeIds] }));
}

function dedupeConsecutiveNodeIds(nodeIds: string[]): string[] {
  const out: string[] = [];
  for (const id of nodeIds) {
    if (out.length === 0 || out[out.length - 1] !== id) out.push(id);
  }
  return out;
}

function replacePolylineNodeSequence(
  polylines: RoadPolyline[],
  polylineId: string | undefined,
  startNodeId: string,
  endNodeId: string,
  expandedNodeIds: string[],
): RoadPolyline[] {
  if (!polylineId) return polylines;
  return polylines.map((pl) => {
    if (pl.id !== polylineId) return pl;
    const startIdx = pl.nodeIds.indexOf(startNodeId);
    const endIdx = pl.nodeIds.indexOf(endNodeId);
    if (startIdx < 0 || endIdx <= startIdx) return pl;
    const nodeIds = [
      ...pl.nodeIds.slice(0, startIdx),
      ...expandedNodeIds,
      ...pl.nodeIds.slice(endIdx + 1),
    ];
    return { ...pl, nodeIds: dedupeConsecutiveNodeIds(nodeIds) };
  });
}

function pruneOrphanPolylines(network: RoadNetwork): RoadNetwork {
  const used = new Set<string>();
  for (const seg of network.segments) {
    if (seg.polylineId) used.add(seg.polylineId);
  }
  const polylines = (network.polylines ?? []).filter((pl) => used.has(pl.id));
  return { ...network, polylines };
}

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function inferPolylinesFromChains(network: RoadNetwork): RoadPolyline[] {
  const chains = extractCenterlineChains(network);
  return chains
    .map((chain) => {
      const nodeIds: string[] = [];
      for (const pt of chain) {
        let matched: string | null = null;
        for (const node of network.nodes) {
          if (Math.hypot(node.x - pt.x, node.y - pt.y) < 1e-3) {
            matched = node.id;
            break;
          }
        }
        if (matched && (nodeIds.length === 0 || nodeIds[nodeIds.length - 1] !== matched)) {
          nodeIds.push(matched);
        }
      }
      return nodeIds.length >= 2 ? { id: createRoadPolylineId(), nodeIds } : null;
    })
    .filter((pl): pl is RoadPolyline => pl !== null);
}

function tagSegmentsWithInferredPolylines(network: RoadNetwork): RoadNetwork {
  const polylines = inferPolylinesFromChains(network);
  const edgeToPolyline = new Map<string, string>();
  for (const pl of polylines) {
    for (let i = 0; i < pl.nodeIds.length - 1; i++) {
      edgeToPolyline.set(edgeKey(pl.nodeIds[i], pl.nodeIds[i + 1]), pl.id);
    }
  }
  const segments = network.segments.map((seg) => {
    if (seg.polylineId) return seg;
    const plId = edgeToPolyline.get(edgeKey(seg.startNodeId, seg.endNodeId));
    return plId ? { ...seg, polylineId: plId } : seg;
  });
  return { ...network, polylines, segments };
}

function ensurePolylines(network: RoadNetwork): RoadNetwork {
  if ((network.polylines?.length ?? 0) > 0) return { ...network, polylines: network.polylines ?? [] };
  if (network.segments.length === 0) return { ...network, polylines: [] };
  return tagSegmentsWithInferredPolylines(network);
}

/** Split polylines so every bend is a graph node and each segment is a single edge. */
function splitMultiPointSegments(network: RoadNetwork): RoadNetwork {
  const next: RoadNetwork = {
    nodes: [...network.nodes],
    segments: [],
    polylines: clonePolylines(network.polylines),
  };

  for (const seg of network.segments) {
    if (seg.points.length <= 2) {
      if (seg.startNodeId === seg.endNodeId) continue;
      const start = findNode(next, seg.startNodeId);
      const end = findNode(next, seg.endNodeId);
      if (!start || !end) continue;
      next.segments.push({
        id: seg.id,
        startNodeId: seg.startNodeId,
        endNodeId: seg.endNodeId,
        polylineId: seg.polylineId,
        points: [
          { x: start.x, y: start.y },
          { x: end.x, y: end.y },
        ],
      });
      continue;
    }

    const nodeIds: string[] = [];
    for (let i = 0; i < seg.points.length; i++) {
      const pt = seg.points[i];
      if (i === 0) {
        nodeIds.push(seg.startNodeId);
      } else if (i === seg.points.length - 1) {
        nodeIds.push(seg.endNodeId);
      } else {
        const node: RoadNode = { id: createRoadNodeId(), x: pt.x, y: pt.y };
        next.nodes.push(node);
        nodeIds.push(node.id);
      }
    }

    next.polylines = replacePolylineNodeSequence(
      next.polylines,
      seg.polylineId,
      seg.startNodeId,
      seg.endNodeId,
      nodeIds,
    );

    for (let i = 0; i < nodeIds.length - 1; i++) {
      if (nodeIds[i] === nodeIds[i + 1]) continue;
      const start = findNode(next, nodeIds[i]);
      const end = findNode(next, nodeIds[i + 1]);
      if (!start || !end) continue;
      next.segments.push({
        id: i === 0 ? seg.id : createRoadSegmentId(),
        startNodeId: start.id,
        endNodeId: end.id,
        polylineId: seg.polylineId,
        points: [
          { x: start.x, y: start.y },
          { x: end.x, y: end.y },
        ],
      });
    }
  }

  return next;
}

/** Ensure every road point is a connected graph node with no orphan or interior-only points. */
export function normalizeRoadNetwork(
  network: RoadNetwork,
  ftPerPixel: number | null,
): RoadNetwork {
  let next: RoadNetwork = {
    ...network,
    polylines: clonePolylines(network.polylines),
  };
  next = splitMultiPointSegments(next);
  if (ftPerPixel) {
    next = mergeCoincidentNodes(next, ftPerPixel);
    next = dedupeSegments(next);
  }
  next = syncSegmentEndpointsToNodes(next);
  next = pruneOrphanPolylines(next);
  next = ensurePolylines(next);
  return pruneOrphanNodes(next);
}

function snapEmbeddedJunctionsToPolylinePaths(
  network: RoadNetwork,
  boundary: BoundaryPoint[],
  ftPerPixel: number,
): RoadNetwork {
  if ((network.polylines?.length ?? 0) === 0 || boundary.length < 2 || ftPerPixel <= 0) {
    return network;
  }

  const nodeRoles = getNodeRoles(network, boundary, ftPerPixel);
  const nextNodeById = new Map(network.nodes.map((node) => [node.id, { ...node }]));

  for (const polyline of network.polylines) {
    const controlNodeIds = new Set(polyline.nodeIds);
    const chain = polylineControlPoints(network, polyline);
    if (chain.length < 2) continue;

    const path = buildRoadPath(
      chain,
      ftPerPixel,
      buildRoadPathOptionsForChain(
        chain,
        network,
        boundary,
        ftPerPixel,
        nodeRoles,
        polyline.nodeIds,
      ),
    );
    const samples = denseSampleRoadPath(path.segments, 2);
    if (samples.length < 2) continue;

    const embeddedNodeIds = new Set<string>();
    for (const segment of network.segments) {
      if (segment.polylineId !== polyline.id) continue;
      for (const nodeId of [segment.startNodeId, segment.endNodeId]) {
        if (!controlNodeIds.has(nodeId) && countNodeConnections(network, nodeId) >= 3) {
          embeddedNodeIds.add(nodeId);
        }
      }
    }

    for (const nodeId of embeddedNodeIds) {
      const node = nextNodeById.get(nodeId);
      if (!node) continue;
      const snapped = closestPointOnPolylineSamples(node, samples);
      if (snapped) {
        node.x = snapped.x;
        node.y = snapped.y;
      }
    }
  }

  return {
    ...network,
    nodes: network.nodes.map((node) => nextNodeById.get(node.id) ?? node),
    segments: network.segments.map((segment) => {
      const start = nextNodeById.get(segment.startNodeId);
      const end = nextNodeById.get(segment.endNodeId);
      if (!start || !end) return segment;
      return {
        ...segment,
        points: segment.points.map((pt, i) => {
          if (i === 0) return { x: start.x, y: start.y };
          if (i === segment.points.length - 1) return { x: end.x, y: end.y };
          return pt;
        }),
      };
    }),
  };
}

/** Ensure a shared graph node exists at a snapped road point (endpoint or interior junction). */
export function promoteJunctionAtPoint(
  network: RoadNetwork,
  point: BoundaryPoint,
  ftPerPixel: number,
): { network: RoadNetwork; nodeId: string } {
  const thresholdPx = snapThresholdPx(ftPerPixel);
  const existingId = findNodeIdAtPoint(network, point, thresholdPx);
  if (existingId) {
    return { network: normalizeRoadNetwork(network, ftPerPixel), nodeId: existingId };
  }

  for (const seg of network.segments) {
    for (let i = 1; i < seg.points.length - 1; i++) {
      if (!pointsNear(seg.points[i], point, thresholdPx)) continue;

      const junction: RoadNode = { id: createRoadNodeId(), x: seg.points[i].x, y: seg.points[i].y };
      const polylines = clonePolylines(network.polylines);
      const next: RoadNetwork = { nodes: [...network.nodes, junction], segments: [], polylines };

      for (const s of network.segments) {
        if (s.id !== seg.id) {
          next.segments.push(s);
          continue;
        }
        const leftPoints = s.points.slice(0, i + 1).map((pt) => ({ ...pt }));
        leftPoints[leftPoints.length - 1] = { x: junction.x, y: junction.y };
        const rightPoints = s.points.slice(i).map((pt) => ({ ...pt }));
        rightPoints[0] = { x: junction.x, y: junction.y };

        next.segments.push({
          id: s.id,
          startNodeId: s.startNodeId,
          endNodeId: junction.id,
          polylineId: s.polylineId,
          points: leftPoints,
        });
        next.segments.push({
          id: createRoadSegmentId(),
          startNodeId: junction.id,
          endNodeId: s.endNodeId,
          polylineId: s.polylineId,
          points: rightPoints,
        });
      }

      return { network: normalizeRoadNetwork(pruneOrphanNodes(next), ftPerPixel), nodeId: junction.id };
    }
  }

  const junction: RoadNode = { id: createRoadNodeId(), x: point.x, y: point.y };
  const next: RoadNetwork = {
    nodes: [...network.nodes, junction],
    polylines: clonePolylines(network.polylines),
    segments: network.segments.map((seg) => {
      let startNodeId = seg.startNodeId;
      let endNodeId = seg.endNodeId;
      const points = seg.points.map((pt) => ({ ...pt }));
      if (pointsNear(points[0], point, thresholdPx)) {
        startNodeId = junction.id;
        points[0] = { x: junction.x, y: junction.y };
      }
      const last = points.length - 1;
      if (pointsNear(points[last], point, thresholdPx)) {
        endNodeId = junction.id;
        points[last] = { x: junction.x, y: junction.y };
      }
      for (let i = 1; i < last; i++) {
        if (pointsNear(points[i], point, thresholdPx)) {
          points[i] = { x: junction.x, y: junction.y };
        }
      }
      return { ...seg, startNodeId, endNodeId, points };
    }),
  };

  return { network: normalizeRoadNetwork(pruneOrphanNodes(next), ftPerPixel), nodeId: junction.id };
}

export function commitDrawingSegment(
  network: RoadNetwork,
  drawing: RoadDrawingState,
  ftPerPixel: number,
  endSnappedNodeId?: string | null,
): { network: RoadNetwork; drawing: RoadDrawingState | null } {
  if (drawing.points.length < 2) {
    return { network, drawing };
  }

  const startPoint = drawing.points[0];
  const endPoint = drawing.points[drawing.points.length - 1];
  const spanPx = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
  if (spanPx < 1e-6 && drawing.points.length < 3) {
    return { network, drawing };
  }

  const next: RoadNetwork = {
    nodes: [...network.nodes],
    segments: [...network.segments],
    polylines: clonePolylines(network.polylines),
  };

  const resolvedIds: string[] = [];
  for (let i = 0; i < drawing.points.length; i++) {
    const preferredId =
      i === 0
        ? drawing.fromNodeId
        : i === drawing.points.length - 1
          ? endSnappedNodeId
          : null;
    const node = resolveRoadNode(next, drawing.points[i], ftPerPixel, preferredId);
    resolvedIds.push(node.id);
  }

  const chain: string[] = [resolvedIds[0]];
  for (let i = 1; i < resolvedIds.length; i++) {
    if (resolvedIds[i] !== chain[chain.length - 1]) {
      chain.push(resolvedIds[i]);
    }
  }

  if (chain.length < 2) {
    return { network, drawing };
  }

  const polylineId = createRoadPolylineId();
  const polyline: RoadPolyline = { id: polylineId, nodeIds: [...chain] };

  for (let i = 0; i < chain.length - 1; i++) {
    const startNode = findNode(next, chain[i]);
    const endNode = findNode(next, chain[i + 1]);
    if (!startNode || !endNode) continue;

    next.segments.push({
      id: createRoadSegmentId(),
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      polylineId,
      points: [
        { x: startNode.x, y: startNode.y },
        { x: endNode.x, y: endNode.y },
      ],
    });
  }

  next.polylines.push(polyline);

  return { network: normalizeRoadNetwork(next, ftPerPixel), drawing: null };
}

export function addDrawingPoint(
  network: RoadNetwork,
  drawing: RoadDrawingState | null,
  point: BoundaryPoint,
  snappedNodeId: string | null,
  ftPerPixel: number,
): { network: RoadNetwork; drawing: RoadDrawingState | null; completedLoop: boolean } {
  if (!drawing) {
    if (snappedNodeId) {
      const node = findNode(network, snappedNodeId);
      if (!node) {
        return {
          network,
          drawing: { points: [point], fromNodeId: null },
          completedLoop: false,
        };
      }
      return {
        network,
        drawing: { points: [{ x: node.x, y: node.y }], fromNodeId: snappedNodeId },
        completedLoop: false,
      };
    }
    return {
      network,
      drawing: { points: [point], fromNodeId: null },
      completedLoop: false,
    };
  }

  if (snappedNodeId && drawing.points.length >= 1) {
    const node = findNode(network, snappedNodeId);
    if (node) {
      if (snappedNodeId === drawing.fromNodeId && drawing.points.length < 2) {
        return {
          network,
          drawing: { ...drawing, points: [...drawing.points, { x: node.x, y: node.y }] },
          completedLoop: false,
        };
      }
      const pointsWithEnd = [...drawing.points, { x: node.x, y: node.y }];
      const result = commitDrawingSegment(network, {
        points: pointsWithEnd,
        fromNodeId: drawing.fromNodeId,
      }, ftPerPixel, snappedNodeId);
      if (result.network === network) {
        return { network, drawing, completedLoop: false };
      }
      return {
        network: result.network,
        drawing: null,
        completedLoop: snappedNodeId === drawing.fromNodeId,
      };
    }
  }

  return {
    network,
    drawing: { ...drawing, points: [...drawing.points, point] },
    completedLoop: false,
  };
}

export function undoRoadEdit(
  network: RoadNetwork,
  drawing: RoadDrawingState | null,
  ftPerPixel: number | null = null,
): { network: RoadNetwork; drawing: RoadDrawingState | null } {
  if (drawing && drawing.points.length > 0) {
    const nextPoints = drawing.points.slice(0, -1);
    if (nextPoints.length === 0) {
      return { network, drawing: null };
    }
    return { network, drawing: { ...drawing, points: nextPoints } };
  }
  if (network.segments.length === 0) {
    return { network, drawing: null };
  }
  const removed = network.segments[network.segments.length - 1];
  const segments = network.segments.slice(0, -1);
  let polylines = clonePolylines(network.polylines);
  if (removed?.polylineId) {
    polylines = polylines
      .map((pl) => {
        if (pl.id !== removed.polylineId) return pl;
        const nodeIds = rebuildPolylineNodeIds(pl, segments);
        return nodeIds.length >= 2 ? { ...pl, nodeIds } : null;
      })
      .filter((pl): pl is RoadPolyline => pl !== null);
  }
  const next: RoadNetwork = {
    nodes: [...network.nodes],
    segments,
    polylines,
  };
  return { network: normalizeRoadNetwork(next, ftPerPixel), drawing: null };
}

export function buildSegmentPath(
  segment: RoadSegment,
  ftPerPixel: number,
  options: BuildRoadPathOptions = {},
): RoadPathResult | null {
  if (segment.points.length < 2) return null;
  return buildRoadPath(segment.points, ftPerPixel, options);
}

/** Preview path for the current in-progress segment only (ignores other road arms). */
export function buildDrawingPreviewPath(
  drawing: RoadDrawingState,
  ftPerPixel: number,
  options: BuildRoadPathOptions = {},
): RoadPathResult | null {
  if (drawing.points.length < 2 || ftPerPixel <= 0) return null;
  return buildRoadPath(drawing.points, ftPerPixel, options);
}

function rebuildPolylineNodeIds(polyline: RoadPolyline, segments: RoadSegment[]): string[] {
  const edges = segments.filter((s) => s.polylineId === polyline.id);
  if (edges.length === 0) return [];

  const startId =
    polyline.nodeIds.find((id) =>
      edges.some((e) => e.startNodeId === id || e.endNodeId === id),
    ) ?? edges[0].startNodeId;

  const nodeIds = [startId];
  const usedEdges = new Set<string>();

  while (true) {
    const current = nodeIds[nodeIds.length - 1];
    const nextEdge = edges.find((e) => {
      const key = edgeKey(e.startNodeId, e.endNodeId);
      if (usedEdges.has(key)) return false;
      return e.startNodeId === current || e.endNodeId === current;
    });
    if (!nextEdge) break;
    usedEdges.add(edgeKey(nextEdge.startNodeId, nextEdge.endNodeId));
    const nextId =
      nextEdge.startNodeId === current ? nextEdge.endNodeId : nextEdge.startNodeId;
    if (nextId === current) break;
    nodeIds.push(nextId);
  }

  return dedupeConsecutiveNodeIds(nodeIds);
}

export function polylineControlPoints(
  network: RoadNetwork,
  polyline: RoadPolyline,
): BoundaryPoint[] {
  return polyline.nodeIds
    .map((id) => findNode(network, id))
    .filter((n): n is RoadNode => Boolean(n))
    .map((n) => ({ x: n.x, y: n.y }));
}

/**
 * Independent centerline geometry per placement commit.
 * Each polyline is rendered separately so branches never share beziers.
 */
export function extractRenderPolylines(
  network: RoadNetwork,
  options: CenterlineChainOptions = {},
): BoundaryPoint[][] {
  const polylines = network.polylines ?? [];
  if (polylines.length > 0) {
    return polylines
      .map((pl) => polylineControlPoints(network, pl))
      .filter((pts) => pts.length >= 2);
  }
  return extractCenterlineChains(network, options);
}

export function buildAllSegmentPaths(
  network: RoadNetwork,
  ftPerPixel: number,
): { segmentId: string; path: RoadPathResult }[] {
  return network.segments
    .map((seg) => {
      const path = buildSegmentPath(seg, ftPerPixel);
      return path ? { segmentId: seg.id, path } : null;
    })
    .filter((x): x is { segmentId: string; path: RoadPathResult } => x !== null);
}

export type CenterlineChainOptions = {
  /** Treat these nodes as junctions when walking chains (e.g. active branch origin). */
  virtualJunctions?: ReadonlySet<string>;
};

/** Walk connected node chains (stop at junctions and dead-ends). */
export function extractCenterlineChains(
  network: RoadNetwork,
  options: CenterlineChainOptions = {},
): BoundaryPoint[][] {
  if (network.segments.length === 0) return [];

  const virtualJunctions = options.virtualJunctions ?? new Set<string>();
  const nodeById = new Map(network.nodes.map((n) => [n.id, n]));
  const adjacency = new Map<string, string[]>();

  for (const seg of network.segments) {
    if (!adjacency.has(seg.startNodeId)) adjacency.set(seg.startNodeId, []);
    if (!adjacency.has(seg.endNodeId)) adjacency.set(seg.endNodeId, []);
    adjacency.get(seg.startNodeId)!.push(seg.endNodeId);
    adjacency.get(seg.endNodeId)!.push(seg.startNodeId);
  }

  const usedEdges = new Set<string>();
  const chains: BoundaryPoint[][] = [];

  const extendChain = (startId: string, nextId: string): BoundaryPoint[] => {
    const chain: BoundaryPoint[] = [];
    let prev = startId;
    let current = nextId;
    const startNode = nodeById.get(startId);
    if (startNode) chain.push({ x: startNode.x, y: startNode.y });

    while (true) {
      usedEdges.add(edgeKey(prev, current));
      const node = nodeById.get(current);
      if (node) chain.push({ x: node.x, y: node.y });

      if (virtualJunctions.has(current)) break;

      const neighbors = adjacency.get(current) ?? [];
      const candidates = neighbors.filter(
        (n) => n !== prev && !usedEdges.has(edgeKey(current, n)),
      );

      if (candidates.length !== 1) break;
      prev = current;
      current = candidates[0];
    }

    return chain;
  };

  for (const node of network.nodes) {
    const neighbors = adjacency.get(node.id) ?? [];
    if (neighbors.length === 2) continue;

    for (const next of neighbors) {
      const key = edgeKey(node.id, next);
      if (usedEdges.has(key)) continue;
      const chain = extendChain(node.id, next);
      if (chain.length >= 2) chains.push(chain);
    }
  }

  for (const seg of network.segments) {
    const key = edgeKey(seg.startNodeId, seg.endNodeId);
    if (usedEdges.has(key)) continue;
    const chain = extendChain(seg.startNodeId, seg.endNodeId);
    if (chain.length >= 2) chains.push(chain);
  }

  return chains;
}

export function migrateLinearRoadPoints(points: BoundaryPoint[]): RoadNetwork {
  if (points.length < 2) return emptyRoadNetwork();
  const nodes: RoadNode[] = points.map((pt) => ({
    id: createRoadNodeId(),
    x: pt.x,
    y: pt.y,
  }));
  const polylineId = createRoadPolylineId();
  const nodeIds = nodes.map((n) => n.id);
  const segments: RoadSegment[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    segments.push({
      id: createRoadSegmentId(),
      startNodeId: nodes[i].id,
      endNodeId: nodes[i + 1].id,
      polylineId,
      points: [
        { x: nodes[i].x, y: nodes[i].y },
        { x: nodes[i + 1].x, y: nodes[i + 1].y },
      ],
    });
  }
  return {
    nodes,
    segments,
    polylines: [{ id: polylineId, nodeIds }],
  };
}

export function networkStats(network: RoadNetwork, ftPerPixel: number | null) {
  const paths =
    ftPerPixel != null
      ? extractRenderPolylines(network).map((chain) => buildRoadPath(chain, ftPerPixel))
      : [];
  const totalLengthFt = paths.reduce((sum, p) => sum + p.lengthFt, 0);
  const allCorners = paths.flatMap((p) => p.corners);
  const allWarnings = [...new Set(paths.flatMap((p) => p.warnings))];
  return {
    segmentCount: network.segments.length,
    nodeCount: network.nodes.length,
    pointCount: network.segments.reduce((n, s) => n + s.points.length, 0),
    totalLengthFt,
    corners: allCorners,
    warnings: allWarnings,
  };
}

export type RoadDragTarget = { type: 'node'; nodeId: string };

export function findRoadDragTarget(
  network: RoadNetwork,
  point: BoundaryPoint,
  ftPerPixel: number,
): RoadDragTarget | null {
  const thresholdPx = NODE_SNAP_THRESHOLD_FT / ftPerPixel;
  let best: { target: RoadDragTarget; dist: number } | null = null;

  for (const node of network.nodes) {
    const dist = Math.hypot(point.x - node.x, point.y - node.y);
    if (dist <= thresholdPx && (!best || dist < best.dist)) {
      best = { target: { type: 'node', nodeId: node.id }, dist };
    }
  }

  return best?.target ?? null;
}

export function moveRoadDragTarget(
  network: RoadNetwork,
  target: RoadDragTarget,
  rawPoint: BoundaryPoint,
  boundary: BoundaryPoint[],
  ftPerPixel: number,
): RoadNetwork {
  const { point } = snapRoadPoint(boundary, rawPoint, ftPerPixel, null);

  const next: RoadNetwork = {
    nodes: network.nodes.map((node) =>
      node.id === target.nodeId ? { ...node, x: point.x, y: point.y } : node,
    ),
    polylines: network.polylines ?? [],
    segments: network.segments.map((segment) => ({
      ...segment,
      points: segment.points.map((pt, i) => {
        if (i === 0 && segment.startNodeId === target.nodeId) {
          return { x: point.x, y: point.y };
        }
        if (i === segment.points.length - 1 && segment.endNodeId === target.nodeId) {
          return { x: point.x, y: point.y };
        }
        return pt;
      }),
    })),
  };
  return snapEmbeddedJunctionsToPolylinePaths(next, boundary, ftPerPixel);
}

export function migrateWorkflowStep(step: string): string {
  if (step === 'design') return 'place-road';
  if (step === 'finalize-road' || step === 'road-polygon' || step === 'lot-layout') {
    return 'reposition-road';
  }
  return step;
}
