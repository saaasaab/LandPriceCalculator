import { useEffect, useState } from 'react';
import { formatNumberWithCommas } from '../../utils/utils';




const InputRow = ({
    description,
    setInput,
    cellValues,
    isPercent,
    isGreyedOut
}:
    {
        cellValues: (string | number | boolean | undefined)[];
        description?: string;
        setInput?: (value: string) => void;
        isMobile: boolean;
        isPercent?: boolean;
        isGreyedOut?: boolean;

    }) => {
    const [cell, setCell] = useState((`${cellValues[1]}`) as (string | number | readonly string[] | undefined));



    useEffect(() => {

        setCell(`${cellValues[1]}`);
    }, [cellValues[1]]);


    const [isClicked, setIsClicked] = useState(false);

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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = removeNonNumeric(e.target.value); // Ensure only numbers

        if (isPercent && Number(rawValue) > 100) {
            return;
        }

        const formattedValue = formatNumberWithCommas(rawValue);
        setCell(`${formattedValue}`);//  ${inputUnits?inputUnits:""}
        setInput && setInput(formattedValue);

    };

    // ${isMobile?"is-mobile":""}
    return (
        <div className={`input-row ${isGreyedOut ? "is-greyed-out" : ""}`}>
            <div className="info-cell" onClick={() => setIsClicked(!isClicked)}>
                <h4>{cellValues[0]}</h4>
                {/* && isMobile */}


                {!description || (description && !isClicked) ? <></> :
                    <div className="description-cell">
                        {description}
                    </div>
                }
            </div>

            <div className={`input-cell`}>
                <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                    <input
                        id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                        className="centered"
                        type={"text"}
                        value={cell}
                        onChange={handleChange}
                        onWheel={(value) => (value.target as HTMLElement).blur()}
                        onFocus={(value) => value.target.select()} // Select the input text on focus
                    />
                </label>
            </div>

        </div>
    )
}
export default InputRow;
