type TopoSaveActionsProps = {
  saveStatus: string | null;
  onSave: () => void;
  onClear: () => void;
};

const TopoSaveActions = ({ saveStatus, onSave, onClear }: TopoSaveActionsProps) => (
  <>
    {saveStatus ? <p className="topo-workflow-meta">{saveStatus}</p> : null}
    <div className="topo-workflow-actions topo-workflow-save-actions">
      <button type="button" className="topo-workflow-btn topo-workflow-btn-secondary" onClick={onSave}>
        Save progress
      </button>
      <button type="button" className="topo-workflow-btn topo-workflow-btn-secondary" onClick={onClear}>
        Clear saved
      </button>
    </div>
  </>
);

export default TopoSaveActions;
