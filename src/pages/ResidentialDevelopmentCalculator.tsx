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
    
    const [SDCFees,setSDCFees]= usePersistedState2(page, EAllStates.SDCFees, DEFAULT_VALUES[page].SDCFees, queryParams);
    const [hardCostPerSqFt, setHardCostPerSqFt] = usePersistedState2(page, EAllStates.hardCostPerSqFt, DEFAULT_VALUES[page].hardCostPerSqFt, queryParams);
    const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = usePersistedState2(page, EAllStates.homeBuilderProfitPercentage, DEFAULT_VALUES[page].homeBuilderProfitPercentage, queryParams);
    const [housePricePerSqFt, setHousePricePerSqFt] = usePersistedState2(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].housePricePerSqFt, queryParams);
    const [residentialPricePerHome, setresidentialPricePerHome] = usePersistedState2(page, EAllStates.residentialPricePerHome, DEFAULT_VALUES[page].residentialPricePerHome, queryParams);
    const [houseSize, setHouseSize] = usePersistedState2(page, EAllStates.houseSize, DEFAULT_VALUES[page].houseSize, queryParams);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState2(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams);
    const [miscCosts, setMiscCosts] = usePersistedState2(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState2(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams);
    const [permits, setPermits] = usePersistedState2(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams);
    // const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);
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
        residentialPricePerHome,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        // realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        costToDevelopPerLot,
        ownedLandCost,
        SDCFees
    };

    const {
        houseSalePrice,
        homeBuilderProfit,
        totalHardCostsPerUnit,
        // reAgentCommission,
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
        totalProfits,
        totalCostToDevelopPerLot,
     
        // totalClosingCosts
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
            value2: (houseSalePrice * totalLotYield).toLocaleString(),
            description: "The total sale price of the house based on the size and price per square foot.",
        },
        [OutputKeys.HardCostPerSqFt]: {
            title: "Hard Cost to House Build ($)",
            value: (removeCommas(hardCostPerSqFt) * removeCommas(houseSize)).toLocaleString(),
            value2: (removeCommas(hardCostPerSqFt) * removeCommas(houseSize) * totalLotYield).toLocaleString(),
            description: "The hard costs for building the house per square foot.",
        },
        [OutputKeys.HomeBuilderProfit]: {
            title: "Home Builder Profit ($)",
            value: homeBuilderProfit.toLocaleString(),
            value2: (homeBuilderProfit * totalLotYield).toLocaleString(),
            description: "The builder's profit based on a percentage of the hard costs.",
        },
        [OutputKeys.TotalHardCostsPerUnit]: {
            title: "Total Hard Costs",
            value: totalHardCostsPerUnit.toLocaleString(),
            value2: (totalHardCostsPerUnit * totalLotYield).toLocaleString(),
            description: "The total hard costs, including construction costs.",
        },

        [OutputKeys.TotalPermitCosts]: {
            title: "Total Permit Costs",
            value: permits.toLocaleString(),
            value2: (removeCommas(permits) * totalLotYield).toLocaleString(),
            description: "The total permit costs.",
        },

        [OutputKeys.TotalMiscCosts]: {
            title: "Total Miscellaneous Costs",
            value: miscCosts,
            value2: (removeCommas(miscCosts) * totalLotYield).toLocaleString(),
            description: "The total miscellaneous costs.",
        },

        // [OutputKeys.REAgentCommissionPerUnit]: {
        //     title: "RE Agent Commission",
        //     value: Math.round(reAgentCommission).toLocaleString(),
        //     value2: Math.round(reAgentCommission * totalLotYield).toLocaleString(),

        //     description: "The real estate agent commission, calculated as a percentage of the house sale price.",
        // },
        [OutputKeys.LandPercentageOfTotalValue]: {
            title: "Land Percentage of Total Value",
            value: convertToPercent(landPercentage),
            description: "The percentage of the total house value attributed to the finished lot.",
        },
        [OutputKeys.FinishedLotValue]: {
            title: "Finished Lot Value",
            value: Math.round(finishedLotValue).toLocaleString(),
            value2: Math.round(finishedLotValue * totalLotYield).toLocaleString(),
            description: "The value of the finished lot without the house.",
        },
        [OutputKeys.LandDeveloperProfitPerLot]: {
            title: "Land Developer Profit ($)",
            value: landDeveloperProfitPerLot.toLocaleString(),
            value2: (landDeveloperProfitPerLot * totalLotYield).toLocaleString(),
            description: "Percentage profit made by the developer.",
        },
        [OutputKeys.LandDeveloperProfit]: {
            title: "Land Developer's Profit",
            value: landDeveloperProfit.toLocaleString(),
            value2: (landDeveloperProfit * totalLotYield).toLocaleString(),
            description: "Total profit made by the land developer from the entire project.",
        },
        [OutputKeys.TotalSDCCosts]: {
            title: "Total Land Entitlement Costs",
            value: totalCostToDevelopPerLot.toLocaleString(),
            value2: (totalCostToDevelopPerLot * totalLotYield).toLocaleString(),
            description: "The total SDC costs,  engineering/architectural fees, and infrastructure buildout costs",
        },


        [OutputKeys.OfferToLandOwner]: {
            title: "Max Offer Price to land owner",
            value: Math.round(perLotOfferToLandOwner).toLocaleString(),
            value2: Math.round(totalOfferToLandOwner).toLocaleString(),
            description: "Total offer from the buyer to the land owner or seller.",
        },
        [OutputKeys.LandCosts]: {
            title: "Land Costs",
            value: roundAndLocalString(totalOfferToLandOwner / totalLotYield),
            value2: roundAndLocalString(totalOfferToLandOwner),
            description: "The total cost for acquiring the land for the project.",
        },
        [OutputKeys.SoftCosts]: {
            title: "Soft Costs",
            value: roundAndLocalString(totalSoftCosts / totalLotYield),
            value2: roundAndLocalString(totalSoftCosts),
            description: "Total soft costs for the project, including fees for permits, engineering, and other services.",
        },
        [OutputKeys.HardCosts]: {
            title: "Hard Costs",
            value: roundAndLocalString(totalHardCosts / totalLotYield),
            value2: roundAndLocalString(totalHardCosts),
            description: "The hard costs for the entire project.",
        },
        // [OutputKeys.ClosingCosts]: {
        //     title: "Closing Costs",
        //     value: roundAndLocalString(totalClosingCosts / totalLotYield),
        //     value2: roundAndLocalString(totalClosingCosts),
        //     description: "Total Costs to Build this Project",
        // },
        [OutputKeys.TotalCosts]: {
            title: "Total Costs",
            value: roundAndLocalString(totalCosts / totalLotYield),
            value2: roundAndLocalString(totalCosts),
            description: "Total Costs to Build this Project",
        },
        [OutputKeys.TotalProfit]: {
            title: "Total Profit",
            value: roundAndLocalString(totalProfits / totalLotYield),
            value2: roundAndLocalString(totalProfits),
            description: "Total profit if sold at the projected sell price. At the max offer price, profits will be 0.",
        },
        [OutputKeys.FinancialAssumptions]: {
            title: "Financial Assumptions",
            value: "Per Home",
            value2: "Total",
            description: null,
        },
        [OutputKeys.RawLandCalculations]: {
            title: "Raw Land Calculations",
            value: "Per Lot",
            value2: "Total",
            description: null,
        },
        [OutputKeys.ProjectOverview]: {
            title: "Project Overview",
            value: "Per Home",
            value2: "Total",
            description: null,
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
                    // isGreyedOut={  removeCommas(unitsPerAcre) > 0}

                    />

                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.unitsPerAcre}`); setUnitsPerAcre(value) }}
                        cellValues={["Zoning - Maximum units per acre", removeCommas(unitsPerAcre) === 0 ? "" : unitsPerAcre]}
                        description="The jurisdiction gives a zoning requirement for the maximum number of units per acre."
                        isMobile={isMobile}
                    />

                    <div className="input-grouping">
                        Building Assumptions
                    </div>

                    {/* House Price Per Sq Ft */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.housePricePerSqFt}`); setHousePricePerSqFt(value) }}
                        cellValues={["House Price - per Sq Ft", housePricePerSqFt]}
                        description="The average price per square foot for houses in this area, determined by local research."
                        isMobile={isMobile}
                        isGreyedOut={removeCommas(residentialPricePerHome) > 0}
                    />
                    {/* House Price Per Sq Ft */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.residentialPricePerHome}`); setresidentialPricePerHome(value) }}
                        cellValues={["House Price - per Home", removeCommas(residentialPricePerHome) === 0 ? '' : residentialPricePerHome]}
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


                    <div className="input-grouping">
                        Construction Inputs
                    </div>
                    {/* Hard Cost Per Sq Ft */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.hardCostPerSqFt}`); setHardCostPerSqFt(value) }}
                        cellValues={["Hard Cost to Build House ($)", hardCostPerSqFt, (removeCommas(hardCostPerSqFt) * removeCommas(houseSize)).toLocaleString()]}
                        description="The hard costs for building the house based on square foot cost."
                        isMobile={isMobile}
                    />

                    {/* Permits */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.permits}`); setPermits(value) }}
                        cellValues={["Permits ($) per Home", permits]}
                        description="The total cost of permits required for the house build."
                        isMobile={isMobile}
                    />


                    {/* Misc Costs */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.miscCosts}`); setMiscCosts(value) }}
                        cellValues={["Misc Costs ($) per Home", miscCosts]}
                        description="Miscellaneous costs involved in the house build."
                        isMobile={isMobile}
                    />

                    {/* Home Builder Profit */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.homeBuilderProfitPercentage}`); setHomeBuilderProfitPercentage(value) }}
                        cellValues={["Home Builder Profit (%)", homeBuilderProfitPercentage, homeBuilderProfit.toLocaleString()]}
                        description="The builder's profit based on a percentage of the hard costs."
                        isMobile={isMobile}
                        isPercent={true}
                    />
                    {/* Real Estate Agent Commission
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
                        cellValues={["RE Agent Commission (%)", realEstateCommissionPercentage, Math.round(reAgentCommission).toLocaleString()]}
                        description="The real estate agent commission, calculated as a percentage of the house sale price."
                        isMobile={isMobile}
                        isPercent={true}
                    /> */}


                    <div className="input-grouping">
                        Land Entitlement Inputs
                    </div>

                    {/* Land Developer Profit */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.landDeveloperProfitPercentage}`); setLandDeveloperProfitPercentage(value) }}
                        cellValues={["Land Developer Profit (%)", landDeveloperProfitPercentage, landDeveloperProfitPerLot.toLocaleString()]}
                        description="Percentage profit made by the developer."
                        isMobile={isMobile}
                        isPercent={true}
                    />


                    {/* Cost to Develop Land */}
                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.costToDevelopPerLot}`); setCostToDevelopPerLot(value) }}
                        cellValues={["Cost to Develop the Land ($) per Home", costToDevelopPerLot]}
                        description="Costs for engineering, clearing, demolition, utilities, and infrastructure costs per home"
                        isMobile={isMobile}
                    />


                    <InputRow
                        setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.SDCFees}`); setSDCFees(value) }}
                        cellValues={["SDC (System Development Charges) ($) per Home", SDCFees]}
                        description="SDC (System Development Charges) are the charges a city requires to connect to their services."
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
                    output={true}
                />
            </div>

            <div className="table-container">
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.FinancialAssumptions}
                    cellValues={[
                        outputData[OutputKeys.FinancialAssumptions]?.title,
                        outputData[OutputKeys.FinancialAssumptions]?.value,
                        outputData[OutputKeys.FinancialAssumptions]?.value2]}
                    isMobile={isMobile}
                    numberOfCells={3}
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
                        outputData[OutputKeys.HouseSalePrice]?.value2,
                    ]}
                    description={outputData[OutputKeys.HouseSalePrice]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HardCostPerSqFt}
                    cellValues={[
                        outputData[OutputKeys.HardCostPerSqFt]?.title,
                        outputData[OutputKeys.HardCostPerSqFt]?.value,
                        outputData[OutputKeys.HardCostPerSqFt]?.value2,
                    ]}
                    description={outputData[OutputKeys.HardCostPerSqFt]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.HomeBuilderProfit}
                    cellValues={[
                        outputData[OutputKeys.HomeBuilderProfit]?.title,
                        outputData[OutputKeys.HomeBuilderProfit]?.value,
                        outputData[OutputKeys.HomeBuilderProfit]?.value2,
                    ]}
                    description={outputData[OutputKeys.HomeBuilderProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />


                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalPermitCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalPermitCosts]?.title,
                        outputData[OutputKeys.TotalPermitCosts]?.value,
                        outputData[OutputKeys.TotalPermitCosts]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalPermitCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalMiscCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalMiscCosts]?.title,
                        outputData[OutputKeys.TotalMiscCosts]?.value,
                        outputData[OutputKeys.TotalMiscCosts]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalMiscCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />


                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalHardCostsPerUnit}
                    cellValues={[
                        outputData[OutputKeys.TotalHardCostsPerUnit]?.title,
                        outputData[OutputKeys.TotalHardCostsPerUnit]?.value,
                        outputData[OutputKeys.TotalHardCostsPerUnit]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalHardCostsPerUnit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />

                {/* <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.REAgentCommissionPerUnit}
                    cellValues={[
                        outputData[OutputKeys.REAgentCommissionPerUnit]?.title,
                        outputData[OutputKeys.REAgentCommissionPerUnit]?.value,
                        outputData[OutputKeys.REAgentCommissionPerUnit]?.value2,

                    ]}
                    description={outputData[OutputKeys.REAgentCommissionPerUnit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                /> */}
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
                    cellValues={[
                        outputData[OutputKeys.RawLandCalculations]?.title,
                        outputData[OutputKeys.RawLandCalculations]?.value,
                        outputData[OutputKeys.RawLandCalculations]?.value2,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={-1}
                    header={true}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalSDCCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalSDCCosts]?.title,
                        outputData[OutputKeys.TotalSDCCosts]?.value,
                        outputData[OutputKeys.TotalSDCCosts]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalSDCCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandDeveloperProfitPerLot}
                    cellValues={[
                        outputData[OutputKeys.LandDeveloperProfitPerLot]?.title,
                        outputData[OutputKeys.LandDeveloperProfitPerLot]?.value,
                        outputData[OutputKeys.LandDeveloperProfitPerLot]?.value2,
                    ]}
                    description={outputData[OutputKeys.LandDeveloperProfitPerLot]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                {/* <DynamicRow
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
                /> */}
                {/* <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.ValuePerLotToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.ValuePerLotToLandOwner]?.title,
                        outputData[OutputKeys.ValuePerLotToLandOwner]?.value,
                        outputData[OutputKeys.ValuePerLotToLandOwner]?.value2,
                    ]}
                    description={outputData[OutputKeys.ValuePerLotToLandOwner]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                /> */}
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.OfferToLandOwner}
                    cellValues={[
                        outputData[OutputKeys.OfferToLandOwner]?.title,
                        outputData[OutputKeys.OfferToLandOwner]?.value,
                        outputData[OutputKeys.OfferToLandOwner]?.value2,
                    ]}
                    description={outputData[OutputKeys.OfferToLandOwner]?.description}
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
                    cellValues={[
                        outputData[OutputKeys.ProjectOverview]?.title,
                        outputData[OutputKeys.ProjectOverview]?.value,
                        outputData[OutputKeys.ProjectOverview]?.value2,

                    ]}
                    isMobile={isMobile}
                    numberOfCells={3}
                    header={true}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.LandCosts}
                    cellValues={[
                        outputData[OutputKeys.LandCosts]?.title,
                        outputData[OutputKeys.LandCosts]?.value,
                        outputData[OutputKeys.LandCosts]?.value2,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.SoftCosts}
                    cellValues={[
                        outputData[OutputKeys.SoftCosts]?.title,
                        outputData[OutputKeys.SoftCosts]?.value,
                        outputData[OutputKeys.SoftCosts]?.value2,
                    ]}
                    isMobile={isMobile}
                    numberOfCells={3}
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
                    isMobile={isMobile}
                    numberOfCells={3}
                />

                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalCosts}
                    cellValues={[
                        outputData[OutputKeys.TotalCosts]?.title,
                        outputData[OutputKeys.TotalCosts]?.value,
                        outputData[OutputKeys.TotalCosts]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalCosts]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                />
                <DynamicRow
                    setActiveCards={setActiveCards}
                    activeCards={activeCards}
                    id={OutputKeys.TotalProfit}
                    cellValues={[
                        outputData[OutputKeys.TotalProfit]?.title,
                        outputData[OutputKeys.TotalProfit]?.value,
                        outputData[OutputKeys.TotalProfit]?.value2,
                    ]}
                    description={outputData[OutputKeys.TotalProfit]?.description}
                    isMobile={isMobile}
                    numberOfCells={3}
                    output={true}
                />
            </div>


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

export default ResidentialDevelopmentCalculator;
