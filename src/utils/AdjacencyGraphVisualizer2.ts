import p5 from "p5";
import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"
import { IPoint, Line } from "../pages/SitePlanDesigner";

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

  constructor(p: p5, point1: p5.Vector, point2: p5.Vector, isApproach: boolean) {
    this.point1 = point1;
    this.point2 = point2;
    this.isApproach = isApproach;
    this.p = p;
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
    // const line = new DashLine(this.p, this.point1.x, this.point1.y, this.point2.x, this.point2.y, 30, 10)

    // line.display();
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
    // Draw the polygon using the corner vectors
    p.beginShape();
    p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);

    this.stallCorners.forEach((corner, i) => {
      if (!this.isEmptySlot) {
        p.vertex(corner.x, corner.y);
      }
    });
    p.endShape(p.CLOSE); // Close the polygon
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
  public scale: number


  constructor(p: p5, propertyCorners: p5.Vector[], approachIndex: number, isClockwise: boolean, scale: number,) {
    this.p = p;
    this.propertyCorners = propertyCorners;
    this.approachEdgeIndex = approachIndex;
    this.isClockwise = isClockwise;
    this.scale = scale;
  }

  initialize() {
    const p = this.p;
    const propertyCorners = this.propertyCorners;

    const propertyEdges: Edge[] = [];

    for (let i = 0; i < propertyCorners.length; i++) {
      const corner1 = propertyCorners[i];
      let corner2 = i === propertyCorners.length - 1 ? propertyCorners[0] : propertyCorners[i + 1];
      const isApproach = i === this.approachEdgeIndex;
      const newEdge = new Edge(p, corner1, corner2, isApproach);
      propertyEdges.push(newEdge);
    }

    this.propertyEdges = propertyEdges;

    this.approachEdge = propertyEdges[this.approachEdgeIndex];
    const initialApproachAngle = this.approachEdge?.calculateAngle();


    this.approachAngle = initialApproachAngle

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
      this.p.translate(midX, midY)
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
          [p.createVector(parking.center.x, parking.center.y), p.createVector(parking.center.x + p.cos(parking.angle + offset[0]) * crossSize, parking.center.y + p.sin(parking.angle + offset[1]) * crossSize)],
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
    // let index = 0;
    // if ((maxAreaIndex === 3 || maxAreaIndex === 0) && (neighboringMaxIndex === 3 || neighboringMaxIndex === 0)) {
    //   index = 0
    // }

    // else if ((maxAreaIndex === 1 || maxAreaIndex === 0) && (neighboringMaxIndex === 1 || neighboringMaxIndex === 0)) {
    //   index = 1
    // }

    // else if ((maxAreaIndex === 3 || maxAreaIndex === 2) && (neighboringMaxIndex === 3 || neighboringMaxIndex === 2)) {
    //   index = 3
    // }

    // else if ((maxAreaIndex === 1 || maxAreaIndex === 2) && (neighboringMaxIndex === 1 || neighboringMaxIndex === 2)) {
    //   index = 2
    // }

    // if (maxAreaIndex - neighboringMaxIndex > 0) {
    // const center = getCenterPoint(p, [0], polys[index][1]);
    // const center = getCenterPoint(p, polys[index][0], polys[index][1]);


  }
}

class SitePlanElement {
  public angle: number;
  public center: p5.Vector;
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
  }

  initialize() {
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
  }

  setSitePlanElementEdges() {
    const sitePlanElementCorners = this.sitePlanElementCorners;

    const edges: Edge[] = []
    for (let i = 0; i < sitePlanElementCorners.length; i++) {
      const corner1 = sitePlanElementCorners[i];
      let corner2 = i === sitePlanElementCorners.length - 1 ? sitePlanElementCorners[0] : sitePlanElementCorners[i + 1];

      const isApproach = i === 2 && this.elementType === ESitePlanObjects.Approach;
      const newEdge = new Edge(this.p, corner1, corner2, isApproach);
      edges.push(newEdge);
    }

    this.sitePlanElementEdges = edges

  }

  updateCenter(newX: number, newY: number) {

    if (this.center.x === newX && this.center.y === newY) return
    // newX
    this.center.x = newX;
    this.center.y = newY;


    this.update();
  }


  update() {
    this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.createOffsetPolygon();
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
    p.angleMode(p.DEGREES);

    // Draw the polygon using the corner vectors
    p.beginShape();
    p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);

    this.sitePlanElementCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
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


  }

}

class Parking extends SitePlanElement {
  // public additionalProperty: string; // Example of a new property
  public entranceEdgeIndex: number | null;
  public parkingStalls: {
    left: ParkingStall[];
    right: ParkingStall[];
  };

  public scale: number;
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

  }

  initializeParking(property: Property, approach: SitePlanElement) {
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
      const centerInBoundary = allPointsInPolygon(property.propertyCorners, [this.p.createVector(newX, newY)]);

      if (!truthChecker(centerInBoundary)) { return }

      const angle2 = calculateAngle(this.center, approach.center);
      this.updateAngle(normalizeAngle(angle2 - 90))

      const allPointsInBoundary = allPointsInPolygon(property.propertyCorners, this.sitePlanElementCorners);

      if (truthChecker(allPointsInBoundary)) {

        this.calculateNumberOfFittableStalls(property.propertyCorners);

        this.updateStallCorners(true);

        this.updateParkingHeight(property.propertyCorners);

      }
      else {
        this.updateParkingHeight(property.propertyCorners);

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
  }

  drawParkingStalls() {
    this.parkingStalls.right.forEach((stall, i) => {
      if (!stall.isEmptySlot) {
        stall.drawParkingStall();
      }
    })

    this.parkingStalls.left.forEach(stall => {
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

  calculateNumberOfFittableStalls(propertyCorners: p5.Vector[]) {
    const maxNumStalls = 7;

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
  createParkingOutline(parking: Parking, garbage: Gargage) { }
}

class Building extends SitePlanElement {
  // public additionalProperty: string; // Example of a new property

  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number
    // additionalProperty: string // New property specific to this class
  ) {
    // Call the parent class constructor to initialize all inherited variables
    super(p, center, width, height, angle, elementType, scale);
  }

  initializeBuilding(property: Property, parking: Parking) {


    this.buildingLocator(this.p, property.propertyQuadrants, property.maxAreaIndex, this, property.propertyEdges.length, parking)
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();


    // const _x = newDimension.x
    // const _y = newDimension.y
    // const _width = newDimension.width
    // const _height = newDimension.height
    // const _angle = newDimension.angle


    // const tempBuildingCorners = createSitePlanElementCorners(this.p, _x, _y, _width, _height, _angle)



    // const newPointsAreInParking = truthChecker(tempBuildingCornersBufferForBorder.map(corner => {
    //   const point: Point = [corner.x, corner.y];
    //   return pointsAreInBoundary(parking.sitePlanElementCorners, point) === -1;
    // }));



  }


  buildingLocator(p: p5, polys: p5.Vector[][], maxAreaIndex: number, building: Building, totalEdges: number, parking: Parking) {
    let center = calculateCentroid(polys[maxAreaIndex])

    let moveDistance = 10;

    const offsets = [
      [moveDistance, 0],
      [-moveDistance, 0],
      [0, moveDistance],
      [0, -moveDistance],
      [moveDistance, moveDistance],
      [-moveDistance, moveDistance],
      [-moveDistance, moveDistance],
      [-moveDistance, -moveDistance],
    ]

    let lookingForBuildingCenter = true;

    const parkingRight = parking.parkingStalls.left.map(stall => {
      return stall.stallCorners.map(corner => {
        return p.dist(corner.x, corner.y, center.x, center.y)
      })
    })



    // while (lookingForBuildingCenter) {
    //   for (let i = 0; i < offsets.length; i++) {

    //     const parkingRight = parking.parkingStalls.left.map(stall => {
    //       return stall.stallCorners.map(corner => {
    //         return p.dist(corner.x, corner.y, center.x, center.y)
    //       }).findIndex(dist => dist < moveDistance)
    //     }).findIndex(index => index !== -1)


    //     const parkingLeft = parking.parkingStalls.left.map(stall => {
    //       return stall.stallCorners.map(corner => {
    //         return p.dist(corner.x, corner.y, center.x, center.y)
    //       }).findIndex(dist => dist < moveDistance)
    //     }).findIndex(index => index !== -1)

    //     if (parkingLeft !== -1 && parkingRight !== -1) {
    //       lookingForBuildingCenter = false;
    //       break
    //     }
    //     else {
    //       center.x += offsets[i][0]
    //       center.y += offsets[i][1]
    //     }
    //     moveDistance += 5

    //   }

    // }






    // if(center is closer than X px from any corner){
    //   move center down, left, right, up and then do the diagonal, then increase the move distance
    // }


    // Building
    building.center = p.createVector(center.x, center.y);
    p.ellipse(building.center.x, building.center.y, 30, 30)

    // Draw the polygon using the corner vectors
    p.beginShape();

    const r = p.map(2, 0, totalEdges, 0, 255)
    const g = p.map(2, 0, totalEdges, 255, 50)

    p.fill(r, g, 225, 50); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);

    polys[maxAreaIndex].forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });

    // polys[neighboringMaxIndex].forEach((corner, i) => {
    //   p.vertex(corner.x, corner.y);
    // });
    p.endShape(p.CLOSE); // Close the polygon
  }

  reset() {
    this.updateheight(50);
    this.updateWidth(50)
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

    const nudgeStrength = 10;
    const nudgeStrengthDimensions = 1;
    const angleNudge = 2;
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


    const targetArea = 5000 / (this.p.pow(this.scale, 2));
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

      const tempBuildingCornersBufferForParking = expandPolygon(this.p, tempBuildingCorners, 10 / this.scale);
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




      const newPointsAreInBoundary = truthChecker(tempBuildingCornersBufferForBorder.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(property.propertyCorners, point) === -1
      }));

      const newPointsAreOutOfParking = truthChecker(tempBuildingCornersBufferForBorder.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(property.propertyCorners, point) === -1
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
  }

}


class Gargage extends SitePlanElement {
  // public additionalProperty: string; // Example of a new property

  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number
    // additionalProperty: string // New property specific to this class
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


  constructor(graph: AdjacencyGraph, points: IPoint[], lines: Line[], scale: number) {
    this.graph = graph;
    this.iteration = 0;
    this.points = points;
    this.lines = lines;
    this.scale = scale
  }

  visualize2(p: p5): void {
    p.clear(); // Clear the canvas
    p.angleMode(p.DEGREES);



    let propertyCorners = this.points.map(point => p.createVector(point.x, point.y));


    if (!this.points.length) {
      propertyCorners = [
        p.createVector(80, 40),
        p.createVector(p.width - 120, 10),
        // p.createVector(p.width - 10, p.height / 2 + 10),
        p.createVector(p.width - 75, p.height - 40),
        // p.createVector(p.width / 2 - 140, p.height - 80),
        p.createVector(40, p.height - 180),
      ];
    }


    const isClockwise = getIsClockwise(propertyCorners)


    let approachIndex = this.lines.findIndex(line => line.isApproach);

    approachIndex = approachIndex === -1 ? 0 : approachIndex;
    if (isClockwise) {
      const first = propertyCorners[0];
      const rest = propertyCorners.slice(1, propertyCorners.length).reverse()
      propertyCorners = [first, ...rest]
      const newIndex = getReversedIndex(approachIndex, this.lines.length);
      approachIndex = newIndex;
    }


    const property = new Property(p, propertyCorners, approachIndex === -1 ? 0 : approachIndex, isClockwise, this.scale);
    property.initialize()
    const approachAngle = (property.approachEdge?.calculateAngle() || 0) + 180;


    const approachWidth = 20 / this.scale;
    const parkingWidth = 24 / this.scale;

    const buildingDefault = 1;

    const centerOfProperty = calculateCentroid(property.propertyCorners)

    const defaultVector = p.createVector(0, 0)

    const approach = new SitePlanElement(p, getCenterPoint(p, property.approachEdge?.point1 || defaultVector, property.approachEdge?.point2 || defaultVector), approachWidth, 30, approachAngle, ESitePlanObjects.Approach, this.scale);
    const parking = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 10, approachAngle, ESitePlanObjects.ParkingWay, this.scale);
    const building = new Building(p, p.createVector(p.width / 2, p.height / 2), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, this.scale);

    approach.initialize()
    parking.initializeParking(property, approach)

    parking.calculateNumberOfFittableStalls(property.propertyCorners);
    parking.updateStallCorners();
    parking.updateParkingHeight(property.propertyCorners);
    property.propertyQuadrant(property, parking);


    building.initializeBuilding(property, parking);


    const garbage = new Gargage(p, getCenterPoint(p, parking.sitePlanElementEdges[0].point1, parking.sitePlanElementEdges[0].point2 || defaultVector), 12 / this.scale, 10 / this.scale, parking.angle, ESitePlanObjects.Garbage, this.scale);


    garbage.initialize();


    let isDraggingParking = false;
    let isDraggingApproach = false;
    let isDraggingParkingOffset = false;

    let isRotationFrozen = false;



    p.mouseDragged = () => {

      const isHoveredApproach = approach.isMouseHovering();
      const isHoveredParkingOffset = parking.isMouseHoveringOffset();
      const isHoveredParking = parking.isMouseHovering();

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

          parking.calculateNumberOfFittableStalls(propertyCorners);
          parking.updateStallCorners(false, true);
          parking.updateParkingHeight(property.propertyCorners);
          building.buildingLocator(p, property.propertyQuadrants, property.maxAreaIndex, building, property.propertyEdges.length, parking)

          garbage.updateCenterGarbage(property, parking)

        }
        else {
          approach.updateCenter(_center.x, _center.y);
          parking.updateParkingHeight(property.propertyCorners);
        }
      } else {
        building.reset();
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

        parking.calculateNumberOfFittableStalls(property.propertyCorners);
        parking.updateStallCorners();
        parking.updateParkingHeight(property.propertyCorners);

        building.buildingLocator(p, property.propertyQuadrants, property.maxAreaIndex, building, property.propertyEdges.length, parking)

      }

      
      
      // Dragging the parking lot
      if ((isHoveredParking || isDraggingParking) && !isDraggingParkingOffset) {
        isDraggingParking = true;

        // const _center = p.createVector(parking.center.x, parking.center.y);
        const newX = p.mouseX;
        const newY = p.mouseY;

        const centerInBoundary = allPointsInPolygon(property.propertyCorners, [p.createVector(newX, newY)]);

        if (!truthChecker(centerInBoundary)) { return }


        parking.updateCenter(newX, newY);
        garbage.updateCenterGarbage(property, parking);



        const angle2 = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90;

        parking.updateAngle(normalizeAngle(angle2))
        garbage.updateAngle(normalizeAngle(angle2))
        building.updateAngle(normalizeAngle(angle2))


        const allPointsInBoundary = allPointsInPolygon(property.propertyCorners, parking.sitePlanElementCorners);
        const garbageInBoundary = allPointsInPolygon(property.propertyCorners, garbage.sitePlanElementCorners);


        if (truthChecker(allPointsInBoundary)) {

          parking.calculateNumberOfFittableStalls(property.propertyCorners);
          parking.updateStallCorners(false, isRotationFrozen);
          parking.updateParkingHeight(property.propertyCorners);
          building.buildingLocator(p, property.propertyQuadrants, property.maxAreaIndex, building, property.propertyEdges.length, parking)


          // building.updateCenter();

          // For all the points of the parking, find the point and edge that are closest. If they're 

        }

        else {
          parking.updateParkingHeight(property.propertyCorners);


        }

      }
      else {
        building.reset();
      }

    };

    p.mousePressed = () => { };

    p.mouseReleased = () => {
      isDraggingParking = false;
      isDraggingApproach = false;
      isDraggingParkingOffset = false;

      building.reset()

    };

    p.draw = () => {
      p.background(240);
      p.stroke(0);

      property.drawProperty();
      approach.drawSitePlanElement();
      parking.drawSitePlanElement();
      parking.drawParkingStalls();
      building.drawSitePlanElement();
      property.propertyQuadrant(property, parking);
      createDriveway(p, approach, parking);

      // building.buildingGrower(property, parking);
      garbage.drawSitePlanElement();



    };
  }
}


function setLineDash(p: p5, list: number[]) {
  p.drawingContext.setLineDash(list);
  p.drawingContext
}



function createDriveway(p: p5, approach: SitePlanElement, parking: Parking) {
  drawPerpendicularBezier(
    p,
    approach.sitePlanElementCorners[0],
    parking.sitePlanElementCorners[3],
    approach.sitePlanElementEdges[2],
    parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0]
  );

  // Center line
  drawPerpendicularBezier(
    p,
    approach.center,
    getCenterPoint(p, parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0].point1, parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0].point2),
    approach.sitePlanElementEdges[2],
    parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0]
  );

  // Right Line
  drawPerpendicularBezier(
    p,
    approach.sitePlanElementCorners[1],
    parking.sitePlanElementCorners[2],
    approach.sitePlanElementEdges[2],
    parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0]
  );
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
  // controlDistance: number
): void {
  // Define the two control points

  const controlDistance = p.dist(point1.x, point1.y, point2.x, point2.y) / 3;
  const angle1 = edge1.calculateAngle() + 90;
  const angle2 = edge2.calculateAngle() - 90;
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
  p.noFill();
  p.bezier(
    point1.x,
    point1.y,
    controlPoint1.x,
    controlPoint1.y,
    controlPoint2.x,
    controlPoint2.y,
    point2.x,
    point2.y);

  // Optional: Draw the line segment and control points for visualization
  p.stroke(0);
  // p.line(point1.x, point1.y, point2.x, point2.y); // Original line segment
  p.fill(255, 0, 0);
  p.ellipse(controlPoint1.x, controlPoint1.y, 8, 8); // Control point 1
  p.ellipse(controlPoint2.x, controlPoint2.y, 8, 8); // Control point 2
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
  // Get the enterance points and the direction they are pointing.
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

function getLineIntersection(
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