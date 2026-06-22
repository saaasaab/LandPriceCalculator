import { useMemo } from "react";
import {
  AmortizationRow,
  formatLoanMonth,
  MortgageCalculatorLevel,
} from "../utils/mortgageCalculations";
import { roundAndLocalString } from "../utils/utils";
import "./MortgageAmortizationSlider.scss";

interface MortgageAmortizationSliderProps {
  schedule: AmortizationRow[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  downPaymentAmount: number;
  homePrice: number;
  balloonMonth: number | null;
  level?: MortgageCalculatorLevel;
}

const MortgageAmortizationSlider = ({
  schedule,
  selectedMonth,
  onMonthChange,
  downPaymentAmount,
  homePrice,
  balloonMonth,
  level = "advanced",
}: MortgageAmortizationSliderProps) => {
  const showMonthlyBreakdown =
    selectedMonth > 0 && (level === "medium" || level === "advanced");
  const showLtv = selectedMonth > 0 && level === "advanced";
  const maxMonth = schedule[schedule.length - 1]?.month ?? 0;
  const row = useMemo(
    () => schedule.find((entry) => entry.month === selectedMonth) ?? schedule[0],
    [schedule, selectedMonth],
  );

  const totalEquity = downPaymentAmount + row.cumulativePrincipal;
  const totalPaidToLender = row.cumulativeInterest + row.cumulativePrincipal;
  const barTotal = Math.max(homePrice, totalPaidToLender + row.remainingBalance, 1);

  const equityWidth = (totalEquity / barTotal) * 100;
  const interestWidth = (row.cumulativeInterest / barTotal) * 100;
  const remainingWidth = (row.remainingBalance / barTotal) * 100;

  return (
    <section className="mortgage-amortization">
      <div className="mortgage-amortization__header">
        <h3>Amortization Over Time</h3>
        <p>
          Drag the slider to see how much interest you have paid, equity you have built,
          and what remains on the loan at any point in the term.
        </p>
      </div>

      <div className="mortgage-amortization__slider-row">
        <div className="mortgage-amortization__slider-labels">
          <span>Closing</span>
          <span>
            {balloonMonth !== null
              ? `Balloon (Month ${balloonMonth})`
              : `End of Term (Month ${maxMonth})`}
          </span>
        </div>
        <input
          type="range"
          className="mortgage-amortization__slider"
          min={0}
          max={maxMonth}
          step={1}
          value={selectedMonth}
          onChange={(event) => onMonthChange(Number(event.target.value))}
        />
        <p className="mortgage-amortization__current-month">
          {formatLoanMonth(selectedMonth)}
        </p>
      </div>

      <div className="mortgage-amortization__bar">
        <div
          className="mortgage-amortization__bar-segment mortgage-amortization__bar-segment--equity"
          style={{ width: `${equityWidth}%` }}
        />
        <div
          className="mortgage-amortization__bar-segment mortgage-amortization__bar-segment--interest"
          style={{ width: `${interestWidth}%` }}
        />
        <div
          className="mortgage-amortization__bar-segment mortgage-amortization__bar-segment--remaining"
          style={{ width: `${remainingWidth}%` }}
        />
      </div>

      <div className="mortgage-amortization__bar-legend">
        <span className="legend-equity">Equity (down payment + principal)</span>
        <span className="legend-interest">Interest paid</span>
        <span className="legend-remaining">Remaining loan balance</span>
      </div>

      <div className="mortgage-amortization__stats">
        <div className="mortgage-amortization__stat">
          <h4>Interest Paid</h4>
          <p>${roundAndLocalString(row.cumulativeInterest)}</p>
        </div>
        <div className="mortgage-amortization__stat">
          <h4>Principal Paid</h4>
          <p>${roundAndLocalString(row.cumulativePrincipal)}</p>
        </div>
        <div className="mortgage-amortization__stat">
          <h4>Total Equity</h4>
          <p>${roundAndLocalString(totalEquity)}</p>
        </div>
        <div className="mortgage-amortization__stat">
          <h4>Remaining Balance</h4>
          <p>${roundAndLocalString(row.remainingBalance)}</p>
        </div>
        {showMonthlyBreakdown && (
          <>
            <div className="mortgage-amortization__stat">
              <h4>Monthly Payment</h4>
              <p>${roundAndLocalString(row.payment)}</p>
            </div>
            <div className="mortgage-amortization__stat">
              <h4>Interest This Month</h4>
              <p>${roundAndLocalString(row.interest)}</p>
            </div>
            <div className="mortgage-amortization__stat">
              <h4>Principal This Month</h4>
              <p>${roundAndLocalString(row.principal)}</p>
            </div>
            {showLtv && (
              <div className="mortgage-amortization__stat">
                <h4>Loan-to-Value</h4>
                <p>
                  {homePrice > 0
                    ? `${Math.round((row.remainingBalance / homePrice) * 1000) / 10}%`
                    : "—"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MortgageAmortizationSlider;
