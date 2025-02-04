import p5 from "p5";
import classifyPoint from "robust-point-in-polygon"

import { ParkingStall } from "./ParkingStall";
import { SitePlanElement } from "./SitePlanElement";
import { Property } from "./Property";
import { Approach } from "./Approach";
import { allPointsInPolygon, truthChecker, calculateAngle, normalizeAngle, getParkingStallArea, calculateStallPosition, calculateCentroid, pointsAreInBoundary, calculatePointPosition, getAdjacentIndices, drawPerpendicularBezier, initialFormData, allPointsOutOfPolygon, getStallHeight } from "../../../utils/SiteplanGeneratorUtils";
import { Garbage } from "./Garbage";
import { compactStallHeight, handicappedStallHeight, normalStallHeight, Point, SitePlanObjects } from "../sketchForSiteplan";
import { Edge } from "./Edge";
import { BuildingsGroup } from "./BuildingsGroup";
import { Building } from "./Building";



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
  public handicappedParkingNumActual: number;
  public compactParkingCountActual: number;


  // Input Constraints
  public parkingStallsNumber: number;
  public handicappedParkingNumTarget: number;
  public compactParkingCountTarget: number;
  public parkingPer1000Max: number;
  public parkingPer1000Min: number;
  public offStreetParkingRequired: number;
  public parkingPerUnit: number;
  public landscapeIsland: number;
  public halfStreetDriveway: boolean;
  public parkingSide: 'left' | 'right';
  public showDrivewayControlPoints: boolean;


  // Constants for stall types
  public STALL_TYPES = {
    STANDARD: { width: 17, height: 8.5 }, // Regular spot size
    COMPACT: { width: 17, height: 8 }, // Compact spot size
    HANDICAPPED: { width: 17, height: 17 } // Handicapped spot size
  };

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
    this.handicappedParkingNumActual = 0;
    this.compactParkingCountActual = 0;


    // Input Constraints
    this.parkingStallsNumber = initialFormData.parkingStalls;
    this.handicappedParkingNumTarget = initialFormData.handicappedParkingStalls;
    this.compactParkingCountTarget = initialFormData.compactParkingStalls;
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

    // Create a fully empty parking lot with the default item, "normal" stall. The lot size should be 
    // this.parkingStallsNumber  long on each side plus a garbage enclosure at the end.
    this.createFullEmptyParkingLot();
  }




  createFullEmptyParkingLot() {
    this.compactParkingCountActual = 0;
    this.handicappedParkingNumActual = 0;
    this.parkingStalls.left = [];
    this.parkingStalls.right = [];

    // RIGHT is point 1
    // LEFT is point 2
    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    const type = "normal";
    const stallHeight = getStallHeight(type)


    if (this.parkingStallsNumber === 0) return


    // NEED TO MANUALLY CREATE THE FIRST ONE
    // Calculate the first row's parking spots;
    // LEFT side stall edges go clockwise
    // RIGHT side stall edges go counterclockwise

    // LeftSide
    const point0 = this.entranceEdge.point2;
    const point3 = this.entranceEdge.createPerpendicularPointAtDistance(this.p, point0, -stallHeight / this.scale)
    const edge3To0 = new Edge(this.p, point3, point0, false, 0, 0,)
    const point1 = edge3To0.createPerpendicularPointAtDistance(this.p, point0, -17 / this.scale)
    const edge0To1 = new Edge(this.p, point0, point1, false, 0, 1,)
    const point2 = edge0To1.createPerpendicularPointAtDistance(this.p, point1, -stallHeight / this.scale)
    const points = [point0, point1, point2, point3];
    const center = calculateCentroid(points)
    const newParkingStall = new ParkingStall(this.p, 0, this.angle, points, this.entranceEdge, this.scale, -1.5, this.p.createVector(center.x, center.y), type);
    this.parkingStalls.left.push(newParkingStall);


    // RightSide
    const pointRight0 = this.entranceEdge.point1;
    const pointRight3 = this.entranceEdge.createPerpendicularPointAtDistance(this.p, pointRight0, -stallHeight / this.scale)
    const edge3To0Right = new Edge(this.p, pointRight3, pointRight0, false, 0, 0,)
    const pointRight1 = edge3To0Right.createPerpendicularPointAtDistance(this.p, pointRight0, 17 / this.scale)
    const edge0To1Right = new Edge(this.p, pointRight0, pointRight1, false, 0, 1,)
    const pointRight2 = edge0To1Right.createPerpendicularPointAtDistance(this.p, pointRight1, stallHeight / this.scale)
    const pointsRight = [pointRight0, pointRight1, pointRight2, pointRight3];
    const centerRight = calculateCentroid(pointsRight);
    const newParkingStallRight = new ParkingStall(this.p, 0, this.angle, pointsRight, this.entranceEdge, this.scale, 1.5, this.p.createVector(centerRight.x, centerRight.y), type);

    this.parkingStalls.right.push(newParkingStallRight);
    for (let i = 1; i < this.parkingStallsNumber; i++) {

      // LeftSide
      const point0 = this.parkingStalls.left[i-1].stallCorners[3];

      const point3 = this.entranceEdge.createPerpendicularPointAtDistance(this.p, point0, -stallHeight / this.scale)
      const edge3To0 = new Edge(this.p, point3, point0, false, 0, 0)
      const point1 = edge3To0.createPerpendicularPointAtDistance(this.p, point0, -17 / this.scale)
      const edge0To1 = new Edge(this.p, point0, point1, false, 0, 1)
      const point2 = edge0To1.createPerpendicularPointAtDistance(this.p, point1, -stallHeight / this.scale)
      const points = [point0, point1, point2, point3];
      const center = calculateCentroid(points);

      
      const newParkingStall = new ParkingStall(this.p, i, this.angle, points, this.entranceEdge, this.scale, -1.5, this.p.createVector(center.x, center.y), type);
      this.parkingStalls.left.push(newParkingStall);


      // RightSide
      const pointRight0 = this.parkingStalls.right[i-1].stallCorners[3];
      const pointRight3 = this.entranceEdge.createPerpendicularPointAtDistance(this.p, pointRight0, -stallHeight / this.scale)
      const edge3To0Right = new Edge(this.p, pointRight3, pointRight0, false, 0, 0);
      const pointRight1 = edge3To0Right.createPerpendicularPointAtDistance(this.p, pointRight0, 17 / this.scale)
      const edge0To1Right = new Edge(this.p, pointRight0, pointRight1, false, 0, 1);
      const pointRight2 = edge0To1Right.createPerpendicularPointAtDistance(this.p, pointRight1, stallHeight / this.scale)
      const pointsRight = [pointRight0, pointRight1, pointRight2, pointRight3];
      const centerRight = calculateCentroid(pointsRight);
      
      
      const newParkingStallRight = new ParkingStall(this.p, i, this.angle, pointsRight, this.entranceEdge, this.scale, 1.5, this.p.createVector(centerRight.x, centerRight.y), type);
      this.parkingStalls.right.push(newParkingStallRight);
    }

    const maxParkingStalls = Math.max(this.parkingStalls.left.length, this.parkingStalls.right.length);

    const garbageHeight = 8 / this.scale / 2;
    this.updateheight(maxParkingStalls * normalStallHeight / this.scale + garbageHeight);
  }




  reCreateStallPoints(startRow: number) {
    // RIGHT is point 1
    // LEFT is point 2
    if (!this.entranceEdge) return;


    for (let i = startRow; i < this.parkingStallsNumber; i++) {
      const typeLeft = this.parkingStalls.left[i].parkingStallType;
      const typeRight = this.parkingStalls.right[i].parkingStallType
      const heightLeft = getStallHeight(typeLeft)
      const heightRight = getStallHeight(typeRight)

      // LeftSide


      const point0 = i === 0? this.parkingStalls.left[i].stallCorners[0]: this.parkingStalls.left[i-1].stallCorners[3];

      const point3 = this.entranceEdge.createPerpendicularPointAtDistance(this.p, point0, -heightLeft / this.scale)
      const edge3To0 = new Edge(this.p, point3, point0, false, 0, 0)
      const point1 = edge3To0.createPerpendicularPointAtDistance(this.p, point0, -17 / this.scale)
      const edge0To1 = new Edge(this.p, point0, point1, false, 0, 1)
      const point2 = edge0To1.createPerpendicularPointAtDistance(this.p, point1, -heightLeft / this.scale)
      const points = [point0, point1, point2, point3];

      const center = calculateCentroid(points);



      this.parkingStalls.left[i].stallCorners[0] = point0;
      this.parkingStalls.left[i].stallCorners[1] = point1;
      this.parkingStalls.left[i].stallCorners[2] = point2;
      this.parkingStalls.left[i].stallCorners[3] = point3;
      this.parkingStalls.left[i].center = this.p.createVector(center.x, center.y);


      // RightSide
      const pointRight0 = i === 0? this.parkingStalls.right[i].stallCorners[0]:this.parkingStalls.right[i-1].stallCorners[3];

      const pointRight3 = this.entranceEdge.createPerpendicularPointAtDistance(this.p, pointRight0, -heightRight / this.scale)
      const edge3To0Right = new Edge(this.p, pointRight3, pointRight0, false, 0, 0);
      const pointRight1 = edge3To0Right.createPerpendicularPointAtDistance(this.p, pointRight0, 17 / this.scale)
      const edge0To1Right = new Edge(this.p, pointRight0, pointRight1, false, 0, 1);
      const pointRight2 = edge0To1Right.createPerpendicularPointAtDistance(this.p, pointRight1, heightRight / this.scale)
      const pointsRight = [pointRight0, pointRight1, pointRight2, pointRight3];
      const centerRight = calculateCentroid(pointsRight);


      // if (i === 3) {
      //   this.p.ellipse(centerRight.x, centerRight.y, 10, 10);
      //   this.p.ellipse(pointRight0.x, pointRight0.y, 10, 10);
      //   this.p.ellipse(pointRight1.x, pointRight1.y, 10, 10);
      //   this.p.ellipse(pointRight2.x, pointRight2.y, 10, 10);
      //   this.p.ellipse(pointRight3.x, pointRight3.y, 10, 10);
      // }
      this.parkingStalls.right[i].stallCorners[0] = pointRight0;
      this.parkingStalls.right[i].stallCorners[1] = pointRight1;
      this.parkingStalls.right[i].stallCorners[2] = pointRight2;
      this.parkingStalls.right[i].stallCorners[3] = pointRight3;
      this.parkingStalls.right[i].center = this.p.createVector(centerRight.x, centerRight.y);
    }
  }


  allPointsInPolygon(boundary: p5.Vector[], poly: p5.Vector[]): boolean {
    return poly.every((corner) => {
      const point: Point = [corner.x, corner.y];
      const pointClassification = classifyPoint(
        boundary.map(corner => [corner.x, corner.y]) as Point[],
        point
      );

      return pointClassification === -1; // True only if ALL points are inside
    });
  }

  assignEmptyStatus(property: Property, buildings: Building[] | null | undefined) {

    Object.keys(this.parkingStalls).forEach(key => {
      const value = this.parkingStalls[key as "left" | "right"];

      value.forEach(stall => {
        const allInProperty = this.allPointsInPolygon(property.cornerOffsetsFromSetbacks, stall.stallCorners);

        const allOutOfBuildings1 = buildings?.map(building => {
          const allOutOfBuilding = allPointsOutOfPolygon(building.sitePlanElementCorners, stall.stallCorners);
          return truthChecker(allOutOfBuilding);
        })

        const allOutOfBuildings2 = buildings?.map(building => {
          const allOutOfBuilding = allPointsOutOfPolygon(stall.stallCorners, building.sitePlanElementCorners);
          return truthChecker(allOutOfBuilding);
        })

        if (!allInProperty || !truthChecker(allOutOfBuildings1 || []) || !truthChecker(allOutOfBuildings2 || [])) {
          stall.isEmptySlot = true;
        } else {
          stall.isEmptySlot = false;
        }
      });
    })
  }

  assignStallTypes(i: number) {
    // Start with the left side,
    const stallLeft = this.parkingStalls.left[i];


    if (!stallLeft.isEmptySlot) {
      // Check for handicapped.

      // This is where I will put landscape.
      // Then add handicapped
      if (this.handicappedParkingNumActual < this.handicappedParkingNumTarget) {
        stallLeft.parkingStallType = "handicapped";
        this.handicappedParkingNumActual++;

      }
      else if (this.compactParkingCountActual < this.compactParkingCountTarget) {
        stallLeft.parkingStallType = "compact";
        this.compactParkingCountActual++;
      }
    }



    // Work on the right side next,
    const stallRight = this.parkingStalls.right[i];

    if (!stallRight.isEmptySlot) {
      // Check for handicapped.

      // This is where I will put landscape.
      // Then add handicapped
      if (this.handicappedParkingNumActual < this.handicappedParkingNumTarget) {
        stallRight.parkingStallType = "handicapped";
        this.handicappedParkingNumActual++;
      }

      else if (this.compactParkingCountActual < this.compactParkingCountTarget) {
        stallRight.parkingStallType = "compact";
        this.compactParkingCountActual++;
      }
    }
  }


  updateParkingLot(property: Property, buildings: Building[] | null | undefined) {
    const garbageHeight = 8 / this.scale / 2;

    // 1. Start with full lot, this.parkingStallsNumber on each side and garbage at the top
    this.createFullEmptyParkingLot();
    // this.reCreateStallPoints(0)

    // 2. Go through all the stalls, and mark as unaccessible for all that are out of the boundary or inside a building
    this.assignEmptyStatus(property, buildings);


    // 3. Start asigning each stall as garbage, handicapped, island, compact, or normal,
    for (let i = 0; i < this.parkingStallsNumber; i++) {
      this.assignStallTypes(i);



      // 4. When a spot is assigned, reevaluate the avaiable spots. 
      this.reCreateStallPoints(i);
      // 5. Fill out from the bottom with handicapped groupped on the same side and sharing a drive isle
      // 6. Left then right zigzagging. 
      // this.assignEmptyStatus(property, buildings);
    }

    let largestSide = 0;
    for (const [_key, value] of Object.entries(this.parkingStalls)) {
      const sum = value.map(stall => getStallHeight(stall.parkingStallType)).reduce((partialSum, a) => partialSum + a, 0)
      if (sum > largestSide) largestSide = sum;
    }

    console.log(this.parkingStalls)

    this.updateheight(largestSide / this.scale + garbageHeight);

    this.entranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]
    this.previousEntranceEdge = this.sitePlanElementEdges[this.entranceEdgeIndex || 0]


    // this.updateStallCorners()
    // this.updateSitePlanElementCorners();
    this.setSitePlanElementEdges();
    this.createOffsetPolygon(10);

    this.createRotationHandles();

    this.parkingArea = Math.round(this.width * this.height * this.scale * this.scale);
    this.parkingStallsArea = getParkingStallArea(this)

  }


  drawParkingStalls() {
    this.p.push();
    this.parkingStalls.right.forEach((stall, i) => {
      if (!stall.isEmptySlot) {
        this.p.text(i, stall.center.x, stall.center.y)
        stall.drawParkingStall();
      }
    })

    this.parkingStalls.left.forEach((stall, i) => {
      if (!stall.isEmptySlot) {
        this.p.text(i, stall.center.x, stall.center.y)

        stall.drawParkingStall();
      }
    })
    this.p.pop();
  }

  updateStallCorners(isInit = false, isRotationFrozen = false) {
    if (!this.entranceEdge || !this.previousEntranceEdge) return;




    // if (isInit || (
    //   isRotationFrozen ||
    //   this.angle !== this.previousAngle ||
    //   this.entranceEdge.point1.x !== this.previousEntranceEdge.point1.x ||
    //   this.entranceEdge.point1.y !== this.previousEntranceEdge.point1.y ||

    //   this.entranceEdge.point2.x !== this.previousEntranceEdge.point2.x ||
    //   this.entranceEdge.point2.y !== this.previousEntranceEdge.point2.y)) {

    // OH NO, SOMETHING CHANGED

    for (let i = 0; i < this.parkingStalls.left.length; i++) {
      // Update the points

      const stallType = this.parkingStalls.left[i].parkingStallType;

      // const { left: stallCornerLeft, right: stallCornerRight } = calculatePointPosition(this.p,  this.entranceEdge, this.angle, this.parkingStalls);
      const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.left, "left", i, this.scale, stallType)

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
      const stallType = this.parkingStalls.left[i].parkingStallType;

      const updatedPoints = calculateStallPosition(this.p, this.entranceEdge, this.angle, this.parkingStalls.right, "right", i, this.scale, stallType)

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
    // }
  }

  updateParkingHeight(propertyCorners: p5.Vector[]) {
    // Take a snapshot to revert
    const maxParkingStalls = Math.max(this.parkingStalls.left.length, this.parkingStalls.right.length);

    const garbageHeight = 5 / this.scale / 2;

    this.updateheight(maxParkingStalls * normalStallHeight / this.scale + garbageHeight);


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


        this.updateheight((maxParkingStalls - recalcCount) * normalStallHeight / this.scale + garbageHeight);
        recalcCount++
      }
    }
  }

  updateParkingGlobals(property: Property, parkingNum: number, buildings: Building[] | null | undefined) {
    //  USED WHEN UPDATING GLOBAL VARIABLES
    if (this.parkingStallsNumber !== parkingNum) {

      this.parkingStallsNumber = parkingNum

      this.updateParkingLot(property, buildings);

    }
  }

  drawParkingOutline(p: p5, property: Property | null, parking: Parking, garbage: Garbage, approach: Approach) {
    p.line(this.entranceEdge?.point1.x || 0, this.entranceEdge?.point1.y || 0, this.entranceEdge?.point2.x || 0, this.entranceEdge?.point2.y || 0)

    p.ellipse(this.entranceEdge?.point1.x || 0, this.entranceEdge?.point1.y || 0, 10, 10)
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

      parking.sitePlanElementCorners[1]
    )

    if (property?.hasGarbageEnclosure) {
      parkingOutline.push(
        garbage.sitePlanElementCorners[2],
        garbage.sitePlanElementCorners[1],
        garbage.sitePlanElementCorners[0],
        garbage.sitePlanElementCorners[3]
      )
    }

    parkingOutline.push(
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