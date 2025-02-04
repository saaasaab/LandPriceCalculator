import p5 from "p5";
import { useRef } from "react";

import { IPoint, Line } from "./SitePlanDesigner";
import RotateArrow from "../../assets/rotateArrow.png"


import { allPointsInPolygon, calculateApproachArea, calculateCentroid, calculateLineIndexOfClosestLine, calculatePointToEdgeDistance, calculateScale, displayImage, drawArea, drawInstructionsToScreen, drawNeonEllipse, drawProtoPropertyLines, falseChecker, findClosestEdge, FormDataInputs, getCenterPoint, getIsClockwise, getParkingStallArea, handleApproachDrag, handleBuildingDrag, handleParkingDrag, rotateCorners, truthChecker } from "../../utils/SiteplanGeneratorUtils";
import { Property } from "./SitePlanClasses/Property";
import { Parking } from "./SitePlanClasses/Parking";
import { Garbage } from "./SitePlanClasses/Garbage";
import { Approach } from "./SitePlanClasses/Approach";
import { VisibilityGraph } from "../VisibilityGraph";
import { BikeParking } from "./SitePlanClasses/BikeParking";
import { BuildingsGroup } from './SitePlanClasses/BuildingsGroup'
import { ConfirmDialog } from "./SitePlanClasses/ConfirmDialog";
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
    bikeParking: React.MutableRefObject<boolean>;
    everything: React.MutableRefObject<boolean>;
    moving: React.MutableRefObject<boolean>;
  };
  clearEverythingRef: React.MutableRefObject<boolean>;

  // inboundMetricsRef: React.MutableRefObject<FormDataInputs>;
  // setOutboundMetrics: React.Dispatch<React.SetStateAction<SiteMetrics>>;
  formData: FormDataInputs;
  imageOpacityRef: React.MutableRefObject<number>;
  propertyRef: React.MutableRefObject<Property | null>;
  approachRef: React.MutableRefObject<Approach | null>;
  parkingRef: React.MutableRefObject<Parking | null>;
  buildingsGroupRef: React.MutableRefObject<(BuildingsGroup | null)>
  garbageRef: React.MutableRefObject<Garbage | null>;
  bikeParkingRef: React.MutableRefObject<BikeParking | null>;
  visibilityGraphSolverRef: React.MutableRefObject<VisibilityGraph | null>

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
    formData,
    imageOpacityRef,
    propertyRef,
    approachRef,
    parkingRef,
    buildingsGroupRef,
    garbageRef,
    bikeParkingRef,

    visibilityGraphSolverRef,

  } = params;
  const defaultScale = 0.25;
  let pathCellIndex = 0;



  updateGlobalVariables(
    propertyRef.current, approachRef.current, parkingRef.current, buildingsGroupRef.current, garbageRef.current, bikeParkingRef.current,
    formData
  )
  // if (bikeParkingRef.current) {

  // }
  let dialog: ConfirmDialog;

  let buildingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let parkingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let approachDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let bikeParkingDragMode: string | null = null; // null, 'center', 'edge', 'corner'

  let resizeEdge: number | null = null;
  // let resizeEdges: number[] | null = null
  let resizeCorner: number | null = null;
  // let drivewayArea = 0;
  let isRotationFrozenRef = useRef<boolean>(false);
  let resizingbuildingsRef = useRef<boolean>(false);

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

    p.preload = () => {
      if (imageURL) {
        img = p.loadImage(imageURL);
      }


    };

    p.setup = () => {
      p.frameRate(10);
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

      const insideCanvas =
        event.clientX >= canvasBounds.left &&
        event.clientX <= canvasBounds.right &&
        event.clientY >= canvasBounds.top &&
        event.clientY <= canvasBounds.bottom;

      if (!event || !insideCanvas) return;

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

      p.push();
      p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
      p.scale(zoom);
      p.translate(-p.width / 2, -p.height / 2);

      // Example neon shape
      // p.fill(255, 0, 0);
      // p.ellipse(400, 300, 150, 100);

      const newX = p.mouseX
      const newY = p.mouseY

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const buildingsGroup = buildingsGroupRef.current;
      const garbage = garbageRef.current;

      const isUploadingImage = stepSelectorRefs.upload.current;
      const isPolygonClosed = isPolygonClosedRef.current;

      if (isUploadingImage) return

      if (stepSelectorRefs.points.current || stepSelectorRefs.scale.current) {
        calculateScale(inputScaleRef, linesRef, pointsRef, scaleRef, propertyRef);
      }

      displayImage(p, img, rectSize, imageOpacityRef.current);



      if (property) {
        property.drawProperty();
        property.drawSetbackPolygon();
        property.drawLineLengths();


        if (property.enableAngles) {
          property.drawAnglesBetweenLines()
        }
      }
      else {
        drawProtoPropertyLines(p, pointsRef, linesRef, scaleRef.current || defaultScale);
        return;

      }



      if (approach) {
        isHovered.approach = approach.isMouseHovering();
        isHovered.approachOffset = approach.isMouseHoveringOffset();
      }
      if (parking) {
        isHovered.parking = parking.isMouseHovering();
        isHovered.parkingOffset = parking.isMouseHoveringOffset();
        isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();


        // // if the parking lot needs to be recalculated. 

        // const stalls = countParkingStalls(parking);
        // const maxStallCount = Math.max(stalls.leftStalls, stalls.rightStalls);


        // if (maxStallCount !== parking.parkingStallsNumber) {
        //   isRecalculatingParking = true
        // }
        // else{
        //   isRecalculatingParking = false
        // }

        // if (isRecalculatingParking) {



        //     parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
        //     parking.updateStallCorners(true);
        //     parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);

        //     // garbage.updateCenterGarbage(parking);

        // }

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


          if (parkingDragMode !== null) {
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
        // parking.drawParkingOutline(p, property, parking, garbage, approach);
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
              p.arc(0, 0, enteranceWidth / property.scale, enteranceWidth / property.scale, 0, 90, p.PIE);

              p.pop();
            }
          }


          // Check if we're hovering over a building corner, edge, or center
          if ((isHovered.buildings[buildingIndex] ||
            isHovered.buildingsOffset[buildingIndex] ||
            isHovered.buildingsHandle[buildingIndex] ||
            building.isRotating
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


            if (!anyCornerHover) {
              building.sitePlanElementCorners.forEach((corner, i) => {
                // if (this.buildingDragMode) return
                if (p.dist(newX, newY, corner.x, corner.y) < 20) {
                  buildingDragMode = 'corner';
                  // const _resizeEdges = getAdjacentIndices(i, building.sitePlanElementEdges.length);
                  // const totalVertices = building.sitePlanElementEdges.length
                  // resizeEdges = [_resizeEdges[0], (_resizeEdges[1] - 1 + totalVertices) % totalVertices]
                  resizeCorner = i;
                  resizeEdge = null;
                  anyCornerHover = true;
                }
              });

            }
            if (!anyCornerHover) {
              const mouse = p.createVector(newX, newY)
              const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
              const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
              const distance = calculatePointToEdgeDistance(closestEdge, mouse);
              if (distance <= 20) {
                buildingDragMode = 'edge';
                // resizeEdges = null;
                resizeCorner = null;
                resizeEdge = closestEdgeIndex;
              }
            }

            if (!anyCornerHover && isHovered.buildingsHandle[buildingIndex]) {
              building.showRotationAnimationCount = 0;
              const index = building.getMouseHoveringRotateHandleIndex();
              const handle = building.rotationHandles[index];

              if (p.dist(newX, newY, handle.x, handle.y) < 30) {
                buildingDragMode = 'rotate';
                // resizeEdges = null;
                resizeCorner = null;
                resizeEdge = null;
                anyCornerHover = true;
              }
            }
            if (!anyCornerHover) {
              if (p.dist(newX, newY, building.center.x, building.center.y) < 20) {
                buildingDragMode = 'center';
                // resizeEdges = null;
                resizeCorner = null;
                resizeEdge = null;
              }
            }

            if (buildingDragMode !== null) {
              building.drawBuildingEditOptions();
            }

            if (buildingDragMode === "corner") p.cursor('nesw-resize');
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

      if (visibilityGraphSolverRef.current) {
        // pathCellIndex++
        // visibilityGraphSolverRef.current.displaySolution(p, pathCellIndex)


        // Display the shortest path for a specific start-end pair
        visibilityGraphSolverRef.current.displayShortestPaths(p);
        // visibilityGraphSolverRef.current.displaySteinerTree(p);

        // visibilityGraphSolverRef.current.displayPathsAsPolygons(p);

        const maxPathStatesLength = visibilityGraphSolverRef.current.edges.length;
        if (pathCellIndex > maxPathStatesLength + 30) {
          pathCellIndex = 0
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

        if (prevMouseX !== p.mouseX && prevMouseY !== p.mouseY) {


          if (!property) return;
          prevMouseX = p.mouseX;
          prevMouseY = p.mouseY;



          const mouse = p.createVector(p.mouseX, p.mouseY);
          const closestEdgeIndex = findClosestEdge(property.propertyEdges, mouse)
          const closestEdge = property.propertyEdges[closestEdgeIndex];
          // const distance = calculatePointToEdgeDistance(closestEdge, mouse);


          // get the point on the line where the entrance should interesect
          const angle = closestEdge.calculateAngle();
          const intersection = closestEdge.calculateClosestIntercept(
            p.mouseX, p.mouseY,
            p
          );

          approachTempX = intersection.x;
          approachTempY = intersection.y;
          approachTempAngle = angle
        }


        if (approachTempX !== 0 && approachTempY !== 0) {
          tempApproach(p, approachTempX, approachTempY, approachTempAngle);
        }
      }



      p.fill("#3b82f6")
      p.ellipse(p.mouseX, p.mouseY, 10, 10)
      // Draw the custom cursor
      drawCustomCursor();
      p.pop();


      p.push();

      drawArea(p, isPolygonClosedRef.current, pointsRef, scaleRef.current || defaultScale);
      drawInstructionsToScreen(p, pointsRef, img, isPolygonClosed, stepSelectorRefs.approach, stepSelectorRefs.scale, stepSelectorRefs.setback);
      dialog?.draw(p);


      p.pop();
    };


    p.keyPressed = (key: { key: string }) => {

      // DELETES THE BUILDING
      if (key.key === "Backspace" && Object.values(isHovered.buildings).some(Boolean)) {
        const index = isHovered.buildings.findIndex(value => value === true);

        dialog = new ConfirmDialog(p, p.width / 2, p.height / 2, 300, 120,
          () => {
            if (buildingsGroupRef.current === null) return

            buildingsGroupRef.current.buildings = buildingsGroupRef.current.buildings.filter((_building, buildingIndex) => buildingIndex !== index)
          },
          () => console.log("Canceled!"));
        dialog.show();
        return
      }
    }
    p.mousePressed = () => {


      if (dialog?.isVisible) {
        dialog.mousePressed(p);
        return; // Prevents further event propagation when dialog is open
      }

      prevMouseX = p.mouseX
      prevMouseY = p.mouseY
      const points = pointsRef.current;
      const lines = linesRef.current;
      const setbacks = setbacksRef.current;
      const scale = scaleRef.current;

      const isPolygonClosed = isPolygonClosedRef.current;

      const mx = p.mouseX
      const my = p.mouseY


      if (mx < 0 || mx > p.width || my < 0 || my > p.height) return;

      let lineIndex = calculateLineIndexOfClosestLine(points, lines, mx, my)

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const buildings = buildingsGroupRef.current;
      const garbage = garbageRef.current;
      // const bikeParking = bikeParkingRef.current;


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
        const centerOfProperty = calculateCentroid(propertyRef.current.cornerOffsetsFromSetbacks)
        const parkingWidth = 24 / propertyRef.current.scale;
        const buildingDefault = 30 / propertyRef.current.scale;
        const bikeParkingDefault = 10 / propertyRef.current.scale;

        property.approachEdge = approachEdge
        property.approachEdgeIndex = approachIndex

        // buildingsGroupRef.current = new BuildingsGroup(p);


        approachRef.current = new Approach(p, midpoint, approachWidth, 20, approachAngle + 180, ESitePlanObjects.Approach, property.scale);
        approachRef.current.initialize();

        parkingRef.current = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 100, approachAngle + 180, ESitePlanObjects.ParkingWay, propertyRef.current.scale);
        parkingRef.current.initializeParking(propertyRef.current, approachRef.current)


        // // *** TO UNDO
        parkingRef.current.updateParkingLot(property, buildings?.buildings)
        // parkingRef.current.calculateNumberOfFittableStalls(propertyRef.current.cornerOffsetsFromSetbacks);
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
      }

      // ALL THINGS UPLOAD
      if (stepSelectorRefs.upload.current) { return }

      // ALL THINGS PROPERTY BOUNDARY
      else if (stepSelectorRefs.points.current) {

        // Check if a point is clicked
        const pointIndex = points.findIndex((point) => p.dist(point.x, point.y, mx, my) < 10);

        if (pointIndex !== -1) {
          // Start dragging the clicked point
          draggingPointIndexRef.current = pointIndex;
        }


        else if (!isPolygonClosed) {
          // Add a new point
          points.push({ x: mx, y: my });
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
              setback: 0
            };

            setbacks.push(0);
            lines.push(newLine);
          }
        }

        // Close the polygon if the first and last points are clicked
        if (points.length > 2 &&
          p.dist(points[0].x, points[0].y, mx, my) < 10 &&
          !isPolygonClosed) {
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
            setback: 0
          };

          setbacks.push(0);
          lines.push(newLine);


          // CREATE THE PROPERTY AND SAVE IT TO STATE.
          let propertyCorners = points.map(point => p.createVector(point.x, point.y));

          const isClockwise = getIsClockwise(propertyCorners);
          if (isClockwise) {
            const first = propertyCorners[0];
            const rest = propertyCorners.slice(1, propertyCorners.length).reverse()


            const firstPoint = points[0]
            const restPoints = points.slice(1, points.length).reverse()

            // const firstLine = lines[0];
            // const restLines = lines.slice(1, lines.length).reverse()

            propertyCorners = [first, ...rest];
            pointsRef.current = [firstPoint, ...restPoints];
            // linesRef.current = [firstLine, ...restLines];
          }
          const _property = new Property(p, propertyCorners, isClockwise, scaleRef.current || defaultScale, setbacks);
          propertyRef.current = _property;
          propertyRef.current.initialize()
          propertyRef.current.propertyCorners = propertyCorners;

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
      }

      // ALL THINGS SETBACK
      else if (stepSelectorRefs.setback.current) {
        if (isPolygonClosed && lineIndex !== -1) {
          selectedLineIndexRef.current = lineIndex;
          lines[lineIndex].isSetback = !lines[lineIndex].isSetback;
          if (propertyRef.current) {
            propertyRef.current.propertyEdges[lineIndex].isSetback = lines[lineIndex].isSetback;

          }
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

        const centerOfProperty = calculateCentroid(propertyRef.current.cornerOffsetsFromSetbacks)
        const parkingWidth = 24 / propertyRef.current.scale;
        const approachAngle = approachRef.current?.angle;
        parkingRef.current = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 10, approachAngle, ESitePlanObjects.ParkingWay, propertyRef.current.scale);
        parkingRef.current.initializeParking(propertyRef.current, approachRef.current)


        // // *** TO UNDO
        parkingRef.current.updateParkingLot(propertyRef.current, buildingsGroupRef.current?.buildings)
        // parkingRef.current.calculateNumberOfFittableStalls(propertyRef.current.cornerOffsetsFromSetbacks);
        // parkingRef.current.updateStallCorners();
        // parkingRef.current.updateParkingHeight(propertyRef.current.cornerOffsetsFromSetbacks);

        garbageRef.current = new Garbage(p, getCenterPoint(p, parkingRef.current.sitePlanElementEdges[0].point1, parkingRef.current.sitePlanElementEdges[0].point2 || defaultVector), 12 / propertyRef.current.scale, 5 / propertyRef.current.scale, parkingRef.current.angle, ESitePlanObjects.Garbage, propertyRef.current.scale);
        garbageRef.current.initialize();
        garbageRef.current.updateCenterGarbage(parkingRef.current);
      }

      // ALL THINGS BUILDING
      else if (stepSelectorRefs.building.current && !buildingDragMode) {


        if (!propertyRef.current || !approachRef.current) return;

        const clickIsInProperty = allPointsInPolygon(propertyRef.current.propertyCorners, [p.createVector(mx, my)]);


        // Place the building
        if (
          !isHovered.approach &&
          !isHovered.parking &&
          !isHovered.parkingOffset &&
          !isHovered.parkingHandle &&
          !isHovered.garbage &&
          truthChecker(clickIsInProperty)) {

          const approachAngle = (propertyRef.current.approachEdge?.calculateAngle() || 0) + 180;
          const buildingDefault = 30 / propertyRef.current.scale;
          buildingsGroupRef?.current?.addBuilding(p, p.createVector(mx, my), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, propertyRef.current.scale, 20);
        }
      }

      // ALL THINGS BUILDING ENTRANCES
      else if (stepSelectorRefs.entrances.current) {

        // if (isHovered.buildingOffset && buildingsGroupRef.current && propertyRef.current && parkingRef.current && garbageRef.current && approachRef.current) {
        //   // HIDING ENTRANCE AND SOLVER FOR NOW

        //   const mouse = p.createVector(mx, my)
        //   const closestEdgeIndex = findClosestEdge(buildingsGroupRef.current.buildings[0].sitePlanElementEdges, mouse)
        //   const closestEdge = buildingsGroupRef.current.buildings[0].sitePlanElementEdges[closestEdgeIndex];
        //   // const distance = calculatePointToEdgeDistance(closestEdge, mouse);


        //   // get the point on the line where the entrance should interesect
        //   const angle = closestEdge.calculateAngle() - 90;
        //   const intersection = closestEdge.calculateClosestIntercept(
        //     mx, my,
        //     p
        //   );

        //   let minDistance = Infinity;
        //   let minDistanceIndex = -1;
        //   buildingsGroupRef.current.buildings[0].entrances.forEach((entrance, i) => {
        //     const dist = p.dist(intersection.x, intersection.y, entrance.intersection.x, entrance.intersection.y);
        //     if (dist < minDistance) {
        //       minDistance = dist;
        //       minDistanceIndex = i;
        //     }
        //   })


        //   // If it is really close to another entrance, and clickm then delete. Turn the entrance with a

        //   if (minDistance < (5 / propertyRef.current.scale)) {
        //     // THEN DELETE THE ENTRANCE

        //     buildingsGroupRef.current.buildings[0].entrances = buildingsGroupRef.current.buildings[0].entrances.filter((_, i) => i !== minDistanceIndex)
        //     visibilityGraphSolverRef.current = runVisibilityGraphSolver(visibilityGraphSolverRef.current, buildingsGroupRef.current.buildings[0], parkingRef.current, propertyRef.current, garbageRef.current, approachRef.current);
        //   }

        //   else {
        //     // Draw the entrance
        //     const isAddingEntrances = stepSelectorRefs.entrances.current;
        //     if (isAddingEntrances) {
        //       // Hold off on adding entrances for now
        //       let lerpPos = getIntersectionPercentage(
        //         closestEdge,
        //         intersection
        //       ) || 0;

        //       const entrance = new Entrance(p, propertyRef.current.scale, lerpPos, intersection, angle, closestEdgeIndex, buildingsGroupRef.current.buildings[0].center);
        //       buildingsGroupRef.current.buildings[0].entrances.push(entrance)


        //       visibilityGraphSolverRef.current = runVisibilityGraphSolver(visibilityGraphSolverRef.current, buildingsGroupRef.current.buildings[0], parkingRef.current, propertyRef.current, garbageRef.current, approachRef.current);

        //     }

        //   }
        // }

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

    p.mouseDragged = () => {
      if (dialog?.isVisible) {
        return; // Prevents further event propagation when dialog is open
      }

      const newX = p.mouseX
      const newY = p.mouseY

      if (p.keyIsDown(p.SHIFT)) {
        offsetX += newX - prevMouseX;
        offsetY += newY - prevMouseY;
        prevMouseX = newX;
        prevMouseY = newY;
        return
      }



      // ALL THINGS UPLOAD
      if (stepSelectorRefs.upload.current) { return }


      // ALL THINGS PROPERTY BOUNDARY
      else if (stepSelectorRefs.points.current) {
        const property = propertyRef.current;
        const draggingPointIndex = draggingPointIndexRef.current;
        if (draggingPointIndex !== null) {
          const points = pointsRef.current;
          points[draggingPointIndex] = { x: newX, y: newY };


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
    parking.handicappedParkingNumTarget = formData.handicappedParkingStalls
    parking.compactParkingCountTarget = formData.compactParkingStalls
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

  if (approach && parking && property ) {
    property.drivewayWidth = formData.drivewayWidth;
    property.taperedDriveway = formData.taperedDriveway;


    property.hasGarbageEnclosure = formData.hasGarbageEnclosure;


    parking.updateParkingGlobals(property, formData.parkingStalls, buildingsGroup?.buildings);
    parking.updateWidth(Number(formData.drivewayWidth) / property.scale);

  }
}



function isNoOtherIsTrue(array: boolean[], currentIndex: number): boolean {
  return array.filter((_element, index) => index != currentIndex).every(value => value === false);
}

function tempApproach(p: p5, x: number, y: number, angle: number) {
  const speed = 4
  if (p.frameCount * speed > 50) p.frameCount = 0

  p.push();

  p.rectMode(p.CENTER);
  p.translate(x, y);
  p.rotate(angle)
  p.strokeWeight(2)
  p.rect(0, 0, p.frameCount * speed, p.frameCount * speed, 4);
  p.pop();

}


// Function to convert screen mouse coordinates to world coordinates
const screenToWorld = (p: p5, mx: number, my: number, zoom: number, offsetX: number, offsetY: number) => {
  const worldX = (mx - p.width / 2 - offsetX) / zoom;
  const worldY = (my - p.height / 2 - offsetY) / zoom;
  return { worldX, worldY };
};
