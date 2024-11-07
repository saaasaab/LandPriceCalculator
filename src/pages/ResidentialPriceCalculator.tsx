import { useState } from 'react';
import DynamicRow from '../components/DynamicRow';
import { copyToClipboard, removeCommas, roundAndLocalString } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import './DynamicTable.scss';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';


const ResidentialPriceCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

  const queryParams = new URLSearchParams(window.location.search)


  const [rents, setRents] = usePersistedState2(page, EAllStates.rents, DEFAULT_VALUES[page].rents, queryParams);
  const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
  const [numberOfYears, setNumberOfYears] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].numberOfYears, queryParams);
  const [cashOnCashReturn, setCashOnCashReturn] = usePersistedState2(page, EAllStates.cashOnCashReturn, DEFAULT_VALUES[page].cashOnCashReturn, queryParams);
  const [expensePercentage, setExpensePercentage] = usePersistedState2(page, EAllStates.expensePercentage, DEFAULT_VALUES[page].expensePercentage, queryParams);
  const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);

  const [copied, setCopied] = useState(false);

  const params: {
    rents: string;
    downPayment: string;
    interestRate: string;
    numberOfYears: string;
    expensePercentage: string;
    cashOnCashReturn: string;
  } = {
    rents: rents,
    downPayment: downPayment,
    interestRate: interestRate,
    numberOfYears: numberOfYears,
    expensePercentage: expensePercentage,
    cashOnCashReturn: cashOnCashReturn,
  };



  const interestRateMonthly = removeCommas(interestRate) / 100 / 12;
  const cashOnCashReturnMonthly = removeCommas(cashOnCashReturn) / 100 / 12;
  const numberOfPayments = removeCommas(numberOfYears) * 12;
  const mortTop = interestRateMonthly * Math.pow((1 + interestRateMonthly), numberOfPayments);
  const mortBottom = Math.pow(1 + interestRateMonthly, numberOfPayments) - 1;

  const mort = mortTop / mortBottom;

  const pricePerUnit = (removeCommas(rents) * (1 - (removeCommas(expensePercentage) / 100))) / ((removeCommas(downPayment) / 100) * cashOnCashReturnMonthly + ((1 - (removeCommas(downPayment) / 100)) * mort));
  const operatingIncome = removeCommas(rents) * (1 - removeCommas(expensePercentage) / 100);
  const DSCR = operatingIncome / (mort * pricePerUnit * (1 - removeCommas(downPayment) / 100));
  const capRate = operatingIncome * 12 / pricePerUnit;


  return (

    <>
      <div className="table-container">
        <DynamicRow
          cellValues={["Unit Levers"]}
          // description={'These are the levers investors can pull that are responsible for determining how much a property is worth'}
          isMobile={isMobile}
          numberOfCells={1}
          header={true}
        />
        <DynamicRow
          setInput={value => setRents(value)}
          cellValues={["Rental Income for one Unit ($)", rents]}
          description="The current rental income from one unit"
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        <DynamicRow
          setInput={value => setInterestRate(value)}
          cellValues={["Interest Rate for financing (%)", interestRate]}
          description="The interest rate your bank is willing to lend on"
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        <DynamicRow
          setInput={value => setNumberOfYears(value)}
          cellValues={["Total number of years for financing (#)", numberOfYears]}
          description="How many years are you amortizing"
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        <DynamicRow
          setInput={value => setDownPayment(value)}
          cellValues={["Down Payment (%)", downPayment]}
          description="The down payment needed from the bank for the loan."
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        <DynamicRow
          setInput={value => setExpensePercentage(value)}
          cellValues={["Expense Percentages (%)", expensePercentage]}
          description="This is the percentage of income that will go to operating expenses. A good heuristic is 50% of rental income goes to operating expenses."
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        <DynamicRow
          setInput={value => setCashOnCashReturn(value)}
          cellValues={["Required cash on cash return (%)", cashOnCashReturn]}
          description="Set your investors' required cash-on-cash return for this to be a good investment. This will change based on the asset type and market."
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
      </div>

      <div className="table-container">

        <DynamicRow
          cellValues={["Results"]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={-1}
          header={true}
        />


        <DynamicRow
          cellValues={["Price per unit you should pay ($)", roundAndLocalString(pricePerUnit)]}
          description="This is the max you should pay per unit to achive the desired returns"
          isMobile={isMobile}
          numberOfCells={2}
        />
        <DynamicRow
          cellValues={["Operating income per unit ($)", roundAndLocalString(operatingIncome)]}
          description="The operating income per unit"
          isMobile={isMobile}
          numberOfCells={2}
        />

        <DynamicRow
          cellValues={["Debt service coverage ratio DSCR (X)", Math.round(DSCR * 100) / 100 + "X"]}
          description="A bank normally is looking for 1.25 or greater"
          isMobile={isMobile}
          numberOfCells={2}
        />

        <DynamicRow
          cellValues={["Cap rate (%)", (capRate * 100).toFixed(1) + "%"]}
          description="The cap rate of the property based off the operating income and the value of the property."
          isMobile={isMobile}
          numberOfCells={2}
        />
      </div>




      <button
        onClick={() => copyToClipboard(params, setCopied)}
        className={`copy-url-button ${copied ? 'copied' : ''}`}
      >
        {copied ? 'Copied your work! Now share the link' : 'Share your work'}
      </button>

    </>

  );
};

export default ResidentialPriceCalculator;
