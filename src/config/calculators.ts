import { routes } from "./routes";
import { EPageNames, EPageTitles } from "../utils/types";

export type ToolCategoryId =
  | "land-feasibility"
  | "acquisition-valuation"
  | "construction-site"
  | "financing"
  | "operations"
  | "returns"
  | "selling-flipping";

export type ToolAudienceId =
  | "developer"
  | "investor"
  | "property-manager"
  | "realtor"
  | "flipper";

export type CalculatorIconName =
  | "home"
  | "building2"
  | "factory"
  | "landmark"
  | "barChart3"
  | "circleDollarSign"
  | "lineChart"
  | "ruler"
  | "doorOpen"
  | "hotel"
  | "trendingUp"
  | "piggyBank"
  | "paintRoller"
  | "gitFork"
  | "banknote"
  | "calendarClock"
  | "hardHat"
  | "map"
  | "mountain"
  | "layoutGrid"
  | "calculator";

export type CalculatorTool = {
  id: string;
  page?: EPageNames;
  route: string;
  name: string;
  description: string;
  primaryAnswer: string;
  category: ToolCategoryId;
  audiences: ToolAudienceId[];
  propertyTypes: string[];
  searchTerms: string[];
  icon: CalculatorIconName;
  isAlpha?: boolean;
  isDesktopOnly?: boolean;
  isPremium?: boolean;
  isLabs?: boolean;
};

export const TOOL_CATEGORIES: { id: ToolCategoryId; label: string }[] = [
  { id: "land-feasibility", label: "Land and feasibility" },
  { id: "acquisition-valuation", label: "Acquisition and valuation" },
  { id: "construction-site", label: "Construction and site planning" },
  { id: "financing", label: "Financing" },
  { id: "operations", label: "Operations" },
  { id: "returns", label: "Returns and deal structure" },
  { id: "selling-flipping", label: "Selling and flipping" },
];

export const TOOL_AUDIENCES: { id: ToolAudienceId; label: string }[] = [
  { id: "developer", label: "Developer" },
  { id: "investor", label: "Investor" },
  { id: "property-manager", label: "Property manager" },
  { id: "realtor", label: "Realtor" },
  { id: "flipper", label: "Flipper" },
];

export const CALCULATORS: CalculatorTool[] = [
  {
    id: "residential-development",
    page: EPageNames.RESIDENTIAL_DEVELOPMENT,
    route: routes.RESIDENTIAL_DEVELOPMENT,
    name: EPageTitles.RESIDENTIAL_DEVELOPMENT,
    description: "Find max land price and lot yield for a subdivision.",
    primaryAnswer: "Maximum land price and lot yield",
    category: "land-feasibility",
    audiences: ["developer"],
    propertyTypes: ["Land", "Residential"],
    searchTerms: ["maximum land price", "lot yield", "what can I afford to pay for this land", "subdivision", "lots"],
    icon: "home",
  },
  {
    id: "multifamily-development",
    page: EPageNames.MULTIFAMILY_DEVELOPMENT,
    route: routes.MULTIFAMILY_DEVELOPMENT,
    name: EPageTitles.MULTIFAMILY_DEVELOPMENT,
    description: "Check unit yield, costs, and whether the site works.",
    primaryAnswer: "Buildable units and development feasibility",
    category: "land-feasibility",
    audiences: ["developer"],
    propertyTypes: ["Land", "Multifamily"],
    searchTerms: ["how many units will fit", "apartment development", "density", "parking ratio"],
    icon: "building2",
  },
  {
    id: "industrial-development",
    page: EPageNames.INDUSTRIAL_DEVELOPMENT,
    route: routes.INDUSTRIAL_DEVELOPMENT,
    name: EPageTitles.INDUSTRIAL_DEVELOPMENT,
    description: "Test land cost, lease rates, and site yield.",
    primaryAnswer: "Industrial site feasibility and land value",
    category: "land-feasibility",
    audiences: ["developer"],
    propertyTypes: ["Land", "Industrial"],
    searchTerms: ["warehouse", "flex industrial", "lease rate", "coverage"],
    icon: "factory",
  },
  {
    id: "commercial-development",
    page: EPageNames.COMMERCIAL_DEVELOPMENT,
    route: routes.COMMERCIAL_DEVELOPMENT,
    name: EPageTitles.COMMERCIAL_DEVELOPMENT,
    description: "Model retail or office land cost and returns.",
    primaryAnswer: "Commercial land feasibility",
    category: "land-feasibility",
    audiences: ["developer"],
    propertyTypes: ["Land", "Commercial"],
    searchTerms: ["retail", "office", "build to suit", "commercial land"],
    icon: "landmark",
  },
  {
    id: "multifamily-price-per-door",
    page: EPageNames.MULTI_FAMILY_PRICE_PER_DOOR,
    route: routes.MULTI_FAMILY_PRICE_PER_DOOR,
    name: EPageTitles.MULTI_FAMILY_PRICE_PER_DOOR,
    description: "Find the most you can pay based on units and returns.",
    primaryAnswer: "Maximum price per door",
    category: "acquisition-valuation",
    audiences: ["investor", "developer"],
    propertyTypes: ["Multifamily"],
    searchTerms: ["price per door", "what should I pay", "apartment", "max offer", "what rent do I need"],
    icon: "doorOpen",
  },
  {
    id: "hotel-price-per-key",
    page: EPageNames.HOTEL_PRICE_PER_KEY,
    route: routes.HOTEL_PRICE_PER_KEY,
    name: EPageTitles.HOTEL_PRICE_PER_KEY,
    description: "Price rooms from ADR, vacancy, and target return.",
    primaryAnswer: "Maximum price per key",
    category: "acquisition-valuation",
    audiences: ["investor"],
    propertyTypes: ["Hotel"],
    searchTerms: ["price per key", "ADR", "RevPAR", "hotel occupancy", "vacancy"],
    icon: "hotel",
  },
  {
    id: "industrial-price-per-sqft",
    page: EPageNames.INDUSTRIAL_PRICE_PER_SQFT,
    route: routes.INDUSTRIAL_PRICE_PER_SQFT,
    name: EPageTitles.INDUSTRIAL_PRICE_PER_SQFT,
    description: "Value industrial space from lease rate and expenses.",
    primaryAnswer: "Maximum price per square foot",
    category: "acquisition-valuation",
    audiences: ["investor"],
    propertyTypes: ["Industrial"],
    searchTerms: ["price per sqft", "warehouse value", "lease rate"],
    icon: "ruler",
  },
  {
    id: "multifamily-proforma",
    page: EPageNames.MULTIFAMILY_ANALYSIS,
    route: routes.MULTIFAMILY_ANALYSIS,
    name: EPageTitles.MULTIFAMILY_ANALYSIS,
    description: "Model income, expenses, and long-term cash flow.",
    primaryAnswer: "Cash flow, DSCR, and cap rate",
    category: "acquisition-valuation",
    audiences: ["investor", "property-manager", "developer"],
    propertyTypes: ["Multifamily"],
    searchTerms: ["apartment pro forma", "proforma", "will this project make money", "NOI", "cash flow"],
    icon: "circleDollarSign",
  },
  {
    id: "industrial-proforma",
    page: EPageNames.INDUSTRIAL_PROFORMA,
    route: routes.INDUSTRIAL_PROFORMA,
    name: EPageTitles.INDUSTRIAL_PROFORMA,
    description: "Model lease income, expenses, and cash-on-cash.",
    primaryAnswer: "NOI and cash-on-cash return",
    category: "acquisition-valuation",
    audiences: ["investor"],
    propertyTypes: ["Industrial", "Commercial"],
    searchTerms: ["industrial proforma", "commercial proforma", "NNN"],
    icon: "lineChart",
  },
  {
    id: "construction-budget",
    page: EPageNames.CONSTRUCTION_BUDGET,
    route: routes.CONSTRUCTION_BUDGET,
    name: EPageTitles.CONSTRUCTION_BUDGET,
    description: "Build a line-item budget from land through contingency.",
    primaryAnswer: "Total construction budget",
    category: "construction-site",
    audiences: ["developer"],
    propertyTypes: ["Residential", "Multifamily", "Commercial"],
    searchTerms: ["construction budget", "hard costs", "soft costs", "contingency"],
    icon: "calculator",
  },
  {
    id: "site-plan-builder",
    page: EPageNames.SITE_PLAN_BUILDER,
    route: routes.SITE_PLAN_BUILDER,
    name: EPageTitles.SITE_PLAN_BUILDER,
    description: "Draw boundaries, parking, and building footprints.",
    primaryAnswer: "Site layout and coverage",
    category: "construction-site",
    audiences: ["developer"],
    propertyTypes: ["Land"],
    searchTerms: ["site plan", "parking layout", "setbacks", "site plan generator"],
    icon: "map",
    isAlpha: true,
    isDesktopOnly: true,
    isLabs: true,
  },
  {
    id: "cut-fill",
    page: EPageNames.CUT_FILL_CALCULATOR,
    route: routes.CUT_FILL_CALCULATOR,
    name: EPageTitles.CUT_FILL_CALCULATOR,
    description: "Estimate earthwork volumes from existing and finished grades.",
    primaryAnswer: "Cut and fill volume in cubic yards",
    category: "construction-site",
    audiences: ["developer"],
    propertyTypes: ["Land"],
    searchTerms: ["earthwork", "cut fill", "grading", "cubic yards"],
    icon: "mountain",
    isAlpha: true,
    isDesktopOnly: true,
    isLabs: true,
  },
  {
    id: "terrain-slope",
    page: EPageNames.TOPOLOGY_ANALYSIS,
    route: routes.TOPOLOGY_ANALYSIS,
    name: EPageTitles.TOPOLOGY_ANALYSIS,
    description: "Analyze slope, drainage, and buildable pads.",
    primaryAnswer: "Slope, drainage, and site development score",
    category: "construction-site",
    audiences: ["developer"],
    propertyTypes: ["Land"],
    searchTerms: ["slope", "topography", "topology", "drainage", "contours", "terrain"],
    icon: "map",
    isAlpha: true,
    isDesktopOnly: true,
    isLabs: true,
  },
  {
    id: "subdivision-generator",
    page: EPageNames.SUBDIVISION_GENERATOR,
    route: routes.SUBDIVISION_GENERATOR,
    name: EPageTitles.SUBDIVISION_GENERATOR,
    description: "Trace a parcel and prepare a residential lot layout.",
    primaryAnswer: "Scaled subdivision layout",
    category: "construction-site",
    audiences: ["developer"],
    propertyTypes: ["Land", "Residential"],
    searchTerms: ["subdivision", "lot layout", "parcel"],
    icon: "layoutGrid",
    isAlpha: true,
    isDesktopOnly: true,
    isLabs: true,
  },
  {
    id: "construction-loan",
    page: EPageNames.CONSTRUCTION_LOAN_CALCULATOR,
    route: routes.CONSTRUCTION_LOAN_CALCULATOR,
    name: EPageTitles.CONSTRUCTION_LOAN_CALCULATOR,
    description: "Model draws, interest reserves, and all-in loan cost.",
    primaryAnswer: "Construction loan interest and all-in cost",
    category: "financing",
    audiences: ["developer"],
    propertyTypes: ["Land", "Residential", "Multifamily"],
    searchTerms: ["construction loan", "how much will the construction loan cost", "draws", "interest reserve"],
    icon: "hardHat",
  },
  {
    id: "hard-money",
    page: EPageNames.HARD_MONEY_COST_ESTIMATOR,
    route: routes.HARD_MONEY_COST_ESTIMATOR,
    name: EPageTitles.HARD_MONEY_COST_ESTIMATOR,
    description: "Estimate points, interest, and total hard-money cost.",
    primaryAnswer: "Total hard money loan cost",
    category: "financing",
    audiences: ["flipper", "developer"],
    propertyTypes: ["Residential"],
    searchTerms: ["hard money", "bridge loan", "points", "fix and flip financing"],
    icon: "piggyBank",
  },
  {
    id: "home-mortgage",
    page: EPageNames.HOME_MORTGAGE_CALCULATOR,
    route: routes.HOME_MORTGAGE_CALCULATOR,
    name: EPageTitles.HOME_MORTGAGE_CALCULATOR,
    description: "Calculate monthly PITI, PMI, and HOA payments.",
    primaryAnswer: "Monthly mortgage payment",
    category: "financing",
    audiences: ["realtor", "investor"],
    propertyTypes: ["Residential"],
    searchTerms: ["mortgage", "PITI", "monthly payment", "amortization"],
    icon: "banknote",
  },
  {
    id: "lease-expiry",
    page: EPageNames.LEASE_EXPIRY_SCHEDULE,
    route: routes.LEASE_EXPIRY_SCHEDULE,
    name: EPageTitles.LEASE_EXPIRY_SCHEDULE,
    description: "Track lease expirations, WALT, and rollover risk.",
    primaryAnswer: "WALT and rollover risk",
    category: "operations",
    audiences: ["property-manager", "investor"],
    propertyTypes: ["Multifamily", "Commercial", "Industrial"],
    searchTerms: ["lease expiry", "WALT", "rollover", "tenant"],
    icon: "calendarClock",
  },
  {
    id: "seller-irr",
    page: EPageNames.IRR_CALCULATOR,
    route: routes.IRR_CALCULATOR,
    name: EPageTitles.IRR_CALCULATOR,
    description: "Estimate IRR on seller financing or carryback.",
    primaryAnswer: "Seller financing IRR",
    category: "returns",
    audiences: ["realtor", "investor"],
    propertyTypes: ["Residential", "Commercial"],
    searchTerms: ["IRR", "seller financing", "carryback", "owner finance"],
    icon: "trendingUp",
  },
  {
    id: "waterfall",
    page: EPageNames.WATERFALL_GENERATOR,
    route: routes.WATERFALL,
    name: EPageTitles.WATERFALL_GENERATOR,
    description: "Model preferred return, promote, and GP/LP splits.",
    primaryAnswer: "GP and LP distribution at each hurdle",
    category: "returns",
    audiences: ["investor", "developer"],
    propertyTypes: ["Multifamily", "Commercial"],
    searchTerms: ["waterfall", "promote", "preferred return", "syndication"],
    icon: "gitFork",
  },
  {
    id: "house-flipping",
    page: EPageNames.HOUSE_FLIPPING_CALCULATOR,
    route: routes.HOUSE_FLIPPING_CALCULATOR,
    name: EPageTitles.HOUSE_FLIPPING_CALCULATOR,
    description: "Analyze purchase, rehab, and net flip profit.",
    primaryAnswer: "Flip profit and return on invested capital",
    category: "selling-flipping",
    audiences: ["flipper"],
    propertyTypes: ["Residential"],
    searchTerms: ["flipping profit", "ARV", "rehab", "fix and flip"],
    icon: "paintRoller",
  },
];

export const WORKFLOWS: { question: string; route: string; label: string }[] = [
  { question: "What can I afford to pay for this land?", route: routes.RESIDENTIAL_DEVELOPMENT, label: "Residential land price" },
  { question: "How many units will fit?", route: routes.MULTIFAMILY_DEVELOPMENT, label: "Multifamily unit yield" },
  { question: "Will this project make money?", route: routes.MULTIFAMILY_ANALYSIS, label: "Multifamily proforma" },
  { question: "How much will the construction loan cost?", route: routes.CONSTRUCTION_LOAN_CALCULATOR, label: "Construction loan cost" },
  { question: "What should I pay per door?", route: routes.MULTI_FAMILY_PRICE_PER_DOOR, label: "Price per door" },
  { question: "What is a fair flipping profit?", route: routes.HOUSE_FLIPPING_CALCULATOR, label: "House flip profit" },
  { question: "How steep is this site?", route: routes.TOPOLOGY_ANALYSIS, label: "Terrain and slope" },
];

export const LEARN_LINKS: { label: string; route: string }[] = [
  { label: "How to analyze land for multifamily", route: routes.HOW_TO_LAND_FOR_MULTIFAMILY },
  { label: "Browse all calculators", route: routes.TOOLS },
];

export function getCategoryLabel(id: ToolCategoryId): string {
  return TOOL_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

function toolSearchFields(tool: CalculatorTool): { text: string; weight: number }[] {
  return [
    { text: tool.name, weight: 10 },
    { text: tool.searchTerms.join(" "), weight: 8 },
    { text: tool.primaryAnswer, weight: 5 },
    { text: tool.propertyTypes.join(" "), weight: 4 },
    { text: tool.description, weight: 2 },
    { text: getCategoryLabel(tool.category), weight: 2 },
  ];
}

function fieldScore(text: string, query: string, tokens: string[]): number {
  const lower = text.toLowerCase();
  if (!lower) return 0;

  const words = lower.split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;

  if (lower === query) score += 100;
  else if (lower.startsWith(query)) score += 60;
  else if (lower.includes(query)) score += 30;

  for (const token of tokens) {
    if (words.some((word) => word === token)) score += 20;
    else if (words.some((word) => word.startsWith(token))) score += 12;
    else if (lower.includes(token)) score += 4;
  }

  return score;
}

function scoreCalculator(tool: CalculatorTool, query: string, tokens: string[]): number {
  const haystack = toolSearchFields(tool)
    .map((field) => field.text)
    .join(" ")
    .toLowerCase();

  const matchesEveryToken = tokens.every((token) => haystack.includes(token));
  if (!matchesEveryToken) return 0;

  return toolSearchFields(tool).reduce(
    (total, field) => total + fieldScore(field.text, query, tokens) * field.weight,
    0,
  );
}

export function searchCalculators(
  query: string,
  category?: ToolCategoryId | "all" | "labs",
  audience?: ToolAudienceId | "all",
): CalculatorTool[] {
  const normalizedQuery = query.trim().toLowerCase();
  const tokens = normalizedQuery.split(/[^a-z0-9]+/).filter(Boolean);

  const filtered = CALCULATORS.filter((tool) => {
    if (category === "labs") {
      if (!tool.isLabs) return false;
    } else if (category && category !== "all" && tool.category !== category) {
      return false;
    }

    if (audience && audience !== "all" && !tool.audiences.includes(audience)) {
      return false;
    }

    if (!normalizedQuery) return true;
    return scoreCalculator(tool, normalizedQuery, tokens) > 0;
  });

  if (!normalizedQuery) return filtered;

  return filtered.sort((left, right) => {
    return scoreCalculator(right, normalizedQuery, tokens) - scoreCalculator(left, normalizedQuery, tokens);
  });
}
