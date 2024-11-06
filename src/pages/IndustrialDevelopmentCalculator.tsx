import { removeCommas, roundAndLocalString, setInLocalStorage } from '../utils/utils';
import DynamicRow from '../components/DynamicRow';
import industrialDevelopmentCalculations from '../utils/industrialDevelopmentCalculations';
import { DEFAULT_VALUES, SQ_FT_PER_ACRE } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import { usePersistedState2 } from '../hooks/usePersistedState';


interface MultifamilyDevelopmentCalculationProps {
    // buildingPricePerSqFt: number;
    // catchAll: number;
    // commonSpacePercentage: number;
    // costToDevelop: number;
    // grossAcres: number;
    // hardCostPerSqFt: number;
    // homeBuilderProfitPercentage: number;
    isMobile: boolean;
    page: EPageNames;
    // landDeveloperProfitPercentage: number;
    // maxImperviousSurfaceRatio: number;
    // miscCosts: number;
    // numberOfFloors: number;
    // ownedLandCost: number;
    // parkingRatio: number;
    // permits: number;
    // realEstateCommissionPercentage: number;
    // SDCFees: number;
    // setBuildingPricePerSqFt: (value: number) => void;
    // setCatchAll: (value: number) => void;
    // setCommonSpacePercentage: (value: number) => void;
    // setCostToDevelop: (value: number) => void;
    // setGrossAcres: (value: number) => void;
    // setHardCostPerSqFt: (value: number) => void;
    // setHomeBuilderProfitPercentage: (value: number) => void;
    // setLandDeveloperProfitPercentage: (value: number) => void;
    // setMaxImperviousSurfaceRatio: (value: number) => void;
    // setMiscCosts: (value: number) => void;
    // setNumberOfFloors: (value: number) => void;
    // setOwnedLandCost: (value: number) => void;
    // setParkingRatio: (value: number) => void;
    // setPermits: (value: number) => void;
    // setRealEstateCommissionPercentage: (value: number) => void;
    // setSDCFees: (value: number) => void;
    // setUnbuildableAcres: (value: number) => void;
    // unbuildableAcres: number;

}





const IndustrialDevelopmentCalculator: React.FC<MultifamilyDevelopmentCalculationProps> = ({

    isMobile,
    page,


}) => {
    const queryParams = new URLSearchParams(window.location.search)
    const [grossAcres, setGrossAcres] = usePersistedState2(page, EAllStates.grossAcres, DEFAULT_VALUES[page].grossAcres, queryParams);
    const [buildingPricePerSqFt, setBuildingPricePerSqFt] = usePersistedState2(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].buildingPricePerSqFt, queryParams);
    const [catchAll, setCatchAll] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].catchAll, queryParams);
    const [commonSpacePercentage, setCommonSpacePercentage] = usePersistedState2(page, EAllStates.commonSpacePercentage, DEFAULT_VALUES[page].commonSpacePercentage, queryParams);
    const [costToDevelop, setCostToDevelop] = usePersistedState2(page, EAllStates.costToDevelop, DEFAULT_VALUES[page].costToDevelop, queryParams);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState2(page, EAllStates.hardCostPerSqFt, DEFAULT_VALUES[page].hardCostPerSqFt, queryParams);
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = usePersistedState2(page, EAllStates.homeBuilderProfitPercentage, DEFAULT_VALUES[page].homeBuilderProfitPercentage, queryParams);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState2(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = usePersistedState2(page, EAllStates.maxImperviousSurfaceRatio, DEFAULT_VALUES[page].maxImperviousSurfaceRatio, queryParams);
    const [miscCosts, setMiscCosts] = usePersistedState2(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams);
    const [numberOfFloors, setNumberOfFloors] = usePersistedState2(page, EAllStates.numberOfFloors, DEFAULT_VALUES[page].numberOfFloors, queryParams);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState2(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams);
    const [parkingRatio, setParkingRatio] = usePersistedState2(page, EAllStates.parkingRatio, DEFAULT_VALUES[page].parkingRatio, queryParams);
    const [permits, setPermits] = usePersistedState2(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);
    const [SDCFees, setSDCFees] = usePersistedState2(page, EAllStates.SDCFees, DEFAULT_VALUES[page].SDCFees, queryParams);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState2(page, EAllStates.unbuildableAcres, DEFAULT_VALUES[page].unbuildableAcres, queryParams);


    const inputs = {
        grossAcres,
        unbuildableAcres,
        numberOfFloors,
        parkingRatio,
        maxImperviousSurfaceRatio,
        commonSpacePercentage,
        catchAll,
        buildingPricePerSqFt,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        ownedLandCost,
        costToDevelop,
    }

    const {
        // totalBuildableSqFt,
        // totalBuildingSqft,
        buildingSalePrice,
        totalHardCosts,
        homeBuilderProfit,
        reAgentCommission,
        finishedLotValue,
        landPercentage,
        landDeveloperProfit,
        totalOfferToLandOwner,
        totalCosts,
        netBuildableAcres,
        resultCalculateBuildingSqftIndustrial
    } = industrialDevelopmentCalculations(inputs)


    return (
        <>
            <div className="table-container">
                <DynamicRow
                    cellValues={["Basic Land Info"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.grossAcres}`); setGrossAcres(value) }}
                    cellValues={["Gross Acres", grossAcres]}
                    description="The total area of the land in acres before any deductions for unbuildable areas."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.unbuildableAcres}`); setUnbuildableAcres(value) }}
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
                    cellValues={['Lot Size', (SQ_FT_PER_ACRE * removeCommas(grossAcres)).toLocaleString()]}
                    description='Total size of the lot in sqft'
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.commonSpacePercentage}`); setCommonSpacePercentage(value) }}
                    cellValues={["Percentage used for common space(%)", commonSpacePercentage]}
                    description="Every building requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, bathrooms, kitchen areas, etc."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.maxImperviousSurfaceRatio}`); setMaxImperviousSurfaceRatio(value) }}
                    cellValues={["Max Impervious Surface (%)", maxImperviousSurfaceRatio]}
                    description="In certain zonings, the municipality limits the total impervious surface (Default 100%)"
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.catchAll}`); setCatchAll(value) }}
                    cellValues={["Approach Catch All (X)", catchAll]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="A catchall amount for extra approaches, garbage, utilities, and other miscellaneous items. This is added to the Calculated Driveway Area"
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.numberOfFloors}`); setNumberOfFloors(value) }}
                    cellValues={["Number of floors (#)", numberOfFloors]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.parkingRatio}`); setParkingRatio(value) }}
                    cellValues={["Parking Ratio per 1,000 sqft", parkingRatio]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    description="The parking ratio per 1,000 sqft of rentable space"
                />


                <DynamicRow
                    cellValues={['Calculated Driveway Area', resultCalculateBuildingSqftIndustrial.drivewayArea.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Parking Area', resultCalculateBuildingSqftIndustrial.parkingArea.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Sidewalk Area', roundAndLocalString(resultCalculateBuildingSqftIndustrial.sidewalkArea)]}
                    description="Estimated at about 20% of the building footprint"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Impervious Surface Ratio', (resultCalculateBuildingSqftIndustrial.imperviousSurfaceRatio * 100).toLocaleString() + "%"]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total handicapped parking spots', resultCalculateBuildingSqftIndustrial.handicappedParking.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total parking spots', resultCalculateBuildingSqftIndustrial.parkingSpotsRequired.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint area', Math.round(resultCalculateBuildingSqftIndustrial.buildingFootprint.area).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint dimensions', `${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.length}' x ${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.width}'`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total leasable space', Math.round(resultCalculateBuildingSqftIndustrial.leaseableBuildingSpace).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total Building sqft', Math.round(resultCalculateBuildingSqftIndustrial.totalBuildingSqft).toLocaleString()]}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.buildingPricePerSqFt}`); setBuildingPricePerSqFt(value) }}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.hardCostPerSqFt}`); setHardCostPerSqFt(value) }}
                    cellValues={["Hard Cost per Sq Ft for Building Build ($)", hardCostPerSqFt, (removeCommas(hardCostPerSqFt) * resultCalculateBuildingSqftIndustrial.totalBuildingSqft).toLocaleString()]}
                    isMobile={isMobile}
                    description="The hard costs for building the structure per square foot."
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.permits}`); setPermits(value) }}
                    cellValues={["Permit Costs ($)", permits]}
                    description="The total cost of permits required for the structure build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.miscCosts}`); setMiscCosts(value) }}
                    cellValues={["Misc Costs ($)", miscCosts]}
                    description="Miscellaneous costs involved in the structure."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.homeBuilderProfitPercentage}`); setHomeBuilderProfitPercentage(value) }}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.landDeveloperProfitPercentage}`); setLandDeveloperProfitPercentage(value) }}
                    cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage, Math.round(landDeveloperProfit).toLocaleString()]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.costToDevelop}`); setCostToDevelop(value) }}
                    description="Costs for engineering, architecture, demolition, clearing, street improvements, utilities, etc."
                    cellValues={["Costs to Develop the land ($)", costToDevelop]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.SDCFees}`); setSDCFees(value) }}
                    description="Fees to the city to connect to the city. Normally this is required for all new developments."
                    cellValues={["SDC Fees ($)", SDCFees]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(value) => { 
                        setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.ownedLandCost}`); setOwnedLandCost(value) }}
                    description="If you own the property already, enter in the price of the property here"
                    cellValues={["Property Value", Number(ownedLandCost) === 0 ? undefined : ownedLandCost]}
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
                    cellValues={["Soft Costs", Math.round(removeCommas(costToDevelop) + landDeveloperProfit + removeCommas(SDCFees)).toLocaleString()]}
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



        </>
    );
};

export default IndustrialDevelopmentCalculator;
