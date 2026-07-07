import type { TopoWorkflowStepConfig } from '../../utils/topoWorkflow';

type TopoStepNavProps<T extends string> = {
  title?: string;
  steps: TopoWorkflowStepConfig<T>[];
  activeStep: T;
  canReachStep: (step: T) => boolean;
  onStepChange: (step: T) => void;
  hint?: string;
};

function TopoStepNav<T extends string>({
  title = 'Workflow',
  steps,
  activeStep,
  canReachStep,
  onStepChange,
  hint,
}: TopoStepNavProps<T>) {
  return (
    <section className="topo-workflow-panel">
      <h2>{title}</h2>
      <ol className="topo-workflow-steps">
        {steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              className={`topo-workflow-step-btn ${activeStep === step.id ? 'is-active' : ''} ${canReachStep(step.id) ? '' : 'is-disabled'}`}
              onClick={() => onStepChange(step.id)}
              disabled={!canReachStep(step.id)}
            >
              {step.label}
            </button>
          </li>
        ))}
      </ol>
      {hint ? <p className="topo-workflow-hint">{hint}</p> : null}
    </section>
  );
}

export default TopoStepNav;
