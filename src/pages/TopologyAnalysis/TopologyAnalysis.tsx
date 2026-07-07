import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import AlphaBanner from '../SiteplanDesigner/AlphaBanner';
import ImageUploader from '../SiteplanDesigner/ImageUploader';
import { EPageNames } from '../../utils/types';
import {
  boundaryEdgeLength,
  calculateBoundaryAreaSqFt,
  computeFtPerPixel,
  type BoundaryCorner,
  type BoundaryPoint,
  type ContourLine,
} from '../../utils/siteMapCalculations';
import { formatCuYd } from '../../utils/cutFillTypes';
import { buildElevPoints, calculateTinCutFill, triangulateSurface } from '../../utils/cutFillTin';
import {
  buildTerrainGrid,
  computeDealKillers,
  computeDevelopmentMetrics,
  computeDrainagePaths,
  computeSiteScores,
  detectFlatPads,
  generateContourSegments,
  type TopologyAnalysisView,
  type TopologyWorkflowStep,
} from '../../utils/topologyAnalysis';
import {
  clearTopologyProject,
  loadTopologyProject,
  saveTopologyProject,
} from '../../utils/topologyAnalysisStorage';
import TopologyMapCanvas from './TopologyMapCanvas';
import './TopologyAnalysis.scss';

const SETUP_STEPS: { id: TopologyWorkflowStep; label: string; description: string }[] = [
  { id: 'upload', label: '1. Upload', description: 'Upload a topo or survey image of the property.' },
  { id: 'boundary', label: '2. Boundary', description: 'Trace the property outline and set scale.' },
  { id: 'corners', label: '3. Corners', description: 'Enter elevation at each property corner.' },
  { id: 'contours', label: '4. Contours', description: 'Draw contour lines and label their elevations.' },
];

const ANALYSIS_VIEWS: { id: TopologyAnalysisView; label: string; group: string }[] = [
  { id: 'overview', label: 'Overview', group: 'Summary' },
  { id: 'terrain3d', label: '3D terrain', group: 'Terrain' },
  { id: 'elevation', label: 'Elevation map', group: 'Terrain' },
  { id: 'slope', label: 'Slope heat map', group: 'Terrain' },
  { id: 'aspect', label: 'Aspect', group: 'Terrain' },
  { id: 'hillshade', label: 'Hillshade', group: 'Terrain' },
  { id: 'generated-contours', label: 'Contour lines', group: 'Terrain' },
  { id: 'drainage', label: 'Drainage paths', group: 'Terrain' },
  { id: 'buildable', label: 'Buildable area', group: 'Buildability' },
  { id: 'cutfill', label: 'Cut / fill', group: 'Earthwork' },
];

const TopologyAnalysis = () => {
  const [step, setStep] = useState<TopologyWorkflowStep>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [boundary, setBoundary] = useState<BoundaryPoint[]>([]);
  const [boundaryClosed, setBoundaryClosed] = useState(false);
  const [corners, setCorners] = useState<BoundaryCorner[]>([]);
  const [contours, setContours] = useState<ContourLine[]>([]);
  const [ftPerPixel, setFtPerPixel] = useState<number | null>(null);
  const [scaleEdgeIndex, setScaleEdgeIndex] = useState<number | null>(null);
  const [scaleEdgeLengthFt, setScaleEdgeLengthFt] = useState('');
  const [draftContourPoints, setDraftContourPoints] = useState<BoundaryPoint[]>([]);
  const [draftContourElev, setDraftContourElev] = useState('100');
  const [targetElevationFt, setTargetElevationFt] = useState(100);
  const [zScaleMultiplier, setZScaleMultiplier] = useState(1);
  const [buildableSlopePct, setBuildableSlopePct] = useState(15);
  const [contourIntervalFt, setContourIntervalFt] = useState(2);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const saved = loadTopologyProject();
    if (!saved) {
      hydratedRef.current = true;
      return;
    }
    setStep(saved.step === 'upload' ? 'boundary' : saved.step);
    setBoundary(saved.boundary);
    setBoundaryClosed(saved.boundaryClosed);
    setCorners(saved.corners);
    setContours(saved.contours);
    setFtPerPixel(saved.ftPerPixel);
    setDraftContourPoints(saved.draftContourPoints);
    setDraftContourElev(saved.draftContourElev);
    setTargetElevationFt(saved.targetElevationFt);
    setZScaleMultiplier(saved.zScaleMultiplier ?? 1);
    setBuildableSlopePct(saved.buildableSlopePct ?? 15);
    setContourIntervalFt(saved.contourIntervalFt ?? 2);
    setSaveStatus(
      `Restored progress from ${new Date(saved.savedAt).toLocaleString()}. Re-upload your image to see the map background.`,
    );
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (step === 'upload' && boundary.length === 0 && contours.length === 0) return;

    const timer = window.setTimeout(() => {
      saveTopologyProject({
        step,
        boundary,
        boundaryClosed,
        corners,
        contours,
        ftPerPixel,
        draftContourPoints,
        draftContourElev,
        targetElevationFt,
        zScaleMultiplier,
        buildableSlopePct,
        contourIntervalFt,
      });
      setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    step,
    boundary,
    boundaryClosed,
    corners,
    contours,
    ftPerPixel,
    draftContourPoints,
    draftContourElev,
    targetElevationFt,
    zScaleMultiplier,
    buildableSlopePct,
    contourIntervalFt,
  ]);

  const scaleDefined = ftPerPixel !== null && ftPerPixel > 0;
  const scaleMode = boundaryClosed && !scaleDefined;
  const canProceedFromBoundary = boundaryClosed && boundary.length >= 3 && scaleDefined;
  const setupComplete = canProceedFromBoundary && contours.length > 0;

  const tinData = useMemo(() => {
    if (!ftPerPixel || boundary.length < 3) return null;
    const points = buildElevPoints(boundary, corners, contours, ftPerPixel);
    const triangles = triangulateSurface(points, boundary, ftPerPixel);
    const totals = calculateTinCutFill(points, triangles, targetElevationFt, boundary, ftPerPixel);
    return { points, triangles, totals };
  }, [boundary, corners, contours, ftPerPixel, targetElevationFt]);

  const terrainGrid = useMemo(() => {
    if (!tinData || !ftPerPixel) return [];
    return buildTerrainGrid(boundary, ftPerPixel, tinData.points, tinData.triangles);
  }, [boundary, ftPerPixel, tinData]);

  const analysis = useMemo(() => {
    if (!tinData || !ftPerPixel || terrainGrid.length === 0) return null;
    const metrics = computeDevelopmentMetrics(
      boundary,
      ftPerPixel,
      tinData.points,
      tinData.triangles,
      terrainGrid,
      buildableSlopePct,
    );
    const grossSqFt = calculateBoundaryAreaSqFt(boundary, ftPerPixel);
    const flatPads = detectFlatPads(terrainGrid, grossSqFt);
    const dealKillers = computeDealKillers(
      metrics,
      tinData.totals.cutCuYd,
      tinData.totals.fillCuYd,
      buildableSlopePct,
    );
    const siteScores = computeSiteScores(metrics, tinData.totals.cutCuYd, tinData.totals.fillCuYd);
    const generatedContours = generateContourSegments(terrainGrid, contourIntervalFt);
    const drainagePaths = computeDrainagePaths(terrainGrid);
    return { metrics, flatPads, dealKillers, siteScores, generatedContours, drainagePaths };
  }, [tinData, ftPerPixel, terrainGrid, boundary, buildableSlopePct, contourIntervalFt]);

  const canReachStep = (target: TopologyWorkflowStep) => {
    const setupIds = SETUP_STEPS.map((s) => s.id);
    if (setupIds.includes(target)) {
      const idx = setupIds.indexOf(target);
      if (idx <= 0) return true;
      if (idx >= 1 && !canProceedFromBoundary) return false;
      const needsImage = target === 'boundary' || target === 'corners' || target === 'contours';
      if (needsImage && !imageUrl) return false;
      return true;
    }
    return setupComplete && tinData !== null && tinData.triangles.length > 0;
  };

  const goToStep = (target: TopologyWorkflowStep) => {
    if (canReachStep(target)) setStep(target);
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setBoundary([]);
    setBoundaryClosed(false);
    setCorners([]);
    setContours([]);
    setFtPerPixel(null);
    setScaleEdgeIndex(null);
    setScaleEdgeLengthFt('');
    setDraftContourPoints([]);
    setStep('boundary');
  };

  const handleBoundaryChange = (next: BoundaryPoint[], closed: boolean) => {
    setBoundary(next);
    setBoundaryClosed(closed);
    setCorners((prev) =>
      next.map((p, i) => ({
        ...p,
        elevationFt: prev[i]?.elevationFt ?? 100,
      })),
    );
  };

  const applyScale = () => {
    if (scaleEdgeIndex === null) return;
    const length = Number(scaleEdgeLengthFt);
    if (!length || length <= 0) return;
    const ratio = computeFtPerPixel(boundary, scaleEdgeIndex, length);
    if (ratio > 0) {
      setFtPerPixel(ratio);
      setScaleEdgeIndex(null);
      setScaleEdgeLengthFt('');
    }
  };

  const finishContour = () => {
    if (draftContourPoints.length < 2) return;
    const elev = Number(draftContourElev);
    if (!Number.isFinite(elev)) return;
    setContours((prev) => [...prev, { id: uuid(), points: draftContourPoints, elevationFt: elev }]);
    setDraftContourPoints([]);
  };

  const updateCornerElev = (index: number, value: number) => {
    setCorners((prev) =>
      prev.map((corner, i) => (i === index ? { ...corner, elevationFt: value } : corner)),
    );
  };

  const handleSaveNow = () => {
    saveTopologyProject({
      step,
      boundary,
      boundaryClosed,
      corners,
      contours,
      ftPerPixel,
      draftContourPoints,
      draftContourElev,
      targetElevationFt,
      zScaleMultiplier,
      buildableSlopePct,
      contourIntervalFt,
    });
    setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
  };

  const handleClearSaved = () => {
    clearTopologyProject();
    setSaveStatus('Saved progress cleared.');
  };

  const needsImageBackground =
    step === 'upload' ||
    step === 'boundary' ||
    step === 'corners' ||
    step === 'contours' ||
    ['elevation', 'slope', 'aspect', 'buildable', 'drainage', 'generated-contours'].includes(step);

  const isSetupStep = SETUP_STEPS.some((s) => s.id === step);
  const currentSetup = SETUP_STEPS.find((s) => s.id === step);
  const currentView = ANALYSIS_VIEWS.find((v) => v.id === step);
  const elevationMinFt = analysis?.metrics.elevationMinFt ?? 0;
  const elevationMaxFt = analysis?.metrics.elevationMaxFt ?? 100;

  const mapTitle = () => {
    if (step === 'upload') return 'Upload';
    if (isSetupStep) return 'Map';
    return currentView?.label ?? 'Analysis';
  };

  return (
    <div className="topology-calculator">
      <AlphaBanner page={EPageNames.TOPOLOGY_ANALYSIS} />

      <header className="topology-header">
        <h1>Topology Analysis</h1>
        <p>
          Upload a topo image, digitize your site, then explore slope, drainage, buildability, earthwork,
          and development feasibility metrics.
        </p>
      </header>

      <div className="topology-layout">
        <aside className="topology-sidebar">
          <section className="topology-panel">
            <h2>Setup</h2>
            <ol className="topology-steps">
              {SETUP_STEPS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`topology-step-btn ${step === s.id ? 'is-active' : ''} ${canReachStep(s.id) ? '' : 'is-disabled'}`}
                    onClick={() => goToStep(s.id)}
                    disabled={!canReachStep(s.id)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
            {isSetupStep && currentSetup ? (
              <p className="topology-hint">{currentSetup.description}</p>
            ) : null}
            {saveStatus ? <p className="topology-meta">{saveStatus}</p> : null}
            <div className="topology-actions topology-save-actions">
              <button type="button" className="topology-btn topology-btn-secondary" onClick={handleSaveNow}>
                Save progress
              </button>
              <button type="button" className="topology-btn topology-btn-secondary" onClick={handleClearSaved}>
                Clear saved
              </button>
            </div>
          </section>

          {setupComplete && (
            <section className="topology-panel">
              <h2>Analysis views</h2>
              <div className="topology-view-groups">
                {['Summary', 'Terrain', 'Buildability', 'Earthwork'].map((group) => (
                  <div key={group} className="topology-view-group">
                    <h3>{group}</h3>
                    <ul className="topology-steps">
                      {ANALYSIS_VIEWS.filter((v) => v.group === group).map((v) => (
                        <li key={v.id}>
                          <button
                            type="button"
                            className={`topology-step-btn ${step === v.id ? 'is-active' : ''}`}
                            onClick={() => goToStep(v.id)}
                          >
                            {v.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 'upload' && (
            <section className="topology-panel">
              <h2>Property image</h2>
              <ImageUploader onFileUpload={handleImageUpload} />
            </section>
          )}

          {step === 'boundary' && scaleMode && scaleEdgeIndex !== null && (
            <section className="topology-panel">
              <h2>Set scale</h2>
              <p className="topology-hint">
                Edge {scaleEdgeIndex + 1} is {boundaryEdgeLength(boundary, scaleEdgeIndex).toFixed(0)} px on the
                image.
              </p>
              <div className="topology-field-row">
                <label htmlFor="topo-scale-length">Real length (ft)</label>
                <input
                  id="topo-scale-length"
                  type="number"
                  min={1}
                  value={scaleEdgeLengthFt}
                  onChange={(e) => setScaleEdgeLengthFt(e.target.value)}
                />
              </div>
              <div className="topology-actions">
                <button
                  type="button"
                  className="topology-btn"
                  disabled={!scaleEdgeLengthFt || Number(scaleEdgeLengthFt) <= 0}
                  onClick={applyScale}
                >
                  Apply scale
                </button>
              </div>
            </section>
          )}

          {step === 'boundary' && canProceedFromBoundary && (
            <section className="topology-panel">
              <p className="topology-meta">
                {calculateBoundaryAreaSqFt(boundary, ftPerPixel!).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{' '}
                sq ft · {boundary.length} corners
              </p>
              <div className="topology-actions">
                <button type="button" className="topology-btn" onClick={() => goToStep('corners')}>
                  Continue to corner elevations
                </button>
              </div>
            </section>
          )}

          {step === 'corners' && (
            <section className="topology-panel">
              <h2>Corner elevations</h2>
              <p className="topology-hint">Enter the elevation in feet at each corner directly on the map.</p>
              <div className="topology-actions">
                <button type="button" className="topology-btn" onClick={() => goToStep('contours')}>
                  Continue to contours
                </button>
              </div>
            </section>
          )}

          {step === 'contours' && (
            <section className="topology-panel">
              <h2>Contour lines</h2>
              <div className="topology-field-row">
                <label htmlFor="topo-contour-elev">Line elevation (ft)</label>
                <input
                  id="topo-contour-elev"
                  type="number"
                  step={0.1}
                  value={draftContourElev}
                  onChange={(e) => setDraftContourElev(e.target.value)}
                />
              </div>
              <p className="topology-meta">
                {draftContourPoints.length} points in current line · {contours.length} lines drawn
              </p>
              <div className="topology-actions">
                <button
                  type="button"
                  className="topology-btn topology-btn-secondary"
                  disabled={draftContourPoints.length < 2}
                  onClick={finishContour}
                >
                  Finish contour line
                </button>
                <button
                  type="button"
                  className="topology-btn topology-btn-secondary"
                  disabled={draftContourPoints.length === 0}
                  onClick={() => setDraftContourPoints([])}
                >
                  Clear current line
                </button>
                <button
                  type="button"
                  className="topology-btn"
                  disabled={contours.length === 0 && draftContourPoints.length < 2}
                  onClick={() => {
                    if (draftContourPoints.length >= 2) finishContour();
                    goToStep('overview');
                  }}
                >
                  Run topology analysis
                </button>
              </div>
            </section>
          )}

          {step === 'overview' && analysis && (
            <>
              <section className="topology-panel">
                <h2>Development metrics</h2>
                <dl className="topology-metrics">
                  <div><dt>Gross acreage</dt><dd>{analysis.metrics.grossAcres.toFixed(2)} ac</dd></div>
                  <div><dt>Net buildable</dt><dd>{analysis.metrics.netBuildableAcres.toFixed(2)} ac ({analysis.metrics.netBuildablePct.toFixed(0)}%)</dd></div>
                  <div><dt>Avg slope</dt><dd>{analysis.metrics.avgSlopePct.toFixed(1)}%</dd></div>
                  <div><dt>Median slope</dt><dd>{analysis.metrics.medianSlopePct.toFixed(1)}%</dd></div>
                  <div><dt>Max slope</dt><dd>{analysis.metrics.maxSlopePct.toFixed(1)}%</dd></div>
                  <div><dt>Elevation range</dt><dd>{analysis.metrics.elevationRangeFt.toFixed(1)} ft</dd></div>
                  <div><dt>High point</dt><dd>{analysis.metrics.highestPoint.zFt.toFixed(1)} ft</dd></div>
                  <div><dt>Low point</dt><dd>{analysis.metrics.lowestPoint.zFt.toFixed(1)} ft</dd></div>
                  <div><dt>Steep slopes (&gt;25%)</dt><dd>{analysis.metrics.steepSlopePct.toFixed(1)}%</dd></div>
                  <div><dt>Flat area (&lt;5%)</dt><dd>{analysis.metrics.flatAreaPct.toFixed(1)}%</dd></div>
                </dl>
              </section>

              <section className="topology-panel">
                <h2>Site score</h2>
                <p className="topology-score-overall">{analysis.siteScores.overall} / 100</p>
                <ul className="topology-score-list">
                  {analysis.siteScores.categories.map((cat) => (
                    <li key={cat.id}>
                      <span>{cat.label}</span>
                      <strong>{cat.score}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="topology-panel">
                <h2>Deal-killer checks</h2>
                <ul className="topology-deal-killers">
                  {analysis.dealKillers.map((check) => (
                    <li
                      key={check.id}
                      className={`topology-deal-killer ${check.triggered ? 'is-triggered' : ''} topology-deal-killer-${check.severity}`}
                    >
                      <span>{check.triggered ? '⚠' : '○'}</span>
                      <div>
                        <strong>{check.label}</strong>
                        <p>{check.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="topology-panel">
                <h2>Flat building pads</h2>
                <ul className="topology-pad-list">
                  {analysis.flatPads.map((pad) => (
                    <li key={pad.id}>
                      ≤{pad.slopeThresholdPct}% slope — {pad.areaAcres.toFixed(2)} ac ({pad.pctOfSite.toFixed(0)}% of site)
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {(step === 'terrain3d' || step === 'overview' || step === 'hillshade' || step === 'cutfill') &&
            tinData && (
              <section className="topology-panel">
                <h2>3D view</h2>
                <div className="topology-field-row topology-field-row-slider">
                  <label htmlFor="topo-z-scale">Elevation scale ({zScaleMultiplier}x)</label>
                  <input
                    id="topo-z-scale"
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={zScaleMultiplier}
                    onChange={(e) => setZScaleMultiplier(Number(e.target.value))}
                  />
                </div>
                <p className="topology-hint">Scroll on the map to zoom. Drag to orbit.</p>
              </section>
            )}

          {step === 'buildable' && (
            <section className="topology-panel">
              <h2>Buildable slope threshold</h2>
              <div className="topology-field-row topology-field-row-slider">
                <label htmlFor="buildable-slope">Max slope ({buildableSlopePct}%)</label>
                <input
                  id="buildable-slope"
                  type="range"
                  min={2}
                  max={25}
                  step={1}
                  value={buildableSlopePct}
                  onChange={(e) => setBuildableSlopePct(Number(e.target.value))}
                />
              </div>
              <p className="topology-hint">Green = buildable at this slope. Red = excluded (steep slopes, setbacks, etc. require manual overlays).</p>
            </section>
          )}

          {step === 'generated-contours' && (
            <section className="topology-panel">
              <h2>Contour interval</h2>
              <div className="topology-field-row">
                <label htmlFor="contour-interval">Interval (ft)</label>
                <input
                  id="contour-interval"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={contourIntervalFt}
                  onChange={(e) => setContourIntervalFt(Number(e.target.value) || 2)}
                />
              </div>
            </section>
          )}

          {step === 'cutfill' && tinData && (
            <section className="topology-panel">
              <h2>Cut / fill</h2>
              <div className="topology-field-row">
                <label htmlFor="topo-target-elev">Finished elevation (ft)</label>
                <input
                  id="topo-target-elev"
                  type="number"
                  step={0.1}
                  value={targetElevationFt}
                  onChange={(e) => setTargetElevationFt(Number(e.target.value) || 0)}
                />
              </div>
              <div className="topology-totals">
                <div className="topology-total topology-total-cut">
                  <span>Cut</span>
                  <strong>{formatCuYd(tinData.totals.cutCuYd)} cu yd</strong>
                </div>
                <div className="topology-total topology-total-fill">
                  <span>Fill</span>
                  <strong>{formatCuYd(tinData.totals.fillCuYd)} cu yd</strong>
                </div>
                <div className="topology-total">
                  <span>Net</span>
                  <strong>{formatCuYd(tinData.totals.netCuYd)} cu yd</strong>
                </div>
              </div>
            </section>
          )}
        </aside>

        <div className="topology-main">
          <section className="topology-panel topology-map-panel">
            <h2>{mapTitle()}</h2>
            <div className="topology-interactive-wrap">
              {needsImageBackground && !imageUrl && isSetupStep ? (
                <div className="topology-upload-area">
                  <ImageUploader onFileUpload={handleImageUpload} />
                  {boundary.length > 0 ? (
                    <p className="topology-hint topology-upload-hint">
                      Re-upload your property image to continue editing on the map. Your saved points are kept.
                    </p>
                  ) : null}
                </div>
              ) : (
                <TopologyMapCanvas
                  imageUrl={imageUrl}
                  step={step}
                  boundary={boundary}
                  boundaryClosed={boundaryClosed}
                  corners={corners}
                  contours={contours}
                  ftPerPixel={ftPerPixel}
                  scaleMode={scaleMode}
                  selectedScaleEdge={scaleEdgeIndex}
                  draftContourPoints={draftContourPoints}
                  targetElevationFt={targetElevationFt}
                  zScaleMultiplier={zScaleMultiplier}
                  terrainGrid={terrainGrid}
                  buildableSlopePct={buildableSlopePct}
                  contourIntervalFt={contourIntervalFt}
                  elevationMinFt={elevationMinFt}
                  elevationMaxFt={elevationMaxFt}
                  generatedContours={analysis?.generatedContours ?? []}
                  drainagePaths={analysis?.drainagePaths ?? []}
                  onBoundaryChange={handleBoundaryChange}
                  onScaleEdgeSelect={setScaleEdgeIndex}
                  onDraftContourChange={setDraftContourPoints}
                  onCornerElevChange={updateCornerElev}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TopologyAnalysis;
