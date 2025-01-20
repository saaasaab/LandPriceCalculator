import p5 from "p5";
import { SiteplanGenerator } from "./SiteplanGenerator";
import { IPoint, Line } from "./SitePlanDesigner";
import { useEffect, useRef, useState } from "react";
import { getCenterPoint, getIsClockwise, getReversedIndex, scalePolygonToFitCanvas } from "../../utils/SiteplanGeneratorUtils";
import { Property } from "./SitePlanClasses/Property";
import { Parking } from "./SitePlanClasses/Parking";
import { Building } from "./SitePlanClasses/Building";
import { Garbage } from "./SitePlanClasses/Garbage";
import { Approach } from "./SitePlanClasses/Approach";

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
  const [parking, setParking] = useState<Parking | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [garbage, setGarbage] = useState<Garbage | null>(null);
  const [approach, setApproach] = useState<Approach | null>(null);

  const propertyRef = useRef<Property | null>(null);



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

      // if (sitePlanGenerator.current) {
      // sitePlanGenerator.current.visualize(p); // Delegate drawing to the sitePlanGenerator
      // }
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

      
      drawArea(p, isPolygonClosedRef.current, pointsRef, scaleRef.current || defaultScale);
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
          const isClockwise = getIsClockwise(propertyCorners)
          const _property = new Property(p, propertyCorners, isClockwise, scaleRef.current || defaultScale, setbacks);
          propertyRef.current = _property;
          propertyRef.current.initialize()
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



        // SET THE SETBACKS
        // if (_lines.length) {
        //   _lines.forEach((line, index) => {
        //     let _i = index;
        //     if (isClockwise) {
        //       _i = getReversedIndex(index, _lines.length);
        //     }
        //     setbacks[_i] = (line.setback || 0) / (scaleRef.current || 1)
        //   });
        // }

      }

      // ALL THINGS APPROACH
      if (stepSelectorRefs.approach.current) {
        if (isPolygonClosed && lineIndex !== -1) {
          selectedLineIndexRef.current = lineIndex;
          lines[lineIndex].isApproach = !lines[lineIndex].isApproach;


          // const _lines = [...lines, newLine]
          // this.approach = new Approach(p, getCenterPoint(p, this.property.approachEdge?.point1 || defaultVector, this.property.approachEdge?.point2 || defaultVector), approachWidth, 20, approachAngle, ESitePlanObjects.Approach, this.scale);

          // approachIndex === -1 ? 0 : approachIndex
          // const setbacks = Array.apply(null, Array(_lines.length)).map(Number.prototype.valueOf, 0);
          // let approachIndex = _lines.findIndex(line => line.isApproach);
          // approachIndex = approachIndex === -1 ? 0 : approachIndex;

          // const isClockwise = getIsClockwise(propertyCorners)
          // if (isClockwise) {
          //   const first = propertyCorners[0];
          //   const rest = propertyCorners.slice(1, propertyCorners.length).reverse()
          //   propertyCorners = [first, ...rest]
          //   const newIndex = getReversedIndex(approachIndex, _lines.length);
          //   approachIndex = newIndex;
          // }

        }
      }
      // ALL THINGS PARKING
      else if (stepSelectorRefs.parking.current) {
        // this.parking = new Parking(p, p.createVector(centerOfProperty.x, centerOfProperty.y), parkingWidth, 10, approachAngle, ESitePlanObjects.ParkingWay, this.scale);

      }
      // ALL THINGS BUILDING
      else if (stepSelectorRefs.building.current) {
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
    };

    p.mouseReleased = () => {
      draggingPointIndexRef.current = null;
      selectedLineIndexRef.current = null;
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
  p.stroke(0, 0, 0)
  p.strokeWeight(1)

  p.textAlign(p.RIGHT)
  p.textSize(18);
  p.text(`Area: ${area.toFixed(2)} sq ft`, p.width-10,  20);
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