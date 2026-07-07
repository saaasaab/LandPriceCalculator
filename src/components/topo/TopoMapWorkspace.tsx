import type { ReactNode } from 'react';
import ImageUploader from '../../pages/SiteplanDesigner/ImageUploader';
import CutFillMapCanvas from '../../pages/CutFillCalculator/CutFillMapCanvas';
import type { BoundaryPoint } from '../../utils/siteMapCalculations';
import { mapToBoundaryCanvasStep } from '../../utils/topoWorkflow';

type TopoMapWorkspaceProps = {
  imageUrl: string | null;
  step: string;
  boundary: BoundaryPoint[];
  boundaryClosed: boolean;
  ftPerPixel: number | null;
  scaleMode: boolean;
  scaleEdgeIndex: number | null;
  onImageUpload: (url: string) => void;
  onBoundaryChange: (points: BoundaryPoint[], closed: boolean) => void;
  onScaleEdgeSelect: (index: number | null) => void;
  mapTitle?: string;
  showUploadWhenEmpty?: boolean;
  restoredBoundaryHint?: boolean;
};

const TopoMapWorkspace = ({
  imageUrl,
  step,
  boundary,
  boundaryClosed,
  ftPerPixel,
  scaleMode,
  scaleEdgeIndex,
  onImageUpload,
  onBoundaryChange,
  onScaleEdgeSelect,
  mapTitle = 'Map',
  showUploadWhenEmpty = true,
  restoredBoundaryHint = false,
}: TopoMapWorkspaceProps) => {
  const canvasStep = mapToBoundaryCanvasStep(step);
  const needsImageBackground =
    step === 'upload' ||
    step === 'boundary' ||
    step === 'scale' ||
    step === 'place-road' ||
    step === 'reposition-road';

  let mainContent: ReactNode;

  if (needsImageBackground && !imageUrl && showUploadWhenEmpty) {
    mainContent = (
      <div className="topo-workflow-upload-area">
        <ImageUploader onFileUpload={onImageUpload} />
        {restoredBoundaryHint && boundary.length > 0 ? (
          <p className="topo-workflow-hint topo-workflow-upload-hint">
            Re-upload your property image to continue editing on the map. Your saved points are kept.
          </p>
        ) : null}
      </div>
    );
  } else {
    mainContent = (
      <CutFillMapCanvas
        imageUrl={imageUrl}
        step={canvasStep}
        boundary={boundary}
        boundaryClosed={boundaryClosed}
        corners={[]}
        contours={[]}
        ftPerPixel={ftPerPixel}
        scaleMode={scaleMode}
        selectedScaleEdge={scaleEdgeIndex}
        draftContourPoints={[]}
        targetElevationFt={100}
        zScaleMultiplier={1}
        onBoundaryChange={onBoundaryChange}
        onScaleEdgeSelect={onScaleEdgeSelect}
        onDraftContourChange={() => {}}
        onCornerElevChange={() => {}}
      />
    );
  }

  return (
    <section className="topo-workflow-panel topo-workflow-map-panel">
      <h2>{step === 'upload' ? 'Upload' : mapTitle}</h2>
      <div className="topo-workflow-interactive-wrap">{mainContent}</div>
    </section>
  );
};

export default TopoMapWorkspace;
