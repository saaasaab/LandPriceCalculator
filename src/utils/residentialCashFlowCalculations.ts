import { convertInputsToNumbers, monthlyPayment } from "./utils";

type TResidentialCashFlowCalculationsInputs = {
    purchasePrice: string;
    units: string;
    rentPerUnit: string;
    repairPerUnit: string;
    downPayment: string;
    interestRate: string;
    duration: string;
    taxRate: string;
    laundryIncome: string;
    storageIncome: string;
    parkingIncome: string;
    otherIncome: string;
    propertyTax: string;
    insurance: string;
    waterSewer: string;
    garbage: string;
    electric: string;
    gas: string;
    HOAFees: string;
    lawnSnow: string;
    vacancy: string;
    repairs: string;
    capEx: string;
    propertyManagement: string;
};

type TResidentialCashFlowCalculationsOutputs = {
    rentalIncome: number;
    allInCosts: number;
    pricePerDoor: number;
    totalMonthlyIncome: number;
    operatingExpenses: number;
    netOperatingIncome: number;
    monthlyMorgagePayment: number;
    totalExpenses: number;
    totalMonthlyCashflowBeforeTaxes: number;
    taxesOwned: number;
    totalMonthlyCashflow: number;
    capRate: number;
    cashOnCashReturn: number;
    DSCR: number;
    grossRentMultiplier: number;
    totalEquity: number;
    loanConstant: number;
    loanAmount: number;
    breakevenLoanAmount: number;
};

const residentialCashFlowCalculations = (inputs: TResidentialCashFlowCalculationsInputs): TResidentialCashFlowCalculationsOutputs => {
    const {
        purchasePrice: purchasePrice,
        units: units,
        rentPerUnit: rentPerUnit,
        repairPerUnit: repairPerUnit,
        downPayment: downPayment,
        interestRate: interestRate,
        duration: duration,
        taxRate: taxRate,
        laundryIncome: laundryIncome,
        storageIncome: storageIncome,
        parkingIncome: parkingIncome,
        otherIncome: otherIncome,
        propertyTax: propertyTax,
        insurance: insurance,
        waterSewer: waterSewer,
        garbage: garbage,
        electric: electric,
        gas: gas,
        HOAFees: HOAFees,
        lawnSnow: lawnSnow,
        vacancy: vacancy,
        repairs: repairs,
        capEx: capEx,
        propertyManagement: propertyManagement
    } = convertInputsToNumbers(inputs);


    // Calculations can be added based on user inputs
    const rentalIncome = rentPerUnit * units;
    const pricePerDoor = purchasePrice / units + repairPerUnit;
    const allInCosts = purchasePrice + repairPerUnit * units;

    const totalMonthlyIncome = rentalIncome + laundryIncome + storageIncome + parkingIncome + otherIncome;

    const operatingExpenses =
        (propertyTax / 12 / 100 * allInCosts) +
        (insurance + waterSewer + garbage + electric + gas + HOAFees + lawnSnow + vacancy + repairs + capEx + propertyManagement) / 100 * totalMonthlyIncome;

    const netOperatingIncome = totalMonthlyIncome - operatingExpenses
    const totalBorrowed = allInCosts * (1 - downPayment / 100);
    const monthlyMorgagePayment = monthlyPayment(totalBorrowed, duration * 12, interestRate / 100 / 12)
    const totalExpenses = operatingExpenses + monthlyMorgagePayment;
    const DSCR = netOperatingIncome / monthlyMorgagePayment;

    const totalMonthlyCashflowBeforeTaxes = totalMonthlyIncome - operatingExpenses - monthlyMorgagePayment;
    const taxesOwned = totalMonthlyCashflowBeforeTaxes * taxRate / 100;
    const totalMonthlyCashflow = totalMonthlyCashflowBeforeTaxes - taxesOwned;



    const cashOnCashReturn = (totalMonthlyCashflow * 12) / (downPayment / 100 * allInCosts)
    const grossRentMultiplier = allInCosts / (totalMonthlyIncome * 12);


    const loanAmount = (1 - downPayment / 100) * allInCosts;
    const totalEquity = allInCosts - loanAmount

    const capRate = netOperatingIncome * 12 / allInCosts * 100;
    const loanConstant = monthlyMorgagePayment * 12 / loanAmount;
    const breakevenLoanAmount = (netOperatingIncome * 12) / loanConstant;



    return {
        rentalIncome,
        allInCosts,
        pricePerDoor,
        totalMonthlyIncome,
        operatingExpenses,
        netOperatingIncome,
        monthlyMorgagePayment,
        totalExpenses,
        totalMonthlyCashflowBeforeTaxes,
        taxesOwned,
        totalMonthlyCashflow,
        capRate,
        cashOnCashReturn,
        DSCR,
        grossRentMultiplier,
        totalEquity,
        loanConstant,
        loanAmount,
        breakevenLoanAmount
    };
};

export default residentialCashFlowCalculations;
