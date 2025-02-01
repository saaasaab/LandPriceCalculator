import p5 from "p5";
import { SitePlanElement } from "./SitePlanElement";
import { SitePlanObjects } from "../sketchForSiteplan";
import { initialFormData } from "../../../utils/SiteplanGeneratorUtils";

export class Approach extends SitePlanElement {

  public approachArea: number

  public approachWidth: number
  public propertyEntranceCount: number;
  public enableApproachDimensions: boolean;


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
    this.approachArea = width * height / 2;

    // Input Constraints
    this.approachWidth = initialFormData.approachWidth;
    this.propertyEntranceCount = initialFormData.propertyEntranceCount;
    this.enableApproachDimensions = initialFormData.enableApproachDimensions;
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
    });



    p.endShape(p.CLOSE); // Close the polygon

    p.ellipse(this.center.x, this.center.y, 10, 10);


    // p.text(p.round(this.angle), this.center.x, this.center.y);

    // this.sitePlanElementEdges.forEach(edge => {
    //   const center = getCenterPoint(this.p, edge.point1, edge.point2);
    //   p.fill(200, 20, 40);
    //   p.ellipse(center.x, center.y, 10, 10);
    //   p.strokeWeight(1)
    //   p.fill(40, 200, 20);


    //   // p.text(p.round(edge.calculateAngle()), center.x, center.y);
    // })




    const arrowEdge = this.sitePlanElementEdges[2];
    const midpoint = arrowEdge.getMidpoint();

    p.translate(midpoint.x, midpoint.y);
    p.rotate(this.angle);

    p.stroke(2);
    p.textAlign("center");
    p.textSize(18);
    p.text('↔', 0, 15)



    if (this.enableApproachDimensions) {
      p.rotate(-this.angle);
      p.text(Math.round(this.width * this.scale), 0, 40)
    }


    p.pop()



  }



}