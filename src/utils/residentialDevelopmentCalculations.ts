import { infrastructurePercentage, SQ_FT_PER_ACRE } from "./constants";

type TResidentialDevelopmentCalculationsInputs = {
    grossAcres: number;
    unbuildableAcres: number;
    sqFtPerLot: number;
    unitsPerAcre: number;
    houseSize: number;
    housePricePerSqFt: number;
    hardCostPerSqFt: number;
    permits: number;
    miscCosts: number;
    homeBuilderProfitPercentage: number;
    realEstateCommissionPercentage: number;
    landDeveloperProfitPercentage: number;
    costToDevelopPerLot: number;
    ownedLandCost?: number; // Optional
};

type TResidentialDevelopmentCalculationsOutputs = {
    houseSalePrice: number;
    hardCostLessProfit: number;
    homeBuilderProfit: number;
    totalHardCostsPerUnit: number;
    reAgentCommission: number;
    finishedLotValue: number;
    landPercentage: number;
    netBuildableAcres: number;
    totalBuildableSqFt: number;
    yieldBySQFT: number;
    yieldByUnitsPerAcre: number;
    totalLotYield: number;
    landDeveloperProfitPerLot: number;
    landDeveloperProfit: number;
    perLotOfferToLandOwner: number;
    totalOfferToLandOwner: number;
    totalHardCosts: number;
    totalSoftCosts: number;
    totalCosts: number;
    totalProfits: number;
};

const residentialDevelopmentCalculations = (inputs: TResidentialDevelopmentCalculationsInputs): TResidentialDevelopmentCalculationsOutputs => {
    const {
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
    } = inputs;

    // Calculations
    const houseSalePrice = houseSize * housePricePerSqFt;
    const hardCostLessProfit = houseSize * hardCostPerSqFt + permits + miscCosts;
    const homeBuilderProfit = (homeBuilderProfitPercentage / 100) * hardCostLessProfit;
    const totalHardCostsPerUnit = hardCostLessProfit + homeBuilderProfit;
    const reAgentCommission = (realEstateCommissionPercentage / 100) * houseSalePrice;
    const finishedLotValue = houseSalePrice - totalHardCostsPerUnit - reAgentCommission;
    const landPercentage = finishedLotValue / houseSalePrice;

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE * (infrastructurePercentage / 100);

    const yieldBySQFT = Math.floor(totalBuildableSqFt / sqFtPerLot);
    const yieldByUnitsPerAcre = unitsPerAcre ? Math.floor(unitsPerAcre * netBuildableAcres) : Infinity;

    // Calculate total lot yield based on zoning (sq ft per lot)
    const totalLotYield = Math.min(yieldBySQFT, yieldByUnitsPerAcre);

    const landDeveloperProfitPerLot = (landDeveloperProfitPercentage / 100) * finishedLotValue;
    const landDeveloperProfit = landDeveloperProfitPerLot * totalLotYield;
    const perLotOfferToLandOwner = finishedLotValue - costToDevelopPerLot - landDeveloperProfitPerLot;
    const totalOfferToLandOwner = ownedLandCost ? ownedLandCost : perLotOfferToLandOwner * totalLotYield;

    const totalHardCosts = totalHardCostsPerUnit * totalLotYield;
    const totalSoftCosts = costToDevelopPerLot * totalLotYield + landDeveloperProfit;
    const totalCosts = totalOfferToLandOwner + costToDevelopPerLot * totalLotYield + landDeveloperProfit + totalHardCostsPerUnit * totalLotYield;
    const totalProfits = houseSalePrice * totalLotYield - totalCosts;

    return {
        houseSalePrice,
        hardCostLessProfit,
        homeBuilderProfit,
        totalHardCostsPerUnit,
        reAgentCommission,
        finishedLotValue,
        landPercentage,
        netBuildableAcres,
        totalBuildableSqFt,
        yieldBySQFT,
        yieldByUnitsPerAcre,
        totalLotYield,
        landDeveloperProfitPerLot,
        landDeveloperProfit,
        perLotOfferToLandOwner,
        totalOfferToLandOwner,
        totalHardCosts,
        totalSoftCosts,
        totalCosts,
        totalProfits
    };
};

export default residentialDevelopmentCalculations;
