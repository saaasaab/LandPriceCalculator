import DynamicRow from '../components/RowTypes/DynamicRow';
import ShareButton from '../components/ShareButton';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { DEFAULT_VALUES } from '../utils/constants';
import { EPageNames, EAllStates } from '../utils/types';
import { roundAndLocalString, convertInputsToNumbers, roundToDecimal } from '../utils/utils';


const HardMoneyLoanCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

  const queryParams = new URLSearchParams(window.location.search)


  const [arv, setArv] = usePersistedState2(page, EAllStates.arv, DEFAULT_VALUES[page].arv, queryParams);
  const [purchaseAndRepairCosts, setPurchaseAndRepairCosts] = usePersistedState2(page, EAllStates.purchaseAndRepairCosts, DEFAULT_VALUES[page].purchaseAndRepairCosts, queryParams);
  const [projectMonths, setProjectMonths] = usePersistedState2(page, EAllStates.projectMonths, DEFAULT_VALUES[page].projectMonths, queryParams);
  const [hardMoneyLoanLtv, setHardMoneyLoanLtv] = usePersistedState2(page, EAllStates.hardMoneyLoanLtv, DEFAULT_VALUES[page].hardMoneyLoanLtv, queryParams);
  const [hardMoneyLoanPoints, setHardMoneyLoanPoints] = usePersistedState2(page, EAllStates.hardMoneyLoanPoints, DEFAULT_VALUES[page].hardMoneyLoanPoints, queryParams);
  const [hardMoneyLoanInterestRate, setHardMoneyLoanInterestRate] = usePersistedState2(page, EAllStates.hardMoneyLoanInterestRate, DEFAULT_VALUES[page].hardMoneyLoanInterestRate, queryParams);
  const [hardMoneyLoanAdminFees, setHardMoneyLoanAdminFees] = usePersistedState2(page, EAllStates.hardMoneyLoanAdminFees, DEFAULT_VALUES[page].hardMoneyLoanAdminFees, queryParams);

  const [gapPoints, setGapPoints] = usePersistedState2(page, EAllStates.gapPoints, DEFAULT_VALUES[page].gapPoints, queryParams);
  const [gapInterestRate, setGapInterestRate] = usePersistedState2(page, EAllStates.gapInterestRate, DEFAULT_VALUES[page].gapInterestRate, queryParams);
  const [gapLoanAdminFees, setGapLoanAdminFees] = usePersistedState2(page, EAllStates.gapLoanAdminFees, DEFAULT_VALUES[page].gapLoanAdminFees, queryParams);


  const params: {
    arv: string;
    purchaseAndRepairCosts: string;
    projectMonths: string;
    hardMoneyLoanLtv: string;
    hardMoneyLoanPoints: string;
    hardMoneyLoanInterestRate: string;
    gapPoints: string;
    gapInterestRate: string;
    hardMoneyLoanAdminFees: string;
    gapLoanAdminFees: string;
  } = {
    arv: arv,
    purchaseAndRepairCosts: purchaseAndRepairCosts,
    projectMonths: projectMonths,
    hardMoneyLoanLtv: hardMoneyLoanLtv,
    hardMoneyLoanPoints: hardMoneyLoanPoints,
    hardMoneyLoanInterestRate: hardMoneyLoanInterestRate,
    gapPoints: gapPoints,
    gapInterestRate: gapInterestRate,
    hardMoneyLoanAdminFees: hardMoneyLoanAdminFees,
    gapLoanAdminFees: gapLoanAdminFees,
  };



  const {
    arv: _arv,
    purchaseAndRepairCosts: _purchaseAndRepairCosts,
    projectMonths: _projectMonths,
    hardMoneyLoanLtv: _hardMoneyLoanLtv,
    hardMoneyLoanPoints: _hardMoneyLoanPoints,
    hardMoneyLoanInterestRate: _hardMoneyLoanInterestRate,

    gapPoints: _gapPoints,
    gapInterestRate: _gapInterestRate,

    hardMoneyLoanAdminFees: _hardMoneyLoanAdminFees,
    gapLoanAdminFees: _gapLoanAdminFees,
  }
    = convertInputsToNumbers(params)

  // HML
  const hardMoneyLoanAmount = (_purchaseAndRepairCosts) * _hardMoneyLoanLtv / 100;
  const hardMoneyLoanPointsAmount = _hardMoneyLoanPoints * hardMoneyLoanAmount / 100
  const hardMoneyLoanTotalInterest = _projectMonths / 12 * hardMoneyLoanAmount * _hardMoneyLoanInterestRate / 100;
  const hardMoneyLoanTotalFees = hardMoneyLoanTotalInterest + _hardMoneyLoanAdminFees
  const hardMoneyLoanROI = hardMoneyLoanTotalFees / hardMoneyLoanAmount * 100;


  // Gap Financing
  const downPayment = (_purchaseAndRepairCosts) * (1 - _hardMoneyLoanLtv / 100);
  const gapLoanAmount = downPayment + hardMoneyLoanTotalFees;
  const gapPointsAmount = gapLoanAmount * _gapPoints / 100;
  const gapInterestAmount = _projectMonths / 12 * gapLoanAmount * _gapInterestRate / 100;
  const gapTotalFees = gapInterestAmount + gapPointsAmount + _gapLoanAdminFees;
  const gapLoanROI = gapTotalFees / gapLoanAmount * 100



  const totalLoanCosts = gapTotalFees + hardMoneyLoanTotalFees
  const totalProjectCosts = totalLoanCosts + _purchaseAndRepairCosts

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
          setInput={value => setPurchaseAndRepairCosts(value)}
          cellValues={["Purchase and repair Costs ($)", purchaseAndRepairCosts]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setArv(value)}
          cellValues={["After Repair Value ($)", arv]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setProjectMonths(value)}
          cellValues={["Project Months", projectMonths]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          cellValues={["Total Loan Costs ($)", roundAndLocalString(totalLoanCosts)]}
          isMobile={isMobile}
          numberOfCells={2}
        />



        <DynamicRow
          cellValues={["Total Project Costs to ARV (%)", roundToDecimal(totalProjectCosts / _arv * 100, 1) + "%"]}
          isMobile={isMobile}
          numberOfCells={2}
        />

        <DynamicRow
          cellValues={["Total Project Costs ($)", roundAndLocalString(totalProjectCosts)]}
          isMobile={isMobile}
          numberOfCells={2}
          output
        />




      </div>

      <div className="tables-container" >
        <div className="table-container">

          <DynamicRow
            cellValues={["Hard Money Loan"]}
            isMobile={isMobile}
            numberOfCells={1}
            inputCellIndex={-1}
            header={true}
          />




          <DynamicRow
            setInput={value => setHardMoneyLoanLtv(value)}
            cellValues={["HML to Value (%)", hardMoneyLoanLtv]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />
          <DynamicRow
            setInput={value => setHardMoneyLoanInterestRate(value)}
            cellValues={["HML Interest Rate (%)", hardMoneyLoanInterestRate]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setHardMoneyLoanPoints(value)}
            cellValues={["HML Points (%)", hardMoneyLoanPoints]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />



          <DynamicRow
            cellValues={["HML Loan Amount ($)", roundAndLocalString(hardMoneyLoanAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            cellValues={["HML Loan Points Amount ($)", roundAndLocalString(hardMoneyLoanPointsAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />
          <DynamicRow
            cellValues={["HML Total Interest ($)", roundAndLocalString(hardMoneyLoanTotalInterest)]}
            isMobile={isMobile}
            numberOfCells={2}
          />





          <DynamicRow
            setInput={value => setHardMoneyLoanAdminFees(value)}
            cellValues={["HML Admin Fees(%)", hardMoneyLoanAdminFees]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />



          <DynamicRow
            cellValues={["HML Total Fees ($)", roundAndLocalString(hardMoneyLoanTotalFees)]}
            isMobile={isMobile}
            numberOfCells={2}
          />





          <DynamicRow
            cellValues={["HML ROI Total (%)", roundToDecimal(hardMoneyLoanROI) + "%"]}
            description="Total Return for the hard money lender"
            isMobile={isMobile}
            numberOfCells={2}

            output={true}
          />
        </div>
        <div className="table-container">
          <DynamicRow
            cellValues={["Gap Funding"]}
            isMobile={isMobile}
            numberOfCells={4}
            inputCellIndex={-1}
            header={true}
          />


          <DynamicRow
            cellValues={["Down Payment ($)", roundAndLocalString(downPayment)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            setInput={value => setGapPoints(value)}
            cellValues={["Gap Points (%)", gapPoints + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />

          <DynamicRow
            setInput={value => setGapInterestRate(value)}
            cellValues={["Gap Interest Rate (%)", gapInterestRate + "%"]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />



          <DynamicRow
            cellValues={["Gap Loan Amount ($)", roundAndLocalString(gapLoanAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />
          <DynamicRow
            cellValues={["Gap Points Amount ($)", roundAndLocalString(gapPointsAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />
          <DynamicRow
            cellValues={["Gap Interest Amount ($)", roundAndLocalString(gapInterestAmount)]}
            isMobile={isMobile}
            numberOfCells={2}
          />

          <DynamicRow
            setInput={value => setGapLoanAdminFees(value)}
            cellValues={["Gap Loan Admin Fees(%)", gapLoanAdminFees]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />
          <DynamicRow
            cellValues={["Gap Total Fees ($)", roundAndLocalString(gapTotalFees)]}
            isMobile={isMobile}
            numberOfCells={2}
          />


          <DynamicRow
            cellValues={["Gap ROI Total (%)", roundToDecimal(gapLoanROI) + "%"]}
            description="Total Return for the gap lender"
            isMobile={isMobile}
            numberOfCells={2}

            output={true}
          />
        </div>

      </div>



      <ShareButton params={params} />

    </>
  );
};

export default HardMoneyLoanCalculator;