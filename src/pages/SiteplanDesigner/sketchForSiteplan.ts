import p5 from "p5";
import { SiteplanGenerator } from "../../utils/SiteplanGenerator";
import { IPoint, Line } from "./SitePlanDesigner";

 

export function sketchForSiteplan(imageURL: string | null, canvasRef: React.RefObject<HTMLDivElement>, visualizer: React.MutableRefObject<SiteplanGenerator | null>, isPolygonClosedRef: React.MutableRefObject<boolean>, scaleRef: React.MutableRefObject<number | null>, pointsRef: React.MutableRefObject<IPoint[]>, linesRef: React.MutableRefObject<Line[]>, setbacksRef: React.MutableRefObject<number[]>, isSelectingApproachRef: React.MutableRefObject<boolean>, isSelectingSetbackRef: React.MutableRefObject<boolean>, isDefiningScaleRef: React.MutableRefObject<boolean>, draggingPointIndexRef: React.MutableRefObject<number | null>, selectedLineIndexRef: React.MutableRefObject<number | null>, inputScaleRef: React.MutableRefObject<number | null>,canvasContainerRef: React.RefObject<HTMLDivElement>) {
    return (p: p5) => {
      let img: p5.Image | null = null;
      // const 
      p.preload = () => {
        if (imageURL) {
          img = p.loadImage(imageURL);
        }
      };
  
      p.setup = () => {


        if (canvasRef.current && canvasContainerRef.current) {
          const rect =canvasContainerRef.current.getBoundingClientRect()

          const canvas = p.createCanvas(rect.width-20, rect.height-20);
          canvas.parent(canvasRef.current);
        }
      };
  
  
  
      p.draw = () => {
  
        if (visualizer.current) {
          visualizer.current.visualize(p); // Delegate drawing to the visualizer
        } else {
          const isPolygonClosed = isPolygonClosedRef.current;
  
          calculateScale();
          const scale = scaleRef.current;
  
  
          if (img) {
  
            // Resize the image, keeping the aspect ratio.
            if (img.width > img.height) {
              img.resize(0, p.height);
  
            } else {
              img.resize(p.width, 0);
  
            }
  
            // Display the resized image.
            p.image(img, 0, 0);
  
  
            // p.image(img, 0, 0, img.width, img.height); // Draw the image as the background
          } else {
            p.background("#f9fafb"); // Default background
          }
  
          // Draw lines connecting points
          const points = pointsRef.current;
          const lines = linesRef.current;
          // const isPolygonClosed = isPolygonClosedRef.current;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
  
  
            if (line.isApproach) {
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
            const length = Math.hypot(points[line.end].x - points[line.start].x, points[line.end].y - points[line.start].y) * (scale || .25);
  
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
  
          drawArea(p, isPolygonClosedRef.current, points, scale || .25);
        }
      };
  
      p.mousePressed = () => {
        const points = pointsRef.current;
        const lines = linesRef.current;
        const setbacks = setbacksRef.current;
        // const setbackHasInput = setbackHasInputRef.current;
        const isPolygonClosed = isPolygonClosedRef.current;
        const isSelectingApproach = isSelectingApproachRef.current;
        const isSelectingSetback = isSelectingSetbackRef.current;
  
        const isDefiningScale = isDefiningScaleRef.current;
        const scale = scaleRef.current;
  
  
        const mx = p.mouseX;
        const my = p.mouseY;
  
        if (mx < 0 || mx > p.width || my < 0 || my > p.height) return;
  
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
              // setback: 0
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
  
          const newLine: Line = {
            start: points.length - 1,
            end: 0,
            color: "#000000", // Default line color
            index: lines.length,
            selected: false,
            isApproach: false,
            isScale: false,
            isSetback: false,
            // setback: 5
          };
          setbacks.push(0);
          lines.push(newLine);
        }
  
  
        if (isPolygonClosed) {
          // Check if a line is clicked
          const lineIndex = lines.findIndex((line) => {
            const d1 = p.dist(mx, my, points[line.start].x, points[line.start].y);
            const d2 = p.dist(mx, my, points[line.end].x, points[line.end].y);
            const lineLength = p.dist(points[line.start].x, points[line.start].y, points[line.end].x, points[line.end].y);
            return Math.abs(d1 + d2 - lineLength) < 5; // Allow for small tolerance
          });
  
  
          // Set line to be an approach
          if (lineIndex !== -1) {
            selectedLineIndexRef.current = lineIndex;
  
            if (isSelectingApproach) {
              lines[lineIndex].isApproach = !lines[lineIndex].isApproach;
            }
  
            if (isSelectingSetback) {
              lines[lineIndex].isSetback = !lines[lineIndex].isSetback;
            }
  
            if (isDefiningScale && !inputScaleRef.current && !scale) {
              lines[lineIndex].isScale = !lines[lineIndex].isScale;
            }
  
            // lines[lineIndex].color = "#00FF00"; // Change color of the selected line to green
            return;
          }
        }
      };
  
      p.mouseDragged = () => {
        const draggingPointIndex = draggingPointIndexRef.current;
        if (draggingPointIndex !== null) {
          const points = pointsRef.current;
          points[draggingPointIndex] = { x: p.mouseX, y: p.mouseY };
        }
      };
  
      p.mouseReleased = () => {
        draggingPointIndexRef.current = null;
        selectedLineIndexRef.current = null;
      };
  
  
      const calculateScale = () => {
        const inputScale = inputScaleRef.current;
        const points = pointsRef.current;
        const lines = linesRef.current;
        const lineIndex = lines.find(line => line.isScale)?.index;
  
        if (typeof lineIndex !== 'undefined' && lineIndex !== -1) {
          const lineLength = p.dist(points[lines[lineIndex].start].x, points[lines[lineIndex].start].y, points[lines[lineIndex].end].x, points[lines[lineIndex].end].y);
  
          if (inputScale && lineLength) {
            scaleRef.current = inputScale / lineLength;
  
          }
        }
      };
    };
  }
  


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
    points: IPoint[],
    scale: number,
  ) {
    if (!isPolygonClosed || points.length < 3) return;
    const area = calculateArea(points) * Math.pow(scale, 2)
    // p.noFill()
    p.stroke(0, 0, 0)
    p.strokeWeight(1)
  
    p.textSize(18);
    p.text(`Area: ${area.toFixed(2)} sq ft`, 10, p.height - 20);
  }