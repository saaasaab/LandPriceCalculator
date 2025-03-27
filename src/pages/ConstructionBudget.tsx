

import DynamicRow from '../components/RowTypes/DynamicRow';
import { EAllStates, EPageNames } from '../utils/types';

import { roundAndLocalString, convertToPercent, removeCommas } from '../utils/utils';
import { constructionBudgetCalculations } from '../utils/constructionBudgetCalculations';

import './DynamicTable.scss';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { DEFAULT_VALUES } from '../utils/constants';
import ShareButton from '../components/ShareButton';


const ConstructionBudget = ({ page }: { isMobile: boolean; page: EPageNames; }) => {
    // Land Costs

    const queryParams = new URLSearchParams(window.location.search);

    const [landAcquisition, setLandAcquisition] = usePersistedState2(page, EAllStates.landAcquisition, DEFAULT_VALUES[page].landAcquisition, queryParams);
    const [closingCosts, setClosingCosts] = usePersistedState2(page, EAllStates.closingCosts, DEFAULT_VALUES[page].closingCosts, queryParams);

    // Designs and Engineering Costs
    const [architecturalDesigns, setArchitecturalDesigns] = usePersistedState2(page, EAllStates.architecturalDesigns, DEFAULT_VALUES[page].architecturalDesigns, queryParams);
    const [civilEngineering, setCivilEngineering] = usePersistedState2(page, EAllStates.civilEngineering, DEFAULT_VALUES[page].civilEngineering, queryParams);
    const [surveying, setSurveying] = usePersistedState2(page, EAllStates.surveying, DEFAULT_VALUES[page].surveying, queryParams);
    const [landscapeDesign, setLandscapeDesign] = usePersistedState2(page, EAllStates.landscapeDesign, DEFAULT_VALUES[page].landscapeDesign, queryParams);
    const [geotechnical, setGeotechnical] = usePersistedState2(page, EAllStates.geotechnical, DEFAULT_VALUES[page].geotechnical, queryParams);
    const [mepEngineering, setMepEngineering] = usePersistedState2(page, EAllStates.mepEngineering, DEFAULT_VALUES[page].mepEngineering, queryParams);

    // City Application, Review, and Permit Fees
    const [preApplication, setPreApplication] = usePersistedState2(page, EAllStates.preApplication, DEFAULT_VALUES[page].preApplication, queryParams);
    const [siteDesignReview, setSiteDesignReview] = usePersistedState2(page, EAllStates.siteDesignReview, DEFAULT_VALUES[page].siteDesignReview, queryParams);
    const [sitePlanReview, setSitePlanReview] = usePersistedState2(page, EAllStates.sitePlanReview, DEFAULT_VALUES[page].sitePlanReview, queryParams);
    const [buildingPermit, setBuildingPermit] = usePersistedState2(page, EAllStates.buildingPermit, DEFAULT_VALUES[page].buildingPermit, queryParams);

    // System Development Charges
    const [stormwater, setStormwater] = usePersistedState2(page, EAllStates.stormwater, DEFAULT_VALUES[page].stormwater, queryParams);
    const [transportation, setTransportation] = usePersistedState2(page, EAllStates.transportation, DEFAULT_VALUES[page].transportation, queryParams);
    const [sanitarySewer, setSanitarySewer] = usePersistedState2(page, EAllStates.sanitarySewer, DEFAULT_VALUES[page].sanitarySewer, queryParams);
    const [parks, setParks] = usePersistedState2(page, EAllStates.parks, DEFAULT_VALUES[page].parks, queryParams);
    const [water, setWater] = usePersistedState2(page, EAllStates.water, DEFAULT_VALUES[page].water, queryParams);

    // Land Preparation Costs
    const [excavation, setExcavation] = usePersistedState2(page, EAllStates.excavation, DEFAULT_VALUES[page].excavation, queryParams);
    const [waterRetention, setWaterRetention] = usePersistedState2(page, EAllStates.waterRetention, DEFAULT_VALUES[page].waterRetention, queryParams);
    const [foundation, setFoundation] = usePersistedState2(page, EAllStates.foundation, DEFAULT_VALUES[page].foundation, queryParams);
    const [asphalt, setAsphalt] = usePersistedState2(page, EAllStates.asphalt, DEFAULT_VALUES[page].asphalt, queryParams);

    // Rough Buildout Costs
    const [lumber, setLumber] = usePersistedState2(page, EAllStates.lumber, DEFAULT_VALUES[page].lumber, queryParams);
    const [trusses, setTrusses] = usePersistedState2(page, EAllStates.trusses, DEFAULT_VALUES[page].trusses, queryParams);
    const [framingLabor, setFramingLabor] = usePersistedState2(page, EAllStates.framingLabor, DEFAULT_VALUES[page].framingLabor, queryParams);
    const [windows, setWindows] = usePersistedState2(page, EAllStates.windows, DEFAULT_VALUES[page].windows, queryParams);
    const [siding, setSiding] = usePersistedState2(page, EAllStates.siding, DEFAULT_VALUES[page].siding, queryParams);
    const [hvac, setHvac] = usePersistedState2(page, EAllStates.hvac, DEFAULT_VALUES[page].hvac, queryParams);
    const [plumbing, setPlumbing] = usePersistedState2(page, EAllStates.plumbing, DEFAULT_VALUES[page].plumbing, queryParams);
    const [electrical, setElectrical] = usePersistedState2(page, EAllStates.electrical, DEFAULT_VALUES[page].electrical, queryParams);
    const [gasPiping, setGasPiping] = usePersistedState2(page, EAllStates.gasPiping, DEFAULT_VALUES[page].gasPiping, queryParams);
    const [gutters, setGutters] = usePersistedState2(page, EAllStates.gutters, DEFAULT_VALUES[page].gutters, queryParams);
    const [roofing, setRoofing] = usePersistedState2(page, EAllStates.roofing, DEFAULT_VALUES[page].roofing, queryParams);
    const [exteriorDoors, setExteriorDoors] = usePersistedState2(page, EAllStates.exteriorDoors, DEFAULT_VALUES[page].exteriorDoors, queryParams);

    // Finishings Costs
    const [insulation, setInsulation] = usePersistedState2(page, EAllStates.insulation, DEFAULT_VALUES[page].insulation, queryParams);
    const [drywall, setDrywall] = usePersistedState2(page, EAllStates.drywall, DEFAULT_VALUES[page].drywall, queryParams);
    const [interiorTrim, setInteriorTrim] = usePersistedState2(page, EAllStates.interiorTrim, DEFAULT_VALUES[page].interiorTrim, queryParams);
    const [painting, setPainting] = usePersistedState2(page, EAllStates.painting, DEFAULT_VALUES[page].painting, queryParams);
    const [cabinets, setCabinets] = usePersistedState2(page, EAllStates.cabinets, DEFAULT_VALUES[page].cabinets, queryParams);
    const [countertops, setCountertops] = usePersistedState2(page, EAllStates.countertops, DEFAULT_VALUES[page].countertops, queryParams);
    const [flooring, setFlooring] = usePersistedState2(page, EAllStates.flooring, DEFAULT_VALUES[page].flooring, queryParams);
    const [carpet, setCarpet] = usePersistedState2(page, EAllStates.carpet, DEFAULT_VALUES[page].carpet, queryParams);
    const [hardware, setHardware] = usePersistedState2(page, EAllStates.hardware, DEFAULT_VALUES[page].hardware, queryParams);
    const [appliances, setAppliances] = usePersistedState2(page, EAllStates.appliances, DEFAULT_VALUES[page].appliances, queryParams);
    const [lightFixtures, setLightFixtures] = usePersistedState2(page, EAllStates.lightFixtures, DEFAULT_VALUES[page].lightFixtures, queryParams);
    const [windowCovering, setWindowCovering] = usePersistedState2(page, EAllStates.windowCovering, DEFAULT_VALUES[page].windowCovering, queryParams);
    const [cleanup, setCleanup] = usePersistedState2(page, EAllStates.cleanup, DEFAULT_VALUES[page].cleanup, queryParams);
    const [flatwork, setFlatwork] = usePersistedState2(page, EAllStates.flatwork, DEFAULT_VALUES[page].flatwork, queryParams);
    const [fences, setFences] = usePersistedState2(page, EAllStates.fences, DEFAULT_VALUES[page].fences, queryParams);
    const [landscaping, setLandscaping] = usePersistedState2(page, EAllStates.landscaping, DEFAULT_VALUES[page].landscaping, queryParams);

    // Contractor Fee and Contingencies
    const [generalConditions, setGeneralConditions] = usePersistedState2(page, EAllStates.generalConditions, DEFAULT_VALUES[page].generalConditions, queryParams);
    const [contractorFee, setContractorFee] = usePersistedState2(page, EAllStates.contractorFee, DEFAULT_VALUES[page].contractorFee, queryParams);


    const params = {
        landAcquisition,
        closingCosts,
        architecturalDesigns,
        civilEngineering,
        surveying,
        landscapeDesign,
        geotechnical,
        mepEngineering,
        preApplication,
        siteDesignReview,
        sitePlanReview,
        buildingPermit,
        stormwater,
        transportation,
        sanitarySewer,
        parks,
        water,
        excavation,
        waterRetention,
        foundation,
        asphalt,
        lumber,
        trusses,
        framingLabor,
        windows,
        siding,
        hvac,
        plumbing,
        electrical,
        gasPiping,
        gutters,
        roofing,
        exteriorDoors,
        insulation,
        drywall,
        interiorTrim,
        painting,
        cabinets,
        countertops,
        flooring,
        carpet,
        hardware,
        appliances,
        lightFixtures,
        windowCovering,
        cleanup,
        flatwork,
        fences,
        landscaping,
        generalConditions,
        contractorFee,
    };

    // Calculate totals
    const {
        totalLandCosts,
        totalDesignsEngineering,
        totalCityFees,
        totalSystemDevelopmentCharges,
        totalLandPreparation,
        totalRoughBuildout,
        totalFinishings,
        totalContractorFee,
        totalConstructionCosts,
        totalCostsToBreakGround,
        totalCosts,
    } = constructionBudgetCalculations(params)


    return (

        <>
            {/* Land Costs */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["Land Acquisition Costs"]}
                    isMobile={false}  // Set based on your mobile state
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setLandAcquisition(value)}
                    cellValues={["Land Acquisition", convertToPercent(removeCommas(landAcquisition) / totalCosts), landAcquisition]}
                    description="The value of the land"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setClosingCosts(value)}
                    cellValues={["Closing Costs", convertToPercent(removeCommas(closingCosts) / totalCosts), closingCosts]}
                    description="The value spent on all the additional costs of closing including title insurance, title reports, brokerage fees, etc."
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />
                <DynamicRow
                    cellValues={["Land Acquisition Costs", convertToPercent(totalLandCosts / totalCosts), roundAndLocalString(totalLandCosts)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* Designs and Engineering Costs */}
            <div className="table-container">

                <DynamicRow
                    cellValues={["Designs and Engineering"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setArchitecturalDesigns(value)}
                    cellValues={["Architectural Designs", convertToPercent(removeCommas(architecturalDesigns) / totalCosts), architecturalDesigns]}
                    description="The cost of architectural designs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setCivilEngineering(value)}
                    cellValues={["Civil Engineering", convertToPercent(removeCommas(civilEngineering) / totalCosts), civilEngineering]}
                    description="The cost of civil engineering"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setSurveying(value)}
                    cellValues={["Surveying", convertToPercent(removeCommas(surveying) / totalCosts), surveying]}
                    description="Surveying costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setLandscapeDesign(value)}
                    cellValues={["Landscape Design", convertToPercent(removeCommas(landscapeDesign) / totalCosts), landscapeDesign]}
                    description="Landscape design costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setGeotechnical(value)}
                    cellValues={["Geotechnical", convertToPercent(removeCommas(geotechnical) / totalCosts), geotechnical]}
                    description="Geotechnical costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setMepEngineering(value)}
                    cellValues={["M/E/P Engineering", convertToPercent(removeCommas(mepEngineering) / totalCosts), mepEngineering]}
                    description="Mechanical, Electrical, and Plumbing engineering costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />
                <DynamicRow
                    cellValues={["Designs and Engineering", convertToPercent(totalDesignsEngineering / totalCosts), roundAndLocalString(totalDesignsEngineering)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* City application, review, and permit fees */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["City application, review, and permit fees"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setPreApplication(value)}
                    cellValues={["Pre-application Conference", convertToPercent(removeCommas(preApplication) / totalCosts), preApplication]}
                    description="Pre-application conference fees"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setSiteDesignReview(value)}
                    cellValues={["Site Design Review", convertToPercent(removeCommas(siteDesignReview) / totalCosts), siteDesignReview]}
                    description="Site design review costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setSitePlanReview(value)}
                    cellValues={["Site Plan Review", convertToPercent(removeCommas(sitePlanReview) / totalCosts), sitePlanReview]}
                    description="Site plan review fees"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setBuildingPermit(value)}
                    cellValues={["Building Permit", convertToPercent(removeCommas(buildingPermit) / totalCosts), buildingPermit]}
                    description="Building permit costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />
                <DynamicRow
                    cellValues={["Total Designs and Engineering Costs", convertToPercent(totalCityFees / totalCosts), roundAndLocalString(totalCityFees)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* System Development Charges */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["System Development Charges"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setStormwater(value)}
                    cellValues={["Stormwater SDC", convertToPercent(removeCommas(stormwater) / totalCosts), stormwater]}
                    description="Stormwater system development charges"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setTransportation(value)}
                    cellValues={["Transportation SDC", convertToPercent(removeCommas(transportation) / totalCosts), transportation]}
                    description="Transportation system development charges"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setSanitarySewer(value)}
                    cellValues={["Sanitary Sewer SDC", convertToPercent(removeCommas(sanitarySewer) / totalCosts), sanitarySewer]}
                    description="Sanitary sewer system development charges"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setParks(value)}
                    cellValues={["Parks SDC", convertToPercent(removeCommas(parks) / totalCosts), parks]}
                    description="Parks system development charges"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setWater(value)}
                    cellValues={["Water SDC", convertToPercent(removeCommas(water) / totalCosts), water]}
                    description="Water system development charges"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />
                <DynamicRow
                    cellValues={["Total System Development Charges Costs", convertToPercent(totalSystemDevelopmentCharges / totalCosts), roundAndLocalString(totalSystemDevelopmentCharges)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* Land Preparation */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["Land Preparation"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setExcavation(value)}
                    cellValues={["Excavation and Backfill", convertToPercent(removeCommas(excavation) / totalCosts), excavation]}
                    description="Excavation and backfill costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setWaterRetention(value)}
                    cellValues={["Water Retention", convertToPercent(removeCommas(waterRetention) / totalCosts), waterRetention]}
                    description="Water retention costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setFoundation(value)}
                    cellValues={["Foundation", convertToPercent(removeCommas(foundation) / totalCosts), foundation]}
                    description="Foundation costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setAsphalt(value)}
                    cellValues={["Asphalt", convertToPercent(removeCommas(asphalt) / totalCosts), asphalt]}
                    description="Asphalt costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />
                <DynamicRow
                    cellValues={["Total Land Preparation Costs", convertToPercent(totalLandPreparation / totalCosts), roundAndLocalString(totalLandPreparation)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* Rough Buildout */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["Rough Buildout"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setLumber(value)}
                    cellValues={["Lumber", convertToPercent(removeCommas(lumber) / totalCosts), lumber]}
                    description="Lumber costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setTrusses(value)}
                    cellValues={["Trusses", convertToPercent(removeCommas(trusses) / totalCosts), trusses]}
                    description="Trusses costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setFramingLabor(value)}
                    cellValues={["Framing Labor", convertToPercent(removeCommas(framingLabor) / totalCosts), framingLabor]}
                    description="Framing labor costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setWindows(value)}
                    cellValues={["Windows", convertToPercent(removeCommas(windows) / totalCosts), windows]}
                    description="Window costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setSiding(value)}
                    cellValues={["Siding", convertToPercent(removeCommas(siding) / totalCosts), siding]}
                    description="Siding costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setHvac(value)}
                    cellValues={["HVAC", convertToPercent(removeCommas(hvac) / totalCosts), hvac]}
                    description="HVAC costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setPlumbing(value)}
                    cellValues={["Plumbing", convertToPercent(removeCommas(plumbing) / totalCosts), plumbing]}
                    description="Plumbing costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setElectrical(value)}
                    cellValues={["Electrical", convertToPercent(removeCommas(electrical) / totalCosts), electrical]}
                    description="Electrical costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setGasPiping(value)}
                    cellValues={["Gas Piping", convertToPercent(removeCommas(gasPiping) / totalCosts), gasPiping]}
                    description="Gas piping costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setGutters(value)}
                    cellValues={["Gutters", convertToPercent(removeCommas(gutters) / totalCosts), gutters]}
                    description="Gutters and downspouts costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setRoofing(value)}
                    cellValues={["Roofing", convertToPercent(removeCommas(roofing) / totalCosts), roofing]}
                    description="Roofing costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setExteriorDoors(value)}
                    cellValues={["Exterior Doors", convertToPercent(removeCommas(exteriorDoors) / totalCosts), exteriorDoors]}
                    description="Exterior doors costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />
                <DynamicRow
                    cellValues={["Total Rough Buildout Costs", convertToPercent(totalRoughBuildout / totalCosts), roundAndLocalString(totalRoughBuildout)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* Finishings */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["Finishings"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setInsulation(value)}
                    cellValues={["Insulation", convertToPercent(removeCommas(insulation) / totalCosts), insulation]}
                    description="Insulation costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setDrywall(value)}
                    cellValues={["Drywall", convertToPercent(removeCommas(drywall) / totalCosts), drywall]}
                    description="Drywall costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setInteriorTrim(value)}
                    cellValues={["Interior Trim", convertToPercent(removeCommas(interiorTrim) / totalCosts), interiorTrim]}
                    description="Interior trim costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setPainting(value)}
                    cellValues={["Painting", convertToPercent(removeCommas(painting) / totalCosts), painting]}
                    description="Painting costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setCabinets(value)}
                    cellValues={["Cabinets", convertToPercent(removeCommas(cabinets) / totalCosts), cabinets]}
                    description="Cabinets and vanities costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setCountertops(value)}
                    cellValues={["Countertops", convertToPercent(removeCommas(countertops) / totalCosts), countertops]}
                    description="Countertop costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setFlooring(value)}
                    cellValues={["Flooring", convertToPercent(removeCommas(flooring) / totalCosts), flooring]}
                    description="Flooring covering costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setCarpet(value)}
                    cellValues={["Carpet", convertToPercent(removeCommas(carpet) / totalCosts), carpet]}
                    description="Carpet costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setHardware(value)}
                    cellValues={["Hardware", convertToPercent(removeCommas(hardware) / totalCosts), hardware]}
                    description="Hardware costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setAppliances(value)}
                    cellValues={["Appliances", convertToPercent(removeCommas(appliances) / totalCosts), appliances]}
                    description="Appliance costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setLightFixtures(value)}
                    cellValues={["Light Fixtures", convertToPercent(removeCommas(lightFixtures) / totalCosts), lightFixtures]}
                    description="Light fixtures costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setWindowCovering(value)}
                    cellValues={["Window Covering", convertToPercent(removeCommas(windowCovering) / totalCosts), windowCovering]}
                    description="Window covering costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setCleanup(value)}
                    cellValues={["Clean-up", convertToPercent(removeCommas(cleanup) / totalCosts), cleanup]}
                    description="Clean-up costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setFlatwork(value)}
                    cellValues={["Flatwork", convertToPercent(removeCommas(flatwork) / totalCosts), flatwork]}
                    description="Flatwork costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setFences(value)}
                    cellValues={["Fences", convertToPercent(removeCommas(fences) / totalCosts), fences]}
                    description="Fences costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setLandscaping(value)}
                    cellValues={["Landscaping & Irrigation", convertToPercent(removeCommas(landscaping) / totalCosts), landscaping]}
                    description="Landscaping and irrigation costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    cellValues={["Total ontractor Fee and Contingencies Costs", convertToPercent(totalFinishings / totalCosts), roundAndLocalString(totalFinishings)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />

            </div>

            {/* Contractor Fee */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["Contractor Fee and Contingencies"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    setInput={value => setGeneralConditions(value)}
                    cellValues={["General Conditions", convertToPercent(removeCommas(generalConditions) / totalCosts), generalConditions]}
                    description="General conditions for the project"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    setInput={value => setContractorFee(value)}
                    cellValues={["Contractor Fee", convertToPercent(removeCommas(contractorFee) / totalCosts), contractorFee]}
                    description="Contractor fee (20% of total)"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    cellValues={["Total ontractor Fee and Contingencies Costs", convertToPercent(totalContractorFee / totalCosts), roundAndLocalString(totalContractorFee)]}
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            {/* Total Construction Costs */}
            <div className="table-container">
                <DynamicRow
                    cellValues={["Total Costs to Break Ground"]}
                    isMobile={false}
                    numberOfCells={1}
                    header={true}
                />

                <DynamicRow
                    cellValues={["Total Costs to Break Ground", convertToPercent(totalCostsToBreakGround / totalCosts), totalCostsToBreakGround]}
                    description="Total cost to break ground"
                    isMobile={false}
                    numberOfCells={3}
                />

                <DynamicRow
                    cellValues={["Total Construction Costs", convertToPercent(totalConstructionCosts / totalCosts), totalConstructionCosts]}
                    description="Total construction costs"
                    isMobile={false}
                    numberOfCells={3}
                    inputCellIndex={2}
                />

                <DynamicRow
                    cellValues={["Total Costs", convertToPercent(totalCosts / totalCosts), roundAndLocalString(totalCosts)]}
                    description="Grand total costs"
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>

            <ShareButton params={params} />




            {/* <ShareButton params={params}/> */}

        </>

    );
};

export default ConstructionBudget;
