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

  }

  initialize() {

    if (this.elementType === ESitePlanObjects.ParkingWay) {
      this.entranceEdgeIndex = 2;
    }
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
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
    this.angle = angle;
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
    const angleRad = p.radians(-this.angle);

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
    console.log(`angle`, angle)
    const approach = new SitePlanElement(p, getCenterPoint(propertyEdges[2].point1, propertyEdges[2].point2), 100, 20, 180 - angle, ESitePlanObjects.Approach);
    const parking = new SitePlanElement(p, p.createVector(300, 200), 120, 200, 30, ESitePlanObjects.ParkingWay);

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
          parking.updateAngle(-angle + 90)
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



          parking.center.x = newX;
          parking.center.y = newY;

          const edgeMidpoint1 = getCenterPoint(parking.sitePlanElementEdges[2].point1, parking.sitePlanElementEdges[2].point2);
          const edgeMidpoint2 = getCenterPoint(approach.sitePlanElementEdges[0].point1, approach.sitePlanElementEdges[0].point2);


          const angle = calculateAngle(edgeMidpoint1, edgeMidpoint2)
          parking.updateAngle(-angle + 90)
          parking.updateSitePlanElementEdges();









          // Take a snapshop

          parking.updateAngle(-angle + 90)
          parking.updateSitePlanElementEdges();

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






          // console.log(`allBoundaryPointsInPolygon `, allBoundaryPointsInPolygon )





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


            const pointToEdgelookup = [
              [3, 0],
              [0, 1],
              [1, 2],
              [2, 3]
            ];


            // Find which edge is closest to the property line edge
            const pivotDirection = findWhichSideOfThePivotTheObjectShouldRotateToward(
              parking.sitePlanElementEdges[pointToEdgelookup[stuckPointIndex][0]],
              parking.sitePlanElementEdges[pointToEdgelookup[stuckPointIndex][1]],

              propertyEdges[propertyEdgeViolated]
            )




            // const pivotX =  pivotDirection[1].point2.x+pivotDirection[1].getLineLength()/2;
            // const pivotY =  propertyEdges[propertyEdgeViolated].point1.y + pivotDirection[1].getLineLength()/2;

            // // console.log(stuckPoint.x,stuckPoint.y,pivotX, pivotY )

            // parking.center.x =pivotX;
            // parking.center.y = pivotY;
            // parking.updateAngle(_angle)
            // parking.updateSitePlanElementEdges();




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





function calculateAngularDifference(angle1: number, angle2: number): number {
  const diff = Math.abs(angle1 - angle2);
  return Math.min(diff, 360 - diff); // Account for wrapping around 360
}


function findWhichSideOfThePivotTheObjectShouldRotateToward(
  edge1: Edge,
  edge2: Edge,
  intersectingEdge: Edge
): Edge[] {
  // Calculate angles of the edges
  const angle1 = normalizeAngle(edge1.calculateAngle());
  const angle2 = normalizeAngle(edge2.calculateAngle());
  const intersectingAngle = normalizeAngle(intersectingEdge.calculateAngle());

  // Calculate angular differences
  const difference1 = calculateAngularDifference(angle1, intersectingAngle);
  const difference2 = calculateAngularDifference(angle2, intersectingAngle);

  // Return the edge with the smaller angular difference
  return difference1 <= difference2 ? [edge1, edge2] : [edge1, edge2];
}

/**
 * Normalizes an angle to the range [0, 360).
 * @param angle - The angle in degrees.
 * @returns The normalized angle.
 */
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