import p5 from "p5";
import { ParkingStall } from "./ParkingStall";
import { SitePlanElement } from "./SitePlanElement";
import { Property } from "./Property";
import { Approach } from "./Approach";
import { allPointsInPolygon, truthChecker, calculateAngle, normalizeAngle, getParkingStallArea, calculateStallPosition, calculateCentroid, pointsAreInBoundary, calculatePointPosition, getAdjacentIndices, drawPerpendicularBezier, countParkingStalls, initialFormData } from "../../../utils/SiteplanGeneratorUtils";
import { Garbage } from "./Garbage";
import { Point, SitePlanObjects, stallHeight } from "../sketchForSiteplan";

export class Parking extends SitePlanElement {

  public entranceEdgeIndex: number | null;
  public parkingStalls: {
    left: ParkingStall[];
    right: ParkingStall[];
  };
  public scale: number;
  public parkingArea: number;
  public parkingStallsArea: number;
  public parkingOutline: p5.Vector[]
  public parkingOutlineDoubleLayer: p5.Vector[]



  // Input Constraints
  public parkingStallsNumber: number;
  public handicappedParkingNum: number;
  public compactParkingNum: number;
  public parkingPer1000Max: number;
  public parkingPer1000Min: number;
  public offStreetParkingRequired: number;
  public parkingPerUnit: number;
  public landscapeIsland: number;
  public halfStreetDriveway: boolean;
  public parkingSide: 'left' | 'right';
  public showDrivewayControlPoints: boolean;



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
    this.parkingArea = Math.round(width * height);
    this.parkingStallsArea = 0;
    this.parkingOutline = []
    this.parkingOutlineDoubleLayer = []



    // Input Constraints
    this.parkingStallsNumber = initialFormData.parkingStalls;
    this.handicappedParkingNum = initialFormData.handicappedParkingStalls;
    this.compactParkingNum = initialFormData.compactParkingStalls;
    this.parkingPer1000Max = initialFormData.parkingPer1000Max;
    this.parkingPer1000Min = initialFormData.parkingPer1000Min;
    this.parkingPerUnit = initialFormData.parkingPerUnit;
    this.parkingPer1000Min = initialFormData.parkingPerUnit;
    this.landscapeIsland = initialFormData.landscapeIsland;
    this.halfStreetDriveway = initialFormData.halfStreetDriveway;
    this.parkingSide = initialFormData.parkingSide;
    this.showDrivewayControlPoints = initialFormData.showDrivewayControlPoints;
    this.offStreetParkingRequired = initialFormData.offStreetParkingRequired;


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


    // Check if the parking stalls are more than allowed
    // const stallCounts = countParkingStalls(this)
    // if (stallCounts.leftStalls + stallCounts.rightStalls > this.parkingStallsNumber) {
    //   if (stallCounts.leftStalls > stallCounts.rightStalls) {

    //   }
    // }
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


  drawParkingOutline(p: p5, property: Property | null, parking: Parking, garbage: Garbage, approach: Approach) {
    if (!parking.entranceEdge && !garbage) return;
    // This is going counter clockwise

    const rightStalls = parking.parkingStalls.right.filter(stall => !stall.isEmptySlot);
    const leftStalls = parking.parkingStalls.left.filter(stall => !stall.isEmptySlot);

    const firstRightStall = rightStalls[0]
    const lastRightStall = rightStalls[rightStalls.length - 1]

    const firstLeftStall = leftStalls[0]
    const lastLeftStall = leftStalls[leftStalls.length - 1];

    const offsetDistance = p.max((parking.width - approach.width) / 2, 0);



    const parkingOutline = [
      approach.sitePlanElementCorners[2],  //Pointing in, the right hand side on the outside
      approach.sitePlanElementCorners[1],//Pointing in, the right hand side on the inside
    ]


    // IF THE DRIVEWAY IS NOT TAPERED, ADD ANOTHER POINT HERE
    // *

    if (!property?.taperedDriveway) {

      const midpoint = parking.sitePlanElementEdges[2].getMidpoint(); //.entranceEdge?
      const position = parking.sitePlanElementCorners[2]
      const angle = calculateAngle(position, midpoint);

      if (midpoint) {

        const point = p.createVector(
          position.x + p.cos(angle) * offsetDistance,
          position.y + p.sin(angle) * offsetDistance
        )

        parkingOutline.push(p.createVector(point.x, point.y))
        // p.ellipse(point.x, point.y, 10, 10);
        // p.ellipse(midpoint.x, midpoint.y, 5, 5);
        // p.stroke('blue');
        // p.ellipse(position.x, position.y, 5, 5);
      }
    }


    parkingOutline.push(parking.sitePlanElementCorners[2]); // Bottom-right corner - right of the driveway

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
    )

    if (!property?.taperedDriveway) {

      const midpoint = parking.sitePlanElementEdges[2].getMidpoint(); //.entranceEdge?
      const position = parking.sitePlanElementCorners[3]


      const angle = calculateAngle(position, midpoint);

      if (midpoint) {
        // const offsetDistance = p.abs(parking.width - approach.width) / 2
        const point = p.createVector(
          position.x + p.cos(angle) * offsetDistance,
          position.y + p.sin(angle) * offsetDistance
        );

        parkingOutline.push(p.createVector(point.x, point.y));
        // p.ellipse(point.x, point.y, 10, 10);
        // p.ellipse(midpoint.x, midpoint.y, 5, 5);
        // p.stroke('blue');
        // p.ellipse(position.x, position.y, 5, 5);


      }
    }


    parkingOutline.push(
      approach.sitePlanElementCorners[0],
      approach.sitePlanElementCorners[3],
    );

    // Set the this.parkingOutline to the inner layer before the offset is created. 
    this.parkingOutline = parkingOutline;


    // Keep this for double the lines
    // const offsetParking = expandPolygon(this.p, parkingOutline, -5);
    // const points = [...offsetParking, ...parkingOutline.reverse()];
    const points = [...parkingOutline];

    // this.parkingOutlineDoubleLayer = points;


    // Double stroke
    p.push();
    p.beginShape();
    p.noFill();
    // p.fill(120, 120, 120, 150); // Fill color with transparency
    p.stroke(this.lineColor); // Outline color
    p.strokeWeight(1.5);
    p.textSize(10)


    points.forEach((corner, i) => {

      // inside Right Parking
      if (i === 2 && parking.entranceEdge) {
        drawPerpendicularBezier(
          p,
          parkingOutline[1],
          parkingOutline[2],
          approach.sitePlanElementEdges[2],
          parking.entranceEdge,
          true,
        this.showDrivewayControlPoints,

        );
        // p.text(i, corner.x, corner.y);
        p.vertex(corner.x, corner.y);


      }

      else if (i === points.length - 2 && parking.entranceEdge) {
        drawPerpendicularBezier(
          p,
          parkingOutline[parkingOutline.length - 3],
          parkingOutline[parkingOutline.length - 2],
          parking.entranceEdge,
          approach.sitePlanElementEdges[2],
          false,
          this.showDrivewayControlPoints,
        );
        // p.text(i, corner.x, corner.y);
        p.vertex(corner.x, corner.y);
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