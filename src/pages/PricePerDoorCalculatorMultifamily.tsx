import { convertToPercent, removeCommas, roundAndLocalString, roundToDecimal } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates, EPageNames, EPageTitles } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import OutputRow from '../components/RowTypes/OutputRow';
import RangeSimulation from '../components/RangeSimulation/RangeSimulation';
import { calculatePricePerDoor, PricePerDoorInputs } from '../utils/pricePerDoorCalculations';

import './DynamicTable.scss';

const PRICE_PER_DOOR_VARIABLES = [
    { id: 'rents', label: 'Monthly rent per unit' },
    { id: 'units', label: 'Number of units (#)' },
    { id: 'interestRate', label: 'Interest Rate (%)', isPercent: true },
    { id: 'numberOfYears', label: 'Financing Term (Years)' },
    { id: 'downPayment', label: 'Down Payment (%)', isPercent: true },
    { id: 'expensePercentage', label: 'Operating expenses (% of gross income)', isPercent: true },
    { id: 'cashOnCashReturn', label: 'Cash on cash return (%)', isPercent: true },
    { id: 'buyersAgentFee', label: 'Buyers agent fee (%)', isPercent: true },
    { id: 'clostingCostsFee', label: 'Closing cost fee (%)', isPercent: true },
];

const PRICE_PER_DOOR_COLUMNS = [
    { id: 'pricePerUnit', label: 'Price per unit you should pay', format: (value: number) => `$${roundAndLocalString(value)}` },
    { id: 'operatingIncome', label: 'Operating income per unit', format: (value: number) => `$${roundAndLocalString(value)}` },
    { id: 'mortgagePayment', label: 'Mortgage Payment per unit', format: (value: number) => `$${roundAndLocalString(value)}` },
    { id: 'cashFlowPerUnit', label: 'Cash flow per unit', format: (value: number) => `$${roundAndLocalString(value)}` },
    { id: 'dscr', label: 'Debt service coverage ratio (DSCR)', format: (value: number) => `${Math.round(value * 100) / 100}X` },
    { id: 'grossRentMultiplier', label: 'Gross Rent Multiplier', format: (value: number) => `${roundToDecimal(value, 2)}X` },
    { id: 'capRate', label: 'Cap rate (%)', format: (value: number) => convertToPercent(value) },
    { id: 'totalPrice', label: 'Total Building Value', format: (value: number) => `$${roundAndLocalString(value)}` },
    { id: 'offerPrice', label: 'Offer to seller', format: (value: number) => `$${roundAndLocalString(value)}` },
];

const ResidentialPriceCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    const queryParams = new URLSearchParams(window.location.search)

    const [rents, setRents] = usePersistedState2(page, EAllStates.rents, DEFAULT_VALUES[page].rents, queryParams);
    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
    const [numberOfYears, setNumberOfYears] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].numberOfYears, queryParams);
    const [cashOnCashReturn, setCashOnCashReturn] = usePersistedState2(page, EAllStates.cashOnCashReturn, DEFAULT_VALUES[page].cashOnCashReturn, queryParams);
    const [expensePercentage, setExpensePercentage] = usePersistedState2(page, EAllStates.expensePercentage, DEFAULT_VALUES[page].expensePercentage, queryParams);
    const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);
    const [units, setUnits] = usePersistedState2(page, EAllStates.units, DEFAULT_VALUES[page].units, queryParams);
    const [buyersAgentFee, setBuyersAgentFee] = usePersistedState2(page, EAllStates.buyersAgentFee, DEFAULT_VALUES[page].buyersAgentFee, queryParams);
    const [clostingCostsFee, setClostingCostsFee] = usePersistedState2(page, EAllStates.clostingCostsFee, DEFAULT_VALUES[page].clostingCostsFee, queryParams);

    const params: {
        rents: string;
        downPayment: string;
        interestRate: string;
        numberOfYears: string;
        expensePercentage: string;
        cashOnCashReturn: string;
        clostingCostsFee: string;
        buyersAgentFee: string;
    } = {
        rents: rents,
        downPayment: downPayment,
        interestRate: interestRate,
        numberOfYears: numberOfYears,
        expensePercentage: expensePercentage,
        cashOnCashReturn: cashOnCashReturn,
        clostingCostsFee: clostingCostsFee,
        buyersAgentFee: buyersAgentFee
    };

    const numericInputs: PricePerDoorInputs = {
        rents: removeCommas(rents),
        units: removeCommas(units),
        interestRate: removeCommas(interestRate),
        numberOfYears: removeCommas(numberOfYears),
        downPayment: removeCommas(downPayment),
        expensePercentage: removeCommas(expensePercentage),
        cashOnCashReturn: removeCommas(cashOnCashReturn),
        buyersAgentFee: removeCommas(buyersAgentFee),
        clostingCostsFee: removeCommas(clostingCostsFee),
    };

    const {
        pricePerUnit,
        operatingIncome,
        mortgagePayment,
        cashFlowPerUnit,
        dscr,
        grossRentMultiplier,
        capRate,
        totalPrice,
        offerPrice,
    } = calculatePricePerDoor(numericInputs);

    return (

        <div className="group-section price-per-door-calculator">
            <div className="input-fields-container has-bottom-border">

                <InputRow
                    isMobile={isMobile}
                    setInput={value => setRents(value)}
                    cellValues={["Monthly rent per unit", rents]}
                    description="Monthly rent collected for one unit"
                />
                 <InputRow
                    isMobile={isMobile}
                    setInput={value => setUnits(value)}
                    cellValues={["Number of units (#)", units]}
                    description="How many units are in the building"
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
                    cellValues={["Financing Term (Years)", numberOfYears]}
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
                    cellValues={["Operating expenses (% of gross income)", expensePercentage]}
                    description="Share of gross rental income that goes to operating expenses. A common starting point is 50%. Vacancy is included in this percentage."
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
                    setInput={value => setBuyersAgentFee(value)}
                    cellValues={["Buyers agent fee (%)", buyersAgentFee]}
                    description="The percentage for the buyers agent of the total building value"
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setClostingCostsFee(value)}
                    cellValues={["Closing cost fee(%)", clostingCostsFee]}
                    description="The percentage for the closing costs of the total building value"
                />

            </div>


            <div className="output-fields-container">

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Price per unit you should pay", "$" + roundAndLocalString(pricePerUnit)]}
                    description={`This is the max you should pay per unit to achive the desired returns`}
                    helpLink="https://docs.google.com/document/d/e/2PACX-1vTD8sk8fWqj0tRdPhqENwbbR8TZmuBxJES4a5xTmQ69r9n3bHtSqlgcJK2AFPa-kYmZlqykmZhhAkJF/pub"
                />
                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Operating income per unit", "$" + roundAndLocalString(operatingIncome)]}
                    description="The operating income per unit"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTfgj_1vPDOl_cr3VD5beGl4kcMDstWAcPownovQ71hQhTgPCcoETEZg0a69Z5y42ds9PDirE0vscWl/pub"}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Mortgage Payment per unit", "$" + roundAndLocalString(mortgagePayment)]}
                    description="The payment for the mortgage per unit"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vSqIxRzLoXKwnS9ZqPx_i6O3RE8netRC3KeBNPfbe-KMMlfFVExpuO4WOBgKX0M2M0j96SrmSrPzwmF/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Cash flow per unit", "$" + roundAndLocalString(cashFlowPerUnit)]}
                    description="The cash flow per unit"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTP6gEErgaXV_5Z1JDvgAT-ZGldWq5675VWWVVojQyyZ0zRya7dGUCvLVcydkMTTDG5j5UadJt9psQk/pub"}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Debt service coverage ratio (DSCR)", Math.round(dscr * 100) / 100 + "X"]}
                    description="A bank normally is looking for 1.25 or greater"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTNoMpWgbOK0f32XSoQ2eVfe8-JmhdiCHjTPVP1jb9TYud-plRzGgtsHoAYSQzEExSZQ-Qp0fDJyxVg/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Gross Rent Multiplier", roundToDecimal(grossRentMultiplier, 2) + "X"]}
                    description="The GRM is calculated by dividing the value of the property by the annual gross rents."
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTNOZB6PpTBa-0JePEknv2nrFYtA-sK4Yz_yrUD1kRVTC9DNplG1o5iQdzpN6-1ZpUyds0waI83EHPx/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Cap rate (%)", convertToPercent(capRate)]}
                    description="The cap rate of the property based off the operating income and the value of the property."
                    helpLink="https://docs.google.com/document/d/e/2PACX-1vRt_ChiF_ZoJYXXemimCn-LKxn0-F8wIG66csw4FnybeFH2xh3U1WUhDuinZ-uJlEMDE-bS_XjBvzYp/pub"
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Total Building Value", "$" + roundAndLocalString(totalPrice)]}
                    description="This is the total value of the building based on the per unit price"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vRn3jgo32H_h1Jw4oeodBPqrvw4TQt2OnN9nUC-Knok_FieP8xqK-chi-iOORGuAY6NnpzvoFyO2Xbz/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Offer to seller", "$" + roundAndLocalString(offerPrice)]}
                    description="This is the total you will offer to the seller including closing costs"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTTnUs2pOKas85TqnynslZWKFLTaPyx7jiGnKexqv87tCcJvrdYRHgN1WyeIkP-T8sooUTCT1Sc1_6V/pub"}
                />

            </div>

            <ShareButton params={params} />

            <RangeSimulation
                pageTitle={EPageTitles[page]}
                variables={PRICE_PER_DOOR_VARIABLES}
                columns={PRICE_PER_DOOR_COLUMNS}
                currentValues={numericInputs}
                run={(values) => calculatePricePerDoor(values as PricePerDoorInputs)}
            />
        </div>

    );
};

export default ResidentialPriceCalculator;
