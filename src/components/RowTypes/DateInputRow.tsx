import { useState } from 'react';

const InputRow = ({
    description,
    setInput,
    cellValues,
    // isMobile,
}:
    {
        cellValues: (string | number | boolean | undefined)[];
        description?: string;
        setInput?: (value: string) => void;
        isMobile: boolean;

    }) => {
    const [cell, setCell] = useState((`${cellValues[1]}`) as (string | number | readonly string[] | undefined));
    const [isClicked, setIsClicked] = useState(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCell(`${e.target.value}`);
        setInput && setInput(e.target.value)
    }

    return (
        <div className={`input-row`}>
            <div className="info-cell" onClick={() => setIsClicked(!isClicked)}>
                <h4>{cellValues[0]}</h4>
                {/* && isMobile */}


                {!description || (description && !isClicked) ? <></> :
                    <div className="description-cell">
                        {description}
                    </div>
                }
            </div>

            <div className={`input-cell input-cell-date`}>
                <label htmlFor={`${(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}`}>
                    <input
                        id={(cellValues[0] || "undefined").toString().replace(/[^A-Z0-9]/ig, "_")}
                        className="centered"
                        type={"date"}
                        value={cell}
                        onChange={handleDateChange}
                        onWheel={(value) => (value.target as HTMLElement).blur()}
                        onFocus={(value) => value.target.select()} // Select the input text on focus
                    />
                </label>
            </div>

        </div>
    )
}
export default InputRow;
