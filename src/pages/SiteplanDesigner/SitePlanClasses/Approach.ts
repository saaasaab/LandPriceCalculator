import p5 from "p5";
import { SitePlanElement } from "./SitePlanElement";
import { SitePlanObjects } from "../sketchForSiteplan";
import { initialFormData } from "../../../utils/SiteplanGeneratorUtils";

export class Approach extends SitePlanElement {

  public approachArea: number

  public approachWidth: number
  public propertyEntranceCount: number;
  public enableApproachDimensions: boolean;
  public frameCount: number;

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
    this.frameCount = 0;
  }

  drawApproach() {
    const p = this.p;
    p.push()

    p.angleMode(p.DEGREES);
    // Draw the polygon using the corner vectors
    p.beginShape();
    p.stroke(0); // Outline color
    p.strokeWeight(2);


    this.sitePlanElementCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });



    p.endShape(p.CLOSE); // Close the polygon

    p.ellipse(this.center.x, this.center.y, 10, 10);


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