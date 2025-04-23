// import DynamicRow from '../components/RowTypes/DynamicRow';
import { convertToPercent, removeCommas } from '../utils/utils';
import { usePersistedState2 } from '../hooks/usePersistedState';
import '../pages/DynamicTable.scss';
import { EAllStates, EPageNames } from '../utils/types';
// import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';
import './WaterfallGenerator.scss';

const WaterfallGenerator = ({  page }: { isMobile: boolean; page: EPageNames; }) => {
    const queryParams = new URLSearchParams(window.location.search);

    // Transaction Structure states
    const [lpEquityContribution, setLpEquityContribution] = usePersistedState2(page, EAllStates.totalInvestment, "7600000", queryParams);
    const [gpEquityContribution, setGpEquityContribution] = usePersistedState2(page, EAllStates.gpEquityContribution, "400000", queryParams);

    // Promote Structure states
    const [tier1Active, setTier1Active] = usePersistedState2(page, EAllStates.tier1Active, "true", queryParams);
    const [tier1Hurdle, setTier1Hurdle] = usePersistedState2(page, EAllStates.tier1Hurdle, "8", queryParams);
    const [tier1LPSplit, setTier1LPSplit] = usePersistedState2(page, EAllStates.tier1LPSplit, "100", queryParams);
    
    const [tier2Active, setTier2Active] = usePersistedState2(page, EAllStates.tier2Active, "true", queryParams);
    const [tier2Hurdle, setTier2Hurdle] = usePersistedState2(page, EAllStates.tier2Hurdle, "10", queryParams);
    const [tier2LPSplit, setTier2LPSplit] = usePersistedState2(page, EAllStates.tier2Split, "80", queryParams);
    
    const [tier3Active, setTier3Active] = usePersistedState2(page, EAllStates.tier3Active, "true", queryParams);
    const [tier3Hurdle, setTier3Hurdle] = usePersistedState2(page, EAllStates.tier3Hurdle, "12", queryParams);
    const [tier3LPSplit, setTier3LPSplit] = usePersistedState2(page, EAllStates.tier3Split, "60", queryParams);
    
    const [tier4Active, setTier4Active] = usePersistedState2(page, EAllStates.tier4Active, "true", queryParams);
    const [tier4Hurdle, setTier4Hurdle] = usePersistedState2(page, EAllStates.tier4Hurdle, "25", queryParams);
    const [tier4LPSplit, setTier4LPSplit] = usePersistedState2(page, EAllStates.tier4Split, "50", queryParams);

    // Example return amount for demonstration
    const [totalReturn, setTotalReturn] = usePersistedState2(page, EAllStates.totalReturn, "2,000,000", queryParams);

    const params = {
        lpEquityContribution,
        gpEquityContribution,
        tier1Hurdle,
        tier2Hurdle,
        tier2LPSplit,
        tier3Hurdle,
        tier3LPSplit,
        tier4Hurdle,
        tier4LPSplit,
        totalReturn,
    };

    // Calculate totals and percentages
    const totalEquity = removeCommas(lpEquityContribution) + removeCommas(gpEquityContribution);
    const lpPercentage = (removeCommas(lpEquityContribution) / totalEquity) * 100;
    const gpPercentage = (removeCommas(gpEquityContribution) / totalEquity) * 100;

    // Validation functions
    const validateLPSplit = (value: string): string => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return "0";
        if (numValue > 100) return "100";
        if (numValue < 0) return "0";
        return value;
    };

    const handleTierToggle = (
        tier: number, 
        isActive: boolean, 
        setter: (value: string) => void
    ) => {
        // Get current state of all tiers
        const tierStates = [
            tier1Active === "true",
            tier2Active === "true",
            tier3Active === "true",
            tier4Active === "true"
        ];

        // If trying to activate a tier
        if (isActive) {
            // Check if all previous tiers are active
            for (let i = 0; i < tier - 1; i++) {
                if (!tierStates[i]) {
                    return; // Can't activate this tier if previous ones aren't active
                }
            }
            setter("true");
        } else {
            // If trying to deactivate a tier
            const activeTiers = tierStates.filter(Boolean).length;
            
            // Don't allow deactivating if it's the last active tier
            if (activeTiers <= 1) {
                return;
            }

            // Check if any later tiers are active
            for (let i = tier; i < tierStates.length; i++) {
                if (tierStates[i]) {
                    return; // Can't deactivate this tier if later ones are active
                }
            }
            
            setter("false");
        }
    };

    // Get the last active tier number (1-based)
    const getLastActiveTier = () => {
        if (tier4Active === "true") return 4;
        if (tier3Active === "true") return 3;
        if (tier2Active === "true") return 2;
        return 1;
    };

    // Format hurdle rate display based on whether it's the last active tier
    const formatHurdleRate = (tier: number, value: string) => {
        const lastActiveTier = getLastActiveTier();
        if (tier === lastActiveTier) {
            return `${value}%+`;
        }
        return `${value}%`;
    };

    // Calculate returns for each tier
    const calculateReturns = () => {
        const equity = totalEquity;
        const returnAmount = removeCommas(totalReturn);
        const profit = returnAmount - equity;
        
        let lpDistribution = 0;
        let gpDistribution = 0;
        let remainingProfit = profit;
        let lastActiveHurdle = 0;

        // Tier 1
        if (tier1Active === "true") {
            const tier1Return = equity * (parseFloat(tier1Hurdle) / 100);
            if (remainingProfit > 0) {
                const tier1Amount = Math.min(remainingProfit, tier1Return);
                const lpSplit = parseFloat(tier1LPSplit) / 100;
                const gpSplit = 1 - lpSplit;
                
                lpDistribution += tier1Amount * lpSplit;
                gpDistribution += tier1Amount * gpSplit;
                remainingProfit -= tier1Amount;
            }
            lastActiveHurdle = parseFloat(tier1Hurdle);

            // If this is the last active tier, distribute remaining profit using this split
            if (getLastActiveTier() === 1 && remainingProfit > 0) {
                lpDistribution += remainingProfit * (parseFloat(tier1LPSplit) / 100);
                gpDistribution += remainingProfit * (1 - parseFloat(tier1LPSplit) / 100);
                remainingProfit = 0;
            }
        }

        // Tier 2
        if (tier2Active === "true") {
            const tier2Amount = equity * ((parseFloat(tier2Hurdle) - lastActiveHurdle) / 100);
            if (remainingProfit > 0) {
                const currentTierAmount = Math.min(remainingProfit, tier2Amount);
                const lpSplit = parseFloat(tier2LPSplit) / 100;
                const gpSplit = 1 - lpSplit;
                
                lpDistribution += currentTierAmount * lpSplit;
                gpDistribution += currentTierAmount * gpSplit;
                remainingProfit -= currentTierAmount;
            }
            lastActiveHurdle = parseFloat(tier2Hurdle);

            // If this is the last active tier, distribute remaining profit using this split
            if (getLastActiveTier() === 2 && remainingProfit > 0) {
                lpDistribution += remainingProfit * (parseFloat(tier2LPSplit) / 100);
                gpDistribution += remainingProfit * (1 - parseFloat(tier2LPSplit) / 100);
                remainingProfit = 0;
            }
        }

        // Tier 3
        if (tier3Active === "true") {
            const tier3Amount = equity * ((parseFloat(tier3Hurdle) - lastActiveHurdle) / 100);
            if (remainingProfit > 0) {
                const currentTierAmount = Math.min(remainingProfit, tier3Amount);
                const lpSplit = parseFloat(tier3LPSplit) / 100;
                const gpSplit = 1 - lpSplit;
                
                lpDistribution += currentTierAmount * lpSplit;
                gpDistribution += currentTierAmount * gpSplit;
                remainingProfit -= currentTierAmount;
            }
            lastActiveHurdle = parseFloat(tier3Hurdle);

            // If this is the last active tier, distribute remaining profit using this split
            if (getLastActiveTier() === 3 && remainingProfit > 0) {
                lpDistribution += remainingProfit * (parseFloat(tier3LPSplit) / 100);
                gpDistribution += remainingProfit * (1 - parseFloat(tier3LPSplit) / 100);
                remainingProfit = 0;
            }
        }

        // Tier 4
        if (tier4Active === "true") {
            // For tier 4, all remaining profit is distributed according to the split
            if (remainingProfit > 0) {
                const lpSplit = parseFloat(tier4LPSplit) / 100;
                const gpSplit = 1 - lpSplit;
                
                lpDistribution += remainingProfit * lpSplit;
                gpDistribution += remainingProfit * gpSplit;
            }
        }

        // Add back initial investment
        lpDistribution += removeCommas(lpEquityContribution);
        gpDistribution += removeCommas(gpEquityContribution);

        return {
            lpDistribution,
            gpDistribution,
            totalDistribution: lpDistribution + gpDistribution,
            lpMultiple: lpDistribution / removeCommas(lpEquityContribution),
            gpMultiple: gpDistribution / removeCommas(gpEquityContribution),
            lpIRR: (lpDistribution / removeCommas(lpEquityContribution) - 1) * 100,
            gpIRR: (gpDistribution / removeCommas(gpEquityContribution) - 1) * 100,
        };
    };

    const returns = calculateReturns();

    return (
        <div className="waterfall-container">
            <div className="waterfall-section">
                <h2>Distribution Waterfall</h2>
                <div className="waterfall-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Transaction Structure</th>
                                <th>% Total</th>
                                <th>$ Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>LP Equity Contribution</td>
                                <td>
                                    <input 
                                        type="text"
                                        value={convertToPercent(lpPercentage / 100, 1)}
                                        readOnly
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={lpEquityContribution}
                                        onChange={(e) => setLpEquityContribution(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>GP Equity Contribution</td>
                                <td>
                                    <input 
                                        type="text"
                                        value={convertToPercent(gpPercentage / 100, 1)}
                                        readOnly
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={gpEquityContribution}
                                        onChange={(e) => setGpEquityContribution(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="total-row">
                                <td>Total Equity</td>
                                <td>100.0%</td>
                                <td>${totalEquity.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="waterfall-table promote-structure">
                    <table>
                        <thead>
                            <tr>
                                <th>Promote Structure</th>
                                <th>Active</th>
                                <th>
                                    % IRR Hurdle
                                    <div className="tooltip">
                                        The IRR threshold that must be achieved before moving to the next tier. 
                                        For example, 8% means LPs receive an 8% preferred return first.
                                    </div>
                                </th>
                                <th>
                                    % LP Split
                                    <div className="tooltip">
                                        Percentage of profits allocated to LP in this tier.
                                        GP automatically receives the remaining percentage (100% - LP Split).
                                    </div>
                                </th>
                                <th>
                                    % GP Split
                                    <div className="tooltip">
                                        Percentage of profits allocated to GP, calculated as (100% - LP Split).
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tier 1 (Pref)</td>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={tier1Active === "true"}
                                        onChange={(e) => handleTierToggle(1, e.target.checked, setTier1Active)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier1Hurdle}
                                        onChange={(e) => setTier1Hurdle(e.target.value)}
                                        disabled={tier1Active !== "true"}
                                    />
                                    {tier1Active === "true" && <span>{formatHurdleRate(1, tier1Hurdle)}</span>}
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier1LPSplit}
                                        onChange={(e) => setTier1LPSplit(validateLPSplit(e.target.value))}
                                        disabled={tier1Active !== "true"}
                                    />
                                </td>
                                <td>{tier1Active === "true" ? (100 - parseFloat(tier1LPSplit || "0")).toFixed(1) + "%" : "-"}</td>
                            </tr>
                            <tr>
                                <td>Tier 2</td>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={tier2Active === "true"}
                                        onChange={(e) => handleTierToggle(2, e.target.checked, setTier2Active)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier2Hurdle}
                                        onChange={(e) => setTier2Hurdle(e.target.value)}
                                        disabled={tier2Active !== "true"}
                                    />
                                    {tier2Active === "true" && <span>{formatHurdleRate(2, tier2Hurdle)}</span>}
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier2LPSplit}
                                        onChange={(e) => setTier2LPSplit(validateLPSplit(e.target.value))}
                                        disabled={tier2Active !== "true"}
                                    />
                                </td>
                                <td>{tier2Active === "true" ? (100 - parseFloat(tier2LPSplit || "0")).toFixed(1) + "%" : "-"}</td>
                            </tr>
                            <tr>
                                <td>Tier 3</td>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={tier3Active === "true"}
                                        onChange={(e) => handleTierToggle(3, e.target.checked, setTier3Active)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier3Hurdle}
                                        onChange={(e) => setTier3Hurdle(e.target.value)}
                                        disabled={tier3Active !== "true"}
                                    />
                                    {tier3Active === "true" && <span>{formatHurdleRate(3, tier3Hurdle)}</span>}
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier3LPSplit}
                                        onChange={(e) => setTier3LPSplit(validateLPSplit(e.target.value))}
                                        disabled={tier3Active !== "true"}
                                    />
                                </td>
                                <td>{tier3Active === "true" ? (100 - parseFloat(tier3LPSplit || "0")).toFixed(1) + "%" : "-"}</td>
                            </tr>
                            <tr>
                                <td>Tier 4</td>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={tier4Active === "true"}
                                        onChange={(e) => handleTierToggle(4, e.target.checked, setTier4Active)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier4Hurdle}
                                        onChange={(e) => setTier4Hurdle(e.target.value)}
                                        disabled={tier4Active !== "true"}
                                    />
                                    {tier4Active === "true" && <span>{formatHurdleRate(4, tier4Hurdle)}</span>}
                                </td>
                                <td>
                                    <input 
                                        type="text"
                                        value={tier4LPSplit}
                                        onChange={(e) => setTier4LPSplit(validateLPSplit(e.target.value))}
                                        disabled={tier4Active !== "true"}
                                    />
                                </td>
                                <td>{tier4Active === "true" ? (100 - parseFloat(tier4LPSplit || "0")).toFixed(1) + "%" : "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="waterfall-table returns-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Return Summary</th>
                                <th>Total Return</th>
                                <th>Multiple</th>
                                <th>IRR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total Project Return</td>
                                <td>
                                    <input 
                                        type="text"
                                        value={totalReturn}
                                        onChange={(e) => setTotalReturn(e.target.value)}
                                    />
                                </td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>Limited Partner Returns</td>
                                <td>${returns.lpDistribution.toLocaleString()}</td>
                                <td>{returns.lpMultiple.toFixed(2)}x</td>
                                <td>{returns.lpIRR.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td>General Partner Returns</td>
                                <td>${returns.gpDistribution.toLocaleString()}</td>
                                <td>{returns.gpMultiple.toFixed(2)}x</td>
                                <td>{returns.gpIRR.toFixed(1)}%</td>
                            </tr>
                            <tr className="total-row">
                                <td>Total Distribution</td>
                                <td>${returns.totalDistribution.toLocaleString()}</td>
                                <td>{(returns.totalDistribution / totalEquity).toFixed(2)}x</td>
                                <td>{((returns.totalDistribution / totalEquity - 1) * 100).toFixed(1)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <ShareButton params={params} />
        </div>
    );
};

export default WaterfallGenerator;
