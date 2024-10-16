import { useState } from 'react';
import DynamicRow from '../components/DynamicRow';
import { decimalToPercentage, monthlyPayment, roundAndLocalString } from '../utils';

import './DynamicTable.scss';


const RealEstateTable = ({ isMobile }: { isMobile: boolean }) => {
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [units, setUnits] = useState(4);
  const [rentPerUnit, setRentPerUnit] = useState(1500);
  const [repairPerUnit, setRepairPerUnit] = useState(0);
  const [downPayment, setDownPayment] = useState(30);
  const [interestRate, setInterestRate] = useState(8.0);
  const [duration, setDuration] = useState(25);
  const [taxRate, setTaxRate] = useState(35)
  // const [yearsHeld, setYearsHeld] = useState(5);
  // const [futureSalePrice, setFutureSalePrice] = useState(750000)
  const [laundryIncome, setLaundryIncome] = useState(0);
  const [storageIncome, setStorageIncome] = useState(0);
  const [parkingIncome, setParkingIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);

  const [propertyTax, setPropertyTax] = useState(1.65);
  const [insurance, setInsurance] = useState(2.9);
  const [waterSewer, setWaterSewer] = useState(4.4);
  const [garbage, setGarbage] = useState(4.0);
  const [electric, setElectric] = useState(5.3);
  const [gas, setGas] = useState(1);
  const [HOAFees, setHOAFees] = useState(0);
  const [lawnSnow, setLawnSnow] = useState(1.15);
  const [vacancy, setVacancy] = useState(5.0);
  const [repairs, setRepairs] = useState(3.0);
  const [capEx, setCapEx] = useState(4.4);
  const [propertyManagement, setPropertyManagement] = useState(8.0);

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



    </div >

  );
};

export default RealEstateTable;
