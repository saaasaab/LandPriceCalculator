import p5 from "p5";
import { Edge } from "./Edge";
import { stallWidth } from "../sketchForSiteplan";
import { calculateCentroid } from "../../../utils/SiteplanGeneratorUtils";

export class ParkingStall {

  private p: p5;
  public stallNumber: number;
  public angle: number;
  public parkingStallEdges: Edge[];
  public stallCorners: p5.Vector[];
  public previousAngle: number;
  public entranceEdge: Edge;
  public previousEntranceEdge: Edge;
  public isEmptySlot: boolean;
  public scale: number;
  public cementOffset: number
  public center: p5.Vector;
  public parkingStallType: "normal" | "handicapped" | "compact";

  constructor(p: p5, stallNumber: number, angle: number, stallCorners: p5.Vector[], entranceEdge: Edge, scale: number, cementOffset: number, center: p5.Vector, parkingStallType: "normal" | "handicapped" | "compact") {
    this.p = p;
    // this.side = side;
    this.stallNumber = stallNumber;
    this.angle = angle;
    this.parkingStallEdges = [];
    this.stallCorners = stallCorners;
    this.previousAngle = angle;
    this.entranceEdge = entranceEdge;
    this.previousEntranceEdge = entranceEdge;
    this.isEmptySlot = false;
    this.scale = scale;
    this.cementOffset = cementOffset;
    this.center = center;
    this.parkingStallType = parkingStallType;
  }

  initialize() {
    this.createParkingStallCorners();
    this.setParkingStallEdges();
  }

  drawParkingStall() {
    const p = this.p;

    // if (this.isEmptySlot) return;

    p.beginShape();
    p.stroke(130); // Outline color
    p.strokeWeight(1.5);
    p.noFill()
    const reorderCorners = [...this.stallCorners]
    // Needed to not show the parking lines inside the parking lot.
    // reorderCorners.push(...reorderCorners.splice(0, 1));
    reorderCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
      // p.text(i, corner.x, corner.y)
    })
    p.endShape(); // Close the polygon



    // p.push();


    // p.translate(this.center.x, this.center.y)
    // p.rotate(this.angle);
    // p.rectMode(p.CENTER);
    
    

    // const center = calculateCentroid(this.stallCorners);

    // p.rect(
    //   Math.sign(this.cementOffset) * stallWidth / this.scale / 2 - this.cementOffset / this.scale,
    //   0,
    //   .5 / this.scale,
    //   7 / this.scale)

    // p.pop()

    // p.fill('gold');
    // p.ellipse(center.x,center.y,10,10)
  }


  setParkingStallEdges() {

  }

  createParkingStallCorners() {

  }


}