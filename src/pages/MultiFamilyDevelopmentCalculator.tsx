import { useState } from 'react';
import { calculateBuildingSqft, calculateBuildingSqftResidential, copyToClipboard, getQueryParamBoolean, getQueryParamNumber, roundAndLocalString } from '../utils';
import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';
import { usePersistedState } from '../hooks/usePersistedState';


const PAGE = "RESIDENTIAL_DEVELOPMENT"
const LandCalculator = ({ isMobile }: { isMobile: boolean }) => {
    const queryParams = new URLSearchParams(window.location.search)
    const ga = getQueryParamNumber("grossAcres", queryParams);
    const uba = getQueryParamNumber("unbuildableAcres", queryParams);
    const nou = getQueryParamNumber("numberOfUnits", queryParams);

    const nof = getQueryParamNumber("numberOfFloors", queryParams);
    const misr = getQueryParamNumber("maxImperviousSurfaceRatio", queryParams);
    const csp = getQueryParamNumber("commonSpacePercentage", queryParams);
    const pr = getQueryParamNumber("parkingSpotsPerUnit", queryParams);
    const rhp = getQueryParamBoolean("requiresHandicappedParking", queryParams);
    const ca = getQueryParamNumber("catchAll", queryParams);

    const sqftpl = getQueryParamNumber("sqFtPerLot", queryParams);
    const sqftpu = getQueryParamNumber("sqFtPerUnit", queryParams);
    const upa = getQueryParamNumber("unitsPerAcre", queryParams);
    const hspsqft = getQueryParamNumber("multifamilyPricePerSqFt", queryParams);
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
    const [numberOfUnits, setNumberOfUnits] = usePersistedState(PAGE, 'numberOfUnits', 0, nou);

    const [sqFtPerLot, setSqFtPerLot] = usePersistedState(PAGE, 'sqFtPerLot', 1500, sqftpl);
    const [unitsPerAcre, setUnitsPerAcre] = usePersistedState(PAGE, 'unitsPerAcre', 0, upa);
    const [numberOfFloors, setNumberOfFloors] = usePersistedState(PAGE, 'numberOfFloors', 2, nof);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = usePersistedState(PAGE, 'maxImperviousSurfaceRatio', 60, misr);
    const [commonSpacePercentage, setCommonSpacePercentage] = usePersistedState(PAGE, 'commonSpacePercentage', 0, csp);
    const [parkingSpotsPerUnit, setParkingSpotsPerUnit] = usePersistedState(PAGE, 'parkingSpotsPerUnit', 2, pr);
    const [requiresHandicappedParking, setRequiresHandicappedParking] = usePersistedState(PAGE, 'parkingSpotsPerUnit', true, rhp);
    const [catchAll, setCatchAll] = usePersistedState(PAGE, 'catchAll', 1.8, ca);


    const [multifamilyPricePerSqFt, setMultifamilyPricePerSqFt] = usePersistedState(PAGE, 'multifamilyPricePerSqFt', 300, hspsqft);
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
        multifamilyPricePerSqFt: number;
        hardCostPerSqFt: number;
        permits: number;
        miscCosts: number;
        homeBuilderProfitPercentage: number;
        realEstateCommissionPercentage: number;
        landDeveloperProfitPercentage: number;
        costToDevelopPerLot: number;
        ownedLandCost: number;
        numberOfFloors: number;
        maxImperviousSurfaceRatio: number;
        commonSpacePercentage: number;
        parkingSpotsPerUnit: number;
        numberOfUnits: number;
    } = {
        grossAcres: grossAcres,
        unbuildableAcres,
        sqFtPerLot,
        unitsPerAcre,
        multifamilyPricePerSqFt,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        costToDevelopPerLot,
        ownedLandCost,
        numberOfFloors,
        maxImperviousSurfaceRatio,
        commonSpacePercentage,
        parkingSpotsPerUnit,
        numberOfUnits,
    };






    // Constants
    const SQ_FT_PER_ACRE = 43560;
    const infrastructurePercentage = 70;

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE;


    const yieldBySQFT = Math.floor(totalBuildableSqFt / sqFtPerLot);
    const yieldByUnitsPerAcre = unitsPerAcre ? Math.floor(unitsPerAcre * netBuildableAcres) : Infinity;
    // Calculate total lot yield based on zoning (sq ft per lot)
    const totalLotYield = Math.min(yieldBySQFT, yieldByUnitsPerAcre)

    const totalParkingSpots = parkingSpotsPerUnit * (numberOfUnits ? numberOfUnits : totalLotYield)

    const result = calculateBuildingSqftResidential(totalBuildableSqFt, numberOfFloors, totalParkingSpots, maxImperviousSurfaceRatio / 100, catchAll,
        requiresHandicappedParking);

    const buildingSize = result.buildingSize;
    // Calculations
    const multifamilySalePrice = buildingSize * multifamilyPricePerSqFt;
    const hardCostLessProfit = buildingSize * hardCostPerSqFt + permits + miscCosts;
    const homeBuilderProfit = (homeBuilderProfitPercentage / 100) * hardCostLessProfit;
    const totalHardCostsPerUnit = hardCostLessProfit + homeBuilderProfit;
    const reAgentCommission = (realEstateCommissionPercentage / 100) * multifamilySalePrice;
    const finishedLotValue = multifamilySalePrice - totalHardCostsPerUnit - reAgentCommission;
    const landPercentage = finishedLotValue / multifamilySalePrice;




    const landDeveloperProfitPerLot = (landDeveloperProfitPercentage / 100) * finishedLotValue;
    const landDeveloperProfit = landDeveloperProfitPerLot * totalLotYield
    const perLotOfferToLandOwner = finishedLotValue - costToDevelopPerLot - landDeveloperProfitPerLot;
    const totalOfferToLandOwner = ownedLandCost ? ownedLandCost : perLotOfferToLandOwner * totalLotYield;


    const totalHardCosts = totalHardCostsPerUnit * totalLotYield
    const totalSoftCosts = costToDevelopPerLot * totalLotYield + landDeveloperProfit
    const totalCosts = totalOfferToLandOwner + costToDevelopPerLot * totalLotYield + landDeveloperProfit + totalHardCostsPerUnit * totalLotYield

    // {console.log(`requiresHandicappedParking`, requiresHandicappedParking)}

    const totalProfits = multifamilySalePrice * totalLotYield - totalCosts

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
                    setInput={(e) => setNumberOfUnits(Number(e.target.value))}
                    cellValues={['Number of Units OR Total Lot Yield', numberOfUnits, totalLotYield.toLocaleString()]}
                    description='The total number of buildable lots for multifamilys or if there are special circumstances like being able to develop a 4 plex on a single family lot, the number of units that can be built '
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />


                <DynamicRow
                    setInput={(e) => setCommonSpacePercentage(Number(e.target.value))}
                    cellValues={["Percentage used for common space(%)", commonSpacePercentage]}
                    description="Every building requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, etc."
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
                    cellValues={["Driveway Catch All (X)", catchAll]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="A catchall amount to capture all extra driveway sqft. This will include extra sqft for approaches, garbage, utilities, and other miscellaneous hardscape excluding sidewalk. This is added to the Calculated Driveway Area"
                />
                <DynamicRow
                    setInput={(e) => setNumberOfFloors(Number(e.target.value))}
                    cellValues={["Number of floors (#)", numberOfFloors]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(e) => setParkingSpotsPerUnit(Number(e.target.value))}
                    cellValues={["Parking spots per unit", parkingSpotsPerUnit]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="The parking number of parking spots required per unit"
                />

                <DynamicRow
                    setBooleanInput={(e) => setRequiresHandicappedParking(prev=>!prev)}
                    booleanInputIndex={1}
                    cellValues={['Total handicapped parking spots', requiresHandicappedParking, result.handicappedParking.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                <DynamicRow
                    cellValues={['Total parking spots', result.parkingSpotsRequired.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
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
                    cellValues={['Building footprint area', Math.round(result.buildingFootprint.area).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Impervious Surface Ratio', (result.imperviousSurfaceRatio * 100).toLocaleString() + "%"]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                <DynamicRow
                    cellValues={['Building footprint dimensions', `${result.buildingFootprint.dimensions.length}' x ${result.buildingFootprint.dimensions.width}'`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Unit sqft', roundAndLocalString(result.totalBuildingSqft / (numberOfUnits ? numberOfUnits : totalLotYield))]}
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


                {/* Multifamily Price Per Sq Ft */}
                <DynamicRow
                    setInput={(e) => setMultifamilyPricePerSqFt(Number(e.target.value))}
                    cellValues={["Multifamily Price - per Sq Ft", multifamilyPricePerSqFt]}
                    description="The average price per square foot for multifamilys in this area, determined by local research."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                {/* Multifamily Sale Price */}
                <DynamicRow
                    cellValues={["Per Unit Sale Price", (multifamilySalePrice / (numberOfUnits ? numberOfUnits : totalLotYield)).toLocaleString()]}
                    description="The total sale price of the multifamily based on the size and price per square foot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Multifamily Sale Price */}
                <DynamicRow
                    cellValues={["Multifamily Sale Price", multifamilySalePrice.toLocaleString()]}
                    description="The total sale price of the multifamily based on the size and price per square foot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Hard Cost Per Sq Ft */}
                <DynamicRow
                    setInput={(e) => setHardCostPerSqFt(Number(e.target.value))}
                    cellValues={["Hard Cost per Sq Ft for Multifamily Build ($)", hardCostPerSqFt, (hardCostPerSqFt * buildingSize).toLocaleString()]}
                    description="The hard costs for building the multifamily per square foot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />



                {/* Permits */}
                <DynamicRow
                    setInput={(e) => setPermits(Number(e.target.value))}
                    cellValues={["Permits per unit ($)", permits]}
                    description="The total cost of permits required for the multifamily build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />


                {/* Misc Costs */}
                <DynamicRow
                    setInput={(e) => setMiscCosts(Number(e.target.value))}
                    cellValues={["Misc Costs per unit ($)", miscCosts]}
                    description="Miscellaneous costs involved in the multifamily build."
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
                    description="The real estate agent commission, calculated as a percentage of the multifamily sale price."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Land Percentage */}
                <DynamicRow
                    cellValues={["Land Percentage of Total Value", (landPercentage * 100).toFixed(1) + "%"]}
                    description="The percentage of the total multifamily value attributed to the finished lot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Finished Lot Value */}
                <DynamicRow
                    cellValues={["Finished Lot Value", Math.round(finishedLotValue).toLocaleString()]}
                    description="The value of the finished lot without the multifamily."
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
