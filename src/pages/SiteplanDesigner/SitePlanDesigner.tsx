

export interface SiteMetrics {
  zoning: string;
  // setbacks: {
  //   front: number;
  //   side: number;
  //   rear: number;
  // };
  // maximumHeight: {
  //   proposed: number;
  //   allowed: number;
  // };
  maximumHeight: number;
  buildingCoveragePercentage: number;
  buildingCoveragePercentageAllowed: number;
  imperviousSurfaceArea: number;
  imperviousSurfaceAllowed: number;
  landscapeRequiredPercent: number;
  landscape: number;
  offStreetParkingRequired: number;
  parkingPer1000Min: number;
  parkingPer1000Max: number;

  actualBuildingArea: number;
  approachArea: number;
  bikeParkingArea: number;
  drivewayArea: number;
  garbageArea: number;
  handicappedStallsCount: number;

  parkingArea: number;
  parkingStallsArea: number;
  propertyArea: number;
  sidewalkArea: number;
  totalParkingStalls: number;

  totalAreaDedicatedToSetbacks: number
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
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

import { Map, ArrowRight, Ruler, FileImage, Delete, Car, Footprints, BuildingIcon, DoorOpen } from 'lucide-react'; //Box, Bike

import { Button, Card, CardContent, Checkbox, Input } from '../../components/ui';

import sketchForSiteplan from './sketchForSiteplan';
import ImageUploader from './ImageUploader';

import './SitePlanDesigner.scss';
import CollapsibleSection from './CollapsibleSection';
import AlphaBanner from './AlphaBanner';
import { FormDataInputs, initialFormData } from '../../utils/SiteplanGeneratorUtils';
import { Property } from './SitePlanClasses/Property';
import { Approach } from './SitePlanClasses/Approach';
import { Garbage } from './SitePlanClasses/Garbage';
// import { Building } from './SitePlanClasses/Building';
import { Parking } from './SitePlanClasses/Parking';
import Slider from '../../components/Slider';
import { BikeParking } from './SitePlanClasses/BikeParking';
import { VisibilityGraph } from '../VisibilityGraph';
import { BuildingsGroup } from './SitePlanClasses/BuildingsGroup';
import ConfirmationModal from '../../components/ConfirmationModal';

const initialMetrics: SiteMetrics = {
  zoning: "C-M Commercial Manufacturing",
  // setbacks: { front: 10, side: 10, rear: 10 },
  // maximumHeight: { proposed: 28.0, allowed: 45.0 },
  maximumHeight: 35,

  buildingCoveragePercentage: 69,
  buildingCoveragePercentageAllowed: 70,
  imperviousSurfaceArea: 12192,
  imperviousSurfaceAllowed: 12192,
  landscapeRequiredPercent: 15,
  landscape: 27.2,
  offStreetParkingRequired: 10,

  parkingPer1000Min: 1.5,
  parkingPer1000Max: 2.4,


  actualBuildingArea: 1500,
  propertyArea: 12192,

  drivewayArea: 521,
  parkingArea: 936,
  parkingStallsArea: 1156,
  handicappedStallsCount: 0,
  totalParkingStalls: 8,
  sidewalkArea: 0,
  garbageArea: 2808,

  approachArea: 62,
  bikeParkingArea: 0,
  totalAreaDedicatedToSetbacks: 1000,




};


const SitePlanGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormDataInputs>(initialFormData);
  const [metrics, setMetrics] = useState<SiteMetrics>(initialMetrics);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [mode, setMode] = useState<'adjust' | 'approach' | 'setback' | 'scale' | 'generate' | 'upload' | 'parking' | 'building' | 'bike' | 'entrances' | 'moving'>('upload'); // Interaction mode
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_isPolygonClosedState, setIsPolygonClosedState] = useState(false)

  const [_offsetPoints, setOffsetPoints] = useState<p5.Vector[]>([])
  const [_inputValueForScale, setInputValueForScale] = useState<number | "">("");


  const [currentStep, setCurrentStep] = useState(0);

  // const [outboundMetrics, setOutboundMetrics] = useState<SiteMetrics>(initialMetrics);

  // const [isHelpVisible, setIsHelpVisible] = useState(true);

  // Property Outputs
  // const [globalAngle, _setGlobalAngle] = useState<number>(0);
  const clearEverythingRef = useRef<boolean>(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const setbacksRef = useRef<number[]>([]);
  const pointsRef = useRef<IPoint[]>([]);
  const linesRef = useRef<Line[]>([]);
  const imageOpacityRef = useRef<number>(50);



  const isUploadingImageRef = useRef<boolean>(true);
  const isUpdatingBoundaryPointsRef = useRef<boolean>(false);
  const isSelectingApproachRef = useRef<boolean>(false);
  const isDefiningScaleRef = useRef<boolean>(false);
  const isSelectingSetbackRef = useRef<boolean>(false);
  const isSettingParkingLotRef = useRef<boolean>(false);
  const isPlacingbuildingsRef = useRef<boolean>(false);
  const isPlacingBikeParkingRef = useRef<boolean>(false);
  const isPlacingBuildingEntrancesRef = useRef<boolean>(false);
  const isGeneratingSidewalksRef = useRef<boolean>(false);
  const isMovingElementsRef = useRef<boolean>(false);

  const isCreateEverythingRef = useRef<boolean>(false);


  const stepSelectorRefs = {
    upload: isUploadingImageRef,
    points: isUpdatingBoundaryPointsRef,
    approach: isSelectingApproachRef,
    scale: isDefiningScaleRef,
    setback: isSelectingSetbackRef,
    parking: isSettingParkingLotRef,
    building: isPlacingbuildingsRef,
    bikeParking: isPlacingBikeParkingRef,
    entrances: isPlacingBuildingEntrancesRef,
    sidewalks: isGeneratingSidewalksRef,
    moving: isMovingElementsRef,
    everything: isCreateEverythingRef,
  }

  const isPolygonClosedRef = useRef<boolean>(false);
  const inputScaleRef = useRef<number | null>(null);
  const scaleRef = useRef<number | null>(null);
  const draggingPointIndexRef = useRef<number | null>(null);
  const selectedLineIndexRef = useRef<number | null>(null);


  const propertyRef = useRef<Property | null>(null);
  const approachRef = useRef<Approach | null>(null);
  const parkingRef = useRef<Parking | null>(null);
  // const buildingsGroupRef = useRef<Building | null>(null);
  const buildingsGroupRef = useRef<(BuildingsGroup | null)>(null);

  const garbageRef = useRef<Garbage | null>(null);
  const bikeParkingRef = useRef<BikeParking | null>(null);

  let visibilityGraphSolverRef = useRef<VisibilityGraph | null>(null)

  useEffect(() => {
    const updateVariables = () => {
      const property = propertyRef.current;
      const approach = approachRef.current;
      const parking = parkingRef.current;
      // const buildingsGroup = buildingsGroupRef.current;
      const garbage = garbageRef.current;
      const bikeParking = bikeParkingRef.current;

      console.log("There be danger here")


      const _metrics: SiteMetrics = {
        ...metrics
      }



      // _metrics.actualBuildingArea = building?.buildingAreaActual || initialMetrics.actualBuildingArea;
      _metrics.approachArea = approach?.area || initialMetrics.approachArea;
      _metrics.bikeParkingArea = bikeParking?.area || initialMetrics.bikeParkingArea;
      _metrics.buildingCoveragePercentage = property?.buildingCoveragePercentage || initialMetrics.buildingCoveragePercentage
      _metrics.buildingCoveragePercentageAllowed = property?.buildingCoveragePercentageAllowed || initialMetrics.buildingCoveragePercentageAllowed
      _metrics.drivewayArea = property?.drivewayArea || initialMetrics.drivewayArea;
      _metrics.garbageArea = garbage?.area || initialMetrics.garbageArea;
      _metrics.handicappedStallsCount = parking?.handicappedParkingNumTarget || initialMetrics.handicappedStallsCount;
      _metrics.imperviousSurfaceAllowed = property?.imperviousSurfaceAllowed || initialMetrics.imperviousSurfaceAllowed;
      _metrics.imperviousSurfaceArea = property?.imperviousSurfaceArea || initialMetrics.imperviousSurfaceArea;
      _metrics.landscape = property?.landscapeArea || initialMetrics.landscape;
      _metrics.landscapeRequiredPercent = property?.landscapeRequiredPercent || initialMetrics.landscapeRequiredPercent;
      // _metrics.maximumHeight = building?.maximumHeight || initialMetrics.maximumHeight;
      _metrics.offStreetParkingRequired = parking?.offStreetParkingRequired || initialMetrics.offStreetParkingRequired;
      _metrics.parkingArea = parking?.parkingArea || initialMetrics.parkingArea;
      _metrics.parkingPer1000Max = parking?.parkingPer1000Max || initialMetrics.parkingPer1000Max;
      _metrics.parkingPer1000Min = parking?.parkingPer1000Min || initialMetrics.parkingPer1000Min;
      _metrics.parkingStallsArea = parking?.parkingStallsArea || initialMetrics.parkingStallsArea;
      _metrics.propertyArea = property?.areaOfProperty || initialMetrics.propertyArea;
      _metrics.totalAreaDedicatedToSetbacks = property?.totalAreaDedicatedToSetbacks || initialMetrics.totalAreaDedicatedToSetbacks;
      _metrics.totalParkingStalls = parking?.parkingStallsNumber || initialMetrics.totalParkingStalls;
      _metrics.zoning = property?.zoning || initialMetrics.zoning;



      // _metrics.setbacks =  || initialMetrics.;
      // _metrics.sidewalkArea =  || initialMetrics.;


      setMetrics(_metrics)
    };



    // if (visualizer.current) {
    const interval = setInterval(updateVariables, 1000); // Check for changes periodically

    return () => clearInterval(interval);


  }, []);

  // const buildingArea = buildingsGroupRef.current?.buildingAreaActual || metrics.actualBuildingArea;


  useEffect(() => {
    if (imageURL) {
      createPoints()
    }
  }, [imageURL])


  const params = {
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
    isCreateEverythingRef,
    formData,

    imageOpacityRef,
    propertyRef,
    approachRef,
    parkingRef,
    buildingsGroupRef,
    garbageRef,
    bikeParkingRef,

    visibilityGraphSolverRef
  };


  const sketch = sketchForSiteplan(params);
  useEffect(() => {
    const p5Instance = new p5(sketch);
    return () => {
      p5Instance.remove();
    };
  }, [imageURL]);

  const handleInputChange = (field: keyof FormDataInputs, value: number | boolean | string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>, field: keyof FormDataInputs): void => {
    const value = e.target.value; // Value is a string ('right' or 'left')
    handleInputChange(field, value); // No error since 'parkingSide' now accepts strings
  };


  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>, field: keyof FormDataInputs): void => {
    const value = e.target.value;
    handleInputChange(field, value); // No error since 'parkingSide' now accepts strings
  };

  const handleBooleanInput = (e: ChangeEvent<HTMLInputElement>, field: keyof FormDataInputs): void => {
    const value = e.target.checked; // `checked` gives the boolean state of the input
    handleInputChange(field, value);
  };

  const handleNumberInput = (e: ChangeEvent<HTMLInputElement>, field: keyof FormDataInputs): void => {
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


  // useEffect(() => {
  //   const updatedGlobals = {
  //     approachWidth: formData.approachWidth,
  //     parkingStallsNum: formData.parkingStalls,
  //     drivewayWidth: formData.drivewayWidth,
  //     buildingAreaTarget: formData.buildingArea,
  //     globalAngle: globalAngle,
  //     taperParking: formData.taperedDriveway
  //   }


  //   setBigBucketOfFormData(updatedGlobals)
  //   setNumberOfParkingStalls(formData.parkingStalls)
  //   inboundMetricsRef.current.parkingStalls = formData.parkingStalls;
  //   visualizer.current?.updateGlobalVariables(updatedGlobals)

  // }, [formData, globalAngle])

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

  const addBuilding = () => {
    // propertyRef?.current?.createNewBuilding(buildingsGroupRef.current)
    if (propertyRef.current === null) return;
    propertyRef.current.isAddingNewBuilding = true;


  }

  // const updateScale = (index: number, value: string) => {

  //   const lines = linesRef.current;
  //   const newLines = [...lines];

  //   // Handle empty string explicitly to allow deleting the value
  //   const parsedValue = value === "" ? undefined : parseFloat(value);

  //   newLines[index].setback = parsedValue || 0; // Fallback to 0 if undefined
  //   linesRef.current = newLines;

  //   const offsets = calculatecornerOffsetsFromSetbacks(linesRef.current, pointsRef.current);
  //   setOffsetPoints(offsets);
  // };

  const falsifyRefs = () => {
    // isUploadingImageRef.current = true; // step 1
    // isUpdatingBoundaryPointsRef.current = false; // step 2
    // isDefiningScaleRef.current = false; // step 3
    // isSelectingSetbackRef.current = false;  // step 4
    // isSelectingApproachRef.current = false; // step 5
    // isSettingParkingLotRef.current = false; // step 6
    // isPlacingbuildingsRef.current = false; // step 7

    Object.keys(stepSelectorRefs).forEach((key) => {
      const refKey = key as keyof typeof stepSelectorRefs; // Cast the key as a valid key of stepSelectorRefs
      stepSelectorRefs[refKey].current = false; // Update the current value of the ref
    });
  }

  const startUploadingImage = () => {
    setMode('upload')
    setImageURL(null);
    falsifyRefs()
    isUploadingImageRef.current = true;

  }
  const createPoints = () => {
    falsifyRefs()
    isUpdatingBoundaryPointsRef.current = true;
    setCurrentStep(1); // should point to the adjust step
    setMode('adjust')
  }

  const createEverything = () => {
    falsifyRefs();
    isCreateEverythingRef.current = true;
    isPolygonClosedRef.current = true;
    setMode('parking');
  }


  const defineScale = () => {
    falsifyRefs()
    isDefiningScaleRef.current = true;
    setMode('scale')
  }

  const selectApproach = () => {
    falsifyRefs();
    isSelectingApproachRef.current = true;
    setMode('approach')
  }

  const createSetbacks = () => {
    falsifyRefs();
    isSelectingSetbackRef.current = true;
    setMode('setback');
  }

  const createParking = () => {
    falsifyRefs();
    isSettingParkingLotRef.current = true;
    setMode('parking');
  }

  const createBuilding = () => {
    falsifyRefs();
    isPlacingbuildingsRef.current = true;
    setMode('building');
  }

  // const createBikeParking = () => {
  //   falsifyRefs();
  //   isPlacingBikeParkingRef.current = true;
  //   setMode('bike');
  // }

  const moveElements = () => {
    falsifyRefs();
    isMovingElementsRef.current = true;
    setMode('moving');
  }

  const createBuildingEntrances = () => {
    falsifyRefs();
    isPlacingBuildingEntrancesRef.current = true;
    setMode('entrances');
  }

  const generateSideWalks = () => {
    falsifyRefs();
    isGeneratingSidewalksRef.current = true;
    setMode('entrances');
  }

  const clearCanvas = () => {

    setIsModalOpen(false)
    setCurrentStep(0);
    setImageURL(null);
    clearEverythingRef.current = true;
    pointsRef.current = [];
    linesRef.current = [];
    setIsPolygonClosedState(false);

    // The steps on the sidebar
    falsifyRefs();

    isPolygonClosedRef.current = false;
    draggingPointIndexRef.current = null;
    selectedLineIndexRef.current = null;
    inputScaleRef.current = null;
    setMode('upload');
  };

  const steps = [
    {
      id: 'upload',
      title: '1. Upload Property Line Image (Optional)',
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
      children: <>
{/* 
        <div className="site-plan-generator__input-group disabled">
          <label>Enter a legal description</label>
          <Input
            id="legalDescription"
            type="text"
            min={0}
            value={""}
            onChange={(e) => (e)}
          />
        </div>

 */}

        {imageURL !== null ?
          <div className="site-plan-generator__slider">
            <Slider
              id="imageOpacity"
              label="Image Opacity"
              min={0}
              max={100}
              value={imageOpacityRef.current}
              onChange={(value) => imageOpacityRef.current = value}
            />

          </div>

          : <></>}



        {propertyRef.current ?
          <div style={{ marginTop: '10px' }}>

            <div className="site-plan-generator__input-group">
              <label>Enable Angles</label>

              <Checkbox
                id="enableAngles"
                checked={formData.enableAngles}
                onChange={(e) => handleBooleanInput(e, 'enableAngles')}
              />
            </div>
            <div className="site-plan-generator__input-group">
              <label>Enable Line Lengths</label>

              <Checkbox
                id="enableAngles"
                checked={formData.enableLineLengths}
                onChange={(e) => handleBooleanInput(e, 'enableLineLengths')}
              />
            </div>

            <div className="site-plan-generator__input-group">
              <label>Max Impervious Percentage (%)</label>
              <Input
                id="imperviousSurfacePercentageAllowed"
                type="number"
                min={0}
                value={formData.imperviousSurfacePercentageAllowed || ""}
                onChange={(e) => handleNumberInput(e, 'imperviousSurfacePercentageAllowed')}
              />
            </div>

            <div className="site-plan-generator__input-group">
              <label>Max Building Coverage (%)</label>
              <Input
                id="buildingCoveragePercentage"
                type="number"
                min={0}
                value={formData.buildingCoveragePercentage || ""}
                onChange={(e) => handleNumberInput(e, 'buildingCoveragePercentage')}
              />
            </div>

            <div className="site-plan-generator__input-group">
              <label>Property Zoning</label>
              <Input
                id="zoning"
                type="text"
                value={formData.zoning || ""}
                onChange={(e) => handleTextChange(e, 'zoning')}


              />
            </div>



          </div> : <>  </>}

      </>,

      onClick: () => { createPoints() },
    },

    window.location.hostname === "localhost" ?
      {
        id: 'imLucky',
        title: `2.5 I'm feeling lucky`,
        icon: <Map />,
        description: "Click to just create all the components so I don't have to keep clicking through all the steps to test something",
        help: 'Click',

        onClick: () => { createEverything() },
      } : undefined,
    {
      id: 'scale',
      title: '3. Set Property Scale',
      icon: <Ruler />,
      description: 'Define the scale by measuring a known distance',
      help: 'Draw a line along a known distance (like property edge) and enter its real-world length to set the scale.',
      onClick: () => { defineScale() },
      children: <div style={{ marginTop: '10px' }}>
        <label>Edge Length (ft): </label>

        <Input
          type="number"
          min={0}
          value={inputScaleRef.current ?? ""}

          onChange={(e) => {
            const newValue = e.target.value === "" ? "" : Number(e.target.value);
            setInputValueForScale(newValue); // Update state for immediate UI response
            inputScaleRef.current = newValue === "" ? null : newValue; // Keep ref updated
          }}

          // onChange={(e) => {
          //   const newValue = e.target.value === "" ? null : Number(e.target.value);
          //   inputScaleRef.current = newValue;
          // }}
          autoFocus
        />
      </div>,
      disabled: !isPolygonClosedRef.current
    },
    {
      id: 'setbacks',
      title: '4. Define Setbacks',
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

                <div className="site-plan-generator__input-group">
                  <label htmlFor={`Edge #${index + 1}`}>Edge #{index + 1}</label>
                  <Input
                    id={`Edge #${index + 1}`}
                    type="number"
                    min={0}
                    value={line.setback === 0 ? "" : line.setback}
                    onChange={(e) => { updateSetback(index, e.target.value) }}
                    tabIndex={index + 1}
                  />
                </div>



              </div>

            );
          })}
        </div>
      </>,
      disabled: !isPolygonClosedRef.current
    },

    {
      id: 'approach',
      title: '5. Mark Property Entrance',
      icon: <ArrowRight />,
      description: 'Click to indicate where the property is accessed from',
      help: 'Mark where vehicles enter the property, typically from the street or main access road.',
      onClick: () => { selectApproach() },
      children:
        <>
          {/* {approachRef.current ? */}
          <div style={{ marginTop: '10px' }}>
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

            {/* <div className="site-plan-generator__input-group disabled">
              <label htmlFor="propertyEntranceCount">Property Entrance Count</label>
              <Input
                id="propertyEntranceCount"
                type="number"
                min={0}
                value={formData.propertyEntranceCount || ""}
                onChange={(e) => handleNumberInput(e, 'propertyEntranceCount')}
              />
            </div> */}
            <div className="site-plan-generator__input-group">
              <label>Enable Dimensions</label>

              <Checkbox
                id="enableApproachDimensions"
                checked={formData.enableApproachDimensions}
                onChange={(e) => handleBooleanInput(e, 'enableApproachDimensions')}
              />
            </div>



            <div className="site-plan-generator__button">
              <label htmlFor="deleteDriveway">Delete Driveway</label>

              <Button
                id="deleteDriveway"

                onClick={() => { approachRef.current = null; }}
              />
            </div>




          </div>
          {/* : <></>
          } */}
        </>,

      disabled: !isPolygonClosedRef.current
    },
    {
      id: 'parking',
      title: '6. Place Parking lot',
      icon: <Car />,
      description: 'Places the parking lot',
      help: 'Click and drag the parking lot to where you want it or to dynamically add or remove parking spots.',
      onClick: () => { createParking() },
      children:
        <div style={{ marginTop: '10px' }}>

          <div className="site-plan-generator__input-group">
            <label htmlFor="parkingStalls">Parking Stalls (#)</label>
            <Input
              id="parkingStalls"
              type="number"
              min={0}
              value={formData.parkingStalls || ""}
              onChange={(e) => handleNumberInput(e, 'parkingStalls')}
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
            <label htmlFor="handicappedParkingStalls">Handicapped Parking Stalls</label>
            <Input
              id="handicappedParkingStalls"
              type="number"
              min={0}
              value={formData.handicappedParkingStalls || ""}
              onChange={(e) => handleNumberInput(e, 'handicappedParkingStalls')}
            />
          </div>

          <div className="site-plan-generator__input-group">
            <label htmlFor="compactParkingStalls">Compact Parking Stalls</label>
            {/* 30 percent of required stalls */}
            <Input
              id="compactParkingStalls"
              type="number"
              min={0}
              value={formData.compactParkingStalls || ""}
              onChange={(e) => handleNumberInput(e, 'compactParkingStalls')}
            />
          </div>

          <div className="site-plan-generator__input-group">
            <label htmlFor="parkingLotShape">Parking Lot Shape</label>
            <Input
              id="parkingLotShape"
              type="text"
              value={formData.parkingLotShape || ""}
              onChange={(e) => handleTextChange(e, 'parkingLotShape')}
            />
          </div>

          <div className="site-plan-generator__checkbox">
            <label htmlFor="taperedDriveway">Tapered Driveway</label>

            <Checkbox
              id="taperedDriveway"
              checked={formData.taperedDriveway}
              onChange={(e) => handleBooleanInput(e, 'taperedDriveway')}
            />
          </div>

          {/* <div className="site-plan-generator__checkbox">
            <label htmlFor="halfStreetDriveway">Half Street Driveway</label>
            <Checkbox
              id="halfStreetDriveway"
              checked={formData.halfStreetDriveway}
              onChange={(e) => handleBooleanInput(e, 'halfStreetDriveway')}
            />
          </div> */}
          {formData.halfStreetDriveway ?
            //  {/* ADD THESE TO A DROPDOWN THAT SHOWS WHEN THIS IS ENABLED
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
            </div> :
            <></>

          }


          <div className="site-plan-generator__input-group">
            <label htmlFor="hasGarbageEnclosure">Has Garbage Enclosure</label>
            <Checkbox
              id="hasGarbageEnclosure"
              checked={formData.hasGarbageEnclosure}
              onChange={(e) => handleBooleanInput(e, 'hasGarbageEnclosure')}
            />
          </div>

          <div className="site-plan-generator__input-group">
            <label htmlFor="showDrivewayControlPoints">Show Driveway Control Points</label>
            <Checkbox
              id="showDrivewayControlPoints"
              checked={formData.showDrivewayControlPoints}
              onChange={(e) => handleBooleanInput(e, 'showDrivewayControlPoints')}
            />
          </div>



          <div className="site-plan-generator__input-group">
            <label htmlFor="landscapeIsland">Stalls per group</label>
            <Input
              id="landscapeIsland"
              type="number"
              min={0}
              value={formData.landscapeIsland || ""}
              onChange={(e) => handleNumberInput(e, 'landscapeIsland')}
            />
          </div>


          {/* disabled"> */}
          <div className="site-plan-generator__input-group">
            <label htmlFor="parkingPer1000Min">Minimum Parking per 1000 SQFT</label>
            <Input
              id="parkingPer1000Min"
              type="number"
              min={0}
              value={formData.parkingPer1000Min || ""}
              onChange={(e) => handleNumberInput(e, 'parkingPer1000Min')}
            />
          </div>

          <div className="site-plan-generator__input-group">
            <label htmlFor="parkingPer1000Max">Maximum Parking per 1000 SQFT</label>
            <Input
              id="parkingPer1000Max"
              type="number"
              min={0}
              value={formData.parkingPer1000Max || ""}
              onChange={(e) => handleNumberInput(e, 'parkingPer1000Max')}
            />
          </div>

          <div className="site-plan-generator__input-group">
            <label htmlFor="parkingPerUnit">Parking per Unit</label>
            <Input
              id="parkingPerUnit"
              type="number"
              min={0}
              value={formData.parkingPerUnit || ""}
              onChange={(e) => handleNumberInput(e, 'parkingPerUnit')}
            />
          </div>

        </div>,
      disabled: !isPolygonClosedRef.current// !approachRef.current?.isInitialized
    },

    {
      id: 'building',
      title: '7. Place Building',
      icon: <BuildingIcon />,
      description: 'Places the Building',
      help: 'Click and drag the parking lot to where you want it or to dynamically add or remove parking spots.',
      onClick: () => { createBuilding() },
      children: <div style={{ marginTop: '10px' }}>



        <div className="site-plan-generator__button">
          <label htmlFor="addBuilding">Add Building</label>

          <Button
            id="addBuilding"

            onClick={() => addBuilding}
          />
        </div>

        <div className="site-plan-generator__input-group">
          <label>Enable Dimensions</label>
          <Checkbox
            id="enableBuildingDimensions"
            checked={formData.enableBuildingDimensions}
            onChange={(e) => handleBooleanInput(e, 'enableBuildingDimensions')}
          />
        </div>


        {formData.enableBuildingDimensions ?
          <div className="site-plan-generator__input-group">
            <label>Dimensions Displayed on the inside</label>

            <Checkbox
              id="buildingDimensionsDisplayedOnTheInside"
              checked={formData.buildingDimensionsDisplayedOnTheInside}
              onChange={(e) => handleBooleanInput(e, 'buildingDimensionsDisplayedOnTheInside')}
            />
          </div> : <></>}

        <div className="site-plan-generator__input-group">
          <label htmlFor="buildingAreaTarget">Max Building Area (sq ft)</label>
          <Input
            id="buildingAreaTarget"
            type="number"
            min={0}
            value={formData.buildingAreaTarget || ""}
            onChange={(e) => handleNumberInput(e, 'buildingAreaTarget')}
          />
        </div>

        <div className="site-plan-generator__input-group">
          <label htmlFor="showbuildingArea">Show Building Area</label>
          <Checkbox
            id="showbuildingArea"
            checked={formData.showbuildingArea}
            onChange={(e) => handleBooleanInput(e, 'showbuildingArea')}
          />
        </div>


        <div className="site-plan-generator__input-group">
          <label htmlFor="buildingCount">Number of Buildings</label>
          <Input
            id="buildingCount"
            type="number"
            min={0}
            value={formData.buildingCount || ""}
            onChange={(e) => handleNumberInput(e, 'buildingCount')}
          />
        </div>


      </div>,
      disabled: !isPolygonClosedRef.current//!parkingRef.current
    },
    // {
    //   id: 'bike',
    //   title: '8. Bike Parking',
    //   icon: <Bike/>,
    //   description: 'Places the Bike Parking',
    //   help: 'Place the bike parking near the building for most ',
    //   onClick: () => { createBikeParking() },
    //   children: <div style={{ marginTop: '10px' }}>

    //     <div className="site-plan-generator__input-group">
    //       <label>Enable Bike Parking</label>
    //       <Checkbox
    //         id="enableBuildingDimensions"
    //         checked={formData.enableBikeParking}
    //         onChange={(e) => handleBooleanInput(e, 'enableBikeParking')}
    //       />
    //     </div>

    //     <div className="site-plan-generator__input-group">
    //       <label htmlFor="buildingCount">Number of Bike Spots</label>
    //       <Input
    //         id="bikeCount"
    //         type="number"
    //         min={0}
    //         value={formData.bikeCount || ""}
    //         onChange={(e) => handleNumberInput(e, 'bikeCount')}
    //       />
    //     </div>


    //   </div>,
    //   disabled: !isPolygonClosedRef.current//!parkingRef.current
    // },
    {
      id: 'moveComponents',
      title: '8. Move Elements',
      icon: <DoorOpen />,
      description: 'Click and move all the parts of the site plan',
      help: 'Click and drag any of your placed elements',
      onClick: () => { moveElements() },
      disabled: !isPolygonClosedRef.current// !buildingsGroupRef.current
    },

    {
      id: 'buildingEntrance',
      title: '9. Place Building Entrances',
      icon: <DoorOpen />,
      description: 'Places the building entrances',
      help: 'Click and drag the parking lot to where you want it or to dynamically add or remove parking spots.',
      onClick: () => { createBuildingEntrances() },
      disabled: !isPolygonClosedRef.current// !buildingsGroupRef.current
    },

    {
      id: 'sidewalks',
      title: '10. Generate Sidewalks',
      icon: <Footprints />,
      description: 'Automatically generates the sidewalks for the site plan',
      help: 'Automatically generates the sidewalks based on the building entrances, parking, and approach.',
      onClick: () => { generateSideWalks() },
      disabled: !isPolygonClosedRef.current// !buildingsGroupRef.current
    },


    // {
    //   id: 'generate',
    //   title: '6. Generate Siteplan',
    //   icon: <Box />,
    //   description: 'Generate the base for your site plan',
    //   help: 'Move the parking lot and building around, create building entrances, create sidewalks, and get ready to submit your site plan.',
    //   onClick: () => { generateSitePlan() },
    //   disabled: isUploadingImageRef.current
    // },

  ];
  return (
    <div className="site-plan-generator">
      <AlphaBanner />
      <div className="site-plan-generator__container">
        {/* Left Column - Controls */}
        <div className="site-plan-generator__controls">
          <Card>
            {/* {isGeneratingSitePlan ? */}

            <div className="sidebar">
              <CollapsibleSection title="Site Plan Steps"
                isDefaultOpen={true}>
                <div className="site-plan-generator__sidebar">

                  <div className="site-plan-generator__sidebar-content">
                    {steps.map((step, index) => {
                      if (!step) return <></>

                      return (



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
                      )
                    }
                    )}



                    <div
                      className={`site-plan-generator__step`}
                      onClick={() => { setIsModalOpen(true) }}
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

            </div>


            {/* } */}
          </Card>
        </div>

        {/* Right Column - Visualization */}
        <div className="site-plan-generator__visualization">
          <Card>

            <CardContent>
              <div className="site-plan-generator__visualization-container" ref={canvasContainerRef}>
                {mode === "upload" && !imageURL ?
                  <ImageUploader onFileUpload={setImageURL} /> : <></>}


                <div ref={canvasRef} style={{ display: mode === "upload" ? "none" : "block" }} />

              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Use the Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={clearCanvas}
        message="Are you sure you want to clear the site plan? This action cannot be undone."
      />
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