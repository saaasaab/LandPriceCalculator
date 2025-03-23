import {  SQ_FT_PER_ACRE } from "./constants";
import { convertInputsToNumbers } from "./utils";

type TResidentialDevelopmentCalculationsInputs = {
    grossAcres: string;
    unbuildableAcres: string;
    sqFtPerLot: string;
    unitsPerAcre: string;
    houseSize: string;
    housePricePerSqFt: string;
    hardCostPerSqFt: string;
    permits: string;
    miscCosts: string;
    homeBuilderProfitPercentage: string;
    SDCFees: string;
    // realEstateCommissionPercentage: string;
    landDeveloperProfitPercentage: string;
    costToDevelopPerLot: string;
    ownedLandCost?: string; // Optional
    infrastructurePercentage:string;
};

type TResidentialDevelopmentCalculationsOutputs = {
    houseSalePrice: number;
    hardCostLessProfit: number;
    homeBuilderProfit: number;
    totalHardCostsPerUnit: number;
    // reAgentCommission: number;
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
    totalCostToDevelopPerLot: number;
    // totalClosingCosts: number;
};

const residentialDevelopmentCalculations = (inputs: TResidentialDevelopmentCalculationsInputs): TResidentialDevelopmentCalculationsOutputs => {
    const {
        grossAcres,
        unbuildableAcres,
        sqFtPerLot,
        unitsPerAcre,
        houseSize,
        SDCFees,

        housePricePerSqFt,
        residentialPricePerHome,
        hardCostPerSqFt,
        permits,
        miscCosts,
        homeBuilderProfitPercentage,
        // realEstateCommissionPercentage,
        landDeveloperProfitPercentage,
        ownedLandCost,
        costToDevelopPerLot,
        infrastructurePercentage,
    } = convertInputsToNumbers(inputs);

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE * (infrastructurePercentage / 100);

    const yieldBySQFT = Math.floor(totalBuildableSqFt / sqFtPerLot);
    const yieldByUnitsPerAcre = unitsPerAcre ? Math.floor(unitsPerAcre * netBuildableAcres) : Infinity;

    // Calculate total lot yield based on zoning (sq ft per lot)
    const totalLotYield = Math.min(yieldBySQFT, yieldByUnitsPerAcre);



    const houseSalePrice = residentialPricePerHome !== 0 ? residentialPricePerHome : houseSize * housePricePerSqFt;
    const hardCostLessProfit = houseSize * hardCostPerSqFt + permits + miscCosts;
    const homeBuilderProfit = (homeBuilderProfitPercentage / 100) * hardCostLessProfit;
    const totalHardCostsPerUnit = hardCostLessProfit + homeBuilderProfit;
    // const reAgentCommission = (realEstateCommissionPercentage / 100) * houseSalePrice;


    const finishedLotValue = houseSalePrice - totalHardCostsPerUnit; // - reAgentCommission;
    const landPercentage = finishedLotValue / houseSalePrice;

    const landDeveloperProfitPerLot = (landDeveloperProfitPercentage / 100) * finishedLotValue;
    const landDeveloperProfit = landDeveloperProfitPerLot * totalLotYield;
    const totalCostToDevelopPerLot =  SDCFees + costToDevelopPerLot;
    
    const perLotOfferToLandOwner = ownedLandCost ? ownedLandCost/totalLotYield : finishedLotValue - totalCostToDevelopPerLot - landDeveloperProfitPerLot;
    const totalOfferToLandOwner = perLotOfferToLandOwner * totalLotYield;

    const totalHardCosts = totalHardCostsPerUnit * totalLotYield;
    const totalSoftCosts = totalCostToDevelopPerLot * totalLotYield + landDeveloperProfit;
    const totalCosts = totalOfferToLandOwner + totalSoftCosts + totalHardCosts

    const totalProfits = houseSalePrice * totalLotYield - totalCosts;
    // const totalClosingCosts = reAgentCommission

    
    return {
        houseSalePrice,
        hardCostLessProfit,
        homeBuilderProfit,
        totalHardCostsPerUnit,
        // reAgentCommission,
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
        totalProfits,
        totalCostToDevelopPerLot,
        // totalClosingCosts
    };
};

export default residentialDevelopmentCalculations;
