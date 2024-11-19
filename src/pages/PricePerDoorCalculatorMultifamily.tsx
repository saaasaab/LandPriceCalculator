import { convertToPercent, removeCommas, roundAndLocalString } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import OutputRow from '../components/RowTypes/OutputRow';

import './DynamicTable.scss';



const ResidentialPriceCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    const queryParams = new URLSearchParams(window.location.search)


    const [rents, setRents] = usePersistedState2(page, EAllStates.rents, DEFAULT_VALUES[page].rents, queryParams);

    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
    const [numberOfYears, setNumberOfYears] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].numberOfYears, queryParams);
    const [cashOnCashReturn, setCashOnCashReturn] = usePersistedState2(page, EAllStates.cashOnCashReturn, DEFAULT_VALUES[page].cashOnCashReturn, queryParams);
    const [expensePercentage, setExpensePercentage] = usePersistedState2(page, EAllStates.expensePercentage, DEFAULT_VALUES[page].expensePercentage, queryParams);
    const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);
    const [units, setUnits] = usePersistedState2(page, EAllStates.units, DEFAULT_VALUES[page].units, queryParams);

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

    const mortgagePayment = (mort * pricePerUnit * (1 - removeCommas(downPayment) / 100));
    const cashFlowPerUnit = operatingIncome - mortgagePayment;
    const DSCR = operatingIncome / (mort * pricePerUnit * (1 - removeCommas(downPayment) / 100));
    const capRate = operatingIncome * 12 / pricePerUnit;

    const totalPrice = removeCommas(units) * pricePerUnit;



    return (

        <div className="group-section">
            <div className="input-fields-container has-bottom-border">

                <InputRow
                    isMobile={isMobile}
                    setInput={value => setRents(value)}
                    cellValues={["Rental Income one unit ", rents]}
                    description="The current rental income from one unit"
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setInterestRate(value)}
                    cellValues={["Interest Rate (%)", interestRate]}
                    description="The interest rate your bank is willing to lend on"
                    isPercent={true}
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setNumberOfYears(value)}
                    cellValues={["Years for financing (#)", numberOfYears]}
                    description="How many years is is the loan amortizing for"
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setDownPayment(value)}
                    cellValues={["Down Payment (%)", downPayment]}
                    description="The down payment needed from the bank for the loan."
                    isPercent={true}
               />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setExpensePercentage(value)}
                    cellValues={["Expense Percentages (%)", expensePercentage]}
                    description="This is the percentage of income that will go to operating expenses. A good heuristic is 50% of rental income goes to operating expenses."
                    isPercent={true}
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setCashOnCashReturn(value)}
                    cellValues={["Cash on cash return (%)", cashOnCashReturn]}
                    description="Set your investors' required cash-on-cash return for this to be a good investment. This will change based on the asset type and market."
                    isPercent={true}
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setUnits(value)}
                    cellValues={["Number of units (#)", units]}
                    description="How many units are in the building"
                />

            </div>


            <div className="output-fields-container">

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Price per unit you should pay ", "$" + roundAndLocalString(pricePerUnit)]}
                    description="This is the max you should pay per unit to achive the desired returns"
                />
                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Operating income per unit ", "$" + roundAndLocalString(operatingIncome)]}
                    description="The operating income per unit"
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Mortgage Payment ", "$" + roundAndLocalString(mortgagePayment)]}
                    description="The payment for the mortgage per unit"
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Cash flow per unit", "$" + roundAndLocalString(cashFlowPerUnit)]}
                    description="The cash flow per unit"
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Debt service coverage ratio DSCR", Math.round(DSCR * 100) / 100 + "X"]}
                    description="A bank normally is looking for 1.25 or greater"
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Cap rate (%)", convertToPercent(capRate)]}
                    description="The cap rate of the property based off the operating income and the value of the property."
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Total Building Value", "$" + roundAndLocalString(totalPrice)]}
                    description="This is the total value of the building based on the per unit price"
                />


            </div>

            <ShareButton params={params} />
        </div>

    );
};

export default ResidentialPriceCalculator;
