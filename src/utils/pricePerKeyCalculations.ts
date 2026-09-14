export type PricePerKeyInputs = {
  adr: number;
  rooms: number;
  interestRate: number;
  numberOfYears: number;
  downPayment: number;
  vacancy: number;
  expensePercentage: number;
  cashOnCashReturn: number;
  buyersAgentFee: number;
  clostingCostsFee: number;
};

export type PricePerKeyOutputs = {
  pricePerKey: number;
  revPAR: number;
  operatingIncome: number;
  mortgagePayment: number;
  cashFlowPerKey: number;
  dscr: number;
  roomRevenueMultiplier: number;
  capRate: number;
  totalPrice: number;
  offerPrice: number;
};

export function calculatePricePerKey(inputs: PricePerKeyInputs): PricePerKeyOutputs {
  const cashOnCashReturnMonthly = inputs.cashOnCashReturn / 100 / 12;
  const interestRateMonthly = (inputs.interestRate || 0.0000001) / 100 / 12;
  const numberOfPayments = inputs.numberOfYears * 12;
  const mortTop = interestRateMonthly * Math.pow(1 + interestRateMonthly, numberOfPayments);
  const mortBottom = Math.pow(1 + interestRateMonthly, numberOfPayments) - 1;
  const mort = mortTop / mortBottom;

  const occupancyRate = 1 - inputs.vacancy / 100;
  const monthlyPotentialRevenue = inputs.adr * (365 / 12);
  const effectiveGrossIncome = monthlyPotentialRevenue * occupancyRate;
  const operatingIncome = effectiveGrossIncome * (1 - inputs.expensePercentage / 100);
  const pricePerKey =
    operatingIncome /
    ((inputs.downPayment / 100) * cashOnCashReturnMonthly + (1 - inputs.downPayment / 100) * mort);

  const mortgagePayment = mort * pricePerKey * (1 - inputs.downPayment / 100);
  const cashFlowPerKey = operatingIncome - mortgagePayment;
  const dscr = operatingIncome / (mort * pricePerKey * (1 - inputs.downPayment / 100));
  const capRate = (operatingIncome * 12) / pricePerKey;
  const revPAR = inputs.adr * occupancyRate;
  const totalPrice = inputs.rooms * pricePerKey;
  const totalBuyersAgentFee = (inputs.buyersAgentFee / 100) * totalPrice;
  const totalClosingCosts = (inputs.clostingCostsFee / 100) * totalPrice;
  const offerPrice = totalPrice - totalBuyersAgentFee - totalClosingCosts;
  const roomRevenueMultiplier = offerPrice / (12 * effectiveGrossIncome * inputs.rooms);

  return {
    pricePerKey,
    revPAR,
    operatingIncome,
    mortgagePayment,
    cashFlowPerKey,
    dscr,
    roomRevenueMultiplier,
    capRate,
    totalPrice,
    offerPrice,
  };
}
