import p5 from "p5";
import { useRef } from "react";

import { IPoint, Line } from "./SitePlanDesigner";
import RotateArrow from "../../assets/rotateArrow.png"


import { allPointsInPolygon, calculateApproachArea, calculateCentroid, calculateLineIndexOfClosestLine, calculatePointToEdgeDistance, calculateScale, displayImage, drawArea, drawInstructionsToScreen, drawProtoPropertyLines, findClosestEdge, FormDataInputs, getCenterPoint, getIsClockwise, getParkingStallArea, handleApproachDrag, handleBuildingDrag, handleParkingDrag, pointsAreInBoundary, truthChecker } from "../../utils/SiteplanGeneratorUtils";
import { Property } from "./SitePlanClasses/Property";
import { Parking } from "./SitePlanClasses/Parking";
import { Building } from "./SitePlanClasses/Building";
import { Garbage } from "./SitePlanClasses/Garbage";
import { Approach } from "./SitePlanClasses/Approach";
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
export const stallHeight = 8.5;

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
  };
  clearEverythingRef: React.MutableRefObject<boolean>;

  // inboundMetricsRef: React.MutableRefObject<FormDataInputs>;
  // setOutboundMetrics: React.Dispatch<React.SetStateAction<SiteMetrics>>;
  formData: FormDataInputs;
  imageOpacityRef: React.MutableRefObject<number>;

  propertyRef: React.MutableRefObject<Property | null>;
  approachRef: React.MutableRefObject<Approach | null>;
  parkingRef: React.MutableRefObject<Parking | null>;
  buildingRef: React.MutableRefObject<Building | null>;
  garbageRef: React.MutableRefObject<Garbage | null>;

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
    buildingRef,
    garbageRef,

  } = params;
  const defaultScale = 0.25;

  // const defaultEdges = (p: p5) => {
  //   const globalAngle = 0;
  //   let propertyCorners = [
  //     p.createVector(140, 80),
  //     p.createVector(p.width - 180, 50),
  //     p.createVector(p.width - 180, p.height / 2 + 10),
  //     p.createVector(p.width - 135, p.height - 120),
  //     p.createVector(p.width / 2 - 140, p.height - 150),
  //     p.createVector(108, p.height - 220),
  //   ];
  //   propertyCorners = rotateCorners(p, propertyCorners, globalAngle);

  //   return propertyCorners;
  // }



  updateGlobalVariables(
    propertyRef.current, approachRef.current, parkingRef.current, buildingRef.current, garbageRef.current,
    formData
  )
  // if (bikeParkingRef.current) {

  // }




  let buildingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let parkingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let approachDragMode: string | null = null; // null, 'center', 'edge', 'corner'

  let resizeEdge: number | null = null;
  // let resizeEdges: number[] | null = null
  let resizeCorner: number | null = null;
  // let drivewayArea = 0;
  let isRotationFrozenRef = useRef<boolean>(false);
  let resizingbuildingRef = useRef<boolean>(false);
  let isDragging = {
    parking: false,
    approach: false,
    parkingOffset: false,
    building: false,
  };


  // When an input changes in the component above, set he sketch variable here.
  if (propertyRef.current) {
    propertyRef.current.updateSetbacks(linesRef.current);
  }



  if (clearEverythingRef.current === true) {
    clearEverythingRef.current = false;

    propertyRef.current = null
    approachRef.current = null
    parkingRef.current = null
    buildingRef.current = null
    garbageRef.current = null


    buildingDragMode = null; // null, 'center', 'edge', 'corner'
    parkingDragMode = null; // null, 'center', 'edge', 'corner'
    approachDragMode = null; // null, 'center', 'edge', 'corner'

    resizeEdge = null;
    // resizeEdges: number[] | null = null
    resizeCorner = null;
    // drivewayArea = 0;
    isRotationFrozenRef.current = false;
    resizingbuildingRef.current = false;
    isDragging.parking = false;
    isDragging.approach = false;
    isDragging.parkingOffset = false;
    isDragging.building = false;
  }





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
      p.frameRate(10)
      p.clear(); // Clear the canvas
      p.angleMode(p.DEGREES);

      if (canvasRef.current && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect()

        rectSize = { width: rect.width, height: rect.height };
        const canvas = p.createCanvas(rect.width - 20, rect.height - 20);
        canvas.parent(canvasRef.current);
      }
    };

    p.draw = () => {

      const newX = p.mouseX;
      const newY = p.mouseY;

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const building = buildingRef.current;
      // const garbage = garbageRef.current;

      const isUploadingImage = stepSelectorRefs.upload.current;
      const isPolygonClosed = isPolygonClosedRef.current;
      if (isUploadingImage) return


      if (stepSelectorRefs.points.current || stepSelectorRefs.scale.current) {
        calculateScale(inputScaleRef, linesRef, pointsRef, scaleRef, propertyRef);
      }
      
      displayImage(p, img, rectSize, imageOpacityRef.current);
      drawInstructionsToScreen(p, pointsRef, img, isPolygonClosed, stepSelectorRefs.approach, stepSelectorRefs.scale, stepSelectorRefs.setback);



      if (propertyRef.current) {
        propertyRef.current.drawProperty();
        propertyRef.current.drawSetbackPolygon();
        propertyRef.current.drawLineLengths();


        if (propertyRef.current.enableAngles) {
          propertyRef.current.drawAnglesBetweenLines()
        }
      }
      else {
        drawProtoPropertyLines(p, pointsRef, linesRef, scaleRef.current || defaultScale);
      }

      if (approachRef.current) {
        approachRef.current.drawApproach();
      }


      if (parkingRef.current && garbageRef.current && approachRef.current) {
        // parkingRef.current
        parkingRef.current.drawParkingStalls();
        parkingRef.current.drawParkingOutline(p, propertyRef.current, parkingRef.current, garbageRef.current, approachRef.current)
      }

      if (buildingRef.current) {
        buildingRef.current.drawBuilding();
        if (buildingRef.current.showRotationHandles) {
          buildingRef.current.drawRotationHandles();
        }

        if (!buildingRef.current.hasStopped && buildingRef.current.isInitialized && parkingRef.current && propertyRef.current && garbageRef.current) {
          buildingRef.current.buildingLocator(p, buildingRef.current, parkingRef.current, propertyRef.current, garbageRef.current);

          // STOP THE GROWING FOR NOW.
          // building.buildingGrower(property, parking);
        }

      }




      drawArea(p, isPolygonClosedRef.current, pointsRef, scaleRef.current || defaultScale);

      if (!property) return;
      //  || !building || !garbage

      const isHovered = {
        approach: false,
        approachOffset: false,
        parking: false,
        parkingOffset: false,
        parkingHandle: false,
        building: false,
        buildingOffset: false,
        buildingHandle: false,
      };


      if (approach) {
        isHovered.approach = approach.isMouseHovering();
        isHovered.approachOffset = approach.isMouseHoveringOffset();
      }
      if (parking) {
        isHovered.parking = parking.isMouseHovering();
        isHovered.parkingOffset = parking.isMouseHoveringOffset();
        isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();
      }
      if (building) {
        isHovered.building = building.isMouseHovering();
        isHovered.buildingOffset = building.isMouseHoveringOffset();
        isHovered.buildingHandle = building.isMouseHoveringRotateHandle();
      }

      if (parking && parking.showRotationHandles) {
        parking.drawRotationHandles();
      }


      // if (visibilityGraphSolver) {
      //   this.pathCellIndex++

      //   // visibilityGraphSolver.displaySolution(p, this.pathCellIndex)


      //   // Display the shortest path for a specific start-end pair
      //   visibilityGraphSolver.displayShortestPaths(p);
      //   // visibilityGraphSolver.displayPathsAsPolygons(p);

      //   const maxPathStatesLength = visibilityGraphSolver.edges.length;
      //   if (this.pathCellIndex > maxPathStatesLength + 30) {
      //     this.pathCellIndex = 0
      //   }
      // }


      if (buildingRef.current) {
        const isInboundary = pointsAreInBoundary(property.cornerOffsetsFromSetbacks, [p.mouseX, p.mouseY]) === -1

        if (!isHovered.approach && !isHovered.parking && !buildingRef.current.isInitialized && isInboundary && !isHovered.parkingOffset && !isHovered.parkingHandle) {

          // Show the building growing.
          buildingRef.current.tempBuilding();
        }

        if ((isHovered.building || isHovered.buildingOffset) && isInboundary && buildingRef.current.isInitialized) {

          // ----  Show the entrance ----
          // Get the closest edge
          // check that the edge is within 30 px
          // show the entrance being drawn in the right orientation and the right position
          // Get the position % of the entrance. 
          // Remove entrance by clicking again within X px of enteracne
          const mouse = p.createVector(p.mouseX, p.mouseY)
          const closestEdgeIndex = findClosestEdge(buildingRef.current.sitePlanElementEdges, mouse)
          const closestEdge = buildingRef.current.sitePlanElementEdges[closestEdgeIndex];
          const distance = calculatePointToEdgeDistance(closestEdge, mouse);


          // clampNumber()
          // const area = Math.abs(building.width * building.height);

          if (distance < 20 && buildingRef.current.hasStopped) {
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
            p.arc(0, 0, enteranceWidth / property.scale, enteranceWidth / property.scale, 0, 90, p.PIE);

            p.pop();
          }
        }
      }


      if (
        parking && (
          isHovered.parkingOffset ||
          isHovered.parking ||
          isHovered.parkingHandle ||
          parking?.isRotating)) {

        if (building) building.showRotationHandles = false;
        parkingDragMode = null;
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



        if (parkingDragMode === "corner") p.cursor('nesw-resize');
        else if (parkingDragMode === "edge") p.cursor('ew-resize');
        else if (parkingDragMode === "center") p.cursor('grab');
        else if (parkingDragMode === "rotate") p.cursor(RotateArrow);
        else p.cursor('default');
      }

      else if (isHovered.approach || isHovered.approachOffset) {
        approachDragMode = 'center';
        buildingDragMode = null;
        parkingDragMode = null;
        p.cursor("grab");
      }
      // Check if we're hovering over a building corner, edge, or center
      else if (building !== null &&
        (isHovered.building ||
          isHovered.buildingOffset ||
          isHovered.buildingHandle ||
          building.isRotating
        ) && building.isInitialized) {

        parkingDragMode = null;
        approachDragMode = null;

        if (parking) {
          parking.showRotationHandles = false;
        }
        building.showRotationHandles = true;
        let anyCornerHover = resizingbuildingRef.current || building.isRotating


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
          const mouse = p.createVector(p.mouseX, p.mouseY)
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

        if (!anyCornerHover && isHovered.buildingHandle) {
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

      else {
        // const property = propertyRef.current;
        // const approach = approachRef.current;
        const parking = parkingRef.current;
        const building = buildingRef.current;
        // const garbage = garbageRef.current;


        if (parking) {
          parking.showRotationHandles = false;
        }
        if (building) {
          building.showRotationHandles = false;
        }

        buildingDragMode = null;
        parkingDragMode = null;
        approachDragMode = null;

        // resizeEdges = null;
        resizeCorner = null;
        resizeEdge = null;
        p.cursor('default')
      }
    };

    p.mousePressed = () => {
      const points = pointsRef.current;
      const lines = linesRef.current;
      const setbacks = setbacksRef.current;
      const scale = scaleRef.current;


      // const setbackHasInput = setbackHasInputRef.current;
      const isPolygonClosed = isPolygonClosedRef.current;

      const mx = p.mouseX;
      const my = p.mouseY;



      if (mx < 0 || mx > p.width || my < 0 || my > p.height) return;

      let lineIndex = calculateLineIndexOfClosestLine(points, lines, mx, my)

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
          const midpoint = approachEdge.getMidpoint();
          property.approachEdge = approachEdge
          property.approachEdgeIndex = approachIndex

          const approachWidth = property.approachWidth / property.scale;
          const approachAngle = approachEdge.calculateAngle();

          approachRef.current = new Approach(p, midpoint, approachWidth, 20, approachAngle, ESitePlanObjects.Approach, property.scale);
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

        parkingRef.current.calculateNumberOfFittableStalls(propertyRef.current.cornerOffsetsFromSetbacks);
        parkingRef.current.updateStallCorners();
        parkingRef.current.updateParkingHeight(propertyRef.current.cornerOffsetsFromSetbacks);

        garbageRef.current = new Garbage(p, getCenterPoint(p, parkingRef.current.sitePlanElementEdges[0].point1, parkingRef.current.sitePlanElementEdges[0].point2 || defaultVector), 12 / propertyRef.current.scale, 5 / propertyRef.current.scale, parkingRef.current.angle, ESitePlanObjects.Garbage, propertyRef.current.scale);
        garbageRef.current.initialize();
      }

      // ALL THINGS BUILDING
      else if (stepSelectorRefs.building.current && !buildingDragMode) {
        if (!propertyRef.current || !approachRef.current || buildingRef.current?.isInitialized) return;


        const approach = approachRef.current;
        const parking = parkingRef.current;
        const building = buildingRef.current;
        const garbage = garbageRef.current;


        const isHovered = {
          approach: false,
          approachOffset: false,
          parking: false,
          parkingOffset: false,
          parkingHandle: false,
          building: false,
          buildingOffset: false,
          buildingHandle: false,
          garbage: false
        };

        if (approach) {
          isHovered.approach = approach.isMouseHovering();
          isHovered.approachOffset = approach.isMouseHoveringOffset();
        }
        if (parking) {
          isHovered.parking = parking.isMouseHovering();
          isHovered.parkingOffset = parking.isMouseHoveringOffset();
          isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();
        }
        if (building) {
          isHovered.building = building.isMouseHovering();
          isHovered.buildingOffset = building.isMouseHoveringOffset();
          isHovered.buildingHandle = building.isMouseHoveringRotateHandle();
        }
        if (garbage) {
          isHovered.garbage = garbage.isMouseHovering();
        }


        const clickIsInProperty = allPointsInPolygon(propertyRef.current.propertyCorners, [p.createVector(mx, my)]);


        // Place the building
        if (!buildingRef.current?.isInitialized &&
          !isHovered.approach &&
          !isHovered.parking &&
          !isHovered.parkingOffset &&
          !isHovered.parkingHandle &&
          !isHovered.garbage &&
          truthChecker(clickIsInProperty)) {

          const approachAngle = (propertyRef.current.approachEdge?.calculateAngle() || 0) + 180;
          const buildingDefault = 30 / propertyRef.current.scale;
          buildingRef.current = new Building(p, p.createVector(p.width / 2, p.height / 2), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, propertyRef.current.scale, 20);
          buildingRef.current.initializeBuilding(mx, my);
        }
      }

      // ALL THINGS BUILDING ENTRANCES
      else if (stepSelectorRefs.entrances.current && !buildingDragMode) {
        //  this.building = new Building(p, p.createVector(p.width / 2, p.height / 2), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, this.scale, 20);


        // HIDING ENTRANCE AND SOLVER FOR NOW

        // const mouse = p.createVector(p.mouseX, p.mouseY)
        // const closestEdgeIndex = findClosestEdge(building.sitePlanElementEdges, mouse)
        // const closestEdge = building.sitePlanElementEdges[closestEdgeIndex];
        // const distance = calculatePointToEdgeDistance(closestEdge, mouse);


        // get the point on the line where the entrance should interesect
        // const angle = closestEdge.calculateAngle() - 90;
        // const intersection = closestEdge.calculateClosestIntercept(
        //   p.mouseX,
        //   p.mouseY,
        //   p
        // );

        // let minDistance = Infinity;
        // let minDistanceIndex = -1;
        // building.entrances.forEach((entrance, i) => {
        //   const dist = p.dist(intersection.x, intersection.y, entrance.intersection.x, entrance.intersection.y);
        //   if (dist < minDistance) {
        //     minDistance = dist;
        //     minDistanceIndex = i;
        //   }
        // })


        // // If it is really close to another entrance, and clickm then delete. Turn the entrance with a
        // if (minDistance < 5 / this.scale) {
        //   // THEN DELETE THE ENTRANCE

        //   building.entrances = building.entrances.filter((_, i) => i !== minDistanceIndex)
        //   visibilityGraphSolver = runVisibilityGraphSolver(visibilityGraphSolver, building, parking, property, garbage, approach);

        // }

        // else {
        //   // Draw the entrance
        //   const isAddingEntrances = false;
        //   if (isAddingEntrances) {
        //     // Hold off on adding entrances for now
        //     let lerpPos = getIntersectionPercentage(
        //       closestEdge,
        //       intersection
        //     ) || 0;

        //     const entrance = new Entrance(p, this.scale, lerpPos, intersection, angle, closestEdgeIndex, building.center);
        //     building.entrances.push(entrance)

        //     visibilityGraphSolver = runVisibilityGraphSolver(visibilityGraphSolver, building, parking, property, garbage, approach);

        //   }

        // }


      }



      else {
        // Somthing happened, just go back 
        return
      }





      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const building = buildingRef.current;
      const garbage = garbageRef.current;


      if (!property) return;

      const isHovered = {
        approach: false,
        approachOffset: false,
        parking: false,
        parkingOffset: false,
        parkingHandle: false,
        building: false,
        buildingOffset: false,
        buildingHandle: false,
        garbage: false
      };

      if (approach) {
        isHovered.approach = approach.isMouseHovering();
        isHovered.approachOffset = approach.isMouseHoveringOffset();
      }
      if (parking) {
        isHovered.parking = parking.isMouseHovering();
        isHovered.parkingOffset = parking.isMouseHoveringOffset();
        isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();
      }
      if (building) {
        isHovered.building = building.isMouseHovering();
        isHovered.buildingOffset = building.isMouseHoveringOffset();
        isHovered.buildingHandle = building.isMouseHoveringRotateHandle();
      }
      if (garbage) {
        isHovered.garbage = garbage.isMouseHovering();
      }

      if (!(
        isHovered.approach ||
        isHovered.parking ||
        isHovered.building ||
        isHovered.garbage)) {
        if (approach) approach.isSelected = false;
        if (building) building.isSelected = false;
        if (parking) parking.isSelected = false;
        if (garbage) garbage.isSelected = false;
      }



      if (isHovered.approach && approach) approach.isSelected = true;
      else if (isHovered.parking && parking) parking.isSelected = true;
      else if (isHovered.building && building) building.isSelected = true;
      else if (isHovered.garbage && garbage) garbage.isSelected = true;

    };

    p.mouseDragged = () => {

      // ALL THINGS UPLOAD
      if (stepSelectorRefs.upload.current) { return }


      // ALL THINGS PROPERTY BOUNDARY
      else if (stepSelectorRefs.points.current) {
        const property = propertyRef.current;
        const draggingPointIndex = draggingPointIndexRef.current;
        if (draggingPointIndex !== null) {
          const points = pointsRef.current;
          points[draggingPointIndex] = { x: p.mouseX, y: p.mouseY };


          if (property) {
            property.updateCornersAndEdgesPositions(points)
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

      else {
        // Somthing happened, just go back 
        return
      }

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const building = buildingRef.current;
      const garbage = garbageRef.current;


      if (!property) return;

      const isHovered = {
        approach: false,
        parking: false,
        parkingOffset: false,
        parkingHandle: false,
        building: false,
        buildingOffset: false,
        buildingHandle: false,
      };


      if (approach) isHovered.approach = approach.isMouseHovering();
      if (parking) {
        isHovered.parking = parking.isMouseHovering();
        isHovered.parkingOffset = parking.isMouseHoveringOffset();
        isHovered.parkingHandle = parking.isMouseHoveringRotateHandle();
      }
      if (building) {
        isHovered.building = building.isMouseHovering();
        isHovered.buildingOffset = building.isMouseHoveringOffset();
        isHovered.buildingHandle = building.isMouseHoveringRotateHandle();
      }



      // Moving the building
      if ((
        building !== null && buildingDragMode !== null && (
          isHovered.building ||
          isHovered.buildingOffset ||
          isHovered.buildingHandle ||
          building.hoverHandleIndex !== -1

        )) && building.isInitialized) {


        isDragging.building = true;

        handleBuildingDrag(
          p,
          property, approach, parking, building, garbage,
          buildingDragMode,
          resizeCorner,
          resizeEdge,
          resizingbuildingRef
        )

      }

      // Dragging the parking lot
      else if (
        parking !== null && parkingDragMode !== null && (
          isHovered.parking ||
          isDragging.parking ||
          isHovered.parkingHandle ||
          parking?.hoverHandleIndex !== -1)

      ) {

        if (approach && parking && garbage) {
          isDragging.parking = true;
          handleParkingDrag(
            p,
            property, approach, parking, garbage, building,
            parkingDragMode,
            isRotationFrozenRef,
          )

        }
      }

      // Move the approach
      else if (isHovered.approach || isDragging.approach) {
        if (approach) {

          isDragging.approach = true;
          handleApproachDrag(
            p,
            property, approach, parking, garbage, building,
            isRotationFrozenRef,
            approachDragMode,

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
      const building = buildingRef.current;
      // const garbage = garbageRef.current;


      draggingPointIndexRef.current = null;
      selectedLineIndexRef.current = null;

      isDragging.parking = false;
      isDragging.approach = false;
      isDragging.parkingOffset = false;
      isDragging.building = false;



      buildingDragMode = null;
      parkingDragMode = null;
      approachDragMode = null;


      // resizeEdges = null;
      resizeCorner = null;
      resizeEdge = null;
      resizingbuildingRef.current = false;

      if (building) {
        building.hoverHandleIndex = -1;
        building.isRotating = false;
        building.isSelected = false
      }
      if (parking) {
        parking.isRotating = false;
        parking.isSelected = false
      }


    };
  };
}

function updateGlobalVariables(
  property: Property | null, approach: Approach | null, parking: Parking | null, building: Building | null, garbage: Garbage | null,
  formData: FormDataInputs
) {
  if (property) {
    property.imperviousPercentage = formData.imperviousPercentage
    property.buildingCoveragePercentage = formData.buildingCoveragePercentage;
    property.enableAngles = formData.enableAngles;
    property.enableLineLengths = formData.enableLineLengths;
    property.approachWidth = formData.approachWidth;
  }


  // Pull in the data from above.
  if (approach) {
    approach.propertyEntranceCount = formData.propertyEntranceCount

    if (property) {
      property.approachWidth = formData.approachWidth
      approach.updateWidth(Number(formData.approachWidth) / property.scale)
    }

  }

  if (parking) {
    parking.parkingStallsNumber = formData.parkingStalls;
    parking.handicappedParkingNum = formData.handicappedParkingStalls
    parking.compactParkingNum = formData.compactParkingStalls
    parking.parkingPer1000Max = formData.parkingPer1000Max;
    parking.parkingPer1000Min = formData.parkingPer1000Min;
    parking.parkingPer1000Min = formData.parkingPerUnit;
    parking.landscapeIsland = formData.landscapeIsland;
    parking.halfStreetDriveway = formData.halfStreetDriveway;
    parking.showDrivewayControlPoints = formData.showDrivewayControlPoints;
    parking.parkingSide = formData.parkingSide;
  }


  if (building) {
    building.buildingAreaTarget = formData.buildingAreaTarget;
    building.buildingCount = formData.buildingCount

    building.updateBuildingArea(Number(formData.buildingAreaTarget))

  }


  if (garbage) { }

  if (approach && parking && property) {
    property.drivewayWidth = formData.drivewayWidth;
    property.taperedDriveway = formData.taperedDriveway;

    parking.updateParkingStallsNumber(property, formData.parkingStalls);
    parking.updateWidth(Number(formData.drivewayWidth) / property.scale);

  }




  // globalAngle,
  // if (!parking || !property || !approach || !building) return





}