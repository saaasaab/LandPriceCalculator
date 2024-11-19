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
    perUnitHardCosts: number;
    totalPermitsCost: number;
    totalMiscCosts: number;
    totalBuildingCosts: number;
    totalBuilderProfit: number;
    perUnitBuilderProfit: number;
    totalREAgentCommission: number;
    perUnitREAgentCommission: number;
    totalFinishedUnitValue: number;
    perUnitFinishedUnitValue: number;
    landPercentage: number;
    perUnitlandDeveloperProfit: number;
    totalLandDeveloperProfit: number;
    perUnitOfferToLandOwner: number;
    totalOfferToLandOwner: number;
    totalActualToLandOwner: number;
    perUnitActualToLandOwner: number;
    totalSoftCosts: number;
    totalCosts: number;
    totalProfits: number;
    resultCalculateBuildingSqftResidential: BuildingCalculationResult;
}


const multifamilyDevelopmentCalculations = (inputs: TMultifamilyDevelopmentCalculationsInputs,requiresHandicappedParking:boolean): IMultifamilyDevelopmentCalculationsOutputs => {
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

    const totalMultifamilySalePrice = multifamilyPricePerUnit > 0? multifamilyPricePerUnit*numberOfUnits :  totalBuildingSqft * multifamilyPricePerSqFt;
    const perUnitSalePrice = totalMultifamilySalePrice / numberOfUnits;


    const totalHardCosts = totalBuildingSqft * hardCostPerSqFt;
    const perUnitHardCosts = totalHardCosts / numberOfUnits;



    const totalPermitsCost = permits * numberOfUnits;
    const totalMiscCosts = miscCosts * numberOfUnits;


    const totalBuildingCosts = totalHardCosts + totalPermitsCost + totalMiscCosts;


    const totalBuilderProfit = (builderProfitPercentage / 100) * totalBuildingCosts;
    const perUnitBuilderProfit = totalBuilderProfit / numberOfUnits;


    const perUnitREAgentCommission = (realEstateCommissionPercentage / 100) * perUnitSalePrice;
    const totalREAgentCommission = (realEstateCommissionPercentage / 100) * totalMultifamilySalePrice;


    const totalFinishedUnitValue = totalMultifamilySalePrice - totalBuildingCosts - totalBuilderProfit - totalREAgentCommission;

    const perUnitFinishedUnitValue = totalFinishedUnitValue / numberOfUnits;

    const landPercentage = totalFinishedUnitValue / totalMultifamilySalePrice;

    const perUnitlandDeveloperProfit = (landDeveloperProfitPercentage / 100) * perUnitFinishedUnitValue;
    const totalLandDeveloperProfit = perUnitlandDeveloperProfit * numberOfUnits;

    const perUnitOfferToLandOwner = perUnitFinishedUnitValue - costToDevelopPerUnit - perUnitlandDeveloperProfit;
    const totalOfferToLandOwner = perUnitOfferToLandOwner * numberOfUnits;


    const totalActualToLandOwner = (ownedLandCost ? ownedLandCost : perUnitOfferToLandOwner * numberOfUnits);
    const perUnitActualToLandOwner = totalActualToLandOwner / numberOfUnits;

    const totalSoftCosts = costToDevelopPerUnit * numberOfUnits + totalLandDeveloperProfit
    const totalCosts = totalActualToLandOwner + costToDevelopPerUnit * numberOfUnits + totalLandDeveloperProfit + totalHardCosts

    const totalProfits = totalMultifamilySalePrice - totalCosts

    return {
        netBuildableAcres,
        totalBuildableSqFt,
        totalParkingSpots,
        totalBuildingSqft,
        totalMultifamilySalePrice,
        perUnitSalePrice,
        totalHardCosts,
        perUnitHardCosts,
        totalPermitsCost,
        totalMiscCosts,
        totalBuildingCosts,
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
    };
};

export default multifamilyDevelopmentCalculations
