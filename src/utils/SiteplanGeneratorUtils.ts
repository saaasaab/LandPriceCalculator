import p5 from "p5";
import classifyPoint from "robust-point-in-polygon"
import { TPoint, VisibilityGraph } from "../pages/VisibilityGraph";
import { Approach, Building, Edge, Garbage, Parking, ParkingStall, Property, SitePlanElement, stallHeight, stallWidth } from "./SiteplanGenerator";


type Point = [number, number];
export type TTwoPoints = { x: number, y: number, x2: number, y2: number, };

export const calculateSnapToEdge = (newAngle: number, element: SitePlanElement, property: Property) => {
  let _newAngle = newAngle;

  // Get the distance to each property edge for all sides of the parking
  let shouldSnapToEdge = false;
  let snappingOuterIndex = -1;
  let snappingInnerIndex = -1;

  let minDistance = Infinity


  element.sitePlanElementEdges.forEach((edge, i) => {
    // if (shouldSnapToEdge) return

    const edgeMidpoint = edge.getMidpoint()

    const closestEdge = findClosestEdge(property.propertyEdges, edgeMidpoint);
    const distance = calculatePointToEdgeDistance(property.propertyEdges[closestEdge], edgeMidpoint);


    if (distance < minDistance) {
      minDistance = distance;
      snappingInnerIndex = i
      snappingOuterIndex = closestEdge;
    }
  })

  const snappingDistance = 25;
  if (minDistance < (snappingDistance / property.scale)) {
    shouldSnapToEdge = true
  }
  if (shouldSnapToEdge) {
    let differenceBetween = 360;
    const edgeAngle = property.propertyEdges[snappingOuterIndex].calculateAngle();

    if (snappingInnerIndex === 3 || snappingInnerIndex === 1) {
      differenceBetween = Math.abs(angularDistance(normalizeAngle180(edgeAngle - 90), normalizeAngle180(newAngle)))
    }
    else {
      differenceBetween = Math.abs(angularDistance(normalizeAngle180(edgeAngle), normalizeAngle180(newAngle)))
    }
    if (differenceBetween < 3) {
      _newAngle += differenceBetween
    }
  }



  return _newAngle;


}

export const p5VectorToTPoint = (vectors: p5.Vector[]): TPoint[] => {
  return vectors.map(vertex => {
    return {
      x: vertex.x,
      y: vertex.y,
    }
  })
}

export function clampNumber(value:number, min:number, max:number) {
  return Math.min(Math.max(value, min), max);
};
export function runVisibilityGraphSolver(visibilityGraphSolver: VisibilityGraph, building: Building, parking: Parking, property: Property, garbage: Garbage, approach: Approach) {
  const obstacles: TPoint[][] = [
    p5VectorToTPoint(parking.parkingOutline),
    p5VectorToTPoint(garbage.sitePlanElementCorners),
    p5VectorToTPoint(building.sitePlanElementCorners),
  ];


  const startPoints: TTwoPoints[] = building.entrances.map(entrance => {
    const projection1 = entrance.calculatePointAtDistance(
      entrance.intersection,
      building.sitePlanElementEdges[entrance.edgeIndex],
      1 / building.scale,
      entrance.p
    )
    const projection2 = entrance.calculatePointAtDistance(
      entrance.intersection,
      building.sitePlanElementEdges[entrance.edgeIndex],
      5 / building.scale,
      entrance.p
    )

    return {
      x: projection1.x,
      y: projection1.y,
      x2: projection2.x,
      y2: projection2.y,
    }
  })

  const approachPoints = [
    approach.sitePlanElementCorners[0],
    approach.sitePlanElementCorners[1],
  ];

  const approachDists = approachPoints.map(point =>
    approach.p.dist(point.x, point.y, building.center.x, building.center.y)
  );

  // Sort points by distance
  const sortedPoints = approachPoints
    .map((point, index) => ({ point, distance: approachDists[index] }))
    .sort((a, b) => a.distance - b.distance);

  // Get the two closest points
  const approachEndPoint = sortedPoints[0].point; // Closest point
  const approachBackupEndPoint = sortedPoints[1]?.point; // Second closest point (if available)

  const garbagePoints = [garbage.sitePlanElementEdges[1].getMidpoint(), garbage.sitePlanElementEdges[3].getMidpoint(), garbage.sitePlanElementEdges[0].getMidpoint()]
  const garbageDists = garbagePoints.map(point => garbage.p.dist(point.x, point.y, building.center.x, building.center.y))
  const garbageEdgeIndex = garbageDists.indexOf(Math.min(...garbageDists));
  const garbageEndPoint = garbagePoints[garbageEdgeIndex]

  const endPoints = [
    garbage.projectFromCenter(garbageEndPoint, 2 / garbage.scale),
    garbage.projectFromCenter(approachBackupEndPoint, 2 / garbage.scale),
    approach.projectFromCenter(approachEndPoint, 2 / approach.scale)
  ];


  visibilityGraphSolver = new VisibilityGraph(startPoints, endPoints, obstacles, property.propertyCorners, property.scale)

  visibilityGraphSolver.calculateSideWalkPolygons(property.scale)
  return visibilityGraphSolver
}


export function getIntersectionPercentage(
  edge: Edge,
  intersection: p5.Vector
): number | null {
  const start = edge.point1;
  const end = edge.point2;

  // Total length of the edge
  const edgeLength = p5.Vector.dist(start, end);

  // Distance from the start of the edge to the intersection point
  const intersectionDist = p5.Vector.dist(start, intersection);

  // Check if the intersection point is within the edge bounds
  const isWithinBounds =
    Math.min(start.x, end.x) <= intersection.x &&
    intersection.x <= Math.max(start.x, end.x) &&
    Math.min(start.y, end.y) <= intersection.y &&
    intersection.y <= Math.max(start.y, end.y);

  // If the intersection point is outside the bounds, return null
  if (!isWithinBounds) {
    return null;
  }

  // Calculate the percentage along the edge
  const percentage = intersectionDist / edgeLength;

  return percentage;
}

export function setLineDash(p: p5, list: number[]) {
  p.drawingContext.setLineDash(list);
}


export function createDriveway(p: p5, approach: Approach, parking: Parking) {
  // , taperParking: boolean
  if (!parking.entranceEdge) return;

  p.beginShape();

  p.vertex(approach.sitePlanElementCorners[0].x, approach.sitePlanElementCorners[0].y);
  p.vertex(approach.sitePlanElementCorners[1].x, approach.sitePlanElementCorners[1].y);



  drawPerpendicularBezier(
    p,
    approach.sitePlanElementCorners[1],
    parking.entranceEdge.point1,
    approach.sitePlanElementEdges[2],
    parking.entranceEdge,
    true
  );

  p.vertex(parking.entranceEdge?.point2.x || 0, parking.entranceEdge?.point2.y || 0);
  drawPerpendicularBezier(
    p,
    parking.entranceEdge.point2,
    approach.sitePlanElementCorners[0],
    parking.entranceEdge,
    approach.sitePlanElementEdges[2],
    false
  );

  p.endShape();

}


// GetMidpoint
export function getCenterPoint(p: p5, p1: p5.Vector, p2: p5.Vector): p5.Vector {
  const x = (p2.x + p1.x) / 2;
  const y = (p2.y + p1.y) / 2;
  return p.createVector(x, y)
}

export function polyPoint(vertices: p5.Vector[], px: number, py: number) {
  let collision = false;

  // go through each of the vertices, plus
  // the next vertex in the list
  let next = 0;
  for (let current = 0; current < vertices.length; current++) {

    // get next vertex in list
    // if we've hit the end, wrap around to 0
    next = current + 1;
    if (next == vertices.length) next = 0;

    // get the Vectors at our current position
    // this makes our if statement a little cleaner
    let vc = vertices[current]; // c for "current"
    let vn = vertices[next]; // n for "next"

    // compare position, flip 'collision' variable
    // back and forth
    if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
      (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
      collision = !collision;
    }
  }
  return collision;
}

export function drawPerpendicularBezier(
  p: p5,
  point1: p5.Vector,
  point2: p5.Vector,
  edge1: Edge,
  edge2: Edge,
  goingUp: boolean
  // controlDistance: number
): void {
  // Define the two control points

  const controlDistance = p.dist(point1.x, point1.y, point2.x, point2.y) / 3;

  const goingUpSign = goingUp ? -1 : 1;
  const angle1 = edge1.calculateAngle() - 90 * goingUpSign;
  const angle2 = edge2.calculateAngle() + 90 * goingUpSign;
  const controlPoint1 = p.createVector(
    point1.x + p.cos(angle1) * controlDistance,
    point1.y + p.sin(angle1) * controlDistance
  );
  const controlPoint2 = p.createVector(
    point2.x + p.cos(angle2) * controlDistance,
    point2.y + p.sin(angle2) * controlDistance
  );

  // // Draw the Bézier curve
  // p.stroke(0, 100, 255);
  // p.strokeWeight(3);
  // p.noFill();
  p.bezierVertex(
    controlPoint1.x,
    controlPoint1.y,
    controlPoint2.x,
    controlPoint2.y,
    point2.x,
    point2.y
  );


  // // Optional: Draw the line segment and control points for visualization
  // p.stroke(0);
  // // p.line(point1.x, point1.y, point2.x, point2.y); // Original line segment
  // p.fill(255, 0, 0);
  // p.ellipse(controlPoint1.x, controlPoint1.y, 8, 8); // Control point 1
  // p.ellipse(controlPoint2.x, controlPoint2.y, 8, 8); // Control point 2
}
interface IPoint {
  x: number;
  y: number;
}



export function twoObjectsAreNotColliding(obj1: p5.Vector[], obj2: p5.Vector[]) {
  // Check that obj1 is not in obj2 and that obj2 is not in obj1

  const obj2IsOutOfOb1 = allPointsOutOfPolygon(obj1, obj2);
  const obj1IsOutOfOb2 = allPointsOutOfPolygon(obj2, obj1);



  return truthChecker(obj2IsOutOfOb1) && truthChecker(obj1IsOutOfOb2)


}

export function calculateDrivewayArea(p: p5, approach: Approach, parking: Parking) {

  const defaultVector = p.createVector(0, 0);


  const driveWayPoints = [
    approach?.sitePlanElementCorners[1] || defaultVector,
    parking?.sitePlanElementCorners[2] || defaultVector,
    parking?.sitePlanElementCorners[3] || defaultVector,
    approach?.sitePlanElementCorners[0] || defaultVector,
  ]


  return Math.round((calculateArea(driveWayPoints)) * approach.scale * approach.scale)
}

export function calculateApproachArea(approach: Approach) {
  return Math.round((approach?.width || 0) * (approach?.height || 0) / 2 * approach.scale * approach.scale)
}

export function findGridCells(inputArray: IPoint[], solverScale: number, cols: number, rows: number): IPoint[] {
  // Array to store the grid cell results
  return inputArray.map((point) => {
    // Calculate the grid cell indices
    const col = Math.floor(point.x / solverScale);
    const row = Math.floor(point.y / solverScale);

    // Ensure the indices are within bounds
    const boundedCol = Math.min(Math.max(col, 0), cols - 1);
    const boundedRow = Math.min(Math.max(row, 0), rows - 1);

    return { x: boundedCol, y: boundedRow };
  });
}

export function truthChecker(arr: boolean[]) { return arr.every(v => v === true) };

export function calculateAngle(point1: p5.Vector, point2: p5.Vector): number {
  const deltaY = Math.round(point2.y - point1.y);
  const deltaX = Math.round(point2.x - point1.x);


  // atan2 handles quadrants and division by zero
  const angleInRadians = Math.atan2(deltaY, deltaX);

  // Convert radians to degrees
  const angleInDegrees = angleInRadians * 180 / Math.PI;

  return angleInDegrees;
}

export function normalizeAngle(angle: number): number {
  return (angle + 360) % 360;
}

export function normalizeAngle180(angle: number): number {
  return (angle + 180) % 180;
}

export function normalizeAngle90(angle: number): number {
  return (angle + 90) % 90;
}

export function normalizeAngle45(angle: number): number {
  return (angle + 45) % 45;
}

export function findClosestEdge(edges: Edge[], point: p5.Vector): number {
  let closestEdge: Edge | null = null;
  let shortestDistance = Infinity;
  let shortestIndex = 0;
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    // Calculate the distance from the point to the edge
    const distance = calculatePointToEdgeDistance(edge, point);

    // Update the closest edge if the distance is shorter
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestEdge = edge;
      shortestIndex = i
    }
  }

  // Return the closest edge
  if (!closestEdge) {
    throw new Error("No edges provided.");
  }
  return shortestIndex;
}

export function calculatePointToEdgeDistance(edge: Edge, point: p5.Vector): number {
  const lineStart = edge.point1;
  const lineEnd = edge.point2;

  // Vector from start of line to the point
  const startToPoint = p5.Vector.sub(point, lineStart);

  // Vector from start to end of the line segment
  const startToEnd = p5.Vector.sub(lineEnd, lineStart);

  // Project the point onto the line segment
  const t = p5.Vector.dot(startToPoint, startToEnd) / startToEnd.magSq();

  // Clamp t to the range [0, 1] to stay within the segment
  const clampedT = Math.max(0, Math.min(1, t));

  // Closest point on the line segment
  const closestPoint = p5.Vector.add(
    lineStart,
    startToEnd.mult(clampedT)
  );

  // Distance from the point to the closest point on the line
  return p5.Vector.dist(point, closestPoint);
}

export function getAdjacentIndices(index: number, length: number): [number, number] {
  if (length <= 1) {
    throw new Error("List must have at least two elements.");
  }

  const prevIndex = (index - 1 + length) % length; // Wrap around to the end if index is 0
  const nextIndex = (index + 1) % length; // Wrap around to the start if index is the last

  return [prevIndex, nextIndex];
}

export function pointsAreInBoundary(points: p5.Vector[], point: Point) {
  return classifyPoint(points.map(corner => [corner.x, corner.y]) as Point[], point)
}

export function calculatePointPosition(p: p5, entranceEdge: Edge, parkingAngle: number, parkingStalls: {
  left: ParkingStall[];
  right: ParkingStall[];
},
  scale: number) {

  const _stallHeight = stallHeight / scale;
  const _stallWidth = stallWidth / scale;


  // Expand the parking size
  const currentNumberOfStallsRight = parkingStalls.right.length;
  const currentNumberOfStallsLeft = parkingStalls.left.length;

  const firstPointRight = currentNumberOfStallsRight === 0 ? entranceEdge.point1 : parkingStalls.right[currentNumberOfStallsRight - 1].stallCorners[1];
  const secondPointRight = [firstPointRight.x + p.cos(parkingAngle - 90) * _stallHeight, firstPointRight.y + p.sin(parkingAngle - 90) * _stallHeight]

  const firstPointLeft = currentNumberOfStallsLeft === 0 ? entranceEdge.point2 : parkingStalls.left[currentNumberOfStallsLeft - 1].stallCorners[1];
  const secondPointLeft = [firstPointLeft.x + p.cos(parkingAngle - 90) * _stallHeight, firstPointLeft.y + p.sin(parkingAngle - 90) * _stallHeight];


  const thirdAndFourthPointRight = [ // pointing to the right
    [firstPointRight.x + p.cos(parkingAngle) * _stallWidth, firstPointRight.y + p.sin(parkingAngle) * _stallWidth],
    [secondPointRight[0] + p.cos(parkingAngle) * _stallWidth, secondPointRight[1] + p.sin(parkingAngle) * _stallWidth],
  ];
  const thirdAndFourthPointLeft = [ // pointing to the right
    [firstPointLeft.x - p.cos(parkingAngle) * _stallWidth, firstPointLeft.y - p.sin(parkingAngle) * _stallWidth],
    [secondPointLeft[0] - p.cos(parkingAngle) * _stallWidth, secondPointLeft[1] - p.sin(parkingAngle) * _stallWidth],
  ];

  const stallCornerRight = [
    p.createVector(firstPointRight.x, firstPointRight.y),
    p.createVector(secondPointRight[0], secondPointRight[1]),
    p.createVector(thirdAndFourthPointRight[1][0], thirdAndFourthPointRight[1][1]),
    p.createVector(thirdAndFourthPointRight[0][0], thirdAndFourthPointRight[0][1]),
  ]

  const stallCornerLeft = [
    p.createVector(firstPointLeft.x, firstPointLeft.y),
    p.createVector(secondPointLeft[0], secondPointLeft[1]),
    p.createVector(thirdAndFourthPointLeft[1][0], thirdAndFourthPointLeft[1][1]),
    p.createVector(thirdAndFourthPointLeft[0][0], thirdAndFourthPointLeft[0][1]),
  ]
  return { left: stallCornerLeft, right: stallCornerRight }
}

export function calculateStallPosition(p: p5, entranceEdge: Edge, angle: number, parkingStallsOnSide: ParkingStall[], side: "left" | "right", stallIndex: number, scale: number) {
  // Get the entrance points and the direction they are pointing.
  const _stallHeight = stallHeight / scale;
  const _stallWidth = stallWidth / scale;

  const currentNumberOfStalls = parkingStallsOnSide.length;

  let sideMultiplier = side === "left" ? -1 : 1;
  let entrancePoint = side === "left" ? entranceEdge.point2 : entranceEdge.point1;
  let firstPoint = currentNumberOfStalls === 0 ?
    entrancePoint :
    p.createVector(
      entrancePoint.x + p.cos(angle - 90) * _stallHeight * stallIndex,
      entrancePoint.y + p.sin(angle - 90) * _stallHeight * stallIndex
    );
  const secondPoint = [
    firstPoint.x + p.cos(angle - 90) * _stallHeight, firstPoint.y + p.sin(angle - 90) * _stallHeight]


  const thirdAndFourthPoint = [ // pointing to the right
    [firstPoint.x + sideMultiplier * p.cos(angle) * _stallWidth, firstPoint.y + sideMultiplier * p.sin(angle) * _stallWidth],
    [secondPoint[0] + sideMultiplier * p.cos(angle) * _stallWidth, secondPoint[1] + sideMultiplier * p.sin(angle) * _stallWidth],
  ];


  const stallCorners = [
    firstPoint,
    p.createVector(secondPoint[0], secondPoint[1]),
    p.createVector(thirdAndFourthPoint[1][0], thirdAndFourthPoint[1][1]),
    p.createVector(thirdAndFourthPoint[0][0], thirdAndFourthPoint[0][1]),
  ]

  return stallCorners;
}

export function moveVector(
  vector1: p5.Vector,
  vector2: p5.Vector,
  distance: number,
  moveAway: boolean = true
): p5.Vector {
  // Calculate the direction from vector1 to vector2
  let direction = p5.Vector.sub(vector2, vector1);

  // If moving toward vector1, reverse the direction
  if (!moveAway) {
    direction = direction.mult(-1);
  }

  // Normalize the direction (make it a unit vector)
  direction.normalize();

  // Scale the direction by the desired distance
  const scaledDirection = direction.mult(distance);

  // Move vector2 by adding the scaled direction
  const newVector = p5.Vector.add(vector2, scaledDirection);

  return newVector;
}


export function allPointsOutOfPolygon(object1: p5.Vector[], object2: p5.Vector[]) {
  const allPointsOutPolygon = object2.map((corner1) => {
    const point = [corner1.x, corner1.y];
    const pointClassification = classifyPoint(object1.map(corner => [corner.x, corner.y]) as Point[], point as Point)
    // 1 = outside
    // 0 = on the border
    // -1 = inside
    return pointClassification === 1
  })

  return allPointsOutPolygon;
}


export function allPointsInPolygon(boundary: p5.Vector[], poly: p5.Vector[]) {
  const allPointsInPolygon = poly.map((corner1) => {
    const point = [corner1.x, corner1.y];
    const pointClassification = classifyPoint(boundary.map(corner => [corner.x, corner.y]) as Point[], point as Point)
    // 1 = outside
    // 0 = on the border
    // -1 = inside
    return pointClassification === -1
  })

  return allPointsInPolygon
}

export function getLineIntersection(
  p: p5, // p5 instance
  line1: p5.Vector[], // Array of two p5.Vector points [start, end]
  line2: p5.Vector[] // Array of two p5.Vector points [start, end]
) {
  const { x: x1, y: y1 } = line1[0];
  const { x: x2, y: y2 } = line1[1];
  const { x: x3, y: y3 } = line2[0];
  const { x: x4, y: y4 } = line2[1];

  // Calculate the denominator for intersection formula
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  // Lines are parallel if denom is zero
  if (denom === 0) return null;

  // Calculate the intersection point (unbounded)
  const intersectX =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const intersectY =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  const intersection = p.createVector(intersectX, intersectY);


  // Ensure the intersection is in the forward direction of line1
  const directionVector = p5.Vector.sub(line1[1], line1[0]); // Direction of line1
  const toIntersectionVector = p5.Vector.sub(intersection, line1[0]); // Vector to intersection


  if (toIntersectionVector.dot(directionVector) >= 0) {
    return intersection; // Valid intersection point
  }

  return null; // Intersection is behind line1's start point
}

export function calculateArea(polygon: p5.Vector[]): number {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};

export function createWrappedIndices(startIndex: number, endIndex: number, totalLength: number) {
  let indices = [];
  let currentIndex = startIndex;

  while (true) {
    indices.push(currentIndex);
    if (currentIndex === endIndex) break; // Stop when reaching the endIndex
    currentIndex = (currentIndex + 1) % totalLength; // Move to the next index, wrapping around if necessary
  }

  return indices;
}

export function calculateCentroid(polygon: p5.Vector[]) {
  let cx = 0, cy = 0;
  let area = 0;

  for (let i = 0; i < polygon.length; i++) {
    const x1 = polygon[i].x;
    const y1 = polygon[i].y;
    const x2 = polygon[(i + 1) % polygon.length].x;
    const y2 = polygon[(i + 1) % polygon.length].y;

    const cross = x1 * y2 - x2 * y1;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
    area += cross;
  }

  area *= 0.5;
  cx /= 6 * area;
  cy /= 6 * area;

  return { x: cx, y: cy };
}

export function expandPolygon(p: p5, polygon: p5.Vector[], offset: number): p5.Vector[] {
  const expandedPolygon: p5.Vector[] = [];
  const totalVertices = polygon.length;

  for (let i = 0; i < totalVertices; i++) {
    // Get current, previous, and next points
    const current = polygon[i];
    const prev = polygon[(i - 1 + totalVertices) % totalVertices];
    const next = polygon[(i + 1) % totalVertices];

    // Calculate outward normals for the edges
    const normalPrev = calculateEdgeNormal(p, prev, current);
    const normalNext = calculateEdgeNormal(p, current, next);

    // Calculate the offset direction by averaging the normals
    const offsetNormal = p.createVector(
      normalPrev.x + normalNext.x,
      normalPrev.y + normalNext.y,
    )

    // Normalize the offset direction vector
    const length = Math.sqrt(offsetNormal.x ** 2 + offsetNormal.y ** 2);
    offsetNormal.x /= length;
    offsetNormal.y /= length;

    // Calculate the expanded vertex
    const expandedPoint = p.createVector(
      current.x + offsetNormal.x * offset,
      current.y + offsetNormal.y * offset,
    )

    expandedPolygon.push(expandedPoint);
  }

  return expandedPolygon;
}

export function calculateEdgeNormal(p: p5, p1: p5.Vector, p2: p5.Vector): p5.Vector {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Swap dx and dy and negate one to create a perpendicular vector
  const length = Math.sqrt(dx ** 2 + dy ** 2);
  return p.createVector(
    dy / length,
    -dx / length
  )
}

export function arrayOfRandomNudges(nudgeStrength: number, numberOfRandomNumbers: number) {
  const arr = new Array(numberOfRandomNumbers).fill(0)
  return arr.map(() => Math.random() * nudgeStrength * 2 - nudgeStrength)
}

export function createSitePlanElementCorners(p: p5, x: number, y: number, width: number, height: number, angle: number) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Define the initial (unrotated) corner points relative to the center
  const corners: p5.Vector[] = [
    p.createVector(-halfWidth, -halfHeight), // Top-left
    p.createVector(halfWidth, -halfHeight),  // Top-right
    p.createVector(halfWidth, halfHeight),   // Bottom-right
    p.createVector(-halfWidth, halfHeight),  // Bottom-left
  ];

  // Convert the angle to radians
  const _angle = normalizeAngle(angle);

  // Rotate each corner around the center and compute its absolute position

  return (corners.map((corner) => {
    const rotatedX = corner.x * p.cos(_angle) - corner.y * p.sin(_angle);
    const rotatedY = corner.x * p.sin(_angle) + corner.y * p.cos(_angle);
    return p.createVector(x + rotatedX, y + rotatedY);
  })
  )
}

export function rotateCorners(p: p5, corners: p5.Vector[], angle: number) {


  // Convert the angle to radians
  const _angle = normalizeAngle(angle);

  // Rotate each corner around the center and compute its absolute position

  return (corners.map((corner) => {
    const rotatedX = corner.x * p.cos(_angle) - corner.y * p.sin(_angle);
    const rotatedY = corner.x * p.sin(_angle) + corner.y * p.cos(_angle);
    return p.createVector(rotatedX, rotatedY);
  })
  )
}

export function rotateAndTranslateCorners(p: p5, x: number, y: number, corners: p5.Vector[], angle: number) {
  // Convert the angle to radians
  const _angle = normalizeAngle(angle);

  // Rotate each corner around the center and compute its absolute position

  return (corners.map((corner) => {
    const rotatedX = corner.x * p.cos(_angle) - corner.y * p.sin(_angle);
    const rotatedY = corner.x * p.sin(_angle) + corner.y * p.cos(_angle);
    return p.createVector(x + rotatedX, y + rotatedY);
  })
  )
}

export const getIsClockwise = (polygon: p5.Vector[]): boolean => {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    sum += (next.x - current.x) * (next.y + current.y);
  }
  return sum > 0;
};

export function getReversedIndex(oldIndex: number, listLength: number): number {

  // 0 -> 4
  // 1 -> 3
  // 2 -> 2
  // 3 -> 1
  // 4 -> 0



  return listLength - oldIndex - 1;
};

export const isMoreVertical = (angle: number, inDegrees: boolean = true): boolean => {
  // Convert angle to radians if it's in degrees
  if (inDegrees) {
    angle = (angle * Math.PI) / 180; // Convert degrees to radians
  }

  // Normalize the angle to [0, 2 * PI)
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }

  // Determine if the angle is more vertical
  // Vertical regions: (PI/4 <= angle <= 3PI/4) OR (5PI/4 <= angle <= 7PI/4)
  const isVertical = (angle >= Math.PI / 4 && angle <= (3 * Math.PI) / 4) ||
    (angle >= (5 * Math.PI) / 4 && angle <= (7 * Math.PI) / 4);

  return isVertical;
};

export function angularDistance(angle1: number, angle2: number): number {
  const diff = Math.abs(angle1 - angle2);
  return Math.min(diff, 180 - diff);
}

export function getBoundingBox(points: p5.Vector[]) {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  return { minX, minY, maxX, maxY };
}

export function scalePolygonToFitCanvas(
  p: p5,
  propertyCorners: p5.Vector[],
  canvasWidth: number,
  canvasHeight: number,
  border: number = 40
): {
  scaledPolygon: p5.Vector[],
  scaleFactor: number
} {
  // Calculate the bounding box of the polygon
  const boundingBox = getBoundingBox(propertyCorners);

  const boundingWidth = boundingBox.maxX - boundingBox.minX;
  const boundingHeight = boundingBox.maxY - boundingBox.minY;

  // Available canvas dimensions (minus the border)
  const availableWidth = canvasWidth - 2 * border;
  const availableHeight = canvasHeight - 2 * border;

  // Calculate the scale factor to fit within the available canvas
  const scaleFactor = Math.min(
    availableWidth / boundingWidth,
    availableHeight / boundingHeight
  );

  // Center the scaled polygon within the available canvas
  const offsetX =
    border +
    (availableWidth - boundingWidth * scaleFactor) / 2 -
    boundingBox.minX * scaleFactor;
  const offsetY =
    border +
    (availableHeight - boundingHeight * scaleFactor) / 2 -
    boundingBox.minY * scaleFactor;

  // Scale and translate each point in the polygon
  const scaledPolygon = propertyCorners.map((point) => {
    const scaledX = point.x * scaleFactor + offsetX;
    const scaledY = point.y * scaleFactor + offsetY;
    return p.createVector(scaledX, scaledY);
  });

  return { scaledPolygon, scaleFactor };
}

export function countParkingStalls(parking: Parking | null | undefined) {
  let leftStalls = 0
  let rightStalls = 0


  if (parking && parking !== null) {
    leftStalls = parking.parkingStalls.left.filter(stall => !stall.isEmptySlot).length;
    rightStalls = parking.parkingStalls.right.filter(stall => !stall.isEmptySlot).length;

  }
  return { leftStalls, rightStalls }

}

export function getParkingStallArea(parking: Parking) {
  const { leftStalls, rightStalls } = countParkingStalls(parking)
  return Math.round((leftStalls + rightStalls) * stallHeight * stallWidth)
}