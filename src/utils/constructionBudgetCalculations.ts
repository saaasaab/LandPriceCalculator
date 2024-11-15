import { convertInputsToNumbers } from "./utils";

type TConstructionBudgetCalculationsInputs = {
    appliances: string;
    architecturalDesigns: string;
    asphalt: string;
    buildingPermit: string;
    cabinets: string;
    carpet: string;
    civilEngineering: string;
    cleanup: string;
    closingCosts: string;
    contractorFee: string;
    countertops: string;
    drywall: string;
    electrical: string;
    excavation: string;
    exteriorDoors: string;
    fences: string;
    flatwork: string;
    flooring: string;
    foundation: string;
    framingLabor: string;
    gasPiping: string;
    generalConditions: string;
    geotechnical: string;
    gutters: string;
    hardware: string;
    hvac: string;
    insulation: string;
    interiorTrim: string;
    landAcquisition: string;
    landscapeDesign: string;
    landscaping: string;
    lightFixtures: string;
    lumber: string;
    mepEngineering: string;
    painting: string;
    parks: string;
    plumbing: string;
    preApplication: string;
    roofing: string;
    sanitarySewer: string;
    siding: string;
    siteDesignReview: string;
    sitePlanReview: string;
    stormwater: string;
    surveying: string;
    transportation: string;
    trusses: string;
    water: string;
    waterRetention: string;
    windowCovering: string;
    windows: string;
};

type TConstructionBudgetCalculationsOutputs = {
    totalLandCosts: number;
      totalDesignsEngineering: number;
      totalCityFees: number;
      totalSystemDevelopmentCharges: number;
      totalLandPreparation: number;
      totalRoughBuildout: number;
      totalFinishings: number;
      totalContractorFee: number;
      totalConstructionCosts: number;
      totalCostsToBreakGround: number;
      totalCosts: number;
};

export const constructionBudgetCalculations = (inputs:TConstructionBudgetCalculationsInputs): TConstructionBudgetCalculationsOutputs  => {

    const {
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
      } = convertInputsToNumbers(inputs)

    // Calculate totals
    const totalLandCosts = landAcquisition + closingCosts;
    const totalDesignsEngineering = architecturalDesigns + civilEngineering + surveying + landscapeDesign + geotechnical + mepEngineering;
    const totalCityFees = preApplication + siteDesignReview + sitePlanReview + buildingPermit;
    const totalSystemDevelopmentCharges = stormwater + transportation + sanitarySewer + parks + water;
    const totalLandPreparation = excavation + waterRetention + foundation + asphalt;
    const totalRoughBuildout = lumber + trusses + framingLabor + windows + siding + hvac + plumbing + electrical + gasPiping + gutters + roofing + exteriorDoors;
    const totalFinishings = insulation + drywall + interiorTrim + painting + cabinets + countertops + flooring + carpet + hardware + appliances + lightFixtures + windowCovering + cleanup + flatwork + fences + landscaping;
    const totalContractorFee = generalConditions + contractorFee;
  
    const totalConstructionCosts = totalLandPreparation + totalRoughBuildout + totalFinishings + totalContractorFee;
    const totalCostsToBreakGround = totalLandCosts + totalDesignsEngineering + totalCityFees + totalSystemDevelopmentCharges;
    const totalCosts = totalCostsToBreakGround + totalConstructionCosts;
  
    return {
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
    };
  };
  