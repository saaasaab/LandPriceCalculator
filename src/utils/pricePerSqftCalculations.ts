export type PricePerSqftInputs = {
  annualLeaseRatesPerSQFT: number;
  leasableSQFT: number;
  interestRate: number;
  numberOfYears: number;
  downPayment: number;
  expensePercentage: number;
  cashOnCashReturn: number;
  buyersAgentFee: number;
  clostingCostsFee: number;
};

export type PricePerSqftOutputs = {
  pricePerSQFT: number;
  operatingIncome: number;
  mortgagePayment: number;
  cashFlowPerSQFT: number;
  annualCashFlowPerSQFT: number;
  dscr: number;
  capRate: number;
  totalPrice: number;
  offerPrice: number;
};

export function calculatePricePerSqft(inputs: PricePerSqftInputs): PricePerSqftOutputs {
  const monthlyLeaseRatesPerSQFT = inputs.annualLeaseRatesPerSQFT / 12;
  let interestRateMonthly = inputs.interestRate / 100 / 12;
  interestRateMonthly = interestRateMonthly === 0 ? 0.0000000000001 : interestRateMonthly;
  const cashOnCashReturnMonthly = inputs.cashOnCashReturn / 100 / 12;
  const numberOfPayments = inputs.numberOfYears * 12;
  const mortTop = interestRateMonthly * Math.pow(1 + interestRateMonthly, numberOfPayments);
  const mortBottom = Math.pow(1 + interestRateMonthly, numberOfPayments) - 1;
  const mort = mortTop / mortBottom;

  const operatingIncome = monthlyLeaseRatesPerSQFT * (1 - inputs.expensePercentage / 100);
  const downAsDecimal = inputs.downPayment / 100;
  const pricePerSQFT =
    operatingIncome / (downAsDecimal * cashOnCashReturnMonthly + (1 - downAsDecimal) * mort);
  const mortgagePayment = mort * pricePerSQFT * (1 - downAsDecimal);
  const cashFlowPerSQFT = operatingIncome - mortgagePayment;
  const dscr = operatingIncome / (mort * pricePerSQFT * (1 - downAsDecimal));
  const capRate = (operatingIncome * 12) / pricePerSQFT;
  const totalPrice = inputs.leasableSQFT * pricePerSQFT;
  const totalBuyersAgentFee = (inputs.buyersAgentFee / 100) * totalPrice;
  const totalClosingCosts = (inputs.clostingCostsFee / 100) * totalPrice;
  const offerPrice = totalPrice - totalBuyersAgentFee - totalClosingCosts;

  return {
    pricePerSQFT,
    operatingIncome,
    mortgagePayment,
    cashFlowPerSQFT,
    annualCashFlowPerSQFT: cashFlowPerSQFT * 12,
    dscr,
    capRate,
    totalPrice,
    offerPrice,
  };
}
