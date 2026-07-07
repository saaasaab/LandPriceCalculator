import { useCallback, useEffect, useRef, useState } from 'react';
import {
  boundaryEdgeLength,
  computeFtPerPixel,
  type BoundaryPoint,
} from '../utils/siteMapCalculations';
import {
  canProceedFromBoundary,
  canReachTopoBaseStep,
  isScaleDefined,
  type TopoBaseStep,
  type TopoDigitizationSnapshot,
} from '../utils/topoWorkflow';

type UseTopoDigitizationOptions<TStep extends string> = {
  initialStep: TStep;
  loadSnapshot: () => TopoDigitizationSnapshot<TStep> | null;
  saveSnapshot: (snapshot: TopoDigitizationSnapshot<TStep>) => void;
  onRestored?: (savedAt: string) => void;
  autoSave?: boolean;
};

export function useTopoDigitization<TStep extends string>({
  initialStep,
  loadSnapshot,
  saveSnapshot,
  onRestored,
  autoSave = false,
}: UseTopoDigitizationOptions<TStep>) {
  const [step, setStep] = useState<TStep>(initialStep);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [boundary, setBoundary] = useState<BoundaryPoint[]>([]);
  const [boundaryClosed, setBoundaryClosed] = useState(false);
  const [ftPerPixel, setFtPerPixel] = useState<number | null>(null);
  const [scaleEdgeIndex, setScaleEdgeIndex] = useState<number | null>(null);
  const [scaleEdgeLengthFt, setScaleEdgeLengthFt] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const loadSnapshotRef = useRef(loadSnapshot);
  const saveSnapshotRef = useRef(saveSnapshot);
  const onRestoredRef = useRef(onRestored);
  loadSnapshotRef.current = loadSnapshot;
  saveSnapshotRef.current = saveSnapshot;
  onRestoredRef.current = onRestored;

  useEffect(() => {
    if (hydratedRef.current) return;

    const saved = loadSnapshotRef.current();
    if (!saved) {
      hydratedRef.current = true;
      return;
    }

    setStep(saved.step === ('upload' as TStep) ? ('boundary' as TStep) : saved.step);
    setBoundary(saved.boundary);
    setBoundaryClosed(saved.boundaryClosed);
    setFtPerPixel(saved.ftPerPixel);
    onRestoredRef.current?.(new Date().toISOString());
    setSaveStatus(
      'Restored saved progress. Re-upload your image to see the map background.',
    );
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!autoSave || !hydratedRef.current) return;
    if (step === ('upload' as TStep) && boundary.length === 0) return;

    const timer = window.setTimeout(() => {
      saveSnapshotRef.current({
        step,
        boundary,
        boundaryClosed,
        ftPerPixel,
      });
      setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [autoSave, step, boundary, boundaryClosed, ftPerPixel]);

  const scaleDefined = isScaleDefined(ftPerPixel);
  const scaleMode = boundaryClosed && !scaleDefined;
  const boundaryReady = canProceedFromBoundary(boundary, boundaryClosed, ftPerPixel);

  const handleImageUpload = useCallback((url: string) => {
    setImageUrl(url);
    setBoundary([]);
    setBoundaryClosed(false);
    setFtPerPixel(null);
    setScaleEdgeIndex(null);
    setScaleEdgeLengthFt('');
    setStep('boundary' as TStep);
  }, []);

  const handleBoundaryChange = useCallback((next: BoundaryPoint[], closed: boolean) => {
    setBoundary(next);
    setBoundaryClosed(closed);
  }, []);

  const applyScale = useCallback(() => {
    if (scaleEdgeIndex === null) return;
    const length = Number(scaleEdgeLengthFt);
    if (!length || length <= 0) return;
    const ratio = computeFtPerPixel(boundary, scaleEdgeIndex, length);
    if (ratio > 0) {
      setFtPerPixel(ratio);
      setScaleEdgeIndex(null);
      setScaleEdgeLengthFt('');
    }
  }, [boundary, scaleEdgeIndex, scaleEdgeLengthFt]);

  const canReachBaseStep = useCallback(
    (target: TopoBaseStep) =>
      canReachTopoBaseStep(target, imageUrl, boundaryReady),
    [imageUrl, boundaryReady],
  );

  const goToBaseStep = useCallback(
    (target: TStep, requires: TopoBaseStep) => {
      if (canReachTopoBaseStep(requires, imageUrl, boundaryReady)) {
        setStep(target);
      }
    },
    [imageUrl, boundaryReady],
  );

  const saveNow = useCallback(() => {
    saveSnapshotRef.current({ step, boundary, boundaryClosed, ftPerPixel });
    setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
  }, [step, boundary, boundaryClosed, ftPerPixel]);

  const resetDigitization = useCallback(() => {
    setStep(initialStep);
    setImageUrl(null);
    setBoundary([]);
    setBoundaryClosed(false);
    setFtPerPixel(null);
    setScaleEdgeIndex(null);
    setScaleEdgeLengthFt('');
  }, [initialStep]);

  return {
    step,
    setStep,
    imageUrl,
    boundary,
    boundaryClosed,
    ftPerPixel,
    scaleEdgeIndex,
    setScaleEdgeIndex,
    scaleEdgeLengthFt,
    setScaleEdgeLengthFt,
    scaleDefined,
    scaleMode,
    boundaryReady,
    saveStatus,
    setSaveStatus,
    handleImageUpload,
    handleBoundaryChange,
    applyScale,
    canReachBaseStep,
    goToBaseStep,
    saveNow,
    resetDigitization,
    scaleEdgePixelLength:
      scaleEdgeIndex !== null ? boundaryEdgeLength(boundary, scaleEdgeIndex) : null,
  };
}
