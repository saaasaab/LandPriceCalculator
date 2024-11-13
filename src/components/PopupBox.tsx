import './PopupBox.scss';
// import Plus from  '../assets/plus.png'
// import { useState } from 'react';


const PopupBox = ({
    data,
    title,
}:
    {
        data: string;
        title: string;
    }) => {

        // const [boxes, setBoxes] = useState(1)
    return (

        <div className="popup-box-container">
            <>
                <div className="popup-box">
                    <div className="box-title">{title}</div>
                    <div className="box-data">{data}</div>

                </div>

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
