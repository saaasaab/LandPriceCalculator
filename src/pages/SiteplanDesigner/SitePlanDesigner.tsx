export interface FormData {
  parkingStalls: number;
  approachWidth: number;
  drivewayWidth: number;
  buildingArea: number;
  taperedDriveway: boolean;
}

export interface SiteMetrics {
  propertyArea: number;
  imperviousSurface: number;
  drivewayArea: number;
  parkingArea: number;
  parkingStallsArea: number;
  handicappedStallsCount: number;
  totalParkingStalls: number;
  sidewalkArea: number;
  garbageArea: number;
  actualBuildingArea: number;
  approachArea: number;
  bikeParkingArea: number;
}

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


// SitePlanGenerator.tsx
import React, { useState, ChangeEvent, useEffect, useRef, useCallback, useMemo } from 'react';

import './SitePlanDesigner.scss';
import { Card, CardHeader, CardTitle, CardContent, Input } from '../../components/ui';
import { SiteplanGenerator } from '../../utils/SiteplanGenerator';
import { sketchForSiteplan } from './sketchForSiteplan';
import p5 from 'p5';
import { countParkingStalls } from '../../utils/SiteplanGeneratorUtils';
import { AdjacencyGraph } from '../../utils/AdjacencyGraph';
import ImageUploader from './ImageUploader';

const initialFormData: FormData = {
  parkingStalls: 4,
  approachWidth: 20,
  drivewayWidth: 24,
  buildingArea: 1500,
  taperedDriveway: true
};

const initialMetrics: SiteMetrics = {
  propertyArea: 12192,
  imperviousSurface: 12192,
  drivewayArea: 521,
  parkingArea: 936,
  parkingStallsArea: 1156,
  handicappedStallsCount: 0,
  totalParkingStalls: 8,
  sidewalkArea: 0,
  garbageArea: 2808,
  actualBuildingArea: 5851,
  approachArea: 62,
  bikeParkingArea: 0
};

const SitePlanGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [metrics, setMetrics] = useState<SiteMetrics>(initialMetrics);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [mode, setMode] = useState<'adjust' | 'approach' | 'setback' | 'scale' | 'generate' | 'upload'>('adjust'); // Interaction mode

  const [offsetHeight, setOffsetHeight] = useState({ x: 0, y: 0 });
  const [isGeneratingSitePlan, setIsGeneratingSitePlan] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(true)



  // Property Outputs
  const [globalAngle, setGlobalAngle] = useState<number>(0);




  const canvasContainerRef = useRef<HTMLDivElement>(null);
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


  // P5 sketch function


  const sketch = sketchForSiteplan(imageURL, canvasRef, visualizer, isPolygonClosedRef, scaleRef, pointsRef, linesRef, setbacksRef, setbackHasInputRef, isSelectingApproachRef, isSelectingSetbackRef, isDefiningScaleRef, draggingPointIndexRef, selectedLineIndexRef, inputScaleRef, canvasContainerRef);

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


  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageURL(url);
    }
  };

  const handleInputChange = (field: keyof FormData, value: number | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (e: ChangeEvent<HTMLInputElement>, field: keyof FormData): void => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleInputChange(field, value);
    }
  };

  const formatMetricValue = (key: keyof SiteMetrics, value: number): string => {
    const formattedValue = value.toLocaleString();
    return key.toLowerCase().includes('area') ? `${formattedValue} sq ft` : formattedValue;
  };

  const formatMetricLabel = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (char) => char.toUpperCase());
  };



  useEffect(() => {
    const updateVariables = () => {
      console.log("There be danger here")
      const { leftStalls, rightStalls } = countParkingStalls(visualizer.current?.parking)


      const _metrics: SiteMetrics = {
        propertyArea: visualizer.current?.property?.areaOfProperty || 0,
        imperviousSurface: visualizer.current?.property?.areaOfProperty || 0,
        drivewayArea: visualizer.current?.drivewayArea || 0,
        parkingArea: visualizer.current?.parking?.parkingArea || 0,
        parkingStallsArea: visualizer.current?.parking?.parkingStallsArea || 0,
        handicappedStallsCount: visualizer.current?.parking?.handicappedParkingNum || 0,
        totalParkingStalls: leftStalls + rightStalls,
        sidewalkArea: visualizer.current?.sidewalkArea || 0,
        garbageArea: visualizer.current?.garbage?.area || 0,
        actualBuildingArea: visualizer.current?.building?.buildingAreaActual || 0,
        approachArea: visualizer.current?.approach?.approachArea || 0,
        bikeParkingArea: visualizer.current?.bikeParkingArea || 0,
      };
      setMetrics(_metrics);
    };


    if (visualizer.current) {
      const interval = setInterval(updateVariables, 500); // Check for changes periodically

      return () => clearInterval(interval);
    }

  }, [visualizer?.current]);

  useEffect(() => {

    const updatedGlobals = {


      approachWidth: formData.approachWidth,
      parkingNumber: formData.parkingStalls,
      parkingDrivewayWidth: formData.drivewayWidth,
      buildingAreaTarget: formData.buildingArea,
      globalAngle: globalAngle,
      taperParking: formData.taperedDriveway
    }

    visualizer.current?.updateGlobalVariables(updatedGlobals)
  }, [formData, globalAngle])


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

  const startUploadingImage = () => {
    setMode('upload')

    setIsUploadingImage(true);
    isSelectingSetbackRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;

  }
  const createPoints = () => {
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;
    setIsGeneratingSitePlan(false);
    setIsUploadingImage(false);

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
    setIsUploadingImage(false);
    isDefiningScaleRef.current = false;
    draggingPointIndexRef.current = null;
    selectedLineIndexRef.current = null;
    inputScaleRef.current = null;
    setMode('adjust')

  };

  const selectApproach = () => {
    setIsGeneratingSitePlan(false)
    setIsUploadingImage(false);

    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('approach')

  }

  const defineScale = () => {
    setIsGeneratingSitePlan(false);
    setIsUploadingImage(false);

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
    setIsUploadingImage(false);
    isSelectingSetbackRef.current = false;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;


    const graph = new AdjacencyGraph();
    visualizer.current = new SiteplanGenerator(graph, points, lines, scale || .25)
    // Now pass this all on to the solver
  }


  const uploadStatus = () => {
    if (!imageURL && isUploadingImage) {
      return EStatus.notStarted
    }
    else if (!imageURL && isUploadingImage) {
      return EStatus.inProgress
    }
    else {
      return EStatus.complete;
    }
  };


  const createPropertyLinesStatus = useMemo(
    () => {

      if (pointsRef.current.length > 0 && !isPolygonClosedRef.current) {
        return EStatus.inProgress
      }
      else if (isPolygonClosedRef.current) {
        return EStatus.complete
      }
      else {
        return EStatus.notStarted
      }
    },
    [isPolygonClosedRef.current, pointsRef.current],
  )

  const approachStatus = ""
  const scaleStatus = ""
  const setbacksStatus = ``

  return (
    <div className="site-plan-generator">
      <div className="site-plan-generator__container">
        {/* Left Column - Controls */}
        <div className="site-plan-generator__controls">
          <Card>
            <CardHeader>
              <CardTitle>Site Plan Generator</CardTitle>
            </CardHeader>


            {isGeneratingSitePlan ?
              <CardContent>
                {/* Input Controls */}
                <div className="site-plan-generator__section-header">
                  <h3>Input Parameters</h3>
                </div>

                <div className="site-plan-generator__input-group">
                  <label htmlFor="parkingStalls">Parking Stalls</label>
                  <Input
                    id="parkingStalls"
                    type="number"
                    min={0}
                    value={formData.parkingStalls}
                    onChange={(e) => handleNumberInput(e, 'parkingStalls')}
                  />
                </div>

                <div className="site-plan-generator__input-group">
                  <label htmlFor="approachWidth">Approach Width (ft)</label>
                  <Input
                    id="approachWidth"
                    type="number"
                    min={0}
                    value={formData.approachWidth}
                    onChange={(e) => handleNumberInput(e, 'approachWidth')}
                  />
                </div>

                <div className="site-plan-generator__input-group">
                  <label htmlFor="drivewayWidth">Driveway Width (ft)</label>
                  <Input
                    id="drivewayWidth"
                    type="number"
                    min={0}
                    value={formData.drivewayWidth}
                    onChange={(e) => handleNumberInput(e, 'drivewayWidth')}
                  />
                </div>

                <div className="site-plan-generator__input-group">
                  <label htmlFor="buildingArea">Building Area (sq ft)</label>
                  <Input
                    id="buildingArea"
                    type="number"
                    min={0}
                    value={formData.buildingArea}
                    onChange={(e) => handleNumberInput(e, 'buildingArea')}
                  />
                </div>

                <div className="site-plan-generator__checkbox">
                  {/* <Checkbox 
                  id="taperedDriveway"
                  checked={formData.taperedDriveway}
                  onCheckedChange={(checked: boolean) => handleInputChange('taperedDriveway', checked)}
                /> */}
                  <label htmlFor="taperedDriveway">Tapered Driveway</label>
                </div>


                {/* Metrics Display */}
                <div className="site-plan-generator__section-header">
                  <h3>Site Metrics</h3>
                </div>

                <div className="site-plan-generator__metrics-container">
                  {(Object.entries(metrics) as [keyof SiteMetrics, number][]).map(([key, value]) => (
                    <div key={key} className="site-plan-generator__metrics-item">
                      <span className="label">
                        {formatMetricLabel(key)}
                      </span>
                      <span className="value">
                        {formatMetricValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              : <div className="pre-input-fields">



                <button
                  onClick={clearCanvas}
                  style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px', marginRight: '10px', marginBottom: '10px' }}
                >
                  Clear
                </button>

                <StepButton label="Upload Property Image" onClick={startUploadingImage} status={uploadStatus()} isActive={mode==='upload'}/>
                
                
                {mode === "upload" && !isGeneratingSitePlan ?
                  <ImageUploader onFileUpload={setImageURL} /> : <></>}

                <StepButton label="Create Points" onClick={createPoints} status={createPropertyLinesStatus} isActive={mode==='adjust'}/>
                <StepButton label="Select Approach" onClick={selectApproach} status="not-started" isActive={mode==='approach'}/>
                <StepButton label="Define Scale" onClick={defineScale} status="not-started" isActive={mode==='scale'}/>
                <StepButton label="Create Setbacks" onClick={createSetbacks} status="not-started" isActive={mode==='generate'}/>
                <button
                  onClick={generateSitePlan}
                  style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }}
                >
                  Generate Site Plan
                </button>





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



              </div>
            }
          </Card>
        </div>

        {/* Right Column - Visualization */}
        <div className="site-plan-generator__visualization">
          <Card>

            <CardContent>
              <div className="site-plan-generator__visualization-container" ref={canvasContainerRef}>

                <div ref={canvasRef} />

                {/* Render inputs over the canvas */}
                {isSelectingSetbackRef.current &&
                  linesRef.current?.map((line, index) => {
                    const start = pointsRef.current[line.start];
                    const end = pointsRef.current[line.end];

                    if (!start || !end || !canvasRef.current) return null;

                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const rect = canvasRef.current.getBoundingClientRect();

                    return (
                      <input
                        key={index}
                        type="number"
                        value={line.setback}
                        onChange={(e) => updateSetback(index, e.target.value)}
                        tabIndex={index}
                        style={{
                          position: "absolute",
                          left: `${midX + rect.left}px`,
                          top: `${midY + rect.top}px`,
                          width: "50px",
                        }}
                      />
                    );
                  })}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SitePlanGenerator;












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







type Status = 'not-started' | 'in-progress' | 'complete';
enum EStatus {
  notStarted = "not-started",
  inProgress = "in-progress",
  complete = "complete",
}


interface StepButtonProps {
  label: string;
  onClick: () => void;
  status: Status;
  isActive?: boolean;
}

const StepButton: React.FC<StepButtonProps> = ({ label, onClick, status,isActive=false }) => {
  const getStatusIcon = () => {
    switch (status) {
      case EStatus.notStarted:
        return '⏳'; // Hourglass icon for "not started"
      case EStatus.inProgress:
        return '🔄'; // Spinning arrows icon for "in progress"
      case EStatus.complete:
        return '✅'; // Checkmark icon for "complete"
      default:
        return '';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }} >
      {/* <span style={{ marginRight: '10px', fontSize: '20px' }}>{getStatusIcon()}</span> */}
      <button
        onClick={onClick}
        style={{
          padding: '10px 20px',
          cursor: 'pointer',
          marginLeft: '10px',
          marginRight: '10px',
          width: '100%',
          backgroundColor: isActive ? '#007bff' : '#f0f0f0', // Active state styling
          color: isActive ? '#fff' : '#000', // Text color changes when active
          border: isActive ? '2px solid #0056b3' : '2px solid #ccc', // Active border styling
          transition: 'background-color 0.3s, color 0.3s, border 0.3s', // Smooth transitions
        }}
      >
      
        {label}
      </button>

      
    </div>
  );
};
