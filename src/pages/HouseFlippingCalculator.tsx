import { useState } from 'react';
import DynamicRow from '../components/RowTypes/DynamicRow';
import ShareButton from '../components/ShareButton';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { DEFAULT_VALUES, OutputKeys } from '../utils/constants';
import { EPageNames, EAllStates } from '../utils/types';
import { roundAndLocalString, convertInputsToNumbers, roundToDecimal, convertToPercent, removeCommas, popupBoxValues } from '../utils/utils';
import PopupBox from '../components/PopupBox';


const HouseFlippingCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

  const queryParams = new URLSearchParams(window.location.search)



  const [arv, setArv] = usePersistedState2(page, EAllStates.arv, DEFAULT_VALUES[page].arv, queryParams);
  const [purchasePrice, setPurchasePrices] = usePersistedState2(page, EAllStates.purchasePrice, DEFAULT_VALUES[page].purchasePrice, queryParams);
  const [projectMonths, setProjectMonths] = usePersistedState2(page, EAllStates.projectMonths, DEFAULT_VALUES[page].projectMonths, queryParams);

  const [closingCosts, setClosingCosts] = usePersistedState2(page, EAllStates.closingCosts, DEFAULT_VALUES[page].closingCosts, queryParams);
  const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);

  const [profitPercentage, setProfitPercentage] = usePersistedState2(page, EAllStates.profitPercentage, DEFAULT_VALUES[page].profitPercentage, queryParams);
  const [hardMoneyEquitySharePercentage, setHardMoneyEquitySharePercentage] = usePersistedState2(page, EAllStates.hardMoneyEquitySharePercentage, DEFAULT_VALUES[page].hardMoneyEquitySharePercentage, queryParams);
  const [gapEquitySharePercentage, setGapEquitySharePercentage] = usePersistedState2(page, EAllStates.gapEquitySharePercentage, DEFAULT_VALUES[page].gapEquitySharePercentage, queryParams);

  const [hardMoneyLoanLtv, setHardMoneyLoanLtv] = usePersistedState2(page, EAllStates.hardMoneyLoanLtv, DEFAULT_VALUES[page].hardMoneyLoanLtv, queryParams);
  const [hardMoneyLoanPoints, setHardMoneyLoanPoints] = usePersistedState2(page, EAllStates.hardMoneyLoanPoints, DEFAULT_VALUES[page].hardMoneyLoanPoints, queryParams);
  const [hardMoneyLoanInterestRate, setHardMoneyLoanInterestRate] = usePersistedState2(page, EAllStates.hardMoneyLoanInterestRate, DEFAULT_VALUES[page].hardMoneyLoanInterestRate, queryParams);
  const [hardMoneyLoanAdminFees, setHardMoneyLoanAdminFees] = usePersistedState2(page, EAllStates.hardMoneyLoanAdminFees, DEFAULT_VALUES[page].hardMoneyLoanAdminFees, queryParams);

  const [gapPoints, setGapPoints] = usePersistedState2(page, EAllStates.gapPoints, DEFAULT_VALUES[page].gapPoints, queryParams);
  const [gapInterestRate, setGapInterestRate] = usePersistedState2(page, EAllStates.gapInterestRate, DEFAULT_VALUES[page].gapInterestRate, queryParams);
  const [gapLoanAdminFees, setGapLoanAdminFees] = usePersistedState2(page, EAllStates.gapLoanAdminFees, DEFAULT_VALUES[page].gapLoanAdminFees, queryParams);


  const [roof, setRoof] = usePersistedState2(page, EAllStates.roof, DEFAULT_VALUES[page].roof, queryParams);
  const [concrete, setConcrete] = usePersistedState2(page, EAllStates.concrete, DEFAULT_VALUES[page].concrete, queryParams);
  const [gutters, setGutters] = usePersistedState2(page, EAllStates.gutters, DEFAULT_VALUES[page].gutters, queryParams);
  const [garage, setGarage] = usePersistedState2(page, EAllStates.garage, DEFAULT_VALUES[page].garage, queryParams);
  const [siding, setSiding] = usePersistedState2(page, EAllStates.siding, DEFAULT_VALUES[page].siding, queryParams);
  const [landscaping, setLandscaping] = usePersistedState2(page, EAllStates.landscaping, DEFAULT_VALUES[page].landscaping, queryParams);
  const [exteriorPainting, setExteriorPainting] = usePersistedState2(page, EAllStates.exteriorPainting, DEFAULT_VALUES[page].exteriorPainting, queryParams);
  const [septic, setSeptic] = usePersistedState2(page, EAllStates.septic, DEFAULT_VALUES[page].septic, queryParams);
  const [decksPorches, setDecksPorches] = usePersistedState2(page, EAllStates.decksPorches, DEFAULT_VALUES[page].decksPorches, queryParams);
  const [foundation, setFoundation] = usePersistedState2(page, EAllStates.foundation, DEFAULT_VALUES[page].foundation, queryParams);
  const [demo, setDemo] = usePersistedState2(page, EAllStates.demo, DEFAULT_VALUES[page].demo, queryParams);

  const [sheetrock, setSheetrock] = usePersistedState2(page, EAllStates.sheetrock, DEFAULT_VALUES[page].sheetrock, queryParams);
  const [plumbing, setPlumbing] = usePersistedState2(page, EAllStates.plumbing, DEFAULT_VALUES[page].plumbing, queryParams);
  const [carpentry, setCarpentry] = usePersistedState2(page, EAllStates.carpentry, DEFAULT_VALUES[page].carpentry, queryParams);
  const [windows, setWindows] = usePersistedState2(page, EAllStates.windows, DEFAULT_VALUES[page].windows, queryParams);
  const [doors, setDoors] = usePersistedState2(page, EAllStates.doors, DEFAULT_VALUES[page].doors, queryParams);
  const [electrical, setElectrical] = usePersistedState2(page, EAllStates.electrical, DEFAULT_VALUES[page].electrical, queryParams);
  const [interiorPainting, setInteriorPainting] = usePersistedState2(page, EAllStates.interiorPainting, DEFAULT_VALUES[page].interiorPainting, queryParams);
  const [hvac, setHvac] = usePersistedState2(page, EAllStates.hvac, DEFAULT_VALUES[page].hvac, queryParams);
  const [cabinets, setCabinets] = usePersistedState2(page, EAllStates.cabinets, DEFAULT_VALUES[page].cabinets, queryParams);
  const [framing, setFraming] = usePersistedState2(page, EAllStates.framing, DEFAULT_VALUES[page].framing, queryParams);
  const [flooring, setFlooring] = usePersistedState2(page, EAllStates.flooring, DEFAULT_VALUES[page].flooring, queryParams);
  const [insulation, setInsulation] = usePersistedState2(page, EAllStates.insulation, DEFAULT_VALUES[page].insulation, queryParams);

  const [permits, setPermits] = usePersistedState2(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams);
  const [termites, setTermites] = usePersistedState2(page, EAllStates.termites, DEFAULT_VALUES[page].termites, queryParams);
  const [mold, setMold] = usePersistedState2(page, EAllStates.mold, DEFAULT_VALUES[page].mold, queryParams);
  const [miscellaneous, setMiscellaneous] = usePersistedState2(page, EAllStates.miscellaneous, DEFAULT_VALUES[page].miscellaneous, queryParams);

  const [activeCards, setActiveCards] = useState<Set<OutputKeys>>(new Set([OutputKeys.TotalProfitLessEquitySplit]));

  const params: {
    arv: string;
    purchasePrice: string;
    projectMonths: string;
    hardMoneyLoanLtv: string;
    hardMoneyLoanPoints: string;
    hardMoneyLoanInterestRate: string;
    gapPoints: string;
    gapInterestRate: string;
    hardMoneyLoanAdminFees: string;
    gapLoanAdminFees: string;
    closingCosts: string;
    realEstateCommissionPercentage: string;
    roof: string;
    concrete: string;
    gutters: string;
    garage: string;
    siding: string;
    landscaping: string;
    exteriorPainting: string;
    septic: string;
    decksPorches: string;
    foundation: string;
    demo: string;
    sheetrock: string;
    plumbing: string;
    carpentry: string;
    windows: string;
    doors: string;
    electrical: string;
    interiorPainting: string;
    hvac: string;
    cabinets: string;
    framing: string;
    flooring: string;
    insulation: string;
    permits: string;
    termites: string;
    mold: string;
    miscellaneous: string;
    profitPercentage: string;
    hardMoneyEquitySharePercentage: string;
    gapEquitySharePercentage: string;
  } = {
    arv: arv,
    purchasePrice: purchasePrice,
    projectMonths: projectMonths,
    hardMoneyLoanLtv: hardMoneyLoanLtv,
    hardMoneyLoanPoints: hardMoneyLoanPoints,
    hardMoneyLoanInterestRate: hardMoneyLoanInterestRate,
    gapPoints: gapPoints,
    gapInterestRate: gapInterestRate,
    hardMoneyLoanAdminFees: hardMoneyLoanAdminFees,
    gapLoanAdminFees: gapLoanAdminFees,
    closingCosts: closingCosts,
    realEstateCommissionPercentage: realEstateCommissionPercentage,
    roof,
    concrete,
    gutters,
    garage,
    siding,
    landscaping,
    exteriorPainting,
    septic,
    decksPorches,
    foundation,
    demo,
    sheetrock,
    plumbing,
    carpentry,
    windows,
    doors,
    electrical,
    interiorPainting,
    hvac,
    cabinets,
    framing,
    flooring,
    insulation,
    permits,
    termites,
    mold,
    miscellaneous,
    profitPercentage,
    hardMoneyEquitySharePercentage,
    gapEquitySharePercentage,
  };


  const {
    arv: _arv,
    purchasePrice: _purchasePrice,
    closingCosts: _closingCosts,
    projectMonths: _projectMonths,
    hardMoneyLoanLtv: _hardMoneyLoanLtv,
    hardMoneyLoanPoints: _hardMoneyLoanPoints,
    hardMoneyLoanInterestRate: _hardMoneyLoanInterestRate,

    gapPoints: _gapPoints,
    gapInterestRate: _gapInterestRate,

    hardMoneyLoanAdminFees: _hardMoneyLoanAdminFees,
    gapLoanAdminFees: _gapLoanAdminFees,

    roof: _roof,
    concrete: _concrete,
    gutters: _gutters,
    garage: _garage,
    siding: _siding,
    landscaping: _landscaping,
    exteriorPainting: _exteriorPainting,
    septic: _septic,
    decksPorches: _decksPorches,
    foundation: _foundation,
    demo: _demo,

    sheetrock: _sheetrock,
    plumbing: _plumbing,
    carpentry: _carpentry,
    windows: _windows,
    doors: _doors,
    electrical: _electrical,
    interiorPainting: _interiorPainting,
    hvac: _hvac,
    cabinets: _cabinets,
    framing: _framing,
    flooring: _flooring,
    insulation: _insulation,

    permits: _permits,
    termites: _termites,
    mold: _mold,
    miscellaneous: _miscellaneous,
    profitPercentage: _profitPercentage,

    gapEquitySharePercentage: _gapEquitySharePercentage,
    hardMoneyEquitySharePercentage: _hardMoneyEquitySharePercentage,
    realEstateCommissionPercentage: _realEstateCommissionPercentage,

  }
    = convertInputsToNumbers(params)

  // HML
  const totalRepairCosts =
    _roof +
    _concrete +
    _gutters +
    _garage +
    _siding +
    _landscaping +
    _exteriorPainting +
    _septic +
    _decksPorches +
    _foundation +
    _demo +
    _sheetrock +
    _plumbing +
    _carpentry +
    _windows +
    _doors +
    _electrical +
    _interiorPainting +
    _hvac +
    _cabinets +
    _framing +
    _flooring +
    _insulation +
    _permits +
    _termites +
    _mold +
    _miscellaneous;



  const _purchaseAndRepairCosts = _purchasePrice + totalRepairCosts;
  const hardMoneyLoanAmount = (_purchaseAndRepairCosts) * _hardMoneyLoanLtv / 100;
  const hardMoneyLoanPointsAmount = _hardMoneyLoanPoints * hardMoneyLoanAmount / 100
  const hardMoneyLoanTotalInterest = _projectMonths / 12 * hardMoneyLoanAmount * _hardMoneyLoanInterestRate / 100;
  const hardMoneyLoanTotalFees = hardMoneyLoanTotalInterest + _hardMoneyLoanAdminFees +  hardMoneyLoanPointsAmount;


  // Gap Financing
  const downPayment = (_purchaseAndRepairCosts) * (1 - _hardMoneyLoanLtv / 100);
  const gapLoanAmount = downPayment + hardMoneyLoanTotalFees;
  const gapPointsAmount = gapLoanAmount * _gapPoints / 100;
  
  
  const gapInterestAmount = _projectMonths / 12 * gapLoanAmount * _gapInterestRate / 100;
  const gapTotalFees = gapInterestAmount + gapPointsAmount + _gapLoanAdminFees;


  const minimumProfit = _profitPercentage / 100 * _arv;


  const totalLoanCosts = gapTotalFees + hardMoneyLoanTotalFees

  const totalProjectCosts = totalLoanCosts + _purchaseAndRepairCosts + _closingCosts / 100 * _purchasePrice


  const totalProfit = _arv - totalProjectCosts - _realEstateCommissionPercentage / 100 * _arv;


  const gapEquityShareReturn = _gapEquitySharePercentage / 100 * totalProfit;
  const hardMoneyEquityShareReturn = _hardMoneyEquitySharePercentage / 100 * totalProfit;

  const hardMoneyLoanReturn = (hardMoneyLoanTotalFees + hardMoneyEquityShareReturn);
  const gapLoanReturn = (gapTotalFees + gapEquityShareReturn);


  const hardMoneyLoanROI = hardMoneyLoanReturn / hardMoneyLoanAmount * 100;
  const gapLoanROI = gapLoanReturn / gapLoanAmount * 100

  const totalProfitLessEquitySplit = totalProfit - hardMoneyEquityShareReturn - gapEquityShareReturn;


  const isDeal = totalProfitLessEquitySplit >= minimumProfit;

  const outputData: Partial<Record<OutputKeys, { title: string; value: any; value2?: any; description: string | null }>> = {
    [OutputKeys.TotalRepairCosts]: {
      title: "Total Repair Costs",
      value: roundAndLocalString(totalRepairCosts),
      description: "Total estimated repair costs for the project.",
    },
    [OutputKeys.TotalLoanCosts]: {
      title: "Total Loan Costs ($)",
      value: roundAndLocalString(totalLoanCosts),
      description: "Total cost of all loan-related expenses.",
    },
    [OutputKeys.TotalProjectCostsToARV]: {
      title: "Total Project Costs to ARV (%)",
      value: roundToDecimal(totalProjectCosts / _arv * 100, 1) + "%",
      description: "Total project cost expressed as a percentage of ARV.",
    },
    // _purchaseAndRepairCosts
    [OutputKeys.TotalProjectCosts]: {
      title: "Total Project Costs ($)",
      value: roundAndLocalString(totalProjectCosts),
      description: "The total cost of the project, including repairs and loan costs.",
    },

    [OutputKeys.HardMoneyLoanAmount]: {
      title: "HML Loan Amount ($)",
      value: roundAndLocalString(hardMoneyLoanAmount),
      description: "Total amount borrowed through the hard money loan.",
    },
    [OutputKeys.HardMoneyLoanPointsAmount]: {
      title: "HML Loan Points Amount ($)",
      value: roundAndLocalString(hardMoneyLoanPointsAmount),
      description: "Cost of loan points for the hard money loan.",
    },
    [OutputKeys.HardMoneyLoanTotalInterest]: {
      title: "HML Total Interest ($)",
      value: roundAndLocalString(hardMoneyLoanTotalInterest),
      description: "Total interest paid on the hard money loan.",
    },
    [OutputKeys.HardMoneyLoanTotalFees]: {
      title: "HML Total Fees ($)",
      value: roundAndLocalString(hardMoneyLoanTotalFees),
      description: "Total fees associated with the hard money loan.",
    },
    [OutputKeys.HardMoneyLoanROI]: {
      title: "HML ROI Total (%)",
      value: roundToDecimal(hardMoneyLoanROI) + "%",
      value2: roundToDecimal(hardMoneyLoanROI) + "%",

      description: "Total return for the hard money lender.",
    },
    [OutputKeys.DownPayment]: {
      title: "Down Payment ($)",
      value: roundAndLocalString(downPayment),
      description: "Initial cash investment required for the deal.",
    },
    [OutputKeys.GapLoanAmount]: {
      title: "Gap Loan Amount ($)",
      value: roundAndLocalString(gapLoanAmount),
      description: "Total amount borrowed through the gap loan.",
    },
    [OutputKeys.GapPointsAmount]: {
      title: "Gap Points Amount ($)",
      value: roundAndLocalString(gapPointsAmount),
      description: "Cost of loan points for the gap loan.",
    },
    [OutputKeys.GapInterestAmount]: {
      title: "Gap Interest Amount ($)",
      value: roundAndLocalString(gapInterestAmount),
      description: "Total interest paid on the gap loan.",
    },
    [OutputKeys.GapTotalFees]: {
      title: "Gap Total Fees ($)",
      value: roundAndLocalString(gapTotalFees),
      description: "Total fees associated with the gap loan.",
    },
    [OutputKeys.GapLoanROI]: {
      title: "Gap ROI Total (%)",
      value: "$" + roundAndLocalString(gapLoanReturn),
      value2: roundToDecimal(gapLoanROI) + "%",
      description: "Total return for the gap lender.",
    },
    [OutputKeys.TotalProfitLessEquitySplit]: {
      title: "Total Profit ($)",
      value: isDeal ? "Yes! Deal" : "No Deal",
      value2: roundAndLocalString(totalProfitLessEquitySplit),

      description: "Total profit the rehab yields."
    },
  };



  const popupValues = popupBoxValues(activeCards, outputData)

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
          setInput={value => setPurchasePrices(value)}
          cellValues={["Purchase Price ($)", purchasePrice]}
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
          setInput={value => setClosingCosts(value)}
          cellValues={["Closing Costs (% of purhcase price)", roundAndLocalString( removeCommas(closingCosts)/100 * _purchasePrice), closingCosts]}
          isMobile={isMobile}
          numberOfCells={3}
          inputCellIndex={2}
        />
        {/* 
        <DynamicRow
          cellValues={["Total Repair Costs", roundAndLocalString(totalRepairCosts)]}
          description="Total Repair Costs"
          isMobile={false}
          numberOfCells={2}
          setActiveCards={setActiveCards}
          activeCards={activeCards}
        /> */}


        <DynamicRow
          id={OutputKeys.TotalRepairCosts}
          cellValues={[
            outputData[OutputKeys.TotalRepairCosts]?.title,
            outputData[OutputKeys.TotalRepairCosts]?.value
          ]}
          description={outputData[OutputKeys.TotalRepairCosts]?.description}
          isMobile={false}
          numberOfCells={2}
          setActiveCards={setActiveCards}
          activeCards={activeCards}
        />



        <DynamicRow
          id={OutputKeys.TotalLoanCosts}
          cellValues={[
            outputData[OutputKeys.TotalLoanCosts]?.title,
            outputData[OutputKeys.TotalLoanCosts]?.value
          ]}
          description={outputData[OutputKeys.TotalLoanCosts]?.description}
          isMobile={isMobile}
          numberOfCells={2}
          setActiveCards={setActiveCards}
          activeCards={activeCards}
        />


        <DynamicRow
          id={OutputKeys.TotalProjectCostsToARV}
          cellValues={[
            outputData[OutputKeys.TotalProjectCostsToARV]?.title,
            outputData[OutputKeys.TotalProjectCostsToARV]?.value
          ]}
          description={outputData[OutputKeys.TotalProjectCostsToARV]?.description}
          isMobile={isMobile}
          numberOfCells={2}
          setActiveCards={setActiveCards}
          activeCards={activeCards}
        />



        <DynamicRow
          id={OutputKeys.TotalProjectCosts}
          cellValues={[
            outputData[OutputKeys.TotalProjectCosts]?.title,
            outputData[OutputKeys.TotalProjectCosts]?.value
          ]}
          description={outputData[OutputKeys.TotalProjectCosts]?.description}
          isMobile={isMobile}
          numberOfCells={2}
          setActiveCards={setActiveCards}
          activeCards={activeCards}
        />

        <DynamicRow
          setInput={value => setRealEstateCommissionPercentage(value)}
          cellValues={["Real Estate Commission (% of ARV)", realEstateCommissionPercentage]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setProfitPercentage(value)}
          cellValues={["Minimum Profit on ARV (%)", "$" + roundAndLocalString(minimumProfit), profitPercentage]}
          isMobile={isMobile}
          numberOfCells={3}
          inputCellIndex={2}
        />


        <DynamicRow
          id={OutputKeys.TotalProfitLessEquitySplit}
          cellValues={[
            outputData[OutputKeys.TotalProfitLessEquitySplit]?.title,
            outputData[OutputKeys.TotalProfitLessEquitySplit]?.value,
            outputData[OutputKeys.TotalProfitLessEquitySplit]?.value2

          ]}
          description={outputData[OutputKeys.TotalProfitLessEquitySplit]?.description}
          isMobile={isMobile}
          numberOfCells={3}
          output={true}
          setActiveCards={setActiveCards}
          activeCards={activeCards}
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
            id={OutputKeys.HardMoneyLoanAmount}
            cellValues={[
              outputData[OutputKeys.HardMoneyLoanAmount]?.title,
              outputData[OutputKeys.HardMoneyLoanAmount]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />

          <DynamicRow
            id={OutputKeys.HardMoneyLoanPointsAmount}
            cellValues={[
              outputData[OutputKeys.HardMoneyLoanPointsAmount]?.title,
              outputData[OutputKeys.HardMoneyLoanPointsAmount]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />

          <DynamicRow
            id={OutputKeys.HardMoneyLoanTotalInterest}
            cellValues={[
              outputData[OutputKeys.HardMoneyLoanTotalInterest]?.title,
              outputData[OutputKeys.HardMoneyLoanTotalInterest]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />

          <DynamicRow
            setInput={value => setHardMoneyLoanAdminFees(value)}
            cellValues={["HML Admin Fees(%)", hardMoneyLoanAdminFees]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />


          <DynamicRow
            id={OutputKeys.HardMoneyLoanTotalFees}
            cellValues={[
              outputData[OutputKeys.HardMoneyLoanTotalFees]?.title,
              outputData[OutputKeys.HardMoneyLoanTotalFees]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />
          <DynamicRow
            setInput={value => setHardMoneyEquitySharePercentage(value)}
            cellValues={["HML Profit Share (%)", "$" + roundAndLocalString(Math.max(hardMoneyEquityShareReturn, 0)), hardMoneyEquitySharePercentage]}
            isMobile={isMobile}
            numberOfCells={3}
            inputCellIndex={2}
          />

          <DynamicRow
            id={OutputKeys.HardMoneyLoanROI}
            cellValues={[
              outputData[OutputKeys.HardMoneyLoanROI]?.title,
              outputData[OutputKeys.HardMoneyLoanROI]?.value,
              outputData[OutputKeys.HardMoneyLoanROI]?.value2
            ]}
            description={outputData[OutputKeys.HardMoneyLoanROI]?.description}
            isMobile={isMobile}
            numberOfCells={3}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
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
            id={OutputKeys.DownPayment}
            cellValues={[
              outputData[OutputKeys.DownPayment]?.title,
              outputData[OutputKeys.DownPayment]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
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
            id={OutputKeys.GapLoanAmount}
            cellValues={[
              outputData[OutputKeys.GapLoanAmount]?.title,
              outputData[OutputKeys.GapLoanAmount]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />


          <DynamicRow
            id={OutputKeys.GapPointsAmount}
            cellValues={[
              outputData[OutputKeys.GapPointsAmount]?.title,
              outputData[OutputKeys.GapPointsAmount]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />

          <DynamicRow
            id={OutputKeys.GapInterestAmount}
            cellValues={[
              outputData[OutputKeys.GapInterestAmount]?.title,
              outputData[OutputKeys.GapInterestAmount]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />



          <DynamicRow
            setInput={value => setGapLoanAdminFees(value)}
            cellValues={["Gap Loan Admin Fees ($)", gapLoanAdminFees]}
            isMobile={isMobile}
            numberOfCells={2}
            inputCellIndex={1}
          />
          <DynamicRow
            id={OutputKeys.GapTotalFees}
            cellValues={[
              outputData[OutputKeys.GapTotalFees]?.title,
              outputData[OutputKeys.GapTotalFees]?.value
            ]}
            isMobile={isMobile}
            numberOfCells={2}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
          />

          <DynamicRow
            setInput={value => setGapEquitySharePercentage(value)}
            cellValues={["Gap Profit Share (%)", "$" + roundAndLocalString(Math.max(gapEquityShareReturn, 0)), gapEquitySharePercentage]}
            isMobile={isMobile}
            numberOfCells={3}
            inputCellIndex={2}
          />

          <DynamicRow
            id={OutputKeys.GapLoanROI}
            cellValues={[
              outputData[OutputKeys.GapLoanROI]?.title,
              outputData[OutputKeys.GapLoanROI]?.value,
              outputData[OutputKeys.GapLoanROI]?.value2
            ]}
            description={outputData[OutputKeys.GapLoanROI]?.description}
            isMobile={isMobile}
            numberOfCells={3}
            setActiveCards={setActiveCards}
            activeCards={activeCards}
            output={true}
          />

        </div>

      </div>


      <div className="table-container">


        <DynamicRow
          cellValues={["Exterior Repairs"]}
          isMobile={false}
          numberOfCells={1}
          header={true}
        />

        <DynamicRow
          setInput={value => setRoof(value)}
          cellValues={["Roof", convertToPercent(removeCommas(roof) / totalRepairCosts), roof]}
          description="The cost of roof repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setConcrete(value)}
          cellValues={["Concrete", convertToPercent(removeCommas(concrete) / totalRepairCosts), concrete]}
          description="The cost of concrete work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setGutters(value)}
          cellValues={["Gutters", convertToPercent(removeCommas(gutters) / totalRepairCosts), gutters]}
          description="The cost of gutters installation or repair"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setGarage(value)}
          cellValues={["Garage", convertToPercent(removeCommas(garage) / totalRepairCosts), garage]}
          description="The cost of garage repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setSiding(value)}
          cellValues={["Siding", convertToPercent(removeCommas(siding) / totalRepairCosts), siding]}
          description="The cost of siding repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setLandscaping(value)}
          cellValues={["Landscaping", convertToPercent(removeCommas(landscaping) / totalRepairCosts), landscaping]}
          description="The cost of landscaping work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setExteriorPainting(value)}
          cellValues={["Exterior Painting", convertToPercent(removeCommas(exteriorPainting) / totalRepairCosts), exteriorPainting]}
          description="The cost of exterior painting"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setSeptic(value)}
          cellValues={["Septic", convertToPercent(removeCommas(septic) / totalRepairCosts), septic]}
          description="The cost of septic system work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setDecksPorches(value)}
          cellValues={["Decks/Porches", convertToPercent(removeCommas(decksPorches) / totalRepairCosts), decksPorches]}
          description="The cost of deck or porch repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setFoundation(value)}
          cellValues={["Foundation", convertToPercent(removeCommas(foundation) / totalRepairCosts), foundation]}
          description="The cost of foundation work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setDemo(value)}
          cellValues={["Demo", convertToPercent(removeCommas(demo) / totalRepairCosts), demo]}
          description="The cost of demolition"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

      </div>

      <div className="table-container">


        <DynamicRow
          cellValues={["Internal Repairs"]}
          isMobile={false}
          numberOfCells={1}
          header={true}
        />

        <DynamicRow
          setInput={value => setSheetrock(value)}
          cellValues={["Sheetrock", convertToPercent(removeCommas(sheetrock) / totalRepairCosts), sheetrock]}
          description="The cost of sheetrock installation or repair"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setPlumbing(value)}
          cellValues={["Plumbing", convertToPercent(removeCommas(plumbing) / totalRepairCosts), plumbing]}
          description="The cost of plumbing repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setCarpentry(value)}
          cellValues={["Carpentry", convertToPercent(removeCommas(carpentry) / totalRepairCosts), carpentry]}
          description="The cost of carpentry repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setWindows(value)}
          cellValues={["Windows", convertToPercent(removeCommas(windows) / totalRepairCosts), windows]}
          description="The cost of plumbing repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />


        <DynamicRow
          setInput={value => setDoors(value)}
          cellValues={["Doors", convertToPercent(removeCommas(doors) / totalRepairCosts), doors]}
          description="The cost of doors and door installation repairs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setElectrical(value)}
          cellValues={["Electrical", convertToPercent(removeCommas(electrical) / totalRepairCosts), electrical]}
          description="The cost of electrical work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setInteriorPainting(value)}
          cellValues={["Interior Painting", convertToPercent(removeCommas(interiorPainting) / totalRepairCosts), interiorPainting]}
          description="The cost of interior painting"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />


        <DynamicRow
          setInput={value => setHvac(value)}
          cellValues={["HVAC", convertToPercent(removeCommas(hvac) / totalRepairCosts), hvac]}
          description="The cost of HVAC"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setCabinets(value)}
          cellValues={["Cabinets", convertToPercent(removeCommas(cabinets) / totalRepairCosts), cabinets]}
          description="The cost of cabinets"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />


        <DynamicRow
          setInput={value => setFraming(value)}
          cellValues={["Framing", convertToPercent(removeCommas(framing) / totalRepairCosts), framing]}
          description="The cost of framing"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setFlooring(value)}
          cellValues={["Flooring", convertToPercent(removeCommas(flooring) / totalRepairCosts), flooring]}
          description="The cost of flooring work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setInsulation(value)}
          cellValues={["Insulation", convertToPercent(removeCommas(insulation) / totalRepairCosts), insulation]}
          description="The cost of insulation work"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />



      </div>

      <div className="table-container">


        <DynamicRow
          cellValues={["General Components"]}
          isMobile={false}
          numberOfCells={1}
          header={true}
        />

        <DynamicRow
          setInput={value => setPermits(value)}
          cellValues={["Permits", convertToPercent(removeCommas(permits) / totalRepairCosts), permits]}
          description="The cost of obtaining permits"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setTermites(value)}
          cellValues={["Termites", convertToPercent(removeCommas(termites) / totalRepairCosts), termites]}
          description="The cost of termite treatment"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setMold(value)}
          cellValues={["Mold", convertToPercent(removeCommas(mold) / totalRepairCosts), mold]}
          description="The cost of mold remediation"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />

        <DynamicRow
          setInput={value => setMiscellaneous(value)}
          cellValues={["Miscellaneous", convertToPercent(removeCommas(miscellaneous) / totalRepairCosts), miscellaneous]}
          description="Miscellaneous repair costs"
          isMobile={false}
          numberOfCells={3}
          inputCellIndex={2}
        />
      </div>


      <PopupBox
        data={popupValues[1]}
        titles={popupValues[0]}
        dataKeys={popupValues[2]}
        setActiveCards={setActiveCards}
      />

      <ShareButton params={params} />


    </>
  );
};

export default HouseFlippingCalculator;


