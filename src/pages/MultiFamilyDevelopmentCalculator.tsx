import DynamicRow from '../components/RowTypes/DynamicRow';
import { convertToPercent, popupBoxValues, removeCommas, roundAndLocalString } from '../utils/utils';
import multifamilyDevelopmentCalculations from '../utils/multifamilyDevelopmentCalculations';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES, OutputKeys, SQ_FT_PER_ACRE } from '../utils/constants';
import { usePersistedState2 } from '../hooks/usePersistedState';
import PopupBox from '../components/PopupBox';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import { useState } from 'react';

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

    const [activeCards, setActiveCards] = useState<Set<OutputKeys>>(new Set([OutputKeys.TotalOfferToLandOwner]));

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

    const outputData: Partial<Record<OutputKeys, { title: string; value: any; value2?: any; description: string | null }>> = {
        [OutputKeys.BasicLandInfo]: {
            title: "Basic Land Info, Land Limitations, Restrictions, and Requirements",
            value: null,
            description: null,
        },
        [OutputKeys.NetBuildableAcres]: {
            title: "Net Buildable Acres",
            value: netBuildableAcres.toLocaleString(),
            description: "The area of land available for building after subtracting unbuildable acres from gross acres.",
        },
        [OutputKeys.LotSize]: {
            title: "Lot Size",
            value: roundAndLocalString(SQ_FT_PER_ACRE * removeCommas(grossAcres)),
            description: "Total size of the lot in sqft",
        },
        [OutputKeys.TotalBuildableSqFt]: {
            title: "Total Buildable Sq Ft",
            value: Math.round(totalBuildableSqFt).toLocaleString(),
            description: "The total buildable square feet after accounting for infrastructure adjustments.",
        },
        [OutputKeys.PermitsPerUnit]: {
            title: "Permits per unit ($/unit)",
            value: permits,
            value2: roundAndLocalString(totalPermitsCost),
            description: "The total cost of permits required for the multifamily build.",
        },
        [OutputKeys.MultifamilySalePrice]: {
            title: "Multifamily Sale Price ($/SQFT)",
            value: roundAndLocalString(perUnitSalePrice),
            value2: totalMultifamilySalePrice.toLocaleString(),
            description:
                "The total sale price of the multifamily based on the size and price per square foot. Based on local research for average pricing.",
        },
        [OutputKeys.REAgentCommission]: {
            title: "RE Agent Commission",
            value: roundAndLocalString(perUnitREAgentCommission),
            value2: roundAndLocalString(totalREAgentCommission),
            description: "The real estate agent commission, calculated as a percentage of the multifamily sale price.",
        },
        [OutputKeys.BuilderProfit]: {
            title: "Builder Profit",
            value: roundAndLocalString(perUnitBuilderProfit),
            value2: roundAndLocalString(totalBuilderProfit),
            description: "The builder's profit based on a percentage of the hard costs, permits, and miscellaneous costs.",
        },
        [OutputKeys.HardCosts]: {
            title: "Hard Cost",
            value: roundAndLocalString(perUnitHardCosts),
            value2: roundAndLocalString(totalHardCosts),
            description: "The total hard costs, including construction and miscellaneous costs.",
        },
        [OutputKeys.HardCostsTotal]: {
            title: "Hard Cost",
            value: roundAndLocalString(totalHardCosts),
            description: "The total hard costs, including construction and miscellaneous costs.",
        },
        [OutputKeys.MiscCosts]: {
            title: "Misc Costs per unit ($/unit)",
            value: miscCosts,
            value2: roundAndLocalString(totalMiscCosts),
            description: "Miscellaneous costs involved in the multifamily build.",
        },
        [OutputKeys.LandPercentage]: {
            title: "Land Percentage of Total Value",
            value: convertToPercent(landPercentage),
            description: "The percentage of the total multifamily value attributed to the finished lot.",
        },
        [OutputKeys.FinishedLotValue]: {
            title: "Finished Lot Value",
            value: roundAndLocalString(perUnitFinishedUnitValue),
            value2: roundAndLocalString(totalFinishedUnitValue),
            description: "The value of the finished lot without the multifamily.",
        },
        [OutputKeys.LandDeveloperProfit]: {
            title: "Land Developer Profit",
            value: roundAndLocalString(perUnitlandDeveloperProfit),
            value2: roundAndLocalString(totalLandDeveloperProfit),
            description: "Percentage profit made by the developer per lot.",
        },
        [OutputKeys.CostToDevelopLand]: {
            title: "Cost to Develop the Land Per Unit",
            value: costToDevelopPerUnit,
            value2: roundAndLocalString(removeCommas(costToDevelopPerUnit) * removeCommas(numberOfUnits)),
            description: "Costs for engineering, clearing, demolition, utilities, and SDCs.",
        },
        [OutputKeys.TotalOfferToLandOwner]: {
            title: "Total Offer for the Land",
            value: roundAndLocalString(perUnitActualToLandOwner),
            value2: roundAndLocalString(totalActualToLandOwner),
            description: "Total offer from the buyer to the land owner or seller.",
        },
        [OutputKeys.TotalCosts]: {
            title: "Total Costs",
            value: roundAndLocalString(totalCosts),
            description: "Total Costs to Build this Project",
        },
        [OutputKeys.TotalProfit]: {
            title: "Total Profit",
            value: roundAndLocalString(totalProfits),
            description: "Total profit if sold at the projected sell price.",
        },
        [OutputKeys.CalculatedValueToLandOwner]: {
            title: "Calculated Value to Land Owner/Seller",
            value: roundAndLocalString(perUnitOfferToLandOwner),
            value2: roundAndLocalString(totalOfferToLandOwner),
            description:
                "The value of each lot after development, as perceived by the landowner or seller.",
        },
        [OutputKeys.TotalParkingSpots]: {
            title: "Total Parking Spots",
            value: resultCalculateBuildingSqftResidential.parkingSpotsRequired.toLocaleString(),
            description: null,
        },
        [OutputKeys.CalculatedDrivewayArea]: {
            title: "Calculated Driveway Area",
            value: resultCalculateBuildingSqftResidential.drivewayArea.toLocaleString(),
            description: null,
        },
        [OutputKeys.CalculatedParkingArea]: {
            title: "Calculated Parking Area",
            value: resultCalculateBuildingSqftResidential.parkingArea.toLocaleString(),
            description: null,
        },
        [OutputKeys.CalculatedSidewalkArea]: {
            title: "Calculated Sidewalk Area",
            value: roundAndLocalString(resultCalculateBuildingSqftResidential.sidewalkArea),
            description: "Estimated at about 20% of the building footprint.",
        },
        [OutputKeys.BuildingFootprintArea]: {
            title: "Building Footprint Area",
            value: Math.round(resultCalculateBuildingSqftResidential.buildingFootprint.area).toLocaleString(),
            description: null,
        },
        [OutputKeys.CalculatedImperviousSurfaceRatio]: {
            title: "Calculated Impervious Surface Ratio",
            value: convertToPercent(resultCalculateBuildingSqftResidential.imperviousSurfaceRatio, 1),
            description: null,
        },
        [OutputKeys.BuildingFootprintDimensions]: {
            title: "Building Footprint Dimensions",
            value: `${resultCalculateBuildingSqftResidential.buildingFootprint.dimensions.length}' x ${resultCalculateBuildingSqftResidential.buildingFootprint.dimensions.width}'`,
            description: null,
        },
        [OutputKeys.UnitSqFt]: {
            title: "Unit Sq Ft",
            value: roundAndLocalString(
                resultCalculateBuildingSqftResidential.totalBuildingSqft / removeCommas(numberOfUnits)
            ),
            description: null,
        },
        [OutputKeys.ProjectOverview]: {
            title: "Project Overview",
            value: null, // No specific value, as this is a header
            description: null,
        },
        [OutputKeys.TotalBuildingSqft]: {
            title: "Total Building Sq Ft",
            value: Math.round(resultCalculateBuildingSqftResidential.totalBuildingSqft).toLocaleString(),
            description: "The total square feet of building space for the project.",
        },
        [OutputKeys.SoftCosts]: {
            title: "Soft Costs",
            value: roundAndLocalString(totalSoftCosts),
            description: "Total soft costs for the project, including fees for permits, engineering, and other services.",
        },
        [OutputKeys.LandCosts]: {
            title: "Land Costs",
            value: roundAndLocalString(totalActualToLandOwner),
            description: "The total cost for acquiring the land for the project.",
        },
    };

    const popupValues = popupBoxValues(activeCards, outputData)
    return (
        <>
            <div className="group-section">
                <div className="input-fields-container">

                    <div className="input-grouping">
                        Basic Land Info Inputs
                    </div>
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
                        cellValues={["Percentage used for common space (%)", commonSpacePercentage]}
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
                        setInput={(value) => setParkingSpotsPerUnit(value)}
                        cellValues={["Parking spots per unit", parkingSpotsPerUnit]}
                        isMobile={isMobile}
                        description="The parking number of parking spots required per unit"
                    />


                    <div className="input-grouping">
                        Building Assumptions
                    </div>

                    <InputRow
                        setInput={(value) => setNumberOfFloors(value)}
                        cellValues={["Number of floors (#)", numberOfFloors]}
                        isMobile={isMobile}
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
                    <div className="input-grouping">
                        Construction Inputs
                    </div>
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


                    <div className="input-grouping">
                        Land Entitlement Inputs
                    </div>
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
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.BasicLandInfo}
                    cellValues={[outputData[OutputKeys.BasicLandInfo]?.title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.NetBuildableAcres}
                    cellValues={[
                        outputData[OutputKeys.NetBuildableAcres]?.title,
                        outputData[OutputKeys.NetBuildableAcres]?.value,
                    ]}
                    description={outputData[OutputKeys.NetBuildableAcres]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalBuildableSqFt}
                    cellValues={[
                        outputData[OutputKeys.TotalBuildableSqFt]?.title,
                        outputData[OutputKeys.TotalBuildableSqFt]?.value,
                    ]}
                    description={outputData[OutputKeys.TotalBuildableSqFt]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalParkingSpots}
                    cellValues={[
                        outputData[OutputKeys.TotalParkingSpots]?.title,
                        outputData[OutputKeys.TotalParkingSpots]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.CalculatedDrivewayArea}
                    cellValues={[
                        outputData[OutputKeys.CalculatedDrivewayArea]?.title,
                        outputData[OutputKeys.CalculatedDrivewayArea]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.CalculatedParkingArea}
                    cellValues={[
                        outputData[OutputKeys.CalculatedParkingArea]?.title,
                        outputData[OutputKeys.CalculatedParkingArea]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.CalculatedSidewalkArea}
                    cellValues={[
                        outputData[OutputKeys.CalculatedSidewalkArea]?.title,
                        outputData[OutputKeys.CalculatedSidewalkArea]?.value,
                    ]}
                    description={outputData[OutputKeys.CalculatedSidewalkArea]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.BuildingFootprintArea}
                    cellValues={[
                        outputData[OutputKeys.BuildingFootprintArea]?.title,
                        outputData[OutputKeys.BuildingFootprintArea]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.CalculatedImperviousSurfaceRatio}
                    cellValues={[
                        outputData[OutputKeys.CalculatedImperviousSurfaceRatio]?.title,
                        outputData[OutputKeys.CalculatedImperviousSurfaceRatio]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.BuildingFootprintDimensions}
                    cellValues={[
                        outputData[OutputKeys.BuildingFootprintDimensions]?.title,
                        outputData[OutputKeys.BuildingFootprintDimensions]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.UnitSqFt}
                    cellValues={[
                        outputData[OutputKeys.UnitSqFt]?.title,
                        outputData[OutputKeys.UnitSqFt]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalBuildingSqft}
                    cellValues={[
                        outputData[OutputKeys.TotalBuildingSqft]?.title,
                        outputData[OutputKeys.TotalBuildingSqft]?.value,
                    ]}
                    description={outputData[OutputKeys.TotalBuildingSqft]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.FinancialAssumptions}
                    cellValues={["Financial Assumptions", "Per Unit", "Total"]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.MultifamilySalePrice}
                    cellValues={[
                        outputData[OutputKeys.MultifamilySalePrice]?.title,
                        outputData[OutputKeys.MultifamilySalePrice]?.value,
                        outputData[OutputKeys.MultifamilySalePrice]?.value2,
                    ]}
                    description={outputData[OutputKeys.MultifamilySalePrice]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.REAgentCommission}
                    cellValues={[
                        outputData[OutputKeys.REAgentCommission]?.title,
                        outputData[OutputKeys.REAgentCommission]?.value,
                        outputData[OutputKeys.REAgentCommission]?.value2,
                    ]}
                    description={outputData[OutputKeys.REAgentCommission]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.BuilderProfit}
                    cellValues={[
                        outputData[OutputKeys.BuilderProfit]?.title,
                        outputData[OutputKeys.BuilderProfit]?.value,
                        outputData[OutputKeys.BuilderProfit]?.value2,
                    ]}
                    description={outputData[OutputKeys.BuilderProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HardCosts}
                    cellValues={[
                        outputData[OutputKeys.HardCosts]?.title,
                        outputData[OutputKeys.HardCosts]?.value,
                        outputData[OutputKeys.HardCosts]?.value2,
                    ]}
                    description={outputData[OutputKeys.HardCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.PermitsPerUnit}
                    cellValues={[
                        outputData[OutputKeys.PermitsPerUnit]?.title,
                        outputData[OutputKeys.PermitsPerUnit]?.value,
                        outputData[OutputKeys.PermitsPerUnit]?.value2,
                    ]}
                    description={outputData[OutputKeys.PermitsPerUnit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.MiscCosts}
                    cellValues={[
                        outputData[OutputKeys.MiscCosts]?.title,
                        outputData[OutputKeys.MiscCosts]?.value,
                        outputData[OutputKeys.MiscCosts]?.value2,
                    ]}
                    description={outputData[OutputKeys.MiscCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandPercentageOfTotalValue}
                    cellValues={[
                        outputData[OutputKeys.LandPercentageOfTotalValue]?.title,
                        outputData[OutputKeys.LandPercentageOfTotalValue]?.value,
                    ]}
                    description={outputData[OutputKeys.LandPercentageOfTotalValue]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.FinishedLotValue}
                    cellValues={[
                        outputData[OutputKeys.FinishedLotValue]?.title,
                        outputData[OutputKeys.FinishedLotValue]?.value,
                        outputData[OutputKeys.FinishedLotValue]?.value2,
                    ]}
                    description={outputData[OutputKeys.FinishedLotValue]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.RawLandCalculations}
                    cellValues={["Raw Land Calculations", "Per Unit", "Total"]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandDeveloperProfit}
                    cellValues={[
                        outputData[OutputKeys.LandDeveloperProfit]?.title,
                        outputData[OutputKeys.LandDeveloperProfit]?.value,
                        outputData[OutputKeys.LandDeveloperProfit]?.value2,
                    ]}
                    description={outputData[OutputKeys.LandDeveloperProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.CostToDevelopLand}
                    cellValues={[
                        outputData[OutputKeys.CostToDevelopLand]?.title,
                        outputData[OutputKeys.CostToDevelopLand]?.value,
                        outputData[OutputKeys.CostToDevelopLand]?.value2,
                    ]}
                    description={outputData[OutputKeys.CostToDevelopLand]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.CalculatedValueToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.CalculatedValueToLandOwner]?.title,
                        outputData[OutputKeys.CalculatedValueToLandOwner]?.value,
                        outputData[OutputKeys.CalculatedValueToLandOwner]?.value2,
                    ]}
                    description={outputData[OutputKeys.CalculatedValueToLandOwner]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalOfferToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.TotalOfferToLandOwner]?.title,
                        outputData[OutputKeys.TotalOfferToLandOwner]?.value,
                        outputData[OutputKeys.TotalOfferToLandOwner]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalOfferToLandOwner]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    output={true}
                />
            </div>



            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.ProjectOverview}
                    cellValues={[outputData[OutputKeys.ProjectOverview]?.title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandCosts}
                    cellValues={[
                        outputData[OutputKeys.LandCosts]?.title,
                        outputData[OutputKeys.LandCosts]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.SoftCosts}
                    cellValues={[
                        outputData[OutputKeys.SoftCosts]?.title,
                        outputData[OutputKeys.SoftCosts]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HardCostsTotal}
                    cellValues={[
                        outputData[OutputKeys.HardCostsTotal]?.title,
                        outputData[OutputKeys.HardCostsTotal]?.value,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalCosts]?.title,
                        outputData[OutputKeys.TotalCosts]?.value,
                    ]}
                    description={outputData[OutputKeys.TotalCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalProfit}
                    cellValues={[
                        outputData[OutputKeys.TotalProfit]?.title,
                        outputData[OutputKeys.TotalProfit]?.value,
                    ]}
                    description={outputData[OutputKeys.TotalProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>

            {/* <DynamicRow
setActiveCards={setActiveCards}
                    activeCards={activeCards}
                setBooleanInput={() => setRequiresHandicappedParking(!requiresHandicappedParking)}
                booleanInputIndex={1}
                cellValues={['Total handicapped parking spots', requiresHandicappedParking, resultCalculateBuildingSqftResidential.handicappedParking.toLocaleString()]}
                isMobile={isMobile}
                numberOfCells={3}
            /> */}

            <PopupBox
                data={popupValues[1]}
                data2={popupValues[3]}
                titles={popupValues[0]}
                dataKeys={popupValues[2]}
                setActiveCards={setActiveCards}
            />

            <ShareButton params={inputs} />
        </>
    );
};

export default MultifamilyDevelopmentCalculator;
