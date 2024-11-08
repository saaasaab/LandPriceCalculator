import { calculateBuildingSqft,convertInputsToNumbers } from "./utils";
import { SQ_FT_PER_ACRE } from "./constants";
import { BuildingCalculationResult } from "./types";

type TIndustrialDevelopmentCalculationsInputs = {
    grossAcres: string;
    unbuildableAcres: string;
    numberOfFloors: string;
    parkingRatio: string;
    maxImperviousSurfaceRatio: string;
    commonSpacePercentage: string;
    catchAll: string;
    buildingPricePerSqFt: string;
    hardCostPerSqFt: string;
    permits: string;
    miscCosts: string;
    homeBuilderProfitPercentage: string;
    realEstateCommissionPercentage: string;
    landDeveloperProfitPercentage: string;
    ownedLandCost: string;
    costToDevelop: string;
};

type TIndustrialDevelopmentCalculationsOutputs = {
    totalBuildableSqFt: number;
    totalBuildingSqft: number;
    buildingSalePrice: number;
    totalHardCosts: number;
    homeBuilderProfit: number;
    reAgentCommission: number;
    finishedLotValue: number;
    landPercentage: number;
    landDeveloperProfit: number;
    totalOfferToLandOwner: number;
    totalCosts: number;
    netBuildableAcres: number;
    resultCalculateBuildingSqftIndustrial: BuildingCalculationResult  & {
        leaseableBuildingSpace: number;
    };
};

const industrialDevelopmentCalculations = (inputs: TIndustrialDevelopmentCalculationsInputs): TIndustrialDevelopmentCalculationsOutputs => {
    const {
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
    } = convertInputsToNumbers(inputs);

    

    // Constants

    // Calculate net buildable acres
    const netBuildableAcres = grossAcres - unbuildableAcres;

    // Calculate total buildable square feet, adjusted for infrastructure
    const totalBuildableSqFt = netBuildableAcres * SQ_FT_PER_ACRE;

    const resultCalculateBuildingSqftIndustrial= calculateBuildingSqft(totalBuildableSqFt, numberOfFloors, parkingRatio / 1000, maxImperviousSurfaceRatio / 100, commonSpacePercentage, catchAll);
    const buildingSalePrice = resultCalculateBuildingSqftIndustrial.totalBuildingSqft * buildingPricePerSqFt;

    const hardCostTotal = resultCalculateBuildingSqftIndustrial.totalBuildingSqft * hardCostPerSqFt + permits + miscCosts;
    const homeBuilderProfit = (homeBuilderProfitPercentage / 100) * hardCostTotal;
    const totalHardCosts = hardCostTotal + homeBuilderProfit;
    const reAgentCommission = (realEstateCommissionPercentage / 100) * buildingSalePrice;
    const finishedLotValue = buildingSalePrice - totalHardCosts - reAgentCommission;
    const landPercentage = finishedLotValue / buildingSalePrice;
    const landDeveloperProfit = (landDeveloperProfitPercentage / 100) * finishedLotValue;

    const totalOfferToLandOwner = ownedLandCost ? ownedLandCost : finishedLotValue - costToDevelop - landDeveloperProfit;
    const totalCosts = totalOfferToLandOwner + costToDevelop + landDeveloperProfit + totalHardCosts;


    
    return {
        totalBuildableSqFt,
        totalBuildingSqft: resultCalculateBuildingSqftIndustrial.totalBuildingSqft,
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
        resultCalculateBuildingSqftIndustrial
    };
};

export default industrialDevelopmentCalculations;
