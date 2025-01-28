import { useState } from 'react';
import QuestionMark from './HelpLink';


const OutputRow = ({
    description,
    cellValues,
    equation,
    helpLink,
}:
    {
        cellValues: (string | number | boolean | undefined)[];
        description?: string;
        isMobile: boolean;
        equation?: JSX.Element;
        helpLink?: string
    }) => {

    const [isClicked, setIsClicked] = useState(false);
    return (
        <div className="output-row-container" onClick={() => setIsClicked(!isClicked)}>

            <div className={`output-row`}>
                <div className="info-cell first-cell">
                    <h4>{cellValues[0]}
                        {!!helpLink ? <QuestionMark helpLink={helpLink} /> : <></>}
                    </h4>

                    

                    {/* && isMobile */}
                </div>
                <div className={`output-cell`} >
                    {cellValues[1]}
                </div>


            </div>

            {!description || (description && !isClicked) ? <></> :
                <div className="description-cell">
                    {description}
                    {!!equation ? <div className="equation">
                        {equation}
                    </div> : <></>}
                </div>
            }
        </div>
    )
}
export default OutputRow;
