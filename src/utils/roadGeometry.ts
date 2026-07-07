import type { BoundaryPoint } from './siteMapCalculations';

/** AASHTO-style local residential street centerline minimum (~25 ft). */
export const RESIDENTIAL_MIN_ROAD_RADIUS_FT = 25;

/** Interior angles at or above this value are treated as straight (no curve). */
export const STRAIGHT_CORNER_INTERIOR_DEG = 175;

/** Minimum bezier handle length (feet) at a boundary entrance. */
export const ENTRANCE_HANDLE_MIN_FT = 8;

export type RoadArcSegment = {
  type: 'arc';
  center: BoundaryPoint;
  radiusFt: number;
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
};

export type RoadCubicSegment = {
  type: 'cubic';
  p0: BoundaryPoint;
  p1: BoundaryPoint;
  p2: BoundaryPoint;
  p3: BoundaryPoint;
};

export type RoadLineSegment = {
  type: 'line';
  from: BoundaryPoint;
  to: BoundaryPoint;
};

export type RoadPathSegment = RoadLineSegment | RoadArcSegment | RoadCubicSegment;

export type RoadCornerInfo = {
  index: number;
  radiusFt: number;
  meetsMinimum: boolean;
};

export type RoadPathResult = {
  segments: RoadPathSegment[];
  corners: RoadCornerInfo[];
  lengthFt: number;
  warnings: string[];
};

/** Unit vector pointing from the boundary edge into the property (pixel space). */
export type RoadPathEntrance = {
  inwardNormal: BoundaryPoint;
};

export type BuildRoadPathOptions = {
  startEntrance?: RoadPathEntrance;
  endEntrance?: RoadPathEntrance;
  /** Polyline corner indices that must pass through the exact node (no fillet trim). */
  junctionCornerIndices?: ReadonlySet<number>;
};

type Point = BoundaryPoint;

function hypot(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function normalize(dx: number, dy: number): Point {
  const len = Math.hypot(dx, dy);
  if (len < 1e-10) return { x: 1, y: 0 };
  return { x: dx / len, y: dy / len };
}

function toFeet(p: Point, ftPerPixel: number): Point {
  return { x: p.x * ftPerPixel, y: p.y * ftPerPixel };
}

function toPixels(p: Point, ftPerPixel: number): Point {
  return { x: p.x / ftPerPixel, y: p.y / ftPerPixel };
}

function lineLength(from: Point, to: Point): number {
  return hypot(from, to);
}

function interiorAngleRad(a: Point, b: Point, c: Point): number {
  const dirIn = normalize(b.x - a.x, b.y - a.y);
  const dirOut = normalize(c.x - b.x, c.y - b.y);
  const dot = Math.max(-1, Math.min(1, dirIn.x * dirOut.x + dirIn.y * dirOut.y));
  return Math.PI - Math.acos(dot);
}

function addLineFt(
  segments: RoadPathSegment[],
  fromFt: Point,
  toFt: Point,
  ftPerPixel: number,
): number {
  const len = lineLength(fromFt, toFt);
  if (len < 0.01) return 0;
  segments.push({
    type: 'line',
    from: toPixels(fromFt, ftPerPixel),
    to: toPixels(toFt, ftPerPixel),
  });
  return len;
}

function addCubicFt(
  segments: RoadPathSegment[],
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  ftPerPixel: number,
): number {
  segments.push({
    type: 'cubic',
    p0: toPixels(p0, ftPerPixel),
    p1: toPixels(p1, ftPerPixel),
    p2: toPixels(p2, ftPerPixel),
    p3: toPixels(p3, ftPerPixel),
  });
  return lineLength(p0, p3);
}

function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function sampleCubic(p0: Point, p1: Point, p2: Point, p3: Point, steps = 10): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(cubicPoint(p0, p1, p2, p3, i / steps));
  }
  return pts;
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function entranceCubicTensionFt(spanFt: number): number {
  if (spanFt < 0.01) return 0;
  const base = Math.min(spanFt * 0.38, RESIDENTIAL_MIN_ROAD_RADIUS_FT * 1.25);
  return Math.max(ENTRANCE_HANDLE_MIN_FT, base);
}

function applyEntranceDeparture(
  segments: RoadPathSegment[],
  ftPerPixel: number,
  entrance: Point,
  next: Point,
  inward: Point,
): { lengthFt: number; entry: Point } {
  const spanFt = lineLength(entrance, next);
  const dirToNext = normalize(next.x - entrance.x, next.y - entrance.y);
  if (dot(dirToNext, inward) > 0.999) {
    const lengthFt = addLineFt(segments, entrance, next, ftPerPixel);
    return { lengthFt, entry: next };
  }

  const tension = Math.min(entranceCubicTensionFt(spanFt), spanFt * 0.42);
  const lengthFt = addCubicFt(
    segments,
    entrance,
    { x: entrance.x + inward.x * tension, y: entrance.y + inward.y * tension },
    { x: next.x - dirToNext.x * tension, y: next.y - dirToNext.y * tension },
    next,
    ftPerPixel,
  );

  return { lengthFt, entry: next };
}

function applyEntranceArrival(
  segments: RoadPathSegment[],
  ftPerPixel: number,
  from: Point,
  entrance: Point,
  inward: Point,
): number {
  const spanFt = lineLength(from, entrance);
  const dirToEntrance = normalize(entrance.x - from.x, entrance.y - from.y);
  const arrivalDir = { x: -inward.x, y: -inward.y };
  if (dot(dirToEntrance, arrivalDir) > 0.999) {
    return addLineFt(segments, from, entrance, ftPerPixel);
  }

  const tension = Math.min(entranceCubicTensionFt(spanFt), spanFt * 0.42);
  return addCubicFt(
    segments,
    from,
    { x: from.x + dirToEntrance.x * tension, y: from.y + dirToEntrance.y * tension },
    { x: entrance.x + inward.x * tension, y: entrance.y + inward.y * tension },
    entrance,
    ftPerPixel,
  );
}

function smoothTangentDirections(
  points: Point[],
  inwardStart: Point | null,
  inwardEnd: Point | null,
): Point[] {
  const last = points.length - 1;
  return points.map((point, i) => {
    if (i === 0) {
      return inwardStart ?? normalize(points[1].x - point.x, points[1].y - point.y);
    }
    if (i === last) {
      return inwardEnd
        ? { x: -inwardEnd.x, y: -inwardEnd.y }
        : normalize(point.x - points[i - 1].x, point.y - points[i - 1].y);
    }
    return normalize(points[i + 1].x - points[i - 1].x, points[i + 1].y - points[i - 1].y);
  });
}

function buildSmoothCubicPath(
  pointsFt: Point[],
  ftPerPixel: number,
  inwardStart: Point | null,
  inwardEnd: Point | null,
): { lengthFt: number; segments: RoadPathSegment[] } {
  const segments: RoadPathSegment[] = [];
  const tangents = smoothTangentDirections(pointsFt, inwardStart, inwardEnd);
  let lengthFt = 0;

  for (let i = 0; i < pointsFt.length - 1; i++) {
    const from = pointsFt[i];
    const to = pointsFt[i + 1];
    const spanFt = lineLength(from, to);
    if (spanFt < 0.01) continue;

    let fromHandle = spanFt * 0.34;
    let toHandle = spanFt * 0.34;

    if (i === 0 && inwardStart) {
      fromHandle = Math.min(entranceCubicTensionFt(spanFt), spanFt * 0.42);
    }
    if (i === pointsFt.length - 2 && inwardEnd) {
      toHandle = Math.min(spanFt * 0.42, Math.max(ENTRANCE_HANDLE_MIN_FT, spanFt * 0.34));
    }

    lengthFt += addCubicFt(
      segments,
      from,
      {
        x: from.x + tangents[i].x * fromHandle,
        y: from.y + tangents[i].y * fromHandle,
      },
      {
        x: to.x - tangents[i + 1].x * toHandle,
        y: to.y - tangents[i + 1].y * toHandle,
      },
      to,
      ftPerPixel,
    );
  }

  return { lengthFt, segments };
}

/** Build a centerline path with cubic fillets on acute corners. */
export function buildRoadPath(
  controlPoints: BoundaryPoint[],
  ftPerPixel: number,
  options: BuildRoadPathOptions = {},
): RoadPathResult {
  const segments: RoadPathSegment[] = [];
  const corners: RoadCornerInfo[] = [];
  const warnings: string[] = [];
  let lengthFt = 0;

  if (controlPoints.length < 2 || ftPerPixel <= 0) {
    return { segments, corners, lengthFt: 0, warnings };
  }

  const pointsFt = controlPoints.map((p) => toFeet(p, ftPerPixel));
  const inwardStart = options.startEntrance?.inwardNormal ?? null;
  const inwardEnd = options.endEntrance?.inwardNormal ?? null;

  if (pointsFt.length === 2) {
    if (inwardStart && !inwardEnd) {
      lengthFt += applyEntranceDeparture(
        segments,
        ftPerPixel,
        pointsFt[0],
        pointsFt[1],
        inwardStart,
      ).lengthFt;
      return { segments, corners, lengthFt, warnings };
    }
    if (!inwardStart && inwardEnd) {
      lengthFt += applyEntranceArrival(
        segments,
        ftPerPixel,
        pointsFt[0],
        pointsFt[1],
        inwardEnd,
      );
      return { segments, corners, lengthFt, warnings };
    }
    if (inwardStart && inwardEnd) {
      const departed = applyEntranceDeparture(
        segments,
        ftPerPixel,
        pointsFt[0],
        pointsFt[1],
        inwardStart,
      );
      lengthFt += departed.lengthFt;
      return { segments, corners, lengthFt, warnings };
    }
    lengthFt += addLineFt(segments, pointsFt[0], pointsFt[1], ftPerPixel);
    return { segments, corners, lengthFt, warnings };
  }

  const smooth = buildSmoothCubicPath(pointsFt, ftPerPixel, inwardStart, inwardEnd);
  segments.push(...smooth.segments);
  lengthFt += smooth.lengthFt;

  for (let i = 1; i < pointsFt.length - 1; i++) {
    if (options.junctionCornerIndices?.has(i)) continue;
    const theta = interiorAngleRad(pointsFt[i - 1], pointsFt[i], pointsFt[i + 1]);
    const deflection = Math.PI - theta;
    if (deflection <= 0.01) continue;

    corners.push({
      index: i,
      radiusFt: RESIDENTIAL_MIN_ROAD_RADIUS_FT,
      meetsMinimum: true,
    });
  }

  return { segments, corners, lengthFt, warnings };
}

export function sampleRoadPath(segments: RoadPathSegment[]): BoundaryPoint[] {
  const samples: BoundaryPoint[] = [];
  for (const seg of segments) {
    if (seg.type === 'line') {
      if (samples.length === 0) samples.push(seg.from);
      samples.push(seg.to);
    } else if (seg.type === 'cubic') {
      const pts = sampleCubic(seg.p0, seg.p1, seg.p2, seg.p3, 12);
      if (samples.length === 0) samples.push(pts[0]);
      samples.push(...pts.slice(1));
    }
  }
  return samples;
}

/** Dense centerline samples for offset road-polygon construction. */
export function denseSampleRoadPath(
  segments: RoadPathSegment[],
  minStepPx = 3,
): BoundaryPoint[] {
  const samples: BoundaryPoint[] = [];

  const push = (pt: BoundaryPoint) => {
    const last = samples[samples.length - 1];
    if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 0.35) {
      samples.push(pt);
    }
  };

  const estimateCubicLength = (seg: Extract<RoadPathSegment, { type: 'cubic' }>): number => {
    let len = 0;
    let prev = cubicPoint(seg.p0, seg.p1, seg.p2, seg.p3, 0);
    for (let s = 1; s <= 10; s++) {
      const pt = cubicPoint(seg.p0, seg.p1, seg.p2, seg.p3, s / 10);
      len += Math.hypot(pt.x - prev.x, pt.y - prev.y);
      prev = pt;
    }
    return len;
  };

  for (const seg of segments) {
    if (seg.type === 'line') {
      const len = Math.hypot(seg.to.x - seg.from.x, seg.to.y - seg.from.y);
      const steps = Math.max(1, Math.ceil(len / minStepPx));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        push({
          x: seg.from.x + (seg.to.x - seg.from.x) * t,
          y: seg.from.y + (seg.to.y - seg.from.y) * t,
        });
      }
    } else if (seg.type === 'cubic') {
      const approxLen = estimateCubicLength(seg);
      const steps = Math.max(20, Math.ceil(approxLen / minStepPx));
      for (let i = 0; i <= steps; i++) {
        push(cubicPoint(seg.p0, seg.p1, seg.p2, seg.p3, i / steps));
      }
    }
  }

  return samples;
}

export function tangentAtSample(samples: BoundaryPoint[], index: number): Point {
  if (samples.length < 2) return { x: 1, y: 0 };
  if (index === 0) {
    return normalize(samples[1].x - samples[0].x, samples[1].y - samples[0].y);
  }
  if (index === samples.length - 1) {
    const last = samples.length - 1;
    return normalize(samples[last].x - samples[last - 1].x, samples[last].y - samples[last - 1].y);
  }
  return normalize(
    samples[index + 1].x - samples[index - 1].x,
    samples[index + 1].y - samples[index - 1].y,
  );
}
