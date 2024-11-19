import './PopupBox.scss';
// import close_icon from '../assets/closeicon--black.svg'
// import Plus from  '../assets/plus.png'
// import { useState } from 'react';


const PopupBox = ({
    data,
    titles,
}:
    {
        data: string[];
        titles: string[];
    }) => {

        console.log(`data`, data)
    // const [boxes, setBoxes] = useState(1)
    return (

        <div className="popup-box-container">
            {data.map((d: string, i: number) =>
                <div key={d} className="popup-box">
                    <div className="box-title">{titles[i]}</div>
                    <div className="box-data">{d}</div>
                </div>
            )}
            <>
               

                {/* <div className="active-grid-goal-container empty" data-modal-event="new-grid-goal" >
                    <div className="add-new-gridgoal">
                        <img src={Plus } alt="add goal" />
                    </div>
                </div> */}
            </>
        </div>
    )
}
export default PopupBox;
