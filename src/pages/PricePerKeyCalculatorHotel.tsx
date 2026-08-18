import { convertToPercent, removeCommas, roundAndLocalString, roundToDecimal } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import OutputRow from '../components/RowTypes/OutputRow';

import './DynamicTable.scss';



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
    };

    const cashOnCashReturnMonthly = removeCommas(cashOnCashReturn) / 100 / 12;

    const interestRateMonthly = (removeCommas(interestRate) || .0000001) / 100 / 12;
    const numberOfPayments = removeCommas(numberOfYears) * 12;
    const mortTop = interestRateMonthly * Math.pow((1 + interestRateMonthly), numberOfPayments);
    const mortBottom = Math.pow(1 + interestRateMonthly, numberOfPayments) - 1;

    const mort = mortTop / mortBottom;

    const occupancyRate = 1 - (removeCommas(vacancy) / 100);
    const monthlyPotentialRevenue = removeCommas(adr) * (365 / 12);
    const effectiveGrossIncome = monthlyPotentialRevenue * occupancyRate;
    const operatingIncome = effectiveGrossIncome * (1 - removeCommas(expensePercentage) / 100);

    const pricePerKey = operatingIncome / ((removeCommas(downPayment) / 100) * cashOnCashReturnMonthly + ((1 - (removeCommas(downPayment) / 100)) * mort));

    const mortgagePayment = (mort * pricePerKey * (1 - removeCommas(downPayment) / 100));
    const cashFlowPerKey = operatingIncome - mortgagePayment;

    const DSCR = operatingIncome / (mort * pricePerKey * (1 - removeCommas(downPayment) / 100));
    const capRate = operatingIncome * 12 / pricePerKey;
    const revPAR = removeCommas(adr) * occupancyRate;

    const totalPrice = removeCommas(rooms) * pricePerKey;
    const totalBuyersAgentFee = removeCommas(buyersAgentFee) / 100 * totalPrice;
    const totalClosingCosts = removeCommas(clostingCostsFee) / 100 * totalPrice;

    const offerPrice = totalPrice - totalBuyersAgentFee - totalClosingCosts;
    const roomRevenueMultiplier = offerPrice / (12 * effectiveGrossIncome * removeCommas(rooms));

    return (

        <div className="group-section price-per-door-calculator">
            <div className="input-fields-container has-bottom-border">

                <InputRow
                    isMobile={isMobile}
                    setInput={value => setAdr(value)}
                    cellValues={["Average Daily Rate (ADR)", adr]}
                    description="The average room rate charged per occupied night"
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setRooms(value)}
                    cellValues={["Number of rooms (#)", rooms]}
                    description="How many guest rooms are in the hotel"
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
                    setInput={value => setVacancy(value)}
                    cellValues={["Vacancy (%)", vacancy]}
                    description="The percentage of room-nights that are unoccupied. Occupancy is 100% minus vacancy. A 30% vacancy equals 70% occupancy."
                    isPercent={true}
                />
                <InputRow
                    isMobile={isMobile}
                    setInput={value => setExpensePercentage(value)}
                    cellValues={["Expense Percentages (%)", expensePercentage]}
                    description="Operating expenses as a percentage of occupied room revenue. Vacancy is entered separately. Limited-service hotels often run 60-70% expense ratios."
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
                    cellValues={["Price per key you should pay", "$" + roundAndLocalString(pricePerKey)]}
                    description={`This is the max you should pay per room to achieve the desired returns`}
                    helpLink="https://docs.google.com/document/d/e/2PACX-1vTD8sk8fWqj0tRdPhqENwbbR8TZmuBxJES4a5xTmQ69r9n3bHtSqlgcJK2AFPa-kYmZlqykmZhhAkJF/pub"
                />
                <OutputRow
                    isMobile={isMobile}
                    cellValues={["RevPAR", "$" + roundToDecimal(revPAR, 2)]}
                    description="Revenue per available room: ADR multiplied by occupancy (100% minus vacancy)"
                />
                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Operating income per room", "$" + roundAndLocalString(operatingIncome)]}
                    description="Monthly NOI per room after vacancy and operating expenses"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTfgj_1vPDOl_cr3VD5beGl4kcMDstWAcPownovQ71hQhTgPCcoETEZg0a69Z5y42ds9PDirE0vscWl/pub"}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Mortgage Payment per room", "$" + roundAndLocalString(mortgagePayment)]}
                    description="The payment for the mortgage per room"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vSqIxRzLoXKwnS9ZqPx_i6O3RE8netRC3KeBNPfbe-KMMlfFVExpuO4WOBgKX0M2M0j96SrmSrPzwmF/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Cash flow per room", "$" + roundAndLocalString(cashFlowPerKey)]}
                    description="The cash flow per room"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTP6gEErgaXV_5Z1JDvgAT-ZGldWq5675VWWVVojQyyZ0zRya7dGUCvLVcydkMTTDG5j5UadJt9psQk/pub"}
                />


                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Debt service coverage ratio (DSCR)", Math.round(DSCR * 100) / 100 + "X"]}
                    description="A bank normally is looking for 1.25 or greater"
                    helpLink={"https://docs.google.com/document/d/e/2PACX-1vTNoMpWgbOK0f32XSoQ2eVfe8-JmhdiCHjTPVP1jb9TYud-plRzGgtsHoAYSQzEExSZQ-Qp0fDJyxVg/pub"}
                />

                <OutputRow
                    isMobile={isMobile}
                    cellValues={["Room Revenue Multiplier", roundToDecimal(roomRevenueMultiplier, 2) + "X"]}
                    description="The room revenue multiplier is the offer price divided by annual occupied room revenue."
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
        </div>

    );
};

export default HotelPriceCalculator;
