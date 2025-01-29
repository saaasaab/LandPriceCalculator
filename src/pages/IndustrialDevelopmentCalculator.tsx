import { convertToPercent, popupBoxValues, removeCommas, roundAndLocalString, setInLocalStorage } from '../utils/utils';
import DynamicRow from '../components/RowTypes/DynamicRow';
import industrialDevelopmentCalculations from '../utils/industrialDevelopmentCalculations';
import { DEFAULT_VALUES, OutputKeys, SQ_FT_PER_ACRE } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import { usePersistedState2 } from '../hooks/usePersistedState';

import PopupBox from '../components/PopupBox';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import { useState } from 'react';

interface MultifamilyDevelopmentCalculationProps {
    isMobile: boolean;
    page: EPageNames;
}

const IndustrialDevelopmentCalculator: React.FC<MultifamilyDevelopmentCalculationProps> = ({
    isMobile,
    page,

}) => {
    const queryParams = new URLSearchParams(window.location.search);

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
    const [annualLeaseRatesPerSQFT, setAnnualLeaseRatesPerSQFT] = usePersistedState2(page, EAllStates.annualLeaseRatesPerSQFT, DEFAULT_VALUES[page].annualLeaseRatesPerSQFT, queryParams);
    const [percentageOfIncomeToExpenses, setPercentageOfIncomeToExpenses] = usePersistedState2(page, EAllStates.percentageOfIncomeToExpenses, DEFAULT_VALUES[page].percentageOfIncomeToExpenses, queryParams);




    const [activeCards, setActiveCards] = useState<Set<OutputKeys>>(new Set([OutputKeys.OfferToLandOwner]));
    // const activeCards: Set<OutputKeys> = new Set([OutputKeys.OfferToLandOwner]);


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
        annualLeaseRatesPerSQFT,
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
        totalSoftCost,
    } = industrialDevelopmentCalculations(inputs)



    const outputData: Partial<Record<OutputKeys, { title: string; value: any; description: string | null }>> = {
        [OutputKeys.BasicLandInfo]: {
            title: "Basic Land Info, Land Limitations, Restrictions, and Requirements",
            value: null,
            description: null,
        },
        [OutputKeys.NetBuildableAcres]: {
            title: "Net Buildable Acres",
            value: netBuildableAcres,
            description: "The area of land available for building after subtracting unbuildable acres from gross acres.",
        },
        [OutputKeys.LotSize]: {
            title: "Lot Size",
            value: roundAndLocalString(SQ_FT_PER_ACRE * removeCommas(grossAcres)),
            description: "Total size of the lot in sqft",
        },
        [OutputKeys.CalculatedDrivewayArea]: {
            title: "Calculated Driveway Area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.drivewayArea),
            description: null,
        },
        [OutputKeys.CalculatedParkingArea]: {
            title: "Calculated Parking Area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.parkingArea),
            description: null,
        },
        [OutputKeys.CalculatedSidewalkArea]: {
            title: "Calculated Sidewalk Area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.sidewalkArea),
            description: "Estimated at about 20% of the building footprint",
        },
        [OutputKeys.CalculatedImperviousSurfaceRatio]: {
            title: "Calculated Impervious Surface Ratio",
            value: convertToPercent(resultCalculateBuildingSqftIndustrial.imperviousSurfaceRatio, 1),
            description: null,
        },
        [OutputKeys.TotalHandicappedParkingSpots]: {
            title: "Total handicapped parking spots",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.handicappedParking),
            description: null,
        },
        [OutputKeys.TotalParkingSpots]: {
            title: "Total parking spots",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.parkingSpotsRequired),
            description: null,
        },
        [OutputKeys.BuildingFootprintArea]: {
            title: "Building footprint area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.buildingFootprint.area),
            description: null,
        },
        [OutputKeys.BuildingFootprintDimensions]: {
            title: "Building footprint dimensions",
            value: `${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.length}' x ${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.width}'`,
            description: null,
        },
        [OutputKeys.TotalLeasableSpace]: {
            title: "Total leasable space",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.leaseableBuildingSpace),
            description: null,
        },
        [OutputKeys.TotalBuildingSqft]: {
            title: "Total Building sqft",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.totalBuildingSqft),
            description: "The total square feet building space",
        },
        [OutputKeys.FinancialAssumptions]: {
            title: "Financial Assumptions",
            value: null,
            description: null,
        },
        [OutputKeys.AnnualRentalIncome]: {
            title: "Annual Rental Income",
            value: roundAndLocalString(annualLeasingIncome),
            description: null,
        },
        [OutputKeys.BuildingSalePrice]: {
            title: "Building Sale Price",
            value: roundAndLocalString(buildingSalePrice),
            description: "The total sale price of the building based on the size and price per square foot.",
        },
        [OutputKeys.PropertyNOI]: {
            title: "Property NOI",
            value: roundAndLocalString(propertyNOI),
            description: null,
        },
        [OutputKeys.PropertyCapRate]: {
            title: "Property Cap Rate",
            value: convertToPercent(propertyCapRate),
            description: null,
        },
        [OutputKeys.HardCostForBuild]: {
            title: "Hard Cost for Build ($)",
            value: roundAndLocalString(removeCommas(hardCostPerSqFt) * resultCalculateBuildingSqftIndustrial.totalBuildingSqft),
            description: "The hard costs for building the structure per square foot.",
        },
        [OutputKeys.GeneralContractorProfit]: {
            title: "General Contractor Profit ($)",
            value: roundAndLocalString(homeBuilderProfit),
            description: "The builder's profit based on a percentage of the hard costs.",
        },
        [OutputKeys.TotalHardCosts]: {
            title: "Total Hard Costs",
            value: roundAndLocalString(totalHardCosts),
            description: "The total hard costs, including construction costs, permits, and miscellaneous costs.",
        },
        [OutputKeys.REAgentCommission]: {
            title: "RE Agent Commission ($)",
            value: roundAndLocalString(reAgentCommission),
            description: "The real estate agent commission, calculated as a percentage of the building sale price.",
        },
        [OutputKeys.LandPercentageOfTotalValue]: {
            title: "Land Percentage of Total Value",
            value: convertToPercent(landPercentage, 1),
            description: "The percentage of the total building value attributed to the land.",
        },
        [OutputKeys.FinishedLotValue]: {
            title: "Finished Lot Value",
            value: roundAndLocalString(finishedLotValue),
            description: "The value of the finished lot without the structure.",
        },

        [OutputKeys.RawLandCalculations]: {
            title: "Raw Land Calculations",
            value: null,
            description: null,
        },
        [OutputKeys.LandDeveloperProfit]: {
            title: "Land Developer Profit ($)",
            value: roundAndLocalString(landDeveloperProfit),
            description: "Percentage profit made by the developer per lot.",
        },
        [OutputKeys.CostToDevelopLand]: {
            title: "Costs to Develop the land ($)",
            value: costToDevelop,
            description: "Costs for engineering, architecture, demolition, clearing, street improvements, utilities, etc.",
        },
        [OutputKeys.SDCFees]: {
            title: "SDC Fees ($)",
            value: SDCFees,
            description: "Fees to the city to connect to the city. Normally this is required for all new developments.",
        },
        [OutputKeys.LandValueIfAlreadyOwned]: {
            title: "Land value if already own ($)",
            value: removeCommas(ownedLandCost) === 0 ? "" : ownedLandCost,
            description: "If you own the property already, enter in the price of the property here.",
        },
        [OutputKeys.OfferToLandOwner]: {
            title: "Max Offer to Land Owner/Seller",
            value: roundAndLocalString(totalOfferToLandOwner),
            description: "Total offer from the buyer to the land owner or seller.",
        },
        [OutputKeys.ProjectOverview]: {
            title: "Project Overview",
            value: null,
            description: null,
        },
        [OutputKeys.LandCosts]: {
            title: "Land Costs",
            value: roundAndLocalString(totalOfferToLandOwner),
            description: null,
        },
        [OutputKeys.SoftCosts]: {
            title: "Soft Costs",
            value: roundAndLocalString(totalSoftCost),
            description: null,
        },
        [OutputKeys.HardCosts]: {
            title: "Hard Costs",
            value: roundAndLocalString(totalHardCosts),
            description: null,
        },
        [OutputKeys.TotalCosts]: {
            title: "Total Costs",
            value: roundAndLocalString(totalCosts),
            description: "Total Costs to Build this Project.",
        },
        [OutputKeys.TotalProfit]: {
            title: "Total Profit",
            value: roundAndLocalString(buildingSalePrice - totalCosts),
            description: "Total profit if sold at the projected sell price. At the max offer price, profits will be 0.",
        },

    };

    const popupValues = popupBoxValues(activeCards, outputData)

    return (
        <>
            <div className="group-section">
                <div className="input-fields-container" >

                    <div className="input-grouping">
                        Basic Land Info Inputs
                    </div>

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
                        cellValues={["Percentage used for common space (%)", commonSpacePercentage]}
                        description="Every building requires common space that cannot be leased and should be excluded from parking calculations. This includes halls, elevators, stairs, foyers, bathrooms, kitchen areas, etc."
                        isMobile={isMobile}
                        isPercent={true}
                    />
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.maxImperviousSurfaceRatio}`); setMaxImperviousSurfaceRatio(value) }}
                        cellValues={["Max Impervious Surface (%)", maxImperviousSurfaceRatio]}
                        description="In certain zonings, the municipality limits the total impervious surface (Default 100%)"
                        isMobile={isMobile}
                        isPercent={true}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.catchAll}`); setCatchAll(value) }}
                        cellValues={["Extra Pavement Multiple (X)", catchAll]}
                        isMobile={isMobile}
                        description="A catchall amount for extra approaches, garbage, utilities, and other miscellaneous items. This is added to the Calculated Driveway Area"
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.parkingRatio}`); setParkingRatio(value) }}
                        cellValues={["Parking Ratio per 1,000 sqft", parkingRatio]}
                        isMobile={isMobile}
                        description="The parking ratio per 1,000 sqft of rentable space"
                    />


                    <div className="input-grouping">
                        Building Assumptions
                    </div>


                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.numberOfFloors}`); setNumberOfFloors(value) }}
                        cellValues={["Number of floors (#)", numberOfFloors]}
                        isMobile={isMobile}
                    />




                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.annualLeaseRatesPerSQFT}`); setAnnualLeaseRatesPerSQFT(value) }}
                        cellValues={["Annual rents per sqft", annualLeaseRatesPerSQFT]}
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
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
                        cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage]}
                        description="The real estate agent commission, calculated as a percentage of the building sale price."
                        isMobile={isMobile}
                        isPercent={true}
                    />

                    <div className="input-grouping">
                        Construction Inputs
                    </div>



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
                        isPercent={true}
                    />

                    <div className="input-grouping">
                        Land Entitlement Inputs
                    </div>

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.landDeveloperProfitPercentage}`); setLandDeveloperProfitPercentage(value) }}
                        cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage]}
                        description="Percentage profit made by the developer per lot."
                        isMobile={isMobile}
                        isPercent={true}
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
                    id={OutputKeys.BasicLandInfo}

                    cellValues={[outputData[OutputKeys.BasicLandInfo]?.title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    id={OutputKeys.NetBuildableAcres}
                    cellValues={[
                        outputData[OutputKeys.NetBuildableAcres]?.title,
                        outputData[OutputKeys.NetBuildableAcres]?.value
                    ]}
                    description={outputData[OutputKeys.NetBuildableAcres]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.LotSize}
                    cellValues={[
                        outputData[OutputKeys.LotSize]?.title,
                        outputData[OutputKeys.LotSize]?.value
                    ]}
                    description={outputData[OutputKeys.LotSize]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.CalculatedDrivewayArea}
                    cellValues={[
                        outputData[OutputKeys.CalculatedDrivewayArea]?.title,
                        outputData[OutputKeys.CalculatedDrivewayArea]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.CalculatedParkingArea}
                    cellValues={[
                        outputData[OutputKeys.CalculatedParkingArea]?.title,
                        outputData[OutputKeys.CalculatedParkingArea]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.CalculatedSidewalkArea}
                    cellValues={[
                        outputData[OutputKeys.CalculatedSidewalkArea]?.title,
                        outputData[OutputKeys.CalculatedSidewalkArea]?.value
                    ]}
                    description={outputData[OutputKeys.CalculatedSidewalkArea]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.CalculatedImperviousSurfaceRatio}
                    cellValues={[
                        outputData[OutputKeys.CalculatedImperviousSurfaceRatio]?.title,
                        outputData[OutputKeys.CalculatedImperviousSurfaceRatio]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalHandicappedParkingSpots}
                    cellValues={[
                        outputData[OutputKeys.TotalHandicappedParkingSpots]?.title,
                        outputData[OutputKeys.TotalHandicappedParkingSpots]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalParkingSpots}
                    cellValues={[
                        outputData[OutputKeys.TotalParkingSpots]?.title,
                        outputData[OutputKeys.TotalParkingSpots]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.BuildingFootprintArea}
                    cellValues={[
                        outputData[OutputKeys.BuildingFootprintArea]?.title,
                        outputData[OutputKeys.BuildingFootprintArea]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.BuildingFootprintDimensions}
                    cellValues={[
                        outputData[OutputKeys.BuildingFootprintDimensions]?.title,
                        outputData[OutputKeys.BuildingFootprintDimensions]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalLeasableSpace}
                    cellValues={[
                        outputData[OutputKeys.TotalLeasableSpace]?.title,
                        outputData[OutputKeys.TotalLeasableSpace]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalBuildingSqft}
                    cellValues={[
                        outputData[OutputKeys.TotalBuildingSqft]?.title,
                        outputData[OutputKeys.TotalBuildingSqft]?.value
                    ]}
                    description={outputData[OutputKeys.TotalBuildingSqft]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={[outputData[OutputKeys.FinancialAssumptions]?.title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    id={OutputKeys.AnnualRentalIncome}
                    cellValues={[
                        outputData[OutputKeys.AnnualRentalIncome]?.title,
                        outputData[OutputKeys.AnnualRentalIncome]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.BuildingSalePrice}
                    cellValues={[
                        outputData[OutputKeys.BuildingSalePrice]?.title,
                        outputData[OutputKeys.BuildingSalePrice]?.value
                    ]}
                    description={outputData[OutputKeys.BuildingSalePrice]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.PropertyNOI}
                    cellValues={[
                        outputData[OutputKeys.PropertyNOI]?.title,
                        outputData[OutputKeys.PropertyNOI]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.PropertyCapRate}
                    cellValues={[
                        outputData[OutputKeys.PropertyCapRate]?.title,
                        outputData[OutputKeys.PropertyCapRate]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.HardCostForBuild}
                    cellValues={[
                        outputData[OutputKeys.HardCostForBuild]?.title,
                        outputData[OutputKeys.HardCostForBuild]?.value
                    ]}
                    description={outputData[OutputKeys.HardCostForBuild]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.GeneralContractorProfit}
                    cellValues={[
                        outputData[OutputKeys.GeneralContractorProfit]?.title,
                        outputData[OutputKeys.GeneralContractorProfit]?.value
                    ]}
                    description={outputData[OutputKeys.GeneralContractorProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalHardCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalHardCosts]?.title,
                        outputData[OutputKeys.TotalHardCosts]?.value
                    ]}
                    description={outputData[OutputKeys.TotalHardCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.REAgentCommission}
                    cellValues={[
                        outputData[OutputKeys.REAgentCommission]?.title,
                        outputData[OutputKeys.REAgentCommission]?.value
                    ]}
                    description={outputData[OutputKeys.REAgentCommission]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.LandPercentageOfTotalValue}
                    cellValues={[
                        outputData[OutputKeys.LandPercentageOfTotalValue]?.title,
                        outputData[OutputKeys.LandPercentageOfTotalValue]?.value
                    ]}
                    description={outputData[OutputKeys.LandPercentageOfTotalValue]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.FinishedLotValue}
                    cellValues={[
                        outputData[OutputKeys.FinishedLotValue]?.title,
                        outputData[OutputKeys.FinishedLotValue]?.value
                    ]}
                    description={outputData[OutputKeys.FinishedLotValue]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={[outputData[OutputKeys.RawLandCalculations]?.title]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    header={true}
                />
                <DynamicRow
                    id={OutputKeys.LandDeveloperProfit}
                    cellValues={[
                        outputData[OutputKeys.LandDeveloperProfit]?.title,
                        outputData[OutputKeys.LandDeveloperProfit]?.value
                    ]}
                    description={outputData[OutputKeys.LandDeveloperProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.CostToDevelopLand}
                    cellValues={[
                        outputData[OutputKeys.CostToDevelopLand]?.title,
                        outputData[OutputKeys.CostToDevelopLand]?.value
                    ]}
                    description={outputData[OutputKeys.CostToDevelopLand]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.SDCFees}
                    cellValues={[
                        outputData[OutputKeys.SDCFees]?.title,
                        outputData[OutputKeys.SDCFees]?.value
                    ]}
                    description={outputData[OutputKeys.SDCFees]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.LandValueIfAlreadyOwned}
                    cellValues={[
                        outputData[OutputKeys.LandValueIfAlreadyOwned]?.title,
                        outputData[OutputKeys.LandValueIfAlreadyOwned]?.value
                    ]}
                    description={outputData[OutputKeys.LandValueIfAlreadyOwned]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.OfferToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.OfferToLandOwner]?.title,
                        outputData[OutputKeys.OfferToLandOwner]?.value
                    ]}
                    description={outputData[OutputKeys.OfferToLandOwner]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={[outputData[OutputKeys.ProjectOverview]?.title]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    header={true}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.LandCosts}
                    cellValues={[
                        outputData[OutputKeys.LandCosts]?.title,
                        outputData[OutputKeys.LandCosts]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.SoftCosts}
                    cellValues={[
                        outputData[OutputKeys.SoftCosts]?.title,
                        outputData[OutputKeys.SoftCosts]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.HardCosts}
                    cellValues={[
                        outputData[OutputKeys.HardCosts]?.title,
                        outputData[OutputKeys.HardCosts]?.value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalCosts]?.title,
                        outputData[OutputKeys.TotalCosts]?.value
                    ]}
                    description={outputData[OutputKeys.TotalCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
                <DynamicRow
                    id={OutputKeys.TotalProfit}
                    cellValues={[
                        outputData[OutputKeys.TotalProfit]?.title,
                        outputData[OutputKeys.TotalProfit]?.value
                    ]}
                    description={outputData[OutputKeys.TotalProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                />
            </div>


            <PopupBox
                data={popupValues[1]}
                titles={popupValues[0]}
                dataKeys={popupValues[2]}
                setActiveCards={setActiveCards}

            />


            <ShareButton params={inputs} />

        </>
    );
};

export default IndustrialDevelopmentCalculator;
