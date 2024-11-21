import { OutputKeys } from '../utils/constants';
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
        setActiveCards?: React.Dispatch<React.SetStateAction<Set<OutputKeys>>>;
        dataKeys?: OutputKeys[];
    }) => {

    const handleClick = (index: number,) => {
        dataKeys && setActiveCards && setActiveCards(prev => {
            const id = dataKeys[index];
            const newSet = new Set(prev);
            newSet.delete(id as OutputKeys);

            // if (newSet.has(id as OutputKeys)) {
            // } else {
            //     newSet.add(id as OutputKeys);
            // }
            return newSet;
        });
    }
    return (

        <div className="popup-box-container">
            {dataKeys?.map((d: string, i: number) =>
                <div key={d} className="popup-box" onClick={() => handleClick(i)}>
                    <div className="box-title">{titles[i]}</div>
                    <div className="box-data">{data[i]}</div>
                </div>
            )}
        </div>
    )
}
export default PopupBox;
