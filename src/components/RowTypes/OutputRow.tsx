import { useState } from 'react';

const OutputRow = ({
    description,
    cellValues,
}:
    {
        cellValues: (string | number | boolean | undefined)[];
        description?: string;
        isMobile: boolean;
    }) => {

    const [isClicked, setIsClicked] = useState(false);
    return (
        <div className="output-row-container"  onClick={() => setIsClicked(!isClicked)}>

            <div className={`output-row`}>
                <div className="info-cell first-cell">
                    <h4>{cellValues[0]}</h4>
                    {/* && isMobile */}
                </div>
                <div className={`output-cell`} >
                    {cellValues[1]}
                </div>

            </div>
            {!description || (description && !isClicked) ? <></> :
                <div className="description-cell">
                    {description}
                </div>
            }
        </div>
    )
}
export default OutputRow;
