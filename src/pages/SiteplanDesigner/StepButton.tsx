
import './StepButton.scss';
interface StepButtonProps {
  label: string;
  onClick: () => void;
  status?: Status;
  isActive?: boolean;
  disabled?: boolean;
  children?: React.ReactNode
}
export type Status = 'not-started' | 'in-progress' | 'complete';
export enum EStatus {
  notStarted = "not-started",
  inProgress = "in-progress",
  complete = "complete",
}




export const StepButton: React.FC<StepButtonProps> = ({ label, onClick, status, isActive = false, disabled, children }) => {
  return (
    <div className="step-button">

      <div className="button-header">
        {status ?
          <div className={`status-indicator ${status}`}> </div> :
          <div className="big-ol-bag-of-nothing"></div>
          }

        <button onClick={onClick} className={`${isActive ? "is-active" : ""}`} disabled={disabled}>
          {label}
        </button>
      </div>

      {children ? children : <></>}
    </div>
  );
};
