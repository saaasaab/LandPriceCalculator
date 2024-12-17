import p5 from "p5";
import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"



class Edge {
  public point1: p5.Vector;
  public point2: p5.Vector;
  public isApproach: boolean
  private p: p5;

  constructor(p:p5,point1: p5.Vector, point2: p5.Vector, isApproach: boolean) {
    this.point1 = point1;
    this.point2 = point2;
    this.isApproach = isApproach;
    this.p = p;
  }

  drawLine(){
    this.p.stroke(0);
    this.p.strokeWeight(5);


    if(this.isApproach){
      this.p.stroke(45,200,30);

    }
    this.p.line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
  }
}


class Approach {
  public center: p5.Vector;
  public width: number
  public angle: number;
 
  private p: p5;

  constructor(p:p5,center: p5.Vector, width:number, angle: number) {
    this.center=center;
    this.width = width
    this.p = p;
    this.angle = angle;
  }

  drawApproach(){
    this.p.rectMode(this.p.CENTER);
    this.p.rect(this.center.x,this.center.y,this.width, 30);
  }
}




type TPointObject = { x: number, y: number };
type Point = [number, number];

export type SitePlanObjects = "Parking1" | "Parking2" | "Driveway" | "Bike Parking" | "Approach" | "Garbage" | "Building";

type DimensionValue = {
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  dragging: boolean;
  [key: string]: any;
  normalParkingSpots?: number;
};

type Dimensions = Record<SitePlanObjects, DimensionValue>;

interface ControlPoints {
  start: TPointObject;
  end: TPointObject;
  control1: TPointObject;
  control2: TPointObject;
}



// Visualization module using p5.js
export class AdjacencyGraphVisualizer2 {
  private graph: AdjacencyGraph;
  private iteration: number;


  constructor(graph: AdjacencyGraph) {
    this.graph = graph;
    this.iteration = 0;

  }

  visualize2(p: p5): void {
    const vertices = Object.keys(this.graph["adjacencyList"]) as SitePlanObjects[];

    const dimensions: Dimensions = {
      Parking1: {
        x: 0,
        y: 0,
        normalParkingSpots: 0,
        angle: 0,
        dragging: false,
        width: 20, height: 20,

      },

      Parking2: {
        x: 0,
        y: 0,
        normalParkingSpots: 0,
        angle: 0,
        dragging: false,
        width: 20, height: 20,
      },
      Driveway: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 135,
      },
      "Bike Parking": {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,

      },
      Approach: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,

      },
      Garbage: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,

      },
      Building: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,
      },
    };


    
    // compactParkingSpots: 1,
    // handicappedParkingSpots: 0,
    // isShown: 1,


    const propertyCorners = [
      p.createVector(40, 40),
      p.createVector(p.width - 40, 40),
      p.createVector(p.width - 40, p.height - 80),
      p.createVector(40, p.height - 40),
    ]

    const propertyEdges: Edge[] = [];

    for (let i = 0; i < propertyCorners.length; i++) {
      const corner1 = propertyCorners[i];
      let corner2 = i === propertyCorners.length - 1 ?propertyCorners[0]: propertyCorners[i + 1];

     
      const isApproach = i === 2;
      const newEdge = new Edge(p, corner1, corner2, isApproach);
      propertyEdges.push(newEdge);
    }



    const approach = new Approach(p,
      getCenterPoint(propertyEdges[2].point1,propertyEdges[2].point2),
      20,
      15
    
      )



    p.mouseDragged = () => {

    };


    p.mousePressed = () => {

    };

    p.mouseReleased = () => {

    };

    p.draw = () => {



      p.background(240);
      p.stroke(0);

      p.beginShape()
      propertyEdges.forEach(edge =>
        edge.drawLine()
      )





      // propertyCorners.forEach(corner => {
      //   p.vertex(corner.x, corner.y);
      // })

      // Add vertices.



      // Stop drawing the shape.
      // p.endShape(p.CLOSE);






    };
  }
}

function getCenterPoint(p1: p5.Vector, p2: p5.Vector): p5.Vector {
  return p5.Vector.add(p1, p2).div(2);
}