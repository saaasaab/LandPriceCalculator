import { useState } from 'react';
import './DynamicRow.scss';
import { formatNumberWithCommas } from '../utils/utils';



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
}:
    {
        cellValues: (string | number | boolean | undefined)[]
        description?: string,
        setInput?: (value: string) => void
        setBooleanInput?: (event: React.ChangeEvent<HTMLInputElement>) => void,
        isMobile: boolean;
        numberOfCells: number;
        inputCellIndex?: number;
        booleanInputIndex?: number;
        output?: boolean;
        header?: boolean;
        // type?: 'currency' | 'percentage' | 'number';


    }) => {

    const [cell,setCell]=useState(cellValues[inputCellIndex||-1]  as (string | number | readonly string[] | undefined));
    const [isClicked, setIsClicked] = useState(false);
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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, ''); // Ensure only numbers
       
        // console.log(`rawValue`, rawValue)
        // let newValue=value.replace(/,/g, "");
        // let abc = newValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

       
        const formattedValue = formatNumberWithCommas(rawValue);
        console.log(`rawValue`, rawValue,formattedValue)

        setCell(formattedValue);
        setInput&& setInput(formattedValue);
      };


    const constructRow = () => {
        const cells = []
        for (let i = 1; i < numberOfCells; i++) { // Start at 1 because 0th index is always the cell title.
            if (inputCellIndex && i === inputCellIndex && setInput) {
                // const cellValue = cellValues[inputCellIndex] as (string | number | readonly string[] | undefined)
                
                cells.push(
                    <div key={i} className={`dynamic-cell input-cell centered ${getCellClass(i)}`}>
                        <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                            <input
                                id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                                className="centered"
                                type="text"
                                value={cell}
                                onChange={handleChange}
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
