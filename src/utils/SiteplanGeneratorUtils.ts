import p5 from "p5";
import classifyPoint from "robust-point-in-polygon"
import { TPoint, VisibilityGraph } from "../pages/VisibilityGraph";
import RotateArrow from "../assets/rotateArrow.png"
import { Approach } from "../pages/SiteplanDesigner/SitePlanClasses/Approach";
import { Building } from "../pages/SiteplanDesigner/SitePlanClasses/Building";
import { Edge } from "../pages/SiteplanDesigner/SitePlanClasses/Edge";
import { Garbage } from "../pages/SiteplanDesigner/SitePlanClasses/Garbage";
import { Parking } from "../pages/SiteplanDesigner/SitePlanClasses/Parking";
import { ParkingStall } from "../pages/SiteplanDesigner/SitePlanClasses/ParkingStall";
import { Property } from "../pages/SiteplanDesigner/SitePlanClasses/Property";
import { SitePlanElement } from "../pages/SiteplanDesigner/SitePlanClasses/SitePlanElement";
import { stallHeight, stallWidth } from "../pages/SiteplanDesigner/sketchForSiteplan";
import { Line } from "../pages/SiteplanDesigner/SitePlanDesigner";


type Point = [number, number];
export type TTwoPoints = { x: number, y: number, x2: number, y2: number, };

export interface FormDataInputs {
  approachWidth: number;
  buildingAreaTarget: number;
  buildingCount: number;
  drivewayWidth: number;
  halfStreetDriveway: boolean;
  imperviousPercentage: number;
  buildingCoveragePercentage: number;
  landscapeIsland: number;
  parkingPer1000Min: number;
  parkingPer1000Max: number;
  parkingStalls: number;
  handicappedParkingStalls: number;
  compactParkingStalls: number;
  propertyEntranceCount: number;
  taperedDriveway: boolean;
  parkingSide: 'right' | 'left';
  parkingPerUnit: number,
  enableAngles: boolean,
  enableLineLengths: boolean,
}

export const initialFormData: FormDataInputs = {
  parkingStalls: 4,
  handicappedParkingStalls: 0,
  compactParkingStalls: 1,
  approachWidth: 20,
  drivewayWidth: 24,
  buildingAreaTarget: 1500,
  taperedDriveway: true,
  propertyEntranceCount: 1,
  buildingCount: 1,
  landscapeIsland: 7,
  parkingPer1000Min: 2.4,
  parkingPer1000Max: 4.5,
  imperviousPercentage: 70,
  buildingCoveragePercentage: 70,
  halfStreetDriveway: false,
  parkingSide: 'left',
  parkingPerUnit: 1.5,
  enableAngles: true,
  enableLineLengths: true,
};


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

export function clampNumber(value: number, min: number, max: number) {
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
  return sum < 0;
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

export function angularDistance360(angle1: number, angle2: number): number {
  const diff = Math.abs(angle1 - angle2);
  return Math.min(diff, 360 - diff);
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




export const displayImage = (p: p5, img: p5.Image | null, rectSize: { width: number, height: number }) => {
  if (img) {
    p.background("#f9fafb"); // Default background
    // Resize the image, keeping the aspect ratio and fitting it within the canvas.
    const imgRatio = img.width / img.height; // Aspect ratio of the image
    const canvasRatio = rectSize.width / rectSize.height; // Aspect ratio of the canvas

    let width, height;

    // Check if the image is wider or taller relative to the canvas
    if (imgRatio > canvasRatio) {
      // Image is wider than the canvas
      width = rectSize.width;
      height = width / imgRatio;
    } else {
      // Image is taller than the canvas
      height = rectSize.height;
      width = height * imgRatio;
    }

    // Center the image within the canvas
    const x = (rectSize.width - width) / 2;
    const y = (rectSize.height - height) / 2;

    // Draw the image
    p.image(img, x, y, width, height);
  } else {
    p.background("#f9fafb"); // Default background
  }
}

export const calculateScale = (
  inputScaleRef: React.MutableRefObject<number | null>,
  linesRef: React.MutableRefObject<Line[]>,
  pointsRef: React.MutableRefObject<IPoint[]>,
  scaleRef: React.MutableRefObject<number | null>,
  propertyRef: React.MutableRefObject<Property | null>

) => {
  const inputScale = inputScaleRef.current;
  const points = pointsRef.current;
  const lines = linesRef.current;
  const lineIndex = lines.find(line => line.isScale)?.index;
  if (typeof lineIndex !== 'undefined' && lineIndex !== -1) {
    const lineLength = p5.prototype.dist(points[lines[lineIndex].start].x, points[lines[lineIndex].start].y, points[lines[lineIndex].end].x, points[lines[lineIndex].end].y);

    if (inputScale && lineLength && propertyRef.current) {
      scaleRef.current = inputScale / lineLength;
      propertyRef.current.scale = scaleRef.current;
    }
  }
};
export function calculateArea(polygon: p5.Vector[]): number {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};


export const calculateAreaIPoint = (polygon: IPoint[]): number => {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};



export function drawArea(
  p: p5,
  isPolygonClosed: boolean,
  pointsRef: React.MutableRefObject<IPoint[]>,
  scale: number,
) {
  const points = pointsRef.current;
  if (!isPolygonClosed || points.length < 3) return;
  const area = calculateAreaIPoint(points) * Math.pow(scale, 2)
  // p.noFill()

  p.push();
  p.stroke(0, 0, 0)
  p.strokeWeight(1)

  p.textAlign(p.RIGHT)
  p.textSize(18);
  p.text(`Area: ${area.toFixed(1)} sq ft - ${(area / 43560).toFixed(2)} Acres`, p.width - 10, 20);
  p.pop();
}

export function drawInstructionsToScreen(
  p: p5,
  pointsRef: React.MutableRefObject<IPoint[]>,
  img: p5.Image | null,
  isPolygonClosed: boolean,
  isSelectingApproachRef: React.MutableRefObject<boolean>,
  isDefiningScaleRef: React.MutableRefObject<boolean>,
  isSelectingSetbackRef: React.MutableRefObject<boolean>,
) {

  // Draw lines connecting points
  const points = pointsRef.current;

  if (points.length === 0 && !img) {
    p.push();
    p.textSize(30);
    p.fill(50); // Text color
    p.textAlign(p.CENTER, p.CENTER);
    p.text("Click here to start creating your siteplan", p.width / 2, p.height / 2);
    p.pop()
    return
  }
  else if (points.length === 0 && img) {
    p.push();
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click the property corners to start creating your siteplan", p.width - 10, p.height - 10);
    p.pop()
    return
  }

  if (!isPolygonClosed && points.length === 1) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click another spot to create a property edge", p.width - 10, p.height - 10);
    p.pop()
  }


  if (!isPolygonClosed && points.length > 1) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click the first point to close the boundary", p.width - 10, p.height - 10);
    p.pop()
  }

  if (isPolygonClosed && isSelectingApproachRef.current) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click the property edge that will be the entrance to the propery", p.width - 10, p.height - 10);
    p.pop()
  }

  if (isPolygonClosed && isDefiningScaleRef.current) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click a property edge then type in the edge's length", p.width - 10, p.height - 10);
    p.pop()
  }

  if (isPolygonClosed && isSelectingSetbackRef.current) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("For each property edge, enter the setback required for the zoning.\nEntering nothing means a setback of 0 feet", p.width - 10, p.height - 10);
    p.pop()
  }
  // const isPolygonClosed = isPolygonClosedRef.current;

}

export function drawProtoPropertyLines(p: p5,
  pointsRef: React.MutableRefObject<IPoint[]>,
  linesRef: React.MutableRefObject<Line[]>,
  scale: number
) {
  p.push();
  const points = pointsRef.current;
  const lines = linesRef.current;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.isApproach && line.isScale) {
      p.strokeWeight(4)
      p.stroke(230, 120, 20);
    }
    else if (line.isApproach) {
      p.stroke(20, 230, 120);
    }
    else if (line.isScale) {
      p.stroke(230, 120, 20);
    }
    else {
      p.stroke(0, 20, 220);
    }
    // p.stroke(line.color);
    p.line(points[line.start].x, points[line.start].y, points[line.end].x, points[line.end].y);
    p.strokeWeight(2);
    p.noStroke();
    p.fill(0, 20, 220);
    const midX = (points[line.start].x + points[line.end].x) / 2;
    const midY = (points[line.start].y + points[line.end].y) / 2;
    const length = Math.hypot(points[line.end].x - points[line.start].x, points[line.end].y - points[line.start].y) * (scale);

    // if is finished, make the text larger.
    p.textSize(14);
    p.text(`${length.toFixed(1)} ft`, midX, midY);
  }






  // Draws the phantom line and point
  const lastPoint = points[points.length - 1];

  if (points.length > 0) {
    p.stroke(0, 20, 220);
    p.line(lastPoint.x, lastPoint.y, p.mouseX, p.mouseY);

    p.strokeWeight(2);
    p.noStroke();

    p.fill(0, 20, 220);
    const midX = (lastPoint.x + p.mouseX) / 2;
    const midY = (lastPoint.y + p.mouseY) / 2;
    const length = Math.hypot(lastPoint.x - p.mouseX, lastPoint.y - p.mouseY) * (scale);

    // if is finished, make the text larger.
    p.textSize(14);
    p.text(`${length.toFixed(1)} ft`, midX, midY);
  }

  p.fill(255, 0, 0);
  for (const point of points) {
    p.noStroke();
    p.ellipse(point.x, point.y, 10, 10);
  }
  p.ellipse(p.mouseX, p.mouseY, 10, 10);

  p.pop();


  // Draw interior angle curves between consecutive lines
  for (let i = 0; i < points.length - 2; i++) {
    const p1 = p.createVector(points[i].x, points[i].y);
    const p2 = p.createVector(points[i + 1].x, points[i + 1].y);
    const p3 = p.createVector(points[i + 2].x, points[i + 2].y);

    const _angle1 = calculateAngle(p2, p1);
    const _angle2 = calculateAngle(p2, p3);

    const angle = angularDistance360(_angle1, _angle2);

    const radius = 25;
    p.noFill();
    p.stroke(255, 0, 0);
    p.arc(p2.x, p2.y, radius * 2, radius * 2, _angle1, _angle2);

    // Display the angle value
    const angleText = `${angle.toFixed(1)}°`;
    const angleMid = _angle1 + angle / 2;
    const textX = p2.x + p.cos(angleMid) * (radius + 10);
    const textY = p2.y + p.sin(angleMid) * (radius + 10);

    p.textSize(12);
    p.noStroke();
    p.fill(255, 0, 0);
    p.text(angleText, textX, textY);
  }

  // Draw angle for phantom line
  if (points.length > 1) {
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];

    const p1 = p.createVector(secondLastPoint.x, secondLastPoint.y);
    const p2 = p.createVector(lastPoint.x, lastPoint.y);
    const p3 = p.createVector(p.mouseX, p.mouseY);

    const _angle1 = calculateAngle(p2, p1);
    const _angle2 = calculateAngle(p2, p3);

    const angle = angularDistance360(_angle1, _angle2);
    const radius = 25;
    p.noFill();
    p.stroke(255, 0, 0);
    p.arc(p2.x, p2.y, radius * 2, radius * 2, _angle1, _angle2);


    // Display the angle value

    const angleText = `${angle.toFixed(1)}°`;
    const angleMid = _angle1 + angle / 2;
    const textX = lastPoint.x + p.cos(angleMid) * (radius + 10);
    const textY = lastPoint.y + p.sin(angleMid) * (radius + 10);

    p.textSize(12);
    p.noStroke();
    p.fill(0, 255, 0);
    p.text(angleText, textX, textY);
  }

}

export function calculateLineIndexOfClosestLine(
  points: IPoint[],
  lines: Line[],
  mx: number,
  my: number
) {
  const lineIndex = lines.findIndex((line) => {
    const d1 = p5.prototype.dist(mx, my, points[line.start].x, points[line.start].y);
    const d2 = p5.prototype.dist(mx, my, points[line.end].x, points[line.end].y);
    const lineLength = p5.prototype.dist(points[line.start].x, points[line.start].y, points[line.end].x, points[line.end].y);
    return Math.abs(d1 + d2 - lineLength) < 5; // Allow for small tolerance
  });

  return lineIndex;
}

export const handleBuildingDrag = (
  p: p5,
  property: Property, approach: Approach | null, parking: Parking | null, building: Building | null, garbage: Garbage | null,
  buildingDragMode: string | null,
  resizeCorner: number | null,
  resizeEdge: number | null,
  resizingbuildingRef: React.MutableRefObject<boolean>
) => {
  if (!property || !approach || !parking || !building || !garbage) return;
  // let visibilityGraphSolver: VisibilityGraph;

  building.hasStopped = false

  const newX = p.mouseX;
  const newY = p.mouseY;
  const _center = p.createVector(building.center.x, building.center.y);
  const _height = building.height;
  const _width = building.width;

  const propertyCenter = calculateCentroid(property.propertyCorners)


  // const updateVisibilityGraph = () => {
  //   if (!property || !approach || !parking || !building || !garbage) return;

  //   if (visibilityGraphSolver) {
  //     visibilityGraphSolver = runVisibilityGraphSolver(
  //       visibilityGraphSolver,
  //       building,
  //       parking,
  //       property,
  //       garbage,
  //       approach
  //     );
  //   }
  // };




  if (buildingDragMode === "corner" && resizeCorner !== null) {
    p.cursor('nesw-resize');

    resizingbuildingRef.current = true
    // Grab the corner being dragged

    // Calculate the opposite corner index
    const oppositeIndex = (resizeCorner + 2) % 4; // Opposite corner in a rectangle
    const oppositeCorner = building.sitePlanElementCorners[oppositeIndex];

    // Translate corners to the building's local coordinate system
    const localOpposite = toLocal(p, building, oppositeCorner.x, oppositeCorner.y);

    // Update the dragged corner in the local coordinate system
    const newLocalGrabby = toLocal(p, building, newX, newY);

    // Calculate the new width and height
    const newWidth = Math.abs(localOpposite.x - newLocalGrabby.x);
    const newHeight = Math.abs(localOpposite.y - newLocalGrabby.y);

    // Calculate the new center in the local coordinate system
    const newCenterLocal = {
      x: (localOpposite.x + newLocalGrabby.x) / 2,
      y: (localOpposite.y + newLocalGrabby.y) / 2,
    };

    // Convert the new center back to global coordinates
    const newCenterGlobal = toGlobal(p, building, newCenterLocal.x, newCenterLocal.y);

    // Update the building's properties
    if (building) {
      building.width = newWidth;
      building.height = newHeight;
    }

    building.updateBuildingCenter(newCenterGlobal.x, newCenterGlobal.y);


    const pointsInBoundary = building.pointIsInPolygon(property.cornerOffsetsFromSetbacks)
    if (!pointsInBoundary) {
      building.width = _width;
      building.height = _height;
      building.updateBuildingCenter(_center.x, _center.y);
      building.hasStopped = true;
      return;
    }

  }

  else if (buildingDragMode === "edge" && resizeEdge !== null) {
    p.cursor('ew-resize'); // Adjust cursor based on edge direction (horizontal/vertical)

    resizingbuildingRef.current = true;

    // Determine which edge is being dragged
    const edgeIndex = resizeEdge;

    const mouse = p.createVector(newX, newY);
    const center = p.createVector(building.center.x, building.center.y);

    const midpoint = building.sitePlanElementEdges[edgeIndex].getMidpoint()
    const distance = calculatePointToEdgeDistance(building.sitePlanElementEdges[edgeIndex], mouse)

    const newPointIsInsideMultiplier = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [newX, newY])
    const _angle = calculateAngle(center, midpoint);

    if (edgeIndex === 0 || edgeIndex === 2) {
      const newHeight = building.height + distance * newPointIsInsideMultiplier;
      if (newHeight > 5) {
        building.height = newHeight
      }

    }
    else {
      const newWidth = building.width + distance * newPointIsInsideMultiplier;
      if (newWidth > 5) {
        building.width = newWidth
      }
    }

    const newPoint1X = building.center.x + distance / 2 * p.cos(_angle) * newPointIsInsideMultiplier;
    const newPoint1Y = building.center.y + distance / 2 * p.sin(_angle) * newPointIsInsideMultiplier;

    building.updateBuildingCenter(newPoint1X, newPoint1Y);

    const pointsInBoundary = building.pointIsInPolygon(property.cornerOffsetsFromSetbacks)
    if (!pointsInBoundary) {
      if (
        p.dist(propertyCenter.x, propertyCenter.y, _center.x, _center.y) <
        p.dist(propertyCenter.x, propertyCenter.y, newX, newY)) {
        building.width = _width;
        building.height = _height;
        building.updateBuildingCenter(_center.x, _center.y);
        building.hasStopped = true;
        return
      }
    }
  }

  else if (buildingDragMode === "rotate") {

    building.isRotating = true;
    p.cursor(RotateArrow);

    const handle = building.rotationHandles[building.hoverHandleIndex];
    if (handle) {
      const mouse = p.createVector(newX, newY)
      const a = p.atan2(mouse.y - building.center.y, mouse.x - building.center.x) -
        p.atan2(handle.y - building.center.y, handle.x - building.center.x);

      building.updateAngle(building.angle + a)
    }

  }

  else if (buildingDragMode === "center") {
    p.cursor('grabbing');


    building.updateBuildingCenter(p.mouseX, p.mouseY);
    const pointsInBoundary = building.pointIsInPolygon(property.cornerOffsetsFromSetbacks)
    if (!pointsInBoundary) {

      if (
        p.dist(propertyCenter.x, propertyCenter.y, _center.x, _center.y) <
        p.dist(propertyCenter.x, propertyCenter.y, newX, newY)) {

        building.updateBuildingCenter(_center.x, _center.y);
        building.hasStopped = true;
        garbage.updateCenterGarbage(parking);
        return
      }
    }
  }

  else {
    p.cursor('default')
  }

  const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
    const pointClassification = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
    return pointClassification === 1
  }))

  if (
    !parkingIsOutOfBuilding ||
    !building.pointIsInPolygon(property.cornerOffsetsFromSetbacks) ||
    !building.pointIsOutOfPolygon(parking.parkingOutline)) {
    building.setLineColors(p.color(250, 20, 20))
    // TODO: Add the parking outline as an object I can apply pointIsOutOfPolygon 
  }
  else {
    building.setLineColors(p.color(20, 20, 20))
  }

};

export const handleApproachDrag = (
  p: p5,
  property: Property, approach: Approach, parking: Parking | null, garbage: Garbage | null, building: Building | null,
  isRotationFrozenRef: React.MutableRefObject<boolean>,
  approachDragMode: string | null

) => {

  if (!property || !approach || !approachDragMode) return;
  // || !building  || !parking || !garbage

  const _center = p.createVector(approach.center.x, approach.center.y);
  const approachEdgeAngle = property.approachEdge?.calculateAngle();


  let newX = p.mouseX;
  let newY = p.mouseY;
  const isVertical = isMoreVertical(approachEdgeAngle || 0, true);

  if (isVertical) {
    newX = approach.center.x + (newY - approach.center.y) / p.tan(approachEdgeAngle || 0);
    newY = p.mouseY;
  }
  else {
    newX = p.mouseX;
    newY = approach.center.y + (newX - approach.center.x) * p.tan(approachEdgeAngle || 0);
  }


  const allPointsInBoundary = allPointsInPolygon(property.propertyCorners, [approach.sitePlanElementCorners[0], approach.sitePlanElementCorners[1]]);

  if (truthChecker(allPointsInBoundary)) {

    approach.updateCenter(newX, newY);

    if (parking && garbage) {
      const angle = isRotationFrozenRef.current ? parking.angle : calculateAngle(parking.center, approach.center) - 90

      parking.updateAngle(angle); // +90 to get the perpendicular angle
      garbage.updateAngle(angle);
      // building.updateAngle(angle);

      if (building) {
        building.hasStopped = false
      }

      parking.calculateNumberOfFittableStalls(property.propertyCorners);
      parking.updateStallCorners(false, true);
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      if (building) {
        building.buildingLocator(p, building, parking, property, garbage);
      }
      garbage.updateCenterGarbage(parking);

      // building.updateEntrances();
      parking.createRotationHandles();

      // updateVisibilityGraph();

    }
  } else {

    const edgeMidpoint = property.approachEdge?.getMidpoint();
    if (!edgeMidpoint) return;


    if (
      p.dist(edgeMidpoint.x, edgeMidpoint.y, _center.x, _center.y) <
      p.dist(edgeMidpoint.x, edgeMidpoint.y, newX, newY)) {
      return
    }


    if (building) {
      building.hasStopped = true;
    }
    approach.updateCenter(newX, newY);
    if (parking && garbage) {
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
    }
  }


};

export const handleParkingDrag = (
  p: p5,
  property: Property, approach: Approach, parking: Parking, garbage: Garbage, building: Building | null,
  parkingDragMode: string | null,
  isRotationFrozenRef: React.MutableRefObject<boolean>
) => {

  if (!property || !approach || !parking || !garbage) return;

  // const _centerX = parking.center.x;
  // const _centerY = parking.center.y;
  const newX = p.mouseX;
  const newY = p.mouseY;

  const _angle = parking.angle;

  if (parkingDragMode === "rotate") {

    isRotationFrozenRef.current = true;
    parking.isRotating = true;

    const handle = parking.rotationHandles[parking.hoverHandleIndex];
    if (handle) {
      const mouse = p.createVector(newX, newY)
      const a = p.atan2(mouse.y - parking.center.y, mouse.x - parking.center.x) -
        p.atan2(handle.y - parking.center.y, handle.x - parking.center.x);

      const _garbageCenter = p.createVector(garbage.center.x, garbage.center.y);

      parking.updateAngle(parking.angle + a)
      garbage.updateAngle(parking.angle + a)

      parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
      parking.updateStallCorners();
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);


      garbage.updateCenterGarbage(parking);

      const parkingInBoundary = parking.pointIsInPolygon(property.cornerOffsetsFromSetbacks);
      const garbageInBoundary = garbage.pointIsInPolygon(property.cornerOffsetsFromSetbacks);


      if (building) {
        building.hasStopped = false;

        const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
          const pointClassification = classifyPoint(building?.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
          return pointClassification === 1
        }))

        const buildingIsOutOfParking = building?.pointIsOutOfPolygon(parking.parkingOutline);

        if (!parkingIsOutOfBuilding || !buildingIsOutOfParking) {
          parking.setLineColors(p.color(250, 20, 20))
        }
        else {
          parking.setLineColors(p.color(20, 20, 20))
        }

      }


      if (!parkingInBoundary || !garbageInBoundary) {

        // If I'm moving the parking lot close to the center, then let the new point stand.
        parking.updateAngle(_angle);
        garbage.updateAngle(_angle);

        parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
        parking.updateStallCorners();
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
        if (building) {
          building.hasStopped = false;
        }
        garbage.updateCenter(_garbageCenter.x, _garbageCenter.y)
        garbage.updateCenterGarbage(parking);
        return;
      }
      parking.createRotationHandles();


      // UNCOMMENT WHEN I'M READY TO PUT BACK IN ENTRANCES
      // updateVisibilityGraph();


      p.cursor(RotateArrow);
    }


  }

  else if (parkingDragMode === "center") {
    p.cursor('grabbing');

    parking.updateCenter(newX, newY);
    // const centerInBoundary = parking.pointIsInPolygon(property.cornerOffsetsFromSetbacks);
    // const center = calculateCentroid(property.propertyCorners)

    garbage.updateCenterGarbage(parking);
    // const garbageInBoundary = garbage.pointIsInPolygon(property.cornerOffsetsFromSetbacks);
    // if (!center) return;
    // if (!centerInBoundary || !garbageInBoundary) {
    //   if (
    //     p.dist(center.x, center.y, _centerX, _centerY) <
    //     p.dist(center.x, center.y, newX, newY)) {
    //     parking.updateCenter(_centerX, _centerY);
    //     garbage.updateCenterGarbage(parking);
    //     return
    //   }
    // }
    let angle = isRotationFrozenRef.current ? parking.angle : calculateAngle(parking.center, approach.center) - 90;
    parking.updateAngle(normalizeAngle(angle));
    garbage.updateAngle(normalizeAngle(angle));



    if (building) {
      building?.updateEntrances();

      const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
        const pointClassification = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
        return pointClassification === 1
      }))

      const buildingIsOutOfParking = building?.pointIsOutOfPolygon(parking.parkingOutline);


      if (!parkingIsOutOfBuilding || !buildingIsOutOfParking) {
        parking.setLineColors(p.color(250, 20, 20))
      }
      else {
        parking.setLineColors(p.color(20, 20, 20))
      }

    }


    // parking.parkingOutline.slice(3, -3)
    const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, parking.sitePlanElementCorners);
    // const garbageInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, garbage.sitePlanElementCorners);

    if (truthChecker(allPointsInBoundary)) {

      parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
      parking.updateStallCorners(false, isRotationFrozenRef.current);
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      if (building) {
        building.hasStopped = false;
      }
      parking.createRotationHandles();
      // UNCOMMENT WHEN I'M READY TO PUT BACK IN ENTRANCES
      // updateVisibilityGraph();
    } else {
      if (building) {
        building.hasStopped = true;
      }

      parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
      parking.updateStallCorners(false, isRotationFrozenRef.current);
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      // parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
    }
  }

  else {
    p.cursor('default')
  }

};


export const toLocal = (p: p5, building: Building, x: number, y: number) => {
  const dx = x - building.center.x;
  const dy = y - building.center.y;
  return {
    x: dx * p.cos(-building.angle) - dy * p.sin(-building.angle),
    y: dx * p.sin(-building.angle) + dy * p.cos(-building.angle),
  };
};

export const toGlobal = (p: p5, building: Building, x: number, y: number) => {
  return {
    x: x * p.cos(building.angle) - y * p.sin(building.angle) + building.center.x,
    y: x * p.sin(building.angle) + y * p.cos(building.angle) + building.center.y,
  };
};

export function drawNeonLine(p: p5,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineColor: p5.Color, glowSize = 20) {
  // Save the current drawing state
  p.push();

  // Disable the stroke outline
  p.noStroke();

  // Calculate the number of layers for the glow effect
  const layers = 15;

  // Calculate the alpha step for each layer
  const alphaStep = 255 / layers;

  // Calculate the size step for each layer
  const sizeStep = glowSize / layers;

  // Draw multiple layers from outside to inside
  for (let i = layers; i >= 0; i--) {
    // Calculate the current alpha and size
    const currentAlpha = (layers - i) * alphaStep;
    const currentSize = i * sizeStep;

    // Set the color with current alpha
    const c = p.color(p.red(lineColor), p.green(lineColor), p.blue(lineColor), currentAlpha);
    p.drawingContext.shadowColor = p.color(p.red(lineColor), p.green(lineColor), p.blue(lineColor), currentAlpha);
    p.drawingContext.shadowBlur = currentSize;

    // Draw the line
    p.stroke(c);
    p.strokeWeight(2);
    p.line(x1, y1, x2, y2);
  }

  // Draw the bright center
  p.stroke(255);
  p.strokeWeight(2);
  p.line(x1, y1, x2, y2);

  // Restore the drawing state
  p.pop();
}

export function drawNeonShape(
  p: p5,
  vertices: { x: number; y: number }[], // Array of vertices for the shape
  lineColor: p5.Color,
  glowSize = 20
): void {
  // Save the current drawing state
  p.push();

  // Disable the stroke outline
  p.noStroke();

  // Calculate the number of layers for the glow effect
  const layers = 15;

  // Calculate the alpha step for each layer
  const alphaStep = 255 / layers;

  // Calculate the size step for each layer
  const sizeStep = glowSize / layers;

  // Draw multiple layers from outside to inside
  for (let i = layers; i >= 0; i--) {
    // Calculate the current alpha and size
    const currentAlpha = (layers - i) * alphaStep;
    const currentSize = i * sizeStep;

    // Set the color with current alpha
    const c = p.color(
      p.red(lineColor),
      p.green(lineColor),
      p.blue(lineColor),
      currentAlpha
    );
    p.drawingContext.shadowColor = p.color(
      p.red(lineColor),
      p.green(lineColor),
      p.blue(lineColor),
      currentAlpha
    );
    p.drawingContext.shadowBlur = currentSize;

    // Draw the shape with current glow layer
    p.stroke(c);
    p.strokeWeight(2);
    p.beginShape();
    vertices.forEach((vertex) => {
      p.vertex(vertex.x, vertex.y);
    });
    p.endShape(p.CLOSE);
  }

  // Draw the bright center shape
  p.stroke(255);
  p.strokeWeight(2);
  p.beginShape();
  vertices.forEach((vertex) => {
    p.vertex(vertex.x, vertex.y);
  });
  p.endShape(p.CLOSE);
  // Restore the drawing state
  p.pop();
}

