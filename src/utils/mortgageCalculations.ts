export type MortgageCalculatorLevel = "beginner" | "medium" | "advanced";

export const MORTGAGE_CALCULATOR_LEVELS: {
  value: MortgageCalculatorLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Core loan inputs and your estimated monthly payment.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Adds taxes, insurance, HOA, mortgage insurance, closing costs, and interest totals.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Full detail including extra payments and balloon options.",
  },
];

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPrincipal: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface MortgageInputs {
  homePrice: number;
  downPaymentPercent: number;
  annualInterestRate: number;
  termYears: number;
  extraMonthlyPayment: number;
  balloonMonth: number | null;
}

export interface MortgageCosts {
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
}

export function calculateLoanAmount(homePrice: number, downPaymentPercent: number): number {
  return homePrice * (1 - downPaymentPercent / 100);
}

export function calculateDownPaymentAmount(homePrice: number, downPaymentPercent: number): number {
  return homePrice * (downPaymentPercent / 100);
}

export function calculateMonthlyPI(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
): number {
  if (loanAmount <= 0 || termMonths <= 0) return 0;
  if (annualRate <= 0) return loanAmount / termMonths;

  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

export function calculateMonthlyCosts(
  homePrice: number,
  loanAmount: number,
  downPaymentPercent: number,
  propertyTaxPercent: number,
  insurancePercent: number,
  pmiRatePercent: number,
  monthlyHoa: number,
): MortgageCosts {
  const monthlyPropertyTax = (homePrice * (propertyTaxPercent / 100)) / 12;
  const monthlyInsurance = (homePrice * (insurancePercent / 100)) / 12;
  const monthlyPmi =
    downPaymentPercent < 20
      ? (loanAmount * (pmiRatePercent / 100)) / 12
      : 0;

  return {
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPmi,
    monthlyHoa,
  };
}

export function buildAmortizationSchedule(inputs: MortgageInputs): AmortizationRow[] {
  const termMonths = Math.max(1, Math.round(inputs.termYears * 12));
  const loanAmount = calculateLoanAmount(inputs.homePrice, inputs.downPaymentPercent);
  const monthlyPI = calculateMonthlyPI(loanAmount, inputs.annualInterestRate, termMonths);
  const monthlyRate = inputs.annualInterestRate / 100 / 12;

  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  schedule.push({
    month: 0,
    payment: 0,
    principal: 0,
    interest: 0,
    extraPrincipal: 0,
    remainingBalance: balance,
    cumulativeInterest: 0,
    cumulativePrincipal: 0,
  });

  for (let month = 1; month <= termMonths && balance > 0.005; month += 1) {
    const interest = balance * monthlyRate;
    let principalPortion = monthlyPI - interest;
    let extraPrincipal = inputs.extraMonthlyPayment;

    if (principalPortion < 0) principalPortion = 0;

    const totalPrincipal = principalPortion + extraPrincipal;
    if (totalPrincipal > balance) {
      extraPrincipal = Math.max(0, balance - principalPortion);
      principalPortion = Math.min(principalPortion, balance);
    }

    const principalPaid = principalPortion + extraPrincipal;
    balance -= principalPaid;
    cumulativeInterest += interest;
    cumulativePrincipal += principalPaid;

    schedule.push({
      month,
      payment: monthlyPI + extraPrincipal,
      principal: principalPaid,
      interest,
      extraPrincipal,
      remainingBalance: Math.max(0, balance),
      cumulativeInterest,
      cumulativePrincipal,
    });

    if (inputs.balloonMonth !== null && month >= inputs.balloonMonth) {
      break;
    }

    if (balance <= 0.005) break;
  }

  return schedule;
}

export function getAmortizationAtMonth(
  schedule: AmortizationRow[],
  month: number,
): AmortizationRow {
  const clampedMonth = Math.max(0, Math.min(month, schedule[schedule.length - 1]?.month ?? 0));
  return schedule.find((row) => row.month === clampedMonth) ?? schedule[0];
}

export function formatLoanMonth(month: number): string {
  if (month === 0) return "Closing";
  const years = Math.floor(month / 12);
  const months = month % 12;
  if (years === 0) return `Month ${month}`;
  if (months === 0) return `Year ${years}`;
  return `Year ${years}, Month ${months}`;
}
