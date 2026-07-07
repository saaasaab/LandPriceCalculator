import { useEffect, useRef } from 'react';

type TopoScalePanelProps = {
  scaleEdgeIndex: number;
  scaleEdgePixelLength: number;
  scaleEdgeLengthFt: string;
  onScaleEdgeLengthFtChange: (value: string) => void;
  onApplyScale: () => void;
  inputId?: string;
  focusTrigger?: string | number | null;
};

const TopoScalePanel = ({
  scaleEdgeIndex,
  scaleEdgePixelLength,
  scaleEdgeLengthFt,
  onScaleEdgeLengthFtChange,
  onApplyScale,
  inputId = 'topo-scale-length',
  focusTrigger,
}: TopoScalePanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      input.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [scaleEdgeIndex, focusTrigger]);

  const canApply = scaleEdgeLengthFt !== '' && Number(scaleEdgeLengthFt) > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canApply) {
      e.preventDefault();
      onApplyScale();
    }
  };

  return (
  <section className="topo-workflow-panel">
    <h2>Set scale</h2>
    <p className="topo-workflow-hint">
      Edge {scaleEdgeIndex + 1} is {scaleEdgePixelLength.toFixed(0)} px on the image. Click another edge on
      the map to change selection.
    </p>
    <div className="topo-workflow-field-row">
      <label htmlFor={inputId}>Real length (ft)</label>
      <input
        ref={inputRef}
        id={inputId}
        type="number"
        min={1}
        value={scaleEdgeLengthFt}
        onChange={(e) => onScaleEdgeLengthFtChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
    <div className="topo-workflow-actions">
      <button
        type="button"
        className="topo-workflow-btn"
        disabled={!canApply}
        onClick={onApplyScale}
      >
        Apply scale
      </button>
    </div>
  </section>
  );
};

export default TopoScalePanel;
