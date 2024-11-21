import { convertToPercent, popupBoxValues, removeCommas, roundAndLocalString, setInLocalStorage } from '../utils/utils';
import DynamicRow from '../components/RowTypes/DynamicRow';

import './LandCalculator.scss';
import residentialDevelopmentCalculations from '../utils/residentialDevelopmentCalculations';
import { DEFAULT_VALUES, infrastructurePercentage, OutputKeys } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import { usePersistedState2 } from '../hooks/usePersistedState';
import PopupBox from '../components/PopupBox';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import { useState } from 'react';


interface ResidentialDevelopmentCalculationProps {

    isMobile: boolean;
    page: EPageNames;


}


const ResidentialDevelopmentCalculator: React.FC<ResidentialDevelopmentCalculationProps> = ({
    isMobile,
    page

}) => {
    const queryParams = new URLSearchParams(window.location.search)


    const [grossAcres, setGrossAcres] = usePersistedState2(page, EAllStates.grossAcres, DEFAULT_VALUES[page].grossAcres, queryParams);
    const [costToDevelopPerLot, setCostToDevelopPerLot] = usePersistedState2(page, EAllStates.costToDevelopPerLot, DEFAULT_VALUES[page].costToDevelopPerLot, queryParams);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState2(page, EAllStates.hardCostPerSqFt, DEFAULT_VALUES[page].hardCostPerSqFt, queryParams);
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = usePersistedState2(page, EAllStates.homeBuilderProfitPercentage, DEFAULT_VALUES[page].homeBuilderProfitPercentage, queryParams);
    const [housePricePerSqFt, setHousePricePerSqFt] = usePersistedState2(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].housePricePerSqFt, queryParams);
    const [multifamilyPricePerUnit, setMultifamilyPricePerUnit] = usePersistedState2(page, EAllStates.multifamilyPricePerUnit, DEFAULT_VALUES[page].multifamilyPricePerUnit, queryParams);
    const [houseSize, setHouseSize] = usePersistedState2(page, EAllStates.houseSize, DEFAULT_VALUES[page].houseSize, queryParams);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState2(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams);
    const [miscCosts, setMiscCosts] = usePersistedState2(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState2(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams);
    const [permits, setPermits] = usePersistedState2(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);
    const [sqFtPerLot, setSqFtPerLot] = usePersistedState2(page, EAllStates.sqFtPerLot, DEFAULT_VALUES[page].sqFtPerLot, queryParams);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState2(page, EAllStates.unbuildableAcres, DEFAULT_VALUES[page].unbuildableAcres, queryParams);
    const [unitsPerAcre, setUnitsPerAcre] = usePersistedState2(page, EAllStates.unitsPerAcre, DEFAULT_VALUES[page].unitsPerAcre, queryParams);

    const [activeCards, setActiveCards] = useState<Set<OutputKeys>>(new Set([OutputKeys.OfferToLandOwner]));

    const inputs = {
        grossAcres,
        unbuildableAcres,
        sqFtPerLot,
        unitsPerAcre,
        houseSize,
        housePricePerSqFt,
        multifamilyPricePerUnit,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        costToDevelopPerLot,
        ownedLandCost
    };

    const {
        houseSalePrice,
        homeBuilderProfit,
        totalHardCostsPerUnit,
        reAgentCommission,
        finishedLotValue,
        landPercentage,
        netBuildableAcres,
        totalBuildableSqFt,
        totalLotYield,
        landDeveloperProfitPerLot,
        landDeveloperProfit,
        perLotOfferToLandOwner,
        totalOfferToLandOwner,
        totalHardCosts,
        totalSoftCosts,
        totalCosts,
        totalProfits
    } = residentialDevelopmentCalculations(inputs)


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
        [OutputKeys.AdjustedInfrastructure]: {
            title: "Adjusted for Infrastructure (%)",
            value: `${infrastructurePercentage.toLocaleString()}%`,
            description: "Every lot requires infrastructure like streets, which reduces the buildable area.",
        },
        [OutputKeys.TotalBuildableSqFt]: {
            title: "Total Buildable Sq Ft",
            value: Math.round(totalBuildableSqFt).toLocaleString(),
            description: "The total buildable square feet after accounting for infrastructure adjustments.",
        },
        [OutputKeys.TotalLotYield]: {
            title: "Total Lot Yield",
            value: totalLotYield.toLocaleString(),
            description: "The total number of buildable lots for houses.",
        },
        [OutputKeys.HouseSalePrice]: {
            title: "House Sale Price",
            value: houseSalePrice.toLocaleString(),
            description: "The total sale price of the house based on the size and price per square foot.",
        },
        [OutputKeys.HardCostPerSqFt]: {
            title: "Hard Cost per Sq Ft for House Build ($)",
            value: (removeCommas(hardCostPerSqFt) * removeCommas(houseSize)).toLocaleString(),
            description: "The hard costs for building the house per square foot.",
        },
        [OutputKeys.HomeBuilderProfit]: {
            title: "Home Builder Profit per unit ($)",
            value: homeBuilderProfit.toLocaleString(),
            description: "The builder's profit based on a percentage of the hard costs.",
        },
        [OutputKeys.TotalHardCostsPerUnit]: {
            title: "Total Hard Costs per unit",
            value: totalHardCostsPerUnit.toLocaleString(),
            description: "The total hard costs, including construction costs, permits, and miscellaneous costs.",
        },
        [OutputKeys.REAgentCommissionPerUnit]: {
            title: "RE Agent Commission per unit",
            value: Math.round(reAgentCommission).toLocaleString(),
            description: "The real estate agent commission, calculated as a percentage of the house sale price.",
        },
        [OutputKeys.LandPercentageOfTotalValue]: {
            title: "Land Percentage of Total Value",
            value: convertToPercent(landPercentage),
            description: "The percentage of the total house value attributed to the finished lot.",
        },
        [OutputKeys.FinishedLotValue]: {
            title: "Finished Lot Value",
            value: Math.round(finishedLotValue).toLocaleString(),
            description: "The value of the finished lot without the house.",
        },
        [OutputKeys.LandDeveloperProfitPerLot]: {
            title: "Land Developer Profit Per Lot ($)",
            value: landDeveloperProfitPerLot.toLocaleString(),
            description: "Percentage profit made by the developer per lot.",
        },
        [OutputKeys.LandDeveloperProfit]: {
            title: "Land Developer's Profit",
            value: landDeveloperProfit.toLocaleString(),
            description: "Total profit made by the land developer from the entire project.",
        },
        [OutputKeys.ValuePerLotToLandOwner]: {
            title: "Value Per Lot to Land Owner/Seller",
            value: perLotOfferToLandOwner.toLocaleString(),
            description: "The value of each lot after development, as perceived by the landowner or seller.",
        },
        [OutputKeys.OfferToLandOwner]: {
            title: "Offer to Land Owner/Seller",
            value: Math.round(totalOfferToLandOwner).toLocaleString(),
            description: "Total offer from the buyer to the land owner or seller.",
        },
        [OutputKeys.LandCosts]: {
            title: "Land Costs",
            value: roundAndLocalString(totalOfferToLandOwner),
            description: "The total cost for acquiring the land for the project.",
        },
        [OutputKeys.SoftCosts]: {
            title: "Soft Costs",
            value: roundAndLocalString(totalSoftCosts),
            description: "Total soft costs for the project, including fees for permits, engineering, and other services.",
        },
        [OutputKeys.HardCosts]: {
            title: "Hard Costs",
            value: roundAndLocalString(totalHardCosts),
            description: "The hard costs for the entire project.",
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
        [OutputKeys.FinancialAssumptions]: {
            title: "Financial Assumptions",
            value: null,
            description: null,
        },
        [OutputKeys.RawLandCalculations]: {
            title: "Raw Land Calculations",
            value: null,
            description: null,
        },
        [OutputKeys.ProjectOverview]: {
            title: "Project Overview",
            value: null,
            description: null,
        },
    };

    const popupValues = popupBoxValues(activeCards, outputData)

    return (
        <>


            <div className="group-section">
                <div className="input-fields-container" >

                    <InputRow
                        cellValues={["Gross Acres", grossAcres]}
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.grossAcres}`); setGrossAcres(value) }}
                        description="The total area of the land in acres before any deductions for unbuildable areas."
                        isMobile={isMobile}
                    />
                    <InputRow
                        cellValues={["Adjusted Unbuildable Acres", unbuildableAcres]}
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.unbuildableAcres}`); setUnbuildableAcres(value) }}
                        description="The total area in acres that cannot be built upon due to environmental or geographical features."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.sqFtPerLot}`); setSqFtPerLot(value) }}
                        cellValues={["Zoning - Sq Ft per Lot (SQFT)", sqFtPerLot]}
                        description="The jurisdiction gives a zoning requirement or desired lot size (e.g., R-5 = 5,000 sq ft per lot)."
                        isMobile={isMobile}
                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.unitsPerAcre}`); setUnitsPerAcre(value) }}
                        cellValues={["Zoning - Maximum units per acre", removeCommas(unitsPerAcre) === 0 ? "" : unitsPerAcre]}
                        description="The jurisdiction gives a zoning requirement for the maximum number of units per acre."
                        isMobile={isMobile}
                    />



                    {/* House Price Per Sq Ft */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.housePricePerSqFt}`); setHousePricePerSqFt(value) }}
                        cellValues={["House Price - per Sq Ft", housePricePerSqFt]}
                        description="The average price per square foot for houses in this area, determined by local research."
                        isMobile={isMobile}
                    />
                    {/* House Price Per Sq Ft */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.multifamilyPricePerUnit}`); setMultifamilyPricePerUnit(value) }}
                        cellValues={["House Price - per Home", removeCommas(multifamilyPricePerUnit) === 0 ? '' : multifamilyPricePerUnit]}
                        description="The price each home will sell, determined by local research."
                        isMobile={isMobile}
                    />

                    {/* House Size */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.houseSize}`); setHouseSize(value) }}
                        cellValues={["House Size - Sq Ft", houseSize]}
                        description="The average size of houses in this area, determined by local research."
                        isMobile={isMobile}
                    />

                    {/* Hard Cost Per Sq Ft */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.hardCostPerSqFt}`); setHardCostPerSqFt(value) }}
                        cellValues={["Hard Cost per Sq Ft for House Build ($)", hardCostPerSqFt, (removeCommas(hardCostPerSqFt) * removeCommas(houseSize)).toLocaleString()]}
                        description="The hard costs for building the house per square foot."
                        isMobile={isMobile}
                    />



                    {/* Permits */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.permits}`); setPermits(value) }}
                        cellValues={["Permits per unit ($)", permits]}
                        description="The total cost of permits required for the house build."
                        isMobile={isMobile}
                    />


                    {/* Misc Costs */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.miscCosts}`); setMiscCosts(value) }}
                        cellValues={["Misc Costs per unit ($)", miscCosts]}
                        description="Miscellaneous costs involved in the house build."
                        isMobile={isMobile}
                    />

                    {/* Home Builder Profit */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.homeBuilderProfitPercentage}`); setHomeBuilderProfitPercentage(value) }}
                        cellValues={["Home Builder Profit per unit (%)", homeBuilderProfitPercentage, homeBuilderProfit.toLocaleString()]}
                        description="The builder's profit based on a percentage of the hard costs."
                        isMobile={isMobile}
                        isPercent={true}
                    />
                    {/* Real Estate Agent Commission */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
                        cellValues={["RE Agent Commission per unit (%)", realEstateCommissionPercentage, Math.round(reAgentCommission).toLocaleString()]}
                        description="The real estate agent commission, calculated as a percentage of the house sale price."
                        isMobile={isMobile}
                        isPercent={true}
                    />


                    {/* Land Developer Profit Per Lot */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.landDeveloperProfitPercentage}`); setLandDeveloperProfitPercentage(value) }}
                        cellValues={["Land Developer Profit Per Lot (%)", landDeveloperProfitPercentage, landDeveloperProfitPerLot.toLocaleString()]}
                        description="Percentage profit made by the developer per lot."
                        isMobile={isMobile}
                        isPercent={true}
                    />


                    {/* Cost to Develop Land Per Lot */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.costToDevelopPerLot}`); setCostToDevelopPerLot(value) }}
                        cellValues={["Cost to Develop the Land Per Lot ($)", costToDevelopPerLot]}
                        description="Costs for engineering, clearing, demolition, utilities, and SDC (System Development Charges), etc."
                        isMobile={isMobile}
                    />


                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.ownedLandCost}`); setOwnedLandCost(value) }}
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
                    id={OutputKeys.AdjustedInfrastructure}
                    cellValues={[
                        outputData[OutputKeys.AdjustedInfrastructure]?.title,
                        outputData[OutputKeys.AdjustedInfrastructure]?.value,
                    ]}
                    description={outputData[OutputKeys.AdjustedInfrastructure]?.description}
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
                    id={OutputKeys.TotalLotYield}
                    cellValues={[
                        outputData[OutputKeys.TotalLotYield]?.title,
                        outputData[OutputKeys.TotalLotYield]?.value,
                    ]}
                    description={outputData[OutputKeys.TotalLotYield]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.FinancialAssumptions}
                    cellValues={[outputData[OutputKeys.FinancialAssumptions]?.title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HouseSalePrice}
                    cellValues={[
                        outputData[OutputKeys.HouseSalePrice]?.title,
                        outputData[OutputKeys.HouseSalePrice]?.value,
                    ]}
                    description={outputData[OutputKeys.HouseSalePrice]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HardCostPerSqFt}
                    cellValues={[
                        outputData[OutputKeys.HardCostPerSqFt]?.title,
                        outputData[OutputKeys.HardCostPerSqFt]?.value,
                    ]}
                    description={outputData[OutputKeys.HardCostPerSqFt]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HomeBuilderProfit}
                    cellValues={[
                        outputData[OutputKeys.HomeBuilderProfit]?.title,
                        outputData[OutputKeys.HomeBuilderProfit]?.value,
                    ]}
                    description={outputData[OutputKeys.HomeBuilderProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalHardCostsPerUnit}
                    cellValues={[
                        outputData[OutputKeys.TotalHardCostsPerUnit]?.title,
                        outputData[OutputKeys.TotalHardCostsPerUnit]?.value,
                    ]}
                    description={outputData[OutputKeys.TotalHardCostsPerUnit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.REAgentCommissionPerUnit}
                    cellValues={[
                        outputData[OutputKeys.REAgentCommissionPerUnit]?.title,
                        outputData[OutputKeys.REAgentCommissionPerUnit]?.value,
                    ]}
                    description={outputData[OutputKeys.REAgentCommissionPerUnit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
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
                    ]}
                    description={outputData[OutputKeys.FinishedLotValue]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.RawLandCalculations}
                    cellValues={[outputData[OutputKeys.RawLandCalculations]?.title]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandDeveloperProfitPerLot}
                    cellValues={[
                        outputData[OutputKeys.LandDeveloperProfitPerLot]?.title,
                        outputData[OutputKeys.LandDeveloperProfitPerLot]?.value,
                    ]}
                    description={outputData[OutputKeys.LandDeveloperProfitPerLot]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandDeveloperProfit}
                    cellValues={[
                        outputData[OutputKeys.LandDeveloperProfit]?.title,
                        outputData[OutputKeys.LandDeveloperProfit]?.value,
                    ]}
                    description={outputData[OutputKeys.LandDeveloperProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.ValuePerLotToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.ValuePerLotToLandOwner]?.title,
                        outputData[OutputKeys.ValuePerLotToLandOwner]?.value,
                    ]}
                    description={outputData[OutputKeys.ValuePerLotToLandOwner]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.OfferToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.OfferToLandOwner]?.title,
                        outputData[OutputKeys.OfferToLandOwner]?.value,
                    ]}
                    description={outputData[OutputKeys.OfferToLandOwner]?.description}
                    isMobile={isMobile}
                    numberOfCells={2}
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
                    id={OutputKeys.HardCosts}
                    cellValues={[
                        outputData[OutputKeys.HardCosts]?.title,
                        outputData[OutputKeys.HardCosts]?.value,
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




            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Basic Land Info, Land Limitations, Restrictions, and Requirements"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={['Net Buildable Acres', netBuildableAcres.toLocaleString()]}
                    description=' The area of land available for building after subtracting unbuildable acres from gross acres.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Adjusted for Infrastructure (%)", infrastructurePercentage.toLocaleString() + "%"]}
                    description="Every lot requires infrastructure like streets, which reduces the buildable area."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={['Total Buildable Sq Ft', Math.round(totalBuildableSqFt).toLocaleString()]}
                    description='The total buildable square feet after accounting for infrastructure adjustments.'
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={['Total Lot Yield', totalLotYield.toLocaleString()]}
                    description='The total number of buildable lots for houses.'
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Financial Assumptions"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />




                {/* House Sale Price */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["House Sale Price", houseSalePrice.toLocaleString()]}
                    description="The total sale price of the house based on the size and price per square foot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Hard Cost Per Sq Ft */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Hard Cost per Sq Ft for House Build ($)", (removeCommas(hardCostPerSqFt) * removeCommas(houseSize)).toLocaleString()]}
                    description="The hard costs for building the house per square foot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Home Builder Profit */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Home Builder Profit per unit ($)", homeBuilderProfit.toLocaleString()]}
                    description="The builder's profit based on a percentage of the hard costs."
                    isMobile={isMobile}
                    numberOfCells={2}
                />



                {/* Total Hard Costs */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Total Hard Costs per unit", totalHardCostsPerUnit.toLocaleString()]}
                    description="The total hard costs, including construction costs, permits, and miscellaneous costs."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Real Estate Agent Commission */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["RE Agent Commission per unit", Math.round(reAgentCommission).toLocaleString()]}
                    description="The real estate agent commission, calculated as a percentage of the house sale price."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Land Percentage */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Land Percentage of Total Value", convertToPercent(landPercentage)]}
                    description="The percentage of the total house value attributed to the finished lot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Finished Lot Value */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Finished Lot Value", Math.round(finishedLotValue).toLocaleString()]}
                    description="The value of the finished lot without the house."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Raw Land Calculations"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />

                {/* Land Developer Profit Per Lot */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Land Developer Profit Per Lot ($)", landDeveloperProfitPerLot.toLocaleString()]}
                    description="Percentage profit made by the developer per lot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Land Developer's Total Profit */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Land Developer's Profit", landDeveloperProfit.toLocaleString()]}
                    description="Total profit made by the land developer from the entire project."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Value Per Lot to Land Owner/Seller */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Value Per Lot to Land Owner/Seller", perLotOfferToLandOwner.toLocaleString()]}
                    description="The value of each lot after development, as perceived by the landowner or seller."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />



                {/* Buyer Offer to Land Owner/Seller */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Offer to Land Owner/Seller", Math.round(totalOfferToLandOwner).toLocaleString()]}
                    description="Total offer from the buyer to the land owner or seller."
                    isMobile={isMobile}
                    numberOfCells={2}
                    output={true}
                />
            </div>


            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Project Overview"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Land Costs", roundAndLocalString(totalOfferToLandOwner)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Soft Costs", roundAndLocalString(totalSoftCosts)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Hard Costs", roundAndLocalString(totalHardCosts)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                {/* Buyer Offer to Land Owner/Seller */}

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Total Costs", roundAndLocalString(totalCosts)]}
                    description="Total Costs to Build this Project"
                    isMobile={isMobile}
                    numberOfCells={2}
                />
                {/* Buyer Offer to Land Owner/Seller */}

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    cellValues={["Total Profit", roundAndLocalString(totalProfits)]}
                    isMobile={isMobile}
                    description="Total profit if sold at the projected sell price"
                    numberOfCells={2}
                    output={true}
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

export default ResidentialDevelopmentCalculator;
