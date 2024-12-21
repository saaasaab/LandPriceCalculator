import React, { useEffect, useRef, useState } from 'react';
import LotLineDrawer from './LotLineDrawerP5';
import VoronoiDiagram from '../futureItems/VoronoiDiagram';
import { AdjacencyGraph } from '../utils/AdjacencyGraph';
import p5 from 'p5';
import { AdjacencyGraphVisualizer2 } from '../utils/AdjacencyGraphVisualizer2';
import LotLineDrawerOld from '../futureItems/LotLineDrawerOld';
import { SubdivisionGenerator } from './SubdivisionGenerator';
import VoronoiSubdivision from '../futureItems/VoronoiDiagram';


interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
  selected: boolean; // Indicates if the line is selected for approach
  setback?: number; // Stores the setback value in feet (optional)
}

interface FinalizedData {
  lines: Line[]; // All line data
  approachLines: Line[]; // Lines selected as approaches
  setbacks: { lineIndex: number; setback: number }[]; // Setbacks for each line
}

const SitePlanDesigner: React.FC = () => {


  const graph = new AdjacencyGraph();
  graph.addEdges("Parking1", ["Driveway"]);
  graph.addEdges("Parking2", ["Driveway"]);
  graph.addEdges("Driveway", ["Bike Parking", "Approach", "Garbage"]);
  graph.addEdges("Bike Parking", ["Approach", "Building"]);

  // graph.display();

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sketch = (p: any) => {
      const visualizer = new AdjacencyGraphVisualizer2(graph);
      // const subdivisionGenerator = new SubdivisionGenerator();
      
      p.setup = () => {
        p.createCanvas(800, 800).parent(canvasRef.current!);
        visualizer.visualize2(p);
        // subdivisionGenerator.subdivide(p);

        p.frameRate(8);
      };

    };
    new p5(sketch);
  }, [])

 

  return (
    <div>


      {/* <VoronoiSubdivision/> */}
      <div ref={canvasRef} style={{ marginTop: '20px' }}>
      </div>
    </div>
  );
};

export default SitePlanDesigner;








{/* <LotLineDrawerOld onFinalize={handleFinalize} /> */}

// const handleFinalize = (data: FinalizedData) => {
//   setFinalizedData(data); // Save the finalized data
// };
// const [finalizedData, setFinalizedData] = useState<FinalizedData | null>(null);
  {/* <VoronoiDiagram/> */}
      {/* <PolygonDivider /> */}
      {/* {!finalizedData ? (
        
        // <LotLineDrawer  />
     

      ) : (
        <div>
          <h2>Finalized Data</h2>
          <pre>{JSON.stringify(finalizedData, null, 2)}</pre>
          {/* Replace this with the next step in your workflow */}
      {/* </div> */}
      {/* // )} */}



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
