import { useState } from 'react';
import { calculateBuildingSqft, copyToClipboard, roundAndLocalString } from '../utils';

import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';



const IndustrialDevelopmentCalculator = ({ isMobile }: { isMobile: boolean }) => {
    const queryParams = new URLSearchParams(window.location.search)

    const ga = Number(queryParams.get("grossAcres"));
    const uba = Number(queryParams.get("unbuildableAcres"));
    const nof = Number(queryParams.get("numberOfFloors"));
    const misr = Number(queryParams.get("maxImperviousSurfaceRatio"));
    const csp = Number(queryParams.get("commonSpacePercentage"));
    const pr = Number(queryParams.get("parkingRatio"));
    const ca =  Number(queryParams.get("catchAll"));

    const bppsqft = Number(queryParams.get("housePricePerSqFt"));
    const hcpsqft = Number(queryParams.get("hardCostPerSqFt"));
    const p = Number(queryParams.get("permits"));
    const mc = Number(queryParams.get("miscCosts"));
    const hbpp = Number(queryParams.get("homeBuilderProfitPercentage"));
    const recp = Number(queryParams.get("realEstateCommissionPercentage"));
    const ldpp = Number(queryParams.get("landDeveloperProfitPercentage"));
    const ctd = Number(queryParams.get("costToDevelopPerLot"));
    const olc = Number(queryParams.get("ownedLandCost"));



    const [grossAcres, setGrossAcres] = useState(ga ? ga : .3); // Initial value for gross acres
    const [unbuildableAcres, setUnbuildableAcres] = useState(uba ? uba : 0); // Initial value for unbuildable acres
    const [numberOfFloors, setNumberOfFloors] = useState(nof ? nof : 2);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = useState(misr ? misr : 60);
    const [commonSpacePercentage, setCommonSpacePercentage] = useState(csp ? csp : 40);
    const [parkingRatio, setParkingRatio] = useState(pr ? pr : 2);
    const [catchAll, setCatchAll] = useState(ca ? ca : 1.8);

    const [buildingPricePerSqFt, setBuildingPricePerSqFt] = useState(bppsqft ? bppsqft : 240);
    const [hardCostPerSqFt, setHardCostPerSqFt] = useState(hcpsqft ? hcpsqft : 175);
    const [permits, setPermits] = useState(p ? p : 12000); // Permit cost
    const [miscCosts, setMiscCosts] = useState(mc ? mc : 7500); // Miscellaneous costs
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = useState(hbpp ? hbpp : 20); // Builder profit percentage
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = useState(recp ? recp : 3); // RE commission percentage
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = useState(ldpp ? ldpp : 15); // Land developer profit percentage
    const [costToDevelopPerLot, setCostToDevelopPerLot] = useState(ctd ? ctd : 40000); // Cost to develop land per lot
    const [ownedLandCost, setOwnedLandCost] = useState(olc ? olc : 0); // Cost to develop land per lot


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
        costToDevelopPerLot: number;
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
        costToDevelopPerLot,
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
    const totalOfferToLandOwner = ownedLandCost ? ownedLandCost : finishedLotValue - costToDevelopPerLot - landDeveloperProfit;
    const totalCosts = totalOfferToLandOwner + costToDevelopPerLot + landDeveloperProfit + totalHardCosts
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
                    setInput={(e) => setNumberOfFloors(Number(e.target.value))}
                    cellValues={["Number of floors", numberOfFloors]}
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
                    setInput={(e) => setCatchAll(Number(e.target.value))}
                    cellValues={["Approach Catch All", catchAll]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="A catchall amount for extra approaches, garbage, utilities, and other miscellaneous items. This is added to the Calculated Driveway Area"

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
                    setInput={(e) => setCostToDevelopPerLot(Number(e.target.value))}
                    description="Costs for engineering, clearing, demolition, utilities, and SDC (System Development Charges), etc."
                    cellValues={["Cost to Develop the Land ($)", costToDevelopPerLot]}
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
                    cellValues={["Soft Costs", Math.round(costToDevelopPerLot + landDeveloperProfit).toLocaleString()]}
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
