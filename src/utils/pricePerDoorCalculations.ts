export type PricePerDoorInputs = {
  rents: number;
  units: number;
  interestRate: number;
  numberOfYears: number;
  downPayment: number;
  expensePercentage: number;
  cashOnCashReturn: number;
  buyersAgentFee: number;
  clostingCostsFee: number;
};

export type PricePerDoorOutputs = {
  pricePerUnit: number;
  operatingIncome: number;
  mortgagePayment: number;
  cashFlowPerUnit: number;
  dscr: number;
  grossRentMultiplier: number;
  capRate: number;
  totalPrice: number;
  offerPrice: number;
};

export function calculatePricePerDoor(inputs: PricePerDoorInputs): PricePerDoorOutputs {
  const cashOnCashReturnMonthly = inputs.cashOnCashReturn / 100 / 12;
  const interestRateMonthly = (inputs.interestRate || 0.0000001) / 100 / 12;
  const numberOfPayments = inputs.numberOfYears * 12;
  const mortTop = interestRateMonthly * Math.pow(1 + interestRateMonthly, numberOfPayments);
  const mortBottom = Math.pow(1 + interestRateMonthly, numberOfPayments) - 1;
  const mort = mortTop / mortBottom;

  const pricePerUnit =
    (inputs.rents * (1 - inputs.expensePercentage / 100)) /
    ((inputs.downPayment / 100) * cashOnCashReturnMonthly + (1 - inputs.downPayment / 100) * mort);

  const operatingIncome = inputs.rents * (1 - inputs.expensePercentage / 100);
  const mortgagePayment = mort * pricePerUnit * (1 - inputs.downPayment / 100);
  const cashFlowPerUnit = operatingIncome - mortgagePayment;
  const dscr = operatingIncome / (mort * pricePerUnit * (1 - inputs.downPayment / 100));
  const capRate = (operatingIncome * 12) / pricePerUnit;
  const totalPrice = inputs.units * pricePerUnit;
  const totalBuyersAgentFee = (inputs.buyersAgentFee / 100) * totalPrice;
  const totalClosingCosts = (inputs.clostingCostsFee / 100) * totalPrice;
  const offerPrice = totalPrice - totalBuyersAgentFee - totalClosingCosts;
  const grossRentMultiplier = offerPrice / (12 * inputs.rents * inputs.units);

  return {
    pricePerUnit,
    operatingIncome,
    mortgagePayment,
    cashFlowPerUnit,
    dscr,
    grossRentMultiplier,
    capRate,
    totalPrice,
    offerPrice,
  };
}
