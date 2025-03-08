import DynamicRow from '../components/RowTypes/DynamicRow';
import ShareButton from '../components/ShareButton';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { DEFAULT_VALUES } from '../utils/constants';
import { EPageNames, EAllStates } from '../utils/types';
import { roundAndLocalString, convertInputsToNumbers, roundToDecimal, convertToPercent, removeCommas } from '../utils/utils';


const HouseFlippingCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

  const queryParams = new URLSearchParams(window.location.search)



  const [arv, setArv] = usePersistedState2(page, EAllStates.arv, DEFAULT_VALUES[page].arv, queryParams);
  const [purchasePrice, setPurchasePrices] = usePersistedState2(page, EAllStates.purchasePrice, DEFAULT_VALUES[page].purchasePrice, queryParams);
  const [projectMonths, setProjectMonths] = usePersistedState2(page, EAllStates.projectMonths, DEFAULT_VALUES[page].projectMonths, queryParams);

  const [closingCosts, setClosingCosts] = usePersistedState2(page, EAllStates.closingCosts, DEFAULT_VALUES[page].closingCosts, queryParams);
  const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = usePersistedState2(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams);

  const [profitPercentage, setProfitPercentage] = usePersistedState2(page, EAllStates.profitPercentage, DEFAULT_VALUES[page].profitPercentage, queryParams);



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
  };


  const {
    arv: _arv,
    purchasePrice: _purchaseAndRepairCosts,
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


  const minimumProfit = _profitPercentage / 100 * _arv;



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


  const totalLoanCosts = gapTotalFees + hardMoneyLoanTotalFees
  const totalProjectCosts = totalLoanCosts + _purchaseAndRepairCosts


  const totalProfit = _arv - totalProjectCosts;
  const isDeal =  totalProfit >= minimumProfit;
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
          setInput={value => setClosingCosts(value)}
          cellValues={["Closing Costs (% of purhcase price)", closingCosts]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          setInput={value => setRealEstateCommissionPercentage(value)}
          cellValues={["Real Estate Commission (% of purhcase price)", realEstateCommissionPercentage]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          cellValues={["Total Repair Costs", roundAndLocalString(totalRepairCosts)]}
          description="Total Repair Costs"
          isMobile={false}
          numberOfCells={2}
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
          setInput={value => setArv(value)}
          cellValues={["After Repair Value ($)", arv]}
          isMobile={isMobile}
          numberOfCells={2}
          inputCellIndex={1}
        />

        <DynamicRow
          cellValues={["Total Project Costs to ARV (%)", roundToDecimal(totalProjectCosts / _arv * 100, 1) + "%"]}
          isMobile={isMobile}
          numberOfCells={2}
        />


        <DynamicRow
          setInput={value => setProfitPercentage(value)}
          cellValues={["Minimum Profit on ARV (%)", "$" + roundAndLocalString(minimumProfit), profitPercentage]}
          isMobile={isMobile}
          numberOfCells={3}
          inputCellIndex={2}
        />




        <DynamicRow
          cellValues={["Total Project Costs ($)", roundAndLocalString(totalProjectCosts)]}
          isMobile={isMobile}
          numberOfCells={2}
        />


        <DynamicRow
          cellValues={["Total Profit ($)",isDeal?"Deal":"No Deal",roundAndLocalString(totalProfit)]}
          isMobile={isMobile}
          numberOfCells={3}

          output={true}
        />






        Projection Less Profit Share	26,837

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





      {/* 

      <HardMoneyLoanCalculator
        isMobile={isMobile}
        page={EPageNames.HARD_MONEY_COST_ESTIMATOR}
      /> */}
      <ShareButton params={params} />

    </>
  );
};

export default HouseFlippingCalculator;


