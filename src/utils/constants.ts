import { EAllStates, EPageNames } from "./types";

export const SQ_FT_PER_ACRE = 43560;
export const infrastructurePercentage = 70;

export const DEFAULT_VALUES_ZEROS = {
    grossAcres: "0",
    unbuildableAcres: "0",
    numberOfFloors: "0",
    maxImperviousSurfaceRatio: "0",
    commonSpacePercentage: "0",
    parkingRatio: "0",
    catchAll: "0",
    buildingPricePerSqFt: "0",
    hardCostPerSqFt: "0",
    permits: "0",
    miscCosts: "0",
    homeBuilderProfitPercentage: "0",
    realEstateCommissionPercentage: "0",
    landDeveloperProfitPercentage: "0",
    costToDevelop: "0",
    SDCFees: "0",
    ownedLandCost: "0",
    builderProfitPercentage: "0",
    costToDevelopPerLot: "0",
    costToDevelopPerUnit: "0",
    housePricePerSqFt: "0",
    houseSize: "0",
    multifamilyPricePerSqFt: "0",
    numberOfUnits: "0",
    parkingSpotsPerUnit: "0",
    requiresHandicappedParking: true,
    sqFtPerLot: "0",
    unitsPerAcre: "0",

    rents: "0",
    interestRate: "0",
    numberOfYears: "0",
    cashOnCashReturn: "0",
    expensePercentage: "0",
    downPayment: "0",


    purchasePrice: "0",
    units: "0",
    rentPerUnit: "0",
    repairPerUnit: "0",
    duration: "0",
    taxRate: "0",
    laundryIncome: "0",
    storageIncome: "0",
    parkingIncome: "0",
    otherIncome: "0",
    propertyTax: "0",
    insurance: "0",
    waterSewer: "0",
    garbage: "0",
    electric: "0",
    gas: "0",
    HOAFees: "0",
    lawnSnow: "0",
    vacancy: "0",
    repairs: "0",
    capEx: "0",
    propertyManagement: "0",

    // FOR IRR CALCULATIONS
    originalPurchasePrice: "0",
    originalPurchaseDate: "01-01-1970",
    newPurchasePrice: "0",
    loanOriginationFee: "0",
    loanTerm: "0",
    drawFee: "0",
    underwritingFee: "0",
    inspectionFee: "0",
    appraisalFee: "0",
    titleInsurance: "0",
    recordingFee: "0",
    legalFee: "0",
    interestReserve: "0",
    prepaymentPenalty: "0",
    loanExtensionFee: "0",
    discountPoints: "0",
    propertyValue: "0",
    loanToValue: "0",
    constructionToLongTermLoan: "0",
    isInterestOnly: false,                  

}
export const DEFAULT_VALUES = {
    [EPageNames.RESIDENTIAL_DEVELOPMENT]: {
        ...DEFAULT_VALUES_ZEROS,
        grossAcres: "1.65",
        unbuildableAcres: "0",
        sqFtPerLot: "1,500",
        unitsPerAcre: "0",
        houseSize: "1,500",
        housePricePerSqFt: "300",
        hardCostPerSqFt: "135",
        permits: "12,000",
        miscCosts: "7,500",
        homeBuilderProfitPercentage: "20",
        realEstateCommissionPercentage: "3",
        landDeveloperProfitPercentage: "15",
        costToDevelopPerLot: "40,000",


    },
    [EPageNames.MULTIFAMILY_DEVELOPMENT]: {
        ...DEFAULT_VALUES_ZEROS,
        grossAcres: "0.25",
        unbuildableAcres: "0",
        numberOfUnits: "4",
        numberOfFloors: "2",
        maxImperviousSurfaceRatio: "60",
        commonSpacePercentage: "0",
        parkingSpotsPerUnit: "1.5",
        requiresHandicappedParking: true,
        catchAll: "1.8",
        multifamilyPricePerSqFt: "300",
        hardCostPerSqFt: "135",
        permits: "12,000",
        miscCosts: "7,500",
        builderProfitPercentage: "20",
        realEstateCommissionPercentage: "3",
        landDeveloperProfitPercentage: "15",
        costToDevelopPerUnit: "40,000",
    },
    [EPageNames.INDUSTRIAL_DEVELOPMENT]: {
        ...DEFAULT_VALUES_ZEROS,
        grossAcres: "0.3",
        unbuildableAcres: "0",
        numberOfFloors: "2",
        maxImperviousSurfaceRatio: "60",
        commonSpacePercentage: "40",
        parkingRatio: "2",
        catchAll: "1.8",
        buildingPricePerSqFt: "300",
        hardCostPerSqFt: "135",
        permits: "12,000",
        miscCosts: "7,500",
        homeBuilderProfitPercentage: "20",
        realEstateCommissionPercentage: "3",
        landDeveloperProfitPercentage: "15",
        costToDevelop: "40,000",
        SDCFees: "20,000",
        ownedLandCost: "0",
    },
    [EPageNames.MULTI_FAMILY_PRICE]: {
        ...DEFAULT_VALUES_ZEROS,
        rents: "1,600",
        interestRate: "8",
        numberOfYears: "25",
        cashOnCashReturn: "8",
        expensePercentage: "50",
        downPayment: "30",
        units: "4",
    },
    [EPageNames.MULTIFAMILY_ANALYSIS]: {
        ...DEFAULT_VALUES_ZEROS,
        purchasePrice: "50,000",
        units: "4",
        rentPerUnit: "1,500",
        repairPerUnit: "0",
        interestRate: "8.0",
        downPayment: "25",
        duration: "25",
        taxRate: "35",
        laundryIncome: "0",
        storageIncome: "0",
        parkingIncome: "0",
        otherIncome: "0",
        propertyTax: "1.65",
        insurance: "2.9",
        waterSewer: "4.4",
        garbage: "4.0",
        electric: "5.3",
        gas: "1",
        HOAFees: "0",
        lawnSnow: "1.15",
        vacancy: "5.0",
        repairs: "3.0",
        capEx: "4.4",
        propertyManagement: "8",

    },
    [EPageNames.IRR_CALCULATOR]: {
        ...DEFAULT_VALUES_ZEROS,
        originalPurchasePrice: "240,000",
        originalPurchaseDate: "2016-04-01",
        newPurchasePrice: "600,000",

    },
    [EPageNames.LENDING_COST]: {
        ...DEFAULT_VALUES_ZEROS,
        loanOriginationFee: "1.0",           // 1% of loan amount
        interestRate: "5.0",                 // 5% annual interest rate
        loanTerm: "360",                      // 12-month term for short-term loan or construction loan
        drawFee: "0.25",                     // 0.25% per draw
        underwritingFee: "0.5",              // 0.5% of loan amount
        inspectionFee: "300",                // Flat fee per inspection
        appraisalFee: "500",                 // Flat fee for appraisal
        titleInsurance: "0.5",               // 0.5% of loan amount
        recordingFee: "150",                 // Flat recording fee
        legalFee: "0.75",                    // 0.75% of loan amount for legal fees
        interestReserve: "10.0",             // 10% of loan amount reserved for interest payments
        prepaymentPenalty: "2.0",            // 2% of outstanding loan balance if applicable
        loanExtensionFee: "1.0",             // 1% of loan amount for extension
        discountPoints: "1.0",               // 1 point equals 1% of loan amount
        propertyValue: "1,000,000",                // Default property value for loan amount ($)
        loanToValue: "80",              // Default construction loan percentage (%)
        constructionToLongTermLoan: "75",    // Default conversion to long-term loan percentage (%)
        isInterestOnly: false,                  // Default interest-only option (unchecked)

    }
}



export const allStateVariables = [
    EAllStates.builderProfitPercentage,
    EAllStates.buildingPricePerSqFt,
    EAllStates.catchAll,
    EAllStates.commonSpacePercentage,
    EAllStates.costToDevelop,
    EAllStates.costToDevelopPerLot,
    EAllStates.costToDevelopPerUnit,
    EAllStates.grossAcres,
    EAllStates.hardCostPerSqFt,
    EAllStates.homeBuilderProfitPercentage,
    EAllStates.housePricePerSqFt,
    EAllStates.houseSize,
    EAllStates.landDeveloperProfitPercentage,
    EAllStates.maxImperviousSurfaceRatio,
    EAllStates.miscCosts,
    EAllStates.multifamilyPricePerSqFt,
    EAllStates.numberOfFloors,
    EAllStates.numberOfUnits,
    EAllStates.ownedLandCost,
    EAllStates.parkingRatio,
    EAllStates.parkingSpotsPerUnit,
    EAllStates.permits,
    EAllStates.realEstateCommissionPercentage,
    EAllStates.requiresHandicappedParking,
    EAllStates.SDCFees,
    EAllStates.sqFtPerLot,
    EAllStates.unbuildableAcres,
    EAllStates.unitsPerAcre,
]