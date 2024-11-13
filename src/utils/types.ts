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
    MULTIFAMILY_DEVELOPMENT = "MULTIFAMILY_DEVELOPMENT",
    INDUSTRIAL_DEVELOPMENT = "INDUSTRIAL_DEVELOPMENT",
    RESIDENTIAL_DEVELOPMENT = "RESIDENTIAL_DEVELOPMENT",
    MULTI_FAMILY_PRICE = "MULTI_FAMILY_PRICE",
    MULTIFAMILY_ANALYSIS = "MULTIFAMILY_ANALYSIS",
    IRR_CALCULATOR = "IRR_CALCULATOR"
    // HOW_TO_MULTIFAMILY="HOW_TO_MULTIFAMILY",
}

export enum EPageTitles {
    MULTIFAMILY_DEVELOPMENT = "Multi-Family Development Calculator",
    INDUSTRIAL_DEVELOPMENT = "Industrial / Commercial Land Development Calculator",
    RESIDENTIAL_DEVELOPMENT = "Residential Land Development Calculator",
    MULTI_FAMILY_PRICE = "Price Per Door Calculator",
    MULTIFAMILY_ANALYSIS = "Multi-Family Proforma",
    IRR_CALCULATOR = "Seller's IRR Estimator"
    // HOW_TO_MULTIFAMILY="How to analyze multifamily"
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


    // FOR THE PRICE CALCULATOR
    rents = "rents",
    interestRate = "interestRate",
    numberOfPayments = "numberOfPayments",
    cashOnCashReturn = "cashOnCashReturn",
    expensePercentage = "expensePercentage",
    downPayment = "downPayment",


    //   FOR THE MULTI FAMILY ANALYSIS
    purchasePrice = "purchasePrice",
    units = "units",
    rentPerUnit = "rentPerUnit",
    repairPerUnit = "repairPerUnit",
    duration = "duration",
    taxRate = "taxRate",
    laundryIncome = "laundryIncome",
    storageIncome = "storageIncome",
    parkingIncome = "parkingIncome",
    otherIncome = "otherIncome",
    propertyTax = "propertyTax",
    insurance = "insurance",
    waterSewer = "waterSewer",
    garbage = "garbage",
    electric = "electric",
    gas = "gas",
    HOAFees = "HOAFees",
    lawnSnow = "lawnSnow",
    vacancy = "vacancy",
    repairs = "repairs",
    capEx = "capEx",
    propertyManagement = "propertyManagement",


    // FOR IRR CALCULATIONS
    newPurchasePrice = "newPurchasePrice",
    originalPurchaseDate = "originalPurchaseDate",
    originalPurchasePrice = "originalPurchasePrice",

}
