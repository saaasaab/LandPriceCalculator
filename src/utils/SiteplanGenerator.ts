import p5 from "p5";
import classifyPoint from "robust-point-in-polygon"
import {  VisibilityGraph } from "../pages/VisibilityGraph";
import { setLineDash, calculateArea, polyPoint, expandPolygon, getLineIntersection, createWrappedIndices, calculateAngle, normalizeAngle, getCenterPoint, allPointsInPolygon, truthChecker, getParkingStallArea, calculateStallPosition, calculateCentroid, pointsAreInBoundary, calculatePointPosition, getAdjacentIndices, twoObjectsAreNotColliding, moveVector, arrayOfRandomNudges, createSitePlanElementCorners, rotateCorners, getIsClockwise, getReversedIndex, scalePolygonToFitCanvas, calculateDrivewayArea, runVisibilityGraphSolver, isMoreVertical, calculateApproachArea, findClosestEdge, calculatePointToEdgeDistance, getIntersectionPercentage, createDriveway} from "./SiteplanGeneratorUtils";
import { IPoint, Line } from "../pages/SiteplanDesigner/SitePlanDesigner";

type Point = [number, number];
export type SitePlanObjects = "Parking1" | "Parking2" | "Driveway" | "Bike Parking" | "Approach" | "Garbage" | "Building" | "ParkingWay";
enum ESitePlanObjects {
  ParkingWay = "ParkingWay",
  Parking1 = "Parking1",
  Parking2 = "Parking2",
  Driveway = "Driveway",
  BikeParking = "Bike Parking",
  Approach = "Approach",
  Garbage = "Garbage",
  Building = "Building"
}
export const stallWidth = 17;
export const stallHeight = 8.5;

export class Edge {
  public point1: p5.Vector;
  public point2: p5.Vector;
  public isApproach: boolean
  private p: p5;
  public setback: number;
  public point1Offset: p5.Vector;
  public point2Offset: p5.Vector;

  constructor(p: p5, point1: p5.Vector, point2: p5.Vector, isApproach: boolean, setback: number) {
    this.point1 = point1;
    this.point2 = point2;
    this.isApproach = isApproach;
    this.p = p;
    this.setback = setback;
    this.point1Offset = this.p.createVector(0, 0);
    this.point2Offset = this.p.createVector(0, 0);
  }

  updateEdge(newPoint1: p5.Vector, newPoint2: p5.Vector) {
    this.point1 = newPoint1;
    this.point2 = newPoint2;
  }

  getLineLength() {
    return this.p.dist(this.point1.x, this.point1.y, this.point2.x, this.point2.y)
  }

  getMidpoint() {
    const midX = (this.point1.x + this.point2.x) / 2;
    const midY = (this.point1.y + this.point2.y) / 2;
    return (this.p.createVector(midX, midY))
  }


  drawLine() {
    this.p.stroke(0);
    this.p.strokeWeight(3);


    if (this.isApproach) {
      this.p.stroke(45, 200, 30);
    }

    setLineDash(this.p, [5, 10, 30, 10, 5, 10])
    this.p.line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);


    setLineDash(this.p, [])
    this.p.textSize(24)

    // this.p.text(index, midpoint.x, midpoint.y)
  }

  calculateAngle(): number {
    const deltaY = this.point2.y - this.point1.y;
    const deltaX = this.point2.x - this.point1.x;

    // atan2 handles quadrants and division by zero
    const angleInRadians = Math.atan2(deltaY, deltaX);

    // Convert radians to degrees
    const angleInDegrees = this.p.degrees(angleInRadians);


    return angleInDegrees;
  }

  calculateClosestIntercept = (
    mouseX: number,
    mouseY: number,
    p: p5
  ): p5.Vector => {
    const point1 = this.point1;
    const point2 = this.point2;

    const mouse = p.createVector(mouseX, mouseY);

    // Vector from point1 to point2 (line direction)
    const lineVec = p5.Vector.sub(point2, point1);

    // Vector from point1 to the mouse position
    const mouseVec = p5.Vector.sub(mouse, point1);

    // Project mouseVec onto lineVec to find the closest point on the line
    const projectionLength = mouseVec.dot(lineVec) / lineVec.magSq();
    const projection = lineVec.mult(projectionLength);

    // Closest point on the line
    const closestPoint = p5.Vector.add(point1, projection);

    // Check if the closest point lies on the line segment
    const onSegment =
      projectionLength >= 0 && projectionLength <= 1;

    if (!onSegment) {
      // If not on the segment, return the closest endpoint
      const distToStart = p.dist(mouseX, mouseY, point1.x, point1.y);
      const distToEnd = p.dist(mouseX, mouseY, point2.x, point2.y);
      return distToStart < distToEnd ? point1.copy() : point2.copy();
    }

    return closestPoint;
  };

  createParallelEdge() {
    // Calculate the normalized perpendicular vector
    const direction = p5.Vector.sub(this.point2, this.point1).normalize();
    const perpendicular = this.p.createVector(-direction.y, direction.x);

    // Scale the perpendicular vector by the setback

    // p5.Vector.prototype.mult: x, y, or z arguments are either undefined or not a finite number

    const offset = perpendicular.mult(this.setback || 0);

    // Calculate the offset points for the new parallel edge
    const point1Offset = p5.Vector.add(this.point1, offset).add(direction.copy().mult(-100)); // Extend 100px backward
    const point2Offset = p5.Vector.add(this.point2, offset).add(direction.copy().mult(100)); // Extend 100px forward

    // Save the offset points
    this.point1Offset = point1Offset;
    this.point2Offset = point2Offset;
  }


}

export class ParkingStall {

  private p: p5;
  public side: number;
  public stallNumber: number;
  public angle: number;
  public parkingStallEdges: Edge[];
  public stallCorners: p5.Vector[];
  public previousAngle: number;
  public entranceEdge: Edge;
  public previousEntranceEdge: Edge;
  public isEmptySlot: boolean;
  public scale: number;
  public cementOffset: number
  public center: p5.Vector;

  constructor(p: p5, side: number, stallNumber: number, angle: number, stallCorners: p5.Vector[], entranceEdge: Edge, scale: number, cementOffset: number, center: p5.Vector) {
    this.p = p;
    this.side = side;
    this.stallNumber = stallNumber;
    this.angle = angle;
    this.parkingStallEdges = [];
    this.stallCorners = stallCorners;
    this.previousAngle = angle;
    this.entranceEdge = entranceEdge;
    this.previousEntranceEdge = entranceEdge;
    this.isEmptySlot = false;
    this.scale = scale;
    this.cementOffset = cementOffset;
    this.center = center

  }

  initialize() {
    this.createParkingStallCorners();
    this.setParkingStallEdges();
  }

  drawParkingStall() {
    const p = this.p;

    if (this.isEmptySlot) return;


    p.beginShape();
    p.stroke(0); // Outline color
    p.strokeWeight(1.5);

    const reorderCorners = [...this.stallCorners]
    // Needed to not show the parking lines inside the parkint lot.
    reorderCorners.push(...reorderCorners.splice(0, 1));
    reorderCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
      // p.text(i, corner.x, corner.y)
    })
    p.endShape(); // Close the polygon

    p.push();
    p.translate(this.center.x, this.center.y)
    p.rotate(this.angle);
    p.rect(Math.sign(this.cementOffset) * stallWidth / this.scale / 2 - this.cementOffset / this.scale, 0, .5 / this.scale, 7 / this.scale)
    p.pop()

    // p.drawingContext.fillStyle = 'white';

  }

  setParkingStallEdges() {

  }

  createParkingStallCorners() {

  }


}

export class Property {
  private p: p5;
  public propertyEdges: Edge[] = [];
  public propertyCorners: p5.Vector[];
  public approachEdge: Edge | null = null;
  public approachEdgeIndex: number;
  public approachAngle: number = 15;
  public propertyQuadrants: p5.Vector[][] = [];
  public maxAreaIndex: number = 0;
  public isClockwise: boolean;
  public scale: number;
  public cornerOffsetsFromSetbacks: p5.Vector[] = [];
  public setbacks: number[];
  public areaOfProperty: number;

  constructor(p: p5, propertyCorners: p5.Vector[], approachIndex: number, isClockwise: boolean, scale: number, setbacks: number[]) {
    this.p = p;
    this.propertyCorners = propertyCorners;
    this.approachEdgeIndex = approachIndex;
    this.isClockwise = isClockwise;
    this.scale = scale;
    this.setbacks = setbacks;
    this.areaOfProperty = 0;
  }

  initialize() {
    const p = this.p;
    const propertyCorners = this.propertyCorners;

    const propertyEdges: Edge[] = [];

    for (let i = 0; i < propertyCorners.length; i++) {
      const corner1 = propertyCorners[i];
      let corner2 = i === propertyCorners.length - 1 ? propertyCorners[0] : propertyCorners[i + 1];
      const isApproach = i === this.approachEdgeIndex;


      const newEdge = new Edge(p, corner1, corner2, isApproach, this.setbacks[i]);
      propertyEdges.push(newEdge);
    }

    this.propertyEdges = propertyEdges;

    this.approachEdge = propertyEdges[this.approachEdgeIndex];
    const initialApproachAngle = this.approachEdge?.calculateAngle();


    this.approachAngle = initialApproachAngle;
    this.calculatecornerOffsetsFromSetbacks();

    this.areaOfProperty = Math.round(calculateArea(propertyCorners) * this.scale * this.scale)

  }

  isMouseHovering(): boolean {
    return polyPoint(this.propertyCorners, this.p.mouseX, this.p.mouseY);
  }

  isMouseHoveringOffset(): boolean {
    const offset = expandPolygon(this.p, this.propertyCorners, 30);
    return polyPoint(offset, this.p.mouseX, this.p.mouseY);
  }



  drawProperty() {
    this.propertyEdges.forEach((edge) => {
      edge.drawLine()

      const midX = (edge.point1.x + edge.point2.x) / 2;
      const midY = (edge.point1.y + edge.point2.y) / 2;
      const length = Math.hypot(edge.point2.x - edge.point1.x, edge.point2.y - edge.point1.y) * (this.scale || .25);

      this.p.noStroke()
      this.p.fill('black')
      this.p.push();
      this.p.translate(midX, midY);
      this.p.rotate(edge.calculateAngle())
      this.p.textSize(14);
      this.p.text(`${length.toFixed(1)} ft`, 0, 0);
      this.p.pop();

    })


    this.p.noFill();
    this.p.stroke('black');
    this.p.strokeWeight(1)
    this.propertyCorners.forEach(corner => {
      this.p.ellipse(corner.x, corner.y, 6, 6);
    })
  }


  // New method to calculate offset intersections
  calculatecornerOffsetsFromSetbacks() {
    const cornerOffsetsFromSetbacks: p5.Vector[] = [];
    for (let i = 0; i < this.propertyEdges.length; i++) {
      const currentEdge = this.propertyEdges[i];
      currentEdge.createParallelEdge();
    }


    for (let i = 0; i < this.propertyEdges.length; i++) {
      const currentEdge = this.propertyEdges[i];
      const nextEdge = i === this.propertyEdges.length - 1 ? this.propertyEdges[0] : this.propertyEdges[i + 1];


      // Calculate the intersection point of the offset edges
      const intersection = this.getIntersection(currentEdge, nextEdge);
      if (intersection) {
        cornerOffsetsFromSetbacks.push(intersection);
      }
    }

    this.cornerOffsetsFromSetbacks = cornerOffsetsFromSetbacks;
  }

  drawSetbackPolygon() {
    const p = this.p;

    p.push()
    p.beginShape();
    p.fill(100, 200, 255, 50); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(1);


    this.cornerOffsetsFromSetbacks.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });
    p.endShape(p.CLOSE); // Close the polygon


    p.pop();
  }


  getIntersection(edge1: Edge, edge2: Edge): p5.Vector | null {
    const { p } = this;

    const x1 = edge1.point1Offset.x;
    const y1 = edge1.point1Offset.y;
    const x2 = edge1.point2Offset.x;
    const y2 = edge1.point2Offset.y;

    const x3 = edge2.point1Offset.x;
    const y3 = edge2.point1Offset.y;
    const x4 = edge2.point2Offset.x;
    const y4 = edge2.point2Offset.y;

    // Calculate the denominator for the line intersection formula
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // If denom is 0, the lines are parallel or coincident
    if (Math.abs(denom) < 1e-6) {
      console.warn("Lines are parallel or coincident:", { edge1, edge2 });
      return null;
    }

    // Calculate the intersection point
    const intersectX =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const intersectY =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    const intersection = p.createVector(intersectX, intersectY);

    // Debugging: Log the calculated intersection point

    // Check if the intersection lies on both line segments
    const tolerance = 1e-6; // Increase tolerance to handle floating-point precision
    const isOnEdge1 =
      Math.min(x1, x2) - tolerance <= intersectX &&
      intersectX <= Math.max(x1, x2) + tolerance &&
      Math.min(y1, y2) - tolerance <= intersectY &&
      intersectY <= Math.max(y1, y2) + tolerance;

    const isOnEdge2 =
      Math.min(x3, x4) - tolerance <= intersectX &&
      intersectX <= Math.max(x3, x4) + tolerance &&
      Math.min(y3, y4) - tolerance <= intersectY &&
      intersectY <= Math.max(y3, y4) + tolerance;

    if (isOnEdge1 && isOnEdge2) {
      return intersection;
    }


    return null; // Intersection is out of bounds
  }


  propertyQuadrant(property: Property, parking: SitePlanElement) {
    const p = this.p;
    // Find which edge the line intersects by looping through all the edges. If there are more than one, use the one closest to the center point
    // Find the intersection points of all the crosses, then calculate the area minus the parking size to get the "quadrant" with the most availiable area.

    p.stroke(50, 150, 150)
    const crossSize = 200;

    const offsets = [
      [-90, -90],
      [0, 0],
      [90, 90],
      [180, 180],
    ];

    const edgeIntersections: {
      edge: number;
      intersection: p5.Vector;
      distance: number;
      minDistanceIndex: number;
      offset: number[];
    }[] = [];



    offsets.forEach((offset) => {
      const intersections: p5.Vector[] = []
      const edgeIndecies: number[] = []

      property.propertyEdges.forEach((edge, edgeIndex) => {

        const intersect = getLineIntersection(
          p,
          [
            p.createVector(parking.center.x, parking.center.y),
            p.createVector(parking.center.x + p.cos(parking.angle + offset[0]) * crossSize, parking.center.y + p.sin(parking.angle + offset[1]) * crossSize)
          ],
          [edge.point1, edge.point2]
        )
        if (intersect) {
          intersections.push(intersect)
          edgeIndecies.push(edgeIndex);
        }
      })


      let minDistance = Infinity;
      let minDistanceIndex = 0;
      intersections.forEach((intersection, i) => {
        let d = intersection.dist(parking.center);

        if (d < minDistance) {
          minDistanceIndex = i;
          minDistance = d;
        }
      })

      edgeIntersections.push({
        edge: edgeIndecies[minDistanceIndex],
        intersection: intersections[minDistanceIndex],
        distance: minDistance,
        minDistanceIndex: minDistanceIndex,
        offset: offset,
      });
    });


    edgeIntersections.forEach((intersection) => {
      p.ellipse(intersection?.intersection?.x || 0, intersection?.intersection?.y || 0, 10, 10)
      p.line(parking.center.x, parking.center.y, parking.center.x + p.cos(parking.angle + intersection.offset[0]) * crossSize, parking.center.y + p.sin(parking.angle + intersection.offset[1]) * crossSize)
    })

    const totalEdges = edgeIntersections.length;
    const polys: p5.Vector[][] = []
    edgeIntersections.forEach((_current, index) => {

      const nextIndex = (index + 1) % totalEdges; // Wrap around to the start when at the last index
      // const next = edgeIntersections[nextIndex];


      const poly = [
        parking.center,
        edgeIntersections[index].intersection,
        property.propertyEdges[edgeIntersections[index].edge].point2,
      ];
      const startEdge = edgeIntersections[index].edge;
      const endEdge = edgeIntersections[nextIndex].edge;
      const indexes = createWrappedIndices(startEdge, endEdge, property.propertyEdges.length)

      indexes.forEach(index =>
        poly.push(
          property.propertyEdges[index].point2,
        )
      )
      poly.push(edgeIntersections[nextIndex].intersection);
      polys.push(poly);
    });

    let maxArea = -Infinity;
    let maxAreaIndex = 0;
    // let neighboringMaxIndex = -1;
    let secondMaxArea = -Infinity;

    polys.forEach((poly, i) => {
      let area = calculateArea(poly);

      if (area > maxArea) {
        // Update second max area with the previous max area
        secondMaxArea = maxArea;

        // Update neighbor index
        // neighboringMaxIndex = maxAreaIndex;

        // Set new max area and max area index
        maxArea = area;
        maxAreaIndex = i;
      } else if (area > secondMaxArea) {
        // Update the second max area and its index
        secondMaxArea = area;
        // neighboringMaxIndex = i;
      }
    });

    this.propertyQuadrants = polys;

    this.maxAreaIndex = maxAreaIndex;

  }
}

export class SitePlanElement {
  public angle: number;
  public center: p5.Vector;
  public previousCenter: p5.Vector;


  public elementType: SitePlanObjects;
  public entranceEdge: Edge | null;
  public height: number;
  public offsetSitePlanElementCorners: p5.Vector[];
  public p: p5;
  public previousAngle: number;
  public previousEntranceEdge: Edge | null;
  public sitePlanElementCorners: p5.Vector[];
  public sitePlanElementEdges: Edge[];
  public width: number;
  public scale: number;
  public area: number;

  constructor(p: p5, center: p5.Vector, width: number, height: number, angle: number, elementType: SitePlanObjects, scale: number) {
    this.angle = angle;
    this.center = center;
    this.elementType = elementType;
    this.entranceEdge = null;
    this.height = height;
    this.offsetSitePlanElementCorners = [];
    this.p = p;
    this.previousAngle = angle;
    this.previousEntranceEdge = null;
    this.sitePlanElementCorners = [];
    this.sitePlanElementEdges = [];
    this.width = width;
    this.scale = scale;
    this.previousCenter = center;
    this.area = Math.round(width * height);

  }

  initialize() {
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
  }

  calculateArea() {
    this.area = Math.round(calculateArea(this.sitePlanElementCorners));
  }


  projectFromCenter(position: p5.Vector, distance: number) {
    const _angle = calculateAngle(this.center, position);

    const newX = position.x + this.p.cos(_angle) * distance;
    const newY = position.y + this.p.sin(_angle) * distance;

    return { x: newX, y: newY }
  }
  pointIsInPolygon(corners: p5.Vector[], point: p5.Vector) {
    // 1 = outside
    // 0 = on the border
    // -1 = inside
    const searchPoint = [point.x, point.y]
    const pointClassification = classifyPoint(corners.map(corner => [corner.x, corner.y]) as Point[], searchPoint as Point)
    return pointClassification === -1
  }


  // take the corners 
  pointIsOutOfPolygon(corners: p5.Vector[], point: p5.Vector) {
    // 1 = outside
    // 0 = on the border
    // -1 = inside

    const searchPoint = [point.x, point.y]
    const pointClassification = classifyPoint(corners.map(corner => [corner.x, corner.y]) as Point[], searchPoint as Point)
    return pointClassification === 1
  }

  setSitePlanElementEdges() {
    const sitePlanElementCorners = this.sitePlanElementCorners;

    const edges: Edge[] = []
    for (let i = 0; i < sitePlanElementCorners.length; i++) {
      const corner1 = sitePlanElementCorners[i];
      let corner2 = i === sitePlanElementCorners.length - 1 ? sitePlanElementCorners[0] : sitePlanElementCorners[i + 1];

      const isApproach = i === 2 && this.elementType === ESitePlanObjects.Approach;
      const newEdge = new Edge(this.p, corner1, corner2, isApproach, 0);
      edges.push(newEdge);
    }
    this.sitePlanElementEdges = edges

  }

  updateCenter(newX: number, newY: number) {

    if (this.center.x === newX && this.center.y === newY) return
    // newX
    this.previousCenter = this.center;
    this.center.x = newX;
    this.center.y = newY;

    this.update();


  }


  update() {
    this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.createOffsetPolygon();

    this.calculateArea();
  }

  updateAngle(angle: number) {
    this.angle = angle;
    this.update();
  }

  updateheight(height: number) {
    this.height = height;
    this.update();
  }

  updateWidth(width: number) {
    this.width = width;
    this.update();
  }

  updateSitePlanElementCorners() {
    const p = this.p;
    const center = this.center;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;


    const angle = normalizeAngle(this.angle);

    // Define the initial (unrotated) corner points relative to the center
    const corners: p5.Vector[] = [
      p.createVector(-halfWidth, -halfHeight), // Top-left
      p.createVector(halfWidth, -halfHeight),  // Top-right
      p.createVector(halfWidth, halfHeight),   // Bottom-right
      p.createVector(-halfWidth, halfHeight),  // Bottom-left
    ];

    // Rotate each corner around the center and compute its absolute position
    this.sitePlanElementCorners = corners.map((corner) => {
      const rotatedX = corner.x * p.cos(angle) - corner.y * p.sin(angle);
      const rotatedY = corner.x * p.sin(angle) + corner.y * p.cos(angle);
      return p.createVector(center.x + rotatedX, center.y + rotatedY);
    });
  }

  createSitePlanElementCorners() {
    const p = this.p;
    const center = this.center;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    // Define the initial (unrotated) corner points relative to the center
    const corners: p5.Vector[] = [
      p.createVector(-halfWidth, -halfHeight), // Top-left
      p.createVector(halfWidth, -halfHeight),  // Top-right
      p.createVector(halfWidth, halfHeight),   // Bottom-right
      p.createVector(-halfWidth, halfHeight),  // Bottom-left
    ];

    // Convert the angle to radians
    const angle = normalizeAngle(this.angle);

    // Rotate each corner around the center and compute its absolute position
    this.sitePlanElementCorners = corners.map((corner) => {
      const rotatedX = corner.x * p.cos(angle) - corner.y * p.sin(angle);
      const rotatedY = corner.x * p.sin(angle) + corner.y * p.cos(angle);
      return p.createVector(center.x + rotatedX, center.y + rotatedY);
    });
  }

  isMouseHovering(): boolean {
    return polyPoint(this.sitePlanElementCorners, this.p.mouseX, this.p.mouseY);
  }

  isMouseHoveringOffset(): boolean {
    return polyPoint(this.offsetSitePlanElementCorners, this.p.mouseX, this.p.mouseY);
  }

  createOffsetPolygon() {
    this.offsetSitePlanElementCorners = expandPolygon(this.p, this.sitePlanElementCorners, 30);
  }

  drawSitePlanElement() {
    const p = this.p;
    p.push()

    p.angleMode(p.DEGREES);

    // Draw the polygon using the corner vectors
    p.beginShape();
    p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);



    this.sitePlanElementCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
      // p.text(i, corner.x, corner.y)
    });


    p.endShape(p.CLOSE); // Close the polygon

    p.ellipse(this.center.x, this.center.y, 10, 10);


    // p.text(p.round(this.angle), this.center.x, this.center.y);

    this.sitePlanElementEdges.forEach((edge) => {
      const center = getCenterPoint(this.p, edge.point1, edge.point2);
      p.fill(200, 20, 40);
      p.ellipse(center.x, center.y, 10, 10);

      // p.text(i,center.x, center.y)
      p.strokeWeight(1)
      p.fill(40, 200, 20);


      // p.text(p.round(edge.calculateAngle()), center.x, center.y);
    })

    p.pop()


  }

}

export class Approach extends SitePlanElement {

  public approachArea: number
  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number
  ) {
    super(p, center, width, height, angle, elementType, scale);
    this.approachArea = width * height / 2
  }

  drawApproach() {
    const p = this.p;
    p.push()

    p.angleMode(p.DEGREES);

    // Draw the polygon using the corner vectors
    p.beginShape();
    p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);



    this.sitePlanElementCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
      // p.text(i, corner.x, corner.y)
    });


    p.endShape(p.CLOSE); // Close the polygon

    p.ellipse(this.center.x, this.center.y, 10, 10);


    // p.text(p.round(this.angle), this.center.x, this.center.y);

    this.sitePlanElementEdges.forEach(edge => {
      const center = getCenterPoint(this.p, edge.point1, edge.point2);
      p.fill(200, 20, 40);
      p.ellipse(center.x, center.y, 10, 10);
      p.strokeWeight(1)
      p.fill(40, 200, 20);


      // p.text(p.round(edge.calculateAngle()), center.x, center.y);
    })

    p.pop()


  }



}

export class Parking extends SitePlanElement {

  public entranceEdgeIndex: number | null;
  public parkingStalls: {
    left: ParkingStall[];
    right: ParkingStall[];
  };
  public scale: number;
  public parkingStallsNumber: number;
  public parkingArea: number;
  public parkingStallsArea: number;
  public handicappedParkingNum: number;
  public parkingOutline: p5.Vector[]
  public parkingOutlineDoubleLayer: p5.Vector[]




  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number,
    // additionalProperty: string // New property specific to this class
  ) {
    // Call the parent export class constructor to initialize all inherited variables
    super(p, center, width, height, angle, elementType, scale);

    this.entranceEdgeIndex = null;
    this.parkingStalls = { left: [], right: [] };
    this.entranceEdgeIndex = 2;
    this.scale = scale;
    this.parkingStallsNumber = 4;
    this.parkingArea = Math.round(width * height);
    this.parkingStallsArea = 0;
    this.handicappedParkingNum = 0;
    this.parkingOutline = []
    this.parkingOutlineDoubleLayer = []


  }

  initializeParking(property: Property, approach: Approach) {
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]


    let parkingCount = 0;
    let previousParkingCount = -1;


    while (parkingCount !== previousParkingCount) {

      // Update the parking on initialize
      const newX = this.center.x;
      const newY = this.center.y;
      const centerInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, [this.p.createVector(newX, newY)]);

      if (!truthChecker(centerInBoundary)) { return }

      const angle2 = calculateAngle(this.center, approach.center);
      this.updateAngle(normalizeAngle(angle2 - 90))

      const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, this.sitePlanElementCorners);

      if (truthChecker(allPointsInBoundary)) {

        this.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);

        this.updateStallCorners(true);

        this.updateParkingHeight(property.cornerOffsetsFromSetbacks);

      }
      else {
        this.updateParkingHeight(property.cornerOffsetsFromSetbacks);

      }


      previousParkingCount = parkingCount;
      parkingCount = this.parkingStalls.left.length + this.parkingStalls.right.length


    }



  }

  update() {
    this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.createOffsetPolygon();

    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.parkingArea = Math.round(this.width * this.height * this.scale * this.scale);


    this.parkingStallsArea = getParkingStallArea(this)
  }

  drawParkingStalls() {
    this.parkingStalls.right.forEach((stall) => {
      if (!stall.isEmptySlot) {
        stall.drawParkingStall();
      }
    })

    this.parkingStalls.left.forEach((stall) => {
      if (!stall.isEmptySlot) {
        stall.drawParkingStall();
      }
    })
  }




  updateStallCorners(isInit = false, isRotationFrozen = false) {
    if (!this.entranceEdge || !this.previousEntranceEdge) return;

    if (isInit || (
      isRotationFrozen ||
      this.angle !== this.previousAngle ||
      this.entranceEdge.point1.x !== this.previousEntranceEdge.point1.x ||
      this.entranceEdge.point1.y !== this.previousEntranceEdge.point1.y ||

      this.entranceEdge.point2.x !== this.previousEntranceEdge.point2.x ||
      this.entranceEdge.point2.y !== this.previousEntranceEdge.point2.y)) {

      // OH NO, SOMETHING CHANGED

      for (let i = 0; i < this.parkingStalls.left.length; i++) {
        // Update the points


        // const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p,  this.entranceEdge, this.angle, this.parkingStalls);
        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.left, "left", i, this.scale)

        const _center = calculateCentroid(updatedPoints);
        this.parkingStalls.left[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.left[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.left[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.left[i].stallCorners[3] = updatedPoints[3]
        this.parkingStalls.left[i].center.x = _center.x
        this.parkingStalls.left[i].center.y = _center.y
        this.parkingStalls.left[i].angle = this.angle




      }

      for (let i = 0; i < this.parkingStalls.right.length; i++) {
        // update the points

        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.right, "right", i, this.scale)

        const _center = calculateCentroid(updatedPoints);
        this.parkingStalls.right[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.right[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.right[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.right[i].stallCorners[3] = updatedPoints[3]
        this.parkingStalls.right[i].center.x = _center.x
        this.parkingStalls.right[i].center.y = _center.y
        this.parkingStalls.right[i].angle = this.angle
      }


      this.previousEntranceEdge.point1.x = this.entranceEdge.point1.x;
      this.previousEntranceEdge.point1.y = this.entranceEdge.point1.y;
      this.previousEntranceEdge.point2.x = this.entranceEdge.point2.x;
      this.previousEntranceEdge.point2.y = this.entranceEdge.point2.y;
      this.previousAngle = this.angle;
    }
  }

  updateParkingHeight(propertyCorners: p5.Vector[]) {
    // Take a snapshot to revert
    const maxParkingStalls = Math.max(this.parkingStalls.left.length, this.parkingStalls.right.length);

    const garbageHeight = 10 / this.scale / 2;

    this.updateheight(maxParkingStalls * stallHeight / this.scale + garbageHeight);


    let parkingNotFit = true;
    let recalcCount = 1;
    while (parkingNotFit && maxParkingStalls - recalcCount > 0) {

      // Should check with ALL the boundaries
      const allIn = this.sitePlanElementCorners.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(propertyCorners, point) === -1
      });


      if (truthChecker(allIn)) {
        parkingNotFit = false;
      }


      else {
        if (this.parkingStalls.left.length >= maxParkingStalls - recalcCount) {
          this.parkingStalls.left.pop();
        }
        if (this.parkingStalls.right.length >= maxParkingStalls - recalcCount) {
          this.parkingStalls.right.pop();
        }

        this.updateheight((maxParkingStalls - recalcCount) * stallHeight / this.scale + garbageHeight);
        recalcCount++
      }
    }
  }

  updateParkingStallsNumber(property: Property, parkingNum: number) {
    this.parkingStallsNumber = parkingNum

    this.calculateNumberOfFittableStalls(property.propertyCorners)
    this.updateStallCorners(true);
    this.updateParkingHeight(property.cornerOffsetsFromSetbacks);
  }

  calculateNumberOfFittableStalls(propertyCorners: p5.Vector[]) {
    const maxNumStalls = this.parkingStallsNumber;

    const entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0];
    const parkingAngle = this.angle;


    const leftStallsToEmpty: number[] = []
    const rightStallsToEmpty: number[] = []

    // When a parking stall goes out of bounds, remove that stall
    Object.keys(this.parkingStalls).forEach(side =>
      this.parkingStalls[side as ("left" | "right")].forEach((stall, i) => {

        // Just reset the slots since we're checking anyway.
        stall.isEmptySlot = false;
        const allIn = stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(propertyCorners, point) === -1
        });


        if (!truthChecker(allIn)) {
          if (side === "left") leftStallsToEmpty.push(i);
          if (side === "right") rightStallsToEmpty.push(i);
        }
      })
    )

    if (leftStallsToEmpty.length > 0 || rightStallsToEmpty.length > 0) {
      leftStallsToEmpty.forEach(indexToBeEmptied => {
        this.parkingStalls.left[indexToBeEmptied].isEmptySlot = true;
      })
      rightStallsToEmpty.forEach(indexToBeEmptied => {
        this.parkingStalls.right[indexToBeEmptied].isEmptySlot = true;
      })


      // const _removedLeft = removeItemsByIndices(this.parkingStalls.left, leftStallsToEmpty);
      // const _removedRight = removeItemsByIndices(this.parkingStalls.right, rightStallsToEmpty);

      // this.parkingStalls.left = _removedLeft;
      // this.parkingStalls.right = _removedRight;
    }


    const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p, entranceEdge, parkingAngle, this.parkingStalls, this.scale);

    // Expand the parking size

    const sideNumber = getAdjacentIndices(this.entranceEdgeIndex || 0, propertyCorners.length);

    // check if new points are inside the boundary;
    const newPointsAreInBoundaryRight = stallCornerRight.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(propertyCorners, point) === -1
    });

    const newPointsAreInBoundaryLeft = stallCornerLeft.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(propertyCorners, point) === -1
    });

    // this.updateSitePlanElementEdges();

    const updatedParkingLotIsInBoundary = this.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(propertyCorners, point) === -1
    });


    // AND CHECK IF THE NEW PARKING LOT IS IN BOUNDS TOO. 
    // For left, use right [1]
    // For right, use left [1]


    if (truthChecker(newPointsAreInBoundaryRight) && this.parkingStalls.right.length < maxNumStalls) {

      const center = calculateCentroid(stallCornerRight)
      const newParkingStall = new ParkingStall(this.p, sideNumber[1], this.parkingStalls.right.length + 1, this.angle, stallCornerRight, entranceEdge, this.scale, 1.5, this.p.createVector(center.x, center.y));
      this.parkingStalls.right.push(newParkingStall);
    }

    if (truthChecker(newPointsAreInBoundaryLeft) && this.parkingStalls.left.length < maxNumStalls) {
      const center = calculateCentroid(stallCornerLeft)

      const newParkingStall = new ParkingStall(this.p, sideNumber[0], this.parkingStalls.left.length + 1, this.angle, stallCornerLeft, entranceEdge, this.scale, -1.5, this.p.createVector(center.x, center.y));
      this.parkingStalls.left.push(newParkingStall);
    }


    if (!truthChecker(updatedParkingLotIsInBoundary)) {
    }




  }
  createParkingOutline(p: p5, parking: Parking, garbage: Garbage, approach: Approach) {
    if (!parking.entranceEdge && !garbage) return;
    // This is going counter clockwise

    const rightStalls = parking.parkingStalls.right.filter(stall => !stall.isEmptySlot);
    const leftStalls = parking.parkingStalls.left.filter(stall => !stall.isEmptySlot);

    const firstRightStall = rightStalls[0]
    const lastRightStall = rightStalls[rightStalls.length - 1]

    const firstLeftStall = leftStalls[0]
    const lastLeftStall = leftStalls[leftStalls.length - 1];

    const parkingOutline = [
      approach.sitePlanElementCorners[2],
      approach.sitePlanElementCorners[1],
      parking.sitePlanElementCorners[2],
    ]

    if (rightStalls.length > 0) {
      parkingOutline.push(
        firstRightStall.stallCorners[0],
        firstRightStall.stallCorners[3],
        lastRightStall.stallCorners[2],
        lastRightStall.stallCorners[1],
      )
    }


    parkingOutline.push(
      parking.sitePlanElementCorners[1],
      parking.sitePlanElementCorners[0],
    )

    if (leftStalls.length > 0) {
      parkingOutline.push(
        lastLeftStall.stallCorners[1],
        lastLeftStall.stallCorners[2],
        firstLeftStall.stallCorners[3],
        firstLeftStall.stallCorners[0],
      )

    }



    parkingOutline.push(
      parking.sitePlanElementCorners[3],
      approach.sitePlanElementCorners[0],
      approach.sitePlanElementCorners[3],
    )

    // Set the this.parkingOutline to the inner layer before the offset is created. 
    this.parkingOutline = parkingOutline;

    const offsetParking = expandPolygon(this.p, parkingOutline, -5);
    const points = [...offsetParking, ...parkingOutline.reverse()];

    this.parkingOutlineDoubleLayer = points;
    // Double stroke
    p.beginShape();
    p.fill(120, 220, 40, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(1);




    // p.vertex(parking.entranceEdge?.point2.x || 0, parking.entranceEdge?.point2.y || 0);



    p.textSize(10)




    // const offsetEntranceEdge = new Edge(p, offsetParking[0], offsetParking[1], false, 0)

    points.forEach((corner) => {
      //  if (i === 1 && parking.entranceEdge) {
      //     drawPerpendicularBezier(
      //       p,
      //       offsetParking[1],
      //       offsetParking[2],
      //       offsetParkingEdge,
      //       offsetEntranceEdge,
      //       true
      //     );
      //   }

      //   else if (i === points.length - 3 && parking.entranceEdge) {
      //     drawPerpendicularBezier(
      //       p,
      //       parking.entranceEdge.point1,
      //       approach.sitePlanElementCorners[1],
      //       parking.entranceEdge,
      //       approach.sitePlanElementEdges[2],
      //       false
      //     );
      //   }

      //   else if (i === points.length / 2 + 2 && parking.entranceEdge) {
      //     drawPerpendicularBezier(
      //       p,
      //       approach.sitePlanElementCorners[0],
      //       parking.entranceEdge.point2,
      //       approach.sitePlanElementEdges[2],
      //       parking.entranceEdge,
      //       true
      //     );
      //   }

      //   else {
      p.vertex(corner.x, corner.y);
      // p.text(i, corner.x, corner.y);
      // }




    });
    p.endShape(p.CLOSE); // Close the polygon


  }
}

export class Entrance {
  public p: p5;
  private scale: number;
  public lerpPos: number;
  public intersection: p5.Vector;
  public angle: number;
  public angleToParent: number;
  public edgeIndex: number;
  public buildingCenter: p5.Vector;
  // public buildingCenter: p5.Vector;


  constructor(p: p5, scale: number, lerpPos: number, intersection: p5.Vector, angle: number, edgeIndex: number, buildingCenter: p5.Vector) {
    this.p = p;
    this.scale = scale;
    this.lerpPos = lerpPos;
    this.intersection = intersection;
    this.angle = angle;
    this.angleToParent = angle;
    this.edgeIndex = edgeIndex;
    this.buildingCenter = buildingCenter;
  }

  projectFromCenter(position: p5.Vector, distance: number) {
    const _angle = calculateAngle(this.buildingCenter, position);

    const newX = position.x + this.p.cos(_angle) * distance;
    const newY = position.y + this.p.sin(_angle) * distance;

    return { x: newX, y: newY }
  }



  calculatePointAtDistance = (
    intersection: p5.Vector,
    edge: Edge,
    distance: number,
    p: p5
  ): p5.Vector => {
    const { point1, point2 } = edge;

    // Calculate the edge's direction vector
    const edgeVector = p5.Vector.sub(point2, point1);

    // Find a perpendicular vector and negate it to reverse direction
    const perpendicular = p.createVector(edgeVector.y, -edgeVector.x).normalize();

    // Calculate the point at the specified perpendicular distance in the opposite direction
    const targetPoint = p.createVector(
      intersection.x + perpendicular.x * distance,
      intersection.y + perpendicular.y * distance
    );

    return targetPoint;
  };



  drawEnterance() {
    const p = this.p;

    // const isInwardEnterance = true;

    const enteranceWidth = 8;

    p.push();
    p.stroke('black')


    p.translate(this.intersection.x, this.intersection.y)
    p.rotate(this.angle - 180)
    p.strokeWeight(2)
    p.line(0, 0, enteranceWidth / this.scale / 2, 0);
    p.strokeWeight(1)
    p.arc(0, 0, enteranceWidth / this.scale, enteranceWidth / this.scale, 0, 90, p.PIE);
    p.pop()
  }
}

export class Building extends SitePlanElement {
  public isInitialized = false;
  public frameCount = 0;
  public entrances: Entrance[] = [];
  public buildingAreaTarget: number;
  public buildingAreaActual: number;
  public hasStopped: boolean;
  public ismoving: boolean;

  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number,
  ) {
    // Call the parent class constructor to initialize all inherited variables
    super(p, center, width, height, angle, elementType, scale);
    this.buildingAreaTarget = 1500;
    this.buildingAreaActual = 0;
    this.hasStopped = true;
    this.ismoving = false;
  }

  initializeBuilding(x: number, y: number,) {
    this.isInitialized = true;

    this.center.x = x;
    this.center.y = y;

    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges()

    this.buildingAreaActual = Math.round(calculateArea(this.sitePlanElementCorners) * this.scale * this.scale);
  }

  updateBuildingCenter(newX: number, newY: number) {
    this.updateCenter(newX, newY);
    this.updateEntrances();
  }

  updateBuildingArea(area: number) {
    // Should be in sqrt ft
    this.buildingAreaTarget = area;
  }

  tempBuilding() {

    this.p.rectMode(this.p.CENTER);

    this.p.strokeWeight(2)
    const speed = 1
    this.p.rect(this.p.mouseX, this.p.mouseY, this.frameCount * speed, this.frameCount * speed, 4);
    this.frameCount++;

    if (this.frameCount * speed > 50) this.frameCount = 0

  }

  drawBuilding() {
    if (this.isInitialized) {
      this.drawSitePlanElement();


      this.entrances.forEach(entrance => {
        entrance.drawEnterance();
      })
    }
  }





  updateEntrances() {
    this.entrances.forEach(entrance => {
      const edge = this.sitePlanElementEdges[entrance.edgeIndex];

      const newX = this.p.lerp(edge.point1.x, edge.point2.x, entrance.lerpPos)
      const newY = this.p.lerp(edge.point1.y, edge.point2.y, entrance.lerpPos)

      // const newVector = entrance.projectFromCenter(this.p.createVector(newX, newY), 10)



      entrance.intersection = this.p.createVector(newX, newY);
      entrance.angle = edge.calculateAngle() - 90;
    })

  }

  buildingLocator(p: p5, building: Building, parking: Parking, property: Property, garbage: Garbage) {
    if (!this.isInitialized) return;
    // If we are inside something, then move in the oppisite direction of its center.

    // OR it should be a mix of the vectors. 
    // const buildingBuffer = expandPolygon(this.p, tempBuildingCorners, 10 / this.scale);



    let isInsideParkingOutline = false;
    let isOutsideBoundary = false;
    let isInsideGarbage = false;


    isInsideParkingOutline = !twoObjectsAreNotColliding(building.sitePlanElementCorners, parking.parkingOutline)


    isOutsideBoundary = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(property.cornerOffsetsFromSetbacks, point) === 1
    }).some(el => el)

    isInsideGarbage = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(garbage.sitePlanElementCorners, point) === -1
    }).some(el => el)


    if (isInsideParkingOutline) {
      const newBuildingPosition = moveVector(parking.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      // building.reset();
    }

    if (isInsideGarbage) {
      const newBuildingPosition = moveVector(garbage.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      // building.reset();
    }

    if (isOutsideBoundary) {
      const propertyCenter = calculateCentroid(property.cornerOffsetsFromSetbacks);
      const propertyCenterVector = p.createVector(propertyCenter.x, propertyCenter.y)
      const newBuildingPosition = moveVector(propertyCenterVector, building.center, 1, false)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      building.reset();
    }



    // building.center = p.createVector(center.x, center.y);
    p.ellipse(building.center.x, building.center.y, 30, 30)
    this.buildingAreaActual = Math.round(calculateArea(this.sitePlanElementCorners) * this.scale * this.scale)

    this.hasStopped = false
  }

  reset() {
    this.updateheight(5);
    this.updateWidth(5)

    this.entrances = [];
  }

  buildingGrower(property: Property, parking: Parking) {
    type DimensionValue = {
      x: number;
      y: number;
      angle: number;
      width: number;
      height: number;
      corners: p5.Vector[];
    }


    if (!this.isInitialized) return;

    const nudgeStrength = 2;
    // const nudgeStrengthDimensions = 1;
    const angleNudge = .5;
    const possibleDimensions: DimensionValue[] = [];
    const numChildren = 10;

    const defaultDimensions: DimensionValue = {
      x: this.center.x,
      y: this.center.y,
      angle: this.angle,
      width: this.width,
      height: this.height,
      corners: this.sitePlanElementCorners,
    }

    // Initialize the potential children
    for (let i = 0; i < numChildren; i++) {
      possibleDimensions.push(defaultDimensions);
    }

    // const randomNudge = arrayOfRandomNudges(nudgeStrengthDimensions, numChildren * 2);
    const randomAnglesNudge = arrayOfRandomNudges(angleNudge, numChildren);


    // Area needs to be closest to X


    const targetArea = this.buildingAreaTarget / (this.p.pow(this.scale, 2));

    let bestArea = calculateArea(this.sitePlanElementCorners)
    const error = Math.abs(targetArea - bestArea) / targetArea;

    if (error < .0005) {
      this.hasStopped = true
      return;
    }

    let bestAreaIndex = 0;

    // Building should be at lease 20 px away from anything else.


    // create a new variation of each child. Let the first child be an exact clone of the parent
    for (let i = 1; i < numChildren; i++) {
      const randomNudgePosition = arrayOfRandomNudges(nudgeStrength, 4);

      const newDimension = {
        ...possibleDimensions[i],
        width: possibleDimensions[i].width + randomNudgePosition[2],
        height: possibleDimensions[i].height + randomNudgePosition[3],
        x: possibleDimensions[i].x + randomNudgePosition[0],
        y: possibleDimensions[i].y + randomNudgePosition[1],
        angle: possibleDimensions[i].angle + randomAnglesNudge[i]
      };


      const _x = newDimension.x
      const _y = newDimension.y
      const _width = newDimension.width
      const _height = newDimension.height
      const _angle = newDimension.angle
      const tempBuildingCorners = createSitePlanElementCorners(this.p, _x, _y, _width, _height, _angle)



      // check if new points are inside the boundary;

      const tempBuildingCornersBufferForParking = expandPolygon(this.p, tempBuildingCorners, 8 / this.scale);



      // const tempBuildingCornersBufferForBorder = expandPolygon(this.p, tempBuildingCorners, 20 / this.scale);


      /* HIDE, only used to show the offsets  */

      // this.p.beginShape();
      // this.p.fill(150, 240, 55, 50); // Fill color with transparency
      // this.p.stroke(0); // Outline color
      // this.p.strokeWeight(2);

      // tempBuildingCornersBufferForParking.forEach((corner, i) => {
      //   this.p.vertex(corner.x, corner.y);
      // });
      // this.p.endShape(this.p.CLOSE); // Close the polygon

      // this.p.beginShape();
      // this.p.fill(250, 130, 55, 50); // Fill color with transparency
      // this.p.stroke(0); // Outline color
      // this.p.strokeWeight(2);

      // tempBuildingCornersBufferForBorder .forEach((corner, i) => {
      //   this.p.vertex(corner.x, corner.y);
      // });
      // this.p.endShape(this.p.CLOSE); // Close the polygon




      const newPointsAreInBoundary = truthChecker(tempBuildingCorners.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(property.cornerOffsetsFromSetbacks, point) === -1
      }));

      const newPointsAreOutOfParking = truthChecker(tempBuildingCornersBufferForParking.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(parking.sitePlanElementCorners, point) === 1
      }));

      const newPointsAreInBoundaryRight = truthChecker(tempBuildingCornersBufferForParking.map(corner => {
        const point: Point = [corner.x, corner.y];
        return truthChecker(parking.parkingStalls.right.map(stall => {
          return pointsAreInBoundary(stall.stallCorners, point) === 1
        }))
      }));
      const newPointsAreInBoundaryLeft = truthChecker(tempBuildingCornersBufferForParking.map(corner => {
        const point: Point = [corner.x, corner.y];
        return truthChecker(parking.parkingStalls.left.map(stall => {
          return pointsAreInBoundary(stall.stallCorners, point) === 1
        }))
      }));


      const newPointsAreInBoundaryRight2 = truthChecker(parking.parkingStalls.right.map(stall => {
        return truthChecker(stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(tempBuildingCornersBufferForParking, point) === 1
        }))
      }));

      const newPointsAreInBoundaryLeft2 = truthChecker(parking.parkingStalls.left.map(stall => {
        return truthChecker(stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(tempBuildingCornersBufferForParking, point) === 1
        }))
      }));



      if (newPointsAreInBoundary && newPointsAreOutOfParking && newPointsAreInBoundaryRight && newPointsAreInBoundaryLeft && newPointsAreInBoundaryRight2 && newPointsAreInBoundaryLeft2) {
        possibleDimensions[i] = {
          ...possibleDimensions[i],
          ...newDimension
        };

        const area = calculateArea(tempBuildingCorners);
        if (Math.abs(targetArea - area) < Math.abs(targetArea - bestArea)) {
          bestArea = area;
          bestAreaIndex = i;
        }
      }


      if (!newPointsAreInBoundaryRight) {
        // shoot out the opposite direction
      }
    }

    this.updateAngle(possibleDimensions[bestAreaIndex].angle)
    this.updateCenter(possibleDimensions[bestAreaIndex].x, possibleDimensions[bestAreaIndex].y)
    this.updateheight(possibleDimensions[bestAreaIndex].height);
    this.updateWidth(possibleDimensions[bestAreaIndex].width)

    this.updateEntrances()

    this.buildingAreaActual = Math.round(calculateArea(this.sitePlanElementCorners) * this.scale * this.scale);

  }

}

export class Garbage extends SitePlanElement {


  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number
  ) {
    // Call the parent class constructor to initialize all inherited variables
    super(p, center, width, height, angle, elementType, scale);
  }

  // initializeGargbage(property: Property, parking: Parking) {


  //   this.createSitePlanElementCorners();
  //   this.setSitePlanElementEdges();

  // }


  updateCenterGarbage(parking: Parking) {
// property: Property,

    parking.sitePlanElementEdges[0].point1

    const center = getCenterPoint(this.p, parking.sitePlanElementEdges[0].point1, parking.sitePlanElementEdges[0].point2);


    const _center = this.p.createVector(
      center.x + this.p.cos(this.angle - 90) * this.height / 2,
      center.y + this.p.sin(this.angle - 90) * this.height / 2
    );

    this.center.x = _center.x;
    this.center.y = _center.y;
  }
}



// Visualization module using p5.js
export class SiteplanGenerator {

  public points: IPoint[];
  public lines: Line[];
  public scale: number;
  public parkingNum: number;
  public drivewayArea: number;

  public property: Property | null;
  public parking: Parking | null;
  public building: Building | null;
  public garbage: Garbage | null;
  public approach: Approach | null;
  public pathCellIndex: number;
  public sidewalkArea: number;
  public bikeParkingArea: number;

  public globalAngle: number;
  public globalAnglePrev: number;
  public taperParking: boolean;

  // public p: p5;





  constructor(points: IPoint[], lines: Line[], scale: number) {
    this.globalAngle = 0;
    this.globalAnglePrev = 0;
    this.points = points;
    this.lines = lines;
    this.scale = scale;
    this.parkingNum = 10;
    this.property = null;
    this.parking = null;
    this.building = null;
    this.garbage = null;
    this.approach = null;
    this.pathCellIndex = 0;
    this.drivewayArea = 0;
    this.sidewalkArea = 0;
    this.bikeParkingArea = 0;
    this.taperParking = true;

  }

  initialize(p: p5) {
    p.clear(); // Clear the canvas
    p.angleMode(p.DEGREES);
    // p.frameRate(10);
    let propertyCorners = this.points.map(point => p.createVector(point.x, point.y));
    let lines = [...this.lines];
    const userGeneratedPoints = !!this.points.length;

    const setbacks = Array.apply(null, Array(this.lines.length)).map(Number.prototype.valueOf, 0);

    if (!this.points.length) {


      propertyCorners = [
        p.createVector(140, 80),
        p.createVector(p.width - 180, 50),
        p.createVector(p.width - 180, p.height / 2 + 10),
        p.createVector(p.width - 135, p.height - 120),
        p.createVector(p.width / 2 - 140, p.height - 150),
        p.createVector(108, p.height - 220),
      ];

      propertyCorners = rotateCorners(p, propertyCorners, this.globalAngle);
    }


    let approachIndex = this.lines.findIndex(line => line.isApproach);
    approachIndex = approachIndex === -1 ? 0 : approachIndex;

    const isClockwise = getIsClockwise(propertyCorners)
    if (isClockwise) {
      const first = propertyCorners[0];
      const rest = propertyCorners.slice(1, propertyCorners.length).reverse()
      propertyCorners = [first, ...rest]
      const newIndex = getReversedIndex(approachIndex, this.lines.length);
      approachIndex = newIndex;
    }




    const { scaledPolygon, scaleFactor } = scalePolygonToFitCanvas(p, propertyCorners, p.width, p.height, 40);
    this.scale = userGeneratedPoints ? this.scale / scaleFactor : this.scale / scaleFactor;


    if (lines.length) {
      lines.forEach((line, index) => {
        let _i = index;
        if (isClockwise) {
          _i = getReversedIndex(index, this.lines.length);
        }
        setbacks[_i] = (line.setback || 0) / this.scale
      });
    }


    propertyCorners = scaledPolygon;
    this.property = new Property(p, propertyCorners, approachIndex === -1 ? 0 : approachIndex, isClockwise, this.scale, setbacks);
    this.property.initialize()
    const approachAngle = (this.property.approachEdge?.calculateAngle() || 0) + 180;



    const approachWidth = 20 / this.scale;
    const parkingWidth = 24 / this.scale;
    const buildingDefault = 1;
    const centerOfProperty = calculateCentroid(this.property.cornerOffsetsFromSetbacks)
    const defaultVector = p.createVector(0, 0)

    this.approach = new Approach(p, getCenterPoint(p, this.property.approachEdge?.point1 || defaultVector, this.property.approachEdge?.point2 || defaultVector), approachWidth, 30, approachAngle, ESitePlanObjects.Approach, this.scale);
    this.parking = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 10, approachAngle, ESitePlanObjects.ParkingWay, this.scale);
    this.building = new Building(p, p.createVector(p.width / 2, p.height / 2), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, this.scale);

    this.approach.initialize()
    this.parking.initializeParking(this.property, this.approach)

    this.parking.calculateNumberOfFittableStalls(this.property.cornerOffsetsFromSetbacks);
    this.parking.updateStallCorners();
    this.parking.updateParkingHeight(this.property.cornerOffsetsFromSetbacks);
    this.property.propertyQuadrant(this.property, this.parking);

    this.garbage = new Garbage(p, getCenterPoint(p, this.parking.sitePlanElementEdges[0].point1, this.parking.sitePlanElementEdges[0].point2 || defaultVector), 12 / this.scale, 10 / this.scale, this.parking.angle, ESitePlanObjects.Garbage, this.scale);
    this.garbage.initialize();




    // Update driveway area
    if (this.approach !== null && this.parking !== null) {
      this.drivewayArea = calculateDrivewayArea(this.approach.p, this.approach, this.parking)
    }
  }

  updateGlobalVariables(updatedGlobals: {
    approachWidth: string | number;
    parkingNumber: string | number;
    parkingDrivewayWidth: string | number;
    buildingAreaTarget: string | number;
    globalAngle: number;
    taperParking: boolean;
  }) {

    const { approachWidth, parkingNumber, parkingDrivewayWidth, buildingAreaTarget,  taperParking } = updatedGlobals;
// globalAngle,
    if (!this.parking || !this.property || !this.approach || !this.building) return



    // Update all things PARKING
    this.parking.updateWidth(Number(parkingDrivewayWidth) / this.scale);
    this.parking.updateParkingStallsNumber(this.property, Number(parkingNumber));


    // Update all things APPROACH
    // Scale up the approach witht he scale
    this.approach.updateWidth(Number(approachWidth) / this.scale)


    // Update all this BUILDING
    this.building.updateBuildingArea(Number(buildingAreaTarget))




    this.parking.entranceEdge?.point1

    this.taperParking = taperParking


    // // NEED TO ROTATE AND TRANSLATE BASED OFF THE CENTROID. 
    // // Update the HIGH LEVEL
    // this.globalAnglePrev = this.globalAngle;
    // this.globalAngle = globalAngle;


    // const p = this.approach.p;

    // const { scaledPolygon, scaleFactor } = scalePolygonToFitCanvas(p, this.property.propertyCorners, p.width, p.height, 40);
    // // this.scale = this.scale / scaleFactor 
    // this.property.propertyCorners = scaledPolygon;





    // this.property.propertyCorners = rotateCorners(this.approach.p, this.property.propertyCorners, this.globalAngle);


    // const deltaAngle = this.globalAnglePrev - this.globalAngle;
    // this.approach.updateAngle(this.approach.angle + deltaAngle);
    // this.building.updateAngle(this.building.angle + deltaAngle);
    // this.garbage?.updateAngle(this.garbage.angle + deltaAngle);
    // this.parking.updateAngle(this.parking.angle + deltaAngle);

    // // let approachIndex = this.lines.findIndex(line => line.isApproach);




    // // approachIndex = approachIndex === -1 ? 0 : approachIndex;









  }

  visualize(p: p5): void {
    this.initialize(p)

    const property = this.property;
    const approach = this.approach;
    const parking = this.parking;
    const building = this.building;
    const garbage = this.garbage;

    // let lastMouseX = -1;
    // let lastMouseY = -1;
    // let lastRedrawState = "";

    let visibilityGraphSolver: VisibilityGraph;

    let isDragging = {
      parking: false,
      approach: false,
      parkingOffset: false,
      building: false,
    };

    let isRotationFrozen = false;

    const updateVisibilityGraph = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      if (visibilityGraphSolver) {
        visibilityGraphSolver = runVisibilityGraphSolver(
          visibilityGraphSolver,
          building,
          parking,
          property,
          garbage,
          approach
        );
      }
    };

    const handleBuildingDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      building.hasStopped = false


      const newX = p.mouseX;
      const newY = p.mouseY;

      const centerInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, [p.createVector(newX, newY)]);

      if (!truthChecker(centerInBoundary)) {
        building.hasStopped = true;
        return;
      }

      building.updateBuildingCenter(newX, newY);
      updateVisibilityGraph();

    };

    const handleApproachDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;


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
        const angle = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90

        approach.updateCenter(newX, newY);
        parking.updateAngle(angle); // +90 to get the perpendicular angle
        garbage.updateAngle(angle);
        building.updateAngle(angle);
        building.hasStopped = false

        parking.calculateNumberOfFittableStalls(property.propertyCorners);
        parking.updateStallCorners(false, true);
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
        building.buildingLocator(p, building, parking, property, garbage);
        garbage.updateCenterGarbage(parking);

        building.updateEntrances();

        updateVisibilityGraph();
      } else {

        const edgeMidpoint = property.approachEdge?.getMidpoint();
        if (!edgeMidpoint) return;


        if (
          p.dist(edgeMidpoint.x, edgeMidpoint.y, _center.x, _center.y) <
          p.dist(edgeMidpoint.x, edgeMidpoint.y, newX, newY)) {
          return

        }


        building.hasStopped = true;
        approach.updateCenter(newX, newY);
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      }
    };

    const handleParkingOffsetDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      isRotationFrozen = true;

      const newX = p.mouseX;
      const newY = p.mouseY;
      let newAngle = calculateAngle(parking.center, p.createVector(newX, newY)) + 90;

      // newAngle = calculateSnapToEdge(newAngle, parking, property);
      parking.updateAngle(newAngle);
      garbage.updateAngle(newAngle);

      parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
      parking.updateStallCorners();
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);

      building.hasStopped = false;
      building.buildingLocator(p, building, parking, property,  garbage);
      garbage.updateCenterGarbage( parking);


      updateVisibilityGraph();
    };

    const handleParkingDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      const newX = p.mouseX;
      const newY = p.mouseY;
      const centerInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, [p.createVector(newX, newY)]);


      if (!truthChecker(centerInBoundary)) return;

      parking.updateCenter(newX, newY);
      garbage.updateCenterGarbage(parking);

      let angle = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90;

      // angle = calculateSnapToEdge(angle, parking, property);

      parking.updateAngle(normalizeAngle(angle));
      garbage.updateAngle(normalizeAngle(angle));
      building.updateAngle(normalizeAngle(angle));
      building.updateEntrances();


      const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, parking.sitePlanElementCorners);

      // const garbageInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, garbage.sitePlanElementCorners);

      if (truthChecker(allPointsInBoundary)) {

        parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
        parking.updateStallCorners(false, isRotationFrozen);
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);

        building.hasStopped = false;
        building.buildingLocator(p, building, parking, property,  garbage);
        updateVisibilityGraph();
      } else {
        building.hasStopped = true;
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      }

    };


    // Convert nodes to a graph
    p.mouseDragged = () => {

      if (!property || !approach || !parking || !building || !garbage) return;
      const isHovered = {
        approach: approach.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parking: parking.isMouseHovering(),
        building: building.isMouseHovering(),
        buildingOffset: building.isMouseHoveringOffset(),
      };


      // Moving the building
      if ((isHovered.building || isHovered.buildingOffset) && building.isInitialized) {
        isDragging.building = true;
        handleBuildingDrag();
      }

      // Move the approach
      if (isHovered.approach || isDragging.approach) {
        isDragging.approach = true;
        handleApproachDrag();
      }

      // Meant for rotating the parking lot
      if (((isHovered.parkingOffset && !isHovered.parking) || isDragging.parkingOffset) && !isDragging.approach) {
        isDragging.parkingOffset = true;
        handleParkingOffsetDrag();
      }

      // Dragging the parking lot
      if ((isHovered.parking || isDragging.parking) && !isDragging.parkingOffset) {
        isDragging.parking = true;
        handleParkingDrag();
      }

      // Update driveway area
      if (this.approach !== null && this.parking !== null) {
        this.drivewayArea = calculateDrivewayArea(this.approach.p, this.approach, this.parking)
        this.parking.parkingArea = Math.round(parking.width * parking.height * this.scale * this.scale);
        this.approach.approachArea = calculateApproachArea(approach)
        this.parking.parkingStallsArea = getParkingStallArea(this.parking)
      }
    };

    p.mousePressed = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      const isHovered = {
        approach: approach.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parking: parking.isMouseHovering(),
        building: building.isMouseHovering(),
        buildingOffset: building.isMouseHoveringOffset(),
      };

      const posX = p.mouseX;
      const posY = p.mouseY;

      const clickIsInProperty = allPointsInPolygon(property.propertyCorners, [p.createVector(posX, posY)]);

      if (!isHovered.approach && !isHovered.parking && !isHovered.parkingOffset && !building.isInitialized && truthChecker(clickIsInProperty)) {
        building.initializeBuilding(posX, posY);
      }

      if (building.isInitialized) {

        const mouse = p.createVector(p.mouseX, p.mouseY)
        const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
        const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
        const distance = calculatePointToEdgeDistance(closestEdge, mouse);

        const area = building.width * building.height




        if (distance < 20 && area > 100 * building.scale) {

          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle() - 90;
          const intersection = closestEdge.calculateClosestIntercept(
            p.mouseX,
            p.mouseY,
            p
          );


          let minDistance = Infinity;
          let minDistanceIndex = -1;
          building.entrances.forEach((entrance, i) => {
            const dist = p.dist(intersection.x, intersection.y, entrance.intersection.x, entrance.intersection.y);
            if (dist < minDistance) {
              minDistance = dist;
              minDistanceIndex = i;
            }
          })


          // If it is really close to another entrance, and clickm then delete. Turn the entrance with a
          if (minDistance < 5 / this.scale) {
            // THEN DELETE THE ENTRANCE

            building.entrances = building.entrances.filter((_, i) => i !== minDistanceIndex)
            visibilityGraphSolver = runVisibilityGraphSolver(visibilityGraphSolver, building, parking, property, garbage, approach);

          }

          else {
            // Draw the entrance
            let lerpPos = getIntersectionPercentage(
              closestEdge,
              intersection
            ) || 0;

            const entrance = new Entrance(p, this.scale, lerpPos, intersection, angle, closestEdgeIndex, building.center);

            building.entrances.push(entrance)

            visibilityGraphSolver = runVisibilityGraphSolver(visibilityGraphSolver, building, parking, property, garbage, approach);
          }
        }
      }
    };

    p.mouseReleased = () => {
      if (!property || !approach || !parking || !building || !garbage) return;
      isDragging.parking = false;
      isDragging.approach = false;
      isDragging.parkingOffset = false;
      isDragging.building = false;
    };


    p.draw = () => {
      if (!property || !approach || !parking || !building || !garbage) return;




      //   if (
      //     p.mouseX === lastMouseX &&
      //     p.mouseY === lastMouseY &&
      //     !building.ismoving &&
      //     !(!building.hasStopped && building.isInitialized) &&
      //     !Object.values(isDragging).some((dragging) => dragging) &&
      //     lastRedrawState === JSON.stringify({ isDragging })


      //     // On entrance click, sidewalks not created
      //     // On building pre-initialize, the temp building not growing

      // ) {

      //     return; // Skip redraw if nothing has changed
      // }



      // lastMouseX = p.mouseX;
      // lastMouseY = p.mouseY;
      // lastRedrawState = JSON.stringify({ isDragging });

      const isHovered = {
        approach: approach.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parking: parking.isMouseHovering(),
        building: building.isMouseHovering(),
        buildingOffset: building.isMouseHoveringOffset(),
      };


      if (Object.values(isHovered).some((hovered) => hovered)) {
        p.cursor('grab');
      }
      else {
        p.cursor(p.ARROW);

      }

      p.background("#f9fafb")
      p.noFill()
      p.stroke(0);

      property.drawProperty();
      property.drawSetbackPolygon()
      approach.drawApproach();

      // parking.drawSitePlanElement();
      parking.drawParkingStalls();

      building.drawBuilding();

      property.propertyQuadrant(property, parking);

      // , this.taperParking
      createDriveway(p, approach, parking);


      if (!building.hasStopped && building.isInitialized) {

        building.buildingLocator(p, building, parking, property,garbage);
        building.buildingGrower(property, parking);
      }
      garbage.drawSitePlanElement();



      const isInboundary = pointsAreInBoundary(property.cornerOffsetsFromSetbacks, [p.mouseX, p.mouseY]) === -1

      if (!isHovered.approach && !isHovered.parkingOffset && !isHovered.parking && !building.isInitialized && isInboundary) {

        // Show the building growing.
        building.tempBuilding();
      }

      if ((isHovered.building || isHovered.buildingOffset) && isInboundary && building.isInitialized) {

        // ----  Show the entrance ----
        // Get the closest edge
        // check that the edge is within 30 px
        // show the entrance being drawn in the right orientation and the right position
        // Get the position % of the entrance. 
        // Remove entrance by clicking again within X px of enteracne
        const mouse = p.createVector(p.mouseX, p.mouseY)
        const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
        const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
        const distance = calculatePointToEdgeDistance(closestEdge, mouse);


        // clampNumber()
        // const area = Math.abs(building.width * building.height);

        if (distance < 20 && building.hasStopped) {
          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle() - 90;
          const intersection = closestEdge.calculateClosestIntercept(
            p.mouseX,
            p.mouseY,
            p
          )

          // // Draw the entrance
          // let lerpPos = getIntersectionPercentage(
          //   closestEdge,
          //   intersection
          // ) || 0;





          p.text(1, closestEdge.point1.x, closestEdge.point1.y)
          p.text(2, closestEdge.point2.x, closestEdge.point2.y)


          // Draw the entrance
          const enteranceWidth = 8;
          p.stroke('red')
          p.strokeWeight(2)

          p.push();
          p.translate(intersection.x, intersection.y)
          p.rotate(angle - 180)
          p.textSize(14);
          p.arc(0, 0, enteranceWidth / this.scale, enteranceWidth / this.scale, 0, 90, p.PIE);

          p.pop();
        }
      }



      // if(isHovered.parkingOffset && !isHovered.parking){

      //   const parkingEdge = parking.sitePlanElementEdges[0];
      //   const midpoint = parkingEdge.getMidpoint()
      //   const iconX = midpoint.x;
      //   const iconY =midpoint.y; // Position above parking lot
      //   drawRotationIcon(p, iconX, iconY, 50); // Adjust size as needed

      // }


      if (visibilityGraphSolver) {
        // const showGrid = false;

        this.pathCellIndex++

        // visibilityGraphSolver.displaySolution(p, this.pathCellIndex)


        // Display the shortest path for a specific start-end pair
        visibilityGraphSolver.displayShortestPaths(p);
        // visibilityGraphSolver.displayPathsAsPolygons(p);

        const maxPathStatesLength = visibilityGraphSolver.edges.length;
        if (this.pathCellIndex > maxPathStatesLength + 30) {
          this.pathCellIndex = 0
        }
      }

      parking.createParkingOutline(p, parking, garbage, approach)



    };
  }
}




// function drawRotationIcon(p: p5, x: number, y: number, size: number) {
//   p.push();
//   p.translate(x, y);
//   p.stroke(0);
//   p.strokeWeight(2);
//   p.noFill();

//   // Draw the circular arrow
//   p.arc(0, 0, size, size, p.radians(30), p.radians(330));
//   const arrowHeadSize = size * 0.15;
//   const arrowAngle = p.radians(30);

//   // Calculate arrowhead position
//   const arrowX = (size / 2) * p.cos(arrowAngle);
//   const arrowY = (size / 2) * p.sin(arrowAngle);

//   p.line(arrowX, arrowY, arrowX - arrowHeadSize, arrowY - arrowHeadSize / 2);
//   p.line(arrowX, arrowY, arrowX - arrowHeadSize, arrowY + arrowHeadSize / 2);

//   p.pop();
// }