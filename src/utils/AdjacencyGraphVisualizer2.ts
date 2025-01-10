import p5 from "p5";
import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"
import { Line } from "../pages/SitePlanDesigner";
import { geoDistance } from "d3";
import { TPoint, VisibilityGraph } from "../pages/VisibilityGraph";

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
const stallWidth = 17;
const stallHeight = 8.5;

class Edge {
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

  drawLine() {
    this.p.stroke(0);
    this.p.strokeWeight(3);


    if (this.isApproach) {
      this.p.stroke(45, 200, 30);

    }

    setLineDash(this.p, [5, 10, 30, 10, 5, 10])
    this.p.line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
    setLineDash(this.p, [])
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

class ParkingStall {

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
  constructor(p: p5, side: number, stallNumber: number, angle: number, stallCorners: p5.Vector[], entranceEdge: Edge) {
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
  }

  initialize() {
    this.createParkingStallCorners();
    this.setParkingStallEdges();
  }

  drawParkingStall() {
    const p = this.p;


    // let radius = 150;
    // let x1 =     p.width/2 - radius;
    // let y1 =     p.height/2 - radius;

    // let x2 =     p.width/2 + radius;
    // let y2 =     p.height/2 + radius

    // // define the gradient with the points we calculated




    // let g = p.drawingContext.createRadialGradient(x1, y1, radius, x2, y2, radius) //(x1,y1, x2,y2);

    // // add colors – we can also do this with p5.js color variables!
    // // we just have to convert them to a string that <canvas> understands
    // let c1 = p.color(220, 20, 60);
    // let c2 = p.color(218,165,32);
    // g.addColorStop(0,   c1.toString());
    // g.addColorStop(0.5, c2.toString());
    // g.addColorStop(1,   c1.toString());

    // // then draw a shape with this gradient
    // p.drawingContext.fillStyle = g;


    // // if we want to use normal fill() we need to
    // // reset the fillStyle – any color will work
    // // here, now it can be changed again with fill()



    // Draw the polygon using the corner vectors
    p.beginShape();
    // p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);

    const reorderCorners = [...this.stallCorners]



    // Needed to not show the parking lines inside the parkint lot.
    reorderCorners.push(...reorderCorners.splice(0, 1));

    reorderCorners.forEach((corner, i) => {
      // if (i === 0) return;

      if (!this.isEmptySlot) {
        p.vertex(corner.x, corner.y);
        // p.text(i, corner.x, corner.y)
      }
    });
    p.endShape(); // Close the polygon


    // p.drawingContext.fillStyle = 'white';

  }

  setParkingStallEdges() {

  }

  createParkingStallCorners() {

  }


}

class Property {
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
    this.propertyEdges.forEach((edge, i) => {
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
  private calculatecornerOffsetsFromSetbacks() {
    const p = this.p;
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
    p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(1);


    this.cornerOffsetsFromSetbacks.forEach((corner, i) => {
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



    offsets.forEach((offset, offsetIndex) => {
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


    edgeIntersections.forEach((intersection, i) => {
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
    let neighboringMaxIndex = -1;
    let secondMaxArea = -Infinity;

    polys.forEach((poly, i) => {
      let area = calculateArea(poly);

      if (area > maxArea) {
        // Update second max area with the previous max area
        secondMaxArea = maxArea;

        // Update neighbor index
        neighboringMaxIndex = maxAreaIndex;

        // Set new max area and max area index
        maxArea = area;
        maxAreaIndex = i;
      } else if (area > secondMaxArea) {
        // Update the second max area and its index
        secondMaxArea = area;
        neighboringMaxIndex = i;
      }
    });

    this.propertyQuadrants = polys;

    this.maxAreaIndex = maxAreaIndex;

  }
}

class SitePlanElement {
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



    this.sitePlanElementCorners.forEach((corner, i) => {
      p.vertex(corner.x, corner.y);
      p.text(i, corner.x, corner.y)
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

class Approach extends SitePlanElement {

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



    this.sitePlanElementCorners.forEach((corner, i) => {
      p.vertex(corner.x, corner.y);
      p.text(i, corner.x, corner.y)
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

class Parking extends SitePlanElement {

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
    // Call the parent class constructor to initialize all inherited variables
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
    this.parkingStalls.right.forEach((stall, i) => {
      if (!stall.isEmptySlot) {
        stall.drawParkingStall();
      }
    })

    this.parkingStalls.left.forEach((stall, i) => {
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

        this.parkingStalls.left[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.left[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.left[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.left[i].stallCorners[3] = updatedPoints[3]

      }

      for (let i = 0; i < this.parkingStalls.right.length; i++) {
        // update the points

        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.right, "right", i, this.scale)

        this.parkingStalls.right[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.right[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.right[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.right[i].stallCorners[3] = updatedPoints[3]
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
      const newParkingStall = new ParkingStall(this.p, sideNumber[1], this.parkingStalls.right.length + 1, this.angle, stallCornerRight, entranceEdge);
      this.parkingStalls.right.push(newParkingStall);
    }

    if (truthChecker(newPointsAreInBoundaryLeft) && this.parkingStalls.left.length < maxNumStalls) {
      const newParkingStall = new ParkingStall(this.p, sideNumber[0], this.parkingStalls.left.length + 1, this.angle, stallCornerLeft, entranceEdge);
      this.parkingStalls.left.push(newParkingStall);
    }


    if (!truthChecker(updatedParkingLotIsInBoundary)) {
    }




  }
  createParkingOutline(p: p5, parking: Parking, garbage: Garbage, approach: Approach) {
    if (!parking.entranceEdge) return;
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



    // Double stroke
    p.beginShape();
    p.fill(120, 220, 40, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(1);




    // p.vertex(parking.entranceEdge?.point2.x || 0, parking.entranceEdge?.point2.y || 0);



    p.textSize(10)





    const offsetEntranceEdge = new Edge(p, offsetParking[1], offsetParking[offsetParking.length - 2], false, 0)
    const offsetParkingEdge = new Edge(p, offsetParking[3], offsetParking[offsetParking.length - 3], false, 0)

    // const offsetEntranceEdge = new Edge(p, offsetParking[0], offsetParking[1], false, 0)

    points.forEach((corner, i) => {
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
      p.text(i, corner.x, corner.y);
      // }




    });
    p.endShape(p.CLOSE); // Close the polygon


  }
}

class Entrance {
  private p: p5;
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


  drawEnterance() {
    const p = this.p;

    const isInwardEnterance = true;

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

class Building extends SitePlanElement {
  public isInitialized = false;
  public frameCount = 0;
  public entrances: Entrance[] = [];
  public buildingAreaTarget: number;
  public buildingAreaActual: number;




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
    this.buildingAreaTarget = 500;
    this.buildingAreaActual = 0;
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

      const newVector = entrance.projectFromCenter(this.p.createVector(newX, newY), 10)



      entrance.intersection = this.p.createVector(newVector.x, newVector.y);
      entrance.angle = edge.calculateAngle() - 90;
    })

  }

  buildingLocator(p: p5, building: Building, parking: Parking, property: Property, approach: Approach, garbage: Garbage) {
    if (!this.isInitialized) return;
    // If we are inside something, then move in the oppisite direction of its center.

    // OR it should be a mix of the vectors. 
    // const buildingBuffer = expandPolygon(this.p, tempBuildingCorners, 10 / this.scale);


    let isInsideParking = false;
    let isOutsideBoundary = false;
    let isInsideParkingStallsRight = false;
    let isInsideParkingStallsLeft = false;
    let isInsideApproach = false;
    let isInsideGarbage = false;
    let isInsideDriveway = false;


    // const tempBuildingCornersBufferForBorder = expandPolygon(this.p, building.sitePlanElementCorners, 50 / this.scale);



    isInsideParking = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(parking.sitePlanElementCorners, point) === -1
    }).some(el => el)


    isOutsideBoundary = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(property.cornerOffsetsFromSetbacks, point) === 1
    }).some(el => el)

    isInsideApproach = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(approach.sitePlanElementCorners, point) === -1
    }).some(el => el)

    isInsideGarbage = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(garbage.sitePlanElementCorners, point) === -1
    }).some(el => el)


    isInsideParkingStallsLeft = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];

      const park = parking.parkingStalls.left.map(stall => {
        return pointsAreInBoundary(stall.stallCorners, point) === -1
      }).some(el => el);
      return park
    }).some(el => el);


    isInsideParkingStallsRight = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];

      const park = parking.parkingStalls.right.map(stall => {
        return pointsAreInBoundary(stall.stallCorners, point) === -1
      }).some(el => el);
      return park
    }).some(el => el);






    if (isInsideParking || isInsideParkingStallsRight || isInsideParkingStallsLeft) {
      const newBuildingPosition = moveVector(parking.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      building.reset();

    }

    if (isInsideGarbage) {
      const newBuildingPosition = moveVector(garbage.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      building.reset();
    }

    if (isInsideApproach) {
      const newBuildingPosition = moveVector(approach.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      building.reset();
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
    this.buildingAreaActual = Math.round(calculateArea(this.sitePlanElementCorners))
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
    const nudgeStrengthDimensions = 1;
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

    const randomNudge = arrayOfRandomNudges(nudgeStrengthDimensions, numChildren * 2);
    const randomAnglesNudge = arrayOfRandomNudges(angleNudge, numChildren);


    // Area needs to be closest to X


    const targetArea = this.buildingAreaTarget / (this.p.pow(this.scale, 2));
    let bestArea = calculateArea(this.sitePlanElementCorners);

    const error = Math.abs(targetArea - bestArea) / targetArea;

    if (error < .0005) return;

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

      const tempBuildingCornersBufferForParking = expandPolygon(this.p, tempBuildingCorners, 5 / this.scale);



      const tempBuildingCornersBufferForBorder = expandPolygon(this.p, tempBuildingCorners, 20 / this.scale);


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

    this.buildingAreaActual = Math.round(calculateArea(this.sitePlanElementCorners));

  }

}

class Garbage extends SitePlanElement {


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

  updateCenterGarbage(property: Property, parking: Parking) {


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
export class AdjacencyGraphVisualizer2 {
  private graph: AdjacencyGraph;
  private iteration: number;
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

  // public p: p5;





  constructor(graph: AdjacencyGraph, points: IPoint[], lines: Line[], scale: number) {
    this.globalAngle = 0;
    this.globalAnglePrev = 0;
    this.graph = graph;
    this.iteration = 0;
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

  }) {

    const { approachWidth, parkingNumber, parkingDrivewayWidth, buildingAreaTarget, globalAngle } = updatedGlobals;

    if (!this.parking || !this.property || !this.approach || !this.building) return



    // Update all things PARKING
    this.parking.updateWidth(Number(parkingDrivewayWidth) / this.scale);
    this.parking.updateParkingStallsNumber(this.property, Number(parkingNumber));


    // Update all things APPROACH
    // Scale up the approach witht he scale
    this.approach.updateWidth(Number(approachWidth) / this.scale)


    // Update all this BUILDING
    this.building.updateBuildingArea(Number(buildingAreaTarget))




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


  visualize2(p: p5): void {
    this.initialize(p)

    const property = this.property;
    const approach = this.approach;
    const parking = this.parking;
    const building = this.building;
    const garbage = this.garbage;



    let VisibilityGraphSolver: VisibilityGraph;
    let isDraggingParking = false;
    let isDraggingApproach = false;
    let isDraggingParkingOffset = false;
    let isRotationFrozen = false;
    let isDraggingBuilding = false;

    let isRotatingPropertyOffset = false;

    // Convert nodes to a graph
    p.mouseDragged = () => {

      if (!property || !approach || !parking || !building || !garbage) return;



      const isHoveredApproach = approach.isMouseHovering();
      const isHoveredParkingOffset = parking.isMouseHoveringOffset();
      const isHoveredParking = parking.isMouseHovering();
      const isHoveredBuilding = building.isMouseHovering();


      const isHoveredBuildingOffset = building.isMouseHoveringOffset();




      if (isHoveredBuildingOffset || isHoveredBuilding) {

        isDraggingBuilding = true;
        const newX = p.mouseX;
        const newY = p.mouseY;

        const centerInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, [p.createVector(newX, newY)]);
        if (!truthChecker(centerInBoundary)) { return }

        building.updateBuildingCenter(newX, newY);

        if (VisibilityGraphSolver) {
          VisibilityGraphSolver = runVisibilityGraphSolver(VisibilityGraphSolver, building, parking, property, garbage, approach);

        }

      }

      if (isHoveredApproach || isDraggingApproach) {
        isDraggingApproach = true;

        const _center = p.createVector(approach.center.x, approach.center.y);

        const approachEdgeAngle = property.approachEdge?.calculateAngle()

        // Follow along the line
        let newX = p.mouseX;
        let newY = p.mouseY;

        const isVertical = isMoreVertical(approachEdgeAngle || 0, true)

        if (isVertical) {
          newX = approach.center.x + (newY - approach.center.y) / p.tan(approachEdgeAngle || 0);
          newY = p.mouseY;
        }
        else {
          newX = p.mouseX;
          newY = approach.center.y + (newX - approach.center.x) * p.tan(approachEdgeAngle || 0);
        }


        approach.updateCenter(newX, newY);
        const allPointsInBoundary = allPointsInPolygon(property.propertyCorners, [approach.sitePlanElementCorners[0], approach.sitePlanElementCorners[1]]);

        if (truthChecker(allPointsInBoundary)) {
          // If rotating the parking is going to push the parking outside the boundary, then update the center of the parking
          // in the opposite direction of the contact point. If that's going to cause a conflict, then move it reflected 90degrees

          // Update the parking position and angle
          // Take a snapshop
          const _angle = parking.angle;

          approach.updateCenter(newX, newY);
          const angle = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90
          parking.updateAngle(angle); // +90 to get the perpendicular angle
          garbage.updateAngle(angle)
          building.updateAngle(angle); // +90 to get the perpendicular angle

          parking.calculateNumberOfFittableStalls(property.propertyCorners);
          parking.updateStallCorners(false, true);
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
          building.buildingLocator(p, building, parking, property, approach, garbage)

          garbage.updateCenterGarbage(property, parking)

          if (VisibilityGraphSolver) {
            VisibilityGraphSolver = runVisibilityGraphSolver(VisibilityGraphSolver, building, parking, property, garbage, approach);
          }

        }
        else {
          approach.updateCenter(_center.x, _center.y);
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
        }
      }

      // Only hovering in the offset
      if (((isHoveredParkingOffset && !isHoveredParking) || isDraggingParkingOffset) && !isDraggingApproach) {
        isDraggingParkingOffset = true;
        isRotationFrozen = true;

        // const _center = p.createVector(parking.center.x, parking.center.y);
        const newX = p.mouseX;
        const newY = p.mouseY;


        const newAngle = calculateAngle(parking.center, p.createVector(newX, newY)) + 90;

        parking.updateAngle(newAngle);
        garbage.updateAngle(newAngle);

        parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
        parking.updateStallCorners();
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);

        building.buildingLocator(p, building, parking, property, approach, garbage);
        garbage.updateCenterGarbage(property, parking)

        if (VisibilityGraphSolver) {
          VisibilityGraphSolver = runVisibilityGraphSolver(VisibilityGraphSolver, building, parking, property, garbage, approach);
        }


      }

      // Dragging the parking lot
      if ((isHoveredParking || isDraggingParking) && !isDraggingParkingOffset) {
        isDraggingParking = true;

        // const _center = p.createVector(parking.center.x, parking.center.y);
        const newX = p.mouseX;
        const newY = p.mouseY;

        const centerInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, [p.createVector(newX, newY)]);

        if (!truthChecker(centerInBoundary)) { return }


        parking.updateCenter(newX, newY);
        garbage.updateCenterGarbage(property, parking);



        const angle2 = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90;

        parking.updateAngle(normalizeAngle(angle2))
        garbage.updateAngle(normalizeAngle(angle2))
        building.updateAngle(normalizeAngle(angle2))


        const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, parking.sitePlanElementCorners);
        const garbageInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, garbage.sitePlanElementCorners);


        if (truthChecker(allPointsInBoundary)) {

          parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
          parking.updateStallCorners(false, isRotationFrozen);
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
          building.buildingLocator(p, building, parking, property, approach, garbage);





          if (VisibilityGraphSolver) {
            VisibilityGraphSolver = runVisibilityGraphSolver(VisibilityGraphSolver, building, parking, property, garbage, approach);
          }

          // building.updateBuildingCenter();

          // For all the points of the parking, find the point and edge that are closest. If they're 

        }

        else {
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);


        }

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



      const posX = p.mouseX;
      const posY = p.mouseY;
      const isHoveredApproach = approach.isMouseHovering();
      const isHoveredParkingOffset = parking.isMouseHoveringOffset();
      const isHoveredParking = parking.isMouseHovering();
      const clickIsInProperty = allPointsInPolygon(property.propertyCorners, [p.createVector(posX, posY)]);

      if (!isHoveredApproach && !isHoveredParking && !isHoveredParkingOffset && !building.isInitialized && truthChecker(clickIsInProperty)) {
        const posX = p.mouseX;
        const posY = p.mouseY;
        building.initializeBuilding(posX, posY);
      }


      if (building.isInitialized) {

        const mouse = p.createVector(p.mouseX, p.mouseY)
        const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
        const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
        const distance = calculatePointToEdgeDistance(closestEdge, mouse);
        const area = building.width * building.height



        if (distance < 20 && area > 100) {
          const isHoveredBuilding = building.isMouseHovering();
          const isHoveredBuildingOffset = building.isMouseHoveringOffset();

          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle() - 90;

          const inOutSign = isHoveredBuildingOffset && !isHoveredBuilding ? -1 : 1;
          const moreVertSign = isMoreVertical(angle, true) ? -1 : 1;



          const intersection = p.createVector(
            mouse.x + distance * p.cos(angle) * moreVertSign * inOutSign,
            mouse.y - distance * p.sin(angle) * moreVertSign * inOutSign);



          // Draw the entrance
          let lerpPos = getIntersectionPercentage(
            closestEdge,
            intersection
          ) || 0;







          const entrance = new Entrance(p, this.scale, lerpPos, intersection, angle, closestEdgeIndex, building.center);

          building.entrances.push(entrance)

          VisibilityGraphSolver = runVisibilityGraphSolver(VisibilityGraphSolver, building, parking, property, garbage, approach);
        }


      }
    };

    p.mouseReleased = () => {
      if (!property || !approach || !parking || !building || !garbage) return;
      isDraggingParking = false;
      isDraggingApproach = false;
      isDraggingParkingOffset = false;

    };

    p.draw = () => {

      if (!property || !approach || !parking || !building || !garbage) return;

      p.background(240);

      const isHoveredApproach = approach.isMouseHovering();
      const isHoveredParkingOffset = parking.isMouseHoveringOffset();
      const isHoveredParking = parking.isMouseHovering();
      const isHoveredBuilding = building.isMouseHovering();
      const isHoveredBuildingOffset = building.isMouseHoveringOffset();


      p.noFill()
      p.stroke(0);

      property.drawProperty();
      property.drawSetbackPolygon()
      approach.drawApproach();

      // parking.drawSitePlanElement();
      parking.drawParkingStalls();


      building.drawBuilding();
      building.drawBuilding();


      property.propertyQuadrant(property, parking);
      createDriveway(p, approach, parking);

      building.buildingLocator(p, building, parking, property, approach, garbage);
      building.buildingGrower(property, parking);
      garbage.drawSitePlanElement();



      const isInboundary = pointsAreInBoundary(property.cornerOffsetsFromSetbacks, [p.mouseX, p.mouseY]) === -1


      if (!isHoveredApproach && !isHoveredParkingOffset && !isHoveredParking && !building.isInitialized && isInboundary) {

        // Show the building growing.
        building.tempBuilding();


      }

      if ((isHoveredBuilding || isHoveredBuildingOffset) && isInboundary && building.isInitialized) {

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
        const area = Math.abs(building.width * building.height);

        if (distance < 20 && area > 100) {
          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle() - 90;

          const inOutSign = isHoveredBuildingOffset && !isHoveredBuilding ? -1 : 1;
          const moreVertSign = isMoreVertical(angle, true) ? -1 : 1;

          const intersection = p.createVector(mouse.x + distance * p.cos(angle) * moreVertSign * inOutSign, mouse.y - distance * p.sin(angle) * moreVertSign * inOutSign);


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

      if (VisibilityGraphSolver) {
        // const showGrid = false;

        this.pathCellIndex++

        VisibilityGraphSolver.displaySolution(p, this.pathCellIndex)



        // Display the shortest path for a specific start-end pair
        if (VisibilityGraphSolver.shortestPaths.length > 0) {
          const path = VisibilityGraphSolver.shortestPaths[0].path; // Use the first calculated path
          // Draw the shortest path in red
          VisibilityGraphSolver.displayShortestPath(p, path);

        }




        const maxPathStatesLength = VisibilityGraphSolver.edges.length;
        if (this.pathCellIndex > maxPathStatesLength + 30) {
          this.pathCellIndex = 0
        }
      }

      parking.createParkingOutline(p, parking, garbage, approach)



    };
  }
}

const p5VectorToTPoint = (vectors: p5.Vector[]): TPoint[] => {
  return vectors.map(vertex => {
    return {
      x: vertex.x,
      y: vertex.y,
    }
  })
}

function runVisibilityGraphSolver(VisibilityGraphSolver: VisibilityGraph, building: Building, parking: Parking, property: Property, garbage: Garbage, approach: Approach) {


  const obstacles: TPoint[][] = [
    p5VectorToTPoint(parking.parkingOutline),
    p5VectorToTPoint(garbage.sitePlanElementCorners),
    p5VectorToTPoint(building.sitePlanElementCorners),

  ];



  const startPoints: TPoint[] = building.entrances.map(entrance => {
    return {
      x: entrance.intersection.x,
      y: entrance.intersection.y,
    }
  })



  const endPoints = [
    garbage.projectFromCenter(garbage.sitePlanElementCorners[0], 2),
    approach.projectFromCenter(approach.sitePlanElementCorners[0], 2)
  ];


  VisibilityGraphSolver = new VisibilityGraph(startPoints, endPoints, obstacles, property.propertyCorners)
  console.log(`object`, VisibilityGraphSolver)


  return VisibilityGraphSolver
}


function getIntersectionPercentage(
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

function setLineDash(p: p5, list: number[]) {
  p.drawingContext.setLineDash(list);
}

function createDriveway(p: p5, approach: Approach, parking: Parking) {

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

function getCenterPoint(p: p5, p1: p5.Vector, p2: p5.Vector): p5.Vector {
  const x = (p2.x + p1.x) / 2;
  const y = (p2.y + p1.y) / 2;
  return p.createVector(x, y)
}

function polyPoint(vertices: p5.Vector[], px: number, py: number) {
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

function drawPerpendicularBezier(
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


function calculateDrivewayArea(p: p5, approach: Approach, parking: Parking) {

  const defaultVector = p.createVector(0, 0);


  const driveWayPoints = [
    approach?.sitePlanElementCorners[1] || defaultVector,
    parking?.sitePlanElementCorners[2] || defaultVector,
    parking?.sitePlanElementCorners[3] || defaultVector,
    approach?.sitePlanElementCorners[0] || defaultVector,
  ]


  return Math.round((calculateArea(driveWayPoints)) * approach.scale * approach.scale)
}

function calculateApproachArea(approach: Approach) {
  return Math.round((approach?.width || 0) * (approach?.height || 0) / 2 * approach.scale * approach.scale)
}

function findGridCells(inputArray: IPoint[], solverScale: number, cols: number, rows: number): IPoint[] {
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


function truthChecker(arr: boolean[]) { return arr.every(v => v === true) };

function calculateAngle(point1: p5.Vector, point2: p5.Vector): number {
  const deltaY = Math.round(point2.y - point1.y);
  const deltaX = Math.round(point2.x - point1.x);


  // atan2 handles quadrants and division by zero
  const angleInRadians = Math.atan2(deltaY, deltaX);

  // Convert radians to degrees
  const angleInDegrees = angleInRadians * 180 / Math.PI;

  return angleInDegrees;
}

function normalizeAngle(angle: number): number {
  return (angle + 360) % 360;
}

function findClosestEdge(edges: Edge[], point: p5.Vector): number {
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

function calculatePointToEdgeDistance(edge: Edge, point: p5.Vector): number {
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

function getAdjacentIndices(index: number, length: number): [number, number] {
  if (length <= 1) {
    throw new Error("List must have at least two elements.");
  }

  const prevIndex = (index - 1 + length) % length; // Wrap around to the end if index is 0
  const nextIndex = (index + 1) % length; // Wrap around to the start if index is the last

  return [prevIndex, nextIndex];
}

function pointsAreInBoundary(points: p5.Vector[], point: Point) {
  return classifyPoint(points.map(corner => [corner.x, corner.y]) as Point[], point)
}

function calculatePointPosition(p: p5, entranceEdge: Edge, parkingAngle: number, parkingStalls: {
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

function calculateStallPosition(p: p5, entranceEdge: Edge, angle: number, parkingStallsOnSide: ParkingStall[], side: "left" | "right", stallIndex: number, scale: number) {
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

function moveVector(
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

function removeItemsByIndices<T>(items: T[], indicesToRemove: number[]): T[] {
  // Convert indicesToRemove to a Set for faster lookups
  const indicesSet = new Set(indicesToRemove);

  // Filter out items whose indices are in indicesToRemove
  return items.filter((_, index) => !indicesSet.has(index));
}

function allPointsInPolygon(boundary: p5.Vector[], poly: p5.Vector[]) {
  const allPointsInPolygon = poly.map((corner1, i) => {
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

function calculateArea(polygon: p5.Vector[]): number {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};

function createWrappedIndices(startIndex: number, endIndex: number, totalLength: number) {
  let indices = [];
  let currentIndex = startIndex;

  while (true) {
    indices.push(currentIndex);
    if (currentIndex === endIndex) break; // Stop when reaching the endIndex
    currentIndex = (currentIndex + 1) % totalLength; // Move to the next index, wrapping around if necessary
  }

  return indices;
}

function calculateCentroid(polygon: p5.Vector[]) {
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

function expandPolygon(p: p5, polygon: p5.Vector[], offset: number): p5.Vector[] {
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

function calculateEdgeNormal(p: p5, p1: p5.Vector, p2: p5.Vector): p5.Vector {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Swap dx and dy and negate one to create a perpendicular vector
  const length = Math.sqrt(dx ** 2 + dy ** 2);
  return p.createVector(
    dy / length,
    -dx / length
  )
}

function arrayOfRandomNudges(nudgeStrength: number, numberOfRandomNumbers: number) {
  const arr = new Array(numberOfRandomNumbers).fill(0)
  return arr.map(() => Math.random() * nudgeStrength * 2 - nudgeStrength)
}

function createSitePlanElementCorners(p: p5, x: number, y: number, width: number, height: number, angle: number) {
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


function rotateCorners(p: p5, corners: p5.Vector[], angle: number) {


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


function rotateAndTranslateCorners(p: p5, x: number, y: number, corners: p5.Vector[], angle: number) {


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

const getIsClockwise = (polygon: p5.Vector[]): boolean => {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    sum += (next.x - current.x) * (next.y + current.y);
  }
  return sum > 0;
};

function getReversedIndex(oldIndex: number, listLength: number): number {

  // 0 -> 4
  // 1 -> 3
  // 2 -> 2
  // 3 -> 1
  // 4 -> 0



  return listLength - oldIndex - 1;
};

const isMoreVertical = (angle: number, inDegrees: boolean = true): boolean => {
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



function getBoundingBox(points: p5.Vector[]) {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  return { minX, minY, maxX, maxY };
}

function scalePolygonToFitCanvas(
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


function markGridCells(p: p5, grid: boolean[][], objects: p5.Vector[][], solverScale: number, lookInide: boolean): boolean[][] {
  const cols = grid.length;
  const rows = grid[0].length;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      // Calculate the center point of the current grid cell
      const cellCenter = [(col + 0.5) * solverScale, (row + 0.5) * solverScale] as Point;
      // Check if the center point is within any of the polygons
      for (const polygon of objects) {
        if (pointsAreInBoundary(polygon, cellCenter) === (lookInide ? -1 : 1)) {
          grid[col][row] = true; // Mark the cell
          break;
        }
      }
    }
  }

  return grid;
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

function getParkingStallArea(parking: Parking) {
  const { leftStalls, rightStalls } = countParkingStalls(parking)
  return Math.round((leftStalls + rightStalls) * stallHeight * stallWidth)
}