import p5 from "p5";
import { calculateArea, calculateAngle, truthChecker, normalizeAngle, polyPoint, expandPolygon, getCenterPoint } from "../../../utils/SiteplanGeneratorUtils";
import { Edge } from "./Edge";
import classifyPoint from "robust-point-in-polygon";
import RotateArrow from "../../../assets/rotateArrow.png"
import { ESitePlanObjects, Point, SitePlanObjects } from "../sketchForSiteplan";



export class SitePlanElement {
  public angle: number;
  public center: p5.Vector;
  public previousCenter: p5.Vector;


  public elementType: SitePlanObjects;
  public entranceEdge: Edge | null;
  public height: number;
  public offsetSitePlanElementCorners: p5.Vector[];
  public p: p5;
  public previousAngle: number;
  public previousEntranceEdge: Edge | null;
  public sitePlanElementCorners: p5.Vector[];
  public sitePlanElementEdges: Edge[];
  public width: number;
  public scale: number;
  public area: number;
  public rotationHandles: p5.Vector[]
  public showRotationAnimationCount: number;
  public showRotationHandles: boolean;
  public isInitialized: boolean;
  public isRotating: boolean;
  public hoverHandleIndex: number;
  public rotationImage: p5.Image | null = null;
  public lineColor: p5.Color;
  public offsetSize: number;
  public isSelected: boolean;
  public zoom: number;
  public offsetX: number;
  public offsetY: number

  constructor(p: p5, center: p5.Vector, width: number, height: number, angle: number, elementType: SitePlanObjects, scale: number, offsetSize: number = 30) {
    this.angle = angle;
    this.center = center;
    this.elementType = elementType;
    this.entranceEdge = null;
    this.height = height;
    this.offsetSitePlanElementCorners = [];
    this.p = p;
    this.previousAngle = angle;
    this.previousEntranceEdge = null;
    this.sitePlanElementCorners = [];
    this.sitePlanElementEdges = [];
    this.width = width;
    this.scale = scale;
    this.previousCenter = center;
    this.area = Math.round(width * height);
    this.rotationHandles = []
    this.isInitialized = false;
    this.isRotating = false;
    this.hoverHandleIndex = -1;
    this.showRotationAnimationCount = 0;
    this.showRotationHandles = false;
    this.rotationImage = p.loadImage(RotateArrow);
    this.lineColor = p.color(20, 20, 20);
    this.offsetSize = offsetSize;
    this.isSelected = false;
    this.zoom = 1; // Initial zoom level
    this.offsetX = 0;
    this.offsetY = 0; // Offset for translation
  }

  initialize() {
    this.isInitialized = true;
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
  }

  calculateArea() {
    this.area = Math.round(calculateArea(this.sitePlanElementCorners));
  }


  projectFromCenter(position: p5.Vector, distance: number) {
    const _angle = calculateAngle(this.center, position);
    const newX = position.x + this.p.cos(_angle) * distance;
    const newY = position.y + this.p.sin(_angle) * distance;
    return { x: newX, y: newY }
  }
  pointIsInPolygon(corners: p5.Vector[]) {
    // 1 = outside
    // 0 = on the border
    // -1 = inside
    const elementIsAllInPolygonArray = this.sitePlanElementCorners.map(sitePlanCorner => {
      const pointClassification = classifyPoint(corners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
      return pointClassification === -1
    })

    return truthChecker(elementIsAllInPolygonArray)
  }

  // take the corners 
  pointIsOutOfPolygon(corners: p5.Vector[]) {
    // 1 = outside
    // 0 = on the border
    // -1 = inside

    const elementIsAllInPolygonArray = this.sitePlanElementCorners.map(sitePlanCorner => {
      const pointClassification = classifyPoint(corners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
      return pointClassification === 1
    })

    return truthChecker(elementIsAllInPolygonArray)
  }

  setSitePlanElementEdges() {
    const sitePlanElementCorners = this.sitePlanElementCorners;

    const edges: Edge[] = []
    for (let i = 0; i < sitePlanElementCorners.length; i++) {
      const corner1 = sitePlanElementCorners[i];
      let corner2 = i === sitePlanElementCorners.length - 1 ? sitePlanElementCorners[0] : sitePlanElementCorners[i + 1];

      const isApproach = i === 2 && this.elementType === ESitePlanObjects.Approach;
      const newEdge = new Edge(this.p, corner1, corner2, isApproach, 0, i);
      edges.push(newEdge);
    }
    this.sitePlanElementEdges = edges

  }

  updateCenter(newX: number, newY: number) {

    if (this.center.x === newX && this.center.y === newY) return
    // newX
    this.previousCenter = this.center;
    this.center.x = newX;
    this.center.y = newY;

    this.update();


  }


  calculatePointAtDistance = (
    startPoint: p5.Vector,
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
      startPoint.x + perpendicular.x * distance,
      startPoint.y + perpendicular.y * distance
    );

    return targetPoint;
  };

  setLineColors(color: p5.Color) {
    this.lineColor = color;
  }

  update() {
    this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.createOffsetPolygon(this.offsetSize);

    this.calculateArea();
    this.createRotationHandles();
  }

  updateAngle(angle: number) {
    this.angle = angle;
    this.update();
  }

  updateheight(height: number) {
    this.height = height;
    this.update();
  }

  updateWidth(width: number) {
    this.width = width;
    this.update();
  }

  updateSitePlanElementCorners() {
    const p = this.p;
    const center = this.center;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;


    const angle = normalizeAngle(this.angle);

    // Define the initial (unrotated) corner points relative to the center
    const corners: p5.Vector[] = [
      p.createVector(-halfWidth, -halfHeight), // Top-left
      p.createVector(halfWidth, -halfHeight),  // Top-right
      p.createVector(halfWidth, halfHeight),   // Bottom-right
      p.createVector(-halfWidth, halfHeight),  // Bottom-left
    ];

    // Rotate each corner around the center and compute its absolute position
    this.sitePlanElementCorners = corners.map((corner) => {
      const rotatedX = corner.x * p.cos(angle) - corner.y * p.sin(angle);
      const rotatedY = corner.x * p.sin(angle) + corner.y * p.cos(angle);
      return p.createVector(center.x + rotatedX, center.y + rotatedY);
    });
  }

  createSitePlanElementCorners() {
    const p = this.p;
    const center = this.center;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    // Define the initial (unrotated) corner points relative to the center
    const corners: p5.Vector[] = [
      p.createVector(-halfWidth, -halfHeight), // Top-left
      p.createVector(halfWidth, -halfHeight),  // Top-right
      p.createVector(halfWidth, halfHeight),   // Bottom-right
      p.createVector(-halfWidth, halfHeight),  // Bottom-left
    ];

    // Convert the angle to radians
    const angle = normalizeAngle(this.angle);

    // Rotate each corner around the center and compute its absolute position
    this.sitePlanElementCorners = corners.map((corner) => {
      const rotatedX = corner.x * p.cos(angle) - corner.y * p.sin(angle);
      const rotatedY = corner.x * p.sin(angle) + corner.y * p.cos(angle);
      return p.createVector(center.x + rotatedX, center.y + rotatedY);
    });
  }

  isMouseHovering(): boolean {

    const newX = this.p.mouseX;
    const newY = this.p.mouseY;

    return polyPoint(this.sitePlanElementCorners, newX, newY);
  }

  isMouseHoveringOffset(): boolean {
    return polyPoint(this.offsetSitePlanElementCorners, (this.p.mouseX) * this.zoom, (this.p.mouseY) * this.zoom);
  }

  isMouseHoveringRotateHandle(distance = 20): boolean {

    // Set the hovered index so it can be used later
    let hoverHandles = this.rotationHandles.map((handle, i) => {
      const dist = this.p.dist((this.p.mouseX) * this.zoom, (this.p.mouseY) * this.zoom, handle.x, handle.y) < distance
      if (dist) {
        this.hoverHandleIndex = i;

      }
      return dist
    })
    return hoverHandles.findIndex(isHover => isHover === true) !== -1
  }

  getMouseHoveringRotateHandleIndex(distance = 20): number {
    let handleIndex = -1;
    this.rotationHandles.forEach((handle, i) => {
      if (this.p.dist((this.p.mouseX) * this.zoom, (this.p.mouseY) * this.zoom, handle.x, handle.y) < distance) {
        handleIndex = i;
      }
    })
    return handleIndex
  }

  createRotationHandles(distance = 40) {

    if (!this.isInitialized) return
    const offset = this.projectFromCenter(this.sitePlanElementEdges[0].getMidpoint(), distance)

    this.rotationHandles = [this.p.createVector(offset.x, offset.y)];

  }

  createOffsetPolygon(offsetSize: number) {
    this.offsetSitePlanElementCorners = expandPolygon(this.p, this.sitePlanElementCorners, offsetSize);
  }

  drawRotationHandles() {
    this.p.push()
    this.p.stroke(100, 100, 100)

    this.rotationHandles.forEach(handle => {
      if (this.rotationImage) {
        this.p.push()
        this.p.stroke(0)
        this.p.imageMode(this.p.CENTER);
        this.p.translate(handle.x, handle.y);

        this.p.rotate(this.angle);
        this.p.image(this.rotationImage, 0, 0)
        this.p.pop();
      }
      this.p.noFill();
      this.p.stroke(0);
      this.p.ellipse(handle.x, handle.y, 25, 25);
    })
    this.p.pop()
  }



  drawSitePlanElement() {
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
      // p.text(i, corner.x, corner.y)
    });


    p.endShape(p.CLOSE); // Close the polygon

    p.ellipse(this.center.x, this.center.y, 10, 10);


    // p.text(p.round(this.angle), this.center.x, this.center.y);

    this.sitePlanElementEdges.forEach((edge) => {
      const center = getCenterPoint(this.p, edge.point1, edge.point2);
      p.fill(200, 20, 40);
      p.ellipse(center.x, center.y, 10, 10);

      // p.text(i,center.x, center.y)
      p.strokeWeight(1)
      p.fill(40, 200, 20);


      // p.text(p.round(edge.calculateAngle()), center.x, center.y);
    })

    p.pop()


  }

}