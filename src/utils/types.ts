export interface BuildingFootprint {
    area: number;
    dimensions: {
        length: string; // As `toFixed` returns a string
        width: string;  // As `toFixed` returns a string
    };
}

export interface BuildingCalculationResult {
    totalBuildingSqft: number;
    parkingSpotsRequired: number;
    buildingFootprint: BuildingFootprint;
    parkingArea: number;
    drivewayArea: number;
    imperviousSurfaceRatio: number;
    lotSize: number;
    handicappedParking: number;
    sidewalkArea: number;
}



export enum EPageNames {
    MULTIFAMILY_DEVELOPMENT =  "MULTIFAMILY_DEVELOPMENT",
    INDUSTRIAL_DEVELOPMENT = "INDUSTRIAL_DEVELOPMENT",
    RESIDENTIAL_DEVELOPMENT = "RESIDENTIAL_DEVELOPMENT",
    MULTI_FAMILY_PRICE="MULTI_FAMILY_PRICE"
}

export enum EPageTitles {
    MULTIFAMILY_DEVELOPMENT =  "Multi-Family Development Calculator",
    INDUSTRIAL_DEVELOPMENT = "Industrial / Commercial Land Development Calculator",
    RESIDENTIAL_DEVELOPMENT = "Residential Land Development Calculator",
    MULTI_FAMILY_PRICE="Multi-family price calculator"
}

export enum EAllStates {
    builderProfitPercentage = "builderProfitPercentage",
    buildingPricePerSqFt = "buildingPricePerSqFt",
    catchAll = "catchAll",
    commonSpacePercentage = "commonSpacePercentage",
    costToDevelop = "costToDevelop",
    costToDevelopPerLot = "costToDevelopPerLot",
    costToDevelopPerUnit = "costToDevelopPerUnit",
    grossAcres = "grossAcres",
    hardCostPerSqFt = "hardCostPerSqFt",
    homeBuilderProfitPercentage = "homeBuilderProfitPercentage",
    housePricePerSqFt = "housePricePerSqFt",
    houseSize = "houseSize",
    landDeveloperProfitPercentage = "landDeveloperProfitPercentage",
    maxImperviousSurfaceRatio = "maxImperviousSurfaceRatio",
    miscCosts = "miscCosts",
    multifamilyPricePerSqFt = "multifamilyPricePerSqFt",
    numberOfFloors = "numberOfFloors",
    numberOfUnits = "numberOfUnits",
    ownedLandCost = "ownedLandCost",
    parkingRatio = "parkingRatio",
    parkingSpotsPerUnit = "parkingSpotsPerUnit",
    permits = "permits",
    realEstateCommissionPercentage = "realEstateCommissionPercentage",
    requiresHandicappedParking = "requiresHandicappedParking",
    SDCFees = "SDCFees",
    sqFtPerLot = "sqFtPerLot",
    unbuildableAcres = "unbuildableAcres",
    unitsPerAcre = "unitsPerAcre",

  rents="rents",
  interestRate="interestRate",
  numberOfPayments="numberOfPayments",
  cashOnCashReturn="cashOnCashReturn",
  expensePercentage="expensePercentage",
  downPayment="downPayment"


    // FOR THE PRICE CALCULATOR
}
