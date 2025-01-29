import { calculateBuildingSqftResidential, convertInputsToNumbers } from "./utils";
import { SQ_FT_PER_ACRE } from "./constants";
import { BuildingCalculationResult } from "./types";

type TMultifamilyDevelopmentCalculationsInputs = {
    grossAcres: string;
    unbuildableAcres: string;
    hardCostPerSqFt: string;
    permits: string;
    miscCosts: string;
    realEstateCommissionPercentage: string;
    landDeveloperProfitPercentage: string;
    ownedLandCost: string;
    parkingSpotsPerUnit: string;
    numberOfUnits: string;
    numberOfFloors: string;
    maxImperviousSurfaceRatio: string;
    catchAll: string;
    multifamilyPricePerSqFt: string;
    builderProfitPercentage: string;
    costToDevelopPerUnit: string;
};

interface IMultifamilyDevelopmentCalculationsOutputs {
    netBuildableAcres: number;
    totalBuildableSqFt: number;
    totalParkingSpots: number;
    totalBuildingSqft: number;
    totalMultifamilySalePrice: number;
    perUnitSalePrice: number;
    totalHardCosts: number;
    hardCostsForBuild: number;
    perUnitHardCostsForBuild: number;
    perUnitTotalHardCosts: number;
    totalPermitsCost: number;
    totalMiscCosts: number;
    totalBuilderProfit: number;
    perUnitBuilderProfit: number;
    totalREAgentCommission: number;
    perUnitREAgentCommission: number;
    totalFinishedUnitValue: number;
    perUnitFinishedUnitValue: number;
    landPercentage: number;
    perUnitlandDeveloperProfit: number;
    totalLandDeveloperProfit: number;
 
    totalActualToLandOwner: number;
    perUnitActualToLandOwner: number;
    totalSoftCosts: number;
    totalCosts: number;
    totalProfits: number;
    resultCalculateBuildingSqftResidential: BuildingCalculationResult;
}


const multifamilyDevelopmentCalculations = (inputs: TMultifamilyDevelopmentCalculationsInputs, requiresHandicappedParking: boolean): IMultifamilyDevelopmentCalculationsOutputs => {
    const {
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
    } = convertInputsToNumbers(inputs);




    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE;


    // const yieldBySQFT = Math.floor(totalBuildableSqFt / sqFtPerUnit);
    // Calculate total unit yield based on zoning (sq ft per unit)
    // const totalUnitYield = Math.min(yieldBySQFT, yieldByUnitsPerAcre)

    const totalParkingSpots = parkingSpotsPerUnit * numberOfUnits;

    const resultCalculateBuildingSqftResidential = calculateBuildingSqftResidential(totalBuildableSqFt, numberOfFloors, totalParkingSpots, maxImperviousSurfaceRatio / 100, catchAll,
        requiresHandicappedParking);

    const totalBuildingSqft = resultCalculateBuildingSqftResidential.totalBuildingSqft;
    // Calculations

    const totalMultifamilySalePrice = multifamilyPricePerUnit > 0 ? multifamilyPricePerUnit * numberOfUnits : totalBuildingSqft * multifamilyPricePerSqFt;
    const perUnitSalePrice = totalMultifamilySalePrice / numberOfUnits;



    const hardCostsForBuild = totalBuildingSqft * hardCostPerSqFt;
    const perUnitHardCostsForBuild = hardCostsForBuild / numberOfUnits;




    const totalPermitsCost = permits * numberOfUnits;
    const totalMiscCosts = miscCosts * numberOfUnits;


    const totalHardCosts = hardCostsForBuild + totalPermitsCost + totalMiscCosts;
    const perUnitTotalHardCosts = totalHardCosts / numberOfUnits;


    const totalBuilderProfit = (builderProfitPercentage / 100) * totalHardCosts;
    const perUnitBuilderProfit = totalBuilderProfit / numberOfUnits;


    const perUnitREAgentCommission = (realEstateCommissionPercentage / 100) * perUnitSalePrice;
    const totalREAgentCommission = (realEstateCommissionPercentage / 100) * totalMultifamilySalePrice;


    const totalFinishedUnitValue = totalMultifamilySalePrice - totalHardCosts - totalBuilderProfit - totalREAgentCommission;

    const perUnitFinishedUnitValue = totalFinishedUnitValue / numberOfUnits;

    const landPercentage = totalFinishedUnitValue / totalMultifamilySalePrice;

    const perUnitlandDeveloperProfit = (landDeveloperProfitPercentage / 100) * perUnitFinishedUnitValue;
    const totalLandDeveloperProfit = perUnitlandDeveloperProfit * numberOfUnits;

    const perUnitOfferToLandOwner = perUnitFinishedUnitValue - costToDevelopPerUnit - perUnitlandDeveloperProfit;
    const totalOfferToLandOwner = perUnitOfferToLandOwner * numberOfUnits;


    const totalActualToLandOwner = (ownedLandCost ? ownedLandCost : totalOfferToLandOwner);
    const perUnitActualToLandOwner = totalActualToLandOwner / numberOfUnits;



    const totalSoftCosts = costToDevelopPerUnit * numberOfUnits + totalLandDeveloperProfit
    const totalCosts = totalActualToLandOwner + totalSoftCosts + totalHardCosts
    const totalProfits = totalMultifamilySalePrice - totalCosts

    return {
        netBuildableAcres,
        totalBuildableSqFt,
        totalParkingSpots,
        totalBuildingSqft,
        totalMultifamilySalePrice,
        perUnitSalePrice,
        totalHardCosts,
        perUnitHardCostsForBuild,
        totalPermitsCost,
        totalMiscCosts,
        perUnitTotalHardCosts,
        totalBuilderProfit,
        perUnitBuilderProfit,
        totalREAgentCommission,
        perUnitREAgentCommission,
        totalFinishedUnitValue,
        perUnitFinishedUnitValue,
        landPercentage,
        perUnitlandDeveloperProfit,
        totalLandDeveloperProfit,
       
        totalActualToLandOwner,
        perUnitActualToLandOwner,
        totalSoftCosts,
        totalCosts,
        totalProfits,
        resultCalculateBuildingSqftResidential,
        hardCostsForBuild,

    };
};

export default multifamilyDevelopmentCalculations
