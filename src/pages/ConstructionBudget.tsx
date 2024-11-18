

import { useState } from 'react';
import DynamicRow from '../components/RowTypes/DynamicRow';
import { EPageNames } from '../utils/types';

import { convertToPercent, removeCommas } from '../utils/utils';
import { constructionBudgetCalculations } from '../utils/constructionBudgetCalculations';

import './DynamicTable.scss';


const ConstructionBudget = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {

    console.log(`isMobile, page`, isMobile, page)
    // Land Costs
    const [landAcquisition, setLandAcquisition] = useState<string>('62,000');
    const [closingCosts, setClosingCosts] = useState<string>('3,000');


    // Designs and Engineering Costs
    const [architecturalDesigns, setArchitecturalDesigns] = useState<string>('20,625');
    const [civilEngineering, setCivilEngineering] = useState<string>('10,000');
    const [surveying, setSurveying] = useState<string>('10,000');
    const [landscapeDesign, setLandscapeDesign] = useState<string>('1,000');
    const [geotechnical, setGeotechnical] = useState<string>('3,000');
    const [mepEngineering, setMepEngineering] = useState<string>('15,000');

    // City application, review, and permit fees
    const [preApplication, setPreApplication] = useState<string>('1,500');
    const [siteDesignReview, setSiteDesignReview] = useState<string>('4,467');
    const [sitePlanReview, setSitePlanReview] = useState<string>('1,000');
    const [buildingPermit, setBuildingPermit] = useState<string>('369');

    // System development charges
    const [stormwater, setStormwater] = useState<string>('1,972');
    const [transportation, setTransportation] = useState<string>('27,335');
    const [sanitarySewer, setSanitarySewer] = useState<string>('3,411');
    const [parks, setParks] = useState<string>('5,684');
    const [water, setWater] = useState<string>('1,0979');

    // Land Preparation Costs
    const [excavation, setExcavation] = useState<string>('15,000');
    const [waterRetention, setWaterRetention] = useState<string>('10,000');
    const [foundation, setFoundation] = useState<string>('76,000');
    const [asphalt, setAsphalt] = useState<string>('26,000');

    // Rough Buildout Costs
    const [lumber, setLumber] = useState<string>('60,000');
    const [trusses, setTrusses] = useState<string>('17,000');
    const [framingLabor, setFramingLabor] = useState<string>('58,000');
    const [windows, setWindows] = useState<string>('9,000');
    const [siding, setSiding] = useState<string>('31,000');
    const [hvac, setHvac] = useState<string>('18,000');
    const [plumbing, setPlumbing] = useState<string>('20,000');
    const [electrical, setElectrical] = useState<string>('62,000');
    const [gasPiping, setGasPiping] = useState<string>('3,000');
    const [gutters, setGutters] = useState<string>('5,000');
    const [roofing, setRoofing] = useState<string>('14,000');
    const [exteriorDoors, setExteriorDoors] = useState<string>('4,000');

    // Finishings Costs
    const [insulation, setInsulation] = useState<string>('14,000');
    const [drywall, setDrywall] = useState<string>('50,000');
    const [interiorTrim, setInteriorTrim] = useState<string>('44,000');
    const [painting, setPainting] = useState<string>('45,000');
    const [cabinets, setCabinets] = useState<string>('4,000');
    const [countertops, setCountertops] = useState<string>('11,000');
    const [flooring, setFlooring] = useState<string>('11,000');
    const [carpet, setCarpet] = useState<string>('11,000');
    const [hardware, setHardware] = useState<string>('4,000');
    const [appliances, setAppliances] = useState<string>('4,000');
    const [lightFixtures, setLightFixtures] = useState<string>('5,000');
    const [windowCovering, setWindowCovering] = useState<string>('7,000');
    const [cleanup, setCleanup] = useState<string>('10,000');
    const [flatwork, setFlatwork] = useState<string>('6,000');
    const [fences, setFences] = useState<string>('1,000');
    const [landscaping, setLandscaping] = useState<string>('13,000');

    // Contractor Fee and Contingencies
    const [generalConditions, setGeneralConditions] = useState<string>('10,000');
    const [contractorFee, setContractorFee] = useState<string>('136,000');

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
                    cellValues={["Land Acquisition Costs", convertToPercent(totalLandCosts / totalCosts), totalLandCosts]}
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
                    cellValues={["Designs and Engineering", convertToPercent(totalDesignsEngineering / totalCosts), totalDesignsEngineering]}
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
                    cellValues={["Total Designs and Engineering Costs", convertToPercent(totalCityFees / totalCosts), totalCityFees]}
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
                    cellValues={["Total System Development Charges Costs", convertToPercent(totalSystemDevelopmentCharges / totalCosts), totalSystemDevelopmentCharges]}
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
                    cellValues={["Total Land Preparation Costs", convertToPercent(totalLandPreparation / totalCosts), totalLandPreparation]}
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
                    cellValues={["Total Rough Buildout Costs", convertToPercent(totalRoughBuildout / totalCosts), totalRoughBuildout]}
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
                    cellValues={["Total ontractor Fee and Contingencies Costs", convertToPercent(totalFinishings / totalCosts), totalFinishings]}
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
                    cellValues={["Total ontractor Fee and Contingencies Costs", convertToPercent(totalContractorFee / totalCosts), totalContractorFee]}
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
                    cellValues={["Total Costs", convertToPercent(totalCosts / totalCosts), totalCosts]}
                    description="Grand total costs"
                    isMobile={false}
                    numberOfCells={3}
                    output={true}
                />
            </div>



            
            {/* <ShareButton params={params}/> */}

        </>

    );
};

export default ConstructionBudget;
