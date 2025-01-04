import React, { useEffect, useRef, useState } from 'react';
// import LotLineDrawer from './LotLineDrawerP5';
// import VoronoiDiagram from '../futureItems/VoronoiDiagram';
import { AdjacencyGraph } from '../utils/AdjacencyGraph';
import p5 from 'p5';
import { AdjacencyGraphVisualizer2 } from '../utils/AdjacencyGraphVisualizer2';
import LotLineDrawer from '../futureItems/LotLineDrawerOld';
// import LotLineDrawerOld from '../futureItems/LotLineDrawerOld';
// import { SubdivisionGenerator } from './SubdivisionGenerator';
// import VoronoiSubdivision from '../futureItems/VoronoiDiagram';


export interface IPoint {
  x: number;
  y: number;
}

export interface Line {
  start: number;
  end: number;
  setback?: number;
  color: string;
  index: number;
  selected: boolean;
  isApproach: boolean;
  isScale: boolean;
  isSetback: boolean
}

const SitePlanDesigner: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [mode, setMode] = useState<'adjust' | 'approach' | 'setback' | 'scale' | 'generate'>('adjust'); // Interaction mode

  const [offsetHeight, setOffsetHeight] = useState({ x: 0, y: 0 });


  // const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const setbacksRef = useRef<number[]>([]);
  const setbackHasInputRef = useRef<boolean[]>([]);
  const pointsRef = useRef<IPoint[]>([]);
  const linesRef = useRef<Line[]>([]);
  const isPolygonClosedRef = useRef<boolean>(false);
  const isSelectingApproachRef = useRef<boolean>(false);
  const isSelectingSetbackRef = useRef<boolean>(false);

  const isDefiningScaleRef = useRef<boolean>(false);
  const inputScaleRef = useRef<number | null>(null);
  const scaleRef = useRef<number | null>(null);


  const draggingPointIndexRef = useRef<number | null>(null);
  const selectedLineIndexRef = useRef<number | null>(null);

  let visualizer = useRef<AdjacencyGraphVisualizer2 | null>(null)// new AdjacencyGraphVisualizer2(graph );

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageURL(url);
    }
  };

  // P5 sketch function
  const sketch = (p: p5) => {
    let img: p5.Image | null = null;
    // const 
    p.preload = () => {
      if (imageURL) {
        img = p.loadImage(imageURL);
      }
    };

    p.setup = () => {

      // p.createCanvas(800, 800).parent(canvasRef.current!);


      const canvas = p.createCanvas(800, 600);
      if (canvasRef.current) {
        canvas.parent(canvasRef.current);
      }
      // p.frameRate(8);

    };



    p.draw = () => {

      if (visualizer.current) {
        visualizer.current.visualize2(p); // Delegate drawing to the visualizer
      } else {
        const isPolygonClosed = isPolygonClosedRef.current;

        calculateScale()
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
          p.background(200); // Default background
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
          p.fill(0, 20, 220)

          const midX = (points[line.start].x + points[line.end].x) / 2;
          const midY = (points[line.start].y + points[line.end].y) / 2;
          const length = Math.hypot(points[line.end].x - points[line.start].x, points[line.end].y - points[line.start].y) * (scale || .25);

          // if is finished, make the text larger.

          p.textSize(14);
          p.text(`${length.toFixed(1)} ft`, midX, midY);
        }




        if (isPolygonClosed) {
          p.fill(10, 20, 200, 20)
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
      const setbackHasInput = setbackHasInputRef.current;
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
      if (
        points.length > 2 &&
        p.dist(points[0].x, points[0].y, mx, my) < 10 &&
        !isPolygonClosed
      ) {
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
    }
  };


  useEffect(() => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect()
    setOffsetHeight({ x: rect.left || 0, y: rect.top || 0 })
  }, [canvasRef?.current])


  useEffect(() => {
    const p5Instance = new p5(sketch);
    return () => {
      p5Instance.remove();
    };
  }, [imageURL]);

  // Update setback for a specific line
  const updateSetback = (index: number, value: string) => {

    const lines = linesRef.current;
    const newLines = [...lines];
    newLines[index].setback = parseFloat(value) || 0;

    lines[index].setback = parseFloat(value) || 0

    // setLines(newLines);
  };


  const createPoints = () => {
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;
    setMode('adjust')
  }

  const clearCanvas = () => {
    setImageFile(null);
    setImageURL(null);
    pointsRef.current = []
    linesRef.current = [];
    isPolygonClosedRef.current = false;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;
    draggingPointIndexRef.current = null;
    selectedLineIndexRef.current = null;
    inputScaleRef.current = null;
    setMode('adjust')

  };

  const selectApproach = () => {
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('approach')

  }

  const defineScale = () => {
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('scale')

  }

  const createSetbacks = () => {

    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingSetbackRef.current = true;
    setMode('setback')
  }

  const generateSitePlan = () => {
    const points = pointsRef.current;
    const lines = linesRef.current;
    const scale = scaleRef.current;

    isSelectingSetbackRef.current = false;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;
    setMode('generate')

    const graph = new AdjacencyGraph();
    visualizer.current = new AdjacencyGraphVisualizer2(graph, points, lines, scale || .25)
    // Now pass this all on to the solver
  }

  return (
    <div>
      <h1>Site Plan Generator</h1>

      <div>
        <button
          onClick={clearCanvas}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Clear
        </button>

        <button
          onClick={createPoints}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Create Points
        </button>

        <button
          onClick={selectApproach}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Select approach
        </button>

        <button
          onClick={defineScale}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Define Scale
        </button>

        <button
          onClick={createSetbacks}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Create Setbacks
        </button>

        <button
          onClick={generateSitePlan}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Generate Site Plan
        </button>
      </div>


      {mode === "scale" ? <div style={{ marginTop: '10px' }}>
        <label>Edge Length (ft): </label>
        <input
          // ref={setbackInputRef} // Attach ref for auto-focus
          type="number"
          value={inputScaleRef.current || undefined}
          onChange={(e) => {
            inputScaleRef.current = Number(e.target.value)
          }}
          autoFocus
        />
      </div> : <></>}

      {mode === "adjust" ? <input type="file" accept="image/*" onChange={handleFileUpload} /> : <></>}

      <div ref={canvasRef} />

      {/* Render inputs over the canvas */}
      {isSelectingSetbackRef.current &&
        linesRef.current?.map((line, index) => {
          const start = pointsRef.current[line.start];
          const end = pointsRef.current[line.end];
          if (!start || !end) return null;

          const midX = (start.x + end.x) / 2 + offsetHeight.x;
          const midY = (start.y + end.y) / 2 + offsetHeight.y;
          return (
            <input
              key={index}
              type="number"
              value={line.setback}
              onChange={(e) => updateSetback(index, e.target.value)}
              style={{
                position: "absolute",
                left: `${midX}px`,
                top: `${midY}px`,
                width: "50px",
              }}
            />
          );
        })}


    </div>

    // <div>


    //   {/* <VoronoiSubdivision/> */}
    //   <LotLineDrawer imageURL={imageURL}/>

    //   <div ref={canvasRef} style={{ marginTop: '20px' }}>
    //   </div>
    // </div>
  );
};

export default SitePlanDesigner;




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



// const subdivisionGenerator = new SubdivisionGenerator();

// visualizer.visualize2(p);
// subdivisionGenerator.subdivide(p);
// const graph = new AdjacencyGraph();
// graph.addEdges("Parking1", ["Driveway"]);
// graph.addEdges("Parking2", ["Driveway"]);
// graph.addEdges("Driveway", ["Bike Parking", "Approach", "Garbage"]);
// graph.addEdges("Bike Parking", ["Approach", "Building"]);


// const canvasRef = useRef<HTMLDivElement>(null);

// const sketch = (p: p5) => {
//   let img: p5.Image | null = null;
//   p.preload = () => {
//     if (imageURL) {
//       img = p.loadImage(imageURL);
//     }
//   };



{/* <LotLineDrawerOld onFinalize={handleFinalize} /> */ }

// const handleFinalize = (data: FinalizedData) => {
//   setFinalizedData(data); // Save the finalized data
// };
// const [finalizedData, setFinalizedData] = useState<FinalizedData | null>(null);
{/* <VoronoiDiagram/> */ }
{/* <PolygonDivider /> */ }
{/* {!finalizedData ? (
        
        // <LotLineDrawer  />
     

      ) : (
        <div>
          <h2>Finalized Data</h2>
          <pre>{JSON.stringify(finalizedData, null, 2)}</pre>
          {/* Replace this with the next step in your workflow */}
{/* </div> */ }
{/* // )} */ }



// // graph.addVertex("Property Line");
// // graph.addVertex("Setback");
// // graph.addVertex("Easement");
// // graph.addVertex("Landscaping");
// // graph.addVertex("Parking1");
// // graph.addVertex("Parking2");
// // graph.addVertex("Driveway");
// // graph.addVertex("Bike Parking");
// // graph.addVertex("Building");
// // graph.addVertex("Approach");
// // graph.addVertex("Sidewalk");
// // graph.addVertex("Garbage");

// // graph.addEdges("Property Line", ["Setback", "Easement", "Landscaping", "Approach", "Sidewalk"]);
// // graph.addEdges("Setback", ["Easement", "Landscaping", "Parking", "Driveway", "Bike Parking", "Building", "Approach", "Sidewalk", "Garbage"]);
// // graph.addEdges("Easement", ["Landscaping", "Parking", "Driveway", "Bike Parking", "Building", "Approach", "Sidewalk", "Garbage"]);
// // graph.addEdges("Landscaping", ["Parking", "Driveway", "Bike Parking", "Building", "Approach", "Sidewalk", "Garbage"]);
// // graph.addEdges("Sidewalk", ["Garbage","Driveway","Bike Parking","Building","Approach","Parking1","Parking2"]);
