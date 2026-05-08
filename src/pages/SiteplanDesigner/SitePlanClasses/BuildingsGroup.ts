import p5 from "p5";
import { Building } from "./Building";
import { SitePlanObjects } from "../sketchForSiteplan";

export class BuildingsGroup {
  public isInitialized = false;
  public buildings: Building[];
  public p: p5;
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
    const building = new Building(p,
      center,
      width,
      height,
      angle,
      elementType,
      scale,
      offsetSize);


    this.buildings.push(building)
  }

  removeBuilding() { }


  tempBuilding() {
    this.p.push();
    this.p.rectMode(this.p.CENTER);
    this.p.stroke(0);
    this.p.strokeWeight(2);
    /** One full breathe (small → large → small) every ~3s — avoids frame-based strobing at 60fps. */
    const periodMs = 3000;
    const minPx = 10;
    const maxPx = 52;
    const t = (this.p.millis() % periodMs) / periodMs;
    const wave = (Math.sin(t * Math.PI * 2) + 1) / 2;
    const side = minPx + wave * (maxPx - minPx);
    this.p.rect(this.p.mouseX, this.p.mouseY, side, side, 4);

    this.p.pop();
  }

}
