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
    MULTI_FAMILY_PRICE_PER_DOOR = "MULTI_FAMILY_PRICE_PER_DOOR",
    MULTIFAMILY_ANALYSIS = "MULTIFAMILY_ANALYSIS",
    IRR_CALCULATOR = "IRR_CALCULATOR",
    LENDING_COST = "LENDING_COST",
    WATERFALL = "WATERFALL",
    CONSTRUCTION_BUDGET = "CONSTRUCTION_BUDGET",
    INDUSTRIAL_PRICE_PER_SQFT = "INDUSTRIAL_PRICE_PER_SQFT",
    // HOW_TO_MULTIFAMILY="HOW_TO_MULTIFAMILY",
}

export enum EPageTitles {
    MULTIFAMILY_DEVELOPMENT = "Multi-Family Development Calculator",
    INDUSTRIAL_DEVELOPMENT = "Industrial / Commercial Land Development Calculator",
    RESIDENTIAL_DEVELOPMENT = "Residential Land Development Calculator",
    MULTI_FAMILY_PRICE_PER_DOOR = "Price Per Door Calculator - Multifamily",
    INDUSTRIAL_PRICE_PER_SQFT = "Price Per SQFT Calculator - Industrial",

    MULTIFAMILY_ANALYSIS = "Multi-Family Proforma",
    IRR_CALCULATOR = "Seller's IRR Estimator",
    LENDING_COST = "Lending Cost Estimator",
    WATERFALL = "Waterfall Distribution Generator",
    CONSTRUCTION_BUDGET = "Construction Budget Generator",
    SITE_PLAN_BUILDER = "Site Plan Builder",
    HOME = "Home",
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
    multifamilyPricePerUnit = "multifamilyPricePerUnit",
    residentialPricePerHome = "residentialPricePerHome",
    annualLeaseRatesPerSQFT = "annualLeaseRatesPerSQFT",
    percentageOfIncomeToExpenses = "percentageOfIncomeToExpenses",
    leasableSQFT = "leasableSQFT",


    // FOR THE PRICE CALCULATOR
    rents = "rents",
    interestRate = "interestRate",
    numberOfPayments = "numberOfPayments",
    cashOnCashReturn = "cashOnCashReturn",
    expensePercentage = "expensePercentage",
    downPayment = "downPayment",
    buyersAgentFee = "buyersAgentFee",
    clostingCostsFee = "clostingCostsFee",


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
    closingCosts = "closingCosts",


    // FOR IRR CALCULATIONS
    newPurchasePrice = "newPurchasePrice",
    originalPurchaseDate = "originalPurchaseDate",
    originalPurchasePrice = "originalPurchasePrice",

    // FOR LOAN CALCULATION FEES
    loanOriginationFee = "loanOriginationFee",

    loanTerm = "loanTerm",
    drawFee = "drawFee",
    underwritingFee = "underwritingFee",
    inspectionFee = "inspectionFee",
    appraisalFee = "appraisalFee",
    titleInsurance = "titleInsurance",
    recordingFee = "recordingFee",
    legalFee = "legalFee",
    interestReserve = "interestReserve",
    prepaymentPenalty = "prepaymentPenalty",
    loanExtensionFee = "loanExtensionFee",
    discountPoints = "discountPoints",
    propertyValue = "propertyValue",
    loanToValue = "loanToValue",
    constructionToLongTermLoan = "constructionToLongTermLoan",
    isInterestOnly = "isInterestOnly",

}
