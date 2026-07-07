type TopoBoundarySummaryProps = {
  areaSqFt: number;
  cornerCount: number;
  continueLabel?: string;
  onContinue?: () => void;
};

const TopoBoundarySummary = ({
  areaSqFt,
  cornerCount,
  continueLabel,
  onContinue,
}: TopoBoundarySummaryProps) => (
  <section className="topo-workflow-panel">
    <p className="topo-workflow-meta">
      {areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft · {cornerCount} corners
    </p>
    {continueLabel && onContinue ? (
      <div className="topo-workflow-actions">
        <button type="button" className="topo-workflow-btn" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    ) : null}
  </section>
);

export default TopoBoundarySummary;
