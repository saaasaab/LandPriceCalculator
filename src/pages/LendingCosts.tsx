import { useState } from 'react';
import DynamicRow from '../components/DynamicRow';
import { convertToPercent, copyToClipboard, monthlyPayment, removeCommas, roundAndLocalString } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import './DynamicTable.scss';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import AmortizationTable from '../components/AmorizationTable';

const LendingCosts = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    const queryParams = new URLSearchParams(window.location.search)


    const [propertyValue, setPropertyValue] = usePersistedState2(page, EAllStates.propertyValue, DEFAULT_VALUES[page].propertyValue, queryParams);
    const [loanToValue, setLoanToValue] = usePersistedState2(page, EAllStates.loanToValue, DEFAULT_VALUES[page].loanToValue, queryParams);
    const [constructionToLongTermLoan, setConstructionToLongTermLoan] = usePersistedState2(page, EAllStates.constructionToLongTermLoan, DEFAULT_VALUES[page].constructionToLongTermLoan, queryParams);


    const [loanOriginationFee, setLoanOriginationFee] = usePersistedState2(page, EAllStates.loanOriginationFee, DEFAULT_VALUES[page].loanOriginationFee, queryParams);
    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
    const [loanTerm, setLoanTerm] = usePersistedState2(page, EAllStates.loanTerm, DEFAULT_VALUES[page].loanTerm, queryParams);
    const [drawFee, setDrawFee] = usePersistedState2(page, EAllStates.drawFee, DEFAULT_VALUES[page].drawFee, queryParams);
    const [underwritingFee, setUnderwritingFee] = usePersistedState2(page, EAllStates.underwritingFee, DEFAULT_VALUES[page].underwritingFee, queryParams);
    const [inspectionFee, setInspectionFee] = usePersistedState2(page, EAllStates.inspectionFee, DEFAULT_VALUES[page].inspectionFee, queryParams);
    const [appraisalFee, setAppraisalFee] = usePersistedState2(page, EAllStates.appraisalFee, DEFAULT_VALUES[page].appraisalFee, queryParams);
    const [titleInsurance, setTitleInsurance] = usePersistedState2(page, EAllStates.titleInsurance, DEFAULT_VALUES[page].titleInsurance, queryParams);
    const [recordingFee, setRecordingFee] = usePersistedState2(page, EAllStates.recordingFee, DEFAULT_VALUES[page].recordingFee, queryParams);
    const [legalFee, setLegalFee] = usePersistedState2(page, EAllStates.legalFee, DEFAULT_VALUES[page].legalFee, queryParams);
    const [interestReserve, setInterestReserve] = usePersistedState2(page, EAllStates.interestReserve, DEFAULT_VALUES[page].interestReserve, queryParams);
    const [prepaymentPenalty, setPrepaymentPenalty] = usePersistedState2(page, EAllStates.prepaymentPenalty, DEFAULT_VALUES[page].prepaymentPenalty, queryParams);
    const [loanExtensionFee, setLoanExtensionFee] = usePersistedState2(page, EAllStates.loanExtensionFee, DEFAULT_VALUES[page].loanExtensionFee, queryParams);
    const [discountPoints, setDiscountPoints] = usePersistedState2(page, EAllStates.discountPoints, DEFAULT_VALUES[page].discountPoints, queryParams);
    const [isInterestOnly, setIsInterestOnly] = usePersistedState2(page, EAllStates.isInterestOnly, false, queryParams);



    const [copied, setCopied] = useState(false);

    const params: {
        propertyValue: string,
        loanToValue: string,
        constructionToLongTermLoan: string,
        loanOriginationFee: string,
        interestRate: string,
        loanTerm: string,
        drawFee: string,
        underwritingFee: string,
        inspectionFee: string,
        appraisalFee: string,
        titleInsurance: string,
        recordingFee: string,
        legalFee: string,
        interestReserve: string,
        prepaymentPenalty: string,
        loanExtensionFee: string,
        discountPoints: string,
    } = {
        loanOriginationFee,
        interestRate,
        loanTerm,
        drawFee,
        underwritingFee,
        inspectionFee,
        appraisalFee,
        titleInsurance,
        recordingFee,
        legalFee,
        interestReserve,
        prepaymentPenalty,
        loanExtensionFee,
        discountPoints,
        propertyValue,
        loanToValue,
        constructionToLongTermLoan
    };



    // Define loan amount variable (example)

    // Calculate dollar amounts for each percentage-based fee

    const loanAmount = removeCommas(loanToValue) / 100 * removeCommas(propertyValue);

    const loanOriginationFeeAmount = (loanAmount * (removeCommas(loanOriginationFee) / 100)).toFixed(2);
    const interestRateAmount = (loanAmount * (removeCommas(interestRate) / 100)).toFixed(2);
    const drawFeeAmount = (loanAmount * (removeCommas(drawFee) / 100)).toFixed(2);
    const underwritingFeeAmount = (loanAmount * (removeCommas(underwritingFee) / 100)).toFixed(2);
    const titleInsuranceAmount = (loanAmount * (removeCommas(titleInsurance) / 100)).toFixed(2);
    const legalFeeAmount = (loanAmount * (removeCommas(legalFee) / 100)).toFixed(2);
    const interestReserveAmount = (loanAmount * (removeCommas(interestReserve) / 100)).toFixed(2);
    const prepaymentPenaltyAmount = (loanAmount * (removeCommas(prepaymentPenalty) / 100)).toFixed(2);
    const loanExtensionFeeAmount = (loanAmount * (removeCommas(loanExtensionFee) / 100)).toFixed(2);
    const discountPointsAmount = (loanAmount * (removeCommas(discountPoints) / 100)).toFixed(2);
    const loanToValueTotalValue = (removeCommas(propertyValue) * (removeCommas(loanToValue) / 100)).toFixed(2);
    const constructionToLongTermLoanTotalValue = (loanAmount * (removeCommas(constructionToLongTermLoan) / 100)).toFixed(2);
    // Flat fee calculations
    const inspectionFeePercent = removeCommas(inspectionFee)/loanAmount;
    const appraisalFeePercent = removeCommas(appraisalFee)/loanAmount;
    const recordingFeePercent = removeCommas(recordingFee)/loanAmount;


    // Calculate interest-only payment (monthly interest payment)
    const interestOnlyPaymentAmount= roundAndLocalString((loanAmount * (removeCommas(interestRate) / 100)) / 12)
      

    // Calculate regular payment using amortization formula if not interest-only
    const regularPaymentAmount =  -monthlyPayment(loanAmount, removeCommas(loanTerm), removeCommas(interestRate)/12 / 100)


    return (

        <>
            <div className="table-container">

                <DynamicRow
                    setInput={value => setPropertyValue(value)}
                    cellValues={["Property Value ($)", propertyValue]}
                    description="Total loan amount for the project"
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setLoanToValue(value)}
                    cellValues={["Construction Loan (%)", loanToValue, loanToValueTotalValue]}
                    description="Percentage of total loan amount designated for construction loan"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setConstructionToLongTermLoan(value)}
                    cellValues={["Conversion to Long-Term Loan (%)", constructionToLongTermLoan, constructionToLongTermLoanTotalValue]}
                    description="Percentage of loan amount that converts to long-term financing"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />


                <DynamicRow
                    setInput={value => setLoanOriginationFee(value)}
                    cellValues={["Loan Origination Fee (%)", loanOriginationFee, loanOriginationFeeAmount]}
                    description="Percentage fee charged to process the loan"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setInterestRate(value)}
                    cellValues={["Interest Rate (%)", interestRate, interestRateAmount]}
                    description="Annual interest rate for the loan"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setLoanTerm(value)}
                    cellValues={["Loan Term (months)", loanTerm, ""]}
                    description="Total loan term in months"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setDrawFee(value)}
                    cellValues={["Draw Fee (%)", drawFee, drawFeeAmount]}
                    description="Percentage fee per draw on the loan"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setUnderwritingFee(value)}
                    cellValues={["Underwriting Fee (%)", underwritingFee, underwritingFeeAmount]}
                    description="Fee charged for underwriting the loan"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setInspectionFee(value)}
                    cellValues={["Inspection Fee ($)",convertToPercent(inspectionFeePercent,2), inspectionFee ]}
                    description="Flat fee for property inspections during the project"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setAppraisalFee(value)}
                    cellValues={["Appraisal Fee ($)", convertToPercent(appraisalFeePercent,2), appraisalFee]}
                    description="Flat fee for property appraisal"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setTitleInsurance(value)}
                    cellValues={["Title Insurance (%)", titleInsurance, titleInsuranceAmount]}
                    description="Percentage fee for lender's title insurance"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setRecordingFee(value)}
                    cellValues={["Recording Fee ($)", convertToPercent(recordingFeePercent,2), recordingFee]}
                    description="Flat fee for recording the loan"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setLegalFee(value)}
                    cellValues={["Legal Fee (%)", legalFee, legalFeeAmount]}
                    description="Percentage fee for legal and documentation fees"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setInterestReserve(value)}
                    cellValues={["Interest Reserve (%)", interestReserve, interestReserveAmount]}
                    description="Percentage of loan amount set aside for interest payments"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setPrepaymentPenalty(value)}
                    cellValues={["Prepayment Penalty (%)", prepaymentPenalty, prepaymentPenaltyAmount]}
                    description="Penalty percentage if loan is paid off early"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setLoanExtensionFee(value)}
                    cellValues={["Loan Extension Fee (%)", loanExtensionFee, loanExtensionFeeAmount]}
                    description="Percentage fee for extending the loan term"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={value => setDiscountPoints(value)}
                    cellValues={["Discount Points (%)", discountPoints, discountPointsAmount]}
                    description="Points to reduce loan interest rate, each point is 1% of loan amount"
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setBooleanInput={() => setIsInterestOnly(!isInterestOnly)}
                    booleanInputIndex={1}
                    cellValues={['Interest-Only Option', isInterestOnly]}
                    description="Check if the loan has an interest-only payment option"
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Interest-Only Payment ($)', isInterestOnly ? interestOnlyPaymentAmount : "0"]}
                    description="Monthly payment if interest-only option is selected"
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Regular Payment ($)', !isInterestOnly ? regularPaymentAmount : "0"]}
                    description="Monthly payment if regular amortized loan"
                    isMobile={isMobile}
                    numberOfCells={2}
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

                {/* <DynamicRow
                    cellValues={["Calculted IRR for the property", (XIRRCalculation * 100).toFixed(1) + "%"]}
                    description="At the price you're offerine, the owner is recieving an equivalent return of this rate."
                    isMobile={isMobile}
                    numberOfCells={2}
                /> */}

                <AmortizationTable
                    loanAmount={loanAmount}
                    interestRate={removeCommas(interestRate)}
                    loanTerm={removeCommas(loanTerm)}
                    regularPayment={regularPaymentAmount}
                    constructionPhaseMonths={12}
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

export default LendingCosts;
