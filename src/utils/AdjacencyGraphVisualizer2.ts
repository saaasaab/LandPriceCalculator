import p5 from "p5";
import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"



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


class Building {


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
}


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
    this.p.strokeWeight(5);


    if (this.isApproach) {
      this.p.stroke(45, 200, 30);

    }
    this.p.line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
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
      p.vertex(corner.x, corner.y);
      p.text(i, corner.x, corner.y)
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
  public approachEdgeIndex = 2;
  public approachAngle: number = 15;


  constructor(p: p5, propertyCorners: p5.Vector[]) {
    this.p = p;
    this.propertyCorners = propertyCorners;


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
    this.propertyEdges.forEach(edge => edge.drawLine())
  }

}


class SitePlanElement {
  public center: p5.Vector;
  public width: number;
  public height: number;
  public angle: number;
  private p: p5;
  public sitePlanElementCorners: p5.Vector[];
  public sitePlanElementEdges: Edge[];

  private elementType: SitePlanObjects;
  public entranceEdgeIndex: number | null;
  public parkingStalls: {
    left: ParkingStall[];
    right: ParkingStall[];
  };

  public previousAngle: number;
  public entranceEdge: Edge | null;
  public previousEntranceEdge: Edge | null;




  constructor(p: p5, center: p5.Vector, width: number, height: number, angle: number, elementType: SitePlanObjects) {
    this.center = center;
    this.width = width
    this.height = height;

    this.p = p;
    this.angle = angle;
    this.sitePlanElementCorners = [];
    this.sitePlanElementEdges = [];
    this.elementType = elementType;
    this.entranceEdgeIndex = null;
    this.parkingStalls = { left: [], right: [] };



    this.previousAngle = angle;
    this.entranceEdge = null;
    this.previousEntranceEdge = null;

  }


  initialize() {
    if (this.elementType === ESitePlanObjects.ParkingWay) {
      this.entranceEdgeIndex = 2;
    }
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();



    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]


    // Number of stalls
    // const maxNumStalls = 10;
    // for (let index = 0; index < numStalls; index++) {
    // const stall = new ParkingStall(this.p, index % 2, index, this.angle);


    // this.parkingStalls.push(stall)
    // }
  }


  updateStallCorners() {

    if (!this.entranceEdge || !this.previousEntranceEdge) return;


    if (
      this.angle !== this.previousAngle ||
      this.entranceEdge.point1.x !== this.previousEntranceEdge.point1.x ||
      this.entranceEdge.point1.y !== this.previousEntranceEdge.point1.y ||

      this.entranceEdge.point2.x !== this.previousEntranceEdge.point2.x ||
      this.entranceEdge.point2.y !== this.previousEntranceEdge.point2.y) {

      // OH NO, SOMETHING CHANGED


      for (let i = 0; i < this.parkingStalls.left.length; i++) {
        // Update the points


        // const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p,  this.entranceEdge, this.angle, this.parkingStalls);
        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.left, "left", i)

        this.parkingStalls.left[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.left[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.left[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.left[i].stallCorners[3] = updatedPoints[3]

      }

      for (let i = 0; i < this.parkingStalls.right.length; i++) {
        // update the points

        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.right, "right", i)

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
    const stallHeight = 45;

    // Take a snapshot to revert



    const maxParkingStalls = Math.max(this.parkingStalls.left.length, this.parkingStalls.right.length);

    this.updateheight(maxParkingStalls * stallHeight);


    let parkingNotFit = true;
    let recalcCount = 1;
    while (parkingNotFit && maxParkingStalls - recalcCount > 0) {
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

        this.updateheight((maxParkingStalls - recalcCount) * stallHeight);
        recalcCount++
      }
    }
  }


  calculateNumberOfFittableStalls(propertyCorners: p5.Vector[]) {
    const maxNumStalls = 10;

    const entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0];
    const parkingAngle = this.angle;


    const leftStallsToRemove: number[] = []
    const rightStallsToRemove: number[] = []


    // Get the enterance points and the direction they are pointing.
    Object.keys(this.parkingStalls).forEach(side =>
      this.parkingStalls[side as ("left" | "right")].forEach((stall, i) => {
        const allIn = stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(propertyCorners, point) === -1
        });

        if (!truthChecker(allIn)) {

          if (side === "left") leftStallsToRemove.push(i);
          if (side === "right") rightStallsToRemove.push(i);


        }
      })
    )


    if (leftStallsToRemove.length > 0 || rightStallsToRemove.length > 0) {
      const _removedLeft = removeItemsByIndices(this.parkingStalls.left, leftStallsToRemove)
      const _removedRight = removeItemsByIndices(this.parkingStalls.right, rightStallsToRemove)
      this.parkingStalls.left = _removedLeft
      this.parkingStalls.right = _removedRight
      return
    }





    const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p, entranceEdge, parkingAngle, this.parkingStalls);



    // Expand the parking size

    // const _sitePlanElementCorners = this.sitePlanElementCorners;

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






    /* 
    
    UPDATE THE PARKING HEIGHT BASED ON THE UPDATED PARKING STALLS

    */
    // UPDATE PARKING SIZE
    // For the parking corners, assume the max height will fit, then cut it back if it doesn't.

    const leastStalls = Math.max(this.parkingStalls.right.length, this.parkingStalls.left.length)

    // const updatedPointsR = calculateStallPosition(this.p, entranceEdge, this.angle, this.parkingStalls.right, "right", leastStalls)
    // const updatedPointsL = calculateStallPosition(this.p, entranceEdge, this.angle, this.parkingStalls.left, "left", leastStalls)

    // this.sitePlanElementCorners = [
    //   updatedPointsL[1],
    //   updatedPointsR[1],
    //   entranceEdge.point1,
    //   entranceEdge.point2,
    // ]

    // this.height = this.p.dist(this.sitePlanElementCorners[1].x, this.sitePlanElementCorners[1].y, this.sitePlanElementCorners[2].x, this.sitePlanElementCorners[2].y)











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



    if (truthChecker(newPointsAreInBoundaryRight)) {
      this.p.fill(140, 200, 1);
    }
    else {
      this.p.fill(200, 10, 140);
    }
    this.p.ellipse(stallCornerRight[2].x, stallCornerRight[2].y, 10, 10)
    this.p.ellipse(stallCornerRight[3].x, stallCornerRight[3].y, 10, 10)



    if (truthChecker(newPointsAreInBoundaryLeft)) {
      this.p.fill(140, 200, 1);

    }
    else {
      this.p.fill(200, 10, 140);
    }
    this.p.ellipse(stallCornerLeft[2].x, stallCornerLeft[2].y, 10, 10)
    this.p.ellipse(stallCornerLeft[3].x, stallCornerLeft[3].y, 10, 10)




    // check if each parking spot fits inside the boundary.
    // If it fits, then create a new parking stall instance. 

    // Go through all the parking stalls and determine if they all fit in the boundary
    // Remove those that don't fit. 
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

    this.entranceEdge = edges[this.entranceEdgeIndex || 0]
  }



  updateCenter(newX: number, newY: number) {

    if (this.center.x === newX && this.center.y === newY) return
    // newX
    this.center.x = newX;
    this.center.y = newY;

    this.updateSitePlanElementEdges();
  }



  updateAngle(angle: number) {
    this.angle = angle;
    this.updateSitePlanElementEdges();
    this.setSitePlanElementEdges()
  }

  updateheight(height: number) {
    this.height = height;
    this.updateSitePlanElementEdges();
    this.setSitePlanElementEdges()
  }

  updateSitePlanElementEdges() {
    this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges()
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

    p.ellipse(this.center.x, this.center.y, 50, 50);


    p.text(p.round(this.angle), this.center.x, this.center.y);

    this.sitePlanElementEdges.forEach(edge => {
      const center = getCenterPoint(this.p, edge.point1, edge.point2);
      p.fill(200, 20, 40);
      p.ellipse(center.x, center.y, 20, 20);
      p.strokeWeight(1)
      p.fill(40, 200, 20);


      p.text(p.round(edge.calculateAngle()), center.x, center.y);
    })

    this.parkingStalls.right.forEach((stall, i) => {
      stall.drawParkingStall();
    })

    this.parkingStalls.left.forEach(stall => {
      stall.drawParkingStall();
    })
  }


  buildingLocator(property: Property, parking: SitePlanElement){
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
        p.ellipse(intersection?.intersection?.x || 0, intersection?.intersection?.y || 0, 40.40)
        p.line(parking.center.x, parking.center.y, parking.center.x + p.cos(parking.angle + intersection.offset[0]) * crossSize, parking.center.y + p.sin(parking.angle + intersection.offset[1]) * crossSize)
        // p.text(i, intersection.intersection.x, intersection.intersection.y)
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


      let index = 0;
      if ((maxAreaIndex === 3 || maxAreaIndex === 0) && (neighboringMaxIndex === 3 || neighboringMaxIndex === 0)) {
        index = 0
      }

      else if ((maxAreaIndex === 1 || maxAreaIndex === 0) && (neighboringMaxIndex === 1 || neighboringMaxIndex === 0)) {
        index = 1
      }

      else if ((maxAreaIndex === 3 || maxAreaIndex === 2) && (neighboringMaxIndex === 3 || neighboringMaxIndex === 2)) {
        index = 3
      }

      else if ((maxAreaIndex === 1 || maxAreaIndex === 2) && (neighboringMaxIndex === 1 || neighboringMaxIndex === 2)) {
        index = 2
      }

      // if (maxAreaIndex - neighboringMaxIndex > 0) {
      // const center = getCenterPoint(p, [0], polys[index][1]);
      // const center = getCenterPoint(p, polys[index][0], polys[index][1]);

      const center =  calculateCentroid(polys[maxAreaIndex])

      // Building
      this.center = p.createVector(center.x , center.y);
      p.ellipse(this.center.x, this.center.y, 30, 30)


      // Draw the polygon using the corner vectors
      p.beginShape();
      const r = p.map(2, 0, totalEdges, 0, 255)
      const g = p.map(2, 0, totalEdges, 255, 50)

      p.fill(r, g, 225, 50); // Fill color with transparency
      p.stroke(0); // Outline color
      p.strokeWeight(2);

      polys[maxAreaIndex].forEach((corner, i) => {
        p.vertex(corner.x, corner.y);
      });

      // polys[neighboringMaxIndex].forEach((corner, i) => {
      //   p.vertex(corner.x, corner.y);
      // });


      p.endShape(p.CLOSE); // Close the polygon
  }
}


// Visualization module using p5.js
export class AdjacencyGraphVisualizer2 {
  private graph: AdjacencyGraph;
  private iteration: number;


  constructor(graph: AdjacencyGraph) {
    this.graph = graph;
    this.iteration = 0;
  }

  visualize2(p: p5): void {
    p.angleMode(p.DEGREES);

    // const propertyEdges: Edge[] = [];
    const propertyCorners = [
      p.createVector(80, 40),
      p.createVector(p.width - 120, 10),
      p.createVector(p.width - 10, p.height / 2 + 10),
      p.createVector(p.width - 75, p.height - 40),
      p.createVector(p.width / 2 - 140, p.height - 80),
      p.createVector(40, p.height - 180),
    ];


    const property = new Property(p, propertyCorners);
    property.initialize()


    const defaultVector = p.createVector(0, 0)
    const approach = new SitePlanElement(p, getCenterPoint(p, property.approachEdge?.point1 || defaultVector, property.approachEdge?.point2 || defaultVector), 100, 30, 180 + property.approachAngle, ESitePlanObjects.Approach);
    const parking = new SitePlanElement(p, p.createVector(488, 308), 120, 350, 15, ESitePlanObjects.ParkingWay);
    const building = new SitePlanElement(p, p.createVector(p.width / 2, p.height / 2), 100, 100, 15, ESitePlanObjects.Building);

    approach.initialize()
    parking.initialize();

    parking.calculateNumberOfFittableStalls(propertyCorners);
    parking.updateStallCorners();
    parking.updateParkingHeight(propertyCorners);

    building.initialize();
  


    let isDraggingParking = false;
    let isDraggingApproach = false;


    p.mouseDragged = () => {

      const isHoveredApproach = approach.isMouseHovering();
      const isHoveredParking = parking.isMouseHovering();


      if (isHoveredApproach || isDraggingApproach) {
        isDraggingApproach = true;

        const _center = p.createVector(approach.center.x, approach.center.y);

        const approachEdgeAngle = property.approachEdge?.calculateAngle()
        // Follow along the line
        const newX = p.mouseX;
        const newY = approach.center.y + (newX-approach.center.x) * p.tan(approachEdgeAngle || 0); //Need to update based on the actual angle of approach edge.

        approach.updateCenter(newX, newY);

        const allPointsInBoundary = allPointsInPolygon(propertyCorners, [approach.sitePlanElementCorners[0], approach.sitePlanElementCorners[1]]);

        if (truthChecker(allPointsInBoundary)) {
          // If rotating the parking is going to push the parking outside the boundary, then update the center of the parking
          // in the opposite direction of the contact point. If that's going to cause a conflict, then move it reflected 90degrees

          // Update the parking position and angle
          // Take a snapshop
          const _angle = parking.angle;


          approach.updateCenter(newX, newY);
          const angle = calculateAngle(parking.center, approach.center) - 90
          parking.updateAngle(angle); // +90 to get the perpendicular angle
          building.updateAngle(angle); // +90 to get the perpendicular angle


          parking.calculateNumberOfFittableStalls(propertyCorners);
          parking.updateStallCorners();
          parking.updateParkingHeight(propertyCorners);

        }
        else {
          approach.updateCenter(_center.x, _center.y);
          parking.updateParkingHeight(propertyCorners);
        }
      }

      if (isHoveredParking || isDraggingParking) {
        isDraggingParking = true;

        const _center = p.createVector(parking.center.x, parking.center.y);
        const newX = p.mouseX;
        const newY = p.mouseY;



        const centerInBoundary = allPointsInPolygon(propertyCorners, [p.createVector(newX,newY)]);

        if(!truthChecker(centerInBoundary)){ return}

        parking.updateCenter(newX, newY);

        const angle2 = calculateAngle(parking.center, approach.center);
        parking.updateAngle(normalizeAngle(angle2 - 90))
        building.updateAngle(normalizeAngle(angle2 - 90))

        const allPointsInBoundary = allPointsInPolygon(propertyCorners, parking.sitePlanElementCorners);

        if (truthChecker(allPointsInBoundary)) {
          parking.calculateNumberOfFittableStalls(propertyCorners);
          parking.updateStallCorners();
          parking.updateParkingHeight(propertyCorners);

          // building.updateCenter();

          // For all the points of the parking, find the point and edge that are closest. If they're 
    


        } else {
          parking.updateParkingHeight(propertyCorners);

          // parking.updateCenter(_center.x, _center.y);

        }

      }

    };


    p.mousePressed = () => {

    };

    p.mouseReleased = () => {
      isDraggingParking = false
      isDraggingApproach = false
    };

    p.draw = () => {
      p.background(240);
      p.stroke(0);

      // approach.update();
      // parking.update();

      property.drawProperty()
      approach.drawSitePlanElement();
      parking.drawSitePlanElement();
      // building.drawSitePlanElement();


      createDriveway(p, approach, parking);
      building.buildingLocator(property, parking);



    };
  }
}



function createDriveway(p: p5, approach: SitePlanElement, parking: SitePlanElement) {
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

// POLYGON/POINT
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

let truthChecker = (arr: boolean[]) => arr.every(v => v === true);



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

function calculateAngleBetweenEdges(edge1: Edge, edge2: Edge): number {
  // Compute the vectors representing the edges
  const v1 = p5.Vector.sub(edge1.point2, edge1.point1);
  const v2 = p5.Vector.sub(edge2.point2, edge2.point1);

  // Compute the dot product
  const dotProduct = v1.dot(v2);

  // Compute the magnitudes of the vectors
  const magnitudeV1 = v1.mag();
  const magnitudeV2 = v2.mag();

  // Avoid division by zero
  if (magnitudeV1 === 0 || magnitudeV2 === 0) {
    throw new Error("One or both edges have zero length.");
  }

  // Calculate the cosine of the angle
  const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);

  // Clamp the value to the range [-1, 1] to handle floating-point inaccuracies
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  // Calculate the angle in radians and convert to degrees
  const angleInRadians = Math.acos(clampedCosTheta);
  const angleInDegrees = p5.prototype.degrees(angleInRadians);

  return angleInDegrees;
}





function pointsAreInBoundary(points: p5.Vector[], point: Point) {
  return classifyPoint(points.map(corner => [corner.x, corner.y]) as Point[], point)
}



function calculatePointPosition(p: p5, entranceEdge: Edge, parkingAngle: number, parkingStalls: {
  left: ParkingStall[];
  right: ParkingStall[];
}) {

  const stallWidth = 85;
  const stallHeight = 45;
  // Get the enterance points and the direction they are pointing.

  // Expand the parking size
  const currentNumberOfStallsRight = parkingStalls.right.length;
  const currentNumberOfStallsLeft = parkingStalls.left.length;

  const firstPointRight = currentNumberOfStallsRight === 0 ? entranceEdge.point1 : parkingStalls.right[currentNumberOfStallsRight - 1].stallCorners[1];
  const secondPointRight = [firstPointRight.x + p.cos(parkingAngle - 90) * stallHeight, firstPointRight.y + p.sin(parkingAngle - 90) * stallHeight]

  const firstPointLeft = currentNumberOfStallsLeft === 0 ? entranceEdge.point2 : parkingStalls.left[currentNumberOfStallsLeft - 1].stallCorners[1];
  const secondPointLeft = [firstPointLeft.x + p.cos(parkingAngle - 90) * stallHeight, firstPointLeft.y + p.sin(parkingAngle - 90) * stallHeight];


  const thirdAndFourthPointRight = [ // pointing to the right
    [firstPointRight.x + p.cos(parkingAngle) * stallWidth, firstPointRight.y + p.sin(parkingAngle) * stallWidth],
    [secondPointRight[0] + p.cos(parkingAngle) * stallWidth, secondPointRight[1] + p.sin(parkingAngle) * stallWidth],
  ];
  const thirdAndFourthPointLeft = [ // pointing to the right
    [firstPointLeft.x - p.cos(parkingAngle) * stallWidth, firstPointLeft.y - p.sin(parkingAngle) * stallWidth],
    [secondPointLeft[0] - p.cos(parkingAngle) * stallWidth, secondPointLeft[1] - p.sin(parkingAngle) * stallWidth],
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

function calculateStallPosition(p: p5, entranceEdge: Edge, angle: number, parkingStallsOnSide: ParkingStall[], side: "left" | "right", stallIndex: number) {


  const stallWidth = 85;
  const stallHeight = 45;

  // Get the enterance points and the direction they are pointing.

  // Expand the parking size
  const currentNumberOfStalls = parkingStallsOnSide.length;

  let sideMultiplier = side === "left" ? -1 : 1;
  let entrancePoint = side === "left" ? entranceEdge.point2 : entranceEdge.point1;
  let firstPoint = currentNumberOfStalls === 0 ?
    entrancePoint :
    p.createVector(
      entrancePoint.x + p.cos(angle - 90) * stallHeight * stallIndex,
      entrancePoint.y + p.sin(angle - 90) * stallHeight * stallIndex
    );
  const secondPoint = [
    firstPoint.x + p.cos(angle - 90) * stallHeight, firstPoint.y + p.sin(angle - 90) * stallHeight]


  const thirdAndFourthPoint = [ // pointing to the right
    [firstPoint.x + sideMultiplier * p.cos(angle) * stallWidth, firstPoint.y + sideMultiplier * p.sin(angle) * stallWidth],
    [secondPoint[0] + sideMultiplier * p.cos(angle) * stallWidth, secondPoint[1] + sideMultiplier * p.sin(angle) * stallWidth],
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



// function getLineIntersection(
//   p: p5,
//   line1: p5.Vector[],
//   line2: p5.Vector[]
// ): p5.Vector | null {
//   const { x: x1, y: y1 } = line1[0];
//   const { x: x2, y: y2 } = line1[1];
//   const { x: x3, y: y3 } = line2[0];
//   const { x: x4, y: y4 } = line2[1];

//   const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

//   if (denom === 0) return null;

//   const intersectX =
//     ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
//   const intersectY =
//     ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

//   return p.createVector(intersectX, intersectY);
// };


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