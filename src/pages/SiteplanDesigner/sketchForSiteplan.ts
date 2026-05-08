import p5 from "p5";
import type React from "react";

import { IPoint, Line } from "./SitePlanDesigner";
import RotateArrow from "../../assets/rotateArrow.png"


import { allPointsInPolygon, calculateApproachArea, calculateCentroid, calculateLineIndexOfClosestLine, calculatePointToEdgeDistance, calculateScale, closestBoundaryLineIndexWithinDistance, displayImage, drawArea, drawInstructionsToScreen, drawNeonEllipse, drawProtoPropertyLines, falseChecker, findClosestEdge, FormDataInputs, getCenterPoint, getIntersectionPercentage, getIsClockwise, getParkingStallArea, handleApproachDrag, handleBuildingDrag, handleParkingDrag, rotateCorners, runVisibilityGraphSolver, tryInsertVertexOnBuildingEdge, truthChecker } from "../../utils/SiteplanGeneratorUtils";
import { Edge } from "./SitePlanClasses/Edge";
import { Property } from "./SitePlanClasses/Property";
import { Parking } from "./SitePlanClasses/Parking";
import { Garbage } from "./SitePlanClasses/Garbage";
import { Approach } from "./SitePlanClasses/Approach";
import { VisibilityGraph } from "../VisibilityGraph";
import { BikeParking } from "./SitePlanClasses/BikeParking";
import { BuildingsGroup } from './SitePlanClasses/BuildingsGroup'
import { Entrance } from "./SitePlanClasses/Entrance";
// import { ConfirmDialog } from "./SitePlanClasses/ConfirmDialog";
// import { VisibilityGraph } from "../VisibilityGraph";


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
export const normalStallHeight = 8.5;
export const handicappedStallHeight = 17;
export const compactStallHeight = 8;

/** Convert canvas pixel coords to drawing coords matching the sketch pan/zoom transform */
function screenToDrawingCoords(
  sx: number,
  sy: number,
  zoomVal: number,
  ox: number,
  oy: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const z = zoomVal <= 0 || !Number.isFinite(zoomVal) ? 1 : zoomVal;
  return {
    x: (sx - w / 2 - ox) / z + w / 2,
    y: (sy - h / 2 - oy) / z + h / 2,
  };
}

/** While tracing the parcel, snap pointer to first vertex inside snap radius when closing would be offered; moving away restores raw pointer position. */
function parcelBoundarySnapClosedLoop(
  drawX: number,
  drawY: number,
  zoomVal: number,
  pointsOpen: Array<{ x: number; y: number }>,
  isParcelPointsStep: boolean,
  polygonClosed: boolean,
): { x: number; y: number } {
  if (
    !isParcelPointsStep ||
    polygonClosed ||
    pointsOpen.length < 3
  ) {
    return { x: drawX, y: drawY };
  }
  const z = zoomVal <= 0 || !Number.isFinite(zoomVal) ? 1 : zoomVal;
  const snapR = Math.max(6, 12 / z);
  const f = pointsOpen[0];
  if (
    Number.isFinite(f.x) &&
    Number.isFinite(f.y) &&
    Math.hypot(drawX - f.x, drawY - f.y) < snapR
  ) {
    return { x: f.x, y: f.y };
  }
  return { x: drawX, y: drawY };
}

interface SketchForSiteplanParams {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLDivElement>;
  draggingPointIndexRef: React.MutableRefObject<number | null>;
  imageURL: string | null;
  inputScaleRef: React.MutableRefObject<number | null>;
  isPolygonClosedRef: React.MutableRefObject<boolean>;
  linesRef: React.MutableRefObject<Line[]>;
  pointsRef: React.MutableRefObject<IPoint[]>;
  scaleRef: React.MutableRefObject<number | null>;
  selectedLineIndexRef: React.MutableRefObject<number | null>;
  setbacksRef: React.MutableRefObject<number[]>;
  setIsPolygonClosedState: (value: React.SetStateAction<boolean>) => void;
  stepSelectorRefs: {
    upload: React.MutableRefObject<boolean>;
    points: React.MutableRefObject<boolean>;
    approach: React.MutableRefObject<boolean>;
    scale: React.MutableRefObject<boolean>;
    setback: React.MutableRefObject<boolean>;
    parking: React.MutableRefObject<boolean>;
    building: React.MutableRefObject<boolean>;
    entrances: React.MutableRefObject<boolean>;
    sidewalks: React.MutableRefObject<boolean>;
    bikeParking: React.MutableRefObject<boolean>;
    everything: React.MutableRefObject<boolean>;
    moving: React.MutableRefObject<boolean>;
  };
  clearEverythingRef: React.MutableRefObject<boolean>;

  // inboundMetricsRef: React.MutableRefObject<FormDataInputs>;
  // setOutboundMetrics: React.Dispatch<React.SetStateAction<SiteMetrics>>;
  /** Latest form snapshot; refs stay current while the p5 sketch closure is recreated only on imageURL change. */
  formDataRef: React.MutableRefObject<FormDataInputs>;
  imageOpacityRef: React.MutableRefObject<number>;
  propertyOpacityRef: React.MutableRefObject<number>;
  propertyRef: React.MutableRefObject<Property | null>;
  approachRef: React.MutableRefObject<Approach | null>;
  parkingRef: React.MutableRefObject<Parking | null>;
  buildingsGroupRef: React.MutableRefObject<(BuildingsGroup | null)>
  garbageRef: React.MutableRefObject<Garbage | null>;
  bikeParkingRef: React.MutableRefObject<BikeParking | null>;
  visibilityGraphSolverRef: React.MutableRefObject<VisibilityGraph | null>;
  /** Setbacks step only: notifies which boundary line index is under the cursor snap band (or null). */
  reportSetbackHoverLineIndexRef: React.MutableRefObject<(lineIndex: number | null) => void>;
  /** After scale-step edge click: parcel line whose `line.isScale` is true (`line.index`). */
  reportCanvasScaleBoundaryRef: React.MutableRefObject<(lineIndex: number | null) => void>;
  /** After setback-step edge hit: parcel line clicked (for floating input focus). */
  reportCanvasSetbackActivatedLineRef: React.MutableRefObject<(lineIndex: number | null) => void>;
}

export default function sketchForSiteplan(params: SketchForSiteplanParams) {
  const {
    canvasContainerRef,
    canvasRef,
    draggingPointIndexRef,
    imageURL,
    inputScaleRef,
    isPolygonClosedRef,
    linesRef,
    pointsRef,
    scaleRef,
    selectedLineIndexRef,
    setbacksRef,
    setIsPolygonClosedState,
    stepSelectorRefs,
    clearEverythingRef,
    // inboundMetricsRef,
    // setOutboundMetrics,
    formDataRef,
    imageOpacityRef,
    propertyOpacityRef,
    propertyRef,
    approachRef,
    parkingRef,
    buildingsGroupRef,
    garbageRef,
    bikeParkingRef,

    visibilityGraphSolverRef,

    reportSetbackHoverLineIndexRef,
    reportCanvasScaleBoundaryRef,
    reportCanvasSetbackActivatedLineRef,

  } = params;
  const defaultScale = 0.25;
  let pathCellIndex = 0;



  // if (bikeParkingRef.current) {

  // }
  // let dialog: ConfirmDialog;

  let buildingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let parkingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let approachDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let bikeParkingDragMode: string | null = null; // null, 'center', 'edge', 'corner'

  let resizeEdge: number | null = null;
  // let resizeEdges: number[] | null = null
  let resizeCorner: number | null = null;
  // let drivewayArea = 0;
  const isRotationFrozenRef: React.MutableRefObject<boolean> = { current: false };
  const resizingbuildingsRef: React.MutableRefObject<boolean> = { current: false };

  let approachTempX = 0;
  let approachTempY = 0;
  let approachTempAngle = 0;


  let isDragging = {
    parking: false,
    approach: false,
    parkingOffset: false,
    buildings: [] as boolean[],
  };



  let isHovered = {
    approach: false,
    approachOffset: false,
    parking: false,
    parkingOffset: false,
    parkingHandle: false,
    buildings: [] as boolean[],
    buildingsOffset: [] as boolean[],
    buildingsHandle: [] as boolean[],
    garbage: false,
    bikeParking: false,
  };


  // let isRecalculatingParking = false;

  let zoom = 1; // Initial zoom level
  let offsetX = 0;
  let offsetY = 0; // Offset for translation
  let prevMouseX = 0;
  let prevMouseY = 0; // To track panning

  /** Set true to re-enable Shift-drag pan and wheel zoom (was fighting element drag). */
  const ENABLE_SITEPLAN_PAN_AND_ZOOM = false;



  // When an input changes in the component above, set he sketch variable here.
  if (propertyRef.current) {
    propertyRef.current.updateSetbacks(linesRef.current);
  }



  if (clearEverythingRef.current === true) {
    clearEverythingRef.current = false;

    propertyRef.current = null
    approachRef.current = null
    parkingRef.current = null
    buildingsGroupRef.current = null;
    bikeParkingRef.current = null

    buildingDragMode = null; // null, 'center', 'edge', 'corner'
    parkingDragMode = null; // null, 'center', 'edge', 'corner'
    approachDragMode = null; // null, 'center', 'edge', 'corner'

    resizeEdge = null;
    resizeCorner = null;
    isRotationFrozenRef.current = false;
    resizingbuildingsRef.current = false;
    isDragging.parking = false;
    isDragging.approach = false;
    isDragging.parkingOffset = false;

    isDragging.buildings = isDragging.buildings.map(_ => false);
  }


  // let _scale = scaleRef.current || defaultScale;


  return (p: p5) => {
    let img: p5.Image | null = null;
    let rectSize = { width: 0, height: 0 };
    const defaultVector = p.createVector(0, 0);

    /** p5 attaches pointer handlers to `window`, so we only react when the event target is our sketch canvas. */
    let sketchPointerActiveOnCanvas = false;

    function isPointerOnSketchCanvas(e: Event | undefined): boolean {
      if (!e?.target || !(e.target instanceof Node)) return false;
      const host = canvasRef.current;
      if (!host) return false;
      const canvasEl = host.querySelector("canvas");
      if (!(canvasEl instanceof HTMLElement)) return false;
      return canvasEl === e.target || canvasEl.contains(e.target);
    }

    function isTopElementUnderSketchPixel(clientX: number, clientY: number): boolean {
      const host = canvasRef.current;
      if (!host) return false;
      const canvasEl = host.querySelector("canvas");
      if (!(canvasEl instanceof HTMLElement)) return false;
      const top = document.elementFromPoint(clientX, clientY);
      return top === canvasEl || (top instanceof Node && canvasEl.contains(top));
    }

    p.preload = () => {
      if (imageURL) {
        img = p.loadImage(imageURL);
      }


    };

    p.setup = () => {
      p.frameRate(60);
      p.clear(); // Clear the canvas
      p.angleMode(p.DEGREES);

      if (canvasRef.current && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect()

        rectSize = { width: rect.width, height: rect.height };
        const canvas = p.createCanvas(rect.width - 20, rect.height - 20);
        canvas.parent(canvasRef.current);
      }

      p.noCursor();
    };

    buildingsGroupRef.current = new BuildingsGroup(p);




    // Zoom functionality using mouse wheel
    p.mouseWheel = (event: WheelEvent) => {

      const canvasBounds = canvasRef.current?.getBoundingClientRect();

      if (!canvasBounds) return;

      if (!isPointerOnSketchCanvas(event)) return;

      const insideCanvas =
        event.clientX >= canvasBounds.left &&
        event.clientX <= canvasBounds.right &&
        event.clientY >= canvasBounds.top &&
        event.clientY <= canvasBounds.bottom;

      if (!event || !insideCanvas) return;

      if (!ENABLE_SITEPLAN_PAN_AND_ZOOM) return;

      // const newX = (p.mouseX + offsetX) * zoom;
      // const newY = (p.mouseY + offsetY) * zoom;

      // Convert screen mouse coordinates to world coordinates before zoom
      const { worldX, worldY } = screenToWorld(p, p.mouseX, p.mouseY, zoom, offsetX, offsetY);

      // Convert screen mouse coordinates to world coordinates before zoom


      const zoomFactor = 1.05; // Zoom intensity
      const direction = event.deltaY > 0 ? 1 / zoomFactor : zoomFactor;


      // Apply zoom
      zoom *= direction;

      // Adjust offset to keep zoom centered on mouse
      offsetX = p.mouseX - p.width / 2 - worldX * zoom;
      offsetY = p.mouseY - p.height / 2 - worldY * zoom;




      // Recalculate offset to ensure the mouse stays in the same world position


      //  return false; // Prevent page scrolling




      // const property = propertyRef.current;
      // const approach = approachRef.current;
      // const parking = parkingRef.current;
      // const buildings = buildingsGroupRef.current;
      // const garbage = garbageRef.current;
      // const bikeParking = bikeParkingRef.current;




      // const elements = [property, approach, parking, buildings, garbage, bikeParking];
      // elements.forEach(element => {
      //   if (element === null) return
      //   element.zoom = zoom;
      //   element.offsetX = offsetX;
      //   element.offsetY = offsetY;
      // })


      event.preventDefault();
      return false; // Prevent page scrolling
    };

    p.draw = () => {
      if (!ENABLE_SITEPLAN_PAN_AND_ZOOM) {
        zoom = 1;
        offsetX = 0;
        offsetY = 0;
      }

      p.push();
      p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
      p.scale(zoom);
      p.translate(-p.width / 2, -p.height / 2);

      // Example neon shape
      // p.fill(255, 0, 0);
      // p.ellipse(400, 300, 150, 100);

      const pointerDrawing = screenToDrawingCoords(
        p.mouseX,
        p.mouseY,
        zoom,
        offsetX,
        offsetY,
        p.width,
        p.height,
      );
      const newX = pointerDrawing.x;
      const newY = pointerDrawing.y;

      const polygonClosedNow = isPolygonClosedRef.current;
      const polygonOpenForSnap =
        stepSelectorRefs.points.current && !polygonClosedNow;
      const parcelCursorDrawing = polygonOpenForSnap
        ? parcelBoundarySnapClosedLoop(
            newX,
            newY,
            zoom,
            pointsRef.current,
            polygonOpenForSnap,
            polygonClosedNow,
          )
        : pointerDrawing;

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const buildingsGroup = buildingsGroupRef.current;
      const garbage = garbageRef.current;

      updateGlobalVariables(
        property,
        approach,
        parking,
        buildingsGroup,
        garbage,
        bikeParkingRef.current,
        formDataRef.current,
      );

      const isUploadingImage = stepSelectorRefs.upload.current;
      const isPolygonClosed = isPolygonClosedRef.current;

      let cursorDrawing = parcelCursorDrawing;
      let boundarySnapHighlightEdge: Edge | null = null;
      if (
        (stepSelectorRefs.scale.current || stepSelectorRefs.setback.current) &&
        property &&
        isPolygonClosed &&
        property.propertyEdges.length
      ) {
        const snapPx = Math.max(10 / (property.scale || defaultScale), 18 / (zoom || 1));
        const ei = findClosestEdge(property.propertyEdges, p.createVector(newX, newY));
        const edge = property.propertyEdges[ei];
        const proj = edge.calculateClosestIntercept(newX, newY, p);
        if (p.dist(newX, newY, proj.x, proj.y) <= snapPx) {
          cursorDrawing = { x: proj.x, y: proj.y };
          boundarySnapHighlightEdge = edge;
        }
      }

      reportSetbackHoverLineIndexRef.current(
        stepSelectorRefs.setback.current
          ? boundarySnapHighlightEdge !== null
            ? boundarySnapHighlightEdge.lineIndex
            : null
          : null,
      );

      if (isUploadingImage) {
        p.pop();
        return;
      }

      if (stepSelectorRefs.points.current || stepSelectorRefs.scale.current) {
        calculateScale(inputScaleRef, linesRef, pointsRef, scaleRef, propertyRef);
      }

      displayImage(p, img, rectSize, imageOpacityRef.current);



      if (property) {
        property.drawProperty();
        property.drawSetbackPolygon(propertyOpacityRef.current);
        property.drawLineLengths();

        if (
          boundarySnapHighlightEdge !== null &&
          (stepSelectorRefs.scale.current || stepSelectorRefs.setback.current)
        ) {
          p.push();
          p.stroke(59, 130, 246);
          p.strokeWeight(5);
          p.noFill();
          p.line(
            boundarySnapHighlightEdge.point1.x,
            boundarySnapHighlightEdge.point1.y,
            boundarySnapHighlightEdge.point2.x,
            boundarySnapHighlightEdge.point2.y,
          );
          p.pop();
        }

        if (property.enableAngles) {
          property.drawAnglesBetweenLines()
        }
      }
      else {
        drawProtoPropertyLines(
          p,
          pointsRef,
          linesRef,
          scaleRef.current || defaultScale,
          parcelCursorDrawing.x,
          parcelCursorDrawing.y,
        );
      }

      if (approach) {
        isHovered.approach = approach.isMouseHovering();
        isHovered.approachOffset = approach.isMouseHoveringOffset();
      }
      if (parking) {
        isHovered.parking = parking.isMouseHovering();
        isHovered.parkingOffset = parking.isMouseHoveringOffset();
        isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();

        if ((
          isHovered.parkingOffset ||
          isHovered.parking ||
          isHovered.parkingHandle) ||
          parking?.isRotating) {

          if (buildingsGroupRef.current?.buildings.length) {
            buildingsGroupRef.current.buildings.forEach(building => {
              if (building !== null) building.showRotationHandles = false
            })
          }
          // parkingDragMode = null;
          approachDragMode = null;

          parking.showRotationHandles = true;



          if (isHovered.parkingHandle) {
            parking.showRotationAnimationCount = 0;

            const index = parking.getMouseHoveringRotateHandleIndex();
            const handle = parking.rotationHandles[index];
            if (p.dist(newX, newY, handle.x, handle.y) < 30) {
              parkingDragMode = 'rotate';
              // resizeEdges = null;
              resizeCorner = null;
              resizeEdge = null;
              // hasSetRotating = true;

            }
          }


          if (isHovered.parking && !parking.isRotating) {
            // !hasSetRotating&&
            if (p.dist(newX, newY, parking.center.x, parking.center.y) < 20) {
              parkingDragMode = 'center';
              // // resizeEdges = null;c
              resizeCorner = null;
              resizeEdge = null;
            }
          }


          if (parkingDragMode !== null ||  isHovered.parking) {
            p.push();
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



          if (parkingDragMode === "corner") p.cursor('nesw-resize');
          else if (parkingDragMode === "edge") p.cursor('ew-resize');
          else if (parkingDragMode === "center") p.cursor('grab');
          else if (parkingDragMode === "rotate") p.cursor(RotateArrow);
          else p.cursor('default');
        }



      }




      if (approach) {
        approach.drawApproach();
      }

      if (parking && garbage && approach) {
        // parkingRef.current
        parking.drawParkingStalls();
        parking.drawParkingOutline(p, approach);
      }

      if (buildingsGroup) {

        buildingsGroup.buildings.forEach((building, buildingIndex) => {
          if (building === null) return;
          building.drawBuilding();
          if (building.showRotationHandles &&
            !stepSelectorRefs.entrances.current) {
            building.drawRotationHandles();
          }

          if (!building.hasStopped && building.isInitialized && parking && property && garbage) {
            // buildingsGroupRef.current.buildingLocator(p, buildingsGroupRef.current, parkingRef.current, propertyRef.current, garbageRef.current);
            // STOP THE GROWING FOR NOW.
            // building.buildingGrower(property, parking);
          }

          isHovered.buildings[buildingIndex] = building.isMouseHovering();
          isHovered.buildingsOffset[buildingIndex] = building.isMouseHoveringOffset();
          isHovered.buildingsHandle[buildingIndex] = building.isMouseHoveringRotateHandle();


          // const isInboundary = pointsAreInBoundary(property.cornerOffsetsFromSetbacks, [newX, newY]) === -1

          // if (!isHovered.approach && !isHovered.parking && !building.isInitialized && isInboundary && !isHovered.parkingOffset && !isHovered.parkingHandle) {

          //   // Show the building growing.

          // }

          const isAddingEntrances = stepSelectorRefs.entrances.current;
          if (isAddingEntrances) {
            // ----  Show the entrance ----
            // Get the closest edge
            // check that the edge is within 30 px
            // show the entrance being drawn in the right orientation and the right position
            // Get the position % of the entrance. 
            // Remove entrance by clicking again within X px of enteracne
            const mouse = p.createVector(newX, newY)
            const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
            const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
            const distance = calculatePointToEdgeDistance(closestEdge, mouse);


            // clampNumber()
            // const area = Math.abs(building.width * building.height);
            if (distance < 20) { // && building.hasStopped) {

              // get the point on the line where the entrance should interesect
              const angle = closestEdge.calculateAngle() - 90;
              const intersection = closestEdge.calculateClosestIntercept(
                newX, newY,
                p
              )

              // // Draw the entrance
              // let lerpPos = getIntersectionPercentage(
              //   closestEdge,
              //   intersection
              // ) || 0;


              // Draw the entrance
              const enteranceWidth = 8;
              p.push();

              p.stroke('red')
              p.strokeWeight(2)
              p.translate(intersection.x, intersection.y)
              p.rotate(angle - 180)
              p.textSize(14);
              const _propertyScale = property?.scale ?? defaultScale;
              p.arc(0, 0, enteranceWidth / _propertyScale, enteranceWidth / _propertyScale, 0, 90, p.PIE);

              p.pop();
            }
          }

          // Check if we're hovering over a building corner, edge, or center (or node-edit mode is on)
          if ((isHovered.buildings[buildingIndex] ||
            isHovered.buildingsOffset[buildingIndex] ||
            isHovered.buildingsHandle[buildingIndex] ||
            building.isRotating ||
            building.polygonNodeEditMode
          ) && building.isInitialized

            // isNoOtherIsTrue(buildingsGroup.buildings.map(building=>building.isSelected),buildingIndex)
            // No other building is being dragged
          ) {

            parkingDragMode = null;
            approachDragMode = null;

            if (parking) {
              parking.showRotationHandles = false;
            }
            building.showRotationHandles = true;
            let anyCornerHover = resizingbuildingsRef.current || building.isRotating
            const _propScaleHud = property?.scale ?? defaultScale;
            const pickR = Math.max(10 / _propScaleHud, 14 / zoom);
            const handleHitR = Math.max(26, 30 / zoom);
            const useRectCorners = building.freeformPolygonCorners === null;

            if (!anyCornerHover && building.polygonNodeEditMode && building.freeformPolygonCorners) {
              const poly = building.freeformPolygonCorners;
              for (let vi = 0; vi < poly.length; vi++) {
                const c = poly[vi];
                if (p.dist(newX, newY, c.x, c.y) < pickR) {
                  buildingDragMode = 'polygonVertex';
                  resizeCorner = vi;
                  resizeEdge = null;
                  anyCornerHover = true;
                  break;
                }
              }
            }

            if (!anyCornerHover && useRectCorners) {
              building.sitePlanElementCorners.forEach((corner, i) => {
                if (p.dist(newX, newY, corner.x, corner.y) < pickR) {
                  buildingDragMode = 'corner';
                  resizeCorner = i;
                  resizeEdge = null;
                  anyCornerHover = true;
                }
              });

            }
            if (!anyCornerHover && useRectCorners) {
              const mouse = p.createVector(newX, newY)
              const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
              const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
              const distance = calculatePointToEdgeDistance(closestEdge, mouse);
              if (distance <= pickR) {
                buildingDragMode = 'edge';
                resizeCorner = null;
                resizeEdge = closestEdgeIndex;
              }
            }

            if (!anyCornerHover && isHovered.buildingsHandle[buildingIndex]) {
              building.showRotationAnimationCount = 0;
              const index = building.getMouseHoveringRotateHandleIndex();
              const handle = building.rotationHandles[index];

              if (p.dist(newX, newY, handle.x, handle.y) < handleHitR) {
                buildingDragMode = 'rotate';
                resizeCorner = null;
                resizeEdge = null;
                anyCornerHover = true;
              }
            }
            if (!anyCornerHover) {
              if (p.dist(newX, newY, building.center.x, building.center.y) < Math.max(pickR, 20)) {
                buildingDragMode = 'center';
                resizeCorner = null;
                resizeEdge = null;
              }
            }

            if (buildingDragMode !== null || building.polygonNodeEditMode) {
              building.drawBuildingEditOptions();
            }

            
            p.push();
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
            p.ellipse(building.center.x, building.center.y, 20, 20)
            p.pop();


            if (buildingDragMode === "polygonVertex") p.cursor('crosshair');
            else if (buildingDragMode === "corner") p.cursor('nesw-resize');
            else if (buildingDragMode === "edge") p.cursor('ew-resize');
            else if (buildingDragMode === "center") p.cursor('grab');
            else if (buildingDragMode === "rotate") p.cursor(RotateArrow);
            else p.cursor('default');
          }
        });
      }

      // if (bikeParkingRef.current) {
      //   bikeParkingRef.current.drawSitePlanElement()
      // }



      if (parking && parking.showRotationHandles) {
        parking.drawRotationHandles();
      }

      const showVisibilityPaths =
        property &&
        visibilityGraphSolverRef.current &&
        (stepSelectorRefs.entrances.current ||
          stepSelectorRefs.sidewalks.current ||
          stepSelectorRefs.moving.current);

      if (showVisibilityPaths && visibilityGraphSolverRef.current) {
        visibilityGraphSolverRef.current.displayShortestPaths(p);
        const maxPathStatesLength = visibilityGraphSolverRef.current.edges.length;
        if (pathCellIndex > maxPathStatesLength + 30) {
          pathCellIndex = 0;
        }
      }



      if (isHovered.approach || isHovered.approachOffset) {
        approachDragMode = 'center';
        buildingDragMode = null;
        parkingDragMode = null;
        p.cursor("grab");
      }




      // If nothing is hovered and nothing is currently being moved, default
      if (
        !isHovered.approach &&
        !isHovered.approachOffset &&
        falseChecker(isHovered.buildings) &&
        falseChecker(isHovered.buildingsHandle) &&
        falseChecker(isHovered.buildingsOffset) &&
        !isHovered.parking &&
        !isHovered.parkingHandle &&
        !isHovered.parkingOffset &&


        !isDragging.parking &&
        !isDragging.approach &&
        falseChecker(isDragging.buildings) &&

        !isDragging.parkingOffset



      ) {

        const parking = parkingRef.current;
        const buildings = buildingsGroupRef.current;
        // const garbage = garbageRef.current;


        if (parking) {
          parking.showRotationHandles = false;
        }
        if (buildings?.buildings?.length) {
          buildings.buildings.forEach(building => {
            if (building !== null) building.showRotationHandles = false;
          })
        }


        buildingDragMode = null;
        parkingDragMode = null;
        approachDragMode = null;

        resizeCorner = null;
        resizeEdge = null;
        p.cursor('default')
      }



      if (property && stepSelectorRefs.points.current) {

        const pointIndex = property.propertyCorners.findIndex((point) => p.dist(point.x, point.y, newX, newY) < 20);
        const point = property.propertyCorners[pointIndex];

        p.push();

        if (point) {
          p.ellipse(point.x, point.y, 10, 10);

          const neonBlue = p.color(59, 130, 246);
          drawNeonEllipse(
            p,
            point.x, point.y, 10, 10,
            neonBlue, 30);

          p.cursor('grab');
        }

        p.pop();

      }




      else if (stepSelectorRefs.building.current && !buildingDragMode && !parkingDragMode) {
        buildingsGroup?.tempBuilding();
      }


      else if (
        stepSelectorRefs.parking.current &&
        !buildingDragMode &&
        !parkingDragMode &&
        !parking?.isInitialized) {
        property?.tempObject();
      }


      else if (
        stepSelectorRefs.approach.current &&
        !approachDragMode &&
        !buildingDragMode &&
        !parkingDragMode &&
        !approach?.isInitialized) {

        if (
          property &&
          prevMouseX !== p.mouseX &&
          prevMouseY !== p.mouseY
        ) {
          prevMouseX = p.mouseX;
          prevMouseY = p.mouseY;

          const mouse = p.createVector(newX, newY);
          const closestEdgeIndex = findClosestEdge(property.propertyEdges, mouse);
          const closestEdge = property.propertyEdges[closestEdgeIndex];

          const angle = closestEdge.calculateAngle();
          const intersection = closestEdge.calculateClosestIntercept(
            newX,
            newY,
            p
          );

          approachTempX = intersection.x;
          approachTempY = intersection.y;
          approachTempAngle = angle;
        }


        if (approachTempX !== 0 && approachTempY !== 0 && property) {
          const approachWidthFt = Math.max(Number(formDataRef.current.approachWidth) || 12, 1);
          tempApproach(
            p,
            approachTempX,
            approachTempY,
            approachTempAngle,
            approachWidthFt,
            20,
            property.scale || defaultScale,
          );
        }
      }



      p.fill("#3b82f6");
      p.ellipse(cursorDrawing.x, cursorDrawing.y, 10, 10);
      // Draw the custom cursor
      drawCustomCursor();


      drawArea(p, isPolygonClosedRef.current, pointsRef, scaleRef.current || defaultScale);
      drawInstructionsToScreen(p, pointsRef, img, isPolygonClosed, stepSelectorRefs.approach, stepSelectorRefs.scale, stepSelectorRefs.setback);
      
      // dialog?.draw(p);

      p.pop();
    };


    p.keyPressed = (key: { key: string }) => {

      if (key.key === "Escape") {
        buildingsGroupRef.current?.buildings.forEach((b) => b.exitPolygonNodeEditMode());
      }

      // DELETES THE BUILDING
      if (key.key === "Backspace" && Object.values(isHovered.buildings).some(Boolean)) {
        const index = isHovered.buildings.findIndex(value => value === true);
        if (buildingsGroupRef.current === null) return
        buildingsGroupRef.current.buildings = buildingsGroupRef.current.buildings.filter((_building, buildingIndex) => buildingIndex !== index)
        // dialog = new ConfirmDialog(p, p.width / 2, p.height / 2, 300, 120,
        //   () => {
        //     

        //     buildingsGroupRef.current.buildings = buildingsGroupRef.current.buildings.filter((_building, buildingIndex) => buildingIndex !== index)
        //   },
        //   () => console.log("Canceled!"));
        // dialog.show();
        return
      }
    }
    p.mousePressed = (e?: Event) => {
      if (!isPointerOnSketchCanvas(e)) return;

      // if (dialog?.isVisible) {
      //   dialog.mousePressed(p);
      //   return; // Prevents further event propagation when dialog is open
      // }

      prevMouseX = p.mouseX;
      prevMouseY = p.mouseY;
      const points = pointsRef.current;
      const lines = linesRef.current;
      const setbacks = setbacksRef.current;
      const scale = scaleRef.current;

      const isPolygonClosed = isPolygonClosedRef.current;

      const mx = p.mouseX;
      const my = p.mouseY;

      if (mx < 0 || mx > p.width || my < 0 || my > p.height) return;

      sketchPointerActiveOnCanvas = true;

      const drawingPointer = screenToDrawingCoords(mx, my, zoom, offsetX, offsetY, p.width, p.height);
      const dmx = drawingPointer.x;
      const dmy = drawingPointer.y;

      const boundaryEdgeSnapPx = Math.max(
        10 / (propertyRef.current?.scale ?? defaultScale),
        18 / (zoom || 1),
      );

      let lineIndex =
        (stepSelectorRefs.scale.current || stepSelectorRefs.setback.current) && isPolygonClosed
          ? closestBoundaryLineIndexWithinDistance(points, lines, dmx, dmy, boundaryEdgeSnapPx)
          : calculateLineIndexOfClosestLine(points, lines, dmx, dmy);

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const buildings = buildingsGroupRef.current;
      const garbage = garbageRef.current;
      // const bikeParking = bikeParkingRef.current;

      if (
        buildings?.buildings?.length &&
        p.keyIsDown(p.SHIFT) &&
        property &&
        approach &&
        parking &&
        garbage &&
        (stepSelectorRefs.building.current || stepSelectorRefs.moving.current)
      ) {
        const edgeHitMax = Math.max(14 / property.scale, 22 / zoom);
        for (let bi = buildings.buildings.length - 1; bi >= 0; bi--) {
          const bd = buildings.buildings[bi];
          if (
            bd.polygonNodeEditMode &&
            tryInsertVertexOnBuildingEdge(p, bd, dmx, dmy, edgeHitMax)
          ) {
            visibilityGraphSolverRef.current = runVisibilityGraphSolver(
              visibilityGraphSolverRef.current,
              bd,
              parking,
              property,
              garbage,
              approach,
            );
            return;
          }
        }
      }

      // if (approach) {
      //   isHovered.approach = approach.isMouseHovering();
      //   isHovered.approachOffset = approach.isMouseHoveringOffset();
      // }
      // if (parking) {
      //   isHovered.parking = parking.isMouseHovering();
      //   isHovered.parkingOffset = parking.isMouseHoveringOffset();
      //   isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();
      // }

      // if (buildings?.buildings?.length) {
      //   buildings.buildings.forEach((building, buildingIndex) => {
      //     if (building === null) return;
      //     isHovered.buildings[buildingIndex] = building.isMouseHovering();
      //     isHovered.buildingsOffset[buildingIndex] = building.isMouseHoveringOffset();
      //     isHovered.buildingsHandle[buildingIndex] = building.isMouseHoveringRotateHandle();
      //   })

      // }
      // if (garbage) {
      //   isHovered.garbage = garbage.isMouseHovering();
      // }
      // if (bikeParking) {
      //   isHovered.bikeParking = bikeParking.isMouseHovering();
      // }

      // ALL THINGS CREATE EVERYTIHNG

      if (stepSelectorRefs.everything.current === true) {
        const defaultEdges = (p: p5) => {
          const globalAngle = 0;
          let propertyCorners = [
            p.createVector(140, 80),
            p.createVector(p.width - 180, 50),
            p.createVector(p.width - 180, p.height / 2 + 10),
            p.createVector(p.width - 135, p.height - 120),
            p.createVector(p.width / 2 - 140, p.height - 150),
            p.createVector(108, p.height - 220),
          ];
          propertyCorners = rotateCorners(p, propertyCorners, globalAngle);
          return propertyCorners;
        }


        pointsRef.current =defaultEdges(p).map(point=>({x:point.x,y:point.y}))


        const propertyCorners = defaultEdges(p);
        const isClockwise = getIsClockwise(propertyCorners)
        const setbacks = [5, 5, 5, 0, 0, 10];

        const _property = new Property(p, propertyCorners, isClockwise, scaleRef.current || defaultScale, setbacks);
        propertyRef.current = _property;
        propertyRef.current.initialize()
        propertyRef.current.propertyCorners = propertyCorners;
        propertyRef.current.calculateCornerOffsetsFromSetbacks();


        const property = propertyRef.current;
        const approachIndex = 0;
        const approachEdge = propertyRef.current.propertyEdges[approachIndex]
        const midpoint = approachEdge.getMidpoint();
        const approachWidth = property.approachWidth / property.scale;
        const approachAngle = approachEdge.calculateAngle();
        const centerOfProperty = calculateCentroid(propertyRef.current.propertyCorners)
        const parkingWidth = 24 / propertyRef.current.scale;
        const buildingDefault = 30 / propertyRef.current.scale;
        const bikeParkingDefault = 10 / propertyRef.current.scale;

        property.approachEdge = approachEdge
        property.approachEdgeIndex = approachIndex

        // buildingsGroupRef.current = new BuildingsGroup(p);


        approachRef.current = new Approach(p, midpoint, approachWidth, 20, approachAngle + 180, ESitePlanObjects.Approach, property.scale);
        approachRef.current.initialize();

        parkingRef.current = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 100, approachAngle + 180, ESitePlanObjects.ParkingWay, propertyRef.current.scale);
        parkingRef.current.initializeParking(propertyRef.current, null, approachRef.current)


        // // *** TO UNDO
        parkingRef.current.updateParkingLot(property, buildings?.buildings, garbageRef.current, approach)
        // parkingRef.current.updateStallCorners();
        // parkingRef.current.updateParkingHeight(propertyRef.current.cornerOffsetsFromSetbacks);



        garbageRef.current = new Garbage(p, getCenterPoint(p,
          parkingRef.current.sitePlanElementEdges[0].point1,
          parkingRef.current.sitePlanElementEdges[0].point2 || defaultVector),
          12 / propertyRef.current.scale,
          7 / propertyRef.current.scale, parkingRef.current.angle, ESitePlanObjects.Garbage, propertyRef.current.scale);
        garbageRef.current.initialize();
        garbageRef.current.updateCenterGarbage(parkingRef.current);





        buildingsGroupRef?.current?.addBuilding(p, p.createVector(300, 400), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, propertyRef.current.scale, 20)

        bikeParkingRef.current = new BikeParking(p, p.createVector(400, 500), bikeParkingDefault, bikeParkingDefault, approachAngle, ESitePlanObjects.Building, propertyRef.current.scale);
        bikeParkingRef.current.initialize();



        stepSelectorRefs.everything.current = false;
        stepSelectorRefs.moving.current = true;


        parkingRef.current.updateParkingLot(property, buildings?.buildings, garbageRef.current, approachRef.current)
        
        parkingRef.current.calculateParkingOutline(property, garbageRef.current, approachRef.current);


      }

      // ALL THINGS UPLOAD
      if (stepSelectorRefs.upload.current) { return }

      // ALL THINGS PROPERTY BOUNDARY
      else if (stepSelectorRefs.points.current) {

        const hitRadius = Math.max(6, 12 / zoom);
        const snappedClick = parcelBoundarySnapClosedLoop(
          dmx,
          dmy,
          zoom,
          points,
          !isPolygonClosed,
          isPolygonClosed,
        );
        const clickX = snappedClick.x;
        const clickY = snappedClick.y;

        const canCloseParcel =
          points.length > 2 &&
          !isPolygonClosed &&
          p.dist(points[0].x, points[0].y, clickX, clickY) < hitRadius;

        if (canCloseParcel) {
          isPolygonClosedRef.current = true;
          setIsPolygonClosedState(true);

          const newLine: Line = {
            start: points.length - 1,
            end: 0,
            color: "#000000", // Default line color
            index: lines.length,
            selected: false,
            isApproach: false,
            isScale: false,
            isSetback: false,
            setback: 0,
          };

          setbacks.push(0);
          lines.push(newLine);


          let propertyCorners = points.map((point) => p.createVector(point.x, point.y));

          const isClockwise = getIsClockwise(propertyCorners);
          if (isClockwise) {
            const first = propertyCorners[0];
            const rest = propertyCorners.slice(1, propertyCorners.length).reverse();

            const firstPoint = points[0];
            const restPoints = points.slice(1, points.length).reverse();

            propertyCorners = [first, ...rest];
            pointsRef.current = [firstPoint, ...restPoints];
          }
          const _property = new Property(p, propertyCorners, isClockwise, scaleRef.current || defaultScale, setbacks);
          propertyRef.current = _property;
          propertyRef.current.initialize();
          propertyRef.current.propertyCorners = propertyCorners;
        } else {
          const pointIndex = points.findIndex(
            (point) => p.dist(point.x, point.y, clickX, clickY) < hitRadius,
          );

          if (pointIndex !== -1) {
            draggingPointIndexRef.current = pointIndex;
          } else if (!isPolygonClosed) {
            points.push({ x: clickX, y: clickY });
            if (points.length > 1) {
              const newLine: Line = {
                start: points.length - 2,
                end: points.length - 1,
                color: "#000000", // Default line color
                index: lines.length,
                selected: false,
                isApproach: false,
                isScale: false,
                isSetback: false,
                setback: 0,
              };

              setbacks.push(0);
              lines.push(newLine);
            }
          }
        }
      }

      // ALL THINGS SCALE
      else if (stepSelectorRefs.scale.current) {
        if (isPolygonClosed && lineIndex !== -1) {
          selectedLineIndexRef.current = lineIndex;
          if (!inputScaleRef.current && !scale) {
            lines[lineIndex].isScale = !lines[lineIndex].isScale;
            if (propertyRef.current) {
              propertyRef.current.propertyEdges[lineIndex].isScale = lines[lineIndex].isScale;
            }

          }
        }

        const scaleLine = lines.find((ln) => ln.isScale);
        reportCanvasScaleBoundaryRef.current(scaleLine ? scaleLine.index : null);
      }

      // ALL THINGS SETBACK
      else if (stepSelectorRefs.setback.current) {
        if (isPolygonClosed && lineIndex !== -1) {
          selectedLineIndexRef.current = lineIndex;
          lines[lineIndex].isSetback = !lines[lineIndex].isSetback;
          if (propertyRef.current) {
            propertyRef.current.propertyEdges[lineIndex].isSetback = lines[lineIndex].isSetback;

          }
          reportCanvasSetbackActivatedLineRef.current(lines[lineIndex].index);
        }
      }

      // ALL THINGS APPROACH
      if (stepSelectorRefs.approach.current && !isDragging.approach) {
        if (!propertyRef.current) return;
        if (isPolygonClosed && lineIndex !== -1 && !approachRef.current) {
          const property = propertyRef.current;
          selectedLineIndexRef.current = lineIndex;
          lines[lineIndex].isApproach = !lines[lineIndex].isApproach;
          let approachIndex = lineIndex;

          // Get point closest to the edgepoint
          const approachEdge = propertyRef.current.propertyEdges[approachIndex]
          // const midpoint = approachEdge.getMidpoint();
          property.approachEdge = approachEdge
          property.approachEdgeIndex = approachIndex

          const approachWidth = property.approachWidth / property.scale;
          // const approachAngle = approachEdge.calculateAngle();

          approachRef.current = new Approach(p, p.createVector(approachTempX, approachTempY), approachWidth, 20, approachTempAngle, ESitePlanObjects.Approach, property.scale);
          approachRef.current.initialize();

        }
      }

      // ALL THINGS PARKING
      else if (stepSelectorRefs.parking.current && !parkingDragMode && !approachDragMode) {

        if (!propertyRef.current || !approachRef.current || parkingRef.current?.isInitialized) return;

        const clickInLot = allPointsInPolygon(propertyRef.current.propertyCorners, [
          p.createVector(dmx, dmy),
        ]);
        if (!truthChecker(clickInLot)) return;

        const parkingWidth = 24 / propertyRef.current.scale;
        const approachAngle = approachRef.current?.angle;
        parkingRef.current = new Parking(p, p.createVector(dmx, dmy), parkingWidth, 10, approachAngle, ESitePlanObjects.ParkingWay, propertyRef.current.scale);
        parkingRef.current.initializeParking(propertyRef.current, null, approachRef.current)


        // // *** TO UNDO
        parkingRef.current.updateParkingLot(propertyRef.current, buildingsGroupRef.current?.buildings, garbage, approach)
        // parkingRef.current.updateStallCorners();
        // parkingRef.current.updateParkingHeight(propertyRef.current.cornerOffsetsFromSetbacks);

        garbageRef.current = new Garbage(p, getCenterPoint(p, parkingRef.current.sitePlanElementEdges[0].point1, parkingRef.current.sitePlanElementEdges[0].point2 || defaultVector), 12 / propertyRef.current.scale, 5 / propertyRef.current.scale, parkingRef.current.angle, ESitePlanObjects.Garbage, propertyRef.current.scale);
        garbageRef.current.initialize();
        garbageRef.current.updateCenterGarbage(parkingRef.current);

        parkingRef.current.updateParkingLot(propertyRef.current, buildingsGroupRef.current?.buildings, garbage, approach)

      }

      // ALL THINGS BUILDING
      else if (stepSelectorRefs.building.current && !buildingDragMode) {


        if (!propertyRef.current || !approachRef.current) return;

        const clickIsInProperty = allPointsInPolygon(
          propertyRef.current.propertyCorners,
          [p.createVector(dmx, dmy)],
        );


        // Place the building (Shift is reserved for node editing — add vertex)
        if (
          !p.keyIsDown(p.SHIFT) &&
          !isHovered.approach &&
          !isHovered.parking &&
          !isHovered.parkingOffset &&
          !isHovered.parkingHandle &&
          !isHovered.garbage &&
          truthChecker(clickIsInProperty)) {

          const approachAngle = (propertyRef.current.approachEdge?.calculateAngle() || 0) + 180;
          const buildingDefault = 30 / propertyRef.current.scale;
          buildingsGroupRef?.current?.addBuilding(
            p,
            p.createVector(dmx, dmy),
            buildingDefault,
            buildingDefault,
            approachAngle,
            ESitePlanObjects.Building,
            propertyRef.current.scale,
            20,
          );
        }
      }

      // ALL THINGS BUILDING ENTRANCES
      else if (stepSelectorRefs.entrances.current) {

        // isHovered.buildingOffset && 
        if (buildingsGroupRef.current && propertyRef.current && parkingRef.current && garbageRef.current && approachRef.current) {
          // HIDING ENTRANCE AND SOLVER FOR NOW

          const mouse = p.createVector(dmx, dmy);
          const closestEdgeIndex = findClosestEdge(buildingsGroupRef.current.buildings[0].sitePlanElementEdges, mouse);
          const closestEdge = buildingsGroupRef.current.buildings[0].sitePlanElementEdges[closestEdgeIndex];
          // const distance = calculatePointToEdgeDistance(closestEdge, mouse);


          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle() - 90;
          const intersection = closestEdge.calculateClosestIntercept(dmx, dmy, p);

          let minDistance = Infinity;
          let minDistanceIndex = -1;
          buildingsGroupRef.current.buildings[0].entrances.forEach((entrance, i) => {
            const dist = p.dist(intersection.x, intersection.y, entrance.intersection.x, entrance.intersection.y);
            if (dist < minDistance) {
              minDistance = dist;
              minDistanceIndex = i;
            }
          })


          // If it is really close to another entrance, and clickm then delete. Turn the entrance with a

          if (minDistance < (5 / propertyRef.current.scale)) {
            // THEN DELETE THE ENTRANCE

            buildingsGroupRef.current.buildings[0].entrances = buildingsGroupRef.current.buildings[0].entrances.filter((_, i) => i !== minDistanceIndex)
            visibilityGraphSolverRef.current = runVisibilityGraphSolver(visibilityGraphSolverRef.current, buildingsGroupRef.current.buildings[0], parkingRef.current, propertyRef.current, garbageRef.current, approachRef.current);
          }

          else {
            // Draw the entrance
            const isAddingEntrances = stepSelectorRefs.entrances.current;
            if (isAddingEntrances) {
              // Hold off on adding entrances for now
              let lerpPos = getIntersectionPercentage(
                closestEdge,
                intersection
              ) || 0;

              const entrance = new Entrance(p, propertyRef.current.scale, lerpPos, intersection, angle, closestEdgeIndex, buildingsGroupRef.current.buildings[0].center);
              buildingsGroupRef.current.buildings[0].entrances.push(entrance)


              visibilityGraphSolverRef.current = runVisibilityGraphSolver(visibilityGraphSolverRef.current, buildingsGroupRef.current.buildings[0], parkingRef.current, propertyRef.current, garbageRef.current, approachRef.current);

            }

          }
        }

      }

      // ALL THINGS BIKE PARKING
      else if (stepSelectorRefs.bikeParking.current && !bikeParkingDragMode) {
        // if (!propertyRef.current || !approachRef.current || bikeParkingRef.current?.isInitialized) return;

        // const clickIsInProperty = allPointsInPolygon(propertyRef.current.propertyCorners, [p.createVector(mx, my)]);


        // // Place the bike parking
        // if (!bikeParkingRef.current?.isInitialized &&
        //   !isHovered.approach &&
        //   !isHovered.parking &&
        //   !isHovered.parkingOffset &&
        //   !isHovered.parkingHandle &&
        //   !isHovered.garbage &&
        //   !Object.values(isHovered.buildings).some(Boolean) &&
        //   truthChecker(clickIsInProperty)) {


        //   const approachAngle = (propertyRef.current.approachEdge?.calculateAngle() || 0) + 180;
        //   const bikeParkingDefault = 10 / propertyRef.current.scale;
        //   bikeParkingRef.current = new BikeParking(p, p.createVector(p.width / 2, p.height / 2), bikeParkingDefault, bikeParkingDefault, approachAngle, ESitePlanObjects.Building, propertyRef.current.scale);
        //   bikeParkingRef.current.initialize();

        // }
      }

      // else {
      //   // Somthing happened, just go back 
      //   return
      // }


      if (!property) return;



      if (!(
        isHovered.approach ||
        isHovered.parking ||
        Object.values(isHovered.buildings).some(Boolean) ||
        isHovered.garbage)) {
        if (approach) approach.isSelected = false;
        if (buildings) buildings.buildings.forEach(building => building.isSelected = false)
        if (parking) parking.isSelected = false;
        if (garbage) garbage.isSelected = false;
      }

      if (isHovered.approach && approach) approach.isSelected = true;
      else if (isHovered.parking && parking) parking.isSelected = true;
      else if (Object.values(isHovered.buildings).some(Boolean) && buildings && buildings?.buildings.length > 0) {
        const index = isHovered.buildings.findIndex(value => value === true);
        // Set all the other buildings selected to false 
        buildings.buildings.forEach(building => building.isSelected = false)


        if (index !== -1 && index < buildings.buildings.length) {
          buildings.buildings[index].isSelected = true;
        }
      }
      else if (isHovered.garbage && garbage) garbage.isSelected = true;

    };

    p.doubleClicked = () => {
      if (stepSelectorRefs.upload.current) return;
      const mx = p.mouseX;
      const my = p.mouseY;
      if (mx < 0 || mx > p.width || my < 0 || my > p.height) return;

      const cv = canvasRef.current?.querySelector("canvas");
      if (!(cv instanceof HTMLElement)) return;
      const r = cv.getBoundingClientRect();
      const clientX = r.left + (mx / p.width) * r.width;
      const clientY = r.top + (my / p.height) * r.height;
      if (!isTopElementUnderSketchPixel(clientX, clientY)) return;

      const d = screenToDrawingCoords(mx, my, zoom, offsetX, offsetY, p.width, p.height);
      const grp = buildingsGroupRef.current;
      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const garbage = garbageRef.current;
      if (!grp?.buildings?.length || !property || !approach || !parking || !garbage) return;
      const canEdit =
        stepSelectorRefs.building.current ||
        stepSelectorRefs.moving.current ||
        stepSelectorRefs.entrances.current ||
        stepSelectorRefs.sidewalks.current;
      if (!canEdit) return;

      for (let i = grp.buildings.length - 1; i >= 0; i--) {
        const b = grp.buildings[i];
        if (!b?.isInitialized) continue;
        if (b.isPointInFootprint(d.x, d.y)) {
          grp.buildings.forEach((ob) => {
            if (ob && ob !== b) ob.exitPolygonNodeEditMode();
          });
          const wasEditing = b.polygonNodeEditMode;
          if (wasEditing) b.exitPolygonNodeEditMode();
          else {
            b.enterPolygonNodeEditMode();
          }
          visibilityGraphSolverRef.current = runVisibilityGraphSolver(
            visibilityGraphSolverRef.current,
            b,
            parking,
            property,
            garbage,
            approach,
          );
          return;
        }
      }
    };

    p.mouseDragged = () => {
      // if (dialog?.isVisible) {
      //   return; // Prevents further event propagation when dialog is open
      // }

      if (!sketchPointerActiveOnCanvas) return;

      const newX = p.mouseX
      const newY = p.mouseY

      if (
        ENABLE_SITEPLAN_PAN_AND_ZOOM &&
        p.keyIsDown(p.SHIFT)
      ) {
        offsetX += newX - prevMouseX;
        offsetY += newY - prevMouseY;
        prevMouseX = newX;
        prevMouseY = newY;
        return;
      }



      // ALL THINGS UPLOAD
      if (stepSelectorRefs.upload.current) { return }


      // ALL THINGS PROPERTY BOUNDARY
      else if (stepSelectorRefs.points.current) {
        const property = propertyRef.current;
        const draggingPointIndex = draggingPointIndexRef.current;
        if (draggingPointIndex !== null) {
          const points = pointsRef.current;
          const dragged = screenToDrawingCoords(newX, newY, zoom, offsetX, offsetY, p.width, p.height);
          points[draggingPointIndex] = { x: dragged.x, y: dragged.y };


          if (property) {
            property.updateCornersAndEdgesPositions(points);

          }
        }
      }

      // ALL THINGS SCALE
      else if (stepSelectorRefs.scale.current) {

      }

      // ALL THINGS SETBACK
      else if (stepSelectorRefs.setback.current) {

      }

      // ALL THINGS APPROACH
      else if (stepSelectorRefs.approach.current) {


      }

      // ALL THINGS BUILDING
      else if (stepSelectorRefs.building.current) {

      }

      // ALL THINGS PARKING
      else if (stepSelectorRefs.parking.current) {

      }
      // ALL THINGS Moving
      else if (stepSelectorRefs.moving.current) {

      }

      // else {
      //   // Somthing happened, just go back 
      //   return
      // }

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const buildings = buildingsGroupRef.current;
      const garbage = garbageRef.current;


      if (!property) return;


      const worldPointer = screenToDrawingCoords(newX, newY, zoom, offsetX, offsetY, p.width, p.height);

      if (approach) isHovered.approach = approach.isMouseHovering();

      if (parking) {
        isHovered.parking = parking.isMouseHovering();
        isHovered.parkingOffset = parking.isMouseHoveringOffset();
        isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();
      }

      if (buildings?.buildings?.length) {
        buildings.buildings.forEach((building, buildingIndex) => {
          if (building === null) return;
          isHovered.buildings[buildingIndex] = building.isMouseHovering();
          isHovered.buildingsOffset[buildingIndex] = building.isMouseHoveringOffset();
          isHovered.buildingsHandle[buildingIndex] = building.isMouseHoveringRotateHandle();
        })

      }



      if (buildings?.buildings?.length) {
        buildings.buildings.forEach((building, buildingIndex) => {

          if ((
            building !== null && buildingDragMode !== null && (
              isHovered.buildings[buildingIndex] ||
              isHovered.buildingsOffset[buildingIndex] ||
              isHovered.buildingsHandle[buildingIndex] ||
              buildings?.buildings[buildingIndex].hoverHandleIndex !== -1 ||
              isDragging.buildings[buildingIndex]

            )) &&
            buildings?.buildings[buildingIndex].isInitialized &&

            isNoOtherIsTrue(isDragging.buildings, buildingIndex)

          ) {
            isDragging.buildings[buildingIndex] = true;


            handleBuildingDrag(
              p,
              property, approach, parking, buildings.buildings[buildingIndex], garbage,
              buildingDragMode,
              resizeCorner,
              resizeEdge,
              resizingbuildingsRef,
              visibilityGraphSolverRef,
              worldPointer,
            )

          }

        })

      }


      // Moving the building


      // Dragging the parking lot
      if (
        parking !== null && parkingDragMode !== null && (
          isHovered.parking ||
          isDragging.parking ||
          isHovered.parkingHandle ||
          parking?.hoverHandleIndex !== -1)

      ) {

        if (approach && parking && garbage && buildings?.buildings) {
          isDragging.parking = true;
          handleParkingDrag(
            p,
            property, approach, parking, garbage, buildings.buildings,
            parkingDragMode,
            isRotationFrozenRef,
            visibilityGraphSolverRef,
          )

        }
      }

      // Move the approach
      else if (isHovered.approach || isDragging.approach) {
        if (approach && buildings?.buildings) {

          isDragging.approach = true;
          handleApproachDrag(
            p,
            property, approach, parking, garbage, buildings.buildings,
            isRotationFrozenRef,
            approachDragMode,
            visibilityGraphSolverRef,

          )
        }
      }


      // Update driveway area on every drag
      if (approach !== null && parking !== null) {
        // drivewayArea = calculateDrivewayArea(approach.p, approach, parking)
        parking.parkingArea = Math.round(parking.width * parking.height * property.scale * property.scale);
        approach.approachArea = calculateApproachArea(approach)
        parking.parkingStallsArea = getParkingStallArea(parking)
      }
    };

    p.mouseReleased = () => {
      sketchPointerActiveOnCanvas = false;

      // const property = propertyRef.current;
      // const approach = approachRef.current;
      const parking = parkingRef.current;
      const buildings = buildingsGroupRef.current;
      // const garbage = garbageRef.current;


      draggingPointIndexRef.current = null;
      selectedLineIndexRef.current = null;

      isDragging.parking = false;
      isDragging.approach = false;
      isDragging.parkingOffset = false;
      isDragging.buildings = isDragging.buildings.map(_ => false);

      buildingDragMode = null;
      parkingDragMode = null;
      approachDragMode = null;


      // resizeEdges = null;
      resizeCorner = null;
      resizeEdge = null;
      resizingbuildingsRef.current = false;

      if (buildings) {
        buildings.buildings.forEach(building => {
          building.hoverHandleIndex = -1;
          building.isRotating = false;
          building.isSelected = false
        })

      }
      if (parking) {
        parking.isRotating = false;
        parking.isSelected = false
      }


    };

    // Draw a custom cursor (Crosshair or Custom Image)
    const drawCustomCursor = () => {
      p.push();
      p.stroke(25, 25, 25);
      p.strokeWeight(2);
      p.line(p.mouseX - 10, p.mouseY, p.mouseX + 10, p.mouseY); // Horizontal line
      p.line(p.mouseX, p.mouseY - 10, p.mouseX, p.mouseY + 10); // Vertical line
      p.pop();
    };

  };
}

function updateGlobalVariables(
  property: Property | null, approach: Approach | null, parking: Parking | null, buildingsGroup: (BuildingsGroup | null) | null, garbage: Garbage | null, bikeParking: BikeParking | null,
  formData: FormDataInputs
) {
  if (property) {
    property.imperviousSurfacePercentageAllowed = formData.imperviousSurfacePercentageAllowed
    property.buildingCoveragePercentage = formData.buildingCoveragePercentage;
    property.enableAngles = formData.enableAngles;
    property.enableLineLengths = formData.enableLineLengths;
    property.approachWidth = formData.approachWidth;
  }


  // Pull in the data from above.
  if (approach) {
    approach.propertyEntranceCount = formData.propertyEntranceCount;
    approach.enableApproachDimensions = formData.enableApproachDimensions;

    if (property) {
      property.approachWidth = formData.approachWidth
      approach.updateWidth(Number(formData.approachWidth) / property.scale)
    }

  }

  if (parking) {
    parking.parkingPer1000Max = formData.parkingPer1000Max;
    parking.parkingPer1000Min = formData.parkingPer1000Min;
    parking.parkingPer1000Min = formData.parkingPerUnit;
    parking.landscapeIsland = formData.landscapeIsland;
    parking.halfStreetDriveway = formData.halfStreetDriveway;
    parking.showDrivewayControlPoints = formData.showDrivewayControlPoints;
    parking.parkingSide = formData.parkingSide;
  }


  if (buildingsGroup) {
    buildingsGroup.buildings.forEach(building => {
      building.buildingAreaTarget = formData.buildingAreaTarget;
      building.buildingCount = formData.buildingCount
      building.enableBuildingDimensions = formData.enableBuildingDimensions;
      building.buildingDimensionsDisplayedOnTheInside = formData.buildingDimensionsDisplayedOnTheInside;

      building.updateBuildingTargetArea(Number(formData.buildingAreaTarget));
      building.showbuildingArea = formData.showbuildingArea;
    })

  }


  if (garbage) { }
  if (bikeParking) { }

  if (approach && parking && property && garbage) {
    property.drivewayWidth = formData.drivewayWidth;
    property.taperedDriveway = formData.taperedDriveway;

    property.hasGarbageEnclosure = formData.hasGarbageEnclosure;

    parking.updateParkingGlobals(
      property,
      Number(formData.parkingStalls) || 0,
      Number(formData.handicappedParkingStalls) || 0,
      Number(formData.compactParkingStalls) || 0,
      garbage,
      buildingsGroup?.buildings,
      approach,
    );
    parking.updateWidth(Number(formData.drivewayWidth) / property.scale);

    parking.calculateParkingOutline(property, garbage, approach)


  }
}



function isNoOtherIsTrue(array: boolean[], currentIndex: number): boolean {
  return array.filter((_element, index) => index != currentIndex).every(value => value === false);
}

/** Hover preview before the approach is committed. Must not mutate `p.frameCount` (was causing rapid blink). */
function tempApproach(
  p: p5,
  x: number,
  y: number,
  angleDegrees: number,
  approachWidthFeet: number,
  approachDepthFeet: number,
  drawingScale: number,
) {
  const w = Math.max(approachWidthFeet / drawingScale, 8);
  const d = Math.max(approachDepthFeet / drawingScale, 8);

  p.push();
  p.angleMode(p.DEGREES);
  p.rectMode(p.CENTER);
  p.translate(x, y);
  p.rotate(angleDegrees);
  p.noFill();
  p.stroke(45, 200, 40, 240);
  p.strokeWeight(2);
  p.rect(0, 0, w, d, 4);
  p.pop();
}


// Function to convert screen mouse coordinates to world coordinates
const screenToWorld = (p: p5, mx: number, my: number, zoom: number, offsetX: number, offsetY: number) => {
  const worldX = (mx - p.width / 2 - offsetX) / zoom;
  const worldY = (my - p.height / 2 - offsetY) / zoom;
  return { worldX, worldY };
};
