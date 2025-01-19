export interface FormData {
  approachWidth: number;
  buildingArea: number;
  buildingCount: number;
  drivewayWidth: number;
  halfStreetDriveway: boolean;
  imperviousPercentage: number;
  landscapeIsland: number;
  parkingPer1000: number;
  parkingStalls: number;
  propertyEntranceCount: number;
  taperedDriveway: boolean;
  parkingSide: 'right' | 'left';
}

export interface SiteMetrics {
  actualBuildingArea: number;
  approachArea: number;
  bikeParkingArea: number;
  drivewayArea: number;
  garbageArea: number;
  handicappedStallsCount: number;
  imperviousSurface: number;
  parkingArea: number;
  parkingStallsArea: number;
  propertyArea: number;
  sidewalkArea: number;
  totalParkingStalls: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface Line {
  start: number;
  end: number;
  setback: number;
  color: string;
  index: number;
  selected: boolean;
  isApproach: boolean;
  isScale: boolean;
  isSetback: boolean
}

import p5 from 'p5';
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';

import { Map, ArrowRight, Ruler, Box, FileImage, Delete } from 'lucide-react';
import { Card, CardContent, Input, Checkbox } from '../../components/ui';
import { SiteplanGenerator } from '../../utils/SiteplanGenerator';
import { sketchForSiteplan } from './sketchForSiteplan';
import { countParkingStalls } from '../../utils/SiteplanGeneratorUtils';
import ImageUploader from './ImageUploader';

import './SitePlanDesigner.scss';
import CollapsibleSection from './CollapsibleSection';
import AlphaBanner from './AlphaBanner';

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
  imperviousPercentage: 70,
  halfStreetDriveway: false,
  parkingSide: 'left'


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
  actualBuildingArea: 1500,
  approachArea: 62,
  bikeParkingArea: 0
};

const SitePlanGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [metrics, setMetrics] = useState<SiteMetrics>(initialMetrics);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [mode, setMode] = useState<'adjust' | 'approach' | 'setback' | 'scale' | 'generate' | 'upload'>('upload'); // Interaction mode

  // const [isGeneratingSitePlan, setIsGeneratingSitePlan] = useState(false);
  const [_isPolygonClosedState, setIsPolygonClosedState] = useState(false)

  const [_offsetPoints, setOffsetPoints] = useState<p5.Vector[]>([])


  const [currentStep, setCurrentStep] = useState(0);
  // const [isHelpVisible, setIsHelpVisible] = useState(true);

  // Property Outputs
  const [globalAngle, _setGlobalAngle] = useState<number>(0);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const setbacksRef = useRef<number[]>([]);
  const pointsRef = useRef<IPoint[]>([]);
  const linesRef = useRef<Line[]>([]);
  const isUploadingImageRef = useRef<boolean>(true);
  const isPolygonClosedRef = useRef<boolean>(false);
  const isSelectingApproachRef = useRef<boolean>(false);
  const isSelectingSetbackRef = useRef<boolean>(false);
  const isDefiningScaleRef = useRef<boolean>(false);
  const isGeneratingSitePlanRef = useRef<boolean>(false);



  const inputScaleRef = useRef<number | null>(null);
  const scaleRef = useRef<number | null>(null);


  const draggingPointIndexRef = useRef<number | null>(null);
  const selectedLineIndexRef = useRef<number | null>(null);

  let visualizer = useRef<SiteplanGenerator | null>(null)// new SiteplanGenerator(graph );

  // P5 sketch function



  useEffect(() => {
    if(imageURL){
      createPoints()
    }
  }, [imageURL])

  const sketch = sketchForSiteplan(imageURL, canvasRef, visualizer, isUploadingImageRef, isPolygonClosedRef, setIsPolygonClosedState, scaleRef, pointsRef, linesRef, setbacksRef, isSelectingApproachRef, isSelectingSetbackRef, isDefiningScaleRef, draggingPointIndexRef, selectedLineIndexRef, inputScaleRef, canvasContainerRef);


  useEffect(() => {
    const p5Instance = new p5(sketch);
    return () => {
      p5Instance.remove();
    };
  }, [imageURL]);

  const handleInputChange = (field: keyof FormData, value: number | boolean | string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>, field: keyof FormData): void => {
    const value = e.target.value; // Value is a string ('right' or 'left')
    handleInputChange(field, value); // No error since 'parkingSide' now accepts strings
  };

  const handleBooleanInput = (e: ChangeEvent<HTMLInputElement>, field: keyof FormData): void => {
    const value = e.target.checked; // `checked` gives the boolean state of the input
    handleInputChange(field, value);
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

    // Handle empty string explicitly to allow deleting the value
    const parsedValue = value === "" ? undefined : parseFloat(value);

    newLines[index].setback = parsedValue || 0; // Fallback to 0 if undefined
    linesRef.current = newLines;

    const offsets = calculatecornerOffsetsFromSetbacks(linesRef.current, pointsRef.current);
    setOffsetPoints(offsets);

  };

  const startUploadingImage = () => {
    setMode('upload')
    setImageURL(null);
    isUploadingImageRef.current = true;
    isSelectingSetbackRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;

  }
  const createPoints = () => {
    isUploadingImageRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = false;
    isGeneratingSitePlanRef.current = false;

    setCurrentStep(1); // should point to the adjust step
    setMode('adjust')
  }

  const clearCanvas = () => {
    setImageURL(null);
    pointsRef.current = []
    linesRef.current = [];
    isUploadingImageRef.current = true;
    isPolygonClosedRef.current = false;
    setIsPolygonClosedState(false);
    isSelectingApproachRef.current = false;
    isGeneratingSitePlanRef.current = false;;
    isDefiningScaleRef.current = false;
    draggingPointIndexRef.current = null;
    selectedLineIndexRef.current = null;
    inputScaleRef.current = null;
    setMode('upload')

  };

  const selectApproach = () => {
    isGeneratingSitePlanRef.current = false;
    isUploadingImageRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingApproachRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('approach')
  }

  const defineScale = () => {
    isGeneratingSitePlanRef.current = false;;
    isUploadingImageRef.current = false;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = true;
    isSelectingSetbackRef.current = false;
    setMode('scale')
  }

  const createSetbacks = () => {
    isUploadingImageRef.current = false;
    isGeneratingSitePlanRef.current = false;;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;
    isSelectingSetbackRef.current = true;
    setMode('setback')
  }

  const generateSitePlan = () => {
    const points = pointsRef.current;
    const lines = linesRef.current;
    const scale = scaleRef.current;

    isGeneratingSitePlanRef.current = true;
    isSelectingSetbackRef.current = false;
    isSelectingApproachRef.current = false;
    isDefiningScaleRef.current = false;
    isUploadingImageRef.current = false;


    visualizer.current = new SiteplanGenerator(points, lines, scale || .35)
    // Now pass this all on to the solver
  }


  // const uploadStatus = () => {
  //   if (!imageURL && mode === "upload") {
  //     return EStatus.inProgress
  //   }
  //   else if (!imageURL && mode !== "upload") {
  //     return EStatus.notStarted
  //   }
  //   else {
  //     return EStatus.complete;
  //   }
  // };




  // const createPropertyLinesStatus = () => {

  //   if (!isPolygonClosedRef.current && mode === "adjust") {
  //     return EStatus.inProgress
  //   }
  //   else if (!isPolygonClosedRef.current && mode !== "adjust") {
  //     return EStatus.notStarted
  //   }
  //   else {
  //     return EStatus.complete;
  //   }
  // }



  // const createSelectApproachStatus = () => {
  //   const hasApproach = linesRef.current.findIndex(line => line.isApproach === true);

  //   if (hasApproach === -1 && mode === "approach") {
  //     return EStatus.inProgress
  //   }
  //   else if (hasApproach === -1 && mode !== "approach") {
  //     return EStatus.notStarted
  //   }
  //   else {
  //     return EStatus.complete;
  //   }
  // }

  // const createScaleStatus = () => {
  //   if (!scaleRef.current && mode === "scale") {
  //     return EStatus.inProgress
  //   }
  //   else if (!scaleRef.current && mode !== "scale") {
  //     return EStatus.notStarted
  //   }
  //   else {
  //     return EStatus.complete;
  //   }
  // }

  // const createSetbackStatus = () => {

  //   const hasNoSetback = linesRef.current.findIndex(line => (line.setback || 0) > 0) === -1;

  //   if (hasNoSetback && mode === "setback") {
  //     return EStatus.inProgress
  //   }
  //   else if (hasNoSetback && mode !== "setback") {

  //     return EStatus.notStarted
  //   }
  //   else {
  //     return EStatus.complete;
  //   }
  // }

  const steps = [
    {
      id: 'upload',
      title: '1. Upload Property Image',
      icon: <FileImage />,
      description: 'Start by uploading an overhead satellite image of your property',
      help: 'Use a clear aerial photo or satellite image of your property. The clearer the image, the easier it will be to mark boundaries.',
      onClick: () => startUploadingImage(),
    },
    {
      id: 'boundary',
      title: '2. Create Property Boundary',
      icon: <Map />,
      description: 'Click points on the image to draw your property boundary',
      help: 'Click each corner of your property to create the boundary line. Click the first point again to complete the shape.',
      onClick: () => { createPoints() },
    },
    {
      id: 'approach',
      title: '3. Mark Property Entrance',
      icon: <ArrowRight />,
      description: 'Click to indicate where the property is accessed from',
      help: 'Mark where vehicles enter the property, typically from the street or main access road.',
      onClick: () => { selectApproach() },
      disabled: !isPolygonClosedRef.current
    },
    {
      id: 'scale',
      title: '4. Set Property Scale',
      icon: <Ruler />,
      description: 'Define the scale by measuring a known distance',
      help: 'Draw a line along a known distance (like property edge) and enter its real-world length to set the scale.',
      onClick: () => { defineScale() },
      children: <div style={{ marginTop: '10px' }}>
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
      </div>,
      disabled: !isPolygonClosedRef.current
    },
    {
      id: 'setbacks',
      title: '5. Define Setbacks',
      icon: <Ruler />,
      description: 'Add required setback distances from property lines',
      help: 'Enter the minimum required distances from property lines according to local zoning laws.',
      onClick: () => { createSetbacks() },
      children: <>
        <div className="setback-inputs">
          {linesRef.current?.map((line, index) => {
            const start = pointsRef.current[line.start];
            const end = pointsRef.current[line.end];

            if (!start || !end || !canvasRef.current) return null;

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const rect = canvasRef.current.getBoundingClientRect();

            return (
              <div key={index}>
                <div className="edge-index"
                  style={{
                    position: "fixed",
                    left: `${midX + rect.left}px`,
                    top: `${midY + rect.top}px`,
                    width: "75px",
                  }}
                >Edge #{index + 1}</div>
                <label>Edge #{index + 1} </label>
                <input

                  type="number"
                  value={line.setback === 0 ? "" : line.setback}
                  onChange={(e) => {
                    updateSetback(index, e.target.value)


                  }}
                  tabIndex={index + 1}
                  style={{

                    width: "50px",
                  }}
                />
              </div>

            );
          })}
        </div>
      </>,
      disabled: !isPolygonClosedRef.current
    },
    {
      id: 'generate',
      title: '6. Generate Siteplan',
      icon: <Box />,
      description: 'Generate the base for your site plan',
      help: 'Move the parking lot and building around, create building entrances, create sidewalks, and get ready to submit your site plan.',
      onClick: () => { generateSitePlan() },
      disabled: isUploadingImageRef.current
    },

  ];

  // const sitePlanGenerationSteps = [
  //   {
  //     id: 1,
  //     title: "Place Building",
  //     description: "Place a building on the canvas.",
  //     icon: <BuildingIcon />,
  //     children: null,
  //     disabled: false,
  //     onClick: ()=>{},
  //     subSteps: [
  //       { text: "Select a point on the canvas to place a building", completed: false },
  //       { text: "Click on the edge or corner to change the building size", completed: false },
  //       { text: "Rotate the building by clicking and holding on the rotation handle", completed: false },
  //       { text: "Add an entrance by clicking on the edge of the building", completed: false },
  //     ],
  //     // toggleSubStep: (subIndex:number) => {
  //       // setSitePlanGenerationSteps((prevSteps) =>
  //       //   prevSteps.map((step) =>
  //       //     step.id === 1
  //       //       ? {
  //       //           ...step,
  //       //           subSteps: step.subSteps.map((subStep, i) =>
  //       //             i === subIndex ? { ...subStep, completed: !subStep.completed } : subStep
  //       //           ),
  //       //         }
  //       //       : step
  //       //   )
  //       // );
  //     // },
  //   }
  // ];

  return (


    <div className="site-plan-generator">
      <AlphaBanner/>
      <div className="site-plan-generator__container">
        {/* Left Column - Controls */}
        <div className="site-plan-generator__controls">
          <Card>
            {/* {isGeneratingSitePlan ? */}

              <div className="sidebar">
              <CollapsibleSection title="Site Plan Boundaries" isDefaultOpen={!isGeneratingSitePlanRef.current}>
                <div className="site-plan-generator__sidebar">
                  {/* <div className="site-plan-generator__sidebar-header">
                    <h2>Site Plan Generator</h2>
                    <button
                      className="button"
                      onClick={() => setIsHelpVisible(!isHelpVisible)}
                    >
                      <Info />
                    </button>
                  </div> */}
                  <div className="site-plan-generator__sidebar-content">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`site-plan-generator__step 
                        ${index === currentStep ? 'site-plan-generator__step--active' : ''} 
                        ${index < currentStep ? 'site-plan-generator__step--completed' : ''}
                        ${step?.disabled ? 'disabled' : ''}

                          `}
                        onClick={() => {
                          if (step?.disabled) return;
                          setCurrentStep(index);
                          step.onClick()
                        }}
                      >
                        <div className="site-plan-generator__step-content">
                          <div className={`site-plan-generator__step-icon ${index === currentStep ? 'site-plan-generator__step-icon--active' : ''
                            }`}>
                            {step.icon}
                          </div>
                          <div className="site-plan-generator__step-info">
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                          </div>
                        </div>

                        {index === currentStep ? step.children : <></>}
                      </div>
                    ))}


                    <div
                      className={`site-plan-generator__step`}
                      onClick={() => { setCurrentStep(0); clearCanvas(); }}
                    >
                      <div className="site-plan-generator__step-content">
                        <div className={`site-plan-generator__step-icon`}>
                          <Delete />,
                        </div>
                        <div className="site-plan-generator__step-info">


                          <h3>Clear</h3>
                          <p>Click to delete the existing siteplan and start over</p>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
          

                </CollapsibleSection>



                {/* Input Parameters Section */}
                <CollapsibleSection title="Site Plan Inputs">
                  <div className="site-plan-generator__input-group">
                    <label htmlFor="parkingStalls">Parking Stalls</label>
                    <Input
                      id="parkingStalls"
                      type="number"
                      min={0}
                      value={formData.parkingStalls || ""}
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
                    <label htmlFor="buildingArea">Max Building Area (sq ft)</label>
                    <Input
                      id="buildingArea"
                      type="number"
                      min={0}
                      value={formData.buildingArea || ""}
                      onChange={(e) => handleNumberInput(e, 'buildingArea')}
                    />
                  </div>


                  <div className="site-plan-generator__input-group">
                    <label htmlFor="halfStreetDriveway">Half Street Driveway</label>
                    <Checkbox
                      id="halfStreetDriveway"
                      checked={formData.halfStreetDriveway}
                      onChange={(e) => handleBooleanInput(e, 'halfStreetDriveway')}
                    />
                  </div>
                  {/* ADD THESE TO A DROPDOWN THAT SHOWS WHEN THIS IS ENABLED */}

                  {formData.halfStreetDriveway ?

                    <div className="site-plan-generator__input-group subgroup-1">
                      <label>Parking Side</label>
                      <div className="radio-group">
                        <label>
                          <input
                            type="radio"
                            name="parkingSide"
                            value="right"
                            checked={formData.parkingSide === 'right'}
                            onChange={(e) => handleRadioChange(e, 'parkingSide')}
                          />
                          Right Parking
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="parkingSide"
                            value="left"
                            checked={formData.parkingSide === 'left'}
                            onChange={(e) => handleRadioChange(e, 'parkingSide')}
                          />
                          Left Parking
                        </label>
                      </div>
                    </div> : <></>}

                  <div className="site-plan-generator__checkbox disabled">
                    <label htmlFor="taperedDriveway">Tapered Driveway</label>

                    <Checkbox
                      id="taperedDriveway"
                      checked={formData.taperedDriveway}
                      onChange={(e) => handleBooleanInput(e, 'taperedDriveway')}
                    />
                  </div>


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
                </CollapsibleSection>

                {/* Site Metrics Section */}
                <CollapsibleSection title="Site Plan Metrics">
                  <div className="site-plan-generator__metrics-container">
                    {(Object.entries(metrics) as [keyof SiteMetrics, number][]).map(([key, value]) => (
                      <div key={key} className="site-plan-generator__metrics-item">
                        <span className="label">{formatMetricLabel(key)}</span>
                        <span className="value">{formatMetricValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>





                {/* Site Metrics Section */}
                {/* <CollapsibleSection title="Siteplan Creation Steps">
                  <div className="site-plan-generator__sidebar">
                    <div className="site-plan-generator__sidebar-header">
                      <h2>Site Plan Generator</h2>

                    </div>
                    <div className="site-plan-generator__sidebar-content">
                      {sitePlanGenerationSteps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`site-plan-generator__step
                            ${index === currentStep ? 'site-plan-generator__step--active' : ''} 
                            ${index < currentStep ? 'site-plan-generator__step--completed' : ''}
                            ${step?.disabled ? 'disabled' : ''}`}
                          onClick={() => {
                            if (step?.disabled) return;
                            setCurrentStep(index);
                            step.onClick();
                          }}
                        >
                          <div className="site-plan-generator__step-content">
                            <div className={`site-plan-generator__step-icon ${index === currentStep ? 'step-icon-active' : ''}`}>
                              {step.icon}
                            </div>
                            <div className="site-plan-generator__step-info">
                              <h3>{step.title}</h3>
                              <p>{step.description}</p>
                            </div>
                          </div>

                          {index === currentStep && (
                            <div className="sub-steps">
                              {step.subSteps && step.subSteps.length > 0 ? (
                                <ul>
                                  {step.subSteps.map((subStep, subIndex) => (
                                    <li key={subIndex} className="sub-step-item">
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={subStep.completed}
                                          onChange={() => step.toggleSubStep(subIndex)}
                                        />
                                        {subStep.text}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                step.children
                              )}
                            </div>
                          )}
                        </div>
                      ))}


                      <div
                        className={`site-plan-generator__step`}
                        onClick={() => { setCurrentStep(0); clearCanvas(); }}
                      >
                        <div className="site-plan-generator__step-content">
                          <div className={`site-plan-generator__step-icon`}>
                            <Delete />,
                          </div>
                          <div className="site-plan-generator__step-info">


                            <h3>Clear</h3>
                            <p>Click to delete the existing siteplan and start over</p>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </CollapsibleSection>

                Add more sections here */}
              </div>

            
            {/* } */}
          </Card>
        </div>

        {/* Right Column - Visualization */}
        <div className="site-plan-generator__visualization">
          <Card>

            <CardContent>
              <div className="site-plan-generator__visualization-container" ref={canvasContainerRef}>
                {mode === "upload" && !isGeneratingSitePlanRef.current && !imageURL ?
                  <ImageUploader onFileUpload={setImageURL} /> : <></>}


                <div ref={canvasRef} style={{ display: mode === "upload" ? "none" : "block" }} />

              </div>
            </CardContent>
          </Card>

          {/* Help Panel */}
          {/* {isHelpVisible && (
            <div className="site-plan-generator__help">
              <p>{steps[currentStep].help}</p>
            </div>
          )} */}
        </div>
      </div>
    </div>


  );
};

export default SitePlanGenerator;






function calculatecornerOffsetsFromSetbacks(lines: Line[], points: IPoint[]) {
  const cornerOffsetsFromSetbacks: p5.Vector[] = [];
  const cornerOffsetsPoints: p5.Vector[][] = [];


  for (let i = 0; i < lines.length; i++) {
    const currentEdge = lines[i];
    cornerOffsetsPoints.push(createParallelEdge(currentEdge, points));
  }

  for (let i = 0; i < lines.length; i++) {
    const currentEdge = lines[i];
    const nextEdge = i === lines.length - 1 ? lines[0] : lines[i + 1];
    // Calculate the intersection point of the offset edges
    const intersection = getIntersection(currentEdge, nextEdge, cornerOffsetsPoints);

    if (intersection) {
      cornerOffsetsFromSetbacks.push(intersection);
    }
  }

  return cornerOffsetsFromSetbacks;
}

function createParallelEdge(line: Line, points: IPoint[]) {
  // Calculate the normalized perpendicular vector
  const startPoint = p5.prototype.createVector(points[line.start].x, points[line.start].y)
  const endPoint = p5.prototype.createVector(points[line.end].x, points[line.end].y)

  const direction = p5.Vector.sub(startPoint, endPoint).normalize();
  const perpendicular = p5.prototype.createVector(-direction.y, direction.x);

  // Scale the perpendicular vector by the setback

  // p5.Vector.prototype.mult: x, y, or z arguments are either undefined or not a finite number

  const offset = perpendicular.mult(line.setback || 0);

  // Calculate the offset points for the new parallel edge
  const point1Offset = p5.Vector.add(startPoint, offset).add(direction.copy().mult(-100)); // Extend 100px backward
  const point2Offset = p5.Vector.add(endPoint, offset).add(direction.copy().mult(100)); // Extend 100px forward


  return [point1Offset, point2Offset]
}


function getIntersection(edge1: Line, edge2: Line, cornerOffsetsPoints: p5.Vector[][]): p5.Vector | null {


  const x1 = cornerOffsetsPoints[edge1.index][0].x
  const y1 = cornerOffsetsPoints[edge1.index][0].y
  const x2 = cornerOffsetsPoints[edge1.index][1].x
  const y2 = cornerOffsetsPoints[edge1.index][1].y

  const x3 = cornerOffsetsPoints[edge2.index][0].x
  const y3 = cornerOffsetsPoints[edge2.index][0].y
  const x4 = cornerOffsetsPoints[edge2.index][1].x
  const y4 = cornerOffsetsPoints[edge2.index][1].y


  // Calculate the denominator for the line intersection formula
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  // If denom is 0, the lines are parallel or coincident
  if (Math.abs(denom) < 1e-6) {
    console.warn("Lines are parallel or coincident:", { edge1, edge2 });
    return null;
  }

  // Calculate the intersection point
  const intersectX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const intersectY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  const intersection = p5.prototype.createVector(intersectX, intersectY);

  // Debugging: Log the calculated intersection point

  // Check if the intersection lies on both line segments
  const tolerance = 1e-6; // Increase tolerance to handle floating-point precision
  const isOnEdge1 =
    Math.min(x1, x2) - tolerance <= intersectX &&
    intersectX <= Math.max(x1, x2) + tolerance &&
    Math.min(y1, y2) - tolerance <= intersectY &&
    intersectY <= Math.max(y1, y2) + tolerance;

  const isOnEdge2 =
    Math.min(x3, x4) - tolerance <= intersectX &&
    intersectX <= Math.max(x3, x4) + tolerance &&
    Math.min(y3, y4) - tolerance <= intersectY &&
    intersectY <= Math.max(y3, y4) + tolerance;

  if (isOnEdge1 && isOnEdge2) {
    return intersection;
  }


  return null; // Intersection is out of bounds
}