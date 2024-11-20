import { OutputKeysForIndustrialDevelopmentCalculator } from '../pages/IndustrialDevelopmentCalculator';
import './PopupBox.scss';
// import close_icon from '../assets/closeicon--black.svg'
// import Plus from  '../assets/plus.png'
// import { useState } from 'react';


const PopupBox = ({
    data,
    titles,
    setActiveCards,
    dataKeys,
}:
    {
        data: string[];
        titles: string[];
        setActiveCards?: React.Dispatch<React.SetStateAction<Set<OutputKeysForIndustrialDevelopmentCalculator>>>;
        dataKeys?: OutputKeysForIndustrialDevelopmentCalculator[];
    }) => {

    const handleClick = (index: number,) => {
        dataKeys && setActiveCards && setActiveCards(prev => {
            const id = dataKeys[index];
            const newSet = new Set(prev);
            if (newSet.has(id as OutputKeysForIndustrialDevelopmentCalculator)) {
                newSet.delete(id as OutputKeysForIndustrialDevelopmentCalculator);
            } else {
                newSet.add(id as OutputKeysForIndustrialDevelopmentCalculator);
            }
            return newSet;
        });


    }
    // const [boxes, setBoxes] = useState(1)
    return (

        <div className="popup-box-container">
            {data.map((d: string, i: number) =>
                <div key={d} className="popup-box" onClick={() => handleClick(i)}>
                    <div className="box-title">{titles[i]}</div>
                    <div className="box-data">{d}</div>
                </div>
            )}
        </div>
    )
}
export default PopupBox;
