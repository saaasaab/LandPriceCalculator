import p5 from "p5";
import { ParkingStall } from "./ParkingStall";
import { SitePlanElement } from "./SitePlanElement";
import { Point, SitePlanObjects, stallHeight } from "../SiteplanGenerator";
import { Property } from "./Property";
import { Approach } from "./Approach";
import { allPointsInPolygon, truthChecker, calculateAngle, normalizeAngle, getParkingStallArea, calculateStallPosition, calculateCentroid, pointsAreInBoundary, calculatePointPosition, getAdjacentIndices,  drawPerpendicularBezier } from "../../../utils/SiteplanGeneratorUtils";
import { Garbage } from "./Garbage";

export class Parking extends SitePlanElement {

  public entranceEdgeIndex: number | null;
  public parkingStalls: {
    left: ParkingStall[];
    right: ParkingStall[];
  };
  public scale: number;
  public parkingStallsNumber: number;
  public parkingArea: number;
  public parkingStallsArea: number;
  public handicappedParkingNum: number;
  public parkingOutline: p5.Vector[]
  public parkingOutlineDoubleLayer: p5.Vector[]




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

    this.entranceEdgeIndex = null;
    this.parkingStalls = { left: [], right: [] };
    this.entranceEdgeIndex = 2;
    this.scale = scale;
    this.parkingStallsNumber = 4;
    this.parkingArea = Math.round(width * height);
    this.parkingStallsArea = 0;
    this.handicappedParkingNum = 0;
    this.parkingOutline = []
    this.parkingOutlineDoubleLayer = []
  }

  initializeParking(property: Property, approach: Approach) {
    this.isInitialized = true;
    this.createSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]

    let parkingCount = 0;
    let previousParkingCount = -1;


    while (parkingCount !== previousParkingCount) {

      // Update the parking on initialize
      const newX = this.center.x;
      const newY = this.center.y;
      const centerInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, [this.p.createVector(newX, newY)]);

      if (!truthChecker(centerInBoundary)) { return }

      const angle2 = calculateAngle(this.center, approach.center);
      this.updateAngle(normalizeAngle(angle2 - 90))

      const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, this.sitePlanElementCorners);

      if (truthChecker(allPointsInBoundary)) {

        this.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);

        this.updateStallCorners(true);

        this.updateParkingHeight(property.cornerOffsetsFromSetbacks);

      }
      else {
        this.updateParkingHeight(property.cornerOffsetsFromSetbacks);

      }


      previousParkingCount = parkingCount;
      parkingCount = this.parkingStalls.left.length + this.parkingStalls.right.length


    }


    this.createRotationHandles()
  }

  update() {
    this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.createOffsetPolygon(10);

    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.parkingArea = Math.round(this.width * this.height * this.scale * this.scale);


    this.parkingStallsArea = getParkingStallArea(this)
  }

  drawParkingStalls() {
    this.parkingStalls.right.forEach((stall) => {
      if (!stall.isEmptySlot) {
        stall.drawParkingStall();
      }
    })

    this.parkingStalls.left.forEach((stall) => {
      if (!stall.isEmptySlot) {
        stall.drawParkingStall();
      }
    })
  }




  updateStallCorners(isInit = false, isRotationFrozen = false) {
    if (!this.entranceEdge || !this.previousEntranceEdge) return;

    if (isInit || (
      isRotationFrozen ||
      this.angle !== this.previousAngle ||
      this.entranceEdge.point1.x !== this.previousEntranceEdge.point1.x ||
      this.entranceEdge.point1.y !== this.previousEntranceEdge.point1.y ||

      this.entranceEdge.point2.x !== this.previousEntranceEdge.point2.x ||
      this.entranceEdge.point2.y !== this.previousEntranceEdge.point2.y)) {

      // OH NO, SOMETHING CHANGED

      for (let i = 0; i < this.parkingStalls.left.length; i++) {
        // Update the points


        // const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p,  this.entranceEdge, this.angle, this.parkingStalls);
        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.left, "left", i, this.scale)

        const _center = calculateCentroid(updatedPoints);
        this.parkingStalls.left[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.left[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.left[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.left[i].stallCorners[3] = updatedPoints[3]
        this.parkingStalls.left[i].center.x = _center.x
        this.parkingStalls.left[i].center.y = _center.y
        this.parkingStalls.left[i].angle = this.angle




      }

      for (let i = 0; i < this.parkingStalls.right.length; i++) {
        // update the points

        const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.right, "right", i, this.scale)

        const _center = calculateCentroid(updatedPoints);
        this.parkingStalls.right[i].stallCorners[0] = updatedPoints[0]
        this.parkingStalls.right[i].stallCorners[1] = updatedPoints[1]
        this.parkingStalls.right[i].stallCorners[2] = updatedPoints[2]
        this.parkingStalls.right[i].stallCorners[3] = updatedPoints[3]
        this.parkingStalls.right[i].center.x = _center.x
        this.parkingStalls.right[i].center.y = _center.y
        this.parkingStalls.right[i].angle = this.angle
      }


      this.previousEntranceEdge.point1.x = this.entranceEdge.point1.x;
      this.previousEntranceEdge.point1.y = this.entranceEdge.point1.y;
      this.previousEntranceEdge.point2.x = this.entranceEdge.point2.x;
      this.previousEntranceEdge.point2.y = this.entranceEdge.point2.y;
      this.previousAngle = this.angle;
    }
  }

  updateParkingHeight(propertyCorners: p5.Vector[]) {
    // Take a snapshot to revert
    const maxParkingStalls = Math.max(this.parkingStalls.left.length, this.parkingStalls.right.length);

    const garbageHeight = 5 / this.scale / 2;

    this.updateheight(maxParkingStalls * stallHeight / this.scale + garbageHeight);


    let parkingNotFit = true;
    let recalcCount = 1;
    while (parkingNotFit && maxParkingStalls - recalcCount > 0) {

      // Should check with ALL the boundaries
      const allIn = this.sitePlanElementCorners.map(corner => {
        const point: Point = [corner.x, corner.y];
        return pointsAreInBoundary(propertyCorners, point) === -1
      });


      if (truthChecker(allIn)) {
        parkingNotFit = false;
      }


      else {
        if (this.parkingStalls.left.length >= maxParkingStalls - recalcCount) {
          this.parkingStalls.left.pop();
        }
        if (this.parkingStalls.right.length >= maxParkingStalls - recalcCount) {
          this.parkingStalls.right.pop();
        }

        this.updateheight((maxParkingStalls - recalcCount) * stallHeight / this.scale + garbageHeight);
        recalcCount++
      }
    }
  }

  updateParkingStallsNumber(property: Property, parkingNum: number) {
    this.parkingStallsNumber = parkingNum

    this.calculateNumberOfFittableStalls(property.propertyCorners)
    this.updateStallCorners(true);
    this.updateParkingHeight(property.cornerOffsetsFromSetbacks);
  }

  calculateNumberOfFittableStalls(propertyCorners: p5.Vector[]) {
    const maxNumStalls = this.parkingStallsNumber;

    const entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0];
    const parkingAngle = this.angle;


    const leftStallsToEmpty: number[] = []
    const rightStallsToEmpty: number[] = []

    // When a parking stall goes out of bounds, remove that stall
    Object.keys(this.parkingStalls).forEach(side =>
      this.parkingStalls[side as ("left" | "right")].forEach((stall, i) => {

        // Just reset the slots since we're checking anyway.
        stall.isEmptySlot = false;
        const allIn = stall.stallCorners.map(corner => {
          const point: Point = [corner.x, corner.y];
          return pointsAreInBoundary(propertyCorners, point) === -1
        });


        if (!truthChecker(allIn)) {
          if (side === "left") leftStallsToEmpty.push(i);
          if (side === "right") rightStallsToEmpty.push(i);
        }
      })
    )

    if (leftStallsToEmpty.length > 0 || rightStallsToEmpty.length > 0) {
      leftStallsToEmpty.forEach(indexToBeEmptied => {
        this.parkingStalls.left[indexToBeEmptied].isEmptySlot = true;
      })
      rightStallsToEmpty.forEach(indexToBeEmptied => {
        this.parkingStalls.right[indexToBeEmptied].isEmptySlot = true;
      })


      // const _removedLeft = removeItemsByIndices(this.parkingStalls.left, leftStallsToEmpty);
      // const _removedRight = removeItemsByIndices(this.parkingStalls.right, rightStallsToEmpty);

      // this.parkingStalls.left = _removedLeft;
      // this.parkingStalls.right = _removedRight;
    }


    const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p, entranceEdge, parkingAngle, this.parkingStalls, this.scale);

    // Expand the parking size

    const sideNumber = getAdjacentIndices(this.entranceEdgeIndex || 0, propertyCorners.length);

    // check if new points are inside the boundary;
    const newPointsAreInBoundaryRight = stallCornerRight.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(propertyCorners, point) === -1
    });

    const newPointsAreInBoundaryLeft = stallCornerLeft.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(propertyCorners, point) === -1
    });

    // this.updateSitePlanElementEdges();

    const updatedParkingLotIsInBoundary = this.sitePlanElementCorners.map(corner => {
      const point: Point = [corner.x, corner.y];
      return pointsAreInBoundary(propertyCorners, point) === -1
    });


    // AND CHECK IF THE NEW PARKING LOT IS IN BOUNDS TOO. 
    // For left, use right [1]
    // For right, use left [1]


    if (truthChecker(newPointsAreInBoundaryRight) && this.parkingStalls.right.length < maxNumStalls) {

      const center = calculateCentroid(stallCornerRight)
      const newParkingStall = new ParkingStall(this.p, sideNumber[1], this.parkingStalls.right.length + 1, this.angle, stallCornerRight, entranceEdge, this.scale, 1.5, this.p.createVector(center.x, center.y));
      this.parkingStalls.right.push(newParkingStall);
    }

    if (truthChecker(newPointsAreInBoundaryLeft) && this.parkingStalls.left.length < maxNumStalls) {
      const center = calculateCentroid(stallCornerLeft)

      const newParkingStall = new ParkingStall(this.p, sideNumber[0], this.parkingStalls.left.length + 1, this.angle, stallCornerLeft, entranceEdge, this.scale, -1.5, this.p.createVector(center.x, center.y));
      this.parkingStalls.left.push(newParkingStall);
    }


    if (!truthChecker(updatedParkingLotIsInBoundary)) {
    }
  }


  drawParkingOutline(p: p5, parking: Parking, garbage: Garbage, approach: Approach) {
    if (!parking.entranceEdge && !garbage) return;
    // This is going counter clockwise

    const rightStalls = parking.parkingStalls.right.filter(stall => !stall.isEmptySlot);
    const leftStalls = parking.parkingStalls.left.filter(stall => !stall.isEmptySlot);

    const firstRightStall = rightStalls[0]
    const lastRightStall = rightStalls[rightStalls.length - 1]

    const firstLeftStall = leftStalls[0]
    const lastLeftStall = leftStalls[leftStalls.length - 1];

    const parkingOutline = [
      approach.sitePlanElementCorners[2],
      approach.sitePlanElementCorners[1],
      parking.sitePlanElementCorners[2],
    ]

    if (rightStalls.length > 0) {
      parkingOutline.push(
        firstRightStall.stallCorners[0],
        firstRightStall.stallCorners[3],
        lastRightStall.stallCorners[2],
        lastRightStall.stallCorners[1],
      )
    }


    parkingOutline.push(
      parking.sitePlanElementCorners[1],
      garbage.sitePlanElementCorners[2],
      garbage.sitePlanElementCorners[1],
      garbage.sitePlanElementCorners[0],
      garbage.sitePlanElementCorners[3],
      parking.sitePlanElementCorners[0],
    )

    if (leftStalls.length > 0) {
      parkingOutline.push(
        lastLeftStall.stallCorners[1],
        lastLeftStall.stallCorners[2],
        firstLeftStall.stallCorners[3],
        firstLeftStall.stallCorners[0],
      )

    }

    parkingOutline.push(
      parking.sitePlanElementCorners[3],
      approach.sitePlanElementCorners[0],
      approach.sitePlanElementCorners[3],
    )

    // Set the this.parkingOutline to the inner layer before the offset is created. 
    this.parkingOutline = parkingOutline;


    // Keep this for double the lines
    // const offsetParking = expandPolygon(this.p, parkingOutline, -5);
    // const points = [...offsetParking, ...parkingOutline.reverse()];
    const points = [...parkingOutline];

    this.parkingOutlineDoubleLayer = points;






    // Double stroke
    p.push();
    p.beginShape();
    p.noFill();
    // p.fill(120, 120, 120, 150); // Fill color with transparency
    p.stroke(this.lineColor); // Outline color
    p.strokeWeight(1.5);
    p.textSize(10)

    // const entranceEdge1 = new Edge(p, parkingOutline[0], parkingOutline[1], false, 0)
    // const parkingEdge1 = parking.sitePlanElementEdges[1]

    points.forEach((corner, i) => {

      // inside Right Parking
      if (i === 1 && parking.entranceEdge) {
        drawPerpendicularBezier(
          p,
          approach.sitePlanElementCorners[1],
          parking.entranceEdge.point1,
          approach.sitePlanElementEdges[2],
          parking.entranceEdge,
          true
        );

      }

      else if (i === points.length - 3 && parking.entranceEdge) {
        drawPerpendicularBezier(
          p,
          parking.entranceEdge.point2,
          approach.sitePlanElementCorners[0],
          parking.entranceEdge,
          approach.sitePlanElementEdges[2],
          false
        );
      }

      else {
        p.vertex(corner.x, corner.y);
        // p.text(i, corner.x, corner.y);
      }

    });
    p.endShape(p.CLOSE); // Close the polygon
    p.pop();

  }
}