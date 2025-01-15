export interface FormData {
  parkingStalls: number;
  approachWidth: number;
  drivewayWidth: number;
  buildingArea: number;
  taperedDriveway: boolean;
  propertyEntranceCount: number;
  buildingCount: number;
  landscapeIsland: number;
  parkingPer1000: number;
  imperviousPercentage: number;
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

import p5 from 'p5';
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';

import { Card, CardHeader, CardTitle, CardContent, Input} from '../../components/ui';
import { SiteplanGenerator } from '../../utils/SiteplanGenerator';
import { sketchForSiteplan } from './sketchForSiteplan';
import { countParkingStalls } from '../../utils/SiteplanGeneratorUtils';
import ImageUploader from './ImageUploader';
import { EStatus, StepButton } from './StepButton';

import './SitePlanDesigner.scss';

const initialFormData: FormData = {
  parkingStalls: 4,
  approachWidth: 20,
  drivewayWidth: 24,
  buildingArea: 1500,
  taperedDriveway: true,
  propertyEntranceCount: 1,
  buildingCount: 1,
  landscapeIsland: 7,
  parkingPer1000: 2.4,
  imperviousPercentage: 70

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
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [mode, setMode] = useState<'adjust' | 'approach' | 'setback' | 'scale' | 'generate' | 'upload'>('adjust'); // Interaction mode



  const [isGeneratingSitePlan, setIsGeneratingSitePlan] = useState(false);
  const [_isPolygonClosedState, setIsPolygonClosedState] = useState(false)



  // Property Outputs
  const [globalAngle, _setGlobalAngle] = useState<number>(0);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const setbacksRef = useRef<number[]>([]);
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

  let visualizer = useRef<SiteplanGenerator | null>(null)// new SiteplanGenerator(graph );

  // P5 sketch function


  const sketch = sketchForSiteplan(imageURL, canvasRef, visualizer, isPolygonClosedRef, setIsPolygonClosedState, scaleRef, pointsRef, linesRef, setbacksRef, isSelectingApproachRef, isSelectingSetbackRef, isDefiningScaleRef, draggingPointIndexRef, selectedLineIndexRef, inputScaleRef, canvasContainerRef);


  useEffect(() => {
    const p5Instance = new p5(sketch);
    return () => {
      p5Instance.remove();
    };
  }, [imageURL]);

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


  // const onRotationChange = (value: number) => {
  //   setGlobalAngle(value)
  // }

  // Update setback for a specific line
  const updateSetback = (index: number, value: string) => {

    const lines = linesRef.current;
    const newLines = [...lines];
    newLines[index].setback = parseFloat(value) || 0;

    lines[index].setback = parseFloat(value) || 0

  };

  const startUploadingImage = () => {
    setMode('upload')

    isSelectingSetbackRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;

  }
  const createPoints = () => {
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;
    setIsGeneratingSitePlan(false);

    setMode('adjust')
  }

  const clearCanvas = () => {
    setImageURL(null);
    pointsRef.current = []
    linesRef.current = [];
    isPolygonClosedRef.current = false;
    setIsPolygonClosedState(false);
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


    visualizer.current = new SiteplanGenerator(points, lines, scale || .25)
    // Now pass this all on to the solver
  }


  const uploadStatus = () => {
    if (!imageURL && mode === "upload") {
      return EStatus.inProgress
    }
    else if (!imageURL && mode !== "upload") {
      return EStatus.notStarted
    }
    else {
      return EStatus.complete;
    }
  };





  const createPropertyLinesStatus = () => {

    if (!isPolygonClosedRef.current && mode === "adjust") {
      return EStatus.inProgress
    }
    else if (!isPolygonClosedRef.current && mode !== "adjust") {
      return EStatus.notStarted
    }
    else {
      return EStatus.complete;
    }
  }



  const createSelectApproachStatus = () => {
    const hasApproach = linesRef.current.findIndex(line => line.isApproach === true);

    if (hasApproach === -1 && mode === "approach") {
      return EStatus.inProgress
    }
    else if (hasApproach === -1 && mode !== "approach") {
      return EStatus.notStarted
    }
    else {
      return EStatus.complete;
    }
  }

  const createScaleStatus = () => {
    if (!scaleRef.current && mode === "scale") {
      return EStatus.inProgress
    }
    else if (!scaleRef.current && mode !== "scale") {
      return EStatus.notStarted
    }
    else {
      return EStatus.complete;
    }
  }

  const createSetbackStatus = () => {

    const hasNoSetback= linesRef.current.findIndex(line => (line.setback || 0) > 0)  === -1;

    if (hasNoSetback && mode === "setback") {
      return EStatus.inProgress
    }
    else if (hasNoSetback && mode !== "setback") {

      return EStatus.notStarted
    }
    else {
      return EStatus.complete;
    }
  }



  // const approachStatus = ""
  // const scaleStatus = ""
  // const setbacksStatus = ``

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
                    value={formData.approachWidth || ""} // Show an empty string if the value is null or undefined
                    onChange={(e) => handleNumberInput(e, 'approachWidth')}
                  />
                </div>

                <div className="site-plan-generator__input-group">
                  <label htmlFor="drivewayWidth">Driveway Width (ft)</label>
                  <Input
                    id="drivewayWidth"
                    type="number"
                    min={0}
                    value={formData.drivewayWidth || ""}
                    onChange={(e) => handleNumberInput(e, 'drivewayWidth')}
                  />
                </div>

                <div className="site-plan-generator__input-group">
                  <label htmlFor="buildingArea">Building Area (sq ft)</label>
                  <Input
                    id="buildingArea"
                    type="number"
                    min={0}
                    value={formData.buildingArea || ""}
                    onChange={(e) => handleNumberInput(e, 'buildingArea')}
                  />
                </div>

                {/* <div className="site-plan-generator__checkbox disabled">
                  <label htmlFor="taperedDriveway">Tapered Driveway</label>

                  <Checkbox
                    id="taperedDriveway"
                    checked={formData.taperedDriveway}
                  //  ={(checked: boolean) => handleInputChange('taperedDriveway', checked)}
                  />
                </div> */}


                <div className="site-plan-generator__input-group disabled">
                  <label htmlFor="propertyEntranceCount">Property Entrance Count</label>
                  <Input
                    id="propertyEntranceCount"
                    type="number"
                    min={0}
                    value={formData.propertyEntranceCount || ""}
                    onChange={(e) => handleNumberInput(e, 'propertyEntranceCount')}
                  />
                </div>

                <div className="site-plan-generator__input-group disabled">
                  <label htmlFor="buildingCount">Building Count</label>
                  <Input
                    id="buildingCount"
                    type="number"
                    min={0}
                    value={formData.buildingCount || ""}
                    onChange={(e) => handleNumberInput(e, 'buildingCount')}
                  />
                </div>

                <div className="site-plan-generator__input-group disabled">
                  <label htmlFor="landscapeIsland">Stall / Landscape Stall Ratio</label>
                  <Input
                    id="landscapeIsland"
                    type="number"
                    min={0}
                    value={formData.landscapeIsland || ""}
                    onChange={(e) => handleNumberInput(e, 'landscapeIsland')}
                  />
                </div>

                <div className="site-plan-generator__input-group disabled">
                  <label htmlFor="parkingPer1000">Minimum Parking per 1000 SQFT</label>
                  <Input
                    id="parkingPer1000"
                    type="number"
                    min={0}
                    value={formData.parkingPer1000 || ""}
                    onChange={(e) => handleNumberInput(e, 'parkingPer1000')}
                  />
                </div>

                <div className="site-plan-generator__input-group disabled">
                  <label htmlFor="imperviousPercentage">Impervious Surface %</label>
                  <Input
                    id="imperviousPercentage"
                    type="number"
                    min={0}
                    value={formData.imperviousPercentage || ""}
                    onChange={(e) => handleNumberInput(e, 'imperviousPercentage')}
                  />
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



                <StepButton label="Clear" onClick={clearCanvas} />


                <StepButton label="Upload Property Image" onClick={startUploadingImage} status={uploadStatus()} isActive={mode === 'upload'} >
                  {mode === "upload" && !isGeneratingSitePlan ?
                    <ImageUploader onFileUpload={setImageURL} /> : <></>}
                </StepButton>

                <StepButton label="Create Property Boundary" onClick={createPoints} status={createPropertyLinesStatus()} isActive={mode === 'adjust'} />
                <StepButton label="Select Approach" onClick={selectApproach} status={createSelectApproachStatus()} isActive={mode === 'approach'}  disabled={!isPolygonClosedRef.current}/>

                <StepButton label="Define Scale" onClick={defineScale} status={createScaleStatus()} isActive={mode === 'scale'}   disabled={!isPolygonClosedRef.current}>
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
                </StepButton>
                <StepButton label="Create Setbacks" onClick={createSetbacks} status={createSetbackStatus()} isActive={mode === 'setback'}   disabled={!isPolygonClosedRef.current}/>
                <StepButton label="Generate Site Plan" onClick={generateSitePlan} isActive={mode === 'generate'} />

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


