import { useState } from 'react';
import DynamicRow from '../components/DynamicRow';
import { convertToPercent, copyToClipboard, removeCommas } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import './DynamicTable.scss';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import { XIRR } from '../utils/xirrCalculation';

const WaterfallGenerator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    const queryParams = new URLSearchParams(window.location.search)


    const [originalPurchasePrice, setOriginalPurchasePrice] = usePersistedState2(page, EAllStates.originalPurchasePrice, DEFAULT_VALUES[page].originalPurchasePrice, queryParams);
    const [originalPurchaseDate, setOriginalPurchaseDate] = usePersistedState2(page, EAllStates.originalPurchaseDate, DEFAULT_VALUES[page].originalPurchaseDate, queryParams);
    const [newPurchasePrice, setNewPurchasePrice] = usePersistedState2(page, EAllStates.newPurchasePrice, DEFAULT_VALUES[page].newPurchasePrice, queryParams);

    const [copied, setCopied] = useState(false);

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

    const XIRRCalculation = XIRR([-removeCommas(originalPurchasePrice), removeCommas(newPurchasePrice)], [
        originalPurchaseDate, formattedDate
    ])

    return (

        <>
            <div className="table-container">
                <DynamicRow
                    cellValues={["IRR Levers"]}
                    //   description={'These are the levers investors can pull that are responsible for determining how much a property is worth'}
                    isMobile={isMobile}
                    numberOfCells={1}
                    header={true}
                />
                <DynamicRow
                    setInput={value => setOriginalPurchaseDate(value)}
                    cellValues={["Owner purchase date", originalPurchaseDate]}
                    description="When did the current owner purchase the property"
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    isDatePicker={true}
                />
                <DynamicRow
                    setInput={value => setOriginalPurchasePrice(value)}
                    cellValues={["Owner purchase price", originalPurchasePrice]}
                    description="What did the owner pay for the property"
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={value => setNewPurchasePrice(value)}
                    cellValues={["Your purchase price", newPurchasePrice]}
                    description="How much are you wanting to pay for the property"
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
                    cellValues={["Calculted IRR for the property", convertToPercent(XIRRCalculation, 1)]}
                    description="At the price you're offering, the owner is recieving an equivalent return of this rate."
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

export default WaterfallGenerator;
