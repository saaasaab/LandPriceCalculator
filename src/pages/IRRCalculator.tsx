import { convertToPercent, removeCommas } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import './DynamicTable.scss';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import { XIRR } from '../utils/xirrCalculation';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import DateInputRow from '../components/RowTypes/DateInputRow';
import OutputRow from '../components/RowTypes/OutputRow';
// import AssumptionsComponent from '../components/AdvancedAssumptions';

const IRRCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    const queryParams = new URLSearchParams(window.location.search)


    const [originalPurchasePrice, setOriginalPurchasePrice] = usePersistedState2(page, EAllStates.originalPurchasePrice, DEFAULT_VALUES[page].originalPurchasePrice, queryParams);
    const [originalPurchaseDate, setOriginalPurchaseDate] = usePersistedState2(page, EAllStates.originalPurchaseDate, DEFAULT_VALUES[page].originalPurchaseDate, queryParams);
    const [newPurchasePrice, setNewPurchasePrice] = usePersistedState2(page, EAllStates.newPurchasePrice, DEFAULT_VALUES[page].newPurchasePrice, queryParams);



    // const [includeCashflows, setIncludeCashflows] = useState(false)
    // const [cashflowMonthly, setaCashflowMonthly] = useState("100");

    const params: {
        originalPurchasePrice: string,
        originalPurchaseDate: string,
        newPurchasePrice: string,
    } = {
        originalPurchasePrice,
        originalPurchaseDate,
        newPurchasePrice,
    };




    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const cashFlowAmounts = [-removeCommas(originalPurchasePrice), removeCommas(newPurchasePrice)]
    const cashFlowDates = [originalPurchaseDate, formattedDate]


    // if (includeCashflows) {
    //     const monthsArray = getMonthsBetweenDates(originalPurchaseDate, formattedDate);
    //     const filledArray = new Array(monthsArray.length).fill(removeCommas(cashflowMonthly));
    //     cashFlowAmounts.push(...filledArray);
    //     cashFlowDates.push(...monthsArray);
    // }


    const XIRRCalculation = XIRR(cashFlowAmounts, cashFlowDates)


    return (

        <>
            {/* <AssumptionsComponent checked={includeCashflows} setInput={setIncludeCashflows}/> */}
            {/* {
                    includeCashflows ?
                        <DynamicRow
                            setInput={value => setaCashflowMonthly(value)}
                            cellValues={["Estimated monthly cashflows per unit ($)", cashflowMonthly]}
                            description="To get a more acscurate, we'll take into account all the cashflows over the life of the property. This is a simple estimate assuming X dollars per month per unit coming in over the life of the property."
                            isMobile={isMobile}
                            numberOfCells={2}
                            inputCellIndex={1}
                        /> : <></>
                } */}


            <div className="group-section">
                <div className="input-fields-container has-bottom-border" >
                    <DateInputRow
                        setInput={value => setOriginalPurchaseDate(value)}
                        cellValues={["Owner purchase date", originalPurchaseDate]}
                        description="When did the current owner purchase the property"
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={value => setOriginalPurchasePrice(value)}
                        cellValues={["Owner purchase price", originalPurchasePrice]}
                        description="What did the owner pay for the property"
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={value => setNewPurchasePrice(value)}
                        cellValues={["Your purchase price", newPurchasePrice]}
                        description="How much are you wanting to pay for the property"
                        isMobile={isMobile}
                    />
                </div>


                <div className="output-fields-container">
                    <OutputRow
                        cellValues={["Calculted IRR for the property", convertToPercent(XIRRCalculation, 1)]}
                        description="At the price you're offering, the owner is recieving an equivalent return of this rate."
                        isMobile={isMobile}
                    />
                </div>

                <ShareButton params={params} />
            </div>

        </>





    );
};

export default IRRCalculator;
