import { useState } from 'react';
import DynamicRow from '../components/DynamicRow';
import { copyToClipboard, decimalToPercentage, getQueryParamNumber, monthlyPayment, roundAndLocalString } from '../utils';

import './DynamicTable.scss';
import { usePersistedState } from '../hooks/usePersistedState';

const PAGE = "RESIDENTIAL_CASH_FLOW"
const RealEstateTable = ({ isMobile }: { isMobile: boolean }) => {

  const queryParams = new URLSearchParams(window.location.search)


  // Query param searches with underscores
  const _purchasePrice = getQueryParamNumber("purchasePrice", queryParams);
  const _units = getQueryParamNumber("units", queryParams);
  const _rentPerUnit = getQueryParamNumber("rentPerUnit", queryParams);
  const _repairPerUnit = getQueryParamNumber("repairPerUnit", queryParams);
  const _downPayment = getQueryParamNumber("downPayment", queryParams);
  const _interestRate = getQueryParamNumber("interestRate", queryParams);
  const _duration = getQueryParamNumber("duration", queryParams);
  const _taxRate = getQueryParamNumber("taxRate", queryParams);
  const _laundryIncome = getQueryParamNumber("laundryIncome", queryParams);
  const _storageIncome = getQueryParamNumber("storageIncome", queryParams);
  const _parkingIncome = getQueryParamNumber("parkingIncome", queryParams);
  const _otherIncome = getQueryParamNumber("otherIncome", queryParams);

  const _propertyTax = getQueryParamNumber("propertyTax", queryParams);
  const _insurance = getQueryParamNumber("insurance", queryParams);
  const _waterSewer = getQueryParamNumber("waterSewer", queryParams);
  const _garbage = getQueryParamNumber("garbage", queryParams);
  const _electric = getQueryParamNumber("electric", queryParams);
  const _gas = getQueryParamNumber("gas", queryParams);
  const _HOAFees = getQueryParamNumber("HOAFees", queryParams);
  const _lawnSnow = getQueryParamNumber("lawnSnow", queryParams);
  const _vacancy = getQueryParamNumber("vacancy", queryParams);
  const _repairs = getQueryParamNumber("repairs", queryParams);
  const _capEx = getQueryParamNumber("capEx", queryParams);
  const _propertyManagement = getQueryParamNumber("propertyManagement", queryParams);


  const [purchasePrice, setPurchasePrice] = usePersistedState(PAGE, 'purchasePrice', 500000, _purchasePrice);
  const [units, setUnits] = usePersistedState(PAGE, 'units', 4, _units);
  const [rentPerUnit, setRentPerUnit] = usePersistedState(PAGE, 'rentPerUnit', 1500, _rentPerUnit);
  const [repairPerUnit, setRepairPerUnit] = usePersistedState(PAGE, 'repairPerUnit', 0, _repairPerUnit);
  const [downPayment, setDownPayment] = usePersistedState(PAGE, 'downPayment', 30, _downPayment);
  const [interestRate, setInterestRate] = usePersistedState(PAGE, 'interestRate', 8.0, _interestRate);
  const [duration, setDuration] = usePersistedState(PAGE, 'duration', 25, _duration);
  const [taxRate, setTaxRate] = usePersistedState(PAGE, 'taxRate', 35, _taxRate);
  const [laundryIncome, setLaundryIncome] = usePersistedState(PAGE, 'laundryIncome', 0, _laundryIncome);
  const [storageIncome, setStorageIncome] = usePersistedState(PAGE, 'storageIncome', 0, _storageIncome);
  const [parkingIncome, setParkingIncome] = usePersistedState(PAGE, 'parkingIncome', 0, _parkingIncome);
  const [otherIncome, setOtherIncome] = usePersistedState(PAGE, 'otherIncome', 0, _otherIncome);

  const [propertyTax, setPropertyTax] = usePersistedState(PAGE, 'propertyTax', 1.65, _propertyTax);
  const [insurance, setInsurance] = usePersistedState(PAGE, 'insurance', 2.9, _insurance);
  const [waterSewer, setWaterSewer] = usePersistedState(PAGE, 'waterSewer', 4.4, _waterSewer);
  const [garbage, setGarbage] = usePersistedState(PAGE, 'garbage', 4.0, _garbage);
  const [electric, setElectric] = usePersistedState(PAGE, 'electric', 5.3, _electric);
  const [gas, setGas] = usePersistedState(PAGE, 'gas', 1, _gas);
  const [HOAFees, setHOAFees] = usePersistedState(PAGE, 'HOAFees', 0, _HOAFees);
  const [lawnSnow, setLawnSnow] = usePersistedState(PAGE, 'lawnSnow', 1.15, _lawnSnow);
  const [vacancy, setVacancy] = usePersistedState(PAGE, 'vacancy', 5.0, _vacancy);
  const [repairs, setRepairs] = usePersistedState(PAGE, 'repairs', 3.0, _repairs);
  const [capEx, setCapEx] = usePersistedState(PAGE, 'capEx', 4.4, _capEx);
  const [propertyManagement, setPropertyManagement] = usePersistedState(PAGE, 'propertyManagement', 8.0, _propertyManagement);

  const [copied, setCopied] = useState(false);

  const params: {
    purchasePrice: number;
    units: number;
    rentPerUnit: number;
    repairPerUnit: number;
    downPayment: number;
    interestRate: number;
    duration: number;
    taxRate: number;
    laundryIncome: number;
    storageIncome: number;
    parkingIncome: number;
    otherIncome: number;
    propertyTax: number;
    insurance: number;
    waterSewer: number;
    garbage: number;
    electric: number;
    gas: number;
    HOAFees: number;
    lawnSnow: number;
    vacancy: number;
    repairs: number;
    capEx: number;
    propertyManagement: number;
  } = {
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
  };



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


  const calculate4CellPercentageInput = (title: string, value: number, denometer: number) => {
    return [
      title,
      value,
      Math.round(value / 100 * denometer).toLocaleString(),
      Math.round(value / 100 * denometer * 12).toLocaleString()]
  }



  return (

    <div className="land-calculator">
      <header className="app-header">
        <h1>Multifamily Cashflow Calculator</h1>
      </header>

      <div className="table-container">
        <DynamicRow
          cellValues={["Property Details"]}
          isMobile={isMobile}
          numberOfCells={1}
          inputCellIndex={-1}
          header={true}
        />
        <DynamicRow
          setInput={event => setPurchasePrice(Number(event.target.value))}
          cellValues={["Purchase Price ($)", purchasePrice]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={event => setUnits(Number(event.target.value))}
          cellValues={["Total Number of Units (#)", units]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={event => setRentPerUnit(Number(event.target.value))}
          cellValues={["Rent per Unit per month ($)", rentPerUnit]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={event => setRepairPerUnit(Number(event.target.value))}
          cellValues={["Repairs per unit ($)", repairPerUnit]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          cellValues={["All in costs", roundAndLocalString(allInCosts)]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />


        <DynamicRow
          cellValues={['Price per door', roundAndLocalString(pricePerDoor)]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        <DynamicRow
          setInput={event => setDownPayment(Number(event.target.value))}
          cellValues={["Down Payment (%)", downPayment]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />


        <DynamicRow
          setInput={event => setInterestRate(Number(event.target.value))}
          cellValues={["Interest Rate (%)", interestRate]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={event => setDuration(Number(event.target.value))}
          cellValues={["Duration of loan (years)", duration]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={event => setTaxRate(Number(event.target.value))}
          cellValues={["Tax rate (%)", taxRate]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        {/* 
        <DynamicRow
          setInput={event => setYearsHeld(Number(event.target.value))}
          cellValues={["Years Held (years)", yearsHeld]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={event => setFutureSalePrice(Number(event.target.value))}
          cellValues={["Expected Sale price ($)", futureSalePrice]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        /> */}

      </div>

      <div className="tables-container" >
        <div className="table-container">

          <DynamicRow
            cellValues={["1. Income", "%", "Monthly", "Annually"]}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={-1}
            header={true}
          />

          <DynamicRow
            cellValues={["Rental Income ($)", decimalToPercentage(rentalIncome / totalMonthlyIncome), roundAndLocalString(rentalIncome), roundAndLocalString(rentalIncome * 12)]}
            description="Total rental income from the rates from leases"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={-1}
          />
          <DynamicRow
            setInput={event => setLaundryIncome(Number(event.target.value))}
            cellValues={["Laundry Income($)", decimalToPercentage(laundryIncome / totalMonthlyIncome), roundAndLocalString(laundryIncome), roundAndLocalString(laundryIncome * 12)]}
            description="Total laundry income from onsite laundry facilities"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />

          <DynamicRow
            setInput={event => setStorageIncome(Number(event.target.value))}
            cellValues={["Storage Income($)", decimalToPercentage(storageIncome / totalMonthlyIncome), roundAndLocalString(storageIncome), roundAndLocalString(storageIncome * 12)]}
            description="Total income from onsite storage facilities"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />
          <DynamicRow
            setInput={event => setParkingIncome(Number(event.target.value))}
            cellValues={["Parking Income($)", decimalToPercentage(parkingIncome / totalMonthlyIncome), roundAndLocalString(parkingIncome), roundAndLocalString(parkingIncome * 12)]}
            description="Total income from onsite parking"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />
          <DynamicRow
            setInput={event => setOtherIncome(Number(event.target.value))}
            cellValues={["Other Income($)", decimalToPercentage(otherIncome / totalMonthlyIncome), roundAndLocalString(otherIncome), roundAndLocalString(otherIncome * 12)]}
            description="Total other income sources for this property"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />

          <DynamicRow
            setInput={event => setOtherIncome(Number(event.target.value))}
            cellValues={["Total Income", Math.round(totalMonthlyIncome).toLocaleString(), Math.round(totalMonthlyIncome * 12).toLocaleString()]}
            description="Total other income sources for this property"
            isMobile={isMobile}
            numberOfCells={3}

            output={true}
          />
        </div>
        <div className="table-container">
          <DynamicRow
            cellValues={["2. Expenses", "%", "Monthly", "Annually"]}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={-1}
            header={true}
          />
          <DynamicRow
            setInput={event => setPropertyTax(Number(event.target.value))}
            cellValues={
              [
                "Property Tax (%)",
                propertyTax,
                Math.round(propertyTax / 12 / 100 * allInCosts).toLocaleString(),
                Math.round(propertyTax / 12 / 100 * allInCosts * 12).toLocaleString()
              ]}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}


          />
          <DynamicRow
            setInput={event => setInsurance(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Insurance (%)", insurance, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />
          <DynamicRow
            setInput={event => setWaterSewer(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Utilities: Water/Sewer (%)", waterSewer, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setGarbage(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Utilities: Garbage (%)", garbage, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setElectric(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Utilities: Electric (%)", electric, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setGas(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Utilities: Gas (%)", gas, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setHOAFees(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("HOA Fees (%)", HOAFees, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setLawnSnow(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Lawn and Snow (%)", lawnSnow, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setVacancy(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Vacancy (%)", vacancy, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setRepairs(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("repairs (%)", repairs, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setCapEx(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Capital Expenditures (%)", capEx, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={event => setPropertyManagement(Number(event.target.value))}
            cellValues={calculate4CellPercentageInput("Property Management", propertyManagement, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />





          <DynamicRow
            cellValues={[
              "Operating Expenses",
              Math.round(operatingExpenses / totalMonthlyIncome * 100) + "%",
              Math.round(operatingExpenses).toLocaleString(),
              Math.round(operatingExpenses * 12).toLocaleString(),]}
            isMobile={isMobile}
            numberOfCells={4}

          />

          <DynamicRow
            cellValues={[
              "Net Operating Income",
              Math.round(netOperatingIncome / totalMonthlyIncome * 100) + "%",
              Math.round(netOperatingIncome).toLocaleString(),
              Math.round(netOperatingIncome * 12).toLocaleString(),]}
            isMobile={isMobile}
            numberOfCells={4}

          />

          <DynamicRow
            cellValues={[
              "Morgage Payment",
              Math.round(monthlyMorgagePayment / totalMonthlyIncome * 100) + "%",
              Math.round(monthlyMorgagePayment).toLocaleString(),
              Math.round(monthlyMorgagePayment * 12).toLocaleString(),]}
            isMobile={isMobile}
            numberOfCells={4}

          />

          <DynamicRow
            setInput={event => setOtherIncome(Number(event.target.value))}
            cellValues={
              ["Total Monthly Expenses", Math.round(totalExpenses).toLocaleString(), Math.round(totalExpenses * 12).toLocaleString()]}
            description="Total expenses needed to run this property"
            isMobile={isMobile}
            numberOfCells={3}

            output={true}
          />
        </div>
        <div className="table-container">
          <DynamicRow
            cellValues={["3. Cash Flow", "Monthly", "Annually"]}
            isMobile={isMobile}
            numberOfCells={3}
            inputCellIndex={-1}
            header={true}
          />
          <DynamicRow
            cellValues={["Total Monthly Income", roundAndLocalString(totalMonthlyIncome), roundAndLocalString(totalMonthlyIncome * 12)]}
            isMobile={isMobile}
            numberOfCells={3}
          />
          <DynamicRow
            cellValues={["Operating Expenses", roundAndLocalString(operatingExpenses), roundAndLocalString(operatingExpenses * 12)]}
            isMobile={isMobile}
            numberOfCells={3}
          />
          <DynamicRow
            cellValues={["Morgage", roundAndLocalString(monthlyMorgagePayment), roundAndLocalString(monthlyMorgagePayment * 12)]}
            isMobile={isMobile}
            numberOfCells={3}
          />
          <DynamicRow
            cellValues={["Total Monthly Cashflow Before Taxes", roundAndLocalString(totalMonthlyCashflowBeforeTaxes), roundAndLocalString(totalMonthlyCashflowBeforeTaxes * 12)]}
            isMobile={isMobile}
            numberOfCells={3}
          />
          <DynamicRow
            cellValues={["Taxes owed", roundAndLocalString(taxesOwned), roundAndLocalString(taxesOwned * 12)]}
            isMobile={isMobile}
            numberOfCells={3}
          />
          <DynamicRow
            cellValues={["Total Monthly Cashflow", roundAndLocalString(totalMonthlyCashflow), roundAndLocalString(totalMonthlyCashflow * 12)]}
            isMobile={isMobile}
            numberOfCells={3}
            output={true}
          />
        </div>
        <div className="table-container">
          <DynamicRow
            cellValues={["4. Metrics and Analytics"]}
            isMobile={isMobile}
            numberOfCells={1}
            inputCellIndex={-1}
            header={true}
          />

          <DynamicRow
            cellValues={["Annual Net Operating Income (NOI)", roundAndLocalString(netOperatingIncome * 12)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Cap Rate", capRate.toFixed(2) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Cash On Cash Return (COC)", (cashOnCashReturn * 100).toFixed(2) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Debt Service Coverage Ratio (DSCR)", DSCR.toFixed(2) + "X"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Gross Rent Multiplier (GRM)", (grossRentMultiplier).toFixed(2) + "X"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Total Equity", roundAndLocalString(totalEquity)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Loan Amount", roundAndLocalString(loanAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />
          <DynamicRow
            cellValues={["Loan Constant", (loanConstant * 100).toFixed(2) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Loan to value (LTV)	", (loanAmount / purchasePrice * 100).toFixed(2) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Loan to cost (LTC)", (loanAmount / allInCosts * 100).toFixed(2) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Breakeven Loan Value", roundAndLocalString(breakevenLoanAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Return on Equity (ROE)", ((totalMonthlyCashflow * 12) / totalEquity * 100).toFixed(2) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Debt Service", roundAndLocalString(monthlyMorgagePayment * 12)]}
            isMobile={isMobile}
            numberOfCells={2}
          />


        </div>

      </div>



      <button
        onClick={() => copyToClipboard(params, setCopied)}
        className={`copy-url-button ${copied ? 'copied' : ''}`}
      >
        {copied ? 'Copied your work! Now share the link' : 'Share your work'}
      </button>

    </div >

  );
};

export default RealEstateTable;
