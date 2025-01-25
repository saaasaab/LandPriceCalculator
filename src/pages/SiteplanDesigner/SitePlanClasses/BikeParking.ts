import p5 from "p5";
import { SitePlanElement } from "./SitePlanElement";
import { initialFormData } from "../../../utils/SiteplanGeneratorUtils";
import { SitePlanObjects } from "../sketchForSiteplan";

export class BikeParking extends SitePlanElement {

 public  bikeCount: number;


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
    // Call the parent export class constructor to initialize all inherited variables
    super(p, center, width, height, angle, elementType, scale);

    // Input Constraints
    this.bikeCount = initialFormData.bikeCount;
    


  }

  initializeBikeParking() {
    this.isInitialized = true;
    this.createSitePlanElementCorners();



  
  }

  update() {
  
    this.createOffsetPolygon(10);

  }


  drawBikeParking() {
    this.p.push();
    this.p.pop();

  }
}