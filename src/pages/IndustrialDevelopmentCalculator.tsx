import { convertToPercent, removeCommas, roundAndLocalString, setInLocalStorage } from '../utils/utils';
import DynamicRow from '../components/RowTypes/DynamicRow';
import industrialDevelopmentCalculations from '../utils/industrialDevelopmentCalculations';
import { DEFAULT_VALUES, SQ_FT_PER_ACRE } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import { usePersistedState2 } from '../hooks/usePersistedState';

import PopupBox from '../components/PopupBox';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';


interface MultifamilyDevelopmentCalculationProps {
    isMobile: boolean;
    page: EPageNames;
}


const IndustrialDevelopmentCalculator: React.FC<MultifamilyDevelopmentCalculationProps> = ({

    isMobile,
    page,


}) => {
    const queryParams = new URLSearchParams(window.location.search);

    // const [activeCards, setActiveCards] = useState<Set<string>>(new Set());
    // const toggleCard = (id: string) => {
    //     setActiveCards(prev => {
    //       const newSet = new Set(prev);
    //       if (newSet.has(id)) {
    //         newSet.delete(id);
    //       } else {
    //         newSet.add(id);
    //       }
    //       return newSet;
    //     });
    //   };

      

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
    const [leaseRatesPerSQFT, setLeaseRatesPerSQFT] = usePersistedState2(page, EAllStates.leaseRatesPerSQFT, DEFAULT_VALUES[page].leaseRatesPerSQFT, queryParams);
    const [percentageOfIncomeToExpenses, setPercentageOfIncomeToExpenses] = usePersistedState2(page, EAllStates.percentageOfIncomeToExpenses, DEFAULT_VALUES[page].percentageOfIncomeToExpenses, queryParams);

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
        leaseRatesPerSQFT,
        percentageOfIncomeToExpenses,
        SDCFees
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
        resultCalculateBuildingSqftIndustrial,
        annualLeasingIncome,
        propertyNOI,
        propertyCapRate,
    } = industrialDevelopmentCalculations(inputs)


    console.log(`propertyCapRate`, propertyCapRate)
    return (
        <>
            <div className="group-section">
                <div className="input-fields-container" >

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.grossAcres}`); setGrossAcres(value) }}
                        cellValues={["Gross Acres", grossAcres]}
                        description="The total area of the land in acres before any deductions for unbuildable areas."
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.unbuildableAcres}`); setUnbuildableAcres(value) }}
                        cellValues={["Adjusted Unbuildable Acres", unbuildableAcres]}
                        description="The total area in acres that cannot be built upon due to environmental or geographical features."
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.commonSpacePercentage}`); setCommonSpacePercentage(value) }}
                        cellValues={["Percentage used for common space(%)", commonSpacePercentage]}
                        description="Every building requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, bathrooms, kitchen areas, etc."
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.maxImperviousSurfaceRatio}`); setMaxImperviousSurfaceRatio(value) }}
                        cellValues={["Max Impervious Surface (%)", maxImperviousSurfaceRatio]}
                        description="In certain zonings, the municipality limits the total impervious surface (Default 100%)"
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.catchAll}`); setCatchAll(value) }}
                        cellValues={["Extra Pavement Multiple (X)", catchAll]}
                        isMobile={isMobile}
                        description="A catchall amount for extra approaches, garbage, utilities, and other miscellaneous items. This is added to the Calculated Driveway Area"
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.numberOfFloors}`); setNumberOfFloors(value) }}
                        cellValues={["Number of floors (#)", numberOfFloors]}
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.parkingRatio}`); setParkingRatio(value) }}
                        cellValues={["Parking Ratio per 1,000 sqft", parkingRatio]}
                        isMobile={isMobile}
                        description="The parking ratio per 1,000 sqft of rentable space"
                    />




                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.leaseRatesPerSQFT}`); setLeaseRatesPerSQFT(value) }}
                        cellValues={["Annual rents per sqft", leaseRatesPerSQFT]}
                        isMobile={isMobile}
                        description="The annual rents per square foot this property should generate"
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.percentageOfIncomeToExpenses}`); setPercentageOfIncomeToExpenses(value) }}
                        cellValues={["Percentage of Income to Expenses", percentageOfIncomeToExpenses]}
                        isMobile={isMobile}
                        description="This is an estimate of how much of the income goes to expenses"
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.buildingPricePerSqFt}`); setBuildingPricePerSqFt(value) }}
                        cellValues={["Building Price - per Sq Ft ($)", buildingPricePerSqFt]}
                        isMobile={isMobile}
                        description="The average price per square foot for industrial/commercial buildins in this area, determined by local research."
                    />



                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.hardCostPerSqFt}`); setHardCostPerSqFt(value) }}
                        cellValues={["Hard Cost per Sq Ft for Building Build ($)", hardCostPerSqFt]}
                        isMobile={isMobile}
                        description="The hard costs for building the structure per square foot."
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.permits}`); setPermits(value) }}
                        cellValues={["Permit Costs ($)", permits]}
                        description="The total cost of permits required for the structure build."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.miscCosts}`); setMiscCosts(value) }}
                        cellValues={["Misc Costs ($)", miscCosts]}
                        description="Miscellaneous costs involved in the structure."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.homeBuilderProfitPercentage}`); setHomeBuilderProfitPercentage(value) }}
                        cellValues={["General Contractor Profit (%)", homeBuilderProfitPercentage]}
                        description="The builder's profit based on a percentage of the hard costs."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
                        cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage]}
                        description="The real estate agent commission, calculated as a percentage of the building sale price."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.landDeveloperProfitPercentage}`); setLandDeveloperProfitPercentage(value) }}
                        cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage]}
                        description="Percentage profit made by the developer per lot."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.costToDevelop}`); setCostToDevelop(value) }}
                        description="Costs for engineering, architecture, demolition, clearing, street improvements, utilities, etc."
                        cellValues={["Costs to Develop the land ($)", costToDevelop]}
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.SDCFees}`); setSDCFees(value) }}
                        description="Fees to the city to connect to the city. Normally this is required for all new developments."
                        cellValues={["SDC Fees ($)", SDCFees]}
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => {
                            setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.ownedLandCost}`); setOwnedLandCost(value)
                        }}
                        description="If you own the property already, enter in the price of the property here"
                        cellValues={["Land value if already own ($)", removeCommas(ownedLandCost) === 0 ? '' : ownedLandCost]}
                        isMobile={isMobile}
                    />
                </div>
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={["Basic Land Info, Land Limitations, Restrictions, and Requirements"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
               
                <DynamicRow
                    cellValues={['Net Buildable Acres', roundAndLocalString(netBuildableAcres)]}
                    description=' The area of land available for building after subtracting unbuildable acres from gross acres.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Lot Size', roundAndLocalString((SQ_FT_PER_ACRE * removeCommas(grossAcres)))]}
                    description='Total size of the lot in sqft'
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                
                

                <DynamicRow
                    cellValues={['Calculated Driveway Area', roundAndLocalString(resultCalculateBuildingSqftIndustrial.drivewayArea)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Parking Area', roundAndLocalString(resultCalculateBuildingSqftIndustrial.parkingArea)]}
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
                    cellValues={['Calculated Impervious Surface Ratio', convertToPercent(resultCalculateBuildingSqftIndustrial.imperviousSurfaceRatio, 1)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total handicapped parking spots', roundAndLocalString(resultCalculateBuildingSqftIndustrial.handicappedParking)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total parking spots', roundAndLocalString(resultCalculateBuildingSqftIndustrial.parkingSpotsRequired)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint area', roundAndLocalString((resultCalculateBuildingSqftIndustrial.buildingFootprint.area))]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint dimensions', `${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.length}' x ${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.width}'`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total leasable space', roundAndLocalString((resultCalculateBuildingSqftIndustrial.leaseableBuildingSpace))]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total Building sqft', roundAndLocalString((resultCalculateBuildingSqftIndustrial.totalBuildingSqft))]}
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
                
                <DynamicRow
                    cellValues={['Annual Rental Income', roundAndLocalString(annualLeasingIncome)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
              
                {/* Building Sale Price */}
                <DynamicRow
                    cellValues={["Building Sale Price", roundAndLocalString(buildingSalePrice)]}
                    isMobile={isMobile}
                    description="The total sale price of the building based on the size and price per square foot."
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Property NOI', roundAndLocalString(propertyNOI)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Property Cap Rate', convertToPercent(propertyCapRate)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={["Hard Cost for Build ($)", roundAndLocalString((removeCommas(hardCostPerSqFt) * resultCalculateBuildingSqftIndustrial.totalBuildingSqft))]}
                    isMobile={isMobile}
                    description="The hard costs for building the structure per square foot."
                    numberOfCells={2}
                />

                

                <DynamicRow
                    cellValues={["General Contractor Profit ($)",roundAndLocalString(homeBuilderProfit)]}
                    description="The builder's profit based on a percentage of the hard costs."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={["Total Hard Costs", roundAndLocalString(totalHardCosts)]}
                    description="The total hard costs, including construction costs, permits, and miscellaneous costs."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["RE Agent Commission ($)",  roundAndLocalString((reAgentCommission))]}
                    description="The real estate agent commission, calculated as a percentage of the building sale price."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={["Land Percentage of Total Value", convertToPercent(landPercentage, 1)]}
                    description="The percentage of the total building value attributed to the land."
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Finished Lot Value", roundAndLocalString((finishedLotValue))]}
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
                    cellValues={["Land Developer Profit (%)",  roundAndLocalString((landDeveloperProfit))]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    description="Costs for engineering, architecture, demolition, clearing, street improvements, utilities, etc."
                    cellValues={["Costs to Develop the land ($)", costToDevelop]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    description="Fees to the city to connect to the city. Normally this is required for all new developments."
                    cellValues={["SDC Fees ($)", SDCFees]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                 
                    description="If you own the property already, enter in the price of the property here"
                    cellValues={["Land value if already own ($)", removeCommas(ownedLandCost) === 0 ? '' : ownedLandCost]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={["Offer to Land Owner/Seller", roundAndLocalString((totalOfferToLandOwner))]}
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
                    cellValues={["Land Costs", roundAndLocalString((totalOfferToLandOwner))]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Soft Costs", roundAndLocalString((removeCommas(costToDevelop) + landDeveloperProfit + removeCommas(SDCFees)))]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Hard Costs", roundAndLocalString((totalHardCosts))]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Total Costs", roundAndLocalString((totalCosts))]}
                    description="Total Costs to Build this Project"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={["Total Profit", roundAndLocalString((buildingSalePrice - totalCosts))]}
                    description="Total profit if sold at the projected sell price"
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>


            <PopupBox
                data={[
                    // convertToPercent(propertyCapRate),
                    "$" + roundAndLocalString(totalOfferToLandOwner),

                
                ]}
                titles={[
                    // "Cap rate for the property",
                    "How much you should pay for the land"
                ]}
            />


            <ShareButton params={inputs} />

        </>
    );
};

export default IndustrialDevelopmentCalculator;
