import { usePersistedState2 } from './usePersistedState';
import { DEFAULT_VALUES } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import {
  INCOME_MODE_NOI,
  formatAnnualNoi,
  isNoiMode,
  type IncomeMode,
} from '../utils/incomeMode';
import { removeCommas } from '../utils/utils';

export function useIncomeMode(
  page: EPageNames,
  queryParams: URLSearchParams,
  derivedAnnualNoi: number
) {
  const defaults = DEFAULT_VALUES[page];
  const [incomeMode, setIncomeMode] = usePersistedState2(
    page,
    EAllStates.incomeMode,
    defaults.incomeMode,
    queryParams
  );
  const [annualNoi, setAnnualNoi] = usePersistedState2(
    page,
    EAllStates.noi,
    defaults.noi,
    queryParams
  );

  const noiMode = isNoiMode(incomeMode);

  const setMode = (next: IncomeMode) => {
    if (next === INCOME_MODE_NOI && removeCommas(annualNoi) <= 0 && derivedAnnualNoi > 0) {
      setAnnualNoi(formatAnnualNoi(derivedAnnualNoi));
    }
    setIncomeMode(next);
  };

  return {
    incomeMode,
    noiMode,
    annualNoi,
    setAnnualNoi,
    setMode,
  };
}
