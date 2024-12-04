import React, { useState } from 'react';
import './LendingCosts.scss';

interface FinancingCostCalculatorProps {}

const FinancingCostCalculator: React.FC<FinancingCostCalculatorProps> = () => {
  const [loanType, setLoanType] = useState<string>('hardMoney');
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(7.75);
  const [loanTerm, setLoanTerm] = useState<number>(25);

  const calculateMonthlyPayment = () => {
    let monthlyPayment = 0;
    if (loanType === 'hardMoney') {
      monthlyPayment = (loanAmount * (interestRate / 100) / 12) * Math.pow(1 + (interestRate / 100) / 12, loanTerm * 12) / (Math.pow(1 + (interestRate / 100) / 12, loanTerm * 12) - 1);
    } else if (loanType === 'shortTerm') {
      // Calculate short-term loan monthly payment
      monthlyPayment = (loanAmount * (interestRate / 100) / 12) * Math.pow(1 + (interestRate / 100) / 12, loanTerm * 12) / (Math.pow(1 + (interestRate / 100) / 12, loanTerm * 12) - 1);
    } else if (loanType === 'conventional') {
      // Calculate conventional loan monthly payment
      const monthlyInterestRate = interestRate / 100 / 12;
      monthlyPayment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm * 12));
    } else if (loanType === 'construction') {
      // Calculate construction loan monthly payment
      const monthlyInterestRate = interestRate / 100 / 12;
      monthlyPayment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm * 12));
    } else if (loanType === 'constructionToLong') {
      // Calculate construction-to-long-term loan monthly payment
      const monthlyInterestRate = interestRate / 100 / 12;
      monthlyPayment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm * 12));
    }
    return monthlyPayment.toFixed(2);
  };

  return (
    <div className="financing-cost-calculator">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Financing Cost Calculator</h2>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label htmlFor="loan-type" className="form-label">
              Loan Type
            </label>
            <select
              id="loan-type"
              className="form-control"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
            >
              <option value="hardMoney">Hard Money Loan</option>
              <option value="shortTerm">Short-Term Financing</option>
              <option value="conventional">Conventional Loan</option>
              <option value="construction">Construction Loan</option>
              <option value="constructionToLong">Construction to Long-Term</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="loan-amount" className="form-label">
              Loan Amount
            </label>
            <input
              id="loan-amount"
              className="form-control"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
              placeholder="Enter loan amount"
            />
          </div>
          <div className="form-group">
            <label htmlFor="interest-rate" className="form-label">
              Interest Rate (%)
            </label>
            <input
              id="interest-rate"
              className="form-control"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              placeholder="Enter interest rate"
            />
          </div>
          <div className="form-group">
            <label htmlFor="loan-term" className="form-label">
              Loan Term (years)
            </label>
            <input
              id="loan-term"
              className="form-control"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(parseFloat(e.target.value))}
              placeholder="Enter loan term"
            />
          </div>
          <div className="form-group">
            <p className="estimated-payment">
              Estimated Monthly Payment: ${calculateMonthlyPayment()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancingCostCalculator;