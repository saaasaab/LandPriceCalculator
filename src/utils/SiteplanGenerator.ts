import p5 from "p5";
import classifyPoint from "robust-point-in-polygon"
import { VisibilityGraph } from "../pages/VisibilityGraph";
import { calculateAngle, normalizeAngle, getCenterPoint, allPointsInPolygon, truthChecker, getParkingStallArea, calculateCentroid, pointsAreInBoundary, getAdjacentIndices, rotateCorners, getIsClockwise, getReversedIndex, scalePolygonToFitCanvas, calculateDrivewayArea, runVisibilityGraphSolver, isMoreVertical, calculateApproachArea, findClosestEdge, calculatePointToEdgeDistance, createDriveway, getIntersectionPercentage } from "./SiteplanGeneratorUtils";
import { IPoint, Line } from "../pages/SiteplanDesigner/SitePlanDesigner";
import RotateArrow from "../assets/rotateArrow.png"
import { Property } from "../pages/SiteplanDesigner/SitePlanClasses/Property";
import { Parking } from "../pages/SiteplanDesigner/SitePlanClasses/Parking";
import { Building } from "../pages/SiteplanDesigner/SitePlanClasses/Building";
import { Garbage } from "../pages/SiteplanDesigner/SitePlanClasses/Garbage";
import { Approach } from "../pages/SiteplanDesigner/SitePlanClasses/Approach";
import { Entrance } from "../pages/SiteplanDesigner/SitePlanClasses/Entrance";

export type Point = [number, number];
export type SitePlanObjects = "Parking1" | "Parking2" | "Driveway" | "Bike Parking" | "Approach" | "Garbage" | "Building" | "ParkingWay";
export enum ESitePlanObjects {
  ParkingWay = "ParkingWay",
  Parking1 = "Parking1",
  Parking2 = "Parking2",
  Driveway = "Driveway",
  BikeParking = "Bike Parking",
  Approach = "Approach",
  Garbage = "Garbage",
  Building = "Building"
}
export const stallWidth = 17;
export const stallHeight = 8.5;



// Visualization module using p5.js
export class SiteplanGenerator {

  public points: IPoint[];
  public lines: Line[];
  public scale: number;
  public parkingNum: number;
  public drivewayArea: number;
  public property: Property | null;
  public parking: Parking | null;
  public building: Building | null;
  public garbage: Garbage | null;
  public approach: Approach | null;
  public pathCellIndex: number;
  public sidewalkArea: number;
  public bikeParkingArea: number;
  public globalAngle: number;
  public globalAnglePrev: number;
  public taperParking: boolean;
  public buildingDragMode: string | null;
  public parkingDragMode: string | null;
  public resizeEdges: number[] | null;
  public resizeCorner: number | null;
  public resizeEdge: number | null;
  public resizingbuilding: boolean;
  public dragOffset: { x: number, y: number };



  constructor(points: IPoint[], lines: Line[], scale: number) {
    this.globalAngle = 0;
    this.globalAnglePrev = 0;
    this.points = points;
    this.lines = lines;
    this.scale = scale;
    this.parkingNum = 10;
    this.property = null;
    this.parking = null;
    this.building = null;
    this.garbage = null;
    this.approach = null;
    this.pathCellIndex = 0;
    this.drivewayArea = 0;
    this.sidewalkArea = 0;
    this.bikeParkingArea = 0;
    this.taperParking = true;
    this.buildingDragMode = null; // null, 'center', 'edge', 'corner'
    this.parkingDragMode = null; // null, 'center', 'edge', 'corner'
    this.dragOffset = { x: 0, y: 0 };
    this.resizeEdge = null;
    this.resizeEdges = null
    this.resizeCorner = null;
    this.resizingbuilding = false;

  }

  initialize(p: p5) {
    p.clear(); // Clear the canvas
    p.angleMode(p.DEGREES);
    // p.frameRate(10);
    let propertyCorners = this.points.map(point => p.createVector(point.x, point.y));
    let lines = [...this.lines];
    const userGeneratedPoints = !!this.points.length;

    const setbacks = Array.apply(null, Array(this.lines.length)).map(Number.prototype.valueOf, 0);

    if (!this.points.length) {

      propertyCorners = [
        p.createVector(140, 80),
        p.createVector(p.width - 180, 50),
        p.createVector(p.width - 180, p.height / 2 + 10),
        p.createVector(p.width - 135, p.height - 120),
        p.createVector(p.width / 2 - 140, p.height - 150),
        p.createVector(108, p.height - 220),
      ];

      propertyCorners = rotateCorners(p, propertyCorners, this.globalAngle);
    }


    let approachIndex = this.lines.findIndex(line => line.isApproach);
    approachIndex = approachIndex === -1 ? 0 : approachIndex;

    const isClockwise = getIsClockwise(propertyCorners)
    if (isClockwise) {
      const first = propertyCorners[0];
      const rest = propertyCorners.slice(1, propertyCorners.length).reverse()
      propertyCorners = [first, ...rest]
      const newIndex = getReversedIndex(approachIndex, this.lines.length);
      approachIndex = newIndex;
    }


    const { scaledPolygon, scaleFactor } = scalePolygonToFitCanvas(p, propertyCorners, p.width, p.height, 40);
    this.scale = userGeneratedPoints ? this.scale / scaleFactor : this.scale / scaleFactor;


    if (lines.length) {
      lines.forEach((line, index) => {
        let _i = index;
        if (isClockwise) {
          _i = getReversedIndex(index, this.lines.length);
        }
        setbacks[_i] = (line.setback || 0) / this.scale
      });
    }


    propertyCorners = scaledPolygon;
    this.property = new Property(p, propertyCorners, approachIndex === -1 ? 0 : approachIndex, isClockwise, this.scale, setbacks);
    this.property.initialize()
    const approachAngle = (this.property.approachEdge?.calculateAngle() || 0) + 180;



    const approachWidth = 20 / this.scale;
    const parkingWidth = 24 / this.scale;
    const buildingDefault = 30 / this.scale;
    const centerOfProperty = calculateCentroid(this.property.cornerOffsetsFromSetbacks)
    const defaultVector = p.createVector(0, 0)

    this.approach = new Approach(p, getCenterPoint(p, this.property.approachEdge?.point1 || defaultVector, this.property.approachEdge?.point2 || defaultVector), approachWidth, 30, approachAngle, ESitePlanObjects.Approach, this.scale);
    this.parking = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 10, approachAngle, ESitePlanObjects.ParkingWay, this.scale);
    this.building = new Building(p, p.createVector(p.width / 2, p.height / 2), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, this.scale);

    this.approach.initialize()
    this.parking.initializeParking(this.property, this.approach)

    this.parking.calculateNumberOfFittableStalls(this.property.cornerOffsetsFromSetbacks);
    this.parking.updateStallCorners();
    this.parking.updateParkingHeight(this.property.cornerOffsetsFromSetbacks);
    this.property.propertyQuadrant(this.property, this.parking);

    this.garbage = new Garbage(p, getCenterPoint(p, this.parking.sitePlanElementEdges[0].point1, this.parking.sitePlanElementEdges[0].point2 || defaultVector), 12 / this.scale, 5 / this.scale, this.parking.angle, ESitePlanObjects.Garbage, this.scale);
    this.garbage.initialize();




    // Update driveway area
    if (this.approach !== null && this.parking !== null) {
      this.drivewayArea = calculateDrivewayArea(this.approach.p, this.approach, this.parking)
    }
  }

  updateGlobalVariables(updatedGlobals: {
    approachWidth: string | number;
    parkingNumber: string | number;
    parkingDrivewayWidth: string | number;
    buildingAreaTarget: string | number;
    globalAngle: number;
    taperParking: boolean;
  }) {

    const { approachWidth, parkingNumber, parkingDrivewayWidth, buildingAreaTarget, taperParking } = updatedGlobals;
    // globalAngle,
    if (!this.parking || !this.property || !this.approach || !this.building) return



    // Update all things PARKING
    this.parking.updateWidth(Number(parkingDrivewayWidth) / this.scale);
    this.parking.updateParkingStallsNumber(this.property, Number(parkingNumber));


    // Update all things APPROACH
    // Scale up the approach witht he scale
    this.approach.updateWidth(Number(approachWidth) / this.scale)


    // Update all this BUILDING
    this.building.updateBuildingArea(Number(buildingAreaTarget))




    this.parking.entranceEdge?.point1

    this.taperParking = taperParking

  }

  visualize(p: p5): void {
    this.initialize(p)

    const property = this.property;
    const approach = this.approach;
    const parking = this.parking;
    const building = this.building;
    const garbage = this.garbage;

    let lastMouseX = -1;
    let lastMouseY = -1;
    // let lastRedrawState = "";

    let visibilityGraphSolver: VisibilityGraph;

    let isDragging = {
      parking: false,
      approach: false,
      parkingOffset: false,
      building: false,
    };

    let isRotationFrozen = false;

    const updateVisibilityGraph = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      if (visibilityGraphSolver) {
        visibilityGraphSolver = runVisibilityGraphSolver(
          visibilityGraphSolver,
          building,
          parking,
          property,
          garbage,
          approach
        );
      }
    };

    const handleBuildingDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;
      const buildingDragMode = this.buildingDragMode;

      const resizeCorner = this.resizeCorner;
      const dragOffset = this.dragOffset;
      building.hasStopped = false

      const newX = p.mouseX;
      const newY = p.mouseY;
      const _center = p.createVector(building.center.x, building.center.y);
      const _height = building.height;
      const _width = building.width;

      const propertyCenter = calculateCentroid(property.propertyCorners)


      if (buildingDragMode === "corner" && resizeCorner !== null) {
        p.cursor('nesw-resize');

        this.resizingbuilding = true;
        // Grab the corner being dragged

        // Calculate the opposite corner index
        const oppositeIndex = (resizeCorner + 2) % 4; // Opposite corner in a rectangle
        const oppositeCorner = building.sitePlanElementCorners[oppositeIndex];

        // Translate corners to the building's local coordinate system
        const localOpposite = toLocal(p, building, oppositeCorner.x, oppositeCorner.y);

        // Update the dragged corner in the local coordinate system
        const newLocalGrabby = toLocal(p, building, newX, newY);

        // Calculate the new width and height
        const newWidth = Math.abs(localOpposite.x - newLocalGrabby.x);
        const newHeight = Math.abs(localOpposite.y - newLocalGrabby.y);

        // Calculate the new center in the local coordinate system
        const newCenterLocal = {
          x: (localOpposite.x + newLocalGrabby.x) / 2,
          y: (localOpposite.y + newLocalGrabby.y) / 2,
        };

        // Convert the new center back to global coordinates
        const newCenterGlobal = toGlobal(p, building, newCenterLocal.x, newCenterLocal.y);

        // Update the building's properties
        if (this.building) {
          this.building.width = newWidth;
          this.building.height = newHeight;
        }
        building.updateBuildingCenter(newCenterGlobal.x, newCenterGlobal.y);


        const pointsInBoundary = building.pointIsInPolygon(property.cornerOffsetsFromSetbacks)
        if (!pointsInBoundary) {
          building.width = _width;
          building.height = _height;
          building.updateBuildingCenter(_center.x, _center.y);
          building.hasStopped = true;
          return;
        }

      }

      else if (buildingDragMode === "edge" && this.resizeEdge !== null) {
        p.cursor('ew-resize'); // Adjust cursor based on edge direction (horizontal/vertical)

        this.resizingbuilding = true;

        // Determine which edge is being dragged
        const edgeIndex = this.resizeEdge;

        const mouse = p.createVector(newX, newY);
        const center = p.createVector(building.center.x, building.center.y);

        const midpoint = building.sitePlanElementEdges[edgeIndex].getMidpoint()
        const distance = calculatePointToEdgeDistance(building.sitePlanElementEdges[edgeIndex], mouse)

        const newPointIsInsideMultiplier = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [newX, newY])
        const _angle = calculateAngle(center, midpoint);

        if (edgeIndex === 0 || edgeIndex === 2) {
          const newHeight = building.height + distance * newPointIsInsideMultiplier;
          if (newHeight > 5) {
            building.height = newHeight
          }

        }
        else {
          const newWidth = building.width + distance * newPointIsInsideMultiplier;
          if (newWidth > 5) {
            building.width = newWidth
          }
        }

        const newPoint1X = building.center.x + distance / 2 * p.cos(_angle) * newPointIsInsideMultiplier;
        const newPoint1Y = building.center.y + distance / 2 * p.sin(_angle) * newPointIsInsideMultiplier;

        building.updateBuildingCenter(newPoint1X, newPoint1Y);

        const pointsInBoundary = building.pointIsInPolygon(property.cornerOffsetsFromSetbacks)
        if (!pointsInBoundary) {
          if (
            p.dist(propertyCenter.x, propertyCenter.y, _center.x, _center.y) <
            p.dist(propertyCenter.x, propertyCenter.y, newX, newY)) {
            building.width = _width;
            building.height = _height;
            building.updateBuildingCenter(_center.x, _center.y);
            building.hasStopped = true;
            return
          }
        }
      }

      else if (buildingDragMode === "rotate") {

        building.isRotating = true;
        p.cursor(RotateArrow);

        const handle = building.rotationHandles[building.hoverHandleIndex];
        if (handle) {
          const mouse = p.createVector(newX, newY)
          const a = p.atan2(mouse.y - building.center.y, mouse.x - building.center.x) -
            p.atan2(handle.y - building.center.y, handle.x - building.center.x);

          building.updateAngle(building.angle + a)
        }

      }

      else if (buildingDragMode === "center") {
        p.cursor('grabbing');



        building.updateBuildingCenter(p.mouseX - dragOffset.x, p.mouseY - dragOffset.y)
        const pointsInBoundary = building.pointIsInPolygon(property.cornerOffsetsFromSetbacks)
        if (!pointsInBoundary) {

          if (
            p.dist(propertyCenter.x, propertyCenter.y, _center.x, _center.y) <
            p.dist(propertyCenter.x, propertyCenter.y, newX, newY)) {
            building.updateBuildingCenter(_center.x, _center.y);
            building.hasStopped = true;
            garbage.updateCenterGarbage(parking);
            return
          }
        }
      }

      else {
        p.cursor('default')
      }

      const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
        const pointClassification = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
        return pointClassification === 1
      }))

      if (
        !parkingIsOutOfBuilding ||
        !building.pointIsInPolygon(property.cornerOffsetsFromSetbacks) ||
        !building.pointIsOutOfPolygon(parking.parkingOutline)) {
        building.setLineColors(p.color(250, 20, 20))
        // TODO: Add the parking outline as an object I can apply pointIsOutOfPolygon 
      }
      else {
        building.setLineColors(p.color(20, 20, 20))
      }

    };

    const handleApproachDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      const _center = p.createVector(approach.center.x, approach.center.y);
      const approachEdgeAngle = property.approachEdge?.calculateAngle();

      let newX = p.mouseX;
      let newY = p.mouseY;
      const isVertical = isMoreVertical(approachEdgeAngle || 0, true);

      if (isVertical) {
        newX = approach.center.x + (newY - approach.center.y) / p.tan(approachEdgeAngle || 0);
        newY = p.mouseY;
      }
      else {
        newX = p.mouseX;
        newY = approach.center.y + (newX - approach.center.x) * p.tan(approachEdgeAngle || 0);
      }

      const allPointsInBoundary = allPointsInPolygon(property.propertyCorners, [approach.sitePlanElementCorners[0], approach.sitePlanElementCorners[1]]);


      if (truthChecker(allPointsInBoundary)) {
        const angle = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90

        approach.updateCenter(newX, newY);
        parking.updateAngle(angle); // +90 to get the perpendicular angle
        garbage.updateAngle(angle);
        // building.updateAngle(angle);
        building.hasStopped = false

        parking.calculateNumberOfFittableStalls(property.propertyCorners);
        parking.updateStallCorners(false, true);
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
        building.buildingLocator(p, building, parking, property, garbage);
        garbage.updateCenterGarbage(parking);

        // building.updateEntrances();
        parking.createRotationHandles();
        updateVisibilityGraph();
      } else {

        const edgeMidpoint = property.approachEdge?.getMidpoint();
        if (!edgeMidpoint) return;


        if (
          p.dist(edgeMidpoint.x, edgeMidpoint.y, _center.x, _center.y) <
          p.dist(edgeMidpoint.x, edgeMidpoint.y, newX, newY)) {
          return
        }


        building.hasStopped = true;
        approach.updateCenter(newX, newY);
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      }
    };


    const handleParkingDrag = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      const _centerX = parking.center.x;
      const _centerY = parking.center.y;
      const newX = p.mouseX;
      const newY = p.mouseY;

      const parkingDragMode = this.parkingDragMode;
      const _angle = parking.angle;

      if (parkingDragMode === "rotate") {

        isRotationFrozen = true;
        parking.isRotating = true;

        const handle = parking.rotationHandles[parking.hoverHandleIndex];
        if (handle) {
          const mouse = p.createVector(newX, newY)
          const a = p.atan2(mouse.y - parking.center.y, mouse.x - parking.center.x) -
            p.atan2(handle.y - parking.center.y, handle.x - parking.center.x);


          const _garbageCenter = p.createVector(garbage.center.x, garbage.center.y);

          parking.updateAngle(parking.angle + a)
          garbage.updateAngle(parking.angle + a)

          parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
          parking.updateStallCorners();
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);

          building.hasStopped = false;

          garbage.updateCenterGarbage(parking);

          const parkingInBoundary = parking.pointIsInPolygon(property.cornerOffsetsFromSetbacks);
          const garbageInBoundary = garbage.pointIsInPolygon(property.cornerOffsetsFromSetbacks);


          const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
            const pointClassification = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
            return pointClassification === 1
          }))

          const buildingIsOutOfParking = building.pointIsOutOfPolygon(parking.parkingOutline);

          if (!parkingIsOutOfBuilding || !buildingIsOutOfParking) {
            parking.setLineColors(p.color(250, 20, 20))
          }
          else {
            parking.setLineColors(p.color(20, 20, 20))
          }


          if (!parkingInBoundary || !garbageInBoundary) {

            // If I'm moving the parking lot close to the center, then let the new point stand.
            parking.updateAngle(_angle);
            garbage.updateAngle(_angle);

            parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
            parking.updateStallCorners();
            parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);

            building.hasStopped = false;
            garbage.updateCenter(_garbageCenter.x, _garbageCenter.y)
            garbage.updateCenterGarbage(parking);
            return;
          }
          parking.createRotationHandles();
          updateVisibilityGraph();
          p.cursor(RotateArrow);
        }


      }

      else if (parkingDragMode === "center") {
        p.cursor('grabbing');

        parking.updateCenter(newX, newY);
        const centerInBoundary = parking.pointIsInPolygon(property.cornerOffsetsFromSetbacks);
        const center = calculateCentroid(property.propertyCorners)


        garbage.updateCenterGarbage(parking);
        const garbageInBoundary = garbage.pointIsInPolygon(property.cornerOffsetsFromSetbacks);

        if (!center) return;
        if (!centerInBoundary || !garbageInBoundary) {
          if (
            p.dist(center.x, center.y, _centerX, _centerY) <
            p.dist(center.x, center.y, newX, newY)) {
            parking.updateCenter(_centerX, _centerY);
            garbage.updateCenterGarbage(parking);
            return
          }
        }

        let angle = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90;
        parking.updateAngle(normalizeAngle(angle));
        garbage.updateAngle(normalizeAngle(angle));
        // building.updateAngle(normalizeAngle(angle));
        building.updateEntrances();


        const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
          const pointClassification = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
          return pointClassification === 1
        }))

        const buildingIsOutOfParking = building.pointIsOutOfPolygon(parking.parkingOutline);


        if (!parkingIsOutOfBuilding || !buildingIsOutOfParking) {
          parking.setLineColors(p.color(250, 20, 20))
        }
        else {
          parking.setLineColors(p.color(20, 20, 20))
        }



        // parking.parkingOutline.slice(3, -3)
        const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, parking.sitePlanElementCorners);
        // const garbageInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, garbage.sitePlanElementCorners);

        if (truthChecker(allPointsInBoundary)) {

          parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
          parking.updateStallCorners(false, isRotationFrozen);
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
          building.hasStopped = false;
          parking.createRotationHandles();
          updateVisibilityGraph();
        } else {
          building.hasStopped = true;
          parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
        }
      }

      else {
        p.cursor('default')
      }

    };


    // Convert nodes to a graph
    p.mouseDragged = () => {

      if (!property || !approach || !parking || !building || !garbage) return;
      const isHovered = {
        approach: approach.isMouseHovering(),
        parking: parking.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parkingHandle: parking.isMouseHoveringRotateHandle(),
        building: building.isMouseHovering(),
        buildingOffset: building.isMouseHoveringOffset(),
        buildingHandle: building.isMouseHoveringRotateHandle(),
      };


      // Moving the building
      if ((
        isHovered.building ||
        isHovered.buildingOffset ||
        isHovered.buildingHandle ||
        this.buildingDragMode ||
        building.hoverHandleIndex !== -1
      ) && building.isInitialized) {
        isDragging.building = true;
        handleBuildingDrag();
      }

      // Move the approach
      else if (isHovered.approach || isDragging.approach) {
        isDragging.approach = true;
        handleApproachDrag();
      }

      // Dragging the parking lot
      else if ((isHovered.parking || isDragging.parking) || isHovered.parkingHandle || parking.hoverHandleIndex !== -1) {
        isDragging.parking = true;
        handleParkingDrag();
      }


      // Update driveway area on every drag
      if (this.approach !== null && this.parking !== null) {
        this.drivewayArea = calculateDrivewayArea(this.approach.p, this.approach, this.parking)
        this.parking.parkingArea = Math.round(parking.width * parking.height * this.scale * this.scale);
        this.approach.approachArea = calculateApproachArea(approach)
        this.parking.parkingStallsArea = getParkingStallArea(this.parking)
      }
    };

    p.mousePressed = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      const isHovered = {
        approach: approach.isMouseHovering(),
        parking: parking.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parkingHandle: parking.isMouseHoveringRotateHandle(),
        building: building.isMouseHovering(),
        buildingOffset: building.isMouseHoveringOffset(),
        buildingHandle: building.isMouseHoveringRotateHandle(),
        garbage: garbage.isMouseHovering(),
      };

      const posX = p.mouseX;
      const posY = p.mouseY;
      const clickIsInProperty = allPointsInPolygon(property.propertyCorners, [p.createVector(posX, posY)]);

      // Place
      if (!building.isInitialized &&
        !isHovered.approach &&
        !isHovered.parking &&
        !isHovered.parkingOffset &&
        !isHovered.parkingHandle &&
        !isHovered.garbage &&

        truthChecker(clickIsInProperty)) {
        building.initializeBuilding(posX, posY);
      }



      if (!building.isInitialized) return;

      // HIDING ENTRANCE AND SOLVER FOR NOW

      const mouse = p.createVector(p.mouseX, p.mouseY)
      const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
      const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
      // const distance = calculatePointToEdgeDistance(closestEdge, mouse);


      // get the point on the line where the entrance should interesect
      const angle = closestEdge.calculateAngle() - 90;
      const intersection = closestEdge.calculateClosestIntercept(
        p.mouseX,
        p.mouseY,
        p
      );

      let minDistance = Infinity;
      let minDistanceIndex = -1;
      building.entrances.forEach((entrance, i) => {
        const dist = p.dist(intersection.x, intersection.y, entrance.intersection.x, entrance.intersection.y);
        if (dist < minDistance) {
          minDistance = dist;
          minDistanceIndex = i;
        }
      })


      // If it is really close to another entrance, and clickm then delete. Turn the entrance with a
      if (minDistance < 5 / this.scale) {
        // THEN DELETE THE ENTRANCE

        building.entrances = building.entrances.filter((_, i) => i !== minDistanceIndex)
        visibilityGraphSolver = runVisibilityGraphSolver(visibilityGraphSolver, building, parking, property, garbage, approach);

      }

      else {
        // Draw the entrance
        const isAddingEntrances = false;
        if (isAddingEntrances) {
          // Hold off on adding entrances for now
          let lerpPos = getIntersectionPercentage(
            closestEdge,
            intersection
          ) || 0;

          const entrance = new Entrance(p, this.scale, lerpPos, intersection, angle, closestEdgeIndex, building.center);
          building.entrances.push(entrance)

          visibilityGraphSolver = runVisibilityGraphSolver(visibilityGraphSolver, building, parking, property, garbage, approach);

        }

      }
    };

    p.mouseReleased = () => {
      if (!property || !approach || !parking || !building || !garbage) return;
      isDragging.parking = false;
      isDragging.approach = false;
      isDragging.parkingOffset = false;
      isDragging.building = false;

      this.buildingDragMode = null;
      this.parkingDragMode = null;

      this.resizeEdges = null;
      this.resizeCorner = null;
      this.resizeEdge = null;
      this.resizingbuilding = false;
      building.isRotating = false;
      parking.isRotating = false;

      building.hoverHandleIndex = -1;
    };

    p.draw = () => {
      if (!property || !approach || !parking || !building || !garbage) return;

      const newX = p.mouseX;
      const newY = p.mouseY;

      // Check if the mouse moved:
      if (
        newX === lastMouseX &&
        newY === lastMouseY) {
        return; // Skip redraw if nothing has changed
      }
      lastMouseX = newX;
      lastMouseY = newY;

      const isHovered = {
        approach: approach.isMouseHovering(),
        parking: parking.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parkingHandle: parking.isMouseHoveringRotateHandle(),

        building: building.isMouseHovering(),
        buildingOffset: building.isMouseHoveringOffset(),
        buildingHandle: building.isMouseHoveringRotateHandle(),
      };



      p.background("#f9fafb")

      p.noFill()
      p.stroke(0);

      property.drawProperty();
      property.drawSetbackPolygon()
      approach.drawApproach();


      parking.drawParkingStalls();

      if (parking.showRotationHandles) {
        parking.drawRotationHandles();
      }
      building.drawBuilding();


      if (building.showRotationHandles) {
        building.drawRotationHandles();
      }

      property.propertyQuadrant(property, parking);

      // , this.taperParking
      createDriveway(p, approach, parking);


      if (!building.hasStopped && building.isInitialized) {
        building.buildingLocator(p, building, parking, property, garbage);

        // STOP THE GROWING FOR NOW.
        // building.buildingGrower(property, parking);
      }


      // garbage.drawSitePlanElement(); //.drawGarbageEnclosure();


      const isInboundary = pointsAreInBoundary(property.cornerOffsetsFromSetbacks, [p.mouseX, p.mouseY]) === -1

      if (!isHovered.approach && !isHovered.parking && !building.isInitialized && isInboundary && !isHovered.parkingOffset && !isHovered.parkingHandle) {

        // Show the building growing.
        building.tempBuilding();
      }

      if ((isHovered.building || isHovered.buildingOffset) && isInboundary && building.isInitialized) {

        // ----  Show the entrance ----
        // Get the closest edge
        // check that the edge is within 30 px
        // show the entrance being drawn in the right orientation and the right position
        // Get the position % of the entrance. 
        // Remove entrance by clicking again within X px of enteracne
        const mouse = p.createVector(p.mouseX, p.mouseY)
        const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
        const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
        const distance = calculatePointToEdgeDistance(closestEdge, mouse);


        // clampNumber()
        // const area = Math.abs(building.width * building.height);

        if (distance < 20 && building.hasStopped) {
          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle() - 90;
          const intersection = closestEdge.calculateClosestIntercept(
            p.mouseX,
            p.mouseY,
            p
          )

          // // Draw the entrance
          // let lerpPos = getIntersectionPercentage(
          //   closestEdge,
          //   intersection
          // ) || 0;


          // Draw the entrance
          const enteranceWidth = 8;
          p.stroke('red')
          p.strokeWeight(2)

          p.push();
          p.translate(intersection.x, intersection.y)
          p.rotate(angle - 180)
          p.textSize(14);
          p.arc(0, 0, enteranceWidth / this.scale, enteranceWidth / this.scale, 0, 90, p.PIE);

          p.pop();
        }
      }


      if (visibilityGraphSolver) {
        this.pathCellIndex++

        // visibilityGraphSolver.displaySolution(p, this.pathCellIndex)


        // Display the shortest path for a specific start-end pair
        visibilityGraphSolver.displayShortestPaths(p);
        // visibilityGraphSolver.displayPathsAsPolygons(p);

        const maxPathStatesLength = visibilityGraphSolver.edges.length;
        if (this.pathCellIndex > maxPathStatesLength + 30) {
          this.pathCellIndex = 0
        }
      }

      parking.drawParkingOutline(p, parking, garbage, approach)
      

      if (
        isHovered.parkingOffset ||
        isHovered.parking ||
        isHovered.parkingHandle ||
        parking.isRotating) {

        // || isDragging.parkingOffset
        // !isDragging.parking

        parking.showRotationHandles = true;
        // let hasSetRotating = parking.isRotating;
        // let hasSetDragging = parking.isDr;
        // && !hasSetDragging

        if (isHovered.parkingHandle) {
          parking.showRotationAnimationCount = 0;

          const index = parking.getMouseHoveringRotateHandleIndex();
          const handle = parking.rotationHandles[index];
          if (p.dist(newX, newY, handle.x, handle.y) < 30) {
            this.parkingDragMode = 'rotate';
            this.resizeEdges = null;
            this.resizeCorner = null;
            this.resizeEdge = null;
            // hasSetRotating = true;

          }
        }


        if (isHovered.parking && !parking.isRotating) {
          // !hasSetRotating&&
          if (p.dist(newX, newY, parking.center.x, parking.center.y) < 20) {
            this.parkingDragMode = 'center';
            this.resizeEdges = null;
            this.resizeCorner = null;
            this.resizeEdge = null;
          }
        }




        if(this.parkingDragMode !== null){
          p.push()
          p.noFill();
          p.stroke(30, 60, 200);
          p.strokeWeight(3)

          // // Circles around the the building corners
          // building.sitePlanElementCorners.forEach(corner=>{
          //   p.ellipse(corner.x, corner.y, 15, 15)
          // })

          // // Lines for all the edges
          // building.sitePlanElementEdges.forEach(edge=>{
          //   p.line(edge.point1.x, edge.point1.y, edge.point2.x,edge.point2.y)
          // });

          // center circle
          p.ellipse(parking.center.x, parking.center.y, 20, 20)
          p.pop();
        }

        // if (this.parkingDragMode === "corner") p.cursor('nesw-resize');
        // else if (this.parkingDragMode === "edge") p.cursor('ew-resize');
        if (this.parkingDragMode === "center") p.cursor('grab');
        else if (this.parkingDragMode === "rotate") p.cursor(RotateArrow);
        else p.cursor('default');
      }


      // Check if we're hovering over a building corner, edge, or center
      else if ((isHovered.building ||
        isHovered.buildingOffset ||
        isHovered.buildingHandle ||
        building.isRotating
      ) && building.isInitialized) {

       
        building.showRotationHandles = true;
        let anyCornerHover = this.resizingbuilding || building.isRotating

        if (!anyCornerHover) {
          building.sitePlanElementCorners.forEach((corner, i) => {
            // if (this.buildingDragMode) return
            if (p.dist(newX, newY, corner.x, corner.y) < 20) {
              this.buildingDragMode = 'corner';
              const resizeEdges = getAdjacentIndices(i, building.sitePlanElementEdges.length);
              const totalVertices = building.sitePlanElementEdges.length
              this.resizeEdges = [resizeEdges[0], (resizeEdges[1] - 1 + totalVertices) % totalVertices]
              this.resizeCorner = i;
              this.resizeEdge = null;
              anyCornerHover = true;
            }
          });

        }
        if (!anyCornerHover) {
          const mouse = p.createVector(p.mouseX, p.mouseY)
          const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
          const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
          const distance = calculatePointToEdgeDistance(closestEdge, mouse);
          if (distance <= 20) {
            this.buildingDragMode = 'edge';
            this.resizeEdges = null;
            this.resizeCorner = null;
            this.resizeEdge = closestEdgeIndex;
          }
        }
        if (!anyCornerHover && isHovered.buildingHandle) {
          building.showRotationAnimationCount = 0;
          const index = building.getMouseHoveringRotateHandleIndex();
          const handle = building.rotationHandles[index];

          if (p.dist(newX, newY, handle.x, handle.y) < 30) {
            this.buildingDragMode = 'rotate';
            this.resizeEdges = null;
            this.resizeCorner = null;
            this.resizeEdge = null;
            anyCornerHover = true;
          }
        }
        if (!anyCornerHover) {
          if (p.dist(newX, newY, building.center.x, building.center.y) < 20) {
            this.buildingDragMode = 'center';
            this.resizeEdges = null;
            this.resizeCorner = null;
            this.resizeEdge = null;
          }
        }


        if(this.buildingDragMode !== null){
          p.push()
          p.noFill();
          // if(this.building.)
          p.stroke(building.lineColor);
          p.strokeWeight(3)

          // Circles around the the building corners
          building.sitePlanElementCorners.forEach(corner=>{
            p.ellipse(corner.x, corner.y, 15, 15)
          })

          // Lines for all the edges
          building.sitePlanElementEdges.forEach(edge=>{
            p.line(edge.point1.x, edge.point1.y, edge.point2.x,edge.point2.y)
          });

          // center circle
          p.ellipse(building.center.x, building.center.y, 20, 20)
          p.pop();
        }

        if (this.buildingDragMode === "corner") p.cursor('nesw-resize');
        else if (this.buildingDragMode === "edge") p.cursor('ew-resize');
        else if (this.buildingDragMode === "center") p.cursor('grab');
        else if (this.buildingDragMode === "rotate") p.cursor(RotateArrow);
        else p.cursor('default');

      }

      else if (isHovered.approach) {
        p.cursor("grab");
      }

      else {


        if (building.showRotationAnimationCount > 0) {
          building.showRotationAnimationCount++
        }
        if (building.showRotationAnimationCount > 30) {
          building.showRotationHandles = false;
        }
        if (this.buildingDragMode !== null) {
          building.showRotationAnimationCount++
        }

        if (parking.showRotationAnimationCount > 0) {
          parking.showRotationAnimationCount++
        }
        if (parking.showRotationAnimationCount > 30) {
          parking.showRotationHandles = false;
        }
        if (this.parkingDragMode !== null) {
          parking.showRotationAnimationCount++
        }


        this.buildingDragMode = null;
        this.parkingDragMode = null;

        this.resizeEdges = null;
        this.resizeCorner = null;
        this.resizeEdge = null;
        p.cursor('default')

      }
    };
  }
}

// Translate points to the building's local coordinate system
const toLocal = (p: p5, building: Building, x: number, y: number) => {
  const dx = x - building.center.x;
  const dy = y - building.center.y;
  return {
    x: dx * p.cos(-building.angle) - dy * p.sin(-building.angle),
    y: dx * p.sin(-building.angle) + dy * p.cos(-building.angle),
  };
};

const toGlobal = (p: p5, building: Building, x: number, y: number) => {
  return {
    x: x * p.cos(building.angle) - y * p.sin(building.angle) + building.center.x,
    y: x * p.sin(building.angle) + y * p.cos(building.angle) + building.center.y,
  };
};





export function drawNeonLine( p: p5,
    x1: number,
    y1: number,
    x2: number,
    y2: number, 
    lineColor: p5.Color, glowSize = 20) {
    // Save the current drawing state
    p.push();
    
    // Disable the stroke outline
    p.noStroke();
    
    // Calculate the number of layers for the glow effect
    const layers = 15;
    
    // Calculate the alpha step for each layer
    const alphaStep = 255 / layers;
    
    // Calculate the size step for each layer
    const sizeStep = glowSize / layers;
    
    // Draw multiple layers from outside to inside
    for (let i = layers; i >= 0; i--) {
      // Calculate the current alpha and size
      const currentAlpha = (layers - i) * alphaStep;
      const currentSize = i * sizeStep;
      
      // Set the color with current alpha
      const c = p.color(p.red(lineColor), p.green(lineColor), p.blue(lineColor), currentAlpha);
      p.drawingContext.shadowColor = p.color(p.red(lineColor), p.green(lineColor), p.blue(lineColor), currentAlpha);
      p.drawingContext.shadowBlur = currentSize;
      
      // Draw the line
      p.stroke(c);
      p.strokeWeight(2);
      p.line(x1, y1, x2, y2);
    }
    
    // Draw the bright center
    p. stroke(255);
    p.strokeWeight(2);
    p.line(x1, y1, x2, y2);
    
    // Restore the drawing state
    p.pop();
  }



  export function drawNeonShape(
    p: p5,
    vertices: { x: number; y: number }[], // Array of vertices for the shape
    lineColor: p5.Color,
    glowSize = 20
  ): void {
    // Save the current drawing state
    p.push();
  
    // Disable the stroke outline
    p.noStroke();
  
    // Calculate the number of layers for the glow effect
    const layers = 15;
  
    // Calculate the alpha step for each layer
    const alphaStep = 255 / layers;
  
    // Calculate the size step for each layer
    const sizeStep = glowSize / layers;
  
    // Draw multiple layers from outside to inside
    for (let i = layers; i >= 0; i--) {
      // Calculate the current alpha and size
      const currentAlpha = (layers - i) * alphaStep;
      const currentSize = i * sizeStep;
  
      // Set the color with current alpha
      const c = p.color(
        p.red(lineColor),
        p.green(lineColor),
        p.blue(lineColor),
        currentAlpha
      );
      p.drawingContext.shadowColor = p.color(
        p.red(lineColor),
        p.green(lineColor),
        p.blue(lineColor),
        currentAlpha
      );
      p.drawingContext.shadowBlur = currentSize;
  
      // Draw the shape with current glow layer
      p.stroke(c);
      p.strokeWeight(2);
      p.beginShape();
      vertices.forEach((vertex) => {
        p.vertex(vertex.x, vertex.y);
      });
      p.endShape(p.CLOSE);
    }
  
    // Draw the bright center shape
    p.stroke(255);
    p.strokeWeight(2);
    p.beginShape();
    vertices.forEach((vertex) => {
      p.vertex(vertex.x, vertex.y);
    });
    p.endShape(p.CLOSE);
    // Restore the drawing state
    p.pop();
  }

  