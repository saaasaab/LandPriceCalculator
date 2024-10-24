import { useState } from 'react';
import { calculateBuildingSqftResidential, copyToClipboard, getQueryParamBoolean, getQueryParamNumber, roundAndLocalString } from '../utils';
import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';
import { usePersistedState } from '../hooks/usePersistedState';


const PAGE = "MULTIFAMILY_DEVELOPMENT"
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

    // const sqftpl = getQueryParamNumber("sqFtPerUnit", queryParams);
    const hspsqft = getQueryParamNumber("multifamilyPricePerSqFt", queryParams);
    const hcpsqft = getQueryParamNumber("hardCostPerSqFt", queryParams);
    const p = getQueryParamNumber("permits", queryParams);
    const mc = getQueryParamNumber("miscCosts", queryParams);
    const hbpp = getQueryParamNumber("builderProfitPercentage", queryParams);
    const recp = getQueryParamNumber("realEstateCommissionPercentage", queryParams);
    const ldpp = getQueryParamNumber("landDeveloperProfitPercentage", queryParams);
    const ctdpl = getQueryParamNumber("costToDevelopPerUnit", queryParams);
    const olc = getQueryParamNumber("ownedLandCost", queryParams);

    const [grossAcres, setGrossAcres] = usePersistedState(PAGE, 'grossAcres', .25, ga);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState(PAGE, 'unbuildableAcres', 0, uba);
    const [numberOfUnits, setNumberOfUnits] = usePersistedState(PAGE, 'numberOfUnits', 4, nou);

    // const [sqFtPerUnit, setSqFtPerUnit] = usePersistedState(PAGE, 'sqFtPerUnit', 1500, sqftpl);
    const [numberOfFloors, setNumberOfFloors] = usePersistedState(PAGE, 'numberOfFloors', 2, nof);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = usePersistedState(PAGE, 'maxImperviousSurfaceRatio', 60, misr);
    const [commonSpacePercentage, setCommonSpacePercentage] = usePersistedState(PAGE, 'commonSpacePercentage', 0, csp);
    const [parkingSpotsPerUnit, setParkingSpotsPerUnit] = usePersistedState(PAGE, 'parkingSpotsPerUnit', 1.5, pr);
    const [requiresHandicappedParking, setRequiresHandicappedParking] = usePersistedState(PAGE, 'requiresHandicappedParking', true, rhp);
    const [catchAll, setCatchAll] = usePersistedState(PAGE, 'catchAll', 1.8, ca);


    const [multifamilyPricePerSqFt, setMultifamilyPricePerSqFt] = usePersistedState(PAGE, 'multifamilyPricePerSqFt', 300, hspsqft);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState(PAGE, 'hardCostPerSqFt', 185, hcpsqft);
    const [permits, setPermits] = usePersistedState(PAGE, 'permits', 12000, p);
    const [miscCosts, setMiscCosts] = usePersistedState(PAGE, 'miscCosts', 7500, mc);
    const [builderProfitPercentage, setBuilderProfitPercentage] = usePersistedState(PAGE, 'builderProfitPercentage', 20, hbpp);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState(PAGE, 'realEstateCommissionPercentage', 3, recp);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState(PAGE, 'landDeveloperProfitPercentage', 15, ldpp);
    const [costToDevelopPerUnit, setCostToDevelopPerUnit] = usePersistedState(PAGE, 'costToDevelopPerUnit', 40000, ctdpl);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState(PAGE, 'ownedLandCost', 0, olc);

    const [copied, setCopied] = useState(false);

    const params: {
        grossAcres: number;
        unbuildableAcres: number;
        // sqFtPerUnit: number;
        multifamilyPricePerSqFt: number;
        hardCostPerSqFt: number;
        permits: number;
        miscCosts: number;
        builderProfitPercentage: number;
        realEstateCommissionPercentage: number;
        landDeveloperProfitPercentage: number;
        costToDevelopPerUnit: number;
        ownedLandCost: number;
        numberOfFloors: number;
        maxImperviousSurfaceRatio: number;
        commonSpacePercentage: number;
        parkingSpotsPerUnit: number;
        numberOfUnits: number;
        requiresHandicappedParking: boolean;

    } = {
        grossAcres: grossAcres,
        unbuildableAcres,
        // sqFtPerUnit,
        multifamilyPricePerSqFt,
        hardCostPerSqFt,
        permits,
        miscCosts,
        builderProfitPercentage,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        costToDevelopPerUnit,
        ownedLandCost,
        numberOfFloors,
        maxImperviousSurfaceRatio,
        commonSpacePercentage,
        parkingSpotsPerUnit,
        numberOfUnits,
        requiresHandicappedParking,
    };


    // Constants
    const SQ_FT_PER_ACRE = 43560;

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE;


    // const yieldBySQFT = Math.floor(totalBuildableSqFt / sqFtPerUnit);
    // Calculate total unit yield based on zoning (sq ft per unit)
    // const totalUnitYield = Math.min(yieldBySQFT, yieldByUnitsPerAcre)

    const totalParkingSpots = parkingSpotsPerUnit * numberOfUnits;

    const result = calculateBuildingSqftResidential(totalBuildableSqFt, numberOfFloors, totalParkingSpots, maxImperviousSurfaceRatio / 100, catchAll,
        requiresHandicappedParking);

    const totalBuildingSqft = result.totalBuildingSqft;
    // Calculations

    const totalMultifamilySalePrice = totalBuildingSqft * multifamilyPricePerSqFt;
    const perUnitSalePrice = totalMultifamilySalePrice / numberOfUnits;


    const totalHardCosts = totalBuildingSqft * hardCostPerSqFt;
    const perUnitHardCosts = totalHardCosts / numberOfUnits;



    const totalPermitsCost = permits * numberOfUnits;
    const totalMiscCosts = miscCosts * numberOfUnits;


    const totalBuildingCosts = totalHardCosts + totalPermitsCost + totalMiscCosts;


    const totalBuilderProfit = (builderProfitPercentage / 100) * totalBuildingCosts;
    const perUnitBuilderProfit = totalBuilderProfit / numberOfUnits;


    const perUnitREAgentCommission = (realEstateCommissionPercentage / 100) * perUnitSalePrice;
    const totalREAgentCommission = (realEstateCommissionPercentage / 100) * totalMultifamilySalePrice;


    const totalFinishedUnitValue = totalMultifamilySalePrice - totalBuildingCosts - totalBuilderProfit - totalREAgentCommission;

    const perUnitFinishedUnitValue = totalFinishedUnitValue / numberOfUnits;

    const landPercentage = totalFinishedUnitValue / totalMultifamilySalePrice;

    const perUnitlandDeveloperProfit = (landDeveloperProfitPercentage / 100) * perUnitFinishedUnitValue;
    const totalLandDeveloperProfit = perUnitlandDeveloperProfit * numberOfUnits;

    const perUnitOfferToLandOwner = perUnitFinishedUnitValue - costToDevelopPerUnit - perUnitlandDeveloperProfit;
    const totalOfferToLandOwner = perUnitOfferToLandOwner * numberOfUnits;


    const totalActualToLandOwner = (ownedLandCost ? ownedLandCost : perUnitOfferToLandOwner * numberOfUnits);
    const perUnitActualToLandOwner = totalActualToLandOwner / numberOfUnits;



    const totalSoftCosts = costToDevelopPerUnit * numberOfUnits + totalLandDeveloperProfit
    const totalCosts = totalActualToLandOwner + costToDevelopPerUnit * numberOfUnits + totalLandDeveloperProfit + totalHardCosts

    const totalProfits = totalMultifamilySalePrice - totalCosts

    return (
        <div className="land-calculator">
            <header className="app-header">
                <h1>Multi-Family Development Calculator</h1>
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
                    cellValues={['Total Buildable Sq Ft', Math.round(totalBuildableSqFt).toLocaleString()]}
                    description='The total buildable square feet after accounting for infrastructure adjustments.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                <DynamicRow
                    setInput={(e) => setNumberOfUnits(Number(e.target.value))}
                    cellValues={['Number of Units', numberOfUnits]}
                    description='Number of units buildible in the multo-family building'
                    isMobile={isMobile}
                    numberOfCells={2}
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
                    setBooleanInput={() => setRequiresHandicappedParking(prev => !prev)}
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
                    cellValues={['Unit sqft', roundAndLocalString(result.totalBuildingSqft / numberOfUnits)]}
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
                    cellValues={["Financial Assumptions", "Per Unit","Total"]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />


                {/* Multifamily Sale Price */}
                <DynamicRow
                    setInput={(e) => setMultifamilyPricePerSqFt(Number(e.target.value))}
                    cellValues={["Multifamily Sale Price ($/SQFT)", multifamilyPricePerSqFt, roundAndLocalString(perUnitSalePrice), totalMultifamilySalePrice.toLocaleString()]}
                    description="The total sale price of the multifamily based on the size and price per square foot. Inputing in the average price per square foot for multifamilys in this area, determined by local research."
                    isMobile={isMobile}
                    inputCellIndex={1}
                    numberOfCells={4}
                />


                {/* Real Estate Agent Commission */}
                <DynamicRow
                    setInput={(e) => setRealEstateCommissionPercentage(Number(e.target.value))}
                    cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage, roundAndLocalString(perUnitREAgentCommission), roundAndLocalString(totalREAgentCommission)]}
                    description="The real estate agent commission, calculated as a percentage of the multifamily sale price."
                    isMobile={isMobile}
                    numberOfCells={4}
                    inputCellIndex={1}
                />

                {/* Home Builder Profit */}
                <DynamicRow
                    setInput={(e) => setBuilderProfitPercentage(Number(e.target.value))}
                    cellValues={["Builder Profit (%)", builderProfitPercentage, roundAndLocalString(perUnitBuilderProfit), roundAndLocalString(totalBuilderProfit)]}
                    description="The builder's profit based on a percentage of the hard costs, permits and misc costs."
                    isMobile={isMobile}
                    numberOfCells={4}
                    inputCellIndex={1}
                />



                {/* Hard Cost Per Sq Ft */}
                <DynamicRow
                    setInput={(e) => setHardCostPerSqFt(Number(e.target.value))}
                    cellValues={["Hard Cost Multifamily Build ($/SQFT)", hardCostPerSqFt, roundAndLocalString(perUnitHardCosts), roundAndLocalString(totalHardCosts)]}
                    description="The total hard costs, including construction costs, and miscellaneous costs. Inputing the hard costs for building the multifamily per square foot."
                    isMobile={isMobile}
                    numberOfCells={4}
                    inputCellIndex={1}
                />



                {/* Permits */}
                <DynamicRow
                    setInput={(e) => setPermits(Number(e.target.value))}
                    cellValues={["Permits per unit ($/unit)", permits, roundAndLocalString(totalPermitsCost)]}
                    description="The total cost of permits required for the multifamily build."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />


                {/* Misc Costs */}
                <DynamicRow
                    setInput={(e) => setMiscCosts(Number(e.target.value))}
                    cellValues={["Misc Costs per unit ($/unit)", miscCosts, roundAndLocalString(totalMiscCosts)]}
                    description="Miscellaneous costs involved in the multifamily build."
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

                {/* Finished Unit Value */}
                <DynamicRow
                    cellValues={["Finished Lot Value", roundAndLocalString(perUnitFinishedUnitValue), roundAndLocalString(totalFinishedUnitValue)]}
                    description="The value of the finished lot without the multifamily."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    cellValues={["Raw Land Calculations", "Per Unit","Total"]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />

                {/* Land Developer Profit Per Unit */}
                <DynamicRow
                    setInput={(e) => setLandDeveloperProfitPercentage(Number(e.target.value))}
                    cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage, roundAndLocalString(perUnitlandDeveloperProfit), roundAndLocalString(totalLandDeveloperProfit)]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={4}
                    inputCellIndex={1}
                />

                {/* Cost to Develop Land Per Unit */}
                <DynamicRow
                    setInput={(e) => setCostToDevelopPerUnit(Number(e.target.value))}
                    cellValues={["Cost to Develop the Land Per unit ($)", costToDevelopPerUnit, roundAndLocalString(costToDevelopPerUnit * numberOfUnits)]}
                    description="Costs for engineering, clearing, demolition, utilities, and SDC (System Development Charges), etc."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Value Per Unit to Land Owner/Seller */}
                <DynamicRow
                    cellValues={["Calculated value to Land Owner/Seller", roundAndLocalString(perUnitOfferToLandOwner), roundAndLocalString(totalOfferToLandOwner)]}
                    description="The value of each lot after development, as perceived by the landowner or seller."
                    isMobile={isMobile}
                    numberOfCells={3}
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
                    cellValues={["Offer to Land Owner/Seller", roundAndLocalString(perUnitActualToLandOwner), roundAndLocalString(totalActualToLandOwner)]}
                    description="Total offer from the buyer to the land owner or seller."
                    isMobile={isMobile}
                    numberOfCells={3}
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
                    cellValues={["Land Costs", roundAndLocalString(totalActualToLandOwner)]}
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
