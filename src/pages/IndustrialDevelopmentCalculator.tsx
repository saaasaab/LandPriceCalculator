import { convertToPercent, removeCommas, roundAndLocalString, setInLocalStorage } from '../utils/utils';
import DynamicRow from '../components/RowTypes/DynamicRow';
import industrialDevelopmentCalculations from '../utils/industrialDevelopmentCalculations';
import { DEFAULT_VALUES, SQ_FT_PER_ACRE } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import { usePersistedState2 } from '../hooks/usePersistedState';

import PopupBox from '../components/PopupBox';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import { useState } from 'react';


export enum OutputKeysForIndustrialDevelopmentCalculator {
    BasicLandInfo = "basicLandInfo",
    NetBuildableAcres = "netBuildableAcres",
    LotSize = "lotSize",
    CalculatedDrivewayArea = "calculatedDrivewayArea",
    CalculatedParkingArea = "calculatedParkingArea",
    CalculatedSidewalkArea = "calculatedSidewalkArea",
    CalculatedImperviousSurfaceRatio = "calculatedImperviousSurfaceRatio",
    TotalHandicappedParkingSpots = "totalHandicappedParkingSpots",
    TotalParkingSpots = "totalParkingSpots",
    BuildingFootprintArea = "buildingFootprintArea",
    BuildingFootprintDimensions = "buildingFootprintDimensions",
    TotalLeasableSpace = "totalLeasableSpace",
    TotalBuildingSqft = "totalBuildingSqft",
    FinancialAssumptions = "financialAssumptions",
    AnnualRentalIncome = "annualRentalIncome",
    BuildingSalePrice = "buildingSalePrice",
    PropertyNOI = "propertyNOI",
    PropertyCapRate = "propertyCapRate",
    HardCostForBuild = "hardCostForBuild",
    GeneralContractorProfit = "generalContractorProfit",
    TotalHardCosts = "totalHardCosts",
    REAgentCommission = "reAgentCommission",
    LandPercentageOfTotalValue = "landPercentageOfTotalValue",
    FinishedLotValue = "finishedLotValue",
    RawLandCalculations = "rawLandCalculations",
    LandDeveloperProfit = "landDeveloperProfit",
    CostToDevelopLand = "costToDevelopLand",
    SDCFees = "sdcFees",
    LandValueIfAlreadyOwned = "landValueIfAlreadyOwned",
    OfferToLandOwner = "offerToLandOwner",
    ProjectOverview = "projectOverview",
    LandCosts = "landCosts",
    SoftCosts = "softCosts",
    HardCosts = "hardCosts",
    TotalCosts = "totalCosts",
    TotalProfit = "totalProfit",
}


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




    const [activeCards, setActiveCards] = useState<Set<OutputKeysForIndustrialDevelopmentCalculator>>(new Set([OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner]));
    // const activeCards: Set<OutputKeysForIndustrialDevelopmentCalculator> = new Set([OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner]);


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
    } = industrialDevelopmentCalculations(inputs)



    const outputData: Record<OutputKeysForIndustrialDevelopmentCalculator, { title: string; value: any; description: string | null }> = {
        [OutputKeysForIndustrialDevelopmentCalculator.BasicLandInfo]: {
            title: "Basic Land Info, Land Limitations, Restrictions, and Requirements",
            value: null,
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.NetBuildableAcres]: {
            title: "Net Buildable Acres",
            value: netBuildableAcres,
            description: "The area of land available for building after subtracting unbuildable acres from gross acres.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.LotSize]: {
            title: "Lot Size",
            value: roundAndLocalString(SQ_FT_PER_ACRE * removeCommas(grossAcres)),
            description: "Total size of the lot in sqft",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.CalculatedDrivewayArea]: {
            title: "Calculated Driveway Area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.drivewayArea),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.CalculatedParkingArea]: {
            title: "Calculated Parking Area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.parkingArea),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.CalculatedSidewalkArea]: {
            title: "Calculated Sidewalk Area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.sidewalkArea),
            description: "Estimated at about 20% of the building footprint",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.CalculatedImperviousSurfaceRatio]: {
            title: "Calculated Impervious Surface Ratio",
            value: convertToPercent(resultCalculateBuildingSqftIndustrial.imperviousSurfaceRatio, 1),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalHandicappedParkingSpots]: {
            title: "Total handicapped parking spots",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.handicappedParking),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalParkingSpots]: {
            title: "Total parking spots",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.parkingSpotsRequired),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintArea]: {
            title: "Building footprint area",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.buildingFootprint.area),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintDimensions]: {
            title: "Building footprint dimensions",
            value: `${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.length}' x ${resultCalculateBuildingSqftIndustrial.buildingFootprint.dimensions.width}'`,
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalLeasableSpace]: {
            title: "Total leasable space",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.leaseableBuildingSpace),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalBuildingSqft]: {
            title: "Total Building sqft",
            value: roundAndLocalString(resultCalculateBuildingSqftIndustrial.totalBuildingSqft),
            description: "The total square feet building space",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.FinancialAssumptions]: {
            title: "Financial Assumptions",
            value: null,
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.AnnualRentalIncome]: {
            title: "Annual Rental Income",
            value: roundAndLocalString(annualLeasingIncome),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.BuildingSalePrice]: {
            title: "Building Sale Price",
            value: roundAndLocalString(buildingSalePrice),
            description: "The total sale price of the building based on the size and price per square foot.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.PropertyNOI]: {
            title: "Property NOI",
            value: roundAndLocalString(propertyNOI),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.PropertyCapRate]: {
            title: "Property Cap Rate",
            value: convertToPercent(propertyCapRate),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.HardCostForBuild]: {
            title: "Hard Cost for Build ($)",
            value: roundAndLocalString(removeCommas(hardCostPerSqFt) * resultCalculateBuildingSqftIndustrial.totalBuildingSqft),
            description: "The hard costs for building the structure per square foot.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.GeneralContractorProfit]: {
            title: "General Contractor Profit ($)",
            value: roundAndLocalString(homeBuilderProfit),
            description: "The builder's profit based on a percentage of the hard costs.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalHardCosts]: {
            title: "Total Hard Costs",
            value: roundAndLocalString(totalHardCosts),
            description: "The total hard costs, including construction costs, permits, and miscellaneous costs.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.REAgentCommission]: {
            title: "RE Agent Commission ($)",
            value: roundAndLocalString(reAgentCommission),
            description: "The real estate agent commission, calculated as a percentage of the building sale price.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.LandPercentageOfTotalValue]: {
            title: "Land Percentage of Total Value",
            value: convertToPercent(landPercentage, 1),
            description: "The percentage of the total building value attributed to the land.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.FinishedLotValue]: {
            title: "Finished Lot Value",
            value: roundAndLocalString(finishedLotValue),
            description: "The value of the finished lot without the structure.",
        },

        [OutputKeysForIndustrialDevelopmentCalculator.RawLandCalculations]: {
            title: "Raw Land Calculations",
            value: null,
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.LandDeveloperProfit]: {
            title: "Land Developer Profit ($)",
            value: roundAndLocalString(landDeveloperProfit),
            description: "Percentage profit made by the developer per lot.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.CostToDevelopLand]: {
            title: "Costs to Develop the land ($)",
            value: costToDevelop,
            description: "Costs for engineering, architecture, demolition, clearing, street improvements, utilities, etc.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.SDCFees]: {
            title: "SDC Fees ($)",
            value: SDCFees,
            description: "Fees to the city to connect to the city. Normally this is required for all new developments.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.LandValueIfAlreadyOwned]: {
            title: "Land value if already own ($)",
            value: removeCommas(ownedLandCost) === 0 ? "" : ownedLandCost,
            description: "If you own the property already, enter in the price of the property here.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner]: {
            title: "Offer to Land Owner/Seller",
            value: roundAndLocalString(totalOfferToLandOwner),
            description: "Total offer from the buyer to the land owner or seller.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.ProjectOverview]: {
            title: "Project Overview",
            value: null,
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.LandCosts]: {
            title: "Land Costs",
            value: roundAndLocalString(totalOfferToLandOwner),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.SoftCosts]: {
            title: "Soft Costs",
            value: roundAndLocalString(removeCommas(costToDevelop) + landDeveloperProfit + removeCommas(SDCFees)),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.HardCosts]: {
            title: "Hard Costs",
            value: roundAndLocalString(totalHardCosts),
            description: null,
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalCosts]: {
            title: "Total Costs",
            value: roundAndLocalString(totalCosts),
            description: "Total Costs to Build this Project.",
        },
        [OutputKeysForIndustrialDevelopmentCalculator.TotalProfit]: {
            title: "Total Profit",
            value: roundAndLocalString(buildingSalePrice - totalCosts),
            description: "Total profit if sold at the projected sell price.",
        },

    };


    const popupBoxvalues = () => {

        const titles: string[] = [];
        const values: any[] = [];

        activeCards.forEach((key) => {
            const item = outputData[key];
            if (item) {
                titles.push(item.title);
                values.push(item.value);
            }
        });

        return [titles,values]

    }

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

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.INDUSTRIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
                        cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage]}
                        description="The real estate agent commission, calculated as a percentage of the building sale price."
                        isMobile={isMobile}
                        isPercent={true}
                    />

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
                    id={OutputKeysForIndustrialDevelopmentCalculator.BasicLandInfo}
                    cellValues={[outputData[OutputKeysForIndustrialDevelopmentCalculator.BasicLandInfo].title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.NetBuildableAcres}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.NetBuildableAcres].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.NetBuildableAcres].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.NetBuildableAcres].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.LotSize}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LotSize].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LotSize].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.LotSize].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.CalculatedDrivewayArea}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedDrivewayArea].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedDrivewayArea].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.CalculatedParkingArea}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedParkingArea].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedParkingArea].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.CalculatedSidewalkArea}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedSidewalkArea].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedSidewalkArea].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedSidewalkArea].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.CalculatedImperviousSurfaceRatio}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedImperviousSurfaceRatio].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CalculatedImperviousSurfaceRatio].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalHandicappedParkingSpots}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalHandicappedParkingSpots].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalHandicappedParkingSpots].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalParkingSpots}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalParkingSpots].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalParkingSpots].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintArea}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintArea].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintArea].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintDimensions}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintDimensions].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingFootprintDimensions].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalLeasableSpace}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalLeasableSpace].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalLeasableSpace].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalBuildingSqft}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalBuildingSqft].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalBuildingSqft].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalBuildingSqft].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={[outputData[OutputKeysForIndustrialDevelopmentCalculator.FinancialAssumptions].title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.AnnualRentalIncome}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.AnnualRentalIncome].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.AnnualRentalIncome].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.BuildingSalePrice}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingSalePrice].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingSalePrice].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.BuildingSalePrice].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.PropertyNOI}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.PropertyNOI].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.PropertyNOI].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.PropertyCapRate}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.PropertyCapRate].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.PropertyCapRate].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.HardCostForBuild}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.HardCostForBuild].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.HardCostForBuild].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.HardCostForBuild].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.GeneralContractorProfit}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.GeneralContractorProfit].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.GeneralContractorProfit].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.GeneralContractorProfit].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalHardCosts}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalHardCosts].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalHardCosts].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalHardCosts].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.REAgentCommission}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.REAgentCommission].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.REAgentCommission].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.REAgentCommission].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.LandPercentageOfTotalValue}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandPercentageOfTotalValue].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandPercentageOfTotalValue].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.LandPercentageOfTotalValue].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.FinishedLotValue}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.FinishedLotValue].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.FinishedLotValue].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.FinishedLotValue].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={[outputData[OutputKeysForIndustrialDevelopmentCalculator.RawLandCalculations].title]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    header={true}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.LandDeveloperProfit}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandDeveloperProfit].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandDeveloperProfit].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.LandDeveloperProfit].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.CostToDevelopLand}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CostToDevelopLand].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.CostToDevelopLand].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.CostToDevelopLand].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.SDCFees}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.SDCFees].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.SDCFees].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.SDCFees].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.LandValueIfAlreadyOwned}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandValueIfAlreadyOwned].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandValueIfAlreadyOwned].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.LandValueIfAlreadyOwned].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.OfferToLandOwner].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    cellValues={[outputData[OutputKeysForIndustrialDevelopmentCalculator.ProjectOverview].title]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    header={true}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.LandCosts}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandCosts].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.LandCosts].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.SoftCosts}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.SoftCosts].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.SoftCosts].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.HardCosts}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.HardCosts].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.HardCosts].value
                    ]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalCosts}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalCosts].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalCosts].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalCosts].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    setActiveCards={setActiveCards}
                />
                <DynamicRow
                    id={OutputKeysForIndustrialDevelopmentCalculator.TotalProfit}
                    cellValues={[
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalProfit].title,
                        outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalProfit].value
                    ]}
                    description={outputData[OutputKeysForIndustrialDevelopmentCalculator.TotalProfit].description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                    setActiveCards={setActiveCards}
                />
            </div>


            {/* [

// convertToPercent(propertyCapRate),
"$" + roundAndLocalString(totalOfferToLandOwner),


]}
titles={[
// "Cap rate for the property",
"How much you should pay for the land"
]}
 */}

            <PopupBox
                data={popupBoxvalues()[1]}
                titles={popupBoxvalues()[0]}
                  
            />


            <ShareButton params={inputs} />

        </>
    );
};

export default IndustrialDevelopmentCalculator;
