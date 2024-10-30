import { EPageNames, EPageTitles } from '../utils/types';
import MultifamilyDevelopmentCalculator from './MultifamilyDevelopmentCalculator';
import IndustrialDevelopmentCalculator from './IndustrialDevelopmentCalculator';
import ResidentialDevelopmentCalculator from './ResidentialDevelopmentCalculator';

import './LandCalculator.scss';


const EVERYTHING_BURGER = ({ isMobile, page }: { isMobile: boolean, page: EPageNames }) => {
    // const queryParams = new URLSearchParams(window.location.search)

    // const [grossAcres, setGrossAcres] = useState(getDefault(page, EAllStates.grossAcres, DEFAULT_VALUES[page].grossAcres, queryParams));
    // const [builderProfitPercentage, setBuilderProfitPercentage] = useState(getDefault(page, EAllStates.builderProfitPercentage, DEFAULT_VALUES[page].builderProfitPercentage, queryParams));
    // const [buildingPricePerSqFt, setBuildingPricePerSqFt] = useState(getDefault(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].buildingPricePerSqFt, queryParams));
    // const [catchAll, setCatchAll] = useState(getDefault(page, EAllStates.catchAll, DEFAULT_VALUES[page].catchAll, queryParams));
    // const [commonSpacePercentage, setCommonSpacePercentage] = useState(getDefault(page, EAllStates.commonSpacePercentage, DEFAULT_VALUES[page].commonSpacePercentage, queryParams));
    // const [costToDevelop, setCostToDevelop] = useState(getDefault(page, EAllStates.costToDevelop, DEFAULT_VALUES[page].costToDevelop, queryParams));
    // const [costToDevelopPerLot, setCostToDevelopPerLot] = useState(getDefault(page, EAllStates.costToDevelopPerLot, DEFAULT_VALUES[page].costToDevelopPerLot, queryParams));
    // const [costToDevelopPerUnit, setCostToDevelopPerUnit] = useState(getDefault(page, EAllStates.costToDevelopPerUnit, DEFAULT_VALUES[page].costToDevelopPerUnit, queryParams));
    // const [hardCostPerSqFt, setHardCostPerSqFt] = useState(getDefault(page, EAllStates.hardCostPerSqFt, DEFAULT_VALUES[page].hardCostPerSqFt, queryParams));
    // const [homeBuilderProfitPercentage, setHomeBuilderProfitPercentage] = useState(getDefault(page, EAllStates.homeBuilderProfitPercentage, DEFAULT_VALUES[page].homeBuilderProfitPercentage, queryParams));
    // const [housePricePerSqFt, setHousePricePerSqFt] = useState(getDefault(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].housePricePerSqFt, queryParams));
    // const [houseSize, setHouseSize] = useState(getDefault(page, EAllStates.houseSize, DEFAULT_VALUES[page].houseSize, queryParams));
    // const [landDeveloperProfitPercentage, setLandDeveloperProfitPercentage] = useState(getDefault(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams));
    // const [maxImperviousSurfaceRatio, setMaxImperviousSurfaceRatio] = useState(getDefault(page, EAllStates.maxImperviousSurfaceRatio, DEFAULT_VALUES[page].maxImperviousSurfaceRatio, queryParams));
    // const [miscCosts, setMiscCosts] = useState(getDefault(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams));
    // const [multifamilyPricePerSqFt, setMultifamilyPricePerSqFt] = useState(getDefault(page, EAllStates.multifamilyPricePerSqFt, DEFAULT_VALUES[page].multifamilyPricePerSqFt, queryParams));
    // const [numberOfFloors, setNumberOfFloors] = useState(getDefault(page, EAllStates.numberOfFloors, DEFAULT_VALUES[page].numberOfFloors, queryParams));
    // const [numberOfUnits, setNumberOfUnits] = useState(getDefault(page, EAllStates.numberOfUnits, DEFAULT_VALUES[page].numberOfUnits, queryParams));
    // const [ownedLandCost, setOwnedLandCost] = useState(getDefault(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams));
    // const [parkingRatio, setParkingRatio] = useState(getDefault(page, EAllStates.parkingRatio, DEFAULT_VALUES[page].parkingRatio, queryParams));
    // const [parkingSpotsPerUnit, setParkingSpotsPerUnit] = useState(getDefault(page, EAllStates.parkingSpotsPerUnit, DEFAULT_VALUES[page].parkingSpotsPerUnit, queryParams));
    // const [permits, setPermits] = useState(getDefault(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams));
    // const [realEstateCommissionPercentage, setRealEstateCommissionPercentage] = useState(getDefault(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams));
    // const [requiresHandicappedParking, setRequiresHandicappedParking] = useState(getDefault(page, EAllStates.requiresHandicappedParking, DEFAULT_VALUES[page].requiresHandicappedParking, queryParams));
    // const [SDCFees, setSDCFees] = useState(getDefault(page, EAllStates.SDCFees, DEFAULT_VALUES[page].SDCFees, queryParams));
    // const [sqFtPerLot, setSqFtPerLot] = useState(getDefault(page, EAllStates.sqFtPerLot, DEFAULT_VALUES[page].sqFtPerLot, queryParams));
    // const [unbuildableAcres, setUnbuildableAcres] = useState(getDefault(page, EAllStates.unbuildableAcres, DEFAULT_VALUES[page].unbuildableAcres, queryParams));
    // const [unitsPerAcre, setUnitsPerAcre] = useState(getDefault(page, EAllStates.unitsPerAcre, DEFAULT_VALUES[page].unitsPerAcre, queryParams));


    // const [copied, setCopied] = useState(false);

    // useEffect(() => {
    // setGrossAcres(getDefault(page, EAllStates.grossAcres, DEFAULT_VALUES[page].grossAcres, queryParams));
    // setBuilderProfitPercentage(getDefault(page, EAllStates.builderProfitPercentage, DEFAULT_VALUES[page].builderProfitPercentage, queryParams));
    // setBuildingPricePerSqFt(getDefault(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].buildingPricePerSqFt, queryParams));
    // setCatchAll(getDefault(page, EAllStates.catchAll, DEFAULT_VALUES[page].catchAll, queryParams));
    // setCommonSpacePercentage(getDefault(page, EAllStates.commonSpacePercentage, DEFAULT_VALUES[page].commonSpacePercentage, queryParams));
    // setCostToDevelop(getDefault(page, EAllStates.costToDevelop, DEFAULT_VALUES[page].costToDevelop, queryParams));
    // setCostToDevelopPerLot(getDefault(page, EAllStates.costToDevelopPerLot, DEFAULT_VALUES[page].costToDevelopPerLot, queryParams));
    // setCostToDevelopPerUnit(getDefault(page, EAllStates.costToDevelopPerUnit, DEFAULT_VALUES[page].costToDevelopPerUnit, queryParams));
    // setHardCostPerSqFt(getDefault(page, EAllStates.hardCostPerSqFt, DEFAULT_VALUES[page].hardCostPerSqFt, queryParams));
    // setHomeBuilderProfitPercentage(getDefault(page, EAllStates.homeBuilderProfitPercentage, DEFAULT_VALUES[page].homeBuilderProfitPercentage, queryParams));
    // setHousePricePerSqFt(getDefault(page, EAllStates.housePricePerSqFt, DEFAULT_VALUES[page].housePricePerSqFt, queryParams));
    // setHouseSize(getDefault(page, EAllStates.houseSize, DEFAULT_VALUES[page].houseSize, queryParams));
    // setLandDeveloperProfitPercentage(getDefault(page, EAllStates.landDeveloperProfitPercentage, DEFAULT_VALUES[page].landDeveloperProfitPercentage, queryParams));
    // setMaxImperviousSurfaceRatio(getDefault(page, EAllStates.maxImperviousSurfaceRatio, DEFAULT_VALUES[page].maxImperviousSurfaceRatio, queryParams));
    // setMiscCosts(getDefault(page, EAllStates.miscCosts, DEFAULT_VALUES[page].miscCosts, queryParams));
    // setMultifamilyPricePerSqFt(getDefault(page, EAllStates.multifamilyPricePerSqFt, DEFAULT_VALUES[page].multifamilyPricePerSqFt, queryParams));
    // setNumberOfFloors(getDefault(page, EAllStates.numberOfFloors, DEFAULT_VALUES[page].numberOfFloors, queryParams));
    // setNumberOfUnits(getDefault(page, EAllStates.numberOfUnits, DEFAULT_VALUES[page].numberOfUnits, queryParams));
    // setOwnedLandCost(getDefault(page, EAllStates.ownedLandCost, DEFAULT_VALUES[page].ownedLandCost, queryParams));
    // setParkingRatio(getDefault(page, EAllStates.parkingRatio, DEFAULT_VALUES[page].parkingRatio, queryParams));
    // setParkingSpotsPerUnit(getDefault(page, EAllStates.parkingSpotsPerUnit, DEFAULT_VALUES[page].parkingSpotsPerUnit, queryParams));
    // setPermits(getDefault(page, EAllStates.permits, DEFAULT_VALUES[page].permits, queryParams));
    // setRealEstateCommissionPercentage(getDefault(page, EAllStates.realEstateCommissionPercentage, DEFAULT_VALUES[page].realEstateCommissionPercentage, queryParams));
    // setRequiresHandicappedParking(getDefault(page, EAllStates.requiresHandicappedParking, DEFAULT_VALUES[page].requiresHandicappedParking, queryParams));
    // setSDCFees(getDefault(page, EAllStates.SDCFees, DEFAULT_VALUES[page].SDCFees, queryParams));
    // setSqFtPerLot(getDefault(page, EAllStates.sqFtPerLot, DEFAULT_VALUES[page].sqFtPerLot, queryParams));
    // setUnbuildableAcres(getDefault(page, EAllStates.unbuildableAcres, DEFAULT_VALUES[page].unbuildableAcres, queryParams));
    // setUnitsPerAcre(getDefault(page, EAllStates.unitsPerAcre, DEFAULT_VALUES[page].unitsPerAcre, queryParams));

    // }, [page]);



    // const params: {
    //     builderProfitPercentage: number;
    //     buildingPricePerSqFt: number;
    //     catchAll: number;
    //     commonSpacePercentage: number;
    //     costToDevelop: number;
    //     costToDevelopPerLot: number;
    //     costToDevelopPerUnit: number;
    //     grossAcres: number;
    //     hardCostPerSqFt: number;
    //     homeBuilderProfitPercentage: number;
    //     housePricePerSqFt: number;
    //     houseSize: number;
    //     landDeveloperProfitPercentage: number;
    //     maxImperviousSurfaceRatio: number;
    //     miscCosts: number;
    //     multifamilyPricePerSqFt: number;
    //     numberOfFloors: number;
    //     numberOfUnits: number;
    //     ownedLandCost: number;
    //     parkingRatio: number;
    //     parkingSpotsPerUnit: number;
    //     permits: number;
    //     realEstateCommissionPercentage: number;
    //     requiresHandicappedParking: boolean;
    //     SDCFees: number;
    //     sqFtPerLot: number;
    //     unbuildableAcres: number;
    //     unitsPerAcre: number;
    // } = {
    //     builderProfitPercentage,
    //     buildingPricePerSqFt,
    //     catchAll,
    //     commonSpacePercentage,
    //     costToDevelop,
    //     costToDevelopPerLot,
    //     costToDevelopPerUnit,
    //     grossAcres,
    //     hardCostPerSqFt,
    //     homeBuilderProfitPercentage,
    //     housePricePerSqFt,
    //     houseSize,
    //     landDeveloperProfitPercentage,
    //     maxImperviousSurfaceRatio,
    //     miscCosts,
    //     multifamilyPricePerSqFt,
    //     numberOfFloors,
    //     numberOfUnits,
    //     ownedLandCost,
    //     parkingRatio,
    //     parkingSpotsPerUnit,
    //     permits,
    //     realEstateCommissionPercentage,
    //     requiresHandicappedParking,
    //     SDCFees,
    //     sqFtPerLot,
    //     unbuildableAcres,
    //     unitsPerAcre,
    // };


    const PageToRender = (page: EPageNames) => {
        switch (page) {
            case EPageNames.MULTIFAMILY_DEVELOPMENT:
                return <MultifamilyDevelopmentCalculator
                    isMobile={isMobile}
                    page={page}

                // isMobile={isMobile}
                // builderProfitPercentage={builderProfitPercentage}
                // catchAll={catchAll}
                // commonSpacePercentage={commonSpacePercentage}
                // costToDevelopPerUnit={costToDevelopPerUnit}
                // grossAcres={grossAcres}
                // hardCostPerSqFt={hardCostPerSqFt}
                // landDeveloperProfitPercentage={landDeveloperProfitPercentage}
                // maxImperviousSurfaceRatio={maxImperviousSurfaceRatio}
                // miscCosts={miscCosts}
                // multifamilyPricePerSqFt={multifamilyPricePerSqFt}
                // numberOfFloors={numberOfFloors}
                // numberOfUnits={numberOfUnits}
                // ownedLandCost={ownedLandCost}
                // parkingSpotsPerUnit={parkingSpotsPerUnit}
                // permits={permits}
                // realEstateCommissionPercentage={realEstateCommissionPercentage}
                // requiresHandicappedParking={requiresHandicappedParking}
                // setBuilderProfitPercentage={setBuilderProfitPercentage}
                // setCatchAll={setCatchAll}
                // setCommonSpacePercentage={setCommonSpacePercentage}
                // setCostToDevelopPerUnit={setCostToDevelopPerUnit}
                // setGrossAcres={setGrossAcres}
                // setHardCostPerSqFt={setHardCostPerSqFt}
                // setLandDeveloperProfitPercentage={setLandDeveloperProfitPercentage}
                // setMaxImperviousSurfaceRatio={setMaxImperviousSurfaceRatio}
                // setMiscCosts={setMiscCosts}
                // setMultifamilyPricePerSqFt={setMultifamilyPricePerSqFt}
                // setNumberOfFloors={setNumberOfFloors}
                // setNumberOfUnits={setNumberOfUnits}
                // setOwnedLandCost={setOwnedLandCost}
                // setParkingSpotsPerUnit={setParkingSpotsPerUnit}
                // setPermits={setPermits}
                // setRealEstateCommissionPercentage={setRealEstateCommissionPercentage}
                // setRequiresHandicappedParking={setRequiresHandicappedParking}
                // setUnbuildableAcres={setUnbuildableAcres}
                // unbuildableAcres={unbuildableAcres}
                />
            case EPageNames.INDUSTRIAL_DEVELOPMENT:
                return <IndustrialDevelopmentCalculator
                    // buildingPricePerSqFt={buildingPricePerSqFt}
                    // catchAll={catchAll}
                    // commonSpacePercentage={commonSpacePercentage}
                    // costToDevelop={costToDevelop}
                    // grossAcres={grossAcres}
                    // hardCostPerSqFt={hardCostPerSqFt}
                    // homeBuilderProfitPercentage={homeBuilderProfitPercentage}
                    isMobile={isMobile}
                    page={page}

                // landDeveloperProfitPercentage={landDeveloperProfitPercentage}
                // maxImperviousSurfaceRatio={maxImperviousSurfaceRatio}
                // miscCosts={miscCosts}
                // numberOfFloors={numberOfFloors}
                // ownedLandCost={ownedLandCost}
                // parkingRatio={parkingRatio}
                // permits={permits}
                // realEstateCommissionPercentage={realEstateCommissionPercentage}
                // SDCFees={SDCFees}
                // setBuildingPricePerSqFt={setBuildingPricePerSqFt}
                // setCatchAll={setCatchAll}
                // setCommonSpacePercentage={setCommonSpacePercentage}
                // setCostToDevelop={setCostToDevelop}
                // setGrossAcres={setGrossAcres}
                // setHardCostPerSqFt={setHardCostPerSqFt}
                // setHomeBuilderProfitPercentage={setHomeBuilderProfitPercentage}
                // setLandDeveloperProfitPercentage={setLandDeveloperProfitPercentage}
                // setMaxImperviousSurfaceRatio={setMaxImperviousSurfaceRatio}
                // setMiscCosts={setMiscCosts}
                // setNumberOfFloors={setNumberOfFloors}
                // setOwnedLandCost={setOwnedLandCost}
                // setParkingRatio={setParkingRatio}
                // setPermits={setPermits}
                // setRealEstateCommissionPercentage={setRealEstateCommissionPercentage}
                // setSDCFees={setSDCFees}
                // setUnbuildableAcres={setUnbuildableAcres}
                // unbuildableAcres={unbuildableAcres}
                />
            case EPageNames.RESIDENTIAL_DEVELOPMENT:
                return <ResidentialDevelopmentCalculator
                    isMobile={isMobile}
                    page={page}
                // isMobile={isMobile}
                // grossAcres={grossAcres}
                // setGrossAcres={setGrossAcres}
                // unbuildableAcres={unbuildableAcres}
                // setUnbuildableAcres={setUnbuildableAcres}
                // sqFtPerLot={sqFtPerLot}
                // setSqFtPerLot={setSqFtPerLot}
                // unitsPerAcre={unitsPerAcre}
                // setUnitsPerAcre={setUnitsPerAcre}
                // houseSize={houseSize}
                // setHouseSize={setHouseSize}
                // housePricePerSqFt={housePricePerSqFt}
                // setHousePricePerSqFt={setHousePricePerSqFt}
                // hardCostPerSqFt={hardCostPerSqFt}
                // setHardCostPerSqFt={setHardCostPerSqFt}
                // permits={permits}
                // setPermits={setPermits}
                // miscCosts={miscCosts}
                // setMiscCosts={setMiscCosts}
                // homeBuilderProfitPercentage={homeBuilderProfitPercentage}
                // setHomeBuilderProfitPercentage={setHomeBuilderProfitPercentage}
                // realEstateCommissionPercentage={realEstateCommissionPercentage}
                // setRealEstateCommissionPercentage={setRealEstateCommissionPercentage}
                // landDeveloperProfitPercentage={landDeveloperProfitPercentage}
                // setLandDeveloperProfitPercentage={setLandDeveloperProfitPercentage}
                // costToDevelopPerLot={costToDevelopPerLot}
                // setCostToDevelopPerLot={setCostToDevelopPerLot}
                // ownedLandCost={ownedLandCost}
                // setOwnedLandCost={setOwnedLandCost}
                />
            default:
                break;
        }
    }

    return (
        <div className="land-calculator">
            <header className="app-header">
                <h1>{EPageTitles[page]}</h1>
            </header>
            {/* <MonteCarloSimulator {...inputs} /> */}
            {PageToRender(page)}



            {/* <button
                onClick={() => copyToClipboard(params, setCopied)}
                className={`copy-url-button ${copied ? 'copied' : ''}`}
            >
                {copied ? 'Copied your work! Now share the link' : 'Share your work'}
            </button> */}
        </div >
    );
};

export default EVERYTHING_BURGER;
