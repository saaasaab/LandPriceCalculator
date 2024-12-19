import p5 from "p5";
import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"


const eq1 = (AD:number, PA:number) => AD - 90 - PA;
const eq2 = (AD:number, PA:number) => AD + PA;
const eq3 = (AD:number, PA:number) => PA-AD+90;
const eq4 = (AD:number, PA:number) => AD - PA;
const eq5 = (AD:number, PA:number) => PA - 90 - AD;
const eq6 = (AD:number, PA:number) => AD - PA - 90;
const refiningAngle:RefiningAngleType = {
  0: {
    0: {
      1: { parkingAngle: 0, angleDiff: 90,"fn": eq1, },
      3: { parkingAngle: 90, angleDiff: 0,"fn": eq2, }

    },
    1:{
      0: { parkingAngle: 360, angleDiff: 0,"fn": eq2, },
      2: { parkingAngle: 270, angleDiff: 90,"fn": eq3, },
    }
  },

  1: {
    1: {
      0: { parkingAngle: 90, angleDiff: 0,"fn": eq2, },
      2: { parkingAngle: 0, angleDiff: 90,"fn": eq4, }
    },
    2:{
      1: { parkingAngle: 360, angleDiff: 0,"fn": eq2, },
    }
  },
  2: {
    2: {
      1: { parkingAngle: 90, angleDiff: 0,"fn": eq2, },
    },
    3:{
      0: { parkingAngle: 270, angleDiff: 0,"fn": eq2, },
    }
  },
  3: {
    0: {
      1: { parkingAngle: 270, angleDiff: 90,"fn": eq5, },
      3: { parkingAngle: 360, angleDiff: 0,"fn": eq2, }
    },
   3:{
      0: { parkingAngle: 0, angleDiff: 90,"fn": eq6, },
    }
  },
  
}

type RefiningAngleType = {
  [key: number]: {
    [key: number]: {
      [key: number]: { parkingAngle: number; angleDiff: number; fn: (AD: number, PA: number) => number };
    };
  };
};


const pointToEdgelookup = [
  [3, 0],
  [0, 1],
  [1, 2],
  [2, 3]
];


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


    return normalizeAngle(angleInDegrees);
  }

}

class ParkingStall{

  private p: p5;
  public side: number;
  public stallNumber: number;
  public angle: number;
  public parkingStallCorners: p5.Vector[];
  public parkingStallEdges: Edge[];

  constructor(p: p5, side: number, stallNumber: number, angle: number) {
    this.p = p;
    this.side = side;
    this.stallNumber = stallNumber;
    this.angle = angle;
    this.parkingStallCorners=[]
    this.parkingStallEdges=[]
  }

  initialize(){
    this.createParkingStallCorners();
    this.setParkingStallEdges();
  }

  drawParkingStall(){
      
  }


  setParkingStallEdges() {
    // const sitePlanElementCorners = this.parkingStallCorners;

    // const edges = []
    // for (let i = 0; i < sitePlanElementCorners.length; i++) {
    //   const corner1 = sitePlanElementCorners[i];
    //   let corner2 = i === sitePlanElementCorners.length - 1 ? sitePlanElementCorners[0] : sitePlanElementCorners[i + 1];

    //   const isEnterance = i === 2 && this.elementType === ESitePlanObjects.Approach;
    //   const newEdge = new Edge(this.p, corner1, corner2, isApproach);
    //   edges.push(newEdge);
    // }

    // this.sitePlanElementEdges = edges
  }

  createParkingStallCorners() {
    // const p = this.p;
    

    // const center = this.center;
    // const halfWidth = 45 / 2;
    // const halfHeight = 90 / 2;

    // // Define the initial (unrotated) corner points relative to the center
    // const corners: p5.Vector[] = [
    //   p.createVector(-halfWidth, -halfHeight), // Top-left
    //   p.createVector(halfWidth, -halfHeight),  // Top-right
    //   p.createVector(halfWidth, halfHeight),   // Bottom-right
    //   p.createVector(-halfWidth, halfHeight),  // Bottom-left
    // ];

    // // Convert the angle to radians
    // const angleRad = p.radians(normalizeAngle(this.angle));

    // // Rotate each corner around the center and compute its absolute position
    // this.sitePlanElementCorners = corners.map((corner) => {
    //   const rotatedX = corner.x * Math.cos(angleRad) - corner.y * Math.sin(angleRad);
    //   const rotatedY = corner.x * Math.sin(angleRad) + corner.y * Math.cos(angleRad);
    //   return p.createVector(center.x + rotatedX, center.y + rotatedY);
    // });

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
  public parkingStalls:ParkingStall[] = [];


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
    this.parkingStalls = [];
  }


  initialize() {
    if (this.elementType === ESitePlanObjects.ParkingWay) {
      this.entranceEdgeIndex = 2;
    }
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
    
    
    
    // Number of stalls
    const numStalls = 4;


    for (let index = 0; index < numStalls; index++) {
      const stall = new ParkingStall(this.p, index % 2, index, this.angle);

      
      this.parkingStalls.push(stall)

      
    }

  }


  setSitePlanElementEdges() {
    const sitePlanElementCorners = this.sitePlanElementCorners;

    const edges = []
    for (let i = 0; i < sitePlanElementCorners.length; i++) {
      const corner1 = sitePlanElementCorners[i];
      let corner2 = i === sitePlanElementCorners.length - 1 ? sitePlanElementCorners[0] : sitePlanElementCorners[i + 1];

      const isApproach = i === 2 && this.elementType === ESitePlanObjects.Approach;
      const newEdge = new Edge(this.p, corner1, corner2, isApproach);
      edges.push(newEdge);
    }

    this.sitePlanElementEdges = edges
  }

  updateSitePlanElementEdges() {
    this.createSitePlanElementCorners()
    this.setSitePlanElementEdges()
  }

  updateAngle(angle: number) {
    this.angle = normalizeAngle(angle);
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
    const angleRad = p.radians(normalizeAngle(this.angle));

    // Rotate each corner around the center and compute its absolute position
    this.sitePlanElementCorners = corners.map((corner) => {
      const rotatedX = corner.x * Math.cos(angleRad) - corner.y * Math.sin(angleRad);
      const rotatedY = corner.x * Math.sin(angleRad) + corner.y * Math.cos(angleRad);
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


    p.text(Math.round(this.angle), this.center.x, this.center.y);

    this.sitePlanElementEdges.forEach(edge => {
      const center = getCenterPoint(edge.point1, edge.point2);
      p.fill(200, 20, 40);
      p.ellipse(center.x, center.y, 20, 20);
      p.strokeWeight(1)
      p.fill(40, 200, 20);


      p.text(Math.round(edge.calculateAngle()), center.x, center.y);
    })
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


    const propertyCorners = [
      p.createVector(40, 40),
      p.createVector(p.width - 40, 40),
      p.createVector(p.width - 40, p.height - 180),
      p.createVector(40, p.height - 40),
    ];

    const propertyEdges: Edge[] = [];

    for (let i = 0; i < propertyCorners.length; i++) {
      const corner1 = propertyCorners[i];
      let corner2 = i === propertyCorners.length - 1 ? propertyCorners[0] : propertyCorners[i + 1];
      const isApproach = i === 2;
      const newEdge = new Edge(p, corner1, corner2, isApproach);
      propertyEdges.push(newEdge);
    }

    //
    const angle = propertyEdges[2].calculateAngle();
    const approach = new SitePlanElement(p, getCenterPoint(propertyEdges[2].point1, propertyEdges[2].point2), 100, 60, 180 + angle, ESitePlanObjects.Approach);
    const parking = new SitePlanElement(p, p.createVector(488, 308), 120, 45, 15, ESitePlanObjects.ParkingWay);

    approach.initialize()
    parking.initialize();
    let isDraggingParking = false;
    let isDraggingApproach = false;


    p.mouseDragged = () => {
      const isHoveredApproach = approach.isMouseHovering();
      const isHoveredParking = parking.isMouseHovering();

      if (isHoveredApproach || isDraggingApproach) {
        isDraggingApproach = true;
        const newX = p.mouseX;
        const newY = approach.center.y + (approach.center.x - newX) * .2; //Need to update based on the actual angle of approach edge.

        if (
          newX - approach.width / 2 > propertyCorners[3].x &&
          newX + approach.width / 2 < propertyCorners[2].x
        ) {
          approach.center.x = newX;
          approach.center.y = newY;
          approach.updateSitePlanElementEdges()

          // If rotating the parking is going to push the parking outside the boundary, then update the center of the parking
          // in the opposite direction of the contact point. If that's going to cause a conflict, then move it reflected 90degrees


          // ACTUALLY if I'm close to an edge, make the angle steer toward the edge until it snaps in place
          const edgeMidpoint1 = getCenterPoint(parking.sitePlanElementEdges[2].point1, parking.sitePlanElementEdges[2].point2);
          const edgeMidpoint2 = getCenterPoint(approach.sitePlanElementEdges[0].point1, approach.sitePlanElementEdges[0].point2);


          // Take a snapshop
          const _angle = parking.angle;

          const angle = calculateAngle(edgeMidpoint1, edgeMidpoint2)
          parking.updateAngle(angle - 90); // +90 to get the perpendicular angle
          parking.updateSitePlanElementEdges();

          const pointsOutsideBoundary: number[] = [];

          const allPointsInPolygon = parking.sitePlanElementCorners.map((corner, i) => {
            const point = [corner.x, corner.y];
            const pointClassification = classifyPoint(propertyCorners.map(corner => [corner.x, corner.y]) as Point[], point as Point)
            // 1 = outside
            // 0 = on the border
            // -1 = inside

            if (pointClassification === 1 || pointClassification === 0) pointsOutsideBoundary.push(i);

            return pointClassification === -1
          })
          if (!truthChecker(allPointsInPolygon)) {

            parking.updateAngle(_angle)
            parking.updateSitePlanElementEdges();
          }
        }
      }

      if (isHoveredParking || isDraggingParking) {
        isDraggingParking = true;
        const newX = p.mouseX;
        const newY = p.mouseY;

        if (
          newX - parking.width / 2 > propertyCorners[3].x &&
          newX + parking.width / 2 < propertyCorners[2].x
        ) {

          const _angle = parking.angle;
          const _center = [parking.center.x, parking.center.y];
          // For all the points of the parking, find the point and edge that are closest. If they're 
          // Within a certain distance, start to move the angle of the object to match the edge's angle.
          let closestEdge = 0;
          let closestPoint = 0;
          let closestEdgePointDistance = Infinity;


          parking.sitePlanElementCorners.forEach((corner, cornerIndex) => {
            const closestEdgeIndex = findClosestEdge(propertyEdges, corner);

            const edge = propertyEdges[closestEdgeIndex];
            const distance = calculatePointToEdgeDistance(edge, corner);

            if (distance < closestEdgePointDistance) {
              closestEdgePointDistance = distance;
              closestPoint = cornerIndex;
              closestEdge = closestEdgeIndex;
            }
          })


          // console.log({ edge: closestEdge, point: closestPoint, distance: closestEdgePointDistance })


          if (closestEdgePointDistance < 40) {

            // console.log(`other search points`, closestPoint, pointToEdgelookup[closestPoint])

            const indices = getAdjacentIndices(closestPoint, parking.sitePlanElementEdges.length);

            const distanceForIndex1 = calculatePointToEdgeDistance(propertyEdges[closestEdge], parking.sitePlanElementCorners[indices[0]]);
            const distanceForIndex2 = calculatePointToEdgeDistance(propertyEdges[closestEdge], parking.sitePlanElementCorners[indices[1]]);


            const pivotTowardsIndex = distanceForIndex1 < distanceForIndex2 ? indices[0] : indices[1]

            const angleDiff = calculateAngleBetweenEdges(parking.sitePlanElementEdges[pivotTowardsIndex], propertyEdges[closestEdge])                 
            const refinement = refiningAngle?.[closestEdge]?.[closestPoint]?.[pivotTowardsIndex]
            if(refinement){
              // console.log( Math.round(angleDiff), "=>",refinement.angleDiff, "AND", Math.round(parking.angle),"=>",refinement.parkingAngle);
              // const newAngle = refinement
            }

            // until at 10 px away from the edge, its paralel
            // parking.center.x = newX;
            // parking.center.y = newY;
          }
          else {
           
          }
          // Otherwise, set the new parking center to the newX and newY


          parking.center.x = newX;
          parking.center.y = newY;

          const edgeMidpoint1 = getCenterPoint(parking.sitePlanElementEdges[2].point1, parking.sitePlanElementEdges[2].point2);
          const edgeMidpoint2 = getCenterPoint(approach.sitePlanElementEdges[0].point1, approach.sitePlanElementEdges[0].point2);


          const angle = calculateAngle(edgeMidpoint1, edgeMidpoint2)

          // When its angle + 90, the parking flips 180, and it actually feels better to control. Something to look into more

          parking.updateAngle(angle - 90)
          parking.updateSitePlanElementEdges();



          // Take a snapshop
          const pointsOutsideBoundary: number[] = [];
          const allPointsInPolygon = parking.sitePlanElementCorners.map((corner1, i) => {
            const point = [corner1.x, corner1.y];
            const pointClassification = classifyPoint(propertyCorners.map(corner => [corner.x, corner.y]) as Point[], point as Point)
            // 1 = outside
            // 0 = on the border
            // -1 = inside

            if (pointClassification === 1) pointsOutsideBoundary.push(i);

            return pointClassification === -1
          })


          if (!truthChecker(allPointsInPolygon)) {
            parking.center.x = _center[0]
            parking.center.y = _center[1]
            parking.updateAngle(_angle)
            parking.updateSitePlanElementEdges();
          }


          if (pointsOutsideBoundary.length === 1) {
            const stuckPointIndex = pointsOutsideBoundary[0]
            const stuckPoint = parking.sitePlanElementCorners[stuckPointIndex];

            let propertyEdgeViolated = findClosestEdge(propertyEdges, stuckPoint);
          }


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


      propertyEdges.forEach(edge =>
        edge.drawLine()
      )

      approach.drawSitePlanElement();
      parking.drawSitePlanElement();


      // Left Line
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
        getCenterPoint(parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0].point1, parking.sitePlanElementEdges[parking.entranceEdgeIndex || 0].point2),
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
      // Helper
      p.strokeWeight(1)
      for (let i = 0; i < 360; i += 45) {
        p.line(
          p.width / 2,
          p.height / 2,
          p.width / 2 + Math.sin(i * Math.PI / 180) * 50,
          p.height / 2 + Math.cos(i * Math.PI / 180) * 50


        )
        p.text(i, p.width / 2 + Math.sin(i * Math.PI / 180) * 60,
          p.height / 2 + Math.cos(i * Math.PI / 180) * 60);

      }


    };
  }
}

function getCenterPoint(p1: p5.Vector, p2: p5.Vector): p5.Vector {
  return p5.Vector.add(p1, p2).div(2);
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
  const deltaY = point2.y - point1.y;
  const deltaX = point2.x - point1.x;

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