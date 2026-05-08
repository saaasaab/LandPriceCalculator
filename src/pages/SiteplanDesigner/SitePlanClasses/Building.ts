import p5 from "p5";
import { Entrance } from "./Entrance";
import { SitePlanElement } from "./SitePlanElement";
import { arrayOfRandomNudges, calculateAngle, calculateArea, calculateCentroid, createSitePlanElementCorners, drawNeonShape, expandPolygon, getCenterPoint, initialFormData, moveVector, normalizeAngle, polyPoint, pointsAreInBoundary, truthChecker, twoObjectsAreNotColliding } from "../../../utils/SiteplanGeneratorUtils";
import { Parking } from "./Parking";
import { Property } from "./Property";
import { Garbage } from "./Garbage";
import { Point, SitePlanObjects } from "../sketchForSiteplan";

export class Building extends SitePlanElement {
  public isInitialized = false;
  public entrances: Entrance[] = [];
  public buildingAreaActual: number;
  public hasStopped: boolean;
  public isMoving: boolean;
  public areaExceeded: boolean;

  /** Vertex editing overlay: Shift+edge adds nodes; Esc exits node mode. */
  public polygonNodeEditMode = false;
  /** When non-null, footprint uses these vertices (drawing/world coords) instead of width/height/angle. */
  public freeformPolygonCorners: p5.Vector[] | null = null;


  // Input Constraints
  public buildingAreaTarget: number;
  public buildingCount: number;
  public enableBuildingDimensions: boolean;
  public showbuildingArea: boolean;
  public maximumHeight: number;
  public buildingDimensionsDisplayedOnTheInside: boolean;

  constructor(
    p: p5,
    center: p5.Vector,
    width: number,
    height: number,
    angle: number,
    elementType: SitePlanObjects,
    scale: number,
    offsetSize: number
  ) {
    // Call the parent class constructor to initialize all inherited variables
    super(p, center, width, height, angle, elementType, scale, offsetSize);
    this.buildingAreaActual = 0;
    this.hasStopped = true;
    this.isMoving = false;
    this.areaExceeded = false;


    // Input Constraints
    this.buildingAreaTarget = initialFormData.buildingAreaTarget
    this.buildingCount = initialFormData.buildingCount;
    this.enableBuildingDimensions = initialFormData.enableBuildingDimensions;
    this.buildingDimensionsDisplayedOnTheInside = initialFormData.buildingDimensionsDisplayedOnTheInside;
    this.showbuildingArea = initialFormData.showbuildingArea;
    this.maximumHeight = initialFormData.maximumHeight;

    this.initializeBuilding(this.center.x, this.center.y)
  }

  /** True when the pointer (world coords) lies inside the building footprint polygon. */
  isPointInFootprint(worldX: number, worldY: number): boolean {
    return polyPoint(this.sitePlanElementCorners, worldX, worldY);
  }

  enterPolygonNodeEditMode() {
    if (!this.freeformPolygonCorners || this.freeformPolygonCorners.length < 3) {
      this.freeformPolygonCorners = this.sitePlanElementCorners.map((c) =>
        this.p.createVector(c.x, c.y)
      );
    }
    this.polygonNodeEditMode = true;
    this.update();
  }

  exitPolygonNodeEditMode() {
    this.polygonNodeEditMode = false;
  }

  update() {
    if (this.freeformPolygonCorners !== null && this.freeformPolygonCorners.length >= 3) {
      this.sitePlanElementCorners = this.freeformPolygonCorners.map((v) =>
        this.p.createVector(v.x, v.y)
      );
      const c = calculateCentroid(this.sitePlanElementCorners);
      if (Number.isFinite(c.x) && Number.isFinite(c.y)) {
        this.center.x = c.x;
        this.center.y = c.y;
      } else {
        let sx = 0;
        let sy = 0;
        for (const v of this.sitePlanElementCorners) {
          sx += v.x;
          sy += v.y;
        }
        const n = this.sitePlanElementCorners.length;
        this.center.x = sx / n;
        this.center.y = sy / n;
      }
      this.setSitePlanElementEdges();
      this.createOffsetPolygon(this.offsetSize);
      this.calculateArea();
      if (this.isInitialized) {
        this.createRotationHandles();
      }
    } else {
      super.update();
    }
  }

  updateCenter(newX: number, newY: number) {
    if (this.freeformPolygonCorners !== null && this.freeformPolygonCorners.length >= 3) {
      if (this.center.x === newX && this.center.y === newY) return;
      const dx = newX - this.center.x;
      const dy = newY - this.center.y;
      this.freeformPolygonCorners.forEach((v) => {
        v.x += dx;
        v.y += dy;
      });
      this.previousCenter = this.p.createVector(this.center.x, this.center.y);
      this.center.x = newX;
      this.center.y = newY;
      this.sitePlanElementCorners = this.freeformPolygonCorners.map((v) =>
        this.p.createVector(v.x, v.y)
      );
      this.setSitePlanElementEdges();
      this.createOffsetPolygon(this.offsetSize);
      this.calculateArea();
      if (this.isInitialized) {
        this.createRotationHandles();
      }
      return;
    }
    super.updateCenter(newX, newY);
  }

  updateAngle(angle: number) {
    if (this.freeformPolygonCorners !== null && this.freeformPolygonCorners.length >= 3) {
      const next = normalizeAngle(angle);
      const deltaDeg = next - this.angle;
      const rad = this.p.radians(deltaDeg);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cx = this.center.x;
      const cy = this.center.y;
      this.freeformPolygonCorners.forEach((v) => {
        const rx = v.x - cx;
        const ry = v.y - cy;
        v.x = cx + rx * cos - ry * sin;
        v.y = cy + rx * sin + ry * cos;
      });
      this.angle = next;
      this.previousAngle = next;
      this.sitePlanElementCorners = this.freeformPolygonCorners.map((v) =>
        this.p.createVector(v.x, v.y)
      );
      this.setSitePlanElementEdges();
      this.createOffsetPolygon(this.offsetSize);
      this.calculateArea();
      if (this.isInitialized) {
        this.createRotationHandles();
      }
      return;
    }
    super.updateAngle(angle);
  }

  updateWidth(width: number) {
    if (this.freeformPolygonCorners !== null) return;
    super.updateWidth(width);
  }

  updateheight(height: number) {
    if (this.freeformPolygonCorners !== null) return;
    super.updateheight(height);
  }

  initializeBuilding(x: number, y: number,) {
    this.isInitialized = true;

    this.center.x = x;
    this.center.y = y;

    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges()
    this.update()



    this.createRotationHandles()

    this.updateBuildingActualArea();
  }
  calculateArea() {
    return Math.round(calculateArea(this.sitePlanElementCorners) * this.scale * this.scale)
  }

  updateBuildingCenter(newX: number, newY: number) {
    this.updateCenter(newX, newY);
    this.updateEntrances();

  }

  updateBuildingTargetArea(area: number) {
    // Should be in sqrt ft
    this.buildingAreaTarget = area;
  }

  updateBuildingActualArea() {

    const area = this.calculateArea();
    // Should be in sqrt ft
    this.buildingAreaActual = area;
  }

  drawBuildingEditOptions() {
    const p = this.p;
    const building = this
    const offset = expandPolygon(this.p, building.offsetSitePlanElementCorners, -this.offsetSize / 2);

    p.push();
    p.noFill();
    p.stroke(building.lineColor);
    p.beginShape();
    offset.forEach((corner) => {
      p.vertex(corner.x, corner.y);
    });
    p.endShape(p.CLOSE);

    const nodeR = building.polygonNodeEditMode ? 12 : 10;
    offset.forEach((corner) => {
      const fillHue = building.polygonNodeEditMode ? [250, 220, 80] : [230, 230, 240];
      p.fill(fillHue[0], fillHue[1], fillHue[2]);
      p.stroke(20);
      p.ellipse(corner.x, corner.y, nodeR, nodeR);
    });
    p.pop();


    // Draw the pill shape
    const nEdge = offset.length;
    offset.forEach((corner, i) => {
      const corner2 = offset[(i + 1) % nEdge];

      p.push()
      const mid = getCenterPoint(p, corner, corner2);
      const angle = calculateAngle(corner, corner2);
      p.translate(mid.x, mid.y);
      p.rotate(angle);


      p.fill("#f9fafb");
      p.stroke(0);
      p.rectMode(p.CENTER);
      p.rect(0, 0, 30, 5, 3, 3, 3, 3);

      p.pop();

    })

    // center circle
    p.ellipse(building.center.x, building.center.y, 20, 20)
  }



  drawBuilding() {
    if (this.isInitialized) {

      this.p.push();
      this.p.stroke(this.lineColor);
      this.p.strokeWeight(3);
      this.p.noFill();


      if (this.areaExceeded) {
        // const neonPink = this.p.color(255, 30, 10);
        const neonBlue = this.p.color(0, 0, 255);
        drawNeonShape(this.p, this.sitePlanElementCorners, neonBlue, 30);
      }
      else {

        this.p.beginShape();
        this.sitePlanElementCorners.forEach((corner) => {
          this.p.vertex(corner.x, corner.y);
        })
        this.p.endShape(this.p.CLOSE)

      }
      // this.drawSitePlanElement();

      this.p.pop();





      let minEdgePx = Infinity;
      for (const edge of this.sitePlanElementEdges) {
        minEdgePx = Math.min(minEdgePx, edge.getLineLength());
      }

      if (this.enableBuildingDimensions) {
        this.p.push();
        this.p.textAlign(this.p.CENTER, this.p.BOTTOM);

        const dimTextSize = Number.isFinite(minEdgePx) && minEdgePx < Infinity
          ? this.p.constrain(minEdgePx * 0.22, 8, 14)
          : 14;
        const perpPx = Number.isFinite(minEdgePx) && minEdgePx < Infinity
          ? this.p.constrain(minEdgePx * 0.2, 12, 32)
          : 15;
        const outward = this.buildingDimensionsDisplayedOnTheInside ? 1 : -1;

        this.sitePlanElementEdges.forEach((edge) => {
          this.p.push();
          const mid = edge.getMidpoint();
          const length = edge.getLineLength() * this.scale;

          this.p.noStroke();
          this.p.fill('black');
          this.p.translate(mid.x, mid.y);
          this.p.rotate(edge.calculateAngle());
          this.p.textSize(dimTextSize);

          this.p.text(`${length.toFixed(1)} ft`, 0, outward * perpPx);
          this.p.pop();
        });

        this.p.pop();
      }

      this.entrances.forEach((entrance) => {
        entrance.drawEnterance();
      });

      if (this.showbuildingArea) {
        const areaPx = Number.isFinite(minEdgePx) && minEdgePx < Infinity
          ? this.p.constrain(minEdgePx * 0.2, 9, 16)
          : 16;
        this.p.textSize(areaPx);
        this.p.noStroke();
        this.p.fill('black');
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text(`${this.buildingAreaActual} SQFT`, this.center.x, this.center.y);
      }
    }
  }



  updateEntrances() {
    this.entrances.forEach(entrance => {
      const edge = this.sitePlanElementEdges[entrance.edgeIndex];

      const newX = this.p.lerp(edge.point1.x, edge.point2.x, entrance.lerpPos)
      const newY = this.p.lerp(edge.point1.y, edge.point2.y, entrance.lerpPos)

      // const newVector = entrance.projectFromCenter(this.p.createVector(newX, newY), 10)



      entrance.intersection = this.p.createVector(newX, newY);
      entrance.angle = edge.calculateAngle() - 90;
    })

  }

  buildingLocator(p: p5, building: Building, parking: Parking, property: Property, garbage: Garbage) {
    if (!this.isInitialized) return;
    // If we are inside something, then move in the oppisite direction of its center.

    // OR it should be a mix of the vectors. 
    // const buildingBuffer = expandPolygon(this.p, tempBuildingCorners, 10 / this.scale);



    let isInsideParkingOutline = false;
    let isOutsideBoundary = false;
    let isInsideGarbage = false;


    isInsideParkingOutline = !twoObjectsAreNotColliding(building.sitePlanElementCorners, parking.parkingOutline)

    isOutsideBoundary = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(property.cornerOffsetsFromSetbacks, point) === 1
    }).some(el => el)

    isInsideGarbage = building.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(garbage.sitePlanElementCorners, point) === -1
    }).some(el => el)


    if (isInsideParkingOutline) {
      const newBuildingPosition = moveVector(parking.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      // building.reset();
    }

    if (isInsideGarbage) {
      const newBuildingPosition = moveVector(garbage.center, building.center, 1, true)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      // building.reset();
    }

    if (isOutsideBoundary) {
      const propertyCenter = calculateCentroid(property.cornerOffsetsFromSetbacks);
      const propertyCenterVector = p.createVector(propertyCenter.x, propertyCenter.y)
      const newBuildingPosition = moveVector(propertyCenterVector, building.center, 1, false)
      building.updateCenter(newBuildingPosition.x, newBuildingPosition.y)
      // building.reset();
    }



    // building.center = p.createVector(center.x, center.y);
    p.ellipse(building.center.x, building.center.y, 30, 30)
    this.updateBuildingAreaActual(Math.round(calculateArea(this.sitePlanElementCorners) * this.scale * this.scale))
    this.hasStopped = false;
  }

  updateBuildingAreaActual(area: number) {
    this.buildingAreaActual = area;
    if (area > this.buildingAreaTarget) {
      this.areaExceeded = true;
    }
    else {
      this.areaExceeded = false;
    }
  }

  reset() {
    this.updateheight(10 / this.scale);
    this.updateWidth(10 / this.scale);

    this.entrances = [];
  }

  buildingGrower(property: Property, parking: Parking) {
    type DimensionValue = {
      x: number;
      y: number;
      angle: number;
      width: number;
      height: number;
      corners: p5.Vector[];
    }


    if (!this.isInitialized) return;

    const nudgeStrength = 2;
    // const nudgeStrengthDimensions = 1;
    const angleNudge = .5;
    const possibleDimensions: DimensionValue[] = [];
    const numChildren = 10;

    const defaultDimensions: DimensionValue = {
      x: this.center.x,
      y: this.center.y,
      angle: this.angle,
      width: this.width,
      height: this.height,
      corners: this.sitePlanElementCorners,
    }

    // Initialize the potential children
    for (let i = 0; i < numChildren; i++) {
      possibleDimensions.push(defaultDimensions);
    }

    // const randomNudge = arrayOfRandomNudges(nudgeStrengthDimensions, numChildren * 2);
    const randomAnglesNudge = arrayOfRandomNudges(angleNudge, numChildren);


    // Area needs to be closest to X


    const targetArea = this.buildingAreaTarget / (this.p.pow(this.scale, 2));


    let bestArea = calculateArea(this.sitePlanElementCorners)
    const error = Math.abs(targetArea - bestArea) / targetArea;

    if (error < .0005) {
      this.hasStopped = true
      return;
    }

    let bestAreaIndex = 0;

    // Building should be at lease 20 px away from anything else.


    // create a new variation of each child. Let the first child be an exact clone of the parent
    for (let i = 1; i < numChildren; i++) {
      const randomNudgePosition = arrayOfRandomNudges(nudgeStrength, 4);

      const newDimension = {
        ...possibleDimensions[i],
        width: possibleDimensions[i].width + randomNudgePosition[2],
        height: possibleDimensions[i].height + randomNudgePosition[3],
        x: possibleDimensions[i].x + randomNudgePosition[0],
        y: possibleDimensions[i].y + randomNudgePosition[1],
        angle: possibleDimensions[i].angle + randomAnglesNudge[i]
      };


      const _x = newDimension.x
      const _y = newDimension.y
      const _width = newDimension.width
      const _height = newDimension.height
      const _angle = newDimension.angle
      const tempBuildingCorners = createSitePlanElementCorners(this.p, _x, _y, _width, _height, _angle)



      // check if new points are inside the boundary;

      const tempBuildingCornersBufferForParking = expandPolygon(this.p, tempBuildingCorners, 8 / this.scale);



      // const tempBuildingCornersBufferForBorder = expandPolygon(this.p, tempBuildingCorners, 20 / this.scale);


      /* HIDE, only used to show the offsets  */

      // this.p.beginShape();
      // this.p.fill(150, 240, 55, 50); // Fill color with transparency
      // this.p.stroke(0); // Outline color
      // this.p.strokeWeight(2);

      // tempBuildingCornersBufferForParking.forEach((corner, i) => {
      //   this.p.vertex(corner.x, corner.y);
      // });
      // this.p.endShape(this.p.CLOSE); // Close the polygon

      // this.p.beginShape();
      // this.p.fill(250, 130, 55, 50); // Fill color with transparency
      // this.p.stroke(0); // Outline color
      // this.p.strokeWeight(2);

      // tempBuildingCornersBufferForBorder .forEach((corner, i) => {
      //   this.p.vertex(corner.x, corner.y);
      // });
      // this.p.endShape(this.p.CLOSE); // Close the polygon




      const newPointsAreInBoundary = truthChecker(tempBuildingCorners.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(property.cornerOffsetsFromSetbacks, point) === -1
      }));

      const newPointsAreOutOfParking = truthChecker(tempBuildingCornersBufferForParking.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(parking.sitePlanElementCorners, point) === 1
      }));

      const newPointsAreInBoundaryRight = truthChecker(tempBuildingCornersBufferForParking.map(corner => {
        const point: Point = [corner.x, corner.y];
        return truthChecker(parking.parkingStalls.right.map(stall => {
          return pointsAreInBoundary(stall.stallCorners, point) === 1
        }))
      }));
      const newPointsAreInBoundaryLeft = truthChecker(tempBuildingCornersBufferForParking.map(corner => {
        const point: Point = [corner.x, corner.y];
        return truthChecker(parking.parkingStalls.left.map(stall => {
          return pointsAreInBoundary(stall.stallCorners, point) === 1
        }))
      }));


      const newPointsAreInBoundaryRight2 = truthChecker(parking.parkingStalls.right.map(stall => {
        return truthChecker(stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(tempBuildingCornersBufferForParking, point) === 1
        }))
      }));

      const newPointsAreInBoundaryLeft2 = truthChecker(parking.parkingStalls.left.map(stall => {
        return truthChecker(stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(tempBuildingCornersBufferForParking, point) === 1
        }))
      }));



      if (newPointsAreInBoundary && newPointsAreOutOfParking && newPointsAreInBoundaryRight && newPointsAreInBoundaryLeft && newPointsAreInBoundaryRight2 && newPointsAreInBoundaryLeft2) {
        possibleDimensions[i] = {
          ...possibleDimensions[i],
          ...newDimension
        };

        const area = calculateArea(tempBuildingCorners);
        if (Math.abs(targetArea - area) < Math.abs(targetArea - bestArea)) {
          bestArea = area;
          bestAreaIndex = i;
        }
      }


      if (!newPointsAreInBoundaryRight) {
        // shoot out the opposite direction
      }
    }

    this.updateAngle(possibleDimensions[bestAreaIndex].angle)
    this.updateCenter(possibleDimensions[bestAreaIndex].x, possibleDimensions[bestAreaIndex].y)
    this.updateheight(possibleDimensions[bestAreaIndex].height);
    this.updateWidth(possibleDimensions[bestAreaIndex].width)

    this.updateEntrances()

    this.buildingAreaActual = Math.round(calculateArea(this.sitePlanElementCorners) * this.scale * this.scale);

  }

}
