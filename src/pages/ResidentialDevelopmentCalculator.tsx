import { removeCommas, roundAndLocalString, setInLocalStorage } from '../utils/utils';
import DynamicRow from '../components/DynamicRow';

import './LandCalculator.scss';
import residentialDevelopmentCalculations from '../utils/residentialDevelopmentCalculations';
import { DEFAULT_VALUES, infrastructurePercentage, SQ_FT_PER_ACRE } from '../utils/constants';
import { EAllStates, EPageNames } from '../utils/types';
import { usePersistedState2 } from '../hooks/usePersistedState';


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
    const [houseSize, setHouseSize] = usePersistedState2(page, EAllStates.houseSize, DEFAULT_VALUES[page].houseSize, queryParams);
    const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = usePersistedState2(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams);
    const [miscCosts, setMiscCosts] = usePersistedState2(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams);
    const [ownedLandCost, setOwnedLandCost] = usePersistedState2(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams);
    const [permits, setPermits] = usePersistedState2(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams);
    const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);
    const [sqFtPerLot, setSqFtPerLot] = usePersistedState2(page, EAllStates.sqFtPerLot, DEFAULT_VALUES[page].sqFtPerLot, queryParams);
    const [unbuildableAcres, setUnbuildableAcres] = usePersistedState2(page, EAllStates.unbuildableAcres, DEFAULT_VALUES[page].unbuildableAcres, queryParams);
    const [unitsPerAcre, setUnitsPerAcre] = usePersistedState2(page, EAllStates.unitsPerAcre, DEFAULT_VALUES[page].unitsPerAcre, queryParams);

    const inputs = {
        grossAcres,
        unbuildableAcres,
        sqFtPerLot,
        unitsPerAcre,
        houseSize,
        housePricePerSqFt,
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
                    cellValues={["Gross Acres", grossAcres]}
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.grossAcres}`); setGrossAcres(value) }}
                    description="The total area of the land in acres before any deductions for unbuildable areas."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />
                <DynamicRow
                    cellValues={["Adjusted Unbuildable Acres", unbuildableAcres]}
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.unbuildableAcres}`); setUnbuildableAcres(value) }}
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
                    cellValues={['Sq Ft per Acre', SQ_FT_PER_ACRE.toLocaleString()]}
                    description='Constant: There are 43,560 square feet in one acre of land.'
                    isMobile={isMobile}
                    numberOfCells={2}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.sqFtPerLot}`); setSqFtPerLot(value) }}
                    cellValues={["Zoning - Sq Ft per Lot (SQFT)", sqFtPerLot]}
                    description="The jurisdiction gives a zoning requirement or desired lot size (e.g., R-5 = 5,000 sq ft per lot)."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.unitsPerAcre}`); setUnitsPerAcre(value) }}
                    cellValues={["Zoning - Maximum units per acre", removeCommas(unitsPerAcre) === 0 ? undefined : unitsPerAcre]}
                    description="The jurisdiction gives a zoning requirement for the maximum number of units per acre."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
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
                    cellValues={["Financial Assumptions"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />


                {/* House Size */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.houseSize}`); setHouseSize(value) }}
                    cellValues={["House Size - Sq Ft", houseSize]}
                    description="The average size of houses in this area, determined by local research."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                {/* House Price Per Sq Ft */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.housePricePerSqFt}`); setHousePricePerSqFt(value) }}
                    cellValues={["House Price - per Sq Ft", housePricePerSqFt]}
                    description="The average price per square foot for houses in this area, determined by local research."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />


                {/* House Sale Price */}
                <DynamicRow
                    cellValues={["House Sale Price", houseSalePrice.toLocaleString()]}
                    description="The total sale price of the house based on the size and price per square foot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />


                {/* Hard Cost Per Sq Ft */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.hardCostPerSqFt}`); setHardCostPerSqFt(value) }}
                    cellValues={["Hard Cost per Sq Ft for House Build ($)", hardCostPerSqFt, (removeCommas(hardCostPerSqFt) * removeCommas(houseSize)).toLocaleString()]}
                    description="The hard costs for building the house per square foot."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />



                {/* Permits */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.permits}`); setPermits(value) }}
                    cellValues={["Permits per unit ($)", permits]}
                    description="The total cost of permits required for the house build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />


                {/* Misc Costs */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.miscCosts}`); setMiscCosts(value) }}
                    cellValues={["Misc Costs per unit ($)", miscCosts]}
                    description="Miscellaneous costs involved in the house build."
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                {/* Home Builder Profit */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.homeBuilderProfitPercentage}`); setHomeBuilderProfitPercentage(value) }}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.realEstateCommissionPercentage}`); setRealEstateCommissionPercentage(value) }}
                    cellValues={["RE Agent Commission per unit (%)", realEstateCommissionPercentage, Math.round(reAgentCommission).toLocaleString()]}
                    description="The real estate agent commission, calculated as a percentage of the house sale price."
                    isMobile={isMobile}
                    numberOfCells={3}
                    inputCellIndex={1}
                />

                {/* Land Percentage */}
                <DynamicRow
                    cellValues={["Land Percentage of Total Value", (landPercentage * 100).toFixed(1) + "%"]}
                    description="The percentage of the total house value attributed to the finished lot."
                    isMobile={isMobile}
                    numberOfCells={2}
                />

                {/* Finished Lot Value */}
                <DynamicRow
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
                    cellValues={["Raw Land Calculations"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    inputCellIndex={-1}
                    header={true}
                />

                {/* Land Developer Profit Per Lot */}
                <DynamicRow
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.landDeveloperProfitPercentage}`); setLandDeveloperProfitPercentage(value) }}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.costToDevelopPerLot}`); setCostToDevelopPerLot(value) }}
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
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.ownedLandCost}`); setOwnedLandCost(value) }}
                    description="If you own the property already, enter in the price of the property here"
                    cellValues={["Land value if already own ($)", removeCommas(ownedLandCost) === 0 ? undefined : ownedLandCost]}
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



            {/* <div className="table-container">
                <DynamicRow
                    cellValues={["Financing Options"]}
                    isMobile={isMobile}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    cellValues={["Interest Rate (Construction Loan)", `${constructionLoanInterestRate}%`]}
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.}`);  setConstructionLoanInterestRate(Number(value))}}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["Interest Rate (Conventional Loan)", `${conventionalLoanInterestRate}%`]}
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.}`);  setConventionalLoanInterestRate(Number(value))}}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["All Cash Purchase", `${allCash ? "Yes" : "No"}`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["Construction to Conventional", `${constructionToConventional ? "Yes" : "No"}`]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["Loan Duration", `${loanDuration} years`]}
                    setInput={(value) => { setInLocalStorage(Number(value), `${EPageNames.RESIDENTIAL_DEVELOPMENT}_${EAllStates.}`);  setLoanDuration(Number(value))}}
                    isMobile={isMobile}
                    numberOfCells={2}
                    inputCellIndex={1}
                />

                <DynamicRow
                    cellValues={["Total Financing Cost", roundAndLocalString(totalFinancingCosts)]}
                    isMobile={isMobile}
                    numberOfCells={2}
                    description="Total cost of financing based on the selected loan type and interest rate"
                    output={true}
                />
            </div> */}




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

        </>
    );
};

export default ResidentialDevelopmentCalculator;
