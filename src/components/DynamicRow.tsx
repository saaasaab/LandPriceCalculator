import { useState } from 'react';
import './DynamicRow.scss';

// Utility function to format number with commas
const formatWithCommas = (number: string) => {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Utility function to remove non-numeric characters
const removeNonNumeric = (value: string) => {
    return value.replace(/[^0-9]/g, "");
};


const DynamicRow = ({
    description,
    setInput,
    isMobile,
    cellValues,
    numberOfCells,
    inputCellIndex,
    output,
    header,
    setBooleanInput,
    booleanInputIndex,
    // type
}:
    {
        cellValues: (string | number | boolean | undefined)[]
        description?: string,
        setInput?: (event: React.ChangeEvent<HTMLInputElement>) => void,
        setBooleanInput?: (event: React.ChangeEvent<HTMLInputElement>) => void,
        isMobile: boolean;
        numberOfCells: number;
        inputCellIndex?: number;
        booleanInputIndex?: number;
        output?: boolean;
        header?: boolean;
        // type?: 'currency' | 'percentage' | 'number';


    }) => {

        

    const [isClicked, setIsClicked] = useState(false);


    // Construct the rows based on the cellValues and which cell is the input


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


    const constructRow = () => {
        const cells = []
        console.log(`booleanInputIndex`, booleanInputIndex)
        for (let i = 1; i < numberOfCells; i++) { // Start at 1 because 0th index is always the cell title.
            if (inputCellIndex && i === inputCellIndex && setInput) {
                const cellValue = cellValues[inputCellIndex] as (string | number | readonly string[] | undefined)
                cells.push(
                    <div key={i} className={`dynamic-cell input-cell centered ${getCellClass(i)}`}>
                        <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                            <input
                                id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                                className="centered"
                                type="number"
                                defaultValue={cellValue}
                                onChange={setInput}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                onFocus={(e) => e.target.select()} // Select the input text on focus
                            />
                        </label>
                    </div>
                )
            }
            else if (booleanInputIndex && i === booleanInputIndex && setBooleanInput) {
                console.log(`cellValues[inputCellIndex]`, cellValues[booleanInputIndex])
                cells.push(
                    <div key={i} className={`dynamic-cell input-cell centered ${getCellClass(i)}`}>
                        <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                            <input
                                id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                                className="centered"
                                type="checkbox"
                                checked={Boolean(cellValues[booleanInputIndex])}
                                onChange={setBooleanInput}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                onFocus={(e) => e.target.select()} // Select the input text on focus
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

                {description && isMobile && !isClicked ? <></> :
                    <div className="description-cell">
                        {description}
                    </div>
                }
            </div>
            {constructRow()}
        </div>
    )
}
export default DynamicRow;
