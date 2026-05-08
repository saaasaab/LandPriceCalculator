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

export interface Milestone {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    drawdownAmount: number;
    completed: boolean;
    dependencies?: string[]; // IDs of milestones that must be completed before this one can start
}

export interface LendingFees {
    originationFee: number;      // Percentage of total loan
    originationFeeFlat: number;  // Flat fee amount
    lenderFee: number;          // Percentage of each drawdown
    lenderFeeFlat: number;      // Flat fee per drawdown
    interestRate: number;       // Annual interest rate
    interestRateType: 'fixed' | 'variable';
    adminFee: number;           // Monthly admin fee
    inspectionFee: number;      // Fee per inspection
    exitFee: number;            // Exit fee percentage
    exitFeeFlat: number;        // Flat exit fee
    extensionFeePercentage: number; // Fee for extending the loan
    extensionFeeFlat: number;   // Flat fee for extension
}

export interface DrawdownCalculation {
    date: string;
    milestone: string;
    drawdownAmount: number;
    interestCharged: number;
    fees: {
        lenderFee: number;
        adminFee: number;
        inspectionFee: number;
        other: number;
    };
    totalCost: number;
    cumulativeInterest: number;
    cumulativeFees: number;
    cumulativeDrawdown: number;
}

export enum EPageNames {
    MULTIFAMILY_DEVELOPMENT = "MULTIFAMILY_DEVELOPMENT",
    INDUSTRIAL_DEVELOPMENT = "INDUSTRIAL_DEVELOPMENT",
    COMMERCIAL_DEVELOPMENT = "COMMERCIAL_DEVELOPMENT",
    RESIDENTIAL_DEVELOPMENT = "RESIDENTIAL_DEVELOPMENT",
    MULTI_FAMILY_PRICE_PER_DOOR = "MULTI_FAMILY_PRICE_PER_DOOR",
    MULTIFAMILY_ANALYSIS = "MULTIFAMILY_ANALYSIS",
    INDUSTRIAL_PROFORMA = "INDUSTRIAL_PROFORMA",
    IRR_CALCULATOR = "IRR_CALCULATOR",
    HARD_MONEY_COST_ESTIMATOR = "HARD_MONEY_COST_ESTIMATOR",
    WATERFALL_GENERATOR = "WATERFALL_GENERATOR",
    CONSTRUCTION_BUDGET = "CONSTRUCTION_BUDGET",
    INDUSTRIAL_PRICE_PER_SQFT = "INDUSTRIAL_PRICE_PER_SQFT",
    HOUSE_FLIPPING_CALCULATOR = "HOUSE_FLIPPING_CALCULATOR",
    CONSTRUCTION_LENDING_COSTS = "CONSTRUCTION_LENDING_COSTS",
    CONSTRUCTION_LOAN_CALCULATOR = "CONSTRUCTION_LOAN_CALCULATOR",
    SITE_PLAN_BUILDER = "SITE_PLAN_BUILDER",
}

export enum EPageTitles {
    MULTIFAMILY_DEVELOPMENT = "Multi-Family Development Calculator",
    INDUSTRIAL_DEVELOPMENT = "Industrial Land Development Calculator",
    COMMERCIAL_DEVELOPMENT = "Commercial Land Development Calculator",
    RESIDENTIAL_DEVELOPMENT = "Residential Land Development Calculator",
    MULTI_FAMILY_PRICE_PER_DOOR = "Price Per Door Calculator - Multifamily",
    INDUSTRIAL_PRICE_PER_SQFT = "Price Per SQFT Calculator - Industrial",
    MULTIFAMILY_ANALYSIS = "Multi-Family Proforma",
    INDUSTRIAL_PROFORMA = "Industrial/Commercial Proforma",
    IRR_CALCULATOR = "Seller's IRR Estimator",
    HARD_MONEY_COST_ESTIMATOR = "Hard Money Loan Estimator",
    WATERFALL_GENERATOR = "Waterfall Distribution Generator",
    CONSTRUCTION_BUDGET = "Construction Budget Generator",
    SITE_PLAN_BUILDER = "Site Plan Builder",
    HOUSE_FLIPPING_CALCULATOR = "House Flipping Calculator",
    HOME = "Home",
    CONSTRUCTION_LENDING_COSTS = "Construction Lending Cost Calculator",
    CONSTRUCTION_LOAN_CALCULATOR = "Construction Loan Calculator",
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
    infrastructurePercentage= "infrastructurePercentage",

    // FOR THE PRICE CALCULATOR
    rents = "rents",
    interestRate = "interestRate",
    numberOfPayments = "numberOfPayments",
    expensePercentage = "expensePercentage",
    downPayment = "downPayment",
    buyersAgentFee = "buyersAgentFee",
    clostingCostsFee = "clostingCostsFee",

    // FOR THE MULTI FAMILY ANALYSIS
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

    // discountPoints = "discountPoints",
    // FOR WATERFALL DISTRIBUTION
    totalInvestment = "totalInvestment",
    totalReturn = "totalReturn",
    gpEquityContribution = "gpEquityContribution",
    tier1Hurdle = "tier1Hurdle",
    tier1Split = "tier1Split",
    tier2Hurdle = "tier2Hurdle",
    tier2Promote = "tier2Promote",
    tier2Split = "tier2Split",
    tier3Hurdle = "tier3Hurdle",
    tier3Promote = "tier3Promote",
    tier3Split = "tier3Split",
    tier4Hurdle = "tier4Hurdle",
    tier4Promote = "tier4Promote",
    tier4Split = "tier4Split",

    // FOR LOAN CALCULATION FEES
    hardMoneyLoanLtv = "hardMoneyLoanLtv",
    hardMoneyLoanPoints = "hardMoneyLoanPoints",
    hardMoneyLoanInterestRate = "hardMoneyLoanInterestRate",
    gapPoints = "gapPoints",
    gapInterestRate = "gapInterestRate",
    arv = "arv",
    purchaseAndRepairCosts = "purchaseAndRepairCosts",
    projectMonths = "projectMonths",
    hardMoneyLoanAdminFees="hardMoneyLoanAdminFees",
    gapLoanAdminFees="gapLoanAdminFees",

    roof = "roof",
    concrete = "concrete",
    gutters = "gutters",
    garage = "garage",
    siding = "siding",
    landscaping = "landscaping",
    exteriorPainting = "exteriorPainting",
    septic = "septic",
    decksPorches = "decksPorches",
    foundation = "foundation",
    demo = "demo",
    sheetrock = "sheetrock",
    plumbing = "plumbing",
    carpentry = "carpentry",
    windows = "windows",
    doors = "doors",
    electrical = "electrical",
    interiorPainting = "interiorPainting",
    hvac = "hvac",
    cabinets = "cabinets",
    framing = "framing",
    flooring = "flooring",
    insulation = "insulation",
    termites = "termites",
    mold = "mold",
    miscellaneous = "miscellaneous",
    profitPercentage="profitPercentage",
    hardMoneyEquitySharePercentage ="hardMoneyEquitySharePercentage",
    gapEquitySharePercentage="gapEquitySharePercentage",

    // CONSTRUCTION BUDGET

    // Land Costs
    landAcquisition = "landAcquisition",

    // Designs and Engineering Costs
    architecturalDesigns = "architecturalDesigns",
    civilEngineering = "civilEngineering",
    surveying = "surveying",
    landscapeDesign = "landscapeDesign",
    geotechnical = "geotechnical",
    mepEngineering = "mepEngineering",

    // City Application, Review, and Permit Fees
    preApplication = "preApplication",
    siteDesignReview = "siteDesignReview",
    sitePlanReview = "sitePlanReview",
    buildingPermit = "buildingPermit",

    // System Development Charges
    stormwater = "stormwater",
    transportation = "transportation",
    sanitarySewer = "sanitarySewer",
    parks = "parks",
    water = "water",

    // Land Preparation Costs
    excavation = "excavation",
    waterRetention = "waterRetention",
    asphalt = "asphalt",

    // Rough Buildout Costs
    lumber = "lumber",
    trusses = "trusses",
    framingLabor = "framingLabor",
    gasPiping = "gasPiping",
    roofing = "roofing",
    exteriorDoors = "exteriorDoors",

    // Finishings Costs
    drywall = "drywall",
    interiorTrim = "interiorTrim",
    painting = "painting",
    countertops = "countertops",
    carpet = "carpet",
    hardware = "hardware",
    appliances = "appliances",
    lightFixtures = "lightFixtures",
    windowCovering = "windowCovering",
    cleanup = "cleanup",
    flatwork = "flatwork",
    fences = "fences",

    // Contractor Fee and Contingencies
    generalConditions = "generalConditions",
    contractorFee = "contractorFee",

    tier1LPSplit = "tier1LPSplit",
    tier1Active = "tier1Active",
    tier2Active = "tier2Active",
    tier3Active = "tier3Active",
    tier4Active = "tier4Active",

    // Construction Lending Calculator States
    constructionLoanAmount = "constructionLoanAmount",
    constructionLoanTerm = "constructionLoanTerm",
    originationFee = "originationFee",
    originationFeeFlat = "originationFeeFlat",
    lenderFee = "lenderFee",
    lenderFeeFlat = "lenderFeeFlat",
    constructionInterestRate = "constructionInterestRate",
    interestRateType = "interestRateType",
    adminFee = "adminFee",
    inspectionFee = "inspectionFee",
    exitFee = "exitFee",
    exitFeeFlat = "exitFeeFlat",
    extensionFeePercentage = "extensionFeePercentage",
    extensionFeeFlat = "extensionFeeFlat",
    points = "points",
    refinanceEnabled = "refinanceEnabled",
    permanentRate = "permanentRate",
    permanentTerm = "permanentTerm",
    // monthlyPaymentAmount = "monthlyPaymentAmount",
    // totalPermanentInterest = "totalPermanentInterest",
    milestones = "milestones",
    loanTranches = "loanTranches",

    cashOnCashReturn="cashOnCashReturn",
    // totalInterestAccrued = "totalInterestAccrued",
    // totalLoanAmount = "totalLoanAmount",
    // totalLoanDuration = "totalLoanDuration",
    investmentDate = 'investmentDate',
    returnDate = 'returnDate'
}
