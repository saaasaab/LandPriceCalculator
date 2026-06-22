import p5 from "p5";
import { Approach } from "./Approach";
import { Edge } from "./Edge";
import { Parking } from "./Parking";
import { Property } from "./Property";
import {
  calculateEdgeNormal,
  closestPointOnSegment,
  drawPerpendicularBezier,
  getIsClockwise,
  resolveBezierGoingUpAtArrival,
  resolveBezierGoingUpAtDeparture,
} from "../../../utils/SiteplanGeneratorUtils";

export type DrivewayPathPoint =
  | { kind: "approach"; approachId: string }
  | { kind: "parking" }
  | { kind: "node"; id: string; x: number; y: number };

type ResolvedPathEntry = {
  pathIndex: number;
  kind: "approach" | "node" | "parking";
  point: p5.Vector;
  approach?: Approach;
};

type PathCrossSection = {
  left: p5.Vector;
  right: p5.Vector;
  capEdge: Edge;
};

let drivewayNodeIdCounter = 0;

export function createDrivewayNodeId(): string {
  drivewayNodeIdCounter += 1;
  return `driveway-node-${drivewayNodeIdCounter}`;
}

export function resetDrivewayNodeIdCounter(): void {
  drivewayNodeIdCounter = 0;
}

function getApproachInnerEdge(approach: Approach): {
  cornerA: p5.Vector;
  cornerB: p5.Vector;
  midpoint: p5.Vector;
} {
  const cornerA = approach.sitePlanElementCorners[0];
  const cornerB = approach.sitePlanElementCorners[1];
  const midpoint = p5.prototype.createVector(
    (cornerA.x + cornerB.x) / 2,
    (cornerA.y + cornerB.y) / 2,
  );
  return { cornerA, cornerB, midpoint };
}

function getParkingEntranceEdge(parking: Parking): {
  cornerA: p5.Vector;
  cornerB: p5.Vector;
  midpoint: p5.Vector;
} | null {
  if (!parking.entranceEdge) return null;
  const cornerA = parking.entranceEdge.point1;
  const cornerB = parking.entranceEdge.point2;
  const midpoint = parking.entranceEdge.getMidpoint();
  return { cornerA, cornerB, midpoint };
}

function createTravelEdge(
  p: p5,
  anchor: p5.Vector,
  toward: p5.Vector,
): Edge {
  const direction = p5.Vector.sub(toward, anchor);
  if (direction.magSq() < 0.001) {
    return new Edge(
      p,
      anchor,
      p.createVector(anchor.x + 1, anchor.y),
      false,
      0,
      0,
    );
  }
  direction.normalize();
  direction.mult(10);
  const end = p5.Vector.add(anchor, direction);
  return new Edge(p, anchor.copy(), end, false, 0, 0);
}

function orientEndpointPairToTravel(
  p: p5,
  endpointA: p5.Vector,
  endpointB: p5.Vector,
  travelDir: p5.Vector,
): { left: p5.Vector; right: p5.Vector } {
  const mid = p.createVector(
    (endpointA.x + endpointB.x) / 2,
    (endpointA.y + endpointB.y) / 2,
  );
  // Match node cross-sections: left = +normal, right = -normal, normal ⟂ travel
  const normal = p.createVector(-travelDir.y, travelDir.x);
  const sideA = p5.Vector.dot(p5.Vector.sub(endpointA, mid), normal);
  const left = sideA >= 0 ? endpointA : endpointB;
  const right = sideA >= 0 ? endpointB : endpointA;
  return { left, right };
}

function capTravelDirection(
  p: p5,
  entries: ResolvedPathEntry[],
  index: number,
): p5.Vector {
  const current = entries[index];
  const previous = entries[index - 1];
  const next = entries[index + 1];

  // Use the adjacent path leg so caps stay consistent (never skip over waypoints).
  if (previous) {
    return travelDirectionBetween(p, previous.point, current.point);
  }
  if (next) {
    return travelDirectionBetween(p, current.point, next.point);
  }
  return p.createVector(0, 1);
}

function approachPositionAlongEdge(approach: Approach): number {
  const roadEdge = approach.sitePlanElementEdges[2];
  const edgeVec = p5.Vector.sub(roadEdge.point2, roadEdge.point1);
  const magSq = edgeVec.magSq();
  if (magSq < 0.001) return 0;
  return p5.Vector.dot(p5.Vector.sub(approach.center, roadEdge.point1), edgeVec) / magSq;
}

function approachPositionAlongPropertyEdge(
  approach: Approach,
  property: Property,
): number {
  const edgeIndex = approach.propertyEdgeIndex;
  if (edgeIndex < 0) return approachPositionAlongEdge(approach);
  const propertyEdge = property.propertyEdges[edgeIndex];
  const edgeVec = p5.Vector.sub(propertyEdge.point2, propertyEdge.point1);
  const magSq = edgeVec.magSq();
  if (magSq < 0.001) return 0;
  return p5.Vector.dot(p5.Vector.sub(approach.center, propertyEdge.point1), edgeVec) / magSq;
}

function sortApproachesForPath(approaches: Approach[], property: Property | null): Approach[] {
  const sorted = [...approaches];
  let start = 0;

  while (start < sorted.length) {
    const edgeIndex = sorted[start].propertyEdgeIndex;
    let end = start + 1;

    while (
      end < sorted.length &&
      sorted[end].propertyEdgeIndex === edgeIndex &&
      edgeIndex >= 0
    ) {
      end += 1;
    }

    if (end - start > 1) {
      const segment = sorted
        .slice(start, end)
        .sort((a, b) => {
          if (property) {
            return approachPositionAlongPropertyEdge(a, property) - approachPositionAlongPropertyEdge(b, property);
          }
          return approachPositionAlongEdge(a) - approachPositionAlongEdge(b);
        });
      sorted.splice(start, end - start, ...segment);
    }

    start = end;
  }

  return sorted;
}

function propertyEdgeInteriorNormal(
  p: p5,
  property: Property,
  edgeIndex: number,
): p5.Vector {
  const edge = property.propertyEdges[edgeIndex];
  const outward = calculateEdgeNormal(p, edge.point1, edge.point2);
  const isClockwise = getIsClockwise(property.propertyCorners);
  return isClockwise
    ? outward.copy()
    : p.createVector(-outward.x, -outward.y);
}

function isSameEdgeApproachSegment(
  entries: ResolvedPathEntry[],
  segmentIndex: number,
): boolean {
  const current = entries[segmentIndex];
  const next = entries[segmentIndex + 1];
  return (
    current.kind === "approach" &&
    next.kind === "approach" &&
    current.approach !== undefined &&
    next.approach !== undefined &&
    approachesSharePropertyEdge(current.approach, next.approach)
  );
}

function resolveSegmentBezierGoingUp(
  p: p5,
  property: Property,
  point1: p5.Vector,
  point2: p5.Vector,
  edge1: Edge,
  edge2: Edge,
  departureEntry: ResolvedPathEntry,
  arrivalEntry: ResolvedPathEntry,
  sameEdgeApproaches: boolean,
): { goingUpAtDeparture: boolean; goingUpAtArrival: boolean } {
  if (
    sameEdgeApproaches &&
    departureEntry.approach &&
    arrivalEntry.approach &&
    departureEntry.approach.propertyEdgeIndex >= 0
  ) {
    const interior = propertyEdgeInteriorNormal(
      p,
      property,
      departureEntry.approach.propertyEdgeIndex,
    );
    return {
      goingUpAtDeparture: resolveBezierGoingUpTowardInterior(p, edge1, interior),
      goingUpAtArrival: resolveBezierGoingUpTowardInterior(p, edge2, interior),
    };
  }

  return {
    goingUpAtDeparture: resolveBezierGoingUpAtDeparture(p, point1, point2, edge1),
    goingUpAtArrival: resolveBezierGoingUpAtArrival(p, point1, point2, edge2),
  };
}

function orientInnerEdgeAlongTravel(
  approach: Approach,
  travel: p5.Vector,
): { left: p5.Vector; right: p5.Vector } {
  const inner = getApproachInnerEdge(approach);
  const projectionA = p5.Vector.dot(p5.Vector.sub(inner.cornerA, approach.center), travel);
  const projectionB = p5.Vector.dot(p5.Vector.sub(inner.cornerB, approach.center), travel);
  if (projectionA <= projectionB) {
    return { left: inner.cornerA, right: inner.cornerB };
  }
  return { left: inner.cornerB, right: inner.cornerA };
}

function resolveBezierGoingUpTowardInterior(
  p: p5,
  edge: Edge,
  interiorDir: p5.Vector,
): boolean {
  if (interiorDir.magSq() < 0.001) return true;

  const score = (goingUp: boolean) => {
    const sign = goingUp ? -1 : 1;
    const angle = edge.calculateAngle() - 90 * sign;
    const cpDir = p.createVector(p.cos(angle), p.sin(angle));
    return p5.Vector.dot(cpDir, interiorDir);
  };

  return score(true) >= score(false);
}

function approachesSharePropertyEdge(a: Approach, b: Approach): boolean {
  return (
    a.propertyEdgeIndex >= 0 &&
    a.propertyEdgeIndex === b.propertyEdgeIndex
  );
}

function resolveApproachCrossSection(
  p: p5,
  approach: Approach,
  index: number,
  entries: ResolvedPathEntry[],
): PathCrossSection {
  const innerEdge = getApproachInnerEdge(approach);
  const prev = entries[index - 1];
  const next = entries[index + 1];
  const travel = capTravelDirection(p, entries, index);

  const sameEdgePrev =
    prev?.kind === "approach" &&
    prev.approach &&
    approachesSharePropertyEdge(approach, prev.approach);
  const sameEdgeNext =
    next?.kind === "approach" &&
    next.approach &&
    approachesSharePropertyEdge(approach, next.approach);

  if (sameEdgePrev && sameEdgeNext) {
    const alongEdge = travelDirectionBetween(p, prev.point, next.point);
    const oriented = orientInnerEdgeAlongTravel(approach, alongEdge);
    return {
      left: oriented.left,
      right: oriented.right,
      capEdge: approach.sitePlanElementEdges[0],
    };
  }

  if (sameEdgePrev && !sameEdgeNext) {
    const alongEdge = next
      ? travelDirectionBetween(p, entries[index].point, next.point)
      : travelDirectionBetween(p, prev.point, entries[index].point);
    const oriented = next
      ? orientEndpointPairToTravel(p, innerEdge.cornerA, innerEdge.cornerB, alongEdge)
      : orientInnerEdgeAlongTravel(approach, alongEdge);
    return {
      left: oriented.left,
      right: oriented.right,
      capEdge: approach.sitePlanElementEdges[0],
    };
  }

  if (!sameEdgePrev && sameEdgeNext) {
    const travelToNext = travelDirectionBetween(p, entries[index].point, next.point);
    const oriented = orientInnerEdgeAlongTravel(approach, travelToNext);
    return {
      left: oriented.left,
      right: oriented.right,
      capEdge: approach.sitePlanElementEdges[0],
    };
  }

  const oriented = orientEndpointPairToTravel(
    p,
    innerEdge.cornerA,
    innerEdge.cornerB,
    travel,
  );
  return {
    left: oriented.left,
    right: oriented.right,
    capEdge: approach.sitePlanElementEdges[0],
  };
}

function travelDirectionBetween(
  p: p5,
  from: p5.Vector | undefined,
  to: p5.Vector,
): p5.Vector {
  if (!from) return p.createVector(0, 1);
  const direction = p5.Vector.sub(to, from);
  if (direction.magSq() < 0.001) return p.createVector(0, 1);
  return direction.normalize();
}

function resolveCrossSections(
  p: p5,
  entries: ResolvedPathEntry[],
  halfWidth: number,
  parking: Parking | null,
): PathCrossSection[] {
  const sections: PathCrossSection[] = [];

  entries.forEach((entry, index) => {
    const capTravel = capTravelDirection(p, entries, index);

    if (entry.kind === "approach" && entry.approach) {
      sections.push(
        resolveApproachCrossSection(p, entry.approach, index, entries),
      );
      return;
    }

    if (entry.kind === "parking" && parking?.entranceEdge) {
      const oriented = orientEndpointPairToTravel(
        p,
        parking.entranceEdge.point1,
        parking.entranceEdge.point2,
        capTravel,
      );
      sections.push({
        left: oriented.left,
        right: oriented.right,
        capEdge: parking.entranceEdge,
      });
      return;
    }

    const normal = p.createVector(-capTravel.y, capTravel.x);
    const left = p.createVector(
      entry.point.x + normal.x * halfWidth,
      entry.point.y + normal.y * halfWidth,
    );
    const right = p.createVector(
      entry.point.x - normal.x * halfWidth,
      entry.point.y - normal.y * halfWidth,
    );
    sections.push({
      left,
      right,
      capEdge: new Edge(p, left, right, false, 0, 0),
    });
  });

  return sections;
}

function getBezierControlEdge(
  p: p5,
  entry: ResolvedPathEntry,
  parking: Parking | null,
  partnerPoint: p5.Vector,
  anchorPoint: p5.Vector,
): Edge {
  if (entry.kind === "approach" && entry.approach) {
    return entry.approach.sitePlanElementEdges[2];
  }
  if (entry.kind === "parking" && parking?.entranceEdge) {
    return parking.entranceEdge;
  }
  return createTravelEdge(p, anchorPoint, partnerPoint);
}

export class EntranceDrivewayNetwork {
  public path: DrivewayPathPoint[] = [];

  syncFromApproaches(approaches: Approach[], parking: Parking | null, property: Property | null = null) {
    const sortedApproaches = sortApproachesForPath(approaches, property);
    const orderedApproachIds = sortedApproaches.map((approach) => approach.id);
    const nodes = this.path.filter(
      (point): point is Extract<DrivewayPathPoint, { kind: "node" }> => point.kind === "node",
    );
    const shouldHaveParking = Boolean(parking?.isInitialized && orderedApproachIds.length > 0);

    this.path = [
      ...orderedApproachIds.map((approachId) => ({ kind: "approach" as const, approachId })),
      ...nodes,
      ...(shouldHaveParking ? [{ kind: "parking" as const }] : []),
    ];
  }

  resolveCenterline(
    p: p5,
    approaches: Approach[],
    parking: Parking | null,
  ): p5.Vector[] {
    return this.resolvePathEntries(p, approaches, parking).map((entry) => entry.point);
  }

  insertNodeNear(
    p: p5,
    x: number,
    y: number,
    approaches: Approach[],
    parking: Parking | null,
    threshold: number,
  ): boolean {
    const approachHitThreshold = threshold * 1.5;
    const onApproach = approaches.some(
      (approach) => p.dist(x, y, approach.center.x, approach.center.y) <= approachHitThreshold,
    );
    if (onApproach) return false;

    const entries = this.resolvePathEntries(p, approaches, parking);
    if (entries.length < 2) return false;

    let bestDistance = Infinity;
    let bestSegment = -1;
    let bestPoint: p5.Vector | null = null;

    for (let i = 0; i < entries.length - 1; i += 1) {
      const start = entries[i].point;
      const end = entries[i + 1].point;
      const closest = closestPointOnSegment(x, y, start.x, start.y, end.x, end.y);
      if (closest.dist < bestDistance) {
        bestDistance = closest.dist;
        bestSegment = i;
        bestPoint = p.createVector(closest.x, closest.y);
      }
    }

    if (bestSegment < 0 || bestDistance > threshold || !bestPoint) return false;

    const insertAfter = entries[bestSegment].pathIndex;
    this.path.splice(insertAfter + 1, 0, {
      kind: "node",
      id: createDrivewayNodeId(),
      x: bestPoint.x,
      y: bestPoint.y,
    });
    return true;
  }

  private resolvePathEntries(
    p: p5,
    approaches: Approach[],
    parking: Parking | null,
  ): ResolvedPathEntry[] {
    const approachById = new Map(approaches.map((approach) => [approach.id, approach]));
    const entries: ResolvedPathEntry[] = [];

    this.path.forEach((point, pathIndex) => {
      if (point.kind === "approach") {
        const approach = approachById.get(point.approachId);
        if (!approach) return;
        const innerEdge = getApproachInnerEdge(approach);
        entries.push({
          pathIndex,
          kind: "approach",
          point: p.createVector(innerEdge.midpoint.x, innerEdge.midpoint.y),
          approach,
        });
      } else if (point.kind === "node") {
        entries.push({
          pathIndex,
          kind: "node",
          point: p.createVector(point.x, point.y),
        });
      } else if (point.kind === "parking" && parking) {
        const entrance = getParkingEntranceEdge(parking);
        if (!entrance) return;
        entries.push({
          pathIndex,
          kind: "parking",
          point: p.createVector(entrance.midpoint.x, entrance.midpoint.y),
        });
      }
    });

    return entries;
  }

  findNodeAt(p: p5, x: number, y: number, threshold: number): number {
    return this.path.findIndex(
      (point) =>
        point.kind === "node" &&
        p.dist(x, y, point.x, point.y) <= threshold,
    );
  }

  findSegmentNear(
    p: p5,
    x: number,
    y: number,
    approaches: Approach[],
    parking: Parking | null,
    threshold: number,
  ): boolean {
    const entries = this.resolvePathEntries(p, approaches, parking);
    for (let i = 0; i < entries.length - 1; i += 1) {
      const start = entries[i].point;
      const end = entries[i + 1].point;
      const closest = closestPointOnSegment(x, y, start.x, start.y, end.x, end.y);
      if (closest.dist <= threshold) return true;
    }
    return false;
  }

  moveNode(pathIndex: number, x: number, y: number) {
    const point = this.path[pathIndex];
    if (point?.kind !== "node") return;
    point.x = x;
    point.y = y;
  }

  removeNode(pathIndex: number) {
    const point = this.path[pathIndex];
    if (point?.kind !== "node") return;
    this.path.splice(pathIndex, 1);
  }

  draw(
    p: p5,
    property: Property,
    approaches: Approach[],
    parking: Parking | null,
    widthFeet: number,
    scale: number,
    showNodes: boolean,
  ) {
    const entries = this.resolvePathEntries(p, approaches, parking);
    if (entries.length < 2) return;

    const halfWidth = Math.max(widthFeet / scale, 4) / 2;
    const sections = resolveCrossSections(p, entries, halfWidth, parking);

    if (sections.length < 2) return;

    p.push();
    p.fill(120, 120, 120, 170);
    p.stroke(40, 40, 40);
    p.strokeWeight(1.5);
    p.beginShape();

    p.vertex(sections[0].left.x, sections[0].left.y);
    p.vertex(sections[0].right.x, sections[0].right.y);

    for (let i = 0; i < sections.length - 1; i += 1) {
      const point1 = sections[i].right;
      const point2 = sections[i + 1].right;
      const edge1 = getBezierControlEdge(
        p,
        entries[i],
        parking,
        entries[i + 1].point,
        entries[i].point,
      );
      const edge2 = getBezierControlEdge(
        p,
        entries[i + 1],
        parking,
        entries[i].point,
        entries[i + 1].point,
      );

      const sameEdgeApproaches = isSameEdgeApproachSegment(entries, i);
      const { goingUpAtDeparture, goingUpAtArrival } = resolveSegmentBezierGoingUp(
        p,
        property,
        point1,
        point2,
        edge1,
        edge2,
        entries[i],
        entries[i + 1],
        sameEdgeApproaches,
      );

      if (sameEdgeApproaches) {
        p.vertex(point2.x, point2.y);
      } else {
        drawPerpendicularBezier(
          p,
          point1,
          point2,
          edge1,
          edge2,
          goingUpAtDeparture,
          false,
          goingUpAtArrival,
        );
      }
    }

    const lastSection = sections[sections.length - 1];
    p.vertex(lastSection.left.x, lastSection.left.y);

    for (let i = sections.length - 1; i > 0; i -= 1) {
      const point1 = sections[i].left;
      const point2 = sections[i - 1].left;
      const edge1 = getBezierControlEdge(
        p,
        entries[i],
        parking,
        entries[i - 1].point,
        entries[i].point,
      );
      const edge2 = getBezierControlEdge(
        p,
        entries[i - 1],
        parking,
        entries[i].point,
        entries[i - 1].point,
      );

      const sameEdgeApproaches = isSameEdgeApproachSegment(entries, i - 1);
      const { goingUpAtDeparture, goingUpAtArrival } = resolveSegmentBezierGoingUp(
        p,
        property,
        point1,
        point2,
        edge1,
        edge2,
        entries[i],
        entries[i - 1],
        sameEdgeApproaches,
      );

      if (sameEdgeApproaches) {
        p.vertex(point2.x, point2.y);
      } else {
        drawPerpendicularBezier(
          p,
          point1,
          point2,
          edge1,
          edge2,
          goingUpAtDeparture,
          false,
          goingUpAtArrival,
        );
      }
    }

    p.endShape(p.CLOSE);
    p.pop();

    if (showNodes) {
      p.push();
      p.noStroke();
      this.path.forEach((point) => {
        if (point.kind !== "node") return;
        p.fill(255, 180, 0);
        p.ellipse(point.x, point.y, 12, 12);
      });
      p.pop();
    }
  }
}
