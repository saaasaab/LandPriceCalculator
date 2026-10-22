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
import { calculatePricePerSqft, PricePerSqftInputs } from '../utils/pricePerSqftCalculations';
import {
    annualNoiFromAnnualLease,
    applyNoiToPricePerSqft,
    incomeVariablesForMode,
} from '../utils/incomeMode';
import './DynamicTable.scss';
import { useState } from 'react';

const PRICE_PER_SQFT_VARIABLES = [
    { id: 'annualLeaseRatesPerSQFT', label: 'Annual lease rates per sqft' },
    { id: 'leasableSQFT', label: 'Total leasable SQFT' },
    { id: 'interestRate', label: 'Interest Rate (%)', isPercent: true },
    { id: 'numberOfYears', label: 'Financing Term (Years)' },
    { id: 'downPayment', label: 'Down Payment (%)', isPercent: true },
    { id: 'expensePercentage', label: 'Operating expenses (% of gross income)', isPercent: true },
    { id: 'cashOnCashReturn', label: 'Cash on cash return (%)', isPercent: true },
    { id: 'buyersAgentFee', label: 'Buyers agent fee (%)', isPercent: true },
    { id: 'clostingCostsFee', label: 'Closing cost fee (%)', isPercent: true },
];

const PRICE_PER_SQFT_COLUMNS = [
    { id: 'pricePerSQFT', label: 'Building value price per SQFT', format: formatDollar },
    { id: 'operatingIncome', label: 'Monthly operating income per SQFT', format: formatDollar },
    { id: 'mortgagePayment', label: 'Mortgage Payment per SQFT', format: formatDollar },
    { id: 'cashFlowPerSQFT', label: 'Monthly Cash flow per SQFT', format: formatDollar },
    { id: 'annualCashFlowPerSQFT', label: 'Annual Cash flow per SQFT', format: formatDollar },
    { id: 'dscr', label: 'Debt service coverage ratio (DSCR)', format: (value: number) => `${Math.round(value * 100) / 100}X` },
    { id: 'capRate', label: 'Cap rate (%)', format: (value: number) => convertToPercent(value) },
    { id: 'totalPrice', label: 'Total Building Value', format: formatDollar },
    { id: 'offerPrice', label: 'Offer to seller', format: formatDollar },
];



const PricePerSQFTCalculatorIndustrial = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {
    const queryParams = new URLSearchParams(window.location.search)

    const [annualLeaseRatesPerSQFT, setAnnualLeaseRatesPerSQFT] = usePersistedState2(page, EAllStates.annualLeaseRatesPerSQFT, DEFAULT_VALUES[page].annualLeaseRatesPerSQFT, queryParams);

    const [leasableSQFT, setLeasableSQFT] = usePersistedState2(page, EAllStates.leasableSQFT, DEFAULT_VALUES[page].leasableSQFT, queryParams);
    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
    const [numberOfYears, setNumberOfYears] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].numberOfYears, queryParams);
    const [cashOnCashReturn, setCashOnCashReturn] = usePersistedState2(page, EAllStates.cashOnCashReturn, DEFAULT_VALUES[page].cashOnCashReturn, queryParams);
    const [expensePercentage, setExpensePercentage] = usePersistedState2(page, EAllStates.expensePercentage, DEFAULT_VALUES[page].expensePercentage, queryParams);
    const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);
    const [buyersAgentFee, setBuyersAgentFee] = usePersistedState2(page, EAllStates.buyersAgentFee, DEFAULT_VALUES[page].buyersAgentFee, queryParams);
    const [clostingCostsFee, setClostingCostsFee] = usePersistedState2(page, EAllStates.clostingCostsFee, DEFAULT_VALUES[page].clostingCostsFee, queryParams);
    const [showTotalValues, setShowTotalValues] = useState(false);

    const derivedAnnualNoi = annualNoiFromAnnualLease(
        removeCommas(annualLeaseRatesPerSQFT),
        removeCommas(leasableSQFT),
        removeCommas(expensePercentage)
    );
    const { incomeMode, noiMode, annualNoi, setAnnualNoi, setMode } = useIncomeMode(
        page,
        queryParams,
        derivedAnnualNoi
    );
    const showPropertyTotals = noiMode || showTotalValues;

    const params: {
        annualLeaseRatesPerSQFT: string;
        leasableSQFT: string;
        downPayment: string;
        interestRate: string;
        numberOfYears: string;
        expensePercentage: string;
        cashOnCashReturn: string;
        clostingCostsFee: string;
        buyersAgentFee: string;
        incomeMode: string;
        noi: string;
    } = {
        annualLeaseRatesPerSQFT: annualLeaseRatesPerSQFT,
        leasableSQFT: leasableSQFT,
        downPayment: downPayment,
        interestRate: interestRate,
        numberOfYears: numberOfYears,
        expensePercentage: expensePercentage,
        cashOnCashReturn: cashOnCashReturn,
        clostingCostsFee: clostingCostsFee,
        buyersAgentFee: buyersAgentFee,
        incomeMode,
        noi: annualNoi,
    };

    const numericInputs: PricePerSqftInputs = {
        annualLeaseRatesPerSQFT: removeCommas(annualLeaseRatesPerSQFT),
        leasableSQFT: removeCommas(leasableSQFT),
        interestRate: removeCommas(interestRate),
        numberOfYears: removeCommas(numberOfYears),
        downPayment: removeCommas(downPayment),
        expensePercentage: removeCommas(expensePercentage),
        cashOnCashReturn: removeCommas(cashOnCashReturn),
        buyersAgentFee: removeCommas(buyersAgentFee),
        clostingCostsFee: removeCommas(clostingCostsFee),
    };
    const calcInputs = noiMode
        ? applyNoiToPricePerSqft(numericInputs, removeCommas(annualNoi))
        : numericInputs;

    const {
        pricePerSQFT,
        operatingIncome,
        mortgagePayment,
        cashFlowPerSQFT,
        dscr,
        capRate,
        totalPrice,
        offerPrice,
    } = calculatePricePerSqft(calcInputs);

    const getDisplayValue = (perSqftValue: number) => {
        if (showPropertyTotals) {
            const area = noiMode ? 1 : removeCommas(leasableSQFT);
            return "$" + roundAndLocalString(perSqftValue * area);
        }
        return "$" + roundToDecimal(perSqftValue);
    };

    const sqftScopeLabel = (base: string, noiLabel: string, perUnitSuffix = 'per SQFT') => {
        if (noiMode) {
            return noiLabel;
        }
        if (showPropertyTotals) {
            return `${base} total`;
        }
        return `${base} ${perUnitSuffix}`;
    };

    const sqftScopeDescription = (noiDescription: string, grossBase: string) => {
        if (noiMode) {
            return noiDescription;
        }
        if (showPropertyTotals) {
            return `${grossBase} total`;
        }
        return `${grossBase} per SQFT`;
    };

    const simulationVariables = incomeVariablesForMode(PRICE_PER_SQFT_VARIABLES, noiMode);

    const simulationColumns = noiMode
        ? PRICE_PER_SQFT_COLUMNS.map((column) => {
            if (column.id === 'pricePerSQFT') {
                return { ...column, label: 'Building value' };
            }
            if (column.id === 'operatingIncome') {
                return { ...column, label: 'Monthly NOI' };
            }
            if (column.id === 'mortgagePayment') {
                return { ...column, label: 'Monthly mortgage payment' };
            }
            if (column.id === 'cashFlowPerSQFT') {
                return { ...column, label: 'Monthly cash flow' };
            }
            if (column.id === 'annualCashFlowPerSQFT') {
                return { ...column, label: 'Annual cash flow' };
            }
            return column;
        })
        : PRICE_PER_SQFT_COLUMNS;

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
                        description="Net operating income for the whole property. Expenses and leasable square footage are not used."
                    />
                ) : (
                    <>
                        <InputRow
                            key="lease-rate"
                            isMobile={isMobile}
                            setInput={value => setAnnualLeaseRatesPerSQFT(value)}
                            cellValues={["Annual lease rates per sqft", annualLeaseRatesPerSQFT]}
                        />
                        <InputRow
                            key="leasable-sqft"
                            isMobile={isMobile}
                            setInput={value => setLeasableSQFT(value)}
                            cellValues={["Total leasable SQFT", leasableSQFT]}
                        />
                        <InputRow
                            key="expense-percentage"
                            isMobile={isMobile}
                            setInput={value => setExpensePercentage(value)}
                            cellValues={["Operating expenses (% of gross income)", expensePercentage]}
                            description="This is the percentage of income that will go to operating expenses. A good heuristic is 50% of rental income goes to operating expenses."
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
                    <OutputRow
                        isMobile={isMobile}
                        cellValues={[
                            sqftScopeLabel('Building value', 'Building value', 'price per SQFT'),
                            getDisplayValue(pricePerSQFT)
                        ]}
                        description="This is the max you should pay per sqft to achive the desired returns"
                        helpLink={"https://docs.google.com/document/d/e/2PACX-1vS8YsmrbZaugpEsC5jwMyYxLuCaznTDfN1IasxjJjyOKPyWKFPJONfWXBAXdkQvTn5aWKZDSk0-ehmz/pub"}
                    />
                )}
                <OutputRow
                    isMobile={isMobile}
                    cellValues={[
                        sqftScopeLabel('Monthly operating income', 'Monthly NOI'),
                        getDisplayValue(operatingIncome)
                    ]}
                    description={sqftScopeDescription('Annual NOI divided by 12', 'The operating income')}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={[
                        sqftScopeLabel('Mortgage Payment', 'Monthly mortgage payment'),
                        getDisplayValue(mortgagePayment)
                    ]}
                    description={sqftScopeDescription('The payment for the mortgage', 'The payment for the mortgage')}
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vSqIxRzLoXKwnS9ZqPx_i6O3RE8netRC3KeBNPfbe-KMMlfFVExpuO4WOBgKX0M2M0j96SrmSrPzwmF/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={[
                        sqftScopeLabel('Monthly Cash flow', 'Monthly cash flow'),
                        getDisplayValue(cashFlowPerSQFT)
                    ]}
                    description={sqftScopeDescription('Monthly NOI minus the mortgage payment', 'The cash flow')}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={[
                        sqftScopeLabel('Annual Cash flow', 'Annual cash flow'),
                        getDisplayValue(cashFlowPerSQFT * 12)
                    ]}
                    description={sqftScopeDescription('Monthly cash flow times 12', 'The cash flow')}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Debt service coverage ratio (DSCR)", Math.round(dscr * 100) / 100 + "X"]}
                    description="A bank normally is looking for 1.25 or greater"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTNoMpWgbOK0f32XSoQ2eVfe8-JmhdiCHjTPVP1jb9TYud-plRzGgtsHoAYSQzEExSZQ-Qp0fDJyxVg/pub"}
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
                    description="This is the total value of the building based on the persqft price"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vRn3jgo32H_h1Jw4oeodBPqrvw4TQt2OnN9nUC-Knok_FieP8xqK-chi-iOORGuAY6NnpzvoFyO2Xbz/pub"}
                />
                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Offer to seller", "$" + roundAndLocalString(offerPrice)]}
                    description="This is the total you will offer to the seller including closing costs"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTTnUs2pOKas85TqnynslZWKFLTaPyx7jiGnKexqv87tCcJvrdYRHgN1WyeIkP-T8sooUTCT1Sc1_6V/pub"}
                />
            </div>

            <ShareButton 
                params={params} 
                showTotalValues={showTotalValues}
                onToggleTotalValues={noiMode ? undefined : () => setShowTotalValues(!showTotalValues)}
            />

            <RangeSimulation
                pageTitle={EPageTitles[page]}
                variables={simulationVariables}
                columns={simulationColumns}
                currentValues={noiMode ? { ...calcInputs, annualNoi: removeCommas(annualNoi) } : numericInputs}
                run={(values) => {
                    if (!noiMode) {
                        return calculatePricePerSqft(values as PricePerSqftInputs);
                    }
                    return calculatePricePerSqft(
                        applyNoiToPricePerSqft(values as PricePerSqftInputs, values.annualNoi)
                    );
                }}
            />
        </div>

    );
};

export default PricePerSQFTCalculatorIndustrial;
