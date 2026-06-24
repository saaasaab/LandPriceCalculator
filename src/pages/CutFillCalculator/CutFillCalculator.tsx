import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import AlphaBanner from '../SiteplanDesigner/AlphaBanner';
import ImageUploader from '../SiteplanDesigner/ImageUploader';
import { EPageNames } from '../../utils/types';
import {
  boundaryEdgeLength,
  calculateBoundaryAreaSqFt,
  computeFtPerPixel,
  formatCuYd,
  type BoundaryCorner,
  type BoundaryPoint,
  type ContourLine,
  type CutFillWorkflowStep,
} from '../../utils/cutFillCalculations';
import {
  buildElevPoints,
  calculateTinCutFill,
  triangulateSurface,
} from '../../utils/cutFillTin';
import {
  clearCutFillProject,
  loadCutFillProject,
  saveCutFillProject,
} from '../../utils/cutFillStorage';
import CutFillMapCanvas from './CutFillMapCanvas';
import './CutFillCalculator.scss';

const STEPS: { id: CutFillWorkflowStep; label: string; description: string }[] = [
  { id: 'upload', label: '1. Upload', description: 'Upload a topo or survey image of the property.' },
  { id: 'boundary', label: '2. Boundary', description: 'Trace the property outline and set scale.' },
  { id: 'corners', label: '3. Corners', description: 'Enter elevation at each property corner.' },
  { id: 'contours', label: '4. Contours', description: 'Draw contour lines and label their elevations.' },
  { id: 'terrain', label: '5. Terrain', description: 'Review the triangulated 3D surface.' },
  { id: 'cutfill', label: '6. Cut / fill', description: 'Set target grade and view earthwork plan.' },
];

const CutFillCalculator = () => {
  const [step, setStep] = useState<CutFillWorkflowStep>('upload');
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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const saved = loadCutFillProject();
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
    setSaveStatus(`Restored progress from ${new Date(saved.savedAt).toLocaleString()}. Re-upload your image to see the map background.`);
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (step === 'upload' && boundary.length === 0 && contours.length === 0) return;

    const timer = window.setTimeout(() => {
      saveCutFillProject({
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
  ]);

  const scaleDefined = ftPerPixel !== null && ftPerPixel > 0;
  const scaleMode = boundaryClosed && !scaleDefined;
  const canProceedFromBoundary = boundaryClosed && boundary.length >= 3 && scaleDefined;

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
    setContours((prev) => [
      ...prev,
      { id: uuid(), points: draftContourPoints, elevationFt: elev },
    ]);
    setDraftContourPoints([]);
  };

  const updateCornerElev = (index: number, value: number) => {
    setCorners((prev) =>
      prev.map((corner, i) => (i === index ? { ...corner, elevationFt: value } : corner)),
    );
  };

  const tinData = useMemo(() => {
    if (!ftPerPixel || boundary.length < 3) return null;
    const points = buildElevPoints(boundary, corners, contours, ftPerPixel);
    const triangles = triangulateSurface(points, boundary, ftPerPixel);
    const totals = calculateTinCutFill(points, triangles, targetElevationFt, boundary, ftPerPixel);
    return { points, triangles, totals };
  }, [boundary, corners, contours, ftPerPixel, targetElevationFt]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const canReachStep = (target: CutFillWorkflowStep) => {
    const idx = STEPS.findIndex((s) => s.id === target);
    if (idx <= 0) return true;
    if (idx >= 1 && !canProceedFromBoundary) return false;
    const needsImage = target === 'boundary' || target === 'corners' || target === 'contours';
    if (needsImage && !imageUrl) return false;
    if (idx >= 4 && (!tinData || tinData.triangles.length === 0)) return false;
    return true;
  };

  const goToStep = (target: CutFillWorkflowStep) => {
    if (canReachStep(target)) setStep(target);
  };

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next && canReachStep(next.id)) setStep(next.id);
  };

  const handleSaveNow = () => {
    saveCutFillProject({
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
    });
    setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
  };

  const handleClearSaved = () => {
    clearCutFillProject();
    setSaveStatus('Saved progress cleared.');
  };

  const needsImageBackground =
    step === 'upload' || step === 'boundary' || step === 'corners' || step === 'contours';

  return (
    <div className="cut-fill-calculator">
      <AlphaBanner page={EPageNames.CUT_FILL_CALCULATOR} />

      <header className="cut-fill-header">
        <h1>Cut &amp; Fill Calculator</h1>
        <p>
          Upload a topo image, trace your parcel, add corner elevations and contour lines, then generate a
          triangulated cut/fill plan.
        </p>
      </header>

      <div className="cut-fill-layout">
        <aside className="cut-fill-sidebar">
          <section className="cut-fill-panel">
            <h2>Workflow</h2>
            <ol className="cut-fill-steps">
              {STEPS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`cut-fill-step-btn ${step === s.id ? 'is-active' : ''} ${canReachStep(s.id) ? '' : 'is-disabled'}`}
                    onClick={() => goToStep(s.id)}
                    disabled={!canReachStep(s.id)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
            <p className="cut-fill-hint">{STEPS[stepIndex]?.description}</p>
            {saveStatus ? <p className="cut-fill-meta">{saveStatus}</p> : null}
            <div className="cut-fill-actions">
              <button type="button" className="cut-fill-btn cut-fill-btn-secondary" onClick={handleSaveNow}>
                Save progress
              </button>
              <button type="button" className="cut-fill-btn cut-fill-btn-secondary" onClick={handleClearSaved}>
                Clear saved
              </button>
            </div>
          </section>

          {step === 'upload' && (
            <section className="cut-fill-panel">
              <h2>Property image</h2>
              <ImageUploader onFileUpload={handleImageUpload} />
            </section>
          )}

          {step === 'boundary' && scaleMode && scaleEdgeIndex !== null && (
            <section className="cut-fill-panel">
              <h2>Set scale</h2>
              <p className="cut-fill-hint">
                Edge {scaleEdgeIndex + 1} is {boundaryEdgeLength(boundary, scaleEdgeIndex).toFixed(0)} px on the
                image.
              </p>
              <div className="cut-fill-field-row">
                <label htmlFor="cut-fill-scale-length">Real length (ft)</label>
                <input
                  id="cut-fill-scale-length"
                  type="number"
                  min={1}
                  value={scaleEdgeLengthFt}
                  onChange={(e) => setScaleEdgeLengthFt(e.target.value)}
                />
              </div>
              <div className="cut-fill-actions">
                <button
                  type="button"
                  className="cut-fill-btn"
                  disabled={!scaleEdgeLengthFt || Number(scaleEdgeLengthFt) <= 0}
                  onClick={applyScale}
                >
                  Apply scale
                </button>
              </div>
            </section>
          )}

          {step === 'boundary' && canProceedFromBoundary && (
            <section className="cut-fill-panel">
              <p className="cut-fill-meta">
                {calculateBoundaryAreaSqFt(boundary, ftPerPixel!).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{' '}
                sq ft · {boundary.length} corners
              </p>
              <div className="cut-fill-actions">
                <button type="button" className="cut-fill-btn" onClick={goNext}>
                  Continue to corner elevations
                </button>
              </div>
            </section>
          )}

          {step === 'corners' && (
            <section className="cut-fill-panel">
              <h2>Corner elevations</h2>
              <p className="cut-fill-hint">
                Enter the elevation in feet at each corner directly on the map.
              </p>
              <div className="cut-fill-actions">
                <button type="button" className="cut-fill-btn" onClick={goNext}>
                  Continue to contours
                </button>
              </div>
            </section>
          )}

          {step === 'contours' && (
            <section className="cut-fill-panel">
              <h2>Contour lines</h2>
              <div className="cut-fill-field-row">
                <label htmlFor="contour-elev">Line elevation (ft)</label>
                <input
                  id="contour-elev"
                  type="number"
                  step={0.1}
                  value={draftContourElev}
                  onChange={(e) => setDraftContourElev(e.target.value)}
                />
              </div>
              <p className="cut-fill-meta">
                {draftContourPoints.length} points in current line · {contours.length} lines drawn
              </p>
              <div className="cut-fill-actions">
                <button
                  type="button"
                  className="cut-fill-btn cut-fill-btn-secondary"
                  disabled={draftContourPoints.length < 2}
                  onClick={finishContour}
                >
                  Finish contour line
                </button>
                <button
                  type="button"
                  className="cut-fill-btn cut-fill-btn-secondary"
                  disabled={draftContourPoints.length === 0}
                  onClick={() => setDraftContourPoints([])}
                >
                  Clear current line
                </button>
                <button
                  type="button"
                  className="cut-fill-btn"
                  disabled={contours.length === 0 && draftContourPoints.length < 2}
                  onClick={() => {
                    if (draftContourPoints.length >= 2) finishContour();
                    goNext();
                  }}
                >
                  Generate 3D terrain
                </button>
              </div>
              {contours.length > 0 && (
                <ul className="cut-fill-contour-list">
                  {contours.map((c) => (
                    <li key={c.id}>
                      {c.elevationFt.toFixed(1)}′ — {c.points.length} pts
                      <button
                        type="button"
                        className="cut-fill-link-btn"
                        onClick={() => setContours((prev) => prev.filter((x) => x.id !== c.id))}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {(step === 'terrain' || step === 'cutfill') && tinData && (
            <section className="cut-fill-panel">
              <h2>3D view</h2>
              <div className="cut-fill-field-row cut-fill-field-row-slider">
                <label htmlFor="z-scale">Elevation scale ({zScaleMultiplier}x)</label>
                <input
                  id="z-scale"
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={zScaleMultiplier}
                  onChange={(e) => setZScaleMultiplier(Number(e.target.value))}
                />
              </div>
              <p className="cut-fill-hint">Scroll on the map to zoom. Drag to orbit.</p>
              <ul className="cut-fill-legend">
                <li className="cut-fill-legend-existing">Brown = terrain surface</li>
                <li className="cut-fill-legend-boundary">Blue line = property boundary</li>
                <li className="cut-fill-legend-contour">Green line = contour lines</li>
              </ul>
            </section>
          )}

          {(step === 'terrain' || step === 'cutfill') && tinData && (
            <section className="cut-fill-panel">
              <h2>Surface</h2>
              <p className="cut-fill-meta">
                {tinData.triangles.length} triangles · {tinData.points.length} elevation points
              </p>
              {step === 'terrain' && (
                <div className="cut-fill-actions">
                  <button type="button" className="cut-fill-btn" onClick={goNext}>
                    Continue to cut / fill
                  </button>
                </div>
              )}
            </section>
          )}

          {step === 'cutfill' && tinData && (
            <section className="cut-fill-panel">
              <h2>Target grade</h2>
              <div className="cut-fill-field-row">
                <label htmlFor="target-elev">Finished elevation (ft)</label>
                <input
                  id="target-elev"
                  type="number"
                  step={0.1}
                  value={targetElevationFt}
                  onChange={(e) => setTargetElevationFt(Number(e.target.value) || 0)}
                />
              </div>
              <div className="cut-fill-totals">
                <div className="cut-fill-total cut-fill-total-cut">
                  <span>Cut</span>
                  <strong>{formatCuYd(tinData.totals.cutCuYd)} cu yd</strong>
                </div>
                <div className="cut-fill-total cut-fill-total-fill">
                  <span>Fill</span>
                  <strong>{formatCuYd(tinData.totals.fillCuYd)} cu yd</strong>
                </div>
                <div className="cut-fill-total">
                  <span>Net</span>
                  <strong>{formatCuYd(tinData.totals.netCuYd)} cu yd</strong>
                </div>
              </div>
              <ul className="cut-fill-legend">
                <li className="cut-fill-legend-cut">Red = cut</li>
                <li className="cut-fill-legend-fill">Blue = fill</li>
              </ul>
            </section>
          )}
        </aside>

        <div className="cut-fill-main">
          <section className="cut-fill-panel cut-fill-map-panel">
            <h2>
              {step === 'upload' ? 'Upload' : step === 'terrain' ? '3D terrain' : step === 'cutfill' ? 'Cut / fill plan' : 'Map'}
            </h2>
            <div className="cut-fill-interactive-wrap">
              {needsImageBackground && !imageUrl ? (
                <div className="cut-fill-upload-area">
                  <ImageUploader onFileUpload={handleImageUpload} />
                  {boundary.length > 0 ? (
                    <p className="cut-fill-hint cut-fill-upload-hint">
                      Re-upload your property image to continue editing on the map. Your saved points are kept.
                    </p>
                  ) : null}
                </div>
              ) : (
                <CutFillMapCanvas
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

export default CutFillCalculator;
