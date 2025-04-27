import React, { useState, useEffect } from 'react';
import { EPageNames } from '../utils/types';
import ShareButton from '../components/ShareButton';
import './ConstructionLoanCalculator.scss';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates } from '../utils/types';
import { v4 as uuidv4 } from 'uuid';
import { monthlyPayment } from '../utils/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AlphaBanner from '../pages/SiteplanDesigner/AlphaBanner';

interface Milestone {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    drawdownAmount: number;
    completed: boolean;
}

interface SortableRowProps {
    id: string;
    milestone: Milestone;
    updateMilestone: (id: string, updates: Partial<Milestone>) => void;
    removeMilestone: (id: string) => void;
}

interface LoanTranche {
    date: string;
    amount: number;
    daysToProjectEnd: number;
    interestAccrued: number;
}

const SortableRow = ({ id, milestone, updateMilestone, removeMilestone }: SortableRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleDrawdownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string or valid numbers
        if (value === '' || !isNaN(parseFloat(value))) {
            updateMilestone(milestone.id, { 
                drawdownAmount: value === '' ? 0 : parseFloat(value)
            });
        }
    };

    return (
        <tr 
            ref={setNodeRef} 
            style={style}
            className={isDragging ? 'dragging' : ''}
        >
            <td {...attributes} {...listeners} style={{ cursor: 'grab' }}>
                ⋮⋮
            </td>
            <td>
                <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(milestone.id, { name: e.target.value })}
                    placeholder="Milestone name"
                />
            </td>
            <td>
                <input
                    type="date"
                    value={milestone.startDate}
                    onChange={(e) => updateMilestone(milestone.id, { startDate: e.target.value })}
                />
            </td>
            <td>
                <input
                    type="date"
                    value={milestone.endDate}
                    onChange={(e) => updateMilestone(milestone.id, { endDate: e.target.value })}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={milestone.drawdownAmount || ''}
                    onChange={handleDrawdownChange}
                    min="0"
                    step="1000"
                    placeholder="Enter amount"
                />
            </td>
            <td>
                <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={(e) => updateMilestone(milestone.id, { completed: e.target.checked })}
                />
            </td>
            <td>
                <button onClick={() => removeMilestone(milestone.id)}>Remove</button>
            </td>
        </tr>
    );
};

const defaultMilestones: Milestone[] = [
    {
        id: uuidv4(),
        name: "Site Preparation",
        startDate: new Date(new Date().getFullYear(), 2, 30).toISOString().split('T')[0], // March 30
        endDate: new Date(new Date().getFullYear(), 3, 5).toISOString().split('T')[0],   // April 5
        drawdownAmount: 50000,
        completed: false
    },
    {
        id: uuidv4(),
        name: "Foundation Work",
        startDate: new Date(new Date().getFullYear(), 3, 6).toISOString().split('T')[0],  // April 6
        endDate: new Date(new Date().getFullYear(), 3, 20).toISOString().split('T')[0],   // April 20
        drawdownAmount: 100000,
        completed: false
    },
    {
        id: uuidv4(),
        name: "Framing",
        startDate: new Date(new Date().getFullYear(), 3, 21).toISOString().split('T')[0], // April 21
        endDate: new Date(new Date().getFullYear(), 4, 10).toISOString().split('T')[0],   // May 10
        drawdownAmount: 150000,
        completed: false
    },
    {
        id: uuidv4(),
        name: "Utilities Installation",
        startDate: new Date(new Date().getFullYear(), 4, 11).toISOString().split('T')[0], // May 11
        endDate: new Date(new Date().getFullYear(), 4, 25).toISOString().split('T')[0],   // May 25
        drawdownAmount: 75000,
        completed: false
    }
];

const ConstructionLoanCalculator = ({  page }: { isMobile: boolean; page: EPageNames; }) => {
    const queryParams = new URLSearchParams(window.location.search);
    
    const [loanAmount, setLoanAmount] = usePersistedState2(page, EAllStates.constructionLoanAmount, "1,000,000", queryParams);
    const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.constructionInterestRate, "12", queryParams);
    const [points, setPoints] = usePersistedState2(page, EAllStates.points, "", queryParams);
    const [refinanceEnabled, setRefinanceEnabled] = usePersistedState2(page, EAllStates.refinanceEnabled, false, queryParams);
    const [permanentRate, setPermanentRate] = usePersistedState2(page, EAllStates.permanentRate, "7", queryParams);
    const [permanentTerm, setPermanentTerm] = usePersistedState2(page, EAllStates.permanentTerm, "360", queryParams);
    const [monthlyPaymentAmount, setMonthlyPaymentAmount] = useState<number>(0);
    const [totalPermanentInterest, setTotalPermanentInterest] = useState<number>(0);
    const [milestones, setMilestones] = usePersistedState2(page, EAllStates.milestones, defaultMilestones, queryParams);
    const [loanTranches, setLoanTranches] = usePersistedState2<LoanTranche[]>(page, EAllStates.loanTranches, [], queryParams);
    const [totalInterestAccrued, setTotalInterestAccrued] = useState<number>(0);
    const [totalLoanAmount, setTotalLoanAmount] = useState<number>(0);
    const [totalLoanDuration, setTotalLoanDuration] = useState<number>(0);

    const params = new URLSearchParams(window.location.search);

    
    const loanAmountParam = params.get('loanAmount');
    const interestRateParam = params.get('interestRate');
    const pointsParam = params.get('points');
    const termParam = params.get('term');

    useEffect(() => {
        if (loanAmountParam) setLoanAmount(loanAmountParam);
        if (interestRateParam) setInterestRate(interestRateParam);
        if (pointsParam) setPoints(pointsParam);
    }, [loanAmountParam, interestRateParam, pointsParam, termParam]);

    useEffect(() => {
        calculateLoanTranches();
    }, [loanAmount, interestRate, points, permanentRate, permanentTerm, refinanceEnabled, milestones]);

    const calculatePermanentLoan = (loanAmount: number) => {
        if (!refinanceEnabled) return { monthlyPaymentAmount: 0, totalInterest: 0 };

        const annualRate = parseFloat(permanentRate) / 100;
        const monthlyRate = annualRate / 12;
        const totalMonths = parseFloat(permanentTerm);
        
        if (monthlyRate && totalMonths && loanAmount) {
            const monthlyPaymentCalc = monthlyPayment(loanAmount, totalMonths, monthlyRate);

            // Total interest is (monthly payment * total months) - original loan amount
            const totalPayments = monthlyPaymentCalc * totalMonths;
            const totalInterest = totalPayments - loanAmount;

            return { 
                monthlyPaymentAmount: Number(monthlyPaymentCalc.toFixed(2)), 
                totalInterest: Number(totalInterest.toFixed(2))
            };
        }
        return { monthlyPaymentAmount: 0, totalInterest: 0 };
    };

    const calculateLoanTranches = () => {
        if (milestones.length === 0) return;

        // Sort milestones by start date
        const sortedMilestones = [...milestones].sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        // Find project start date (earliest start date)
        const projectStartDate = new Date(Math.min(...milestones.map(m => 
            new Date(m.startDate).getTime()
        )));

        // Find project end date (latest end date among milestones)
        const projectEndDate = new Date(Math.max(...milestones.map(m => 
            new Date(m.endDate).getTime()
        )));

        // Calculate total duration in months (rounded up to nearest month)
        const durationInDays = Math.ceil(
            (projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const durationInMonths = Math.ceil(durationInDays / 30.44); // Using average month length
        setTotalLoanDuration(durationInMonths);

        // Calculate tranches and interest
        const tranches: LoanTranche[] = sortedMilestones.map(milestone => {
            const startDate = new Date(milestone.startDate);
            const daysToEnd = Math.ceil(
                (projectEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const annualRate = parseFloat(interestRate) / 100;
            const interestAccrued = milestone.drawdownAmount * (annualRate * daysToEnd / 365);

            return {
                date: milestone.startDate,
                amount: milestone.drawdownAmount,
                daysToProjectEnd: daysToEnd,
                interestAccrued
            };
        });

        setLoanTranches(tranches);
        const totalLoanAmt = tranches.reduce((sum, t) => sum + t.amount, 0);
        setTotalLoanAmount(totalLoanAmt);
        setTotalInterestAccrued(tranches.reduce((sum, t) => sum + t.interestAccrued, 0));

        // Calculate permanent loan details after setting total loan amount
        const permanentLoanCalc = calculatePermanentLoan(totalLoanAmt);
        setMonthlyPaymentAmount(permanentLoanCalc.monthlyPaymentAmount);
        setTotalPermanentInterest(permanentLoanCalc.totalInterest);
    };

    const addMilestone = () => {
        const newMilestone: Milestone = {
            id: uuidv4(),
            name: "",
            startDate: "",
            endDate: "",
            drawdownAmount: 0,
            completed: false
        };
        setMilestones([...milestones, newMilestone]);
    };

    const updateMilestone = (id: string, updates: Partial<Milestone>) => {
        setMilestones(milestones.map(m => 
            m.id === id ? { ...m, ...updates } : m
        ));
    };

    const removeMilestone = (id: string) => {
        setMilestones(milestones.filter(m => m.id !== id));
    };

    const generateWeekColumns = () => {
        if (milestones.length === 0) return [];
        
        const dates = milestones.flatMap(m => [m.startDate, m.endDate])
            .filter(date => date)
            .map(date => new Date(date));
        
        let startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        // Adjust start date to previous Monday
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - startDate.getDay() + 1);
        if (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() - 7);
        }

        // Ensure endDate is extended to cover the full last week
        const adjustedEndDate = new Date(endDate);
        const daysToAdd = (7 - adjustedEndDate.getDay()) % 7;
        adjustedEndDate.setDate(adjustedEndDate.getDate() + daysToAdd);
        
        const weeks = [];
        let currentDate = new Date(startDate);
        let weekNumber = 1;
        
        while (currentDate <= adjustedEndDate) {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
            const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
            const label = startMonth === endMonth
                ? `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`
                : `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
            
            weeks.push({
                start: weekStart,
                end: weekEnd,
                label,
                weekNumber
            });
            
            weekNumber++;
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        return weeks;
    };

    const getBarStyle = (startDate: string, endDate: string, weeks: any[]) => {
        if (!startDate || !endDate || weeks.length === 0) return {};
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const firstWeekStart = weeks[0].start;
        const weekWidth = 60; // Width per week in pixels
        
        // Calculate exact day positions
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysFromStart = Math.round((start.getTime() - firstWeekStart.getTime()) / msPerDay);
        const duration = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1; // Add 1 to include end date
        
        const startOffset = (daysFromStart / 7) * weekWidth;
        const width = Math.max((duration / 7) * weekWidth, weekWidth * 0.1);
        
        return {
            left: `${startOffset}px`,
            width: `${width}px`
        };
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            const oldIndex = milestones.findIndex(m => m.id === active.id);
            const newIndex = milestones.findIndex(m => m.id === over.id);
            
            setMilestones(arrayMove(milestones, oldIndex, newIndex));
        }
    };

    // Add useEffect to recalculate weeks when milestones change
    useEffect(() => {
        if (milestones.length > 0) {
            generateWeekColumns();
        }
    }, [milestones]);

    return (
        <div className="construction-loan-calculator">
             <AlphaBanner  page={page} />
            <div className="milestones-section">
                <h2>Construction Milestones</h2>
                <button className="add-milestone-button" onClick={addMilestone}>
                    + Add Milestone
                </button>
                <DndContext
                    sensors={useSensors(
                        useSensor(PointerSensor),
                        useSensor(KeyboardSensor, {
                            coordinateGetter: sortableKeyboardCoordinates,
                        })
                    )}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Milestone</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Drawdown Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext
                                items={milestones.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {milestones.map((milestone) => (
                                    <SortableRow
                                        key={milestone.id}
                                        id={milestone.id}
                                        milestone={milestone}
                                        updateMilestone={updateMilestone}
                                        removeMilestone={removeMilestone}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            </div>

            <div className="timeline-section">
                <h2>Project Timeline</h2>
                {milestones.length > 0 && (
                    <div className="gantt-chart">
                        <div className="timeline-header">
                            <div className="task-column">Tasks</div>
                            {generateWeekColumns().map((week, index) => (
                                <div key={index} className="week-column">
                                    <div className="dates">{week.label}</div>
                                    <div className="week-number">Week {week.weekNumber}</div>
                                </div>
                            ))}
                        </div>
                        <div className="gantt-body">
                            {milestones.map((milestone) => (
                                <div key={milestone.id} className="task-row">
                                    <div className="task-label">{milestone.name}</div>
                                    <div className="task-timeline">
                                        {generateWeekColumns().map((_week, index) => (
                                            <div key={index} className="week-cell" />
                                        ))}
                                        <div 
                                            className={`milestone-bar ${milestone.completed ? 'completed' : ''}`}
                                            style={getBarStyle(milestone.startDate, milestone.endDate, generateWeekColumns())}
                                        >
                                            <div className={`resource-initials ${milestone.completed ? 'completed' : ''}`}>
                                                ${milestone.drawdownAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="calculator-section">
                <h2>Loan Parameters</h2>
                <div className="calculator-container">
                    <div className="input-section">
                        <div className="main-inputs">
                            <div className="input-group">
                                <label>Construction Interest Rate (%)</label>
                                <input
                                    type="text"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    placeholder="Enter interest rate"
                                />
                            </div>

                            <div className="input-group">
                                <label>Points (%)</label>
                                <input
                                    type="text"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    placeholder="Enter points"
                                />
                            </div>
                        </div>
                        
                        <div className="permanent-financing">
                            <div className="input-group">
                                <label>Convert to Permanent Financing?</label>
                                <div className="toggle-container">
                                    <input
                                        type="checkbox"
                                        id="refinanceToggle"
                                        checked={refinanceEnabled}
                                        onChange={(e) => setRefinanceEnabled(e.target.checked)}
                                    />
                                    <label htmlFor="refinanceToggle" className="toggle-label"></label>
                                </div>
                            </div>

                            {refinanceEnabled && (
                                <div className="permanent-inputs">
                                    <div className="input-group">
                                        <label>Permanent Interest Rate (%)</label>
                                        <input
                                            type="text"
                                            value={permanentRate}
                                            onChange={(e) => setPermanentRate(e.target.value)}
                                            placeholder="Enter permanent rate"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Permanent Term (months)</label>
                                        <input
                                            type="text"
                                            value={permanentTerm}
                                            onChange={(e) => setPermanentTerm(e.target.value)}
                                            placeholder="Enter permanent term"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="loan-calculations-section">
                <h2>Loan Calculations</h2>
                <div className="loan-summary">
                    <div className="summary-item">
                        <label>Total Loan Amount:</label>
                        <span>${totalLoanAmount.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                        <label>Construction Duration:</label>
                        <span>{totalLoanDuration} months</span>
                    </div>
                    <div className="summary-item">
                        <label>Points Cost:</label>
                        <span>${(totalLoanAmount * (parseFloat(points) || 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="summary-item">
                        <label>Construction Interest Accrued:</label>
                        <span>${totalInterestAccrued.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    {refinanceEnabled && (
                        <>
                            <div className="summary-item permanent-loan">
                                <label>Permanent Loan Monthly Payment:</label>
                                <span>${monthlyPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="summary-item permanent-loan">
                                <label>Total Permanent Loan Cost:</label>
                                <span>${(totalLoanAmount + totalPermanentInterest).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                        </>
                    )}
                    <div className="summary-item total">
                        <label>Total Project Cost:</label>
                        <span>${(
                            totalLoanAmount + 
                            totalInterestAccrued + 
                            (totalLoanAmount * (parseFloat(points) || 0) / 100) +
                            (refinanceEnabled ? totalPermanentInterest : 0)
                        ).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <table className="tranches-table">
                    <thead>
                        <tr>
                            <th>Drawdown Date</th>
                            <th>Amount</th>
                            <th>Days Until Project End</th>
                            <th>Interest Rate</th>
                            <th>Interest Accrued</th>
                            <th>Total for Tranche</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loanTranches.map((tranche, index) => (
                            <tr key={index}>
                                <td>{new Date(tranche.date).toLocaleDateString()}</td>
                                <td>${tranche.amount.toLocaleString()}</td>
                                <td>{tranche.daysToProjectEnd} days</td>
                                <td>{interestRate}%</td>
                                <td>${tranche.interestAccrued.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                <td>${(tranche.amount + tranche.interestAccrued).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ShareButton params={params} />
        </div>
    );
};

export default ConstructionLoanCalculator; 