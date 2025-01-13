import React, { useEffect, useReducer, useRef, useState } from 'react';
// import LotLineDrawer from './LotLineDrawerP5';
// import VoronoiDiagram from '../futureItems/VoronoiDiagram';
import p5 from 'p5';
// import LotLineDrawerOld from '../futureItems/LotLineDrawerOld';
// import { SubdivisionGenerator } from './SubdivisionGenerator';
// import VoronoiSubdivision from '../futureItems/VoronoiDiagram';
import './SitePlanDesigner.scss';
import { SiteplanGenerator } from '../../utils/SiteplanGenerator';
import { AdjacencyGraph } from '../../utils/AdjacencyGraph';
import { countParkingStalls } from '../../utils/SiteplanGeneratorUtils';
import { sketchForSiteplan } from './sketchForSiteplan';

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

  const [parkingNumber, setParkingNumber] = useState<string | number>(4);
  const [taperParking,setTaperParking] = useState<boolean>(true);
  const [parkingDrivewayWidth, setParkingDrivewayWidth] = useState<string | number>(24);
  const [buildingAreaTarget, setbuildingAreaTarget] = useState<string | number>(1500);

  const [approachWidth, setApproachWidth] = useState<string | number>(20);
  const [offsetHeight, setOffsetHeight] = useState({ x: 0, y: 0 });

  const [isGeneratingSitePlan, setIsGeneratingSitePlan] = useState(false);


  // Property Outputs
  const [areaOfProperty, setAreaOfProperty] = useState<number | null>(null);
  const [imperviousSurface, setImperviousSurface] = useState<number | null>(null);
  const [drivewayArea, setDrivewayArea] = useState<number | null>(null);
  const [parkingArea, setParkingArea] = useState<number | null>(null);
  const [parkingStallsArea, setParkingStallsArea] = useState<number | null>(null);
  const [handicappedStalls, setHandicappedStalls] = useState<number | null>(null);
  const [parkingStalls, setParkingStalls] = useState<number | null>(null);
  const [sidewalkArea, setSidewalkArea] = useState<number | null>(null);
  const [garbageArea, setGarbageArea] = useState<number | null>(null);
  const [actualBuildingArea, setActualBuildingArea] = useState<number | null>(null);
  const [approachArea, setApproachArea] = useState<number | null>(null);
  const [bikeParkingArea, setBikeParkingArea] = useState<number | null>(null);
  const [globalAngle, setGlobalAngle] = useState<number>(0);



  // const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const setbacksRef = useRef<number[]>([]);
  const setbackHasInputRef = useRef<boolean[]>([]);
  const pointsRef = useRef<IPoint[]>([]);
  const linesRef = useRef<Line[]>([]);
  const isPolygonClosedRef = useRef<boolean>(false);
  const isSelectingApproachRef = useRef<boolean>(false);
  const isGeneratingSitePlanRef = useRef<boolean>(false);
  const isSelectingSetbackRef = useRef<boolean>(false);

  const isDefiningScaleRef = useRef<boolean>(false);
  const inputScaleRef = useRef<number | null>(null);
  const scaleRef = useRef<number | null>(null);


  const draggingPointIndexRef = useRef<number | null>(null);
  const selectedLineIndexRef = useRef<number | null>(null);

  let visualizer = useRef<SiteplanGenerator | null>(null)// new SiteplanGenerator(graph );


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
  const sketch = sketchForSiteplan(imageURL, canvasRef, visualizer, isPolygonClosedRef, scaleRef, pointsRef, linesRef, setbacksRef, setbackHasInputRef, isSelectingApproachRef, isSelectingSetbackRef, isDefiningScaleRef, draggingPointIndexRef, selectedLineIndexRef, inputScaleRef);

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




  useEffect(() => {
    const updateVariables = () => {
      console.log("There be danger here")
      const { leftStalls, rightStalls } = countParkingStalls(visualizer.current?.parking)
      setAreaOfProperty(visualizer.current?.property?.areaOfProperty || 0);
      setImperviousSurface(visualizer.current?.property?.areaOfProperty || 0);
      setDrivewayArea(visualizer.current?.drivewayArea || 0);
      setParkingArea(visualizer.current?.parking?.parkingArea || 0);
      setParkingStallsArea(visualizer.current?.parking?.parkingStallsArea || 0);
      setHandicappedStalls(visualizer.current?.parking?.handicappedParkingNum || 0);
      setParkingStalls(leftStalls + rightStalls);
      setSidewalkArea(visualizer.current?.sidewalkArea || 0);
      setGarbageArea(visualizer.current?.garbage?.area || 0);
      setActualBuildingArea(visualizer.current?.building?.buildingAreaActual || 0);
      setApproachArea(visualizer.current?.approach?.approachArea || 0);
      setBikeParkingArea(visualizer.current?.bikeParkingArea || 0);
    };


    if (visualizer.current) {
      const interval = setInterval(updateVariables, 500); // Check for changes periodically

      return () => clearInterval(interval);
    }

  }, [visualizer?.current]);


  useEffect(() => {
    const updatedGlobals = {
      approachWidth,
      parkingNumber,
      parkingDrivewayWidth,
      buildingAreaTarget,
      globalAngle,
      taperParking
    }

    visualizer.current?.updateGlobalVariables(updatedGlobals)
  }, [parkingNumber, approachWidth, parkingDrivewayWidth, buildingAreaTarget, globalAngle,taperParking])


  const onRotationChange = (value: number) => {

    setGlobalAngle(value)

  }

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
    setIsGeneratingSitePlan(false);
    setMode('adjust')
  }

  const clearCanvas = () => {
    setImageFile(null);
    setImageURL(null);
    pointsRef.current = []
    linesRef.current = [];
    isPolygonClosedRef.current = false;
    isSelectingApproachRef.current = false;
    setIsGeneratingSitePlan(false);
    isDefiningScaleRef.current = false;
    draggingPointIndexRef.current = null;
    selectedLineIndexRef.current = null;
    inputScaleRef.current = null;
    setMode('adjust')

  };

  const selectApproach = () => {
    setIsGeneratingSitePlan(false)
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('approach')

  }

  const defineScale = () => {
    setIsGeneratingSitePlan(false);
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('scale')

  }

  const createSetbacks = () => {

    setIsGeneratingSitePlan(false);
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingSetbackRef.current = true;
    setMode('setback')
  }

  const generateSitePlan = () => {
    const points = pointsRef.current;
    const lines = linesRef.current;
    const scale = scaleRef.current;

    setIsGeneratingSitePlan(true)
    isSelectingSetbackRef.current = false;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;


    const graph = new AdjacencyGraph();
    visualizer.current = new SiteplanGenerator(graph, points, lines, scale || .25)
    // Now pass this all on to the solver
  }






  return (
    <div>
      <h1>Site Plan Generator</h1>

      {/* <VisibilityGraphComponent/> */}

      {!isGeneratingSitePlan ? <div>
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
      </div> : <></>}


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

      {mode === "adjust" && !isGeneratingSitePlan ? <input type="file" accept="image/*" onChange={handleFileUpload} /> : <></>}

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




      {isGeneratingSitePlan ?
        <>

          {/* <ArchitectCompass
            initialRotation={0}
            size={200}
            onRotationChange={onRotationChange} /> */}


          {/* <MapWithCompass/> */}
          <div className="siteplan-outputs">
            <div className="siteplan-data">
              <div className="siteplan-element">Area of Property: {areaOfProperty ?? "Loading..."}</div>

              <div className="siteplan-element">Impervious Surface: {imperviousSurface ?? "Loading..."}</div>
              <div className="siteplan-element">Driveway Area: {drivewayArea ?? "Loading..."}</div>
              <div className="siteplan-element">Parking Area: {parkingArea ?? "Loading..."}</div>
              <div className="siteplan-element">Parking Stalls Area: {parkingStallsArea ?? "Loading..."}</div>
              <div className="siteplan-element">Handicapped Stalls Count: {handicappedStalls ?? "Loading..."}</div>
              <div className="siteplan-element">Total Parking Stalls Count: {parkingStalls ?? "Loading..."}</div>
              <div className="siteplan-element">Sidewalk Area: {sidewalkArea ?? "Loading..."}</div>
              <div className="siteplan-element">Garbage Area: {garbageArea ?? "Loading..."}</div>
              <div className="siteplan-element">Actual Building Area: {actualBuildingArea ?? "Loading..."}</div>
              <div className="siteplan-element">Approach Area: {approachArea ?? "Loading..."}</div>
              <div className="siteplan-element">Bike Parking Area: {bikeParkingArea ?? "Loading..."}</div>

            </div>
          </div>
          <div className="siteplan-inputs">

            <label htmlFor={'parking'}>
              <input
                id={"parking"}
                className="centered"
                type={"number"}
                value={parkingNumber}
                onChange={(e) => setParkingNumber(e.target.value)}

              />
              Parking Stalls
            </label>

            <label htmlFor={'taper_driveway'}>

            <input type="checkbox" 
             id={"taper_driveway"}
             className="centered"
             checked={taperParking} 
             onChange={(e) => {
              setTaperParking(prev=>!prev)}}
             
             />
              Tapered Driveway
            </label>

            <label htmlFor={'approach_width'}>
              <input
                id={"approach_width"}
                className="centered"
                type={"number"}
                value={approachWidth}
                onChange={(e) => setApproachWidth(e.target.value)}

              />
              Approach Width
            </label>

            <label htmlFor={'driveway_width'}>
              <input
                id={"driveway_width"}
                className="centered"
                type={"number"}
                value={parkingDrivewayWidth}
                onChange={(e) => setParkingDrivewayWidth(e.target.value)}
              />
              Driveway Width
            </label>

            <label htmlFor={'building_size'}>
              <input
                id={"building_size"}
                className="centered"
                type={"number"}
                value={buildingAreaTarget}
                onChange={(e) => setbuildingAreaTarget(e.target.value)}
              />
              Building Area
            </label>




          </div>
        </>
        : <></>}


    </div>


  );
};

export default SitePlanDesigner;








// const subdivisionGenerator = new SubdivisionGenerator();

// visualizer.visualize(p);
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
