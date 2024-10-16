import { useState } from 'react';
import { calculateBuildingSqft, copyToClipboard, roundAndLocalString } from '../utils';
import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';


const LandCalculator = ({ isMobile }: { isMobile: boolean }) => {
    const queryParams = new URLSearchParams(window.location.search)
    const ga = Number(queryParams.get("grossAcres"));
    const uba = Number(queryParams.get("unbuildableAcres"));

    const nof = Number(queryParams.get("numberOfFloors"));
    const misr = Number(queryParams.get("maxImperviousSurfaceRatio"));
    const csp = Number(queryParams.get("commonSpacePercentage"));
    const pr = Number(queryParams.get("parkingRatio"));
    const ca = Number(queryParams.get("catchAll"));

    const sqftpl = Number(queryParams.get("sqFtPerLot"));
    const upa = Number(queryParams.get("unitsPerAcre"));
    const hs = Number(queryParams.get("houseSize"));
    const hspsqft = Number(queryParams.get("housePricePerSqFt"));
    const hcpsqft = Number(queryParams.get("hardCostPerSqFt"));
    const p = Number(queryParams.get("permits"));
    const mc = Number(queryParams.get("miscCosts"));
    const hbpp = Number(queryParams.get("homeBuilderProfitPercentage"));
    const recp = Number(queryParams.get("realEstateCommissionPercentage"));
    const ldpp = Number(queryParams.get("landDeveloperProfitPercentage"));
    const ctdpl = Number(queryParams.get("costToDevelopPerLot"));
    const olc = Number(queryParams.get("ownedLandCost"));




    const [grossAcres, setGrossAcres] = useState(ga ? ga : 1.65); // Initial value for gross acres
    const [unbuildableAcres, setUnbuildableAcres] = useState(uba ? uba : 0); // Initial value for unbuildable acres
    const [sqFtPerLot, setSqFtPerLot] = useState(sqftpl ? sqftpl : 1500); // Zoning: square feet per lot
    const [unitsPerAcre, setUnitsPerAcre] = useState<number | undefined>(upa ? upa : 0); // Zoning: units per acre
    const [houseSize, setHouseSize] = useState(hs ? hs : 1500); // House size in Sq Ft
    const [housePricePerSqFt, setHousePricePerSqFt] = useState(hspsqft ? hspsqft : 300); // House price per Sq Ft
    const [hardCostPerSqFt, setHardCostPerSqFt] = useState(hcpsqft ? hcpsqft : 185); // Hard cost per Sq Ft

    const [numberOfFloors, setNumberOfFloors] = useState(nof ? nof : 2);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = useState(misr ? misr : 85);
    const [commonSpacePercentage, setCommonSpacePercentage] = useState(csp ? csp : 0);
    const [parkingRatio, setParkingRatio] = useState(pr ? pr : 1);
    const [catchAll, setCatchAll] = useState(ca ? ca : 1.8);




    const [permits, setPermits] = useState(p ? p : 12000); // Permit cost
    const [miscCosts, setMiscCosts] = useState(mc ? mc : 7500); // Miscellaneous costs
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = useState(hbpp ? hbpp : 20); // Builder profit percentage
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = useState(recp ? recp : 3); // RE commission percentage
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = useState(ldpp ? ldpp : 15); // Land developer profit percentage
    const [costToDevelopPerLot, setCostToDevelopPerLot] = useState(ctdpl ? ctdpl : 40000); // Cost to develop land per lot
    const [ownedLandCost, setOwnedLandCost] = useState(olc ? olc : 0); // Cost to develop land per lot



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

    const result = calculateBuildingSqft(totalBuildableSqFt, numberOfFloors, parkingRatio / 1000, maxImperviousSurfaceRatio / 100, commonSpacePercentage, catchAll);

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

            <div className='tables-container'>
                <div className="table-container">
                    <DynamicRow
                        cellValues={["1. Basic Land Info"]}
                        isMobile={isMobile}
                        numberOfCells={1}
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
                        cellValues={["2. Land Limitations, Restrictions, and Requirements"]}
                        isMobile={isMobile}
                        numberOfCells={1}
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
            </div>

            <div className='tables-container'>
                <div className="table-container">
                    <DynamicRow
                        cellValues={["3. Impervious Calculations Limitations"]}
                        isMobile={isMobile}
                        numberOfCells={1}
                        header={true}
                    />
                    <DynamicRow
                        cellValues={['Lot Size', (SQ_FT_PER_ACRE * grossAcres).toLocaleString()]}
                        description='Total size of the lot in sqft'
                        isMobile={isMobile}
                        numberOfCells={2}
                    />

                    <DynamicRow
                        setInput={(e) => setCommonSpacePercentage(Number(e.target.value))}
                        cellValues={["Percentage used for common space(%)", commonSpacePercentage]}
                        description="Any building that requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, etc. This is common in larger multifamily developments"
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
                        cellValues={['Calculated Driveway Area', roundAndLocalString((result.drivewayArea / totalLotYield)), roundAndLocalString(result.drivewayArea)]}
                        isMobile={isMobile}
                        numberOfCells={3}
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
                        cellValues={["4. Financial Assumptions"]}
                        isMobile={isMobile}
                        numberOfCells={1}
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

            </div>
            <div className='tables-container'>

                <div className="table-container">
                    <DynamicRow
                        cellValues={["5. Raw Land Calculations"]}
                        isMobile={isMobile}
                        numberOfCells={1}
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
                        cellValues={["6. Project Overview"]}
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
                    <DynamicRow
                        cellValues={["Total Costs", roundAndLocalString(totalCosts)]}
                        description="Total Costs to Build this Project"
                        isMobile={isMobile}
                        numberOfCells={2}
                    />
                    <DynamicRow
                        cellValues={["Total Profit", roundAndLocalString(totalProfits)]}
                        isMobile={isMobile}
                        description="Total profit if sold at the projected sell price"
                        numberOfCells={2}
                        output={true}
                    />
                </div>
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
