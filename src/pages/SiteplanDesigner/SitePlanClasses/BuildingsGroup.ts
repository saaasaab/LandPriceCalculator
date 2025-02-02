import p5 from "p5";
import { Building } from "./Building";
import { SitePlanObjects } from "../sketchForSiteplan";

export class BuildingsGroup {
  public isInitialized = false;
  public buildings: Building[];
  public p: p5;
  public frameCount = 0;
  constructor(
    p: p5,
  ) {
    this.buildings = []
    this.p = p
  }

  addBuilding(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number,
    offsetSize: number
  ) {
    const building = new Building( p,
      center,
      width,
      height,
      angle,
      elementType,
      scale,
      offsetSize);


      this.buildings.push(building)
  }

  removeBuilding(){}


  tempBuilding() {
    this.p.push();
    this.p.rectMode(this.p.CENTER);
    this.p.stroke(0);
    this.p.strokeWeight(2)
    const speed = 4
    this.p.rect(this.p.mouseX, this.p.mouseY, this.frameCount * speed, this.frameCount * speed, 4);
    this.frameCount++;

    this.p.pop();
    // this.p.frameRate();

    if (this.frameCount * speed > 50) this.frameCount = 0
  }

}
