import p5 from "p5";
import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"

type Point=[number,number];



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

class Approach {
  public center: p5.Vector;
  public width: number;
  public height: number;
  public angle: number;
  private p: p5;
  public approachCorners: p5.Vector[];
  public approachEdges: Edge[];


  constructor(p: p5, center: p5.Vector, width: number, height: number, angle: number) {
    this.center = center;
    this.width = width
    this.height = height;
    this.p = p;
    this.angle = angle;
    this.approachCorners = [];
    this.approachEdges = [];
  }

  initialize() {
    this.createApproachCorners();
    this.setApproachEdges();
  }


  setApproachEdges() {
    const approachCorners = this.approachCorners;

    const edges = []
    for (let i = 0; i < approachCorners.length; i++) {
      const corner1 = approachCorners[i];
      let corner2 = i === approachCorners.length - 1 ? approachCorners[0] : approachCorners[i + 1];
      const isApproach = i === 2;
      const newEdge = new Edge(this.p, corner1, corner2, isApproach);
      edges.push(newEdge);
    }

    this.approachEdges = edges
  }

  updateApproachEdges() {
    this.createApproachCorners()
    this.setApproachEdges()
  }


  createApproachCorners() {
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
    this.approachCorners = corners.map((corner) => {
      const rotatedX = corner.x * Math.cos(angleRad) - corner.y * Math.sin(angleRad);
      const rotatedY = corner.x * Math.sin(angleRad) + corner.y * Math.cos(angleRad);
      return p.createVector(center.x + rotatedX, center.y + rotatedY);
    });

  }

  isMouseHovering(): boolean {
    return polyPoint(this.approachCorners, this.p.mouseX, this.p.mouseY);
  }

  drawApproach() {

    const p = this.p;
    p.angleMode(p.DEGREES);

    // Draw the polygon using the corner vectors
    p.beginShape();
    p.fill(100, 200, 255, 150); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);

    this.approachCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });

    p.endShape(p.CLOSE); // Close the polygon

    p.ellipse(this.center.x, this.center.y, 50, 50);
  }
}

class ParkingLot {
  public center: p5.Vector;
  public width: number;
  public height: number;
  public angle: number;
  private p: p5;
  public parkingCorners: p5.Vector[];
  public parkingEdges: Edge[];

  public entranceEdgeIndex: number;


  constructor(p: p5, center: p5.Vector, width: number, height: number, angle: number) {
    this.center = center;
    this.width = width
    this.height = height;
    this.p = p;
    this.angle = angle;
    this.parkingCorners = [];
    this.entranceEdgeIndex = 2;
    this.parkingEdges = [];
  }



  initialize() {
    this.createParkingCorners()
    this.setParkingEdges();
  }

  isMouseHovering(): boolean {
    return polyPoint(this.parkingCorners, this.p.mouseX, this.p.mouseY);
  }

  setParkingEdges() {
    const parkingCorners = this.parkingCorners;

    const edges = []
    for (let i = 0; i < parkingCorners.length; i++) {
      const corner1 = parkingCorners[i];
      let corner2 = i === parkingCorners.length - 1 ? parkingCorners[0] : parkingCorners[i + 1];
      const isApproach = i === 2;
      const newEdge = new Edge(this.p, corner1, corner2, isApproach);
      edges.push(newEdge);
    }
    this.parkingEdges = edges;
  }

  updateAngle(angle: number){
    this.angle = angle;
  }

  updateParkingEdges() {
    this.createParkingCorners();
    this.setParkingEdges()
  }

  createParkingCorners() {
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
    this.parkingCorners = corners.map((corner) => {
      const rotatedX = corner.x * Math.cos(angleRad) - corner.y * Math.sin(angleRad);
      const rotatedY = corner.x * Math.sin(angleRad) + corner.y * Math.cos(angleRad);
      return p.createVector(center.x + rotatedX, center.y + rotatedY);
    });
  }



  drawParking() {
    const p = this.p;
    p.angleMode(p.DEGREES);

    // Draw the polygon using the corner vectors
    p.beginShape();
    p.fill(150, 200, 205); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(2);

    this.parkingCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });

    p.endShape(p.CLOSE); // Close the polygon

    // p.ellipse(this.center.x, this.center.y, 50, 50);
  }
}


export type SitePlanObjects = "Parking1" | "Parking2" | "Driveway" | "Bike Parking" | "Approach" | "Garbage" | "Building";


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
    ]





    const propertyEdges: Edge[] = [];

    for (let i = 0; i < propertyCorners.length; i++) {
      const corner1 = propertyCorners[i];
      let corner2 = i === propertyCorners.length - 1 ? propertyCorners[0] : propertyCorners[i + 1];
      const isApproach = i === 2;
      const newEdge = new Edge(p, corner1, corner2, isApproach);
      propertyEdges.push(newEdge);
    }

    // const angle = edge.calculateAngle();
    const angle = 11
    const approach = new Approach(p, getCenterPoint(propertyEdges[2].point1, propertyEdges[2].point2), 100, 20, angle);
    const parking = new ParkingLot(p, p.createVector(300, 200), 120, 200, 30);

    approach.initialize()
    parking.initialize();


    let isDraggingParking = false;
    let isDraggingApproach = false
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
          approach.updateApproachEdges()

          // If rotating the parking is going to push the parking outside the boundary, then update the center of the parking
          // in the opposite direction of the contact point. If that's going to cause a conflict, then move it reflected 90degrees


          // ACTUALLY if I'm close to an edge, make the angle steer toward the edge until it snaps in place
          const edgeMidpoint1 = getCenterPoint(parking.parkingEdges[2].point1, parking.parkingEdges[2].point2);
          const edgeMidpoint2 = getCenterPoint(approach.approachEdges[0].point1, approach.approachEdges[0].point2);



          





          // Take a snapshop
          const _angle = parking.angle;
          
          const angle = calculateAngle(edgeMidpoint1,edgeMidpoint2)
          parking.updateAngle(-angle+90)
          parking.updateParkingEdges();

          const pointsOutsideBoundary = [];

          const allPointsInPolygon = parking.parkingCorners.map((corner,i) => {
            const point = [corner.x, corner.y];
            const pointClassification = classifyPoint(propertyCorners.map(corner=>[corner.x,corner.y]) as Point[], point as Point)
            // 1 = outside
            // 0 = on the border
            // -1 = inside

            if(pointClassification === 1) pointsOutsideBoundary.push(i);
            
            return pointClassification === -1
          })




          
    
  
          if( !truthChecker(allPointsInPolygon)){

            parking.updateAngle(_angle)
            parking.updateParkingEdges();
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

          const edgeMidpoint1 = getCenterPoint(parking.parkingEdges[2].point1, parking.parkingEdges[2].point2);
          const edgeMidpoint2 = getCenterPoint(approach.approachEdges[0].point1, approach.approachEdges[0].point2);

          
          const angle = calculateAngle(edgeMidpoint1,edgeMidpoint2)
          parking.updateAngle(-angle+90)
          parking.updateParkingEdges();









          // Take a snapshop
          
          parking.updateAngle(-angle+90)
          parking.updateParkingEdges();

          const pointsOutsideBoundary = [];

          const allPointsInPolygon = parking.parkingCorners.map((corner,i) => {
            const point = [corner.x, corner.y];
            const pointClassification = classifyPoint(propertyCorners.map(corner=>[corner.x,corner.y]) as Point[], point as Point)
            // 1 = outside
            // 0 = on the border
            // -1 = inside

            if(pointClassification === 1) pointsOutsideBoundary.push(i);
            
            return pointClassification === -1
          })

          
          if( !truthChecker(allPointsInPolygon)){
            parking.center.x = _center[0]
            parking.center.y = _center[1]
            parking.updateAngle(_angle)
            parking.updateParkingEdges();
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

      approach.drawApproach();
      parking.drawParking();






      // Left Line
      drawPerpendicularBezier(
        p,
        approach.approachCorners[0],
        parking.parkingCorners[3],


        approach.approachEdges[2],
        parking.parkingEdges[parking.entranceEdgeIndex]
      );




      // Center line
      drawPerpendicularBezier(
        p,
        approach.center,
        getCenterPoint(parking.parkingEdges[parking.entranceEdgeIndex].point1, parking.parkingEdges[parking.entranceEdgeIndex].point2),
        approach.approachEdges[2],
        parking.parkingEdges[parking.entranceEdgeIndex]
      );

      // Right Line
      drawPerpendicularBezier(
        p,
        approach.approachCorners[1],
        parking.parkingCorners[2],
        approach.approachEdges[2],
        parking.parkingEdges[parking.entranceEdgeIndex]
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

function calculateAngle(point1: p5.Vector,point2: p5.Vector): number {
  const deltaY = point2.y - point1.y;
  const deltaX = point2.x - point1.x;

  // atan2 handles quadrants and division by zero
  const angleInRadians = Math.atan2(deltaY, deltaX);

  // Convert radians to degrees
  const angleInDegrees = angleInRadians*180/Math.PI;

  return angleInDegrees;
}


