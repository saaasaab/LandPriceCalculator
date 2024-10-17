import { useState } from 'react';
import { copyToClipboard, getQueryParamNumber, roundAndLocalString } from '../utils';
import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';
import { usePersistedState } from '../hooks/usePersistedState';


const PAGE = "RESIDENTIAL_DEVELOPMENT"
const LandCalculator = ({ isMobile }: { isMobile: boolean }) => {
    const queryParams = new URLSearchParams(window.location.search)
    const ga = getQueryParamNumber("grossAcres", queryParams);
    const uba = getQueryParamNumber("unbuildableAcres", queryParams);
    const sqftpl = getQueryParamNumber("sqFtPerLot", queryParams);
    const upa = getQueryParamNumber("unitsPerAcre", queryParams);
    const hs = getQueryParamNumber("houseSize", queryParams);
    const hspsqft = getQueryParamNumber("housePricePerSqFt", queryParams);
    const hcpsqft = getQueryParamNumber("hardCostPerSqFt", queryParams);
    const p = getQueryParamNumber("permits", queryParams);
    const mc = getQueryParamNumber("miscCosts", queryParams);
    const hbpp = getQueryParamNumber("homeBuilderProfitPercentage", queryParams);
    const recp = getQueryParamNumber("realEstateCommissionPercentage", queryParams);
    const ldpp = getQueryParamNumber("landDeveloperProfitPercentage", queryParams);
    const ctdpl = getQueryParamNumber("costToDevelopPerLot", queryParams);
    const olc = getQueryParamNumber("ownedLandCost", queryParams);

    const [grossAcres, setGrossAcres] = usePersistedState(PAGE, 'grossAcres', 1.65, ga);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState(PAGE, 'unbuildableAcres', 0, uba);
    const [sqFtPerLot, setSqFtPerLot] = usePersistedState(PAGE, 'sqFtPerLot', 1500, sqftpl);
    const [unitsPerAcre, setUnitsPerAcre] = usePersistedState(PAGE, 'unitsPerAcre', 0, upa);
    const [houseSize, setHouseSize] = usePersistedState(PAGE, 'houseSize', 1500, hs);
    const [housePricePerSqFt, setHousePricePerSqFt] = usePersistedState(PAGE, 'housePricePerSqFt', 300, hspsqft);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState(PAGE, 'hardCostPerSqFt', 185, hcpsqft);
    const [permits, setPermits] = usePersistedState(PAGE, 'permits', 12000, p);
    const [miscCosts, setMiscCosts] = usePersistedState(PAGE, 'miscCosts', 7500, mc);
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = usePersistedState(PAGE, 'homeBuilderProfitPercentage', 20, hbpp);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState(PAGE, 'realEstateCommissionPercentage', 3, recp);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState(PAGE, 'landDeveloperProfitPercentage', 15, ldpp);
    const [costToDevelopPerLot, setCostToDevelopPerLot] = usePersistedState(PAGE, 'costToDevelopPerLot', 40000, ctdpl);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState(PAGE, 'ownedLandCost', 0, olc);

    const [copied, setCopied] = useState(false);

    const params: {
        grossAcres: number;
        unbuildableAcres: number;
        sqFtPerLot: number;
        unitsPerAcre: number | undefined;
        houseSize: number;
        housePricePerSqFt: number;
        hardCostPerSqFt: number;
        permits: number;
        miscCosts: number;
        homeBuilderProfitPercentage: number;
        realEstateCommissionPercentage: number;
        landDeveloperProfitPercentage: number;
        costToDevelopPerLot: number;
        ownedLandCost: number
    } = {
        grossAcres: grossAcres,
        unbuildableAcres,
        sqFtPerLot,
        unitsPerAcre,
        houseSize,
        housePricePerSqFt,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        costToDevelopPerLot,
        ownedLandCost
    };


    // Calculations
    const houseSalePrice = houseSize * housePricePerSqFt;
    const hardCostLessProfit = houseSize * hardCostPerSqFt + permits + miscCosts;
    const homeBuilderProfit = (homeBuilderProfitPercentage / 100) * hardCostLessProfit;
    const totalHardCostsPerUnit = hardCostLessProfit + homeBuilderProfit;
    const reAgentCommission = (realEstateCommissionPercentage / 100) * houseSalePrice;
    const finishedLotValue = houseSalePrice - totalHardCostsPerUnit - reAgentCommission;
    const landPercentage = finishedLotValue / houseSalePrice;

    // Constants
    const SQ_FT_PER_ACRE = 43560;
    const infrastructurePercentage = 70;

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE * (infrastructurePercentage / 100);

    const yieldBySQFT = Math.floor(totalBuildableSqFt / sqFtPerLot);
    const yieldByUnitsPerAcre = unitsPerAcre ? Math.floor(unitsPerAcre * netBuildableAcres) : Infinity;
    // Calculate total lot yield based on zoning (sq ft per lot)
    const totalLotYield = Math.min(yieldBySQFT, yieldByUnitsPerAcre)


    const landDeveloperProfitPerLot = (landDeveloperProfitPercentage / 100) * finishedLotValue;
    const landDeveloperProfit = landDeveloperProfitPerLot * totalLotYield
    const perLotOfferToLandOwner = finishedLotValue - costToDevelopPerLot - landDeveloperProfitPerLot;
    const totalOfferToLandOwner = ownedLandCost ? ownedLandCost : perLotOfferToLandOwner * totalLotYield;


    const totalHardCosts = totalHardCostsPerUnit * totalLotYield
    const totalSoftCosts = costToDevelopPerLot * totalLotYield + landDeveloperProfit
    const totalCosts = totalOfferToLandOwner + costToDevelopPerLot * totalLotYield + landDeveloperProfit + totalHardCostsPerUnit * totalLotYield


    const totalProfits = houseSalePrice * totalLotYield - totalCosts

    return (
        <div className="land-calculator">
            <header className="app-header">
                <h1>Residential Land Development Calculator</h1>
            </header>

            <div className="table-container">
                <DynamicRow
                    cellValues={["Basic Land Info"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    cellValues={["Gross Acres", grossAcres]}
                    setInput={event => setGrossAcres(Number(event.target.value))}
                    description="The total area of the land in acres before any deductions for unbuildable areas."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    cellValues={["Adjusted Unbuildable Acres", unbuildableAcres]}
                    setInput={event => setUnbuildableAcres(Number(event.target.value))}
                    description="The total area in acres that cannot be built upon due to environmental or geographical features."

                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    cellValues={['Net Buildable Acres', netBuildableAcres.toLocaleString()]}
                    description=' The area of land available for building after subtracting unbuildable acres from gross acres.'
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={["Land Limitations, Restrictions, and Requirements"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    cellValues={['Sq Ft per Acre', SQ_FT_PER_ACRE.toLocaleString()]}
                    description='Constant: There are 43,560 square feet in one acre of land.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Adjusted for Infrastructure (%)", infrastructurePercentage.toLocaleString() + "%"]}
                    description="Every lot requires infrastructure like streets, which reduces the buildable area."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Total Buildable Sq Ft', Math.round(totalBuildableSqFt).toLocaleString()]}
                    description='The total buildable square feet after accounting for infrastructure adjustments.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setInput={event => setSqFtPerLot(Number(event.target.value))}
                    cellValues={["Zoning - Sq Ft per Lot (SQFT)", sqFtPerLot]}
                    description="The jurisdiction gives a zoning requirement or desired lot size (e.g., R-5 = 5,000 sq ft per lot)."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setUnitsPerAcre(Number(e.target.value))}
                    cellValues={["Zoning - Maximum units per acre", unitsPerAcre === 0 ? undefined : unitsPerAcre]}
                    description="The jurisdiction gives a zoning requirement for the maximum number of units per acre."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={['Total Lot Yield', totalLotYield.toLocaleString()]}
                    description='The total number of buildable lots for houses.'
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    cellValues={["Financial Assumptions"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />


                {/* House Size */}
                <DynamicRow
                    setInput={(e) => setHouseSize(Number(e.target.value))}
                    cellValues={["House Size - Sq Ft", houseSize]}
                    description="The average size of houses in this area, determined by local research."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                {/* House Price Per Sq Ft */}
                <DynamicRow
                    setInput={(e) => setHousePricePerSqFt(Number(e.target.value))}
                    cellValues={["House Price - per Sq Ft", housePricePerSqFt]}
                    description="The average price per square foot for houses in this area, determined by local research."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />


                {/* House Sale Price */}
                <DynamicRow
                    cellValues={["House Sale Price", houseSalePrice.toLocaleString()]}
                    description="The total sale price of the house based on the size and price per square foot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Hard Cost Per Sq Ft */}
                <DynamicRow
                    setInput={(e) => setHardCostPerSqFt(Number(e.target.value))}
                    cellValues={["Hard Cost per Sq Ft for House Build ($)", hardCostPerSqFt, (hardCostPerSqFt * houseSize).toLocaleString()]}
                    description="The hard costs for building the house per square foot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />



                {/* Permits */}
                <DynamicRow
                    setInput={(e) => setPermits(Number(e.target.value))}
                    cellValues={["Permits per unit ($)", permits]}
                    description="The total cost of permits required for the house build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />


                {/* Misc Costs */}
                <DynamicRow
                    setInput={(e) => setMiscCosts(Number(e.target.value))}
                    cellValues={["Misc Costs per unit ($)", miscCosts]}
                    description="Miscellaneous costs involved in the house build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                {/* Home Builder Profit */}
                <DynamicRow
                    setInput={(e) => setHomeBuilderProfitPercentage(Number(e.target.value))}
                    cellValues={["Home Builder Profit per unit (%)", homeBuilderProfitPercentage, homeBuilderProfit.toLocaleString()]}
                    description="The builder's profit based on a percentage of the hard costs."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />



                {/* Total Hard Costs */}
                <DynamicRow
                    cellValues={["Total Hard Costs per unit", totalHardCostsPerUnit.toLocaleString()]}
                    description="The total hard costs, including construction costs, permits, and miscellaneous costs."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Real Estate Agent Commission */}
                <DynamicRow
                    setInput={(e) => setRealEstateCommissionPercentage(Number(e.target.value))}
                    cellValues={["RE Agent Commission per unit (%)", realEstateCommissionPercentage, Math.round(reAgentCommission).toLocaleString()]}
                    description="The real estate agent commission, calculated as a percentage of the house sale price."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Land Percentage */}
                <DynamicRow
                    cellValues={["Land Percentage of Total Value", (landPercentage * 100).toFixed(1) + "%"]}
                    description="The percentage of the total house value attributed to the finished lot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Finished Lot Value */}
                <DynamicRow
                    cellValues={["Finished Lot Value", Math.round(finishedLotValue).toLocaleString()]}
                    description="The value of the finished lot without the house."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    cellValues={["Raw Land Calculations"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />

                {/* Land Developer Profit Per Lot */}
                <DynamicRow
                    setInput={(e) => setLandDeveloperProfitPercentage(Number(e.target.value))}
                    cellValues={["Land Developer Profit Per Lot (%)", landDeveloperProfitPercentage, landDeveloperProfitPerLot.toLocaleString()]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Land Developer's Total Profit */}
                <DynamicRow
                    cellValues={["Land Developer's Profit", landDeveloperProfit.toLocaleString()]}
                    description="Total profit made by the land developer from the entire project."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Cost to Develop Land Per Lot */}
                <DynamicRow
                    setInput={(e) => setCostToDevelopPerLot(Number(e.target.value))}
                    cellValues={["Cost to Develop the Land Per Lot ($)", costToDevelopPerLot]}
                    description="Costs for engineering, clearing, demolition, utilities, and SDC (System Development Charges), etc."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                {/* Value Per Lot to Land Owner/Seller */}
                <DynamicRow
                    cellValues={["Value Per Lot to Land Owner/Seller", perLotOfferToLandOwner.toLocaleString()]}
                    description="The value of each lot after development, as perceived by the landowner or seller."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setOwnedLandCost(Number(e.target.value))}
                    description="If you own the property already, enter in the price of the property here"
                    cellValues={["Property Value", ownedLandCost === 0 ? undefined : ownedLandCost]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />


                {/* Buyer Offer to Land Owner/Seller */}
                <DynamicRow
                    cellValues={["Offer to Land Owner/Seller", Math.round(totalOfferToLandOwner).toLocaleString()]}
                    description="Total offer from the buyer to the land owner or seller."
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    cellValues={["Project Overview"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    cellValues={["Land Costs", roundAndLocalString(totalOfferToLandOwner)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Soft Costs", roundAndLocalString(totalSoftCosts)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Hard Costs", roundAndLocalString(totalHardCosts)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                {/* Buyer Offer to Land Owner/Seller */}

                <DynamicRow
                    cellValues={["Total Costs", roundAndLocalString(totalCosts)]}
                    description="Total Costs to Build this Project"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                {/* Buyer Offer to Land Owner/Seller */}

                <DynamicRow
                    cellValues={["Total Profit", roundAndLocalString(totalProfits)]}
                    isMobile={isMobile}
                    description="Total profit if sold at the projected sell price"
                    numberOfCells={2}
                    output={true}
                />
            </div>

            <button
                onClick={() => copyToClipboard(params, setCopied)}
                className={`copy-url-button ${copied ? 'copied' : ''}`}
            >
                {copied ? 'Copied your work! Now share the link' : 'Share your work'}
            </button>
        </div >
    );
};

export default LandCalculator;
