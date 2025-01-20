import p5 from "p5";
import { setLineDash } from "../../../utils/SiteplanGeneratorUtils";

export class Edge {
  public point1: p5.Vector;
  public point2: p5.Vector;
  public isApproach: boolean
  private p: p5;
  public setback: number;
  public point1Offset: p5.Vector;
  public point2Offset: p5.Vector;
  public isScale: boolean;
  public isSetback: boolean;
  public lineIndex: number;
  public midpoint: p5.Vector;


  constructor(p: p5, point1: p5.Vector, point2: p5.Vector, isApproach: boolean, setback: number, index: number) {
    this.point1 = point1;
    this.point2 = point2;
    this.isApproach = isApproach;
    this.p = p;
    this.setback = setback;
    this.point1Offset = this.p.createVector(0, 0);
    this.point2Offset = this.p.createVector(0, 0);
    this.isScale = false;
    this.isSetback = false;
    this.lineIndex = index;
    this.midpoint = this.p.createVector(0, 0);
  }

  updateEdge(newPoint1: p5.Vector, newPoint2: p5.Vector) {
    this.point1 = newPoint1;
    this.point2 = newPoint2;

    this.midpoint = this.getMidpoint()
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
    const p = this.p;

    if (this.isApproach && this.isScale) {
      p.strokeWeight(4)
      p.stroke(230, 120, 20);

    }
    else if (this.isApproach) {
      p.stroke(20, 230, 120);
    }
    else if (this.isScale) {
      p.stroke(230, 120, 20);
    }
    else {
      this.p.stroke(0);
      this.p.strokeWeight(3);
    }

    if (this.isApproach) {
      this.p.stroke(45, 200, 30);
    }

    setLineDash(this.p, [5, 10, 30, 10, 5, 10])
    this.p.line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);


    setLineDash(this.p, [])
    this.p.textSize(24)

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