
import './StepButton.scss';
interface StepButtonProps {
    label: string;
    onClick: () => void;
    status?: Status;
    isActive?: boolean;
    children?: React.ReactNode
  }
  export type Status = 'not-started' | 'in-progress' | 'complete';
export enum EStatus {
  notStarted = "not-started",
  inProgress = "in-progress",
  complete = "complete",
}



  
export const StepButton: React.FC<StepButtonProps> = ({ label, onClick, status, isActive = false, children }) => {
  if(!status) console.log(`status`, status)
    // const getStatusIcon = () => {
    //   switch (status) {
    //     case EStatus.notStarted:
    //       return '⏳'; // Hourglass icon for "not started"
    //     case EStatus.inProgress:
    //       return '🔄'; // Spinning arrows icon for "in progress"
    //     case EStatus.complete:
    //       return '✅'; // Checkmark icon for "complete"
    //     default:
    //       return '';
    //   }
    // };
  
    return (
      <div className="step-button">

        {/* <span style={{ marginRight: '10px', fontSize: '20px' }}>{getStatusIcon()}</span> */}
        <button onClick={onClick} className={ `${isActive?"is-active":"" }`}>
          {label}
        </button>
  
        {children ? children : <></>}
      </div>
    );
  };
  