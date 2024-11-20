import { useState } from 'react';
import './DynamicRow.scss';
import { formatNumberWithCommas } from '../../utils/utils';
import { OutputKeysForIndustrialDevelopmentCalculator } from '../../pages/IndustrialDevelopmentCalculator';



const DynamicRow = ({
    description,
    setInput,
    // isMobile,
    cellValues,
    numberOfCells,
    inputCellIndex,
    output,
    header,
    setBooleanInput,
    booleanInputIndex,
    isDatePicker,
    setActiveCards,
    id,
    activeCards
    // inputUnits
}:
    {
        cellValues: (string | number | boolean | undefined)[]
        description?: string | null;
        setInput?: (value: string) => void
        setBooleanInput?: (event: React.ChangeEvent<HTMLInputElement>) => void,
        isMobile: boolean;
        isDatePicker?: boolean;
        numberOfCells: number;
        inputCellIndex?: number;
        booleanInputIndex?: number;
        output?: boolean;
        header?: boolean;
        inputUnits?: string
        setActiveCards?: React.Dispatch<React.SetStateAction<Set<OutputKeysForIndustrialDevelopmentCalculator>>>;
        id?: string | number;
        activeCards?: Set<OutputKeysForIndustrialDevelopmentCalculator>;
        // type?: 'currency' | 'percentage' | 'number';


    }) => {
    //  ${inputUnits?inputUnits:""}

    const [cell, setCell] = useState((`${cellValues[inputCellIndex || -1]}`) as (string | number | readonly string[] | undefined));
    const [isClicked, setIsClicked] = useState(false);


    const isActiveCard = activeCards && activeCards.has(id as OutputKeysForIndustrialDevelopmentCalculator)

    const getCellClass = (cellIndex: number) => {
        switch (cellIndex) {
            case 0:
                return "first-cell";
            case 1:
                return "second-cell";
            case 2:
                return "third-cell";
            case 3:
                return "fourth-cell";
            default:
                break;
        }
    }
    const getRowClass = (cellIndex: number) => {
        switch (cellIndex) {
            case 1:
                return "one-cell-row";
                break;
            case 2:
                return "two-cell-row";
                break;
            case 3:
                return "three-cell-row";
                break;
            case 4:
                return "four-cell-row";
                break;
            default:
                break;
        }
    }

    function removeNonNumeric(input: string): string {
        // Remove all non-numeric characters except for the first period
        const cleanedInput = input.replace(/[^0-9.]/g, '');

        // Check if there's more than one period
        const firstPeriodIndex = cleanedInput.indexOf('.');
        if (firstPeriodIndex !== -1) {
            // Allow only the first period and remove any subsequent periods
            return (
                cleanedInput.slice(0, firstPeriodIndex + 1) +
                cleanedInput.slice(firstPeriodIndex + 1).replace(/\./g, '')
            );
        }

        return cleanedInput;
    }


    const toggleCard = (id: string) => {
        setActiveCards && setActiveCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id as OutputKeysForIndustrialDevelopmentCalculator)) {
                newSet.delete(id as OutputKeysForIndustrialDevelopmentCalculator);
            } else {
                newSet.add(id as OutputKeysForIndustrialDevelopmentCalculator);
            }
            return newSet;
        });
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const rawValue = removeNonNumeric(e.target.value); // Ensure only numbers

        const formattedValue = formatNumberWithCommas(rawValue);
        setCell(`${formattedValue}`);//  ${inputUnits?inputUnits:""}
        setInput && setInput(formattedValue);
    };


    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCell(`${e.target.value}`);
        setInput && setInput(e.target.value)
    }

    const constructRow = () => {
        const cells = []
        for (let i = 1; i < numberOfCells; i++) { // Start at 1 because 0th index is always the cell title.
            if (inputCellIndex && i === inputCellIndex && setInput) {
                cells.push(
                    <div key={i} className={`dynamic-cell input-cell centered ${getCellClass(i)}`}>
                        <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                            <input
                                id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                                className="centered"
                                type={isDatePicker ? "date" : "text"}
                                value={cell}
                                onChange={isDatePicker ? handleDateChange : handleChange}
                                onWheel={(value) => (value.target as HTMLElement).blur()}
                                onFocus={(value) => value.target.select()} // Select the input text on focus
                            />
                        </label>
                    </div>
                )
            }
            else if (booleanInputIndex && i === booleanInputIndex && setBooleanInput) {
                cells.push(
                    <div key={i} className={`dynamic-cell input-cell centered ${getCellClass(i)}`}>
                        <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                            <input
                                id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                                className="centered"
                                type="checkbox"
                                checked={Boolean(cellValues[booleanInputIndex])}
                                onChange={setBooleanInput}
                                onWheel={(value) => (value.target as HTMLElement).blur()}
                                onFocus={(value) => value.target.select()} // Select the input text on focus
                            />
                        </label>
                    </div>
                )
            }

            else {
                cells.push(
                    <div key={i} className={`dynamic-cell info-cell centered ${getCellClass(i)}`} >
                        {cellValues[i]}
                    </div>
                )
            }
        }

        return cells;
    }

    return (
        <div className={`dynamic-row ${getRowClass(numberOfCells)} ${output ? "output-row" : ""} ${header ? "title-row" : ""} `}>
            <div className="info-cell first-cell" onClick={() => setIsClicked(!isClicked)}>
                <h4>{cellValues[0]}</h4>

                {!description || (description && !isClicked) ? <></> :
                    <div className="description-cell">
                        {description}
                    </div>
                }
            </div>
            {constructRow()}

            {toggleCard && id &&
                <div onClick={() => { toggleCard(id.toString()) }} className={`hover-add-icon ${isActiveCard ? "hover-add-icon-active" : ""}`}>
                    {
                        isActiveCard ? `✓` : "+"
                    }
                </div>
            }
        </div>
    )
}
export default DynamicRow;
