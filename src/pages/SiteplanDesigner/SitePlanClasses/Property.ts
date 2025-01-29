import p5 from "p5";
import { angularDistance360, calculateAngle, calculateArea, expandPolygon, initialFormData, polyPoint } from "../../../utils/SiteplanGeneratorUtils";
// import { SitePlanElement } from "./SitePlanElement";
import { Edge } from "./Edge";
import { IPoint, Line } from "../SitePlanDesigner";

export class Property {
  private p: p5;
  public propertyEdges: Edge[] = [];
  public propertyCorners: p5.Vector[];
  public approachEdge: Edge | null = null;
  public approachEdgeIndex: number | null;
  public approachAngle: number = 15;
  // public propertyQuadrants: p5.Vector[][] = [];
  public maxAreaIndex: number = 0;
  public isClockwise: boolean;
  public scale: number;
  public cornerOffsetsFromSetbacks: p5.Vector[] = [];
  public setbacks: number[];
  public areaOfProperty: number;


  // INPUT CONTSTRAINTS
  public drivewayWidth: number;
  public taperedDriveway: boolean;
  public buildingCoveragePercentage: number;
  public imperviousSurfacePercentageAllowed: number;
  public enableAngles: boolean;
  public enableLineLengths: boolean;
  public approachWidth: number;
  public buildingCoveragePercentageAllowed: number;
  public drivewayArea: number;
  public imperviousSurfaceAllowed: number;
  public landscapeRequiredPercent: number;
  public zoning: string;



  // OUTPUT CONSTRAINTS 
  public imperviousSurfacePercentageActual: number;
  public landscapeArea: number;
  public imperviousSurfaceArea: number;
  public totalAreaDedicatedToSetbacks: number;






  constructor(p: p5, propertyCorners: p5.Vector[], isClockwise: boolean, scale: number, setbacks: number[]) {
    this.p = p;
    this.propertyCorners = propertyCorners;
    this.approachEdgeIndex = null;
    this.isClockwise = isClockwise;
    this.scale = scale;
    this.setbacks = setbacks;
    this.areaOfProperty = 0;


    //INPUT CONTSTRAINTS
    this.buildingCoveragePercentage = 70;
    this.imperviousSurfacePercentageAllowed = 70;
    this.taperedDriveway = true;
    this.drivewayWidth = 24;
    this.enableAngles = true;
    this.enableLineLengths = true;
    this.approachWidth = initialFormData.approachWidth;
    this.buildingCoveragePercentageAllowed = initialFormData.buildingCoveragePercentageAllowed;
  
  
  
    this.imperviousSurfaceAllowed= initialFormData.imperviousSurfacePercentageAllowed;
    this.landscapeRequiredPercent = initialFormData.landscapeRequiredPercent;
    this.zoning = initialFormData.zoning;




    // OUTPUT CONSTRAINTS
    this.drivewayArea = 0;
    this.imperviousSurfacePercentageActual = 0;

    this.imperviousSurfaceArea=0;
    this.landscapeArea= 0
    this.totalAreaDedicatedToSetbacks= 0;





  }


  initialize() {
    const p = this.p;
    const propertyCorners = this.propertyCorners;

    const propertyEdges: Edge[] = [];

    for (let i = 0; i < propertyCorners.length; i++) {
      const corner1 = propertyCorners[i];
      let corner2 = i === propertyCorners.length - 1 ? propertyCorners[0] : propertyCorners[i + 1];
      const isApproach = i === this.approachEdgeIndex;
      const newEdge = new Edge(p, corner1, corner2, isApproach, this.setbacks[i], i);
      propertyEdges.push(newEdge);
    }


    this.propertyEdges = propertyEdges;

    this.areaOfProperty = Math.round(calculateArea(propertyCorners) * this.scale * this.scale)

  }


  updateSetbacks(lines: Line[]) {
    lines.forEach((line, i) => {
      this.propertyEdges[i].setback = (this.isClockwise ? -1 : -1) * (line.setback / this.scale);
    })
    this.calculateCornerOffsetsFromSetbacks()
  }

  setApproachIndex(approachIndex: number) {
    this.approachEdgeIndex = approachIndex;

    this.approachEdge = this.propertyEdges[this.approachEdgeIndex];
    const initialApproachAngle = this.approachEdge?.calculateAngle();
    this.approachAngle = initialApproachAngle;
  }

  updateCornersAndEdgesPositions(points: IPoint[]) {
    this.propertyCorners = points.map(point => this.p.createVector(point.x, point.y));

    this.propertyEdges.forEach((edge, i) => {
      const nextIndex = (i + 1) % this.propertyEdges.length;
      edge.point1.x = this.propertyCorners[i].x
      edge.point1.y = this.propertyCorners[i].y
      edge.point2.x = this.propertyCorners[nextIndex].x
      edge.point2.y = this.propertyCorners[nextIndex].y
    })

    this.calculateCornerOffsetsFromSetbacks()
    this.updateArea()

  }

  updateArea(){
    const area = calculateArea(this.propertyCorners) * Math.pow(this.scale, 2);
    this.areaOfProperty = area;
  }

  updateEdges(points: IPoint[]) {
    points.forEach((point, i) => {
      this.propertyCorners[i].x = point.x;
      this.propertyCorners[i].y = point.y;
    })
    this.propertyCorners = points.map(point => this.p.createVector(point.x, point.y));
    this.calculateCornerOffsetsFromSetbacks()
  }



  isMouseHovering(): boolean {
    return polyPoint(this.propertyCorners, this.p.mouseX, this.p.mouseY);
  }

  isMouseHoveringOffset(): boolean {
    const offset = expandPolygon(this.p, this.propertyCorners, 30);
    return polyPoint(offset, this.p.mouseX, this.p.mouseY);
  }



  drawProperty() {
    this.p.noFill();
    this.p.stroke('black');
    this.p.strokeWeight(1)

    this.propertyCorners.forEach((corner) => {
      this.p.ellipse(corner.x, corner.y, 6, 6);
      // this.p.text(i,corner.x, corner.y);
    })
  }

  drawAnglesBetweenLines() {
    // Draw interior angle curves between consecutive lines
    for (let i = 0; i < this.propertyCorners.length; i++) {

      let i1 = i;
      let i2 = (i + 1) % this.propertyCorners.length;
      let i3 = (i + 2) % this.propertyCorners.length;

      const p1 = this.p.createVector(this.propertyCorners[i1].x, this.propertyCorners[i1].y);
      const p2 = this.p.createVector(this.propertyCorners[i2].x, this.propertyCorners[i2].y);
      const p3 = this.p.createVector(this.propertyCorners[i3].x, this.propertyCorners[i3].y);

      const _angle1 = calculateAngle(p2, p1);
      const _angle2 = calculateAngle(p2, p3);

      const angle = angularDistance360(_angle1, _angle2);

      const radius = 25;
      this.p.noFill();
      this.p.stroke(255, 0, 0);
      this.p.arc(p2.x, p2.y, radius * 2, radius * 2, _angle1, _angle2);

      // Display the angle value
      const angleText = `${angle.toFixed(1)}°`;
      const angleMid = _angle1 + angle / 2;
      const textX = p2.x + this.p.cos(angleMid) * (radius + 10);
      const textY = p2.y + this.p.sin(angleMid) * (radius + 10);

      this.p.textSize(12);
      this.p.noStroke();
      this.p.fill(255, 0, 0);
      this.p.text(angleText, textX, textY);
    }
  }

  drawLineLengths() {
    this.propertyEdges.forEach((edge) => {
      edge.drawLine()

      if (this.enableLineLengths) {


        const midX = (edge.point1.x + edge.point2.x) / 2;
        const midY = (edge.point1.y + edge.point2.y) / 2;
        const length = Math.hypot(edge.point2.x - edge.point1.x, edge.point2.y - edge.point1.y) * (this.scale || .25);

        this.p.noStroke()
        this.p.fill('black')
        this.p.push();
        this.p.translate(midX, midY);
        this.p.rotate(edge.calculateAngle())
        this.p.textSize(14);
        this.p.text(`${length.toFixed(1)} ft`, 0, 0);
        this.p.pop();


      }
    })
  }

  // New method to calculate offset intersections
  calculateCornerOffsetsFromSetbacks() {
    const cornerOffsetsFromSetbacks: p5.Vector[] = [];
    for (let i = 0; i < this.propertyEdges.length; i++) {
      const currentEdge = this.propertyEdges[i];
      currentEdge.createParallelEdge();
    }

    for (let i = 0; i < this.propertyEdges.length; i++) {
      const currentEdge = this.propertyEdges[i];
      const nextEdge = i === this.propertyEdges.length - 1 ? this.propertyEdges[0] : this.propertyEdges[i + 1];


      // Calculate the intersection point of the offset edges
      const intersection = this.getIntersection(currentEdge, nextEdge);
      if (intersection) {
        cornerOffsetsFromSetbacks.push(intersection);
      }
    }

    this.cornerOffsetsFromSetbacks = cornerOffsetsFromSetbacks;
  }

  drawSetbackPolygon() {
    const p = this.p;
    p.fill(100, 200, 255, 50); // Fill color with transparency
    p.stroke(0); // Outline color
    p.strokeWeight(1);


    p.push()

    p.fill(100, 200, 255, 50); // Fill color with transparency

    p.beginShape();
    this.propertyCorners.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });
    p.endShape(p.CLOSE); // Close the polygon


    p.fill("#f9fafb"); // Fill color with transparency

    p.beginShape(); // Close the polygon

    this.cornerOffsetsFromSetbacks.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });
    p.endShape(p.CLOSE); // Close the polygon
    p.pop();
  }


  getIntersection(edge1: Edge, edge2: Edge): p5.Vector | null {
    const { p } = this;

    const x1 = edge1.point1Offset.x;
    const y1 = edge1.point1Offset.y;
    const x2 = edge1.point2Offset.x;
    const y2 = edge1.point2Offset.y;

    const x3 = edge2.point1Offset.x;
    const y3 = edge2.point1Offset.y;
    const x4 = edge2.point2Offset.x;
    const y4 = edge2.point2Offset.y;

    // Calculate the denominator for the line intersection formula
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // If denom is 0, the lines are parallel or coincident
    if (Math.abs(denom) < 1e-6) {
      console.warn("Lines are parallel or coincident:", { edge1, edge2 });
      return null;
    }

    // Calculate the intersection point
    const intersectX =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const intersectY =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    const intersection = p.createVector(intersectX, intersectY);

    // Debugging: Log the calculated intersection point

    // Check if the intersection lies on both line segments
    const tolerance = 1e-6; // Increase tolerance to handle floating-point precision
    const isOnEdge1 =
      Math.min(x1, x2) - tolerance <= intersectX &&
      intersectX <= Math.max(x1, x2) + tolerance &&
      Math.min(y1, y2) - tolerance <= intersectY &&
      intersectY <= Math.max(y1, y2) + tolerance;

    const isOnEdge2 =
      Math.min(x3, x4) - tolerance <= intersectX &&
      intersectX <= Math.max(x3, x4) + tolerance &&
      Math.min(y3, y4) - tolerance <= intersectY &&
      intersectY <= Math.max(y3, y4) + tolerance;

    if (isOnEdge1 && isOnEdge2) {
      return intersection;
    }


    return null; // Intersection is out of bounds
  }


  // propertyQuadrant(property: Property, parking: SitePlanElement) {
  //   const p = this.p;
  //   // Find which edge the line intersects by looping through all the edges. If there are more than one, use the one closest to the center point
  //   // Find the intersection points of all the crosses, then calculate the area minus the parking size to get the "quadrant" with the most availiable area.

  //   p.stroke(50, 150, 150)
  //   const crossSize = 200;

  //   const offsets = [
  //     [-90, -90],
  //     [0, 0],
  //     [90, 90],
  //     [180, 180],
  //   ];

  //   const edgeIntersections: {
  //     edge: number;
  //     intersection: p5.Vector;
  //     distance: number;
  //     minDistanceIndex: number;
  //     offset: number[];
  //   }[] = [];



  //   offsets.forEach((offset) => {
  //     const intersections: p5.Vector[] = []
  //     const edgeIndecies: number[] = []

  //     property.propertyEdges.forEach((edge, edgeIndex) => {

  //       const intersect = getLineIntersection(
  //         p,
  //         [
  //           p.createVector(parking.center.x, parking.center.y),
  //           p.createVector(parking.center.x + p.cos(parking.angle + offset[0]) * crossSize, parking.center.y + p.sin(parking.angle + offset[1]) * crossSize)
  //         ],
  //         [edge.point1, edge.point2]
  //       )
  //       if (intersect) {
  //         intersections.push(intersect)
  //         edgeIndecies.push(edgeIndex);
  //       }
  //     })


  //     let minDistance = Infinity;
  //     let minDistanceIndex = 0;
  //     intersections.forEach((intersection, i) => {
  //       let d = intersection.dist(parking.center);

  //       if (d < minDistance) {
  //         minDistanceIndex = i;
  //         minDistance = d;
  //       }
  //     })

  //     edgeIntersections.push({
  //       edge: edgeIndecies[minDistanceIndex],
  //       intersection: intersections[minDistanceIndex],
  //       distance: minDistance,
  //       minDistanceIndex: minDistanceIndex,
  //       offset: offset,
  //     });
  //   });


  //   edgeIntersections.forEach((intersection) => {
  //     p.ellipse(intersection?.intersection?.x || 0, intersection?.intersection?.y || 0, 10, 10)
  //     p.line(parking.center.x, parking.center.y, parking.center.x + p.cos(parking.angle + intersection.offset[0]) * crossSize, parking.center.y + p.sin(parking.angle + intersection.offset[1]) * crossSize)
  //   })

  //   const totalEdges = edgeIntersections.length;
  //   const polys: p5.Vector[][] = []
  //   edgeIntersections.forEach((_current, index) => {

  //     const nextIndex = (index + 1) % totalEdges; // Wrap around to the start when at the last index
  //     // const next = edgeIntersections[nextIndex];


  //     const poly = [
  //       parking.center,
  //       edgeIntersections[index].intersection,
  //       property.propertyEdges[edgeIntersections[index].edge].point2,
  //     ];
  //     const startEdge = edgeIntersections[index].edge;
  //     const endEdge = edgeIntersections[nextIndex].edge;
  //     const indexes = createWrappedIndices(startEdge, endEdge, property.propertyEdges.length)

  //     indexes.forEach(index =>
  //       poly.push(
  //         property.propertyEdges[index].point2,
  //       )
  //     )
  //     poly.push(edgeIntersections[nextIndex].intersection);
  //     polys.push(poly);
  //   });

  //   let maxArea = -Infinity;
  //   let maxAreaIndex = 0;
  //   // let neighboringMaxIndex = -1;
  //   let secondMaxArea = -Infinity;

  //   polys.forEach((poly, i) => {
  //     let area = calculateArea(poly);

  //     if (area > maxArea) {
  //       // Update second max area with the previous max area
  //       secondMaxArea = maxArea;

  //       // Update neighbor index
  //       // neighboringMaxIndex = maxAreaIndex;

  //       // Set new max area and max area index
  //       maxArea = area;
  //       maxAreaIndex = i;
  //     } else if (area > secondMaxArea) {
  //       // Update the second max area and its index
  //       secondMaxArea = area;
  //       // neighboringMaxIndex = i;
  //     }
  //   });

  //   // this.propertyQuadrants = polys;

  //   this.maxAreaIndex = maxAreaIndex;

  // }
}