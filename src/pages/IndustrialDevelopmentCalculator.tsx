import { useState } from 'react';
import { calculateBuildingSqft, copyToClipboard, getQueryParamNumber, roundAndLocalString } from '../utils';

import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';
import { usePersistedState } from '../hooks/usePersistedState';



const page = "INDUSTRIAL_DEVELOPMENT"

const IndustrialDevelopmentCalculator = ({ isMobile }: { isMobile: boolean }) => {
    const queryParams = new URLSearchParams(window.location.search)

    const ga = getQueryParamNumber("grossAcres", queryParams);
    const uba =getQueryParamNumber("unbuildableAcres", queryParams);
    const nof =getQueryParamNumber("numberOfFloors", queryParams);
    const misr =getQueryParamNumber("maxImperviousSurfaceRatio", queryParams);
    const csp =getQueryParamNumber("commonSpacePercentage", queryParams);
    const pr =getQueryParamNumber("parkingRatio", queryParams);
    const ca =getQueryParamNumber("catchAll", queryParams);

    const bppsqft =getQueryParamNumber("buildingPricePerSqFt", queryParams);
    const hcpsqft =getQueryParamNumber("hardCostPerSqFt", queryParams);
    const p =getQueryParamNumber("permits", queryParams);
    const mc =getQueryParamNumber("miscCosts", queryParams);
    const hbpp =getQueryParamNumber("homeBuilderProfitPercentage", queryParams);
    const recp =getQueryParamNumber("realEstateCommissionPercentage", queryParams);
    const ldpp =getQueryParamNumber("landDeveloperProfitPercentage", queryParams);
    const ctd =getQueryParamNumber("costToDevelop", queryParams);
    const sdc =getQueryParamNumber("SDCFees", queryParams);
    const olc =getQueryParamNumber("ownedLandCost", queryParams);


    const [grossAcres, setGrossAcres] = usePersistedState(page, 'grossAcres', 0.3, ga);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState(page, 'unbuildableAcres', 0, uba);
    const [numberOfFloors, setNumberOfFloors] = usePersistedState(page, 'numberOfFloors', 2, nof);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = usePersistedState(page, 'maxImperviousSurfaceRatio', 60, misr);
    const [commonSpacePercentage, setCommonSpacePercentage] = usePersistedState(page, 'commonSpacePercentage', 40, csp);
    const [parkingRatio, setParkingRatio] = usePersistedState(page, 'parkingRatio', 2, pr);
    const [catchAll, setCatchAll] = usePersistedState(page, 'catchAll', 1.8, ca);

    const [buildingPricePerSqFt, setBuildingPricePerSqFt] = usePersistedState(page, 'housePricePerSqFt', 300, bppsqft);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState(page, 'hardCostPerSqFt', 185, hcpsqft);
    const [permits, setPermits] = usePersistedState(page, 'permits', 12000, p);
    const [miscCosts, setMiscCosts] = usePersistedState(page, 'miscCosts', 7500, mc);
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = usePersistedState(page, 'homeBuilderProfitPercentage', 20, hbpp);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState(page, 'realEstateCommissionPercentage', 3, recp);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState(page, 'landDeveloperProfitPercentage', 15, ldpp);
    const [costToDevelop, setCostToDevelop] = usePersistedState(page, 'costToDevelop', 40000, ctd);
    const [SDCFees, setSDCFees] = usePersistedState(page, 'SDCFees', 20000, sdc);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState(page, 'ownedLandCost', 0, olc);


    const params: {
        grossAcres: number;
        unbuildableAcres: number;
        numberOfFloors: number;
        maxImperviousSurfaceRatio: number;
        commonSpacePercentage: number;
        parkingRatio: number;
        buildingPricePerSqFt: number;
        hardCostPerSqFt: number;
        permits: number;
        miscCosts: number;
        homeBuilderProfitPercentage: number;
        realEstateCommissionPercentage: number;
        landDeveloperProfitPercentage: number;
        costToDevelop: number;
        ownedLandCost: number;
    } = {
        grossAcres,
        unbuildableAcres,
        numberOfFloors,
        maxImperviousSurfaceRatio,
        commonSpacePercentage,
        parkingRatio,
        buildingPricePerSqFt,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        costToDevelop,
        ownedLandCost
    };

    const [copied, setCopied] = useState(false);

    // Constants
    const SQ_FT_PER_ACRE = 43560;

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE;

    const result = calculateBuildingSqft(totalBuildableSqFt, numberOfFloors, parkingRatio / 1000, maxImperviousSurfaceRatio / 100, commonSpacePercentage, catchAll);
    const buildingSalePrice = result.totalBuildingSqft * buildingPricePerSqFt;

    const hardCostTotal = result.totalBuildingSqft * hardCostPerSqFt + permits + miscCosts;
    const homeBuilderProfit = (homeBuilderProfitPercentage / 100) * hardCostTotal;
    const totalHardCosts = hardCostTotal + homeBuilderProfit;
    const reAgentCommission = (realEstateCommissionPercentage / 100) * buildingSalePrice;
    const finishedLotValue = buildingSalePrice - totalHardCosts - reAgentCommission;
    const landPercentage = finishedLotValue / buildingSalePrice;
    const landDeveloperProfit = (landDeveloperProfitPercentage / 100) * finishedLotValue;
    const totalOfferToLandOwner = ownedLandCost ? ownedLandCost : finishedLotValue - costToDevelop - landDeveloperProfit;
    const totalCosts = totalOfferToLandOwner + costToDevelop + landDeveloperProfit + totalHardCosts
    return (
        <div className="land-calculator">
            <header className="app-header">
                <h1>Industrial / Commercial Land Development Calculator</h1>
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
                    setInput={event => setGrossAcres(Number(event.target.value))}
                    cellValues={["Gross Acres", grossAcres]}
                    description="The total area of the land in acres before any deductions for unbuildable areas."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={event => setUnbuildableAcres(Number(event.target.value))}
                    cellValues={["Adjusted Unbuildable Acres", unbuildableAcres]}
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
                {/* <DynamicRow
                    cellValues={['Sq Ft per Acre', SQ_FT_PER_ACRE.toLocaleString()]}
                    description='Constant: There are 43,560 square feet in one acre of land.'
                    isMobile={isMobile}
                    numberOfCells={2}
                /> */}
                <DynamicRow
                    cellValues={['Lot Size', (SQ_FT_PER_ACRE * grossAcres).toLocaleString()]}
                    description='Total size of the lot in sqft'
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setInput={(e) => setCommonSpacePercentage(Number(e.target.value))}
                    cellValues={["Percentage used for common space(%)", commonSpacePercentage]}
                    description="Every building requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, bathrooms, kitchen areas, etc."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(e) => setMaxImperviousSurfaceRatio(Number(e.target.value))}
                    cellValues={["Max Impervious Surface (%)", maxImperviousSurfaceRatio]}
                    description="In certain zonings, the municipality limits the total impervious surface (Default 100%)"
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(e) => setCatchAll(Number(e.target.value))}
                    cellValues={["Approach Catch All (X)", catchAll]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="A catchall amount for extra approaches, garbage, utilities, and other miscellaneous items. This is added to the Calculated Driveway Area"
                />
                <DynamicRow
                    setInput={(e) => setNumberOfFloors(Number(e.target.value))}
                    cellValues={["Number of floors (#)", numberOfFloors]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(e) => setParkingRatio(Number(e.target.value))}
                    cellValues={["Parking Ratio per 1,000 sqft", parkingRatio]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="The parking ratio per 1,000 sqft of rentable space"
                />


                <DynamicRow
                    cellValues={['Calculated Driveway Area', result.drivewayArea.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Parking Area', result.parkingArea.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Sidewalk Area', roundAndLocalString(result.sidewalkArea)]}
                    description="Estimated at about 20% of the building footprint"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Impervious Surface Ratio', (result.imperviousSurfaceRatio * 100).toLocaleString() + "%"]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total handicapped parking spots', result.handicappedParking.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total parking spots', result.parkingSpotsRequired.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint area', Math.round(result.buildingFootprint.area).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint dimensions', `${result.buildingFootprint.dimensions.length}' x ${result.buildingFootprint.dimensions.width}'`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total leasable space', Math.round(result.leaseableBuildingSpace).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total Building sqft', Math.round(result.totalBuildingSqft).toLocaleString()]}
                    isMobile={isMobile}
                    description='The total square feet building space'
                    numberOfCells={2}
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
                {/* House Price Per Sq Ft */}
                <DynamicRow
                    setInput={(e) => setBuildingPricePerSqFt(Number(e.target.value))}
                    cellValues={["Building Price - per Sq Ft ($)", buildingPricePerSqFt]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    description="The average price per square foot for industrial/commercial buildins in this area, determined by local research."
                    inputCellIndex={1}
                />
                {/* Building Sale Price */}
                <DynamicRow
                    cellValues={["Building Sale Price", buildingSalePrice.toLocaleString()]}
                    isMobile={isMobile}
                    description="The total sale price of the building based on the size and price per square foot."
                    numberOfCells={2}
                />

                <DynamicRow
                    setInput={(e) => setHardCostPerSqFt(Number(e.target.value))}
                    cellValues={["Hard Cost per Sq Ft for Building Build ($)", hardCostPerSqFt, (hardCostPerSqFt * result.totalBuildingSqft).toLocaleString()]}
                    isMobile={isMobile}
                    description="The hard costs for building the structure per square foot."
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setPermits(Number(e.target.value))}
                    cellValues={["Permit Costs ($)", permits]}
                    description="The total cost of permits required for the structure build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setMiscCosts(Number(e.target.value))}
                    cellValues={["Misc Costs ($)", miscCosts]}
                    description="Miscellaneous costs involved in the structure."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setHomeBuilderProfitPercentage(Number(e.target.value))}
                    cellValues={["General Contractor Profit (%)", homeBuilderProfitPercentage, homeBuilderProfit.toLocaleString()]}
                    description="The builder's profit based on a percentage of the hard costs."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["Total Hard Costs", totalHardCosts.toLocaleString()]}
                    description="The total hard costs, including construction costs, permits, and miscellaneous costs."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setRealEstateCommissionPercentage(Number(e.target.value))}
                    cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage, Math.round(reAgentCommission).toLocaleString()]}
                    description="The real estate agent commission, calculated as a percentage of the building sale price."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["Land Percentage of Total Value", (landPercentage * 100).toFixed(1) + "%"]}
                    description="The percentage of the total building value attributed to the land."
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Finished Lot Value", Math.round(finishedLotValue).toLocaleString()]}
                    description="The value of the finished lot without the structure."
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={["Raw Land Calculations"]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    header={true}
                />

                <DynamicRow
                    setInput={(e) => setLandDeveloperProfitPercentage(Number(e.target.value))}
                    cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage, Math.round(landDeveloperProfit).toLocaleString()]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(e) => setCostToDevelop(Number(e.target.value))}
                    description="Costs for engineering, architecture, demolition, clearing, street improvements, utilities, etc."
                    cellValues={["Costs to Develop the land ($)", costToDevelop]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(e) => setSDCFees(Number(e.target.value))}
                    description="Fees to the city to connect to the city. Normally this is required for all new developments."
                    cellValues={["SDC Fees ($)", SDCFees]}
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
                    numberOfCells={2}
                    header={true}
                />
                <DynamicRow
                    cellValues={["Land Costs", Math.round(totalOfferToLandOwner).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Soft Costs", Math.round(costToDevelop + landDeveloperProfit + SDCFees).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Hard Costs", Math.round(totalHardCosts).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Total Costs", Math.round(totalCosts).toLocaleString()]}
                    description="Total Costs to Build this Project"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Total Profit", Math.round(buildingSalePrice - totalCosts).toLocaleString()]}
                    description="Total profit if sold at the projected sell price"
                    isMobile={isMobile}
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

export default IndustrialDevelopmentCalculator;
