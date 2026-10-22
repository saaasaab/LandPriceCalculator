import { roundAndLocalString } from './utils';
import type { PricePerDoorInputs } from './pricePerDoorCalculations';
import type { PricePerSqftInputs } from './pricePerSqftCalculations';
import type { PricePerKeyInputs } from './pricePerKeyCalculations';

export const INCOME_MODE_GROSS = 'gross';
export const INCOME_MODE_NOI = 'noi';

export type IncomeMode = typeof INCOME_MODE_GROSS | typeof INCOME_MODE_NOI;

export const NOI_HIDDEN_VARIABLE_IDS = [
  'rents',
  'units',
  'expensePercentage',
  'annualLeaseRatesPerSQFT',
  'leasableSQFT',
  'adr',
  'rooms',
  'vacancy',
] as const;

export function isNoiMode(value: string | undefined | null): boolean {
  return String(value ?? '').trim().toLowerCase() === INCOME_MODE_NOI;
}

export type IncomeSimulationVariable = {
  id: string;
  label: string;
  isPercent?: boolean;
};

export function incomeVariablesForMode(
  variables: IncomeSimulationVariable[],
  noiMode: boolean
): IncomeSimulationVariable[] {
  if (!noiMode) {
    return variables;
  }
  return [
    { id: 'annualNoi', label: 'Annual NOI ($)' },
    ...variables.filter((variable) => (
      !NOI_HIDDEN_VARIABLE_IDS.includes(variable.id as typeof NOI_HIDDEN_VARIABLE_IDS[number])
    )),
  ];
}

export function formatAnnualNoi(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0';
  }
  return roundAndLocalString(Math.round(value));
}

export function annualNoiFromMonthlyRent(
  rents: number,
  units: number,
  expensePercentage: number
): number {
  return rents * units * 12 * (1 - expensePercentage / 100);
}

export function annualNoiFromAnnualLease(
  annualLeaseRatesPerSQFT: number,
  leasableSQFT: number,
  expensePercentage: number
): number {
  return annualLeaseRatesPerSQFT * leasableSQFT * (1 - expensePercentage / 100);
}

export function annualNoiFromHotel(
  adr: number,
  rooms: number,
  vacancy: number,
  expensePercentage: number
): number {
  const occupancyRate = 1 - vacancy / 100;
  const monthlyPotentialRevenue = adr * (365 / 12);
  const effectiveGrossIncome = monthlyPotentialRevenue * occupancyRate;
  const operatingIncome = effectiveGrossIncome * (1 - expensePercentage / 100);
  return operatingIncome * 12 * rooms;
}

export function applyNoiToPricePerDoor(
  inputs: PricePerDoorInputs,
  annualNoi: number
): PricePerDoorInputs {
  return {
    ...inputs,
    rents: annualNoi / 12,
    units: 1,
    expensePercentage: 0,
  };
}

export function applyNoiToPricePerSqft(
  inputs: PricePerSqftInputs,
  annualNoi: number
): PricePerSqftInputs {
  return {
    ...inputs,
    annualLeaseRatesPerSQFT: annualNoi,
    leasableSQFT: 1,
    expensePercentage: 0,
  };
}

export function applyNoiToPricePerKey(
  inputs: PricePerKeyInputs,
  annualNoi: number
): PricePerKeyInputs {
  return {
    ...inputs,
    adr: annualNoi / 365,
    rooms: 1,
    vacancy: 0,
    expensePercentage: 0,
  };
}
