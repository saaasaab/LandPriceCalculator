export const debtServiceCoverageRatio = (operatingIncome: number, mort: number, pricePerSQFT: number, downAsDecimal: number) => operatingIncome / (mort * pricePerSQFT * (1 - downAsDecimal));

export const capitilizationRate = (monthlyNOI: number, valuation: number)=>monthlyNOI* 12 / valuation;
