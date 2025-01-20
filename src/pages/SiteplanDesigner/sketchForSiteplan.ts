import p5 from "p5";
import { useEffect, useRef, useState } from "react";
import classifyPoint from "robust-point-in-polygon"

import { ESitePlanObjects, SiteplanGenerator } from "./SiteplanGenerator";
import { IPoint, Line } from "./SitePlanDesigner";
import RotateArrow from "../../assets/rotateArrow.png"


import { allPointsInPolygon, calculateAngle, calculateCentroid, calculatePointToEdgeDistance, getCenterPoint, getIsClockwise, getReversedIndex, normalizeAngle, scalePolygonToFitCanvas, truthChecker } from "../../utils/SiteplanGeneratorUtils";
import { Property } from "./SitePlanClasses/Property";
import { Parking } from "./SitePlanClasses/Parking";
import { Building } from "./SitePlanClasses/Building";
import { Garbage } from "./SitePlanClasses/Garbage";
import { Approach } from "./SitePlanClasses/Approach";


export type Point = [number, number];

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
  sitePlanGenerator: React.MutableRefObject<SiteplanGenerator | null>;
  stepSelectorRefs: {
    upload: React.MutableRefObject<boolean>;
    points: React.MutableRefObject<boolean>;
    approach: React.MutableRefObject<boolean>;
    scale: React.MutableRefObject<boolean>;
    setback: React.MutableRefObject<boolean>;
    parking: React.MutableRefObject<boolean>;
    building: React.MutableRefObject<boolean>;
  }

}


export function sketchForSiteplan(params: SketchForSiteplanParams) {
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
    sitePlanGenerator,
    stepSelectorRefs,
  } = params;
  const defaultScale = 0.25;


  // const [property, setProperty] = useState<Property | null>(null);
  // const [parking, setParking] = useState<Parking | null>(null);
  // const [building, setBuilding] = useState<Building | null>(null);
  // const [garbage, setGarbage] = useState<Garbage | null>(null);
  const [isRotationFrozen, setIsRotationFrozen] = useState(false)
  // const [approach, setApproach] = useState<Approach | null>(null);

  const propertyRef = useRef<Property | null>(null);
  const approachRef = useRef<Approach | null>(null);
  const parkingRef = useRef<Parking | null>(null);
  const buildingRef = useRef<Building | null>(null);
  const garbageRef = useRef<Garbage | null>(null);


  let buildingDragMode: string | null = null; // null, 'center', 'edge', 'corner'
  let parkingDragMode: string | null = null; // null, 'center', 'edge', 'corner'

  let resizeEdge: number | null = null;
  let resizeEdges: number[] | null = null
  let resizeCorner: number | null = null;


  let isDragging = {
    parking: false,
    approach: false,
    parkingOffset: false,
    building: false,
  };

  let resizingbuilding = false;
  // let isRotationFrozen = false;



  // propertyRef.current.setSetbacks(lines[lineIndex].setback, lineIndex)

  // When an input changes in the component above, set he sketch variable here.
  if (propertyRef.current) {
    propertyRef.current.updateSetbacks(linesRef.current);
  }




  return (p: p5) => {
    const {
      upload: isUploadingImageRef,
      points: isUpdatingBoundaryPointsRef,
      approach: isSelectingApproachRef,
      scale: isDefiningScaleRef,
      setback: isSelectingSetbackRef,
      parking: isSettingParkingLotRef,
      building: isPlacingBuildingRef,
    } = stepSelectorRefs;


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
      const garbage = garbageRef.current;

      const isUploadingImage = isUploadingImageRef.current;
      const isPolygonClosed = isPolygonClosedRef.current;
      if (isUploadingImage) return


      if (stepSelectorRefs.points.current || stepSelectorRefs.scale.current) {

        calculateScale(inputScaleRef, linesRef, pointsRef, scaleRef, propertyRef);

      }
      displayImage(p, img, rectSize);
      drawInstructionsToScreen(p, pointsRef, img, isPolygonClosed, isSelectingApproachRef, isDefiningScaleRef, isSelectingSetbackRef);


      if (propertyRef.current) {
        propertyRef.current.drawProperty();
        propertyRef.current.drawSetbackPolygon();
        propertyRef.current.drawLineLengths();
      }
      else {
        drawProtoPropertyLines(p, pointsRef, linesRef, isPolygonClosed, scaleRef.current || defaultScale);
      }



      if (approachRef.current) {
        approachRef.current.drawApproach();
      }

      if (parkingRef.current && garbageRef.current && approachRef.current) {
        parkingRef.current.drawParkingStalls();
        parkingRef.current.drawParkingOutline(p, parkingRef.current, garbageRef.current, approachRef.current)
      }


      drawArea(p, isPolygonClosedRef.current, pointsRef, scaleRef.current || defaultScale);

      if (!property || !approach || !parking) return;
      //  || !building || !garbage

      const isHovered = {
        approach: approach.isMouseHovering(),
        parking: parking.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parkingHandle: parking.isMouseHoveringRotateHandle(),

        // building: building.isMouseHovering(),
        // buildingOffset: building.isMouseHoveringOffset(),
        // buildingHandle: building.isMouseHoveringRotateHandle(),
      };


      if (parking.showRotationHandles) {
        parking.drawRotationHandles();
      }
      if (
        isHovered.parkingOffset ||
        isHovered.parking ||
        isHovered.parkingHandle ||
        parking.isRotating) {

        // building.showRotationHandles = false;
        parking.showRotationHandles = true;



        if (isHovered.parkingHandle) {
          parking.showRotationAnimationCount = 0;

          const index = parking.getMouseHoveringRotateHandleIndex();
          const handle = parking.rotationHandles[index];
          if (p.dist(newX, newY, handle.x, handle.y) < 30) {
            parkingDragMode = 'rotate';
            resizeEdges = null;
            resizeCorner = null;
            resizeEdge = null;
            // hasSetRotating = true;

          }
        }


        if (isHovered.parking && !parking.isRotating) {
          // !hasSetRotating&&
          if (p.dist(newX, newY, parking.center.x, parking.center.y) < 20) {
            parkingDragMode = 'center';
            resizeEdges = null;
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

        console.log(`parkingDragMode`, parkingDragMode)


        // if (parkingDragMode === "corner") p.cursor('nesw-resize');
        // else if (parkingDragMode === "edge") p.cursor('ew-resize');
        if (parkingDragMode === "center") p.cursor('grab');
        else if (parkingDragMode === "rotate") p.cursor(RotateArrow);
        else p.cursor('default');
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


      const lineIndex = calculateLineIndexOfClosestLine(points, lines, mx, my)


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

            const firstLine = lines[0];
            const restLines = lines.slice(1, lines.length).reverse()

            propertyCorners = [first, ...rest];
            pointsRef.current = [firstPoint, ...restPoints];
            linesRef.current = [firstLine, ...restLines];
          }

          const isClockwise2 = getIsClockwise(propertyCorners);



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
      if (stepSelectorRefs.approach.current && !parkingDragMode) {
        if (!propertyRef.current) return;
        if (isPolygonClosed && lineIndex !== -1) {
          const property = propertyRef.current;
          selectedLineIndexRef.current = lineIndex;


          lines[lineIndex].isApproach = !lines[lineIndex].isApproach;

          let approachIndex = lineIndex;

          // Get point closest to the edgepoint
          const approachEdge = propertyRef.current.propertyEdges[approachIndex]
          const midpoint = approachEdge.getMidpoint();

          const approachWidth = 20 / property.scale;
          const approachAngle = approachEdge.calculateAngle();

          approachRef.current = new Approach(p, midpoint, approachWidth, 20, approachAngle, ESitePlanObjects.Approach, property.scale);
          approachRef.current.initialize();
        }
      }

      // ALL THINGS PARKING
      else if (stepSelectorRefs.parking.current && !parkingDragMode) {
        if (!propertyRef.current || !approachRef.current) return;

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
      else if (stepSelectorRefs.building.current && !parkingDragMode) {
        //  this.building = new Building(p, p.createVector(p.width / 2, p.height / 2), buildingDefault, buildingDefault, approachAngle, ESitePlanObjects.Building, this.scale, 20);
      }



      else {
        // Somthing happened, just go back 
        return
      }

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
      if (stepSelectorRefs.approach.current) {

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


      if (!property || !approach || !parking || !garbage) return;
      //  || !building ||
      const isHovered = {
        approach: approach.isMouseHovering(),
        parking: parking.isMouseHovering(),
        parkingOffset: parking.isMouseHoveringOffset(),
        parkingHandle: parking.isMouseHoveringRotateHandle(),
        // building: building.isMouseHovering(),
        // buildingOffset: building.isMouseHoveringOffset(),
        // buildingHandle: building.isMouseHoveringRotateHandle(),
      };


      // Moving the building
      // if ((
      //   isHovered.building ||
      //   isHovered.buildingOffset ||
      //   isHovered.buildingHandle ||
      //   this.buildingDragMode ||
      //   building.hoverHandleIndex !== -1
      // ) && building.isInitialized) {
      //   isDragging.building = true;
      //   handleBuildingDrag();
      // }

      // Dragging the parking lot

      console.log(`parkingDragMode`, parkingDragMode, isHovered.parking, isDragging.parking, isHovered.parkingHandle, parking.hoverHandleIndex !== -1)

      if ((isHovered.parking || isDragging.parking) || isHovered.parkingHandle || parking.hoverHandleIndex !== -1) {
        isDragging.parking = true;
        handleParkingDrag(
          p,
          property, approach, parking, garbage, building,
          parkingDragMode,
          isRotationFrozen,
          setIsRotationFrozen,
        )

      }



    };

    p.mouseReleased = () => {

      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      const building = buildingRef.current;
      const garbage = garbageRef.current;


      draggingPointIndexRef.current = null;
      selectedLineIndexRef.current = null;


      // if (!property || !approach || !parking ||  !garbage) return;
      // !building ||

      isDragging.parking = false;
      isDragging.approach = false;
      isDragging.parkingOffset = false;
      isDragging.building = false;

      buildingDragMode = null;
      parkingDragMode = null;

      resizeEdges = null;
      resizeCorner = null;
      resizeEdge = null;
      resizingbuilding = false;

      if (building) {
        building.hoverHandleIndex = -1;
        building.isRotating = false;
      }
      if (parking) {
        parking.isRotating = false;
      }


    };
  };
}

const displayImage = (p: p5, img: p5.Image | null, rectSize: { width: number, height: number }) => {
  if (img) {
    p.background("#f9fafb"); // Default background
    // Resize the image, keeping the aspect ratio.
    const ratio = img.width / img.height;
    const width = rectSize.width;
    const height = width / ratio;
    p.image(img, 0, 0, width, height);
  } else {
    p.background("#f9fafb"); // Default background
  }
}

const calculateScale = (
  inputScaleRef: React.MutableRefObject<number | null>,
  linesRef: React.MutableRefObject<Line[]>,
  pointsRef: React.MutableRefObject<IPoint[]>,
  scaleRef: React.MutableRefObject<number | null>,
  propertyRef: React.MutableRefObject<Property | null>

) => {
  const inputScale = inputScaleRef.current;
  const points = pointsRef.current;
  const lines = linesRef.current;
  const lineIndex = lines.find(line => line.isScale)?.index;
  if (typeof lineIndex !== 'undefined' && lineIndex !== -1) {
    const lineLength = p5.prototype.dist(points[lines[lineIndex].start].x, points[lines[lineIndex].start].y, points[lines[lineIndex].end].x, points[lines[lineIndex].end].y);

    if (inputScale && lineLength && propertyRef.current) {
      scaleRef.current = inputScale / lineLength;
      propertyRef.current.scale = scaleRef.current;
    }
  }
};

const calculateArea = (polygon: IPoint[]): number => {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};

function drawArea(
  p: p5,
  isPolygonClosed: boolean,
  pointsRef: React.MutableRefObject<IPoint[]>,
  scale: number,
) {
  const points = pointsRef.current;
  if (!isPolygonClosed || points.length < 3) return;
  const area = calculateArea(points) * Math.pow(scale, 2)
  // p.noFill()

  p.push();
  p.stroke(0, 0, 0)
  p.strokeWeight(1)

  p.textAlign(p.RIGHT)
  p.textSize(18);
  p.text(`Area: ${area.toFixed(2)} sq ft`, p.width - 10, 20);
  p.pop();
}

function drawInstructionsToScreen(
  p: p5,
  pointsRef: React.MutableRefObject<IPoint[]>,
  img: p5.Image | null,
  isPolygonClosed: boolean,
  isSelectingApproachRef: React.MutableRefObject<boolean>,
  isDefiningScaleRef: React.MutableRefObject<boolean>,
  isSelectingSetbackRef: React.MutableRefObject<boolean>,
) {

  // Draw lines connecting points
  const points = pointsRef.current;

  if (points.length === 0 && !img) {
    p.push();
    p.textSize(30);
    p.fill(50); // Text color
    p.textAlign(p.CENTER, p.CENTER);
    p.text("Click here to start creating your siteplan", p.width / 2, p.height / 2);
    p.pop()
    return
  }
  else if (points.length === 0 && img) {
    p.push();
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click the property corners to start creating your siteplan", p.width - 10, p.height - 10);
    p.pop()
    return
  }

  if (!isPolygonClosed && points.length === 1) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click another spot to create a property edge", p.width - 10, p.height - 10);
    p.pop()
  }


  if (!isPolygonClosed && points.length > 1) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click the first point to close the boundary", p.width - 10, p.height - 10);
    p.pop()
  }

  if (isPolygonClosed && isSelectingApproachRef.current) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click the property edge that will be the entrance to the propery", p.width - 10, p.height - 10);
    p.pop()
  }

  if (isPolygonClosed && isDefiningScaleRef.current) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click a property edge then type in the edge's length", p.width - 10, p.height - 10);
    p.pop()
  }

  if (isPolygonClosed && isSelectingSetbackRef.current) {
    p.push();
    // Display the message in the bottom-right corner when no boundary is closed
    p.textSize(16);
    p.fill(50); // Text color
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("For each property edge, enter the setback required for the zoning.\nEntering nothing means a setback of 0 feet", p.width - 10, p.height - 10);
    p.pop()
  }
  // const isPolygonClosed = isPolygonClosedRef.current;

}

function drawProtoPropertyLines(p: p5,
  pointsRef: React.MutableRefObject<IPoint[]>,
  linesRef: React.MutableRefObject<Line[]>,
  isPolygonClosed: boolean,
  scale: number,
) {
  p.push();
  const points = pointsRef.current;
  const lines = linesRef.current;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.isApproach && line.isScale) {
      p.strokeWeight(4)
      p.stroke(230, 120, 20);

    }
    else if (line.isApproach) {
      p.stroke(20, 230, 120);
    }
    else if (line.isScale) {
      p.stroke(230, 120, 20);
    }
    else {
      p.stroke(0, 20, 220);
    }
    // p.stroke(line.color);
    p.line(points[line.start].x, points[line.start].y, points[line.end].x, points[line.end].y);
    p.strokeWeight(2);
    p.noStroke();
    p.fill(0, 20, 220);

    const midX = (points[line.start].x + points[line.end].x) / 2;
    const midY = (points[line.start].y + points[line.end].y) / 2;
    const length = Math.hypot(points[line.end].x - points[line.start].x, points[line.end].y - points[line.start].y) * (scale);

    // if is finished, make the text larger.
    p.textSize(14);
    p.text(`${length.toFixed(1)} ft`, midX, midY);


  }

  if (isPolygonClosed) {
    p.fill(10, 20, 200, 20);
    p.beginShape();
    for (const point of points) {
      p.vertex(point.x, point.y);
    }
    p.endShape();
  }


  p.fill(255, 0, 0);
  for (const point of points) {
    p.noStroke();
    p.ellipse(point.x, point.y, 10, 10);
  }

  p.pop();
}

function calculateLineIndexOfClosestLine(
  points: IPoint[],
  lines: Line[],
  mx: number,
  my: number
) {
  const lineIndex = lines.findIndex((line) => {
    const d1 = p5.prototype.dist(mx, my, points[line.start].x, points[line.start].y);
    const d2 = p5.prototype.dist(mx, my, points[line.end].x, points[line.end].y);
    const lineLength = p5.prototype.dist(points[line.start].x, points[line.start].y, points[line.end].x, points[line.end].y);
    return Math.abs(d1 + d2 - lineLength) < 5; // Allow for small tolerance
  });

  return lineIndex;
}



const handleBuildingDrag = (
  p: p5,
  property: Property, approach: Approach, parking: Parking, building: Building, garbage: Garbage,
  buildingDragMode: string,
  resizeCorner: number,
  resizeEdge: number,
  dragOffset: { x: number, y: number },
  setResizingbuilding: (value: boolean | ((prevVar: boolean) => boolean)) => void,
) => {
  if (!property || !approach || !parking || !building || !garbage) return;

  building.hasStopped = false

  const newX = p.mouseX;
  const newY = p.mouseY;
  const _center = p.createVector(building.center.x, building.center.y);
  const _height = building.height;
  const _width = building.width;

  const propertyCenter = calculateCentroid(property.propertyCorners)


  if (buildingDragMode === "corner" && resizeCorner !== null) {
    p.cursor('nesw-resize');

    setResizingbuilding(true);
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
    if (building) {
      building.width = newWidth;
      building.height = newHeight;
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

  else if (buildingDragMode === "edge" && resizeEdge !== null) {
    p.cursor('ew-resize'); // Adjust cursor based on edge direction (horizontal/vertical)

    setResizingbuilding(true);

    // Determine which edge is being dragged
    const edgeIndex = resizeEdge;

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

// const handleApproachDrag = () => {
//   if (!property || !approach || !parking || !building || !garbage) return;

//   const _center = p.createVector(approach.center.x, approach.center.y);
//   const approachEdgeAngle = property.approachEdge?.calculateAngle();

//   let newX = p.mouseX;
//   let newY = p.mouseY;
//   const isVertical = isMoreVertical(approachEdgeAngle || 0, true);

//   if (isVertical) {
//     newX = approach.center.x + (newY - approach.center.y) / p.tan(approachEdgeAngle || 0);
//     newY = p.mouseY;
//   }
//   else {
//     newX = p.mouseX;
//     newY = approach.center.y + (newX - approach.center.x) * p.tan(approachEdgeAngle || 0);
//   }

//   const allPointsInBoundary = allPointsInPolygon(property.propertyCorners, [approach.sitePlanElementCorners[0], approach.sitePlanElementCorners[1]]);


//   if (truthChecker(allPointsInBoundary)) {
//     const angle = isRotationFrozen ? parking.angle : calculateAngle(parking.center, approach.center) - 90

//     approach.updateCenter(newX, newY);
//     parking.updateAngle(angle); // +90 to get the perpendicular angle
//     garbage.updateAngle(angle);
//     // building.updateAngle(angle);
//     building.hasStopped = false

//     parking.calculateNumberOfFittableStalls(property.propertyCorners);
//     parking.updateStallCorners(false, true);
//     parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
//     building.buildingLocator(p, building, parking, property, garbage);
//     garbage.updateCenterGarbage(parking);

//     // building.updateEntrances();
//     parking.createRotationHandles();
//     updateVisibilityGraph();
//   } else {

//     const edgeMidpoint = property.approachEdge?.getMidpoint();
//     if (!edgeMidpoint) return;


//     if (
//       p.dist(edgeMidpoint.x, edgeMidpoint.y, _center.x, _center.y) <
//       p.dist(edgeMidpoint.x, edgeMidpoint.y, newX, newY)) {
//       return
//     }


//     building.hasStopped = true;
//     approach.updateCenter(newX, newY);
//     parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
//   }
// };

const handleParkingDrag = (
  p: p5,
  property: Property, approach: Approach, parking: Parking, garbage: Garbage, building: Building | null,
  parkingDragMode: string | null,
  isRotationFrozen: boolean,
  setIsRotationFrozen: (value: boolean | ((prevVar: boolean) => boolean)) => void,
) => {

  console.log(`parkingDragMode`, parkingDragMode)
  if (!property || !approach || !parking || !garbage) return;
  // || !building 

  const _centerX = parking.center.x;
  const _centerY = parking.center.y;
  const newX = p.mouseX;
  const newY = p.mouseY;

  const _angle = parking.angle;

  if (parkingDragMode === "rotate") {

    setIsRotationFrozen(true);
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


      garbage.updateCenterGarbage(parking);

      const parkingInBoundary = parking.pointIsInPolygon(property.cornerOffsetsFromSetbacks);
      const garbageInBoundary = garbage.pointIsInPolygon(property.cornerOffsetsFromSetbacks);


      if (building) {
        building.hasStopped = false;

        const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
          const pointClassification = classifyPoint(building?.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
          return pointClassification === 1
        }))

        const buildingIsOutOfParking = building?.pointIsOutOfPolygon(parking.parkingOutline);

        if (!parkingIsOutOfBuilding || !buildingIsOutOfParking) {
          parking.setLineColors(p.color(250, 20, 20))
        }
        else {
          parking.setLineColors(p.color(20, 20, 20))
        }

      }


      if (!parkingInBoundary || !garbageInBoundary) {

        // If I'm moving the parking lot close to the center, then let the new point stand.
        parking.updateAngle(_angle);
        garbage.updateAngle(_angle);

        parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
        parking.updateStallCorners();
        parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
        if (building) {
          building.hasStopped = false;
        }
        garbage.updateCenter(_garbageCenter.x, _garbageCenter.y)
        garbage.updateCenterGarbage(parking);
        return;
      }
      parking.createRotationHandles();


      // UNCOMMENT WHEN I'M READY TO PUT BACK IN ENTRANCES
      // updateVisibilityGraph();


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


    if (building) {

      // building.updateAngle(normalizeAngle(angle));
      building?.updateEntrances();


      const parkingIsOutOfBuilding = truthChecker(parking.parkingOutline.map(sitePlanCorner => {
        const pointClassification = classifyPoint(building.sitePlanElementCorners.map(corner => [corner.x, corner.y]) as Point[], [sitePlanCorner.x, sitePlanCorner.y])
        return pointClassification === 1
      }))

      const buildingIsOutOfParking = building?.pointIsOutOfPolygon(parking.parkingOutline);


      if (!parkingIsOutOfBuilding || !buildingIsOutOfParking) {
        parking.setLineColors(p.color(250, 20, 20))
      }
      else {
        parking.setLineColors(p.color(20, 20, 20))
      }

    }


    // parking.parkingOutline.slice(3, -3)
    const allPointsInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, parking.sitePlanElementCorners);
    // const garbageInBoundary = allPointsInPolygon(property.cornerOffsetsFromSetbacks, garbage.sitePlanElementCorners);

    if (truthChecker(allPointsInBoundary)) {

      parking.calculateNumberOfFittableStalls(property.cornerOffsetsFromSetbacks);
      parking.updateStallCorners(false, isRotationFrozen);
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
      if (building) {
        building.hasStopped = false;
      }
      parking.createRotationHandles();
      // UNCOMMENT WHEN I'M READY TO PUT BACK IN ENTRANCES
      // updateVisibilityGraph();
    } else {
      if (building) {
        building.hasStopped = true;
      }
      parking.updateParkingHeight(property.cornerOffsetsFromSetbacks);
    }
  }

  else {
    p.cursor('default')
  }

};



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

