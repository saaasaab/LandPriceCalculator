import { useMemo, useState } from "react";
import { removeCommas, roundAndLocalString } from "../utils/utils";
import { usePersistedState2 } from "../hooks/usePersistedState";
import { EAllStates, EPageNames } from "../utils/types";
import { DEFAULT_VALUES } from "../utils/constants";
import ShareButton from "../components/ShareButton";
import InputRow from "../components/RowTypes/InputRow";
import OutputRow from "../components/RowTypes/OutputRow";
import MortgageAmortizationSlider from "../components/MortgageAmortizationSlider";
import { Checkbox } from "../components/ui";
import {
  buildAmortizationSchedule,
  calculateDownPaymentAmount,
  calculateLoanAmount,
  calculateMonthlyCosts,
  calculateMonthlyPI,
  MORTGAGE_CALCULATOR_LEVELS,
  MortgageCalculatorLevel,
} from "../utils/mortgageCalculations";

import "./DynamicTable.scss";
import "./HomeMortgageCalculator.scss";

const isAtLeastMedium = (level: MortgageCalculatorLevel) =>
  level === "medium" || level === "advanced";

const isAdvanced = (level: MortgageCalculatorLevel) => level === "advanced";

const HomeMortgageCalculator = ({
  isMobile,
  page,
}: {
  isMobile: boolean;
  page: EPageNames;
}) => {
  const queryParams = new URLSearchParams(window.location.search);

  const [homePrice, setHomePrice] = usePersistedState2(
    page,
    EAllStates.purchasePrice,
    DEFAULT_VALUES[page].purchasePrice,
    queryParams,
  );
  const [downPayment, setDownPayment] = usePersistedState2(
    page,
    EAllStates.downPayment,
    DEFAULT_VALUES[page].downPayment,
    queryParams,
  );
  const [interestRate, setInterestRate] = usePersistedState2(
    page,
    EAllStates.interestRate,
    DEFAULT_VALUES[page].interestRate,
    queryParams,
  );
  const [loanTermYears, setLoanTermYears] = usePersistedState2(
    page,
    EAllStates.duration,
    DEFAULT_VALUES[page].duration,
    queryParams,
  );
  const [propertyTax, setPropertyTax] = usePersistedState2(
    page,
    EAllStates.propertyTax,
    DEFAULT_VALUES[page].propertyTax,
    queryParams,
  );
  const [insurance, setInsurance] = usePersistedState2(
    page,
    EAllStates.insurance,
    DEFAULT_VALUES[page].insurance,
    queryParams,
  );
  const [pmiRate, setPmiRate] = usePersistedState2(
    page,
    EAllStates.pmiRate,
    DEFAULT_VALUES[page].pmiRate,
    queryParams,
  );
  const [hoaMonthly, setHoaMonthly] = usePersistedState2(
    page,
    EAllStates.hoaMonthly,
    DEFAULT_VALUES[page].hoaMonthly,
    queryParams,
  );
  const [extraMonthlyPayment, setExtraMonthlyPayment] = usePersistedState2(
    page,
    EAllStates.extraMonthlyPayment,
    DEFAULT_VALUES[page].extraMonthlyPayment,
    queryParams,
  );
  const [closingCosts, setClosingCosts] = usePersistedState2(
    page,
    EAllStates.closingCosts,
    DEFAULT_VALUES[page].closingCosts,
    queryParams,
  );
  const [enableBalloonPayment, setEnableBalloonPayment] = usePersistedState2(
    page,
    EAllStates.enableBalloonPayment,
    DEFAULT_VALUES[page].enableBalloonPayment,
    queryParams,
  );
  const [balloonMonth, setBalloonMonth] = usePersistedState2(
    page,
    EAllStates.balloonMonth,
    DEFAULT_VALUES[page].balloonMonth,
    queryParams,
  );
  const [calculatorLevel, setCalculatorLevel] = usePersistedState2(
    page,
    EAllStates.mortgageCalculatorLevel,
    DEFAULT_VALUES[page].mortgageCalculatorLevel,
    queryParams,
  );

  const [selectedMonth, setSelectedMonth] = useState(0);

  const level = (
    MORTGAGE_CALCULATOR_LEVELS.some((entry) => entry.value === calculatorLevel)
      ? calculatorLevel
      : "beginner"
  ) as MortgageCalculatorLevel;
  const levelMeta =
    MORTGAGE_CALCULATOR_LEVELS.find((entry) => entry.value === level) ??
    MORTGAGE_CALCULATOR_LEVELS[0];

  const homePriceNum = removeCommas(homePrice);
  const downPaymentPercent = removeCommas(downPayment);
  const interestRateNum = removeCommas(interestRate);
  const termYears = removeCommas(loanTermYears);
  const termMonths = Math.max(1, Math.round(termYears * 12));
  const propertyTaxPercent = removeCommas(propertyTax);
  const insurancePercent = removeCommas(insurance);
  const pmiRatePercent = removeCommas(pmiRate);
  const hoaMonthlyNum = removeCommas(hoaMonthly);
  const extraPaymentNum = removeCommas(extraMonthlyPayment);
  const closingCostsPercent = removeCommas(closingCosts);
  const balloonMonthNum = Math.min(
    Math.max(1, removeCommas(balloonMonth)),
    termMonths,
  );
  const balloonEnabled = Boolean(enableBalloonPayment);

  const loanAmount = calculateLoanAmount(homePriceNum, downPaymentPercent);
  const downPaymentAmount = calculateDownPaymentAmount(homePriceNum, downPaymentPercent);
  const monthlyPI = calculateMonthlyPI(loanAmount, interestRateNum, termMonths);

  const monthlyCosts = calculateMonthlyCosts(
    homePriceNum,
    loanAmount,
    downPaymentPercent,
    propertyTaxPercent,
    insurancePercent,
    pmiRatePercent,
    hoaMonthlyNum,
  );

  const totalMonthlyPayment =
    monthlyPI +
    monthlyCosts.monthlyPropertyTax +
    monthlyCosts.monthlyInsurance +
    monthlyCosts.monthlyPmi +
    monthlyCosts.monthlyHoa;

  const closingCostsAmount = homePriceNum * (closingCostsPercent / 100);
  const cashToClose = downPaymentAmount + closingCostsAmount;

  const schedule = useMemo(
    () =>
      buildAmortizationSchedule({
        homePrice: homePriceNum,
        downPaymentPercent,
        annualInterestRate: interestRateNum,
        termYears,
        extraMonthlyPayment: extraPaymentNum,
        balloonMonth: balloonEnabled ? balloonMonthNum : null,
      }),
    [
      homePriceNum,
      downPaymentPercent,
      interestRateNum,
      termYears,
      extraPaymentNum,
      balloonEnabled,
      balloonMonthNum,
    ],
  );

  const finalRow = schedule[schedule.length - 1];
  const totalInterest = finalRow?.cumulativeInterest ?? 0;
  const totalPrincipalPaid = finalRow?.cumulativePrincipal ?? 0;
  const payoffMonth = finalRow?.month ?? 0;
  const balloonBalance = balloonEnabled ? finalRow?.remainingBalance ?? 0 : null;

  const params = {
    purchasePrice: homePrice,
    downPayment,
    interestRate,
    duration: loanTermYears,
    propertyTax,
    insurance,
    pmiRate,
    hoaMonthly,
    extraMonthlyPayment,
    closingCosts,
    enableBalloonPayment: String(enableBalloonPayment),
    balloonMonth,
    mortgageCalculatorLevel: level,
  };

  return (
    <div className="group-section">
      <div className="calculator-level-bar">
        <div className="calculator-level-bar__copy">
          <h3>Calculator Mode</h3>
          <p>{levelMeta.description}</p>
        </div>
        <div className="calculator-level-bar__control">
          <label htmlFor="mortgage-calculator-level">Experience Level</label>
          <select
            id="mortgage-calculator-level"
            value={level}
            onChange={(event) =>
              setCalculatorLevel(event.target.value as MortgageCalculatorLevel)
            }
          >
            {MORTGAGE_CALCULATOR_LEVELS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-fields-container has-bottom-border">
        <h3 className="input-grouping">Loan Details</h3>

        <InputRow
          isMobile={isMobile}
          setInput={(value) => setHomePrice(value)}
          cellValues={["Home Price ($)", homePrice]}
          description="Purchase price of the home"
        />
        <InputRow
          isMobile={isMobile}
          setInput={(value) => setDownPayment(value)}
          cellValues={["Down Payment (%)", downPayment]}
          description="Percentage of the home price paid upfront"
          isPercent
        />
        <InputRow
          isMobile={isMobile}
          setInput={(value) => setInterestRate(value)}
          cellValues={["Interest Rate (%)", interestRate]}
          description="Annual interest rate on the mortgage"
          isPercent
        />
        <InputRow
          isMobile={isMobile}
          setInput={(value) => setLoanTermYears(value)}
          cellValues={["Loan Term (Years)", loanTermYears]}
          description="Length of the loan amortization schedule"
        />
        {isAdvanced(level) && (
          <InputRow
            isMobile={isMobile}
            setInput={(value) => setExtraMonthlyPayment(value)}
            cellValues={["Extra Monthly Payment ($)", extraMonthlyPayment]}
            description="Additional amount applied to principal each month"
          />
        )}
        {isAtLeastMedium(level) && (
          <InputRow
            isMobile={isMobile}
            setInput={(value) => setClosingCosts(value)}
            cellValues={["Closing Costs (%)", closingCosts]}
            description="Estimated closing costs as a percentage of home price"
            isPercent
          />
        )}

        {isAtLeastMedium(level) && (
          <>
            <h3 className="input-grouping">Monthly Costs</h3>

            <InputRow
              isMobile={isMobile}
              setInput={(value) => setPropertyTax(value)}
              cellValues={["Property Tax (%/yr)", propertyTax]}
              description="Annual property tax as a percentage of home value"
              isPercent
            />
            <InputRow
              isMobile={isMobile}
              setInput={(value) => setInsurance(value)}
              cellValues={["Home Insurance (%/yr)", insurance]}
              description="Annual homeowners insurance as a percentage of home value"
              isPercent
            />
            <InputRow
              isMobile={isMobile}
              setInput={(value) => setPmiRate(value)}
              cellValues={["Mortgage Insurance (%/yr)", pmiRate]}
              description="PMI rate when down payment is below 20%"
              isPercent
              isGreyedOut={downPaymentPercent >= 20}
            />
            <InputRow
              isMobile={isMobile}
              setInput={(value) => setHoaMonthly(value)}
              cellValues={["HOA Fees ($/mo)", hoaMonthly]}
              description="Monthly homeowners association fees, if any"
            />
          </>
        )}

        {isAdvanced(level) && (
          <>
            <h3 className="input-grouping">Balloon Payment</h3>

            <div className="input-row">
              <div className="info-cell">
                <h4>Enable Balloon Payment</h4>
                <div className="description-cell">
                  A lump-sum balance becomes due at the selected month while monthly
                  payments are calculated on the full amortization term.
                </div>
              </div>
              <div className="input-cell">
                <Checkbox
                  id="enable-balloon-payment"
                  checked={balloonEnabled}
                  onChange={(event) => setEnableBalloonPayment(event.target.checked)}
                />
              </div>
            </div>
            <InputRow
              isMobile={isMobile}
              setInput={(value) => setBalloonMonth(value)}
              cellValues={["Balloon Due (Month #)", balloonMonth]}
              description="Month when the remaining loan balance is due in full"
              isGreyedOut={!balloonEnabled}
            />
          </>
        )}
      </div>

      <div className="output-fields-container">
        <OutputRow
          isMobile={isMobile}
          cellValues={["Total Monthly Payment", `$${roundAndLocalString(totalMonthlyPayment)}`]}
          description="PITI plus PMI and HOA — your full monthly housing payment"
        />
        <OutputRow
          isMobile={isMobile}
          cellValues={["Principal & Interest", `$${roundAndLocalString(monthlyPI)}`]}
          description="Monthly loan payment before taxes and insurance"
        />
        <OutputRow
          isMobile={isMobile}
          cellValues={["Loan Amount", `$${roundAndLocalString(loanAmount)}`]}
          description="Amount financed after down payment"
        />
        <OutputRow
          isMobile={isMobile}
          cellValues={["Down Payment", `$${roundAndLocalString(downPaymentAmount)}`]}
          description="Cash paid upfront toward the purchase"
        />
        {isAtLeastMedium(level) && (
          <>
            <OutputRow
              isMobile={isMobile}
              cellValues={["Monthly Property Tax", `$${roundAndLocalString(monthlyCosts.monthlyPropertyTax)}`]}
              description="Estimated monthly property tax"
            />
            <OutputRow
              isMobile={isMobile}
              cellValues={["Monthly Insurance", `$${roundAndLocalString(monthlyCosts.monthlyInsurance)}`]}
              description="Estimated monthly homeowners insurance"
            />
            <OutputRow
              isMobile={isMobile}
              cellValues={["Monthly Mortgage Insurance", `$${roundAndLocalString(monthlyCosts.monthlyPmi)}`]}
              description="PMI when down payment is under 20%"
            />
            <OutputRow
              isMobile={isMobile}
              cellValues={["Monthly HOA", `$${roundAndLocalString(monthlyCosts.monthlyHoa)}`]}
              description="Monthly homeowners association fees"
            />
            <OutputRow
              isMobile={isMobile}
              cellValues={["Cash to Close", `$${roundAndLocalString(cashToClose)}`]}
              description="Down payment plus estimated closing costs"
            />
            <OutputRow
              isMobile={isMobile}
              cellValues={["Total Interest Paid", `$${roundAndLocalString(totalInterest)}`]}
              description={`Total interest over ${payoffMonth} months`}
            />
          </>
        )}
        {isAdvanced(level) && (
          <>
            <OutputRow
              isMobile={isMobile}
              cellValues={["Total Cost of Loan", `$${roundAndLocalString(totalPrincipalPaid + totalInterest)}`]}
              description="Principal repaid plus all interest paid to the lender"
            />
            {balloonEnabled && balloonBalance !== null && (
              <OutputRow
                isMobile={isMobile}
                cellValues={["Balloon Balance Due", `$${roundAndLocalString(balloonBalance)}`]}
                description={`Remaining balance due at month ${balloonMonthNum}`}
              />
            )}
            <OutputRow
              isMobile={isMobile}
              cellValues={["Payoff Month", `${payoffMonth}`]}
              description="Month when the loan is fully repaid with current extra payments"
            />
          </>
        )}
      </div>

      <MortgageAmortizationSlider
        schedule={schedule}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        downPaymentAmount={downPaymentAmount}
        homePrice={homePriceNum}
        balloonMonth={balloonEnabled ? balloonMonthNum : null}
        level={level}
      />

      <ShareButton params={params} />
    </div>
  );
};

export default HomeMortgageCalculator;
