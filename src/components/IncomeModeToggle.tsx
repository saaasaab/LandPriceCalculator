import { INCOME_MODE_GROSS, INCOME_MODE_NOI, type IncomeMode } from '../utils/incomeMode';
import './IncomeModeToggle.scss';

type IncomeModeToggleProps = {
  value: string;
  onChange: (mode: IncomeMode) => void;
};

const IncomeModeToggle = ({ value, onChange }: IncomeModeToggleProps) => {
  const noiSelected = value === INCOME_MODE_NOI;

  return (
    <div className="income-mode-toggle" role="group" aria-label="Income basis">
      <button
        type="button"
        className={noiSelected ? undefined : 'is-active'}
        aria-pressed={!noiSelected}
        onClick={() => onChange(INCOME_MODE_GROSS)}
      >
        Gross revenue with expenses
      </button>
      <button
        type="button"
        className={noiSelected ? 'is-active' : undefined}
        aria-pressed={noiSelected}
        onClick={() => onChange(INCOME_MODE_NOI)}
      >
        Annual NOI
      </button>
    </div>
  );
};

export default IncomeModeToggle;
