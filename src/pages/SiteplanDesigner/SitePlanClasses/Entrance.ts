import p5 from "p5";
import { calculateAngle } from "../../../utils/SiteplanGeneratorUtils";
import { Edge } from "./Edge";

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