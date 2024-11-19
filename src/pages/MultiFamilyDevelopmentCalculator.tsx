import DynamicRow from '../components/RowTypes/DynamicRow';
import { convertToPercent, removeCommas, roundAndLocalString } from '../utils/utils';
import multifamilyDevelopmentCalculations from '../utils/multifamilyDevelopmentCalculations';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import { usePersistedState2 } from '../hooks/usePersistedState';
import PopupBox from '../components/PopupBox';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';

interface MultifamilyDevelopmentCalculationProps {
    isMobile: boolean;
    page: EPageNames;


}

const MultifamilyDevelopmentCalculator: React.FC<MultifamilyDevelopmentCalculationProps> = ({
    isMobile,
    page


}) => {

    const queryParams = new URLSearchParams(window.location.search)


    const [grossAcres, setGrossAcres] = usePersistedState2(page, EAllStates.grossAcres, DEFAULT_VALUES[page].grossAcres, queryParams);
    const [builderProfitPercentage, setBuilderProfitPercentage] = usePersistedState2(page, EAllStates.builderProfitPercentage, DEFAULT_VALUES[page].builderProfitPercentage, queryParams);
    const [catchAll, setCatchAll] = usePersistedState2(page, EAllStates.catchAll, DEFAULT_VALUES[page].catchAll, queryParams);
    const [commonSpacePercentage, setCommonSpacePercentage] = usePersistedState2(page, EAllStates.commonSpacePercentage, DEFAULT_VALUES[page].commonSpacePercentage, queryParams);
    const [costToDevelopPerUnit, setCostToDevelopPerUnit] = usePersistedState2(page, EAllStates.costToDevelopPerUnit, DEFAULT_VALUES[page].costToDevelopPerUnit, queryParams);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState2(page, EAllStates.hardCostPerSqFt, DEFAULT_VALUES[page].hardCostPerSqFt, queryParams);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState2(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams);
    const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = usePersistedState2(page, EAllStates.maxImperviousSurfaceRatio, DEFAULT_VALUES[page].maxImperviousSurfaceRatio, queryParams);
    const [miscCosts, setMiscCosts] = usePersistedState2(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams);
    const [multifamilyPricePerSqFt, setMultifamilyPricePerSqFt] = usePersistedState2(page, EAllStates.multifamilyPricePerSqFt, DEFAULT_VALUES[page].multifamilyPricePerSqFt, queryParams);
    const [multifamilyPricePerUnit, setMultifamilyPricePerUnit] = usePersistedState2(page, EAllStates.multifamilyPricePerUnit, DEFAULT_VALUES[page].multifamilyPricePerUnit, queryParams);
    
    
    const [numberOfFloors, setNumberOfFloors] = usePersistedState2(page, EAllStates.numberOfFloors, DEFAULT_VALUES[page].numberOfFloors, queryParams);
    const [numberOfUnits, setNumberOfUnits] = usePersistedState2(page, EAllStates.numberOfUnits, DEFAULT_VALUES[page].numberOfUnits, queryParams);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState2(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams);
    const [parkingSpotsPerUnit, setParkingSpotsPerUnit] = usePersistedState2(page, EAllStates.parkingSpotsPerUnit, DEFAULT_VALUES[page].parkingSpotsPerUnit, queryParams);
    const [permits, setPermits] = usePersistedState2(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);
    const [requiresHandicappedParking, _setRequiresHandicappedParking] = usePersistedState2(page, EAllStates.requiresHandicappedParking, DEFAULT_VALUES[page].requiresHandicappedParking, queryParams);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState2(page, EAllStates.unbuildableAcres, DEFAULT_VALUES[page].unbuildableAcres, queryParams);


    const inputs = {
        grossAcres,
        unbuildableAcres,
        hardCostPerSqFt,
        permits,
        miscCosts,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        ownedLandCost,
        parkingSpotsPerUnit,
        numberOfUnits,
        numberOfFloors,
        maxImperviousSurfaceRatio,
        catchAll,
        multifamilyPricePerSqFt,
        multifamilyPricePerUnit,
        builderProfitPercentage,
        costToDevelopPerUnit
    }

    const {
        netBuildableAcres,
        totalBuildableSqFt,
        totalMultifamilySalePrice,
        perUnitSalePrice,
        totalHardCosts,
        perUnitHardCosts,
        totalPermitsCost,
        totalMiscCosts,
        totalBuilderProfit,
        perUnitBuilderProfit,
        totalREAgentCommission,
        perUnitREAgentCommission,
        totalFinishedUnitValue,
        perUnitFinishedUnitValue,
        landPercentage,
        perUnitlandDeveloperProfit,
        totalLandDeveloperProfit,
        perUnitOfferToLandOwner,
        totalOfferToLandOwner,
        totalActualToLandOwner,
        perUnitActualToLandOwner,
        totalSoftCosts,
        totalCosts,
        totalProfits,
        resultCalculateBuildingSqftResidential
    } = multifamilyDevelopmentCalculations(inputs, requiresHandicappedParking)

    return (
        <>



            <div className="group-section">
                <div className="input-fields-container">

                    <InputRow
                        cellValues={["Gross Acres", grossAcres]}
                        setInput={value => setGrossAcres(value)}
                        description="The total area of the land in acres before any deductions for unbuildable areas."
                        isMobile={isMobile}
                    />
                    <InputRow
                        cellValues={["Adjusted Unbuildable Acres", unbuildableAcres]}
                        setInput={value => setUnbuildableAcres(value)}
                        description="The total area in acres that cannot be built upon due to environmental or geographical features."
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => setNumberOfUnits(value)}
                        cellValues={['Number of Units', numberOfUnits]}
                        description='Number of units buildible in the multo-family building'
                        isMobile={isMobile}
                    />


                    <InputRow
                        setInput={(value) => setCommonSpacePercentage(value)}
                        cellValues={["Percentage used for common space(%)", commonSpacePercentage]}
                        description="Every building requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, etc."
                        isMobile={isMobile}
                        isPercent={true}
                    />

                    <InputRow
                        setInput={(value) => setMaxImperviousSurfaceRatio(value)}
                        cellValues={["Max Impervious Surface (%)", maxImperviousSurfaceRatio]}
                        description="In certain zonings, the municipality limits the total impervious surface (Default 100%)"
                        isMobile={isMobile}
                        isPercent={true}
                    />

                    <InputRow
                        setInput={(value) => setCatchAll(value)}
                        cellValues={["Extra Pavement Multiple (X)", catchAll]}
                        isMobile={isMobile}
                        description="A catchall amount to capture all extra driveway sqft. This will include extra sqft for approaches, garbage, utilities, and other miscellaneous hardscape excluding sidewalk. This is added to the Calculated Driveway Area"
                    />
                    <InputRow
                        setInput={(value) => setNumberOfFloors(value)}
                        cellValues={["Number of floors (#)", numberOfFloors]}
                        isMobile={isMobile}
                    />
                    <InputRow
                        setInput={(value) => setParkingSpotsPerUnit(value)}
                        cellValues={["Parking spots per unit", parkingSpotsPerUnit]}
                        isMobile={isMobile}
                        description="The parking number of parking spots required per unit"
                    />


                    {/* Multifamily Sale Price */}
                    <InputRow
                        setInput={(value) => setMultifamilyPricePerSqFt(value)}
                        cellValues={["Multifamily Sale Price ($/SQFT)", multifamilyPricePerSqFt]}
                        description="The total sale price of the multifamily based on the size and price per square foot. Inputing in the average price per square foot for multifamilys in this area, determined by local research."
                        isMobile={isMobile}
                    />

                    {/* Multifamily Sale Price */}
                    <InputRow
                        setInput={(value) => setMultifamilyPricePerUnit(value)}
                        cellValues={["Multifamily Sale Price ($/Unit)", removeCommas(multifamilyPricePerUnit) === 0 ? '' : multifamilyPricePerUnit]}
                        description="The total sale price of the multifamily based on the number of units. This can be calculated either through comparable sales in your area or by performing another type of analysis."
                        isMobile={isMobile}
                    />


                    {/* Real Estate Agent Commission */}
                    <InputRow
                        setInput={(value) => setRealEstateCommissionPercentage(value)}
                        cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage]}
                        description="The real estate agent commission, calculated as a percentage of the multifamily sale price."
                        isMobile={isMobile}
                        isPercent={true}
                    />

                    {/* Home Builder Profit */}
                    <InputRow
                        setInput={(value) => setBuilderProfitPercentage(value)}
                        cellValues={["Builder Profit (%)", builderProfitPercentage]}
                        description="The builder's profit based on a percentage of the hard costs, permits and misc costs."
                        isMobile={isMobile}
                        isPercent={true}
                    />



                    {/* Hard Cost Per Sq Ft */}
                    <InputRow
                        setInput={(value) => setHardCostPerSqFt(value)}
                        cellValues={["Hard Cost Multifamily Build ($/SQFT)", hardCostPerSqFt]}
                        description="The total hard costs, including construction costs, and miscellaneous costs. Inputing the hard costs for building the multifamily per square foot."
                        isMobile={isMobile}
                    />



                    {/* Permits */}
                    <InputRow
                        setInput={(value) => setPermits(value)}
                        cellValues={["Permits per unit ($/unit)", permits]}
                        description="The total cost of permits required for the multifamily build."
                        isMobile={isMobile}
                    />


                    {/* Misc Costs */}
                    <InputRow
                        setInput={(value) => setMiscCosts(value)}
                        cellValues={["Misc Costs per unit ($/unit)", miscCosts]}
                        description="Miscellaneous costs involved in the multifamily build."
                        isMobile={isMobile}

                    />


                    <InputRow
                        setInput={(value) => setLandDeveloperProfitPercentage(value)}
                        cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage]}
                        description="Percentage profit made by the developer per lot."
                        isMobile={isMobile}
                        isPercent={true}
                    />

                    {/* Cost to Develop Land Per Unit */}
                    <InputRow
                        setInput={(value) => setCostToDevelopPerUnit(value)}
                        cellValues={["Cost to Develop the Land Per unit ($)", costToDevelopPerUnit]}
                        description="Costs for engineering, clearing, demolition, utilities, and SDC (System Development Charges), etc."
                        isMobile={isMobile}
                    />


                    <InputRow
                        setInput={(value) => setOwnedLandCost(value)}
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
                    cellValues={['Net Buildable Acres', netBuildableAcres.toLocaleString()]}
                    description='The total buildable square feet after accounting for infrastructure adjustments.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Total Buildable Sq Ft', Math.round(totalBuildableSqFt).toLocaleString()]}
                    description='The total buildable square feet after accounting for infrastructure adjustments.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* <DynamicRow
                    setBooleanInput={() => setRequiresHandicappedParking(!requiresHandicappedParking)}
                    booleanInputIndex={1}
                    cellValues={['Total handicapped parking spots', requiresHandicappedParking, resultCalculateBuildingSqftResidential.handicappedParking.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={3}
                /> */}
                <DynamicRow
                    cellValues={['Total parking spots', resultCalculateBuildingSqftResidential.parkingSpotsRequired.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Calculated Driveway Area', resultCalculateBuildingSqftResidential.drivewayArea.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Parking Area', resultCalculateBuildingSqftResidential.parkingArea.toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Sidewalk Area', roundAndLocalString(resultCalculateBuildingSqftResidential.sidewalkArea)]}
                    description="Estimated at about 20% of the building footprint"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Building footprint area', Math.round(resultCalculateBuildingSqftResidential.buildingFootprint.area).toLocaleString()]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    cellValues={['Calculated Impervious Surface Ratio', convertToPercent(resultCalculateBuildingSqftResidential.imperviousSurfaceRatio, 1)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                <DynamicRow
                    cellValues={['Building footprint dimensions', `${resultCalculateBuildingSqftResidential.buildingFootprint.dimensions.length}' x ${resultCalculateBuildingSqftResidential.buildingFootprint.dimensions.width}'`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    cellValues={['Unit sqft', roundAndLocalString(resultCalculateBuildingSqftResidential.totalBuildingSqft / removeCommas(numberOfUnits))]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                <DynamicRow
                    cellValues={['Total Building sqft', Math.round(resultCalculateBuildingSqftResidential.totalBuildingSqft).toLocaleString()]}
                    isMobile={isMobile}
                    description='The total square feet building space'
                    numberOfCells={2}
                    output={true}
                />

            </div>

            <div className="table-container">

                <DynamicRow
                    cellValues={["Financial Assumptions", "Per Unit", "Total"]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />

                {/* Multifamily Sale Price */}
                <DynamicRow
                    cellValues={["Multifamily Sale Price ($/SQFT)", roundAndLocalString(perUnitSalePrice), totalMultifamilySalePrice.toLocaleString()]}
                    description="The total sale price of the multifamily based on the size and price per square foot. Inputing in the average price per square foot for multifamilys in this area, determined by local research."
                    isMobile={isMobile}
                    numberOfCells={3}
                />


                {/* Real Estate Agent Commission */}
                <DynamicRow
                    cellValues={["RE Agent Commission", roundAndLocalString(perUnitREAgentCommission), roundAndLocalString(totalREAgentCommission)]}
                    description="The real estate agent commission, calculated as a percentage of the multifamily sale price."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Home Builder Profit */}
                <DynamicRow
                    cellValues={["Builder Profit", roundAndLocalString(perUnitBuilderProfit), roundAndLocalString(totalBuilderProfit)]}
                    description="The builder's profit based on a percentage of the hard costs, permits and misc costs."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />



                {/* Hard Cost Per Sq Ft */}
                <DynamicRow
                    cellValues={["Hard Cost Multifamily Build ($/SQFT)", roundAndLocalString(perUnitHardCosts), roundAndLocalString(totalHardCosts)]}
                    description="The total hard costs, including construction costs, and miscellaneous costs. Inputing the hard costs for building the multifamily per square foot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />



                {/* Permits */}
                <DynamicRow
                    cellValues={["Permits per unit ($/unit)", permits, roundAndLocalString(totalPermitsCost)]}
                    description="The total cost of permits required for the multifamily build."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />


                {/* Misc Costs */}
                <DynamicRow
                    cellValues={["Misc Costs per unit ($/unit)", miscCosts, roundAndLocalString(totalMiscCosts)]}
                    description="Miscellaneous costs involved in the multifamily build."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Land Percentage */}
                <DynamicRow
                    cellValues={["Land Percentage of Total Value", convertToPercent(landPercentage)]}
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
                    cellValues={["Raw Land Calculations", "Per Unit", "Total"]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />

                {/* Land Developer Profit Per Unit */}
                <DynamicRow
                    cellValues={["Land Developer Profit", roundAndLocalString(perUnitlandDeveloperProfit), roundAndLocalString(totalLandDeveloperProfit)]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Cost to Develop Land Per Unit */}
                <DynamicRow
                    cellValues={["Cost to Develop the Land Per unit", costToDevelopPerUnit, roundAndLocalString(removeCommas(costToDevelopPerUnit) * removeCommas(numberOfUnits))]}
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

                {/* Buyer Offer to Land Owner/Seller */}
                <DynamicRow
                    cellValues={["Total offer for the land", roundAndLocalString(perUnitActualToLandOwner), roundAndLocalString(totalActualToLandOwner)]}
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


            <PopupBox
                data={["$" + roundAndLocalString(totalActualToLandOwner)]}
                titles={["How much you should pay for the land"]}
            />

            <ShareButton params={inputs} />
        </>
    );
};

export default MultifamilyDevelopmentCalculator;
