import { convertToPercent, removeCommas, roundAndLocalString, roundToDecimal } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import OutputRow from '../components/RowTypes/OutputRow';
import './DynamicTable.scss';



const PricePerSQFTCalculatorIndustrial = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {
    const queryParams = new URLSearchParams(window.location.search)

    const [annualLeaseRatesPerSQFT, setAnnualLeaseRatesPerSQFT] = usePersistedState2(page, EAllStates.annualLeaseRatesPerSQFT, DEFAULT_VALUES[page].annualLeaseRatesPerSQFT, queryParams);

    const [leasableSQFT, setLeasableSQFT] = usePersistedState2(page, EAllStates.leasableSQFT, DEFAULT_VALUES[page].leasableSQFT, queryParams);

    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
    const [numberOfYears, setNumberOfYears] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].numberOfYears, queryParams);
    const [cashOnCashReturn, setCashOnCashReturn] = usePersistedState2(page, EAllStates.cashOnCashReturn, DEFAULT_VALUES[page].cashOnCashReturn, queryParams);
    const [expensePercentage, setExpensePercentage] = usePersistedState2(page, EAllStates.expensePercentage, DEFAULT_VALUES[page].expensePercentage, queryParams);
    const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);

    const params: {
        annualLeaseRatesPerSQFT: string;
        downPayment: string;
        interestRate: string;
        numberOfYears: string;
        expensePercentage: string;
        cashOnCashReturn: string;
    } = {
        annualLeaseRatesPerSQFT: annualLeaseRatesPerSQFT,
        downPayment: downPayment,
        interestRate: interestRate,
        numberOfYears: numberOfYears,
        expensePercentage: expensePercentage,
        cashOnCashReturn: cashOnCashReturn,
    };



    const monthlyLeaseRatesPerSQFT = removeCommas(annualLeaseRatesPerSQFT) / 12
    const interestRateMonthly = removeCommas(interestRate) / 100 / 12;
    const cashOnCashReturnMonthly = removeCommas(cashOnCashReturn) / 100 / 12;
    const numberOfPayments = removeCommas(numberOfYears) * 12;
    const mortTop = interestRateMonthly * Math.pow((1 + interestRateMonthly), numberOfPayments);
    const mortBottom = Math.pow(1 + interestRateMonthly, numberOfPayments) - 1;

    const mort = mortTop / mortBottom;

    const pricePerSQFT = (monthlyLeaseRatesPerSQFT * (1 - (removeCommas(expensePercentage) / 100))) / ((removeCommas(downPayment) / 100) * cashOnCashReturnMonthly + ((1 - (removeCommas(downPayment) / 100)) * mort));
    const operatingIncome = monthlyLeaseRatesPerSQFT * (1 - removeCommas(expensePercentage) / 100);

    const mortgagePayment = (mort * pricePerSQFT * (1 - removeCommas(downPayment) / 100));

    const cashFlowPerSQFT = roundToDecimal(operatingIncome - mortgagePayment, 2);
    const DSCR = operatingIncome / (mort * pricePerSQFT * (1 - removeCommas(downPayment) / 100));
    const capRate = operatingIncome * 12 / pricePerSQFT;

    const totalPrice = removeCommas(leasableSQFT) * pricePerSQFT;



    return (

        <div className="group-section">
            <div className="input-fields-container has-bottom-border">

                <InputRow
                    isMobile={isMobile}
                    setInput={value => setAnnualLeaseRatesPerSQFT(value)}
                    cellValues={["Annual lease rates per sqft", annualLeaseRatesPerSQFT]}
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setLeasableSQFT(value)}
                    cellValues={["Total leasable SQFT", leasableSQFT]}
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
            </div>


            <div className="output-fields-container">

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Price per SQFT you should pay ", "$" + roundToDecimal(pricePerSQFT)]}
                    description="This is the max you should pay per sqft to achive the desired returns"
                />
                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Monthly operating income per SQFT", "$" + roundToDecimal(operatingIncome, 2)]}
                    description="The operating income per SQFT per month"
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Mortgage Payment ", "$" + roundToDecimal(mortgagePayment)]}
                    description="The payment for the mortgage per sqft"
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Monthly Cash flow per sqft", "$" + cashFlowPerSQFT]}
                    description="The cash flow per sqft"
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Annual Cash flow per sqft", "$" + roundToDecimal(cashFlowPerSQFT * 12,2)]}
                    description="The cash flow per sqft"
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
                    description="This is the total value of the building based on the persqft price"
                />


            </div>

            <ShareButton params={params} />
        </div>

    );
};

export default PricePerSQFTCalculatorIndustrial;
