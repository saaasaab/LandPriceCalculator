import p5 from "p5";
import { SitePlanElement } from "./SitePlanElement";
import { Parking } from "./Parking";
import { expandPolygon, getCenterPoint } from "../../../utils/SiteplanGeneratorUtils";
import { SitePlanObjects } from "../sketchForSiteplan";

export class Garbage extends SitePlanElement {


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
  
  
    updateCenterGarbage(parking: Parking) {
      // property: Property,
  
      parking.sitePlanElementEdges[0].point1
  
      const center = getCenterPoint(this.p, parking.sitePlanElementEdges[0].point1, parking.sitePlanElementEdges[0].point2);
  
  
      const _center = this.p.createVector(
        center.x + this.p.cos(this.angle - 90) * this.height / 2,
        center.y + this.p.sin(this.angle - 90) * this.height / 2
      );
  
      this.center.x = _center.x;
      this.center.y = _center.y;
    }
  
    drawGarbageEnclosure() {
      const p = this.p;
      const garbageOutline = [];
      garbageOutline.push(
        this.sitePlanElementCorners[2],
        this.sitePlanElementCorners[1],
        this.sitePlanElementCorners[0],
        this.sitePlanElementCorners[3],
      )
  
      // Set the this.parkingOutline to the inner layer before the offset is created. 
  
      const offsetParking = expandPolygon(p, garbageOutline, -5);
      const points = [...offsetParking, ...garbageOutline.reverse()];
  
  
      p.push();
      p.beginShape();
      p.fill(120, 120, 120, 150); // Fill color with transparency
      p.stroke(0); // Outline color
      p.strokeWeight(1);
      p.textSize(10)
  
      points.forEach((corner) => {
        p.vertex(corner.x, corner.y);
      });
      p.endShape(p.CLOSE); // Close the polygon
      p.pop();
  
  
    }
  }