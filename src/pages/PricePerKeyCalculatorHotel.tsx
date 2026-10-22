import { convertToPercent, removeCommas, roundAndLocalString, roundToDecimal, formatDollar } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { useIncomeMode } from '../hooks/useIncomeMode';
import { EAllStates, EPageNames, EPageTitles } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';
import IncomeModeToggle from '../components/IncomeModeToggle';
import InputRow from '../components/RowTypes/InputRow';
import OutputRow from '../components/RowTypes/OutputRow';
import RangeSimulation from '../components/RangeSimulation/RangeSimulation';
import { calculatePricePerKey, PricePerKeyInputs } from '../utils/pricePerKeyCalculations';
import {
    annualNoiFromHotel,
    applyNoiToPricePerKey,
    incomeVariablesForMode,
} from '../utils/incomeMode';

import './DynamicTable.scss';

const PRICE_PER_KEY_VARIABLES = [
    { id: 'adr', label: 'Average Daily Rate (ADR)' },
    { id: 'rooms', label: 'Number of rooms (#)' },
    { id: 'interestRate', label: 'Interest Rate (%)', isPercent: true },
    { id: 'numberOfYears', label: 'Financing Term (Years)' },
    { id: 'downPayment', label: 'Down Payment (%)', isPercent: true },
    { id: 'vacancy', label: 'Vacancy (%)', isPercent: true },
    { id: 'expensePercentage', label: 'Operating expenses (% of occupied room revenue)', isPercent: true },
    { id: 'cashOnCashReturn', label: 'Cash on cash return (%)', isPercent: true },
    { id: 'buyersAgentFee', label: 'Buyers agent fee (%)', isPercent: true },
    { id: 'clostingCostsFee', label: 'Closing cost fee (%)', isPercent: true },
];

const PRICE_PER_KEY_COLUMNS = [
    { id: 'pricePerKey', label: 'Price per key you should pay', format: formatDollar },
    { id: 'revPAR', label: 'RevPAR', format: formatDollar },
    { id: 'operatingIncome', label: 'Operating income per room', format: formatDollar },
    { id: 'mortgagePayment', label: 'Mortgage Payment per room', format: formatDollar },
    { id: 'cashFlowPerKey', label: 'Cash flow per room', format: formatDollar },
    { id: 'dscr', label: 'Debt service coverage ratio (DSCR)', format: (value: number) => `${Math.round(value * 100) / 100}X` },
    { id: 'roomRevenueMultiplier', label: 'Room Revenue Multiplier', format: (value: number) => `${roundToDecimal(value, 2)}X` },
    { id: 'capRate', label: 'Cap rate (%)', format: (value: number) => convertToPercent(value) },
    { id: 'totalPrice', label: 'Total Hotel Value', format: formatDollar },
    { id: 'offerPrice', label: 'Offer to seller', format: formatDollar },
];



const HotelPriceCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    const queryParams = new URLSearchParams(window.location.search)

    const [adr, setAdr] = usePersistedState2(page, EAllStates.rents, DEFAULT_VALUES[page].rents, queryParams);
    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
    const [numberOfYears, setNumberOfYears] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].numberOfYears, queryParams);
    const [cashOnCashReturn, setCashOnCashReturn] = usePersistedState2(page, EAllStates.cashOnCashReturn, DEFAULT_VALUES[page].cashOnCashReturn, queryParams);
    const [expensePercentage, setExpensePercentage] = usePersistedState2(page, EAllStates.expensePercentage, DEFAULT_VALUES[page].expensePercentage, queryParams);
    const [vacancy, setVacancy] = usePersistedState2(page, EAllStates.vacancy, DEFAULT_VALUES[page].vacancy, queryParams);
    const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);
    const [rooms, setRooms] = usePersistedState2(page, EAllStates.units, DEFAULT_VALUES[page].units, queryParams);
    const [buyersAgentFee, setBuyersAgentFee] = usePersistedState2(page, EAllStates.buyersAgentFee, DEFAULT_VALUES[page].buyersAgentFee, queryParams);
    const [clostingCostsFee, setClostingCostsFee] = usePersistedState2(page, EAllStates.clostingCostsFee, DEFAULT_VALUES[page].clostingCostsFee, queryParams);

    const derivedAnnualNoi = annualNoiFromHotel(
        removeCommas(adr),
        removeCommas(rooms),
        removeCommas(vacancy),
        removeCommas(expensePercentage)
    );
    const { incomeMode, noiMode, annualNoi, setAnnualNoi, setMode } = useIncomeMode(
        page,
        queryParams,
        derivedAnnualNoi
    );

    const params: {
        rents: string;
        downPayment: string;
        interestRate: string;
        numberOfYears: string;
        expensePercentage: string;
        vacancy: string;
        cashOnCashReturn: string;
        clostingCostsFee: string;
        buyersAgentFee: string;
        units: string;
        incomeMode: string;
        noi: string;
    } = {
        rents: adr,
        downPayment: downPayment,
        interestRate: interestRate,
        numberOfYears: numberOfYears,
        expensePercentage: expensePercentage,
        vacancy: vacancy,
        cashOnCashReturn: cashOnCashReturn,
        clostingCostsFee: clostingCostsFee,
        buyersAgentFee: buyersAgentFee,
        units: rooms,
        incomeMode,
        noi: annualNoi,
    };

    const numericInputs: PricePerKeyInputs = {
        adr: removeCommas(adr),
        rooms: removeCommas(rooms),
        interestRate: removeCommas(interestRate),
        numberOfYears: removeCommas(numberOfYears),
        downPayment: removeCommas(downPayment),
        vacancy: removeCommas(vacancy),
        expensePercentage: removeCommas(expensePercentage),
        cashOnCashReturn: removeCommas(cashOnCashReturn),
        buyersAgentFee: removeCommas(buyersAgentFee),
        clostingCostsFee: removeCommas(clostingCostsFee),
    };
    const calcInputs = noiMode
        ? applyNoiToPricePerKey(numericInputs, removeCommas(annualNoi))
        : numericInputs;

    const {
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
    } = calculatePricePerKey(calcInputs);

    const simulationVariables = incomeVariablesForMode(PRICE_PER_KEY_VARIABLES, noiMode);

    const simulationColumns = noiMode
        ? PRICE_PER_KEY_COLUMNS.filter((column) => column.id !== 'revPAR' && column.id !== 'pricePerKey')
            .map((column) => {
                if (column.id === 'operatingIncome') {
                    return { ...column, label: 'Monthly NOI' };
                }
                if (column.id === 'mortgagePayment') {
                    return { ...column, label: 'Monthly mortgage payment' };
                }
                if (column.id === 'cashFlowPerKey') {
                    return { ...column, label: 'Monthly cash flow' };
                }
                if (column.id === 'roomRevenueMultiplier') {
                    return { ...column, label: 'NOI multiple' };
                }
                return column;
            })
        : PRICE_PER_KEY_COLUMNS;

    return (

        <div className="group-section price-per-door-calculator" data-income-mode={noiMode ? 'noi' : 'gross'}>
            <div className="input-fields-container has-bottom-border">
                <IncomeModeToggle value={incomeMode} onChange={setMode} />
                {noiMode ? (
                    <InputRow
                        key="annual-noi"
                        isMobile={isMobile}
                        setInput={value => setAnnualNoi(value)}
                        cellValues={["Annual NOI ($)", annualNoi]}
                        description="Net operating income for the whole hotel. Room count, vacancy, and expenses are not used."
                    />
                ) : (
                    <>
                        <InputRow
                            key="adr"
                            isMobile={isMobile}
                            setInput={value => setAdr(value)}
                            cellValues={["Average Daily Rate (ADR)", adr]}
                            description="The average room rate charged per occupied night"
                        />
                        <InputRow
                            key="room-count"
                            isMobile={isMobile}
                            setInput={value => setRooms(value)}
                            cellValues={["Number of rooms (#)", rooms]}
                            description="How many guest rooms are in the hotel"
                        />
                        <InputRow
                            key="vacancy"
                            isMobile={isMobile}
                            setInput={value => setVacancy(value)}
                            cellValues={["Vacancy (%)", vacancy]}
                            description="The percentage of room-nights that are unoccupied. Occupancy is 100% minus vacancy. A 30% vacancy equals 70% occupancy."
                            isPercent={true}
                        />
                        <InputRow
                            key="expense-percentage"
                            isMobile={isMobile}
                            setInput={value => setExpensePercentage(value)}
                            cellValues={["Operating expenses (% of occupied room revenue)", expensePercentage]}
                            description="Operating expenses as a percentage of occupied room revenue. Vacancy is entered separately. Limited-service hotels often run 60-70% expense ratios."
                            isPercent={true}
                        />
                    </>
                )}
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

                {noiMode ? null : (
                    <>
                        <OutputRow
                            isMobile={isMobile}
                            cellValues={["Price per key you should pay", "$" + roundAndLocalString(pricePerKey)]}
                            description={`This is the max you should pay per room to achieve the desired returns`}
                            helpLink="https://docs.google.com/document/d/e/2PACX-1vTD8sk8fWqj0tRdPhqENwbbR8TZmuBxJES4a5xTmQ69r9n3bHtSqlgcJK2AFPa-kYmZlqykmZhhAkJF/pub"
                        />
                        <OutputRow
                            isMobile={isMobile}
                            cellValues={["RevPAR", "$" + roundToDecimal(revPAR, 2)]}
                            description="Revenue per available room: ADR multiplied by occupancy (100% minus vacancy)"
                        />
                    </>
                )}
                <OutputRow
                    isMobile={isMobile}
                    cellValues={[noiMode ? "Monthly NOI" : "Operating income per room", "$" + roundAndLocalString(operatingIncome)]}
                    description={noiMode ? "Annual NOI divided by 12" : "Monthly NOI per room after vacancy and operating expenses"}
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTfgj_1vPDOl_cr3VD5beGl4kcMDstWAcPownovQ71hQhTgPCcoETEZg0a69Z5y42ds9PDirE0vscWl/pub"}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={[noiMode ? "Monthly mortgage payment" : "Mortgage Payment per room", "$" + roundAndLocalString(mortgagePayment)]}
                    description={noiMode ? "The payment for the mortgage" : "The payment for the mortgage per room"}
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vSqIxRzLoXKwnS9ZqPx_i6O3RE8netRC3KeBNPfbe-KMMlfFVExpuO4WOBgKX0M2M0j96SrmSrPzwmF/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={[noiMode ? "Monthly cash flow" : "Cash flow per room", "$" + roundAndLocalString(cashFlowPerKey)]}
                    description={noiMode ? "Monthly NOI minus the mortgage payment" : "The cash flow per room"}
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
                    cellValues={[noiMode ? "NOI multiple" : "Room Revenue Multiplier", roundToDecimal(roomRevenueMultiplier, 2) + "X"]}
                    description={noiMode
                        ? "The offer price divided by annual NOI."
                        : "The room revenue multiplier is the offer price divided by annual occupied room revenue."}
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
                    cellValues={["Total Hotel Value", "$" + roundAndLocalString(totalPrice)]}
                    description="This is the total value of the hotel based on the per key price"
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
                variables={simulationVariables}
                columns={simulationColumns}
                currentValues={noiMode ? { ...calcInputs, annualNoi: removeCommas(annualNoi) } : numericInputs}
                run={(values) => {
                    if (!noiMode) {
                        return calculatePricePerKey(values as PricePerKeyInputs);
                    }
                    return calculatePricePerKey(
                        applyNoiToPricePerKey(values as PricePerKeyInputs, values.annualNoi)
                    );
                }}
            />
        </div>

    );
};

export default HotelPriceCalculator;
