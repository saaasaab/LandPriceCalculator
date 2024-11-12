export function XIRR(cashFlows: number[], dates: string[]): number {
    let newRate=0;

    if (cashFlows.length !== dates.length) {
      throw new Error('Cash flows and dates must have the same length');
    }
  
    // Helper function to calculate the NPV for a given rate
    function calculateNPV(rate: number): number {
      let npv = 0;
      for (let i = 0; i < cashFlows.length; i++) {
        const days = (new Date(dates[i]).getTime() - new Date(dates[0]).getTime()) / (1000 * 60 * 60 * 24); // Calculate the number of days from the first date
        npv += cashFlows[i] / Math.pow(1 + rate, days / 365); // Discount the cash flow
      }
      return npv;
    }
  
    // Initial guess for the IRR
    let rate = 0.1; // Start with 10%
  
    // Tolerance and maximum iterations for the numerical solution
    const tolerance = 0.000001;
    const maxIterations = 1000;
  
    // Newton-Raphson iteration to find the rate that zeros out the NPV
    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(rate);
      
      const npvDerivative = (calculateNPV(rate + tolerance) - npv) / tolerance; // Approximate the derivative
      
      // Update the rate using Newton-Raphson method
      newRate = rate - npv / npvDerivative;
      
      // If the rate change is small enough, break the loop
      if (Math.abs(newRate - rate) < tolerance) {

        return newRate;
      }
      rate = newRate;
    }
  
    return 0;
    // throw new Error('XIRR calculation did not converge');
  }
