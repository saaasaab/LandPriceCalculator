import DynamicRow from '../components/DynamicRow';
import { convertToPercent, decimalToPercentage, removeCommas, roundAndLocalString } from '../utils/utils';

import './DynamicTable.scss';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import residentialCashFlowCalculations from '../utils/residentialCashFlowCalculations';
import ShareButton from '../components/ShareButton';


const ResidentialCashFlowCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

  const queryParams = new URLSearchParams(window.location.search)

  const [purchasePrice, setPurchasePrice] = usePersistedState2(page, EAllStates.purchasePrice, DEFAULT_VALUES[page].purchasePrice, queryParams);
  const [units, setUnits] = usePersistedState2(page, EAllStates.units, DEFAULT_VALUES[page].units, queryParams);
  const [rentPerUnit, setRentPerUnit] = usePersistedState2(page, EAllStates.rentPerUnit, DEFAULT_VALUES[page].rentPerUnit, queryParams);
  const [repairPerUnit, setRepairPerUnit] = usePersistedState2(page, EAllStates.repairPerUnit, DEFAULT_VALUES[page].repairPerUnit, queryParams);
  const [downPayment, setDownPayment] = usePersistedState2(page, EAllStates.downPayment, DEFAULT_VALUES[page].downPayment, queryParams);
  const [interestRate, setInterestRate] = usePersistedState2(page, EAllStates.interestRate, DEFAULT_VALUES[page].interestRate, queryParams);
  const [duration, setDuration] = usePersistedState2(page, EAllStates.duration, DEFAULT_VALUES[page].duration, queryParams);
  const [taxRate, setTaxRate] = usePersistedState2(page, EAllStates.taxRate, DEFAULT_VALUES[page].taxRate, queryParams);
  const [laundryIncome, setLaundryIncome] = usePersistedState2(page, EAllStates.laundryIncome, DEFAULT_VALUES[page].laundryIncome, queryParams);
  const [storageIncome, setStorageIncome] = usePersistedState2(page, EAllStates.storageIncome, DEFAULT_VALUES[page].storageIncome, queryParams);
  const [parkingIncome, setParkingIncome] = usePersistedState2(page, EAllStates.parkingIncome, DEFAULT_VALUES[page].parkingIncome, queryParams);
  const [otherIncome, setOtherIncome] = usePersistedState2(page, EAllStates.otherIncome, DEFAULT_VALUES[page].otherIncome, queryParams);
  const [propertyTax, setPropertyTax] = usePersistedState2(page, EAllStates.propertyTax, DEFAULT_VALUES[page].propertyTax, queryParams);
  const [insurance, setInsurance] = usePersistedState2(page, EAllStates.insurance, DEFAULT_VALUES[page].insurance, queryParams);
  const [waterSewer, setWaterSewer] = usePersistedState2(page, EAllStates.waterSewer, DEFAULT_VALUES[page].waterSewer, queryParams);
  const [garbage, setGarbage] = usePersistedState2(page, EAllStates.garbage, DEFAULT_VALUES[page].garbage, queryParams);
  const [electric, setElectric] = usePersistedState2(page, EAllStates.electric, DEFAULT_VALUES[page].electric, queryParams);
  const [gas, setGas] = usePersistedState2(page, EAllStates.gas, DEFAULT_VALUES[page].gas, queryParams);
  const [HOAFees, setHOAFees] = usePersistedState2(page, EAllStates.HOAFees, DEFAULT_VALUES[page].HOAFees, queryParams);
  const [lawnSnow, setLawnSnow] = usePersistedState2(page, EAllStates.lawnSnow, DEFAULT_VALUES[page].lawnSnow, queryParams);
  const [vacancy, setVacancy] = usePersistedState2(page, EAllStates.vacancy, DEFAULT_VALUES[page].vacancy, queryParams);
  const [repairs, setRepairs] = usePersistedState2(page, EAllStates.repairs, DEFAULT_VALUES[page].repairs, queryParams);
  const [capEx, setCapEx] = usePersistedState2(page, EAllStates.capEx, DEFAULT_VALUES[page].capEx, queryParams);
  const [propertyManagement, setPropertyManagement] = usePersistedState2(page, EAllStates.propertyManagement, DEFAULT_VALUES[page].propertyManagement, queryParams);


  

  const params: {
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

  const {
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
  } = residentialCashFlowCalculations(params)




  const calculate4CellPercentageInput = (title: string, value: string, denometer: string | number) => {
    return [
      title,
      value,
      Math.round(removeCommas(value) / 100 * removeCommas(denometer.toString())).toLocaleString(),
      Math.round(removeCommas(value) / 100 * removeCommas(denometer.toString()) * 12).toLocaleString()]
  }



  return (

    <>

      <div className="table-container">
        <DynamicRow
          cellValues={["Property Details"]}
          isMobile={isMobile}
          numberOfCells={1}
          inputCellIndex={-1}
          header={true}
        />
        <DynamicRow
          setInput={value => setPurchasePrice(value)}
          cellValues={["Purchase Price ($)", purchasePrice]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setUnits(value)}
          cellValues={["Total Number of Units (#)", units]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setRentPerUnit(value)}
          cellValues={["Rent per Unit per month ($)", rentPerUnit]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setRepairPerUnit(value)}
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
          setInput={value => setDownPayment(value)}
          cellValues={["Down Payment (%)", downPayment]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />


        <DynamicRow
          setInput={value => setInterestRate(value)}
          cellValues={["Interest Rate (%)", interestRate]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setDuration(value)}
          cellValues={["Duration of loan (years)", duration]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setTaxRate(value)}
          cellValues={["Tax rate (%)", taxRate]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />
        {/* 
        <DynamicRow
          setInput={value=> setYearsHeld(value)}
          cellValues={["Years Held (years)", yearsHeld]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value=> setFutureSalePrice(value)}
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
            setInput={value => setLaundryIncome(value)}
            cellValues={["Laundry Income($)", decimalToPercentage(removeCommas(laundryIncome) / totalMonthlyIncome), roundAndLocalString(removeCommas(laundryIncome)), roundAndLocalString(removeCommas(laundryIncome) * 12)]}
            description="Total laundry income from onsite laundry facilities"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />

          <DynamicRow
            setInput={value => setStorageIncome(value)}
            cellValues={["Storage Income($)", decimalToPercentage(removeCommas(storageIncome) / totalMonthlyIncome), roundAndLocalString(removeCommas(storageIncome)), roundAndLocalString(removeCommas(storageIncome) * 12)]}
            description="Total income from onsite storage facilities"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />
          <DynamicRow
            setInput={value => setParkingIncome(value)}
            cellValues={["Parking Income($)", decimalToPercentage(removeCommas(parkingIncome) / totalMonthlyIncome), roundAndLocalString(removeCommas(parkingIncome)), roundAndLocalString(removeCommas(parkingIncome) * 12)]}
            description="Total income from onsite parking"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />
          <DynamicRow
            setInput={value => setOtherIncome(value)}
            cellValues={["Other Income($)", decimalToPercentage(removeCommas(otherIncome) / totalMonthlyIncome), roundAndLocalString(removeCommas(otherIncome)), roundAndLocalString(removeCommas(otherIncome) * 12)]}
            description="Total other income sources for this property"
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={2}
          />

          <DynamicRow
            setInput={value => setOtherIncome(value)}
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
            setInput={value => setPropertyTax(value)}
            cellValues={
              [
                "Property Tax (%)",
                propertyTax,
                Math.round(removeCommas(propertyTax) / 12 / 100 * allInCosts).toLocaleString(),
                Math.round(removeCommas(propertyTax) / 12 / 100 * allInCosts * 12).toLocaleString()
              ]}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}


          />
          <DynamicRow
            setInput={value => setInsurance(value)}
            cellValues={calculate4CellPercentageInput("Insurance (%)", insurance, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />
          <DynamicRow
            setInput={value => setWaterSewer(value)}
            cellValues={calculate4CellPercentageInput("Utilities: Water/Sewer (%)", waterSewer, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setGarbage(value)}
            cellValues={calculate4CellPercentageInput("Utilities: Garbage (%)", garbage, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setElectric(value)}
            cellValues={calculate4CellPercentageInput("Utilities: Electric (%)", electric, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setGas(value)}
            cellValues={calculate4CellPercentageInput("Utilities: Gas (%)", gas, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setHOAFees(value)}
            cellValues={calculate4CellPercentageInput("HOA Fees (%)", HOAFees, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setLawnSnow(value)}
            cellValues={calculate4CellPercentageInput("Lawn and Snow (%)", lawnSnow, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setVacancy(value)}
            cellValues={calculate4CellPercentageInput("Vacancy (%)", vacancy, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setRepairs(value)}
            cellValues={calculate4CellPercentageInput("repairs (%)", repairs, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setCapEx(value)}
            cellValues={calculate4CellPercentageInput("Capital Expenditures (%)", capEx, totalMonthlyIncome)}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setPropertyManagement(value)}
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
            setInput={value => setOtherIncome(value)}
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
            cellValues={["Cap Rate", convertToPercent(capRate)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Cash On Cash Return (COC)", (cashOnCashReturn * 100).toFixed(1) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Debt Service Coverage Ratio (DSCR)", DSCR.toFixed(1) + "X"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Gross Rent Multiplier (GRM)", (grossRentMultiplier).toFixed(1) + "X"]}
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
            cellValues={["Loan Constant", (loanConstant * 100).toFixed(1) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Loan to value (LTV)	", (loanAmount / removeCommas(purchasePrice) * 100).toFixed(1) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Loan to cost (LTC)", (loanAmount / allInCosts * 100).toFixed(1) + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Breakeven Loan Value", roundAndLocalString(breakevenLoanAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["Return on Equity (ROE)", ((totalMonthlyCashflow * 12) / totalEquity * 100).toFixed(1) + "%"]}
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


      
      <ShareButton params={params}/>

    </>
  );
};

export default ResidentialCashFlowCalculator;
