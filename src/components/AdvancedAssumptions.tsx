import React, { useState } from 'react';
import './AdvancedAssumptions.scss';
interface AssumptionProps {
    checked: boolean;
    setInput: (value: boolean) => void;  // Function to handle checkbox state update
}

const AssumptionsComponent: React.FC<AssumptionProps> = ({ checked, setInput }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="advanced-assumptions">
            <div className="assumptions-title">

                <h2>Advanced Assumptions</h2>
                <button  className={`toggle-button ${isCollapsed ? 'collapsed' : 'expanded'}`}onClick={handleToggleCollapse}>
                    {/* Conditional rendering of the caret icon */}
                    {/* {isCollapsed ? '⌃' : ''} */}
                    <span className="chevron">⌄</span>
                </button>

            </div>

            {/* Render the assumption component with passed props */}
            {!isCollapsed && (
                <div className="assumptions-content">
                    <label htmlFor="includeCashflows">
                        Include Estimated Cashflows
                        <input
                            type="checkbox"
                            id="includeCashflows"
                            checked={checked}
                            onChange={(e) => setInput(e.target.checked)} // Update state based on checkbox value
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default AssumptionsComponent;
