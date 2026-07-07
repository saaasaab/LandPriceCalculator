import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlphaBanner from '../SiteplanDesigner/AlphaBanner';
import TopoMapWorkspace from '../../components/topo/TopoMapWorkspace';
import TopoSaveActions from '../../components/topo/TopoSaveActions';
import TopoScalePanel from '../../components/topo/TopoScalePanel';
import TopoStepNav from '../../components/topo/TopoStepNav';
import TopoUploadPanel from '../../components/topo/TopoUploadPanel';
import SubdivisionMapCanvas from './SubdivisionMapCanvas';
import { useTopoDigitization } from '../../hooks/useTopoDigitization';
import { calculateBoundaryAreaSqFt } from '../../utils/siteMapCalculations';
import { EPageNames } from '../../utils/types';
import { canProceedToScale, type TopoDigitizationSnapshot, type TopoWorkflowStepConfig } from '../../utils/topoWorkflow';
import {
  commitDrawingSegment,
  emptyRoadNetwork,
  getNodeRoles,
  networkStats,
  normalizeRoadNetwork,
  undoRoadEdit,
  type RoadDrawingState,
  type RoadNetwork,
} from '../../utils/roadNetwork';
import { DEFAULT_TARGET_LOT_SIZE_SQFT } from '../../utils/subdivisionLotLayout';
import { buildRoadPolygonRings, DEFAULT_ROAD_WIDTH_FT } from '../../utils/subdivisionRoadPolygon';
import {
  clearSubdivisionProject,
  loadSubdivisionProject,
  saveSubdivisionProject,
  type SubdivisionWorkflowStep,
} from '../../utils/subdivisionStorage';
import '../../components/topo/TopoWorkflow.scss';
import './SubdivisionGenerator.scss';

const STEPS: TopoWorkflowStepConfig<SubdivisionWorkflowStep>[] = [
  {
    id: 'upload',
    label: '1. Upload (optional)',
    description: 'Optionally upload a survey, plat, or aerial image. You can trace the boundary on a blank map instead.',
  },
  {
    id: 'boundary',
    label: '2. Boundary',
    description: 'Trace the property outline on the map. Click the first point to close the shape.',
  },
  {
    id: 'scale',
    label: '3. Scale',
    description: 'Select a boundary edge and enter its real-world length in feet. Edge 1 is selected by default.',
  },
  {
    id: 'place-road',
    label: '4. Place road points',
    description:
      'Place road centerline points. Click an existing road line to add a point. Boundary points connect to existing roads; branch from nodes or close loops by snapping to a node.',
  },
  {
    id: 'reposition-road',
    label: '5. Reposition & lots',
    description:
      'Drag road nodes to adjust the layout. The road pavement and Voronoi lots update live as you move points.',
  },
];

const SubdivisionGenerator = () => {
  const [roadNetwork, setRoadNetwork] = useState<RoadNetwork>(emptyRoadNetwork());
  const [roadDrawing, setRoadDrawing] = useState<RoadDrawingState | null>(null);
  const [roadWidthFt, setRoadWidthFt] = useState(DEFAULT_ROAD_WIDTH_FT);
  const [targetLotSizeSqFt, setTargetLotSizeSqFt] = useState(DEFAULT_TARGET_LOT_SIZE_SQFT);
  const [lotPairCountOverride, setLotPairCountOverride] = useState<number | null>(null);

  const roadPersistRef = useRef({
    roadNetwork,
    roadDrawing,
    roadWidthFt,
    targetLotSizeSqFt,
    lotPairCountOverride,
  });
  roadPersistRef.current = {
    roadNetwork,
    roadDrawing,
    roadWidthFt,
    targetLotSizeSqFt,
    lotPairCountOverride,
  };

  const loadSnapshot = useCallback(() => {
    const saved = loadSubdivisionProject();
    if (!saved) return null;
    const step =
      saved.step === 'road-polygon' || saved.step === 'lot-layout'
        ? 'reposition-road'
        : saved.step;
    return {
      step,
      boundary: saved.boundary,
      boundaryClosed: saved.boundaryClosed,
      ftPerPixel: saved.ftPerPixel,
    };
  }, []);

  const saveSnapshot = useCallback((snap: TopoDigitizationSnapshot<SubdivisionWorkflowStep>) => {
    saveSubdivisionProject({
      ...snap,
      roadNetwork: roadPersistRef.current.roadNetwork,
      roadDrawing: roadPersistRef.current.roadDrawing,
      roadComplete: true,
      roadWidthFt: roadPersistRef.current.roadWidthFt,
      targetLotSizeSqFt: roadPersistRef.current.targetLotSizeSqFt,
      lotPairCountOverride: roadPersistRef.current.lotPairCountOverride,
      growthProgress: 1,
    });
  }, []);

  const topo = useTopoDigitization<SubdivisionWorkflowStep>({
    initialStep: 'boundary',
    loadSnapshot,
    saveSnapshot,
  });

  useEffect(() => {
    const saved = loadSubdivisionProject();
    if (!saved) return;
    setRoadNetwork(normalizeRoadNetwork(saved.roadNetwork, saved.ftPerPixel));
    setRoadDrawing(saved.roadDrawing);
    setRoadWidthFt(saved.roadWidthFt);
    setTargetLotSizeSqFt(saved.targetLotSizeSqFt);
    setLotPairCountOverride(saved.lotPairCountOverride);
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.id === topo.step);
  const currentStep = STEPS[stepIndex];
  const isMapStep = topo.step === 'place-road' || topo.step === 'reposition-road';
  const mapMode = topo.step === 'place-road' ? 'place' : 'reposition';

  const canReachStep = useCallback(
    (target: SubdivisionWorkflowStep) => {
      if (target === 'upload') return true;
      if (target === 'boundary') return true;
      if (target === 'scale') {
        return canProceedToScale(topo.boundary, topo.boundaryClosed);
      }
      if (target === 'place-road') return topo.boundaryReady;
      if (target === 'reposition-road') {
        return topo.boundaryReady && roadNetwork.segments.length > 0;
      }
      if (target === 'road-polygon' || target === 'lot-layout') {
        return topo.boundaryReady && roadNetwork.segments.length > 0;
      }
      return false;
    },
    [topo.boundary, topo.boundaryClosed, topo.boundaryReady, roadNetwork.segments.length],
  );

  const goToStep = useCallback(
    (target: SubdivisionWorkflowStep) => {
      const resolved =
        target === 'road-polygon' || target === 'lot-layout' ? 'reposition-road' : target;
      if (canReachStep(target)) topo.setStep(resolved);
    },
    [canReachStep, topo],
  );

  useEffect(() => {
    if (
      topo.step === 'scale' &&
      topo.scaleMode &&
      topo.scaleEdgeIndex === null &&
      topo.boundary.length >= 2
    ) {
      topo.setScaleEdgeIndex(0);
    }
  }, [topo.step, topo.scaleMode, topo.scaleEdgeIndex, topo.boundary.length, topo.setScaleEdgeIndex]);

  const areaSqFt = useMemo(() => {
    if (!topo.ftPerPixel || topo.boundary.length < 3) return 0;
    return calculateBoundaryAreaSqFt(topo.boundary, topo.ftPerPixel);
  }, [topo.boundary, topo.ftPerPixel]);

  const roadStats = useMemo(
    () => networkStats(roadNetwork, topo.ftPerPixel),
    [roadNetwork, topo.ftPerPixel],
  );

  const nodeRoles = useMemo(
    () => getNodeRoles(roadNetwork, topo.boundary, topo.ftPerPixel),
    [roadNetwork, topo.boundary, topo.ftPerPixel],
  );


  const roadPolygonRings = useMemo(() => {
    if (!isMapStep || !topo.ftPerPixel || roadNetwork.segments.length === 0) {
      return { outers: [], holes: [], pieces: [] };
    }
    try {
      return buildRoadPolygonRings(
        roadNetwork,
        roadWidthFt,
        topo.ftPerPixel,
        topo.boundary,
        nodeRoles,
      );
    } catch {
      return { outers: [], holes: [], pieces: [] };
    }
  }, [isMapStep, roadNetwork, roadWidthFt, topo.ftPerPixel, topo.boundary, nodeRoles]);

  const entranceCount = useMemo(() => {
    let count = 0;
    for (const role of nodeRoles.values()) {
      if (role === 'entrance') count += 1;
    }
    return count;
  }, [nodeRoles]);

  const deadEndCount = useMemo(() => {
    let count = 0;
    for (const role of nodeRoles.values()) {
      if (role === 'dead-end') count += 1;
    }
    return count;
  }, [nodeRoles]);

  const hasDrawableRoad =
    roadNetwork.segments.length > 0 || (roadDrawing !== null && roadDrawing.points.length >= 2);

  const commitPendingDrawing = () => {
    if (roadDrawing && roadDrawing.points.length >= 2 && topo.ftPerPixel) {
      const result = commitDrawingSegment(roadNetwork, roadDrawing, topo.ftPerPixel);
      setRoadNetwork(result.network);
      setRoadDrawing(result.drawing);
    }
  };

  const handleUndo = () => {
    const result = undoRoadEdit(roadNetwork, roadDrawing, topo.ftPerPixel);
    setRoadNetwork(result.network);
    setRoadDrawing(result.drawing);
  };

  const handleEndSegment = () => {
    if (!roadDrawing || roadDrawing.points.length < 2 || !topo.ftPerPixel) return;
    const result = commitDrawingSegment(roadNetwork, roadDrawing, topo.ftPerPixel);
    setRoadNetwork(result.network);
    setRoadDrawing(result.drawing);
  };

  const handleClearRoad = () => {
    setRoadNetwork(emptyRoadNetwork());
    setRoadDrawing(null);
  };

  const handleContinueToReposition = () => {
    commitPendingDrawing();
    goToStep('reposition-road');
  };

  const handleStepChange = (target: SubdivisionWorkflowStep) => {
    if (target === 'reposition-road' || target === 'road-polygon' || target === 'lot-layout') {
      commitPendingDrawing();
    }
    goToStep(target);
  };

  const handleApplyScale = () => {
    topo.applyScale();
    topo.setStep('place-road');
  };

  const handleClearSaved = () => {
    clearSubdivisionProject();
    handleClearRoad();
    setRoadWidthFt(DEFAULT_ROAD_WIDTH_FT);
    setTargetLotSizeSqFt(DEFAULT_TARGET_LOT_SIZE_SQFT);
    setLotPairCountOverride(null);
    topo.resetDigitization();
    topo.setSaveStatus('Saved progress cleared.');
  };

  const roadSummary = (
    <>
      <p className="topo-workflow-meta">
        {roadStats.segmentCount} segment{roadStats.segmentCount === 1 ? '' : 's'}
        {topo.step === 'place-road' && roadDrawing
          ? ` · drawing ${roadDrawing.points.length} point${roadDrawing.points.length === 1 ? '' : 's'}`
          : ''}
        {roadStats.totalLengthFt > 0 ? ` · ${roadStats.totalLengthFt.toFixed(0)}′ centerline` : ''}
      </p>
      {entranceCount > 0 || deadEndCount > 0 ? (
        <p className="topo-workflow-meta">
          {entranceCount} entrance{entranceCount === 1 ? '' : 's'}
          {deadEndCount > 0 ? ` · ${deadEndCount} dead-end${deadEndCount === 1 ? '' : 's'}` : ''}
        </p>
      ) : null}
      {roadStats.warnings.map((warning, i) => (
        <p key={`${i}-${warning}`} className="subdivision-road-warning">
          {warning}
        </p>
      ))}
      <ul className="subdivision-road-legend">
        <li className="subdivision-road-legend-entrance">Entrance (on boundary)</li>
        <li className="subdivision-road-legend-junction">Junction</li>
        <li className="subdivision-road-legend-deadend">Dead-end</li>
      </ul>
    </>
  );


 
  return (
    <div className="topo-workflow subdivision-generator">
      <AlphaBanner page={EPageNames.SUBDIVISION_GENERATOR} />

      <header className="topo-workflow-header subdivision-generator-header">
        <h1>Subdivision Generator</h1>
      </header>

      <div className="topo-workflow-layout">
        <aside className="topo-workflow-sidebar">
          <TopoStepNav
            steps={STEPS}
            activeStep={
              topo.step === 'road-polygon' || topo.step === 'lot-layout'
                ? 'reposition-road'
                : topo.step
            }
            canReachStep={canReachStep}
            onStepChange={handleStepChange}
            hint={currentStep?.description}
          />

          <section className="topo-workflow-panel">
            <TopoSaveActions
              saveStatus={topo.saveStatus}
              onSave={topo.saveNow}
              onClear={handleClearSaved}
            />
          </section>

          {topo.step === 'upload' ? (
            <>
              <TopoUploadPanel onFileUpload={topo.handleImageUpload} />
              <section className="topo-workflow-panel">
                <div className="topo-workflow-actions">
                  <button type="button" className="topo-workflow-btn" onClick={() => goToStep('boundary')}>
                    Continue without image
                  </button>
                </div>
              </section>
            </>
          ) : null}

          {topo.step === 'boundary' && topo.boundaryClosed ? (
            <section className="topo-workflow-panel">
              <p className="topo-workflow-meta">{topo.boundary.length} corners traced</p>
              <div className="topo-workflow-actions">
                <button type="button" className="topo-workflow-btn" onClick={() => goToStep('scale')}>
                  Continue to set scale
                </button>
              </div>
            </section>
          ) : null}

          {topo.step === 'scale' &&
          topo.scaleMode &&
          topo.scaleEdgeIndex !== null &&
          topo.scaleEdgePixelLength !== null ? (
            <TopoScalePanel
              scaleEdgeIndex={topo.scaleEdgeIndex}
              scaleEdgePixelLength={topo.scaleEdgePixelLength}
              scaleEdgeLengthFt={topo.scaleEdgeLengthFt}
              onScaleEdgeLengthFtChange={topo.setScaleEdgeLengthFt}
              onApplyScale={handleApplyScale}
              inputId="subdivision-scale-length"
              focusTrigger={`${topo.step}-${topo.scaleEdgeIndex}`}
            />
          ) : null}

          {topo.step === 'place-road' ? (
            <section className="topo-workflow-panel">
              <h2>Place road points</h2>
              <p className="topo-workflow-hint">
                Points on or near the property boundary are treated as road entrances. Click a road
                line to add a point. Click an existing node to branch, or snap to a node to close a loop.
              </p>
              {roadSummary}
              <div className="topo-workflow-actions">
                <button
                  type="button"
                  className="topo-workflow-btn topo-workflow-btn-secondary"
                  disabled={roadDrawing === null && roadNetwork.segments.length === 0}
                  onClick={handleUndo}
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="topo-workflow-btn topo-workflow-btn-secondary"
                  disabled={!roadDrawing || roadDrawing.points.length < 2}
                  onClick={handleEndSegment}
                >
                  End segment
                </button>
                <button
                  type="button"
                  className="topo-workflow-btn topo-workflow-btn-secondary"
                  disabled={
                    roadNetwork.segments.length === 0 &&
                    (roadDrawing === null || roadDrawing.points.length === 0)
                  }
                  onClick={handleClearRoad}
                >
                  Clear roads
                </button>
                <button
                  type="button"
                  className="topo-workflow-btn"
                  disabled={!hasDrawableRoad}
                  onClick={handleContinueToReposition}
                >
                  Continue to reposition
                </button>
              </div>
              {topo.boundaryReady ? (
                <p className="topo-workflow-meta">
                  {areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft site area
                </p>
              ) : null}
            </section>
          ) : null}

          {topo.step === 'reposition-road' ? (
            <section className="topo-workflow-panel">
              <h2>Reposition & lots</h2>
              <p className="topo-workflow-hint">
                Drag road nodes to adjust the layout. The paved road and lot boundaries update
                automatically as you move points.
              </p>
              <div className="topo-workflow-field-row">
                <label htmlFor="subdivision-road-width">Road width (ft)</label>
                <input
                  id="subdivision-road-width"
                  type="number"
                  min={12}
                  max={60}
                  value={roadWidthFt}
                  onChange={(e) =>
                    setRoadWidthFt(Math.max(12, Number(e.target.value) || DEFAULT_ROAD_WIDTH_FT))
                  }
                />
              </div>
              <div className="topo-workflow-field-row">
                <label htmlFor="subdivision-target-lot-size">Target lot size (sq ft, excl. road)</label>
                <input
                  id="subdivision-target-lot-size"
                  type="number"
                  min={1000}
                  max={100000}
                  step={500}
                  value={targetLotSizeSqFt}
                  onChange={(e) => {
                    setTargetLotSizeSqFt(
                      Math.max(
                        1000,
                        Math.min(100000, Number(e.target.value) || DEFAULT_TARGET_LOT_SIZE_SQFT),
                      ),
                    );
                    setLotPairCountOverride(null);
                  }}
                />
              </div>
             
              {lotPairCountOverride !== null ? (
                <div className="topo-workflow-actions">
                  <button
                    type="button"
                    className="topo-workflow-btn topo-workflow-btn-secondary"
                    onClick={() => setLotPairCountOverride(null)}
                  >
                    Reset lot rows to auto
                  </button>
                </div>
              ) : null}
              {roadSummary}
              <div className="topo-workflow-actions">
                <button
                  type="button"
                  className="topo-workflow-btn topo-workflow-btn-secondary"
                  onClick={() => goToStep('place-road')}
                >
                  Add more points
                </button>
              </div>
              <ul className="subdivision-lot-legend">
                <li className="subdivision-lot-legend-left">Left-side lots</li>
                <li className="subdivision-lot-legend-right">Right-side lots</li>
                <li className="subdivision-lot-legend-spawn">Spawn point</li>
              </ul>
              {topo.boundaryReady ? (
                <p className="topo-workflow-meta">
                  {areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft site area
                </p>
              ) : null}
            </section>
          ) : null}
        </aside>

        <div className="topo-workflow-main">
          {isMapStep ? (
            <section className="topo-workflow-panel topo-workflow-map-panel">
              <h2>Site map</h2>
              <div className="topo-workflow-interactive-wrap">
                <SubdivisionMapCanvas
                  imageUrl={topo.imageUrl}
                  boundary={topo.boundary}
                  boundaryClosed={topo.boundaryClosed}
                  ftPerPixel={topo.ftPerPixel}
                  mode={mapMode}
                  roadNetwork={roadNetwork}
                  roadDrawing={roadDrawing}
                  roadPolygonOuters={roadPolygonRings.outers}
                  roadPolygonHoles={roadPolygonRings.holes}
                  roadPolygonPieces={roadPolygonRings.pieces}
                  
                  onRoadNetworkChange={setRoadNetwork}
                  onRoadDrawingChange={setRoadDrawing}
                />
              </div>
            </section>
          ) : (
            <TopoMapWorkspace
              imageUrl={topo.imageUrl}
              step={topo.step}
              boundary={topo.boundary}
              boundaryClosed={topo.boundaryClosed}
              ftPerPixel={topo.ftPerPixel}
              scaleMode={topo.step === 'scale' && topo.scaleMode}
              scaleEdgeIndex={topo.scaleEdgeIndex}
              onImageUpload={topo.handleImageUpload}
              onBoundaryChange={topo.handleBoundaryChange}
              onScaleEdgeSelect={topo.setScaleEdgeIndex}
              mapTitle={topo.step === 'scale' ? 'Set scale' : 'Map'}
              showUploadWhenEmpty={topo.step === 'upload'}
              restoredBoundaryHint
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubdivisionGenerator;
