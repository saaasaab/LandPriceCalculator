import { routes } from "../components/Navbar";

export type HowToStep = {
  name: string;
  text: string;
};

export type RelatedLink = {
  path: string;
  label: string;
};

export type AioExtras = {
  keyTakeaways: string[];
  howToSteps: HowToStep[];
  relatedLinks: RelatedLink[];
};

export const AIO_EXTRAS: Record<string, AioExtras> = {
  [routes.HOME]: {
    keyTakeaways: [
      "Free calculators cover land development, multifamily investing, mortgages, IRR, and site plan design.",
      "Each tool targets one decision: pricing, feasibility, cash flow, or financing cost.",
      "Results update instantly as you change assumptions — no signup required for core tools.",
    ],
    howToSteps: [
      { name: "Choose your calculator", text: "Select the tool that matches your deal type from the home page or navigation menu." },
      { name: "Enter project assumptions", text: "Input land size, costs, rents, financing terms, or home price depending on the calculator." },
      { name: "Review outputs and iterate", text: "Compare results to your return hurdle and adjust inputs until the deal meets your target." },
    ],
    relatedLinks: [
      { path: routes.MULTI_FAMILY_PRICE_PER_DOOR, label: "Multifamily price per door calculator" },
      { path: routes.HOME_MORTGAGE_CALCULATOR, label: "Home mortgage payment calculator" },
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Multifamily development feasibility calculator" },
    ],
  },
  [routes.MULTIFAMILY_DEVELOPMENT]: {
    keyTakeaways: [
      "Feasibility depends on buildable units, all-in cost per unit, and market rent at stabilization.",
      "Parking ratio, setbacks, and impervious limits directly reduce net buildable acreage.",
      "Compare projected yield to your hurdle before making a land offer.",
    ],
    howToSteps: [
      { name: "Enter site acreage and zoning limits", text: "Input gross acres, setback requirements, and parking ratio for your multifamily zoning." },
      { name: "Add cost and revenue assumptions", text: "Set land price, construction cost per unit, and market rent per door." },
      { name: "Check yield and unit count", text: "Review estimated units, total development cost, and whether returns clear your target." },
    ],
    relatedLinks: [
      { path: routes.HOW_TO_LAND_FOR_MULTIFAMILY, label: "How to analyze land for multifamily development" },
      { path: routes.MULTIFAMILY_ANALYSIS, label: "Multifamily cash flow proforma calculator" },
      { path: routes.SITE_PLAN_BUILDER, label: "Site plan builder for apartment projects" },
    ],
  },
  [routes.INDUSTRIAL_DEVELOPMENT]: {
    keyTakeaways: [
      "Industrial feasibility compares land plus build cost against lease rate per SF and cap rate.",
      "Leasable square footage and coverage ratio determine revenue potential on the site.",
      "Horizontal infrastructure cost can make or break margin on smaller parcels.",
    ],
    howToSteps: [
      { name: "Input acreage and building parameters", text: "Enter gross acres, coverage, and target leasable square footage." },
      { name: "Set lease rate and development costs", text: "Add market rent per SF, hard costs, and soft cost assumptions." },
      { name: "Evaluate stabilized value", text: "Compare implied value at your expense ratio to total project cost." },
    ],
    relatedLinks: [
      { path: routes.INDUSTRIAL_PROFORMA, label: "Industrial property proforma calculator" },
      { path: routes.INDUSTRIAL_PRICE_PER_SQFT, label: "Industrial price per square foot calculator" },
      { path: routes.CONSTRUCTION_BUDGET, label: "Construction budget generator" },
    ],
  },
  [routes.COMMERCIAL_DEVELOPMENT]: {
    keyTakeaways: [
      "Commercial land value is driven by buildable SF, achievable rents, and stabilization cap rate.",
      "Vacancy and operating expense ratio materially affect NOI and project feasibility.",
      "Build-to-suit deals need tenant credit and lease term reflected in your yield assumption.",
    ],
    howToSteps: [
      { name: "Define buildable area", text: "Enter acreage, coverage, and leasable square footage for retail or office use." },
      { name: "Model rent and expenses", text: "Set lease rate per SF, vacancy, and operating expense ratio." },
      { name: "Test return against cost", text: "Compare stabilized NOI and implied value to all-in development cost." },
    ],
    relatedLinks: [
      { path: routes.INDUSTRIAL_PROFORMA, label: "Commercial proforma investment calculator" },
      { path: routes.CONSTRUCTION_BUDGET, label: "Development construction budget tool" },
      { path: routes.SITE_PLAN_BUILDER, label: "Commercial site plan designer" },
    ],
  },
  [routes.RESIDENTIAL_DEVELOPMENT]: {
    keyTakeaways: [
      "Lot yield equals net buildable acreage divided by lot size minus dedication.",
      "Infrastructure cost per lot must stay below finished lot sale price for profit.",
      "Roadway and utility dedications can cut yield significantly on smaller sites.",
    ],
    howToSteps: [
      { name: "Enter gross acres and lot size", text: "Input total acreage, target lot dimensions, and unbuildable area." },
      { name: "Add infrastructure costs", text: "Set development cost per lot including roads, utilities, and entitlements." },
      { name: "Calculate profit per lot", text: "Subtract all-in cost from finished lot price to test developer margin." },
    ],
    relatedLinks: [
      { path: routes.CONSTRUCTION_BUDGET, label: "Residential construction budget generator" },
      { path: routes.SITE_PLAN_BUILDER, label: "Subdivision site plan builder" },
      { path: routes.HOUSE_FLIPPING_CALCULATOR, label: "House flipping profit calculator" },
    ],
  },
  [routes.CONSTRUCTION_BUDGET]: {
    keyTakeaways: [
      "A complete budget covers land, soft costs, hard costs, financing, contingency, and developer fee.",
      "Line items should match lender and equity partner underwriting categories.",
      "Contingency of 5–10% is standard for vertical construction; land deals may need more.",
    ],
    howToSteps: [
      { name: "Select project type", text: "Choose residential, multifamily, or commercial to load the right cost categories." },
      { name: "Fill in line-item costs", text: "Enter land, entitlements, soft costs, hard costs, and financing assumptions." },
      { name: "Export or share the budget", text: "Review totals by category and use the output for lender or investor presentations." },
    ],
    relatedLinks: [
      { path: routes.CONSTRUCTION_LOAN_CALCULATOR, label: "Construction loan cost calculator" },
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Multifamily development feasibility tool" },
      { path: routes.HARD_MONEY_COST_ESTIMATOR, label: "Hard money loan cost estimator" },
    ],
  },
  [routes.MULTIFAMILY_ANALYSIS]: {
    keyTakeaways: [
      "NOI equals gross rent minus vacancy and operating expenses before debt service.",
      "Lenders typically require a DSCR of 1.20x–1.25x on multifamily acquisitions.",
      "Cap rate and cash-on-cash return both depend on purchase price and financing terms.",
    ],
    howToSteps: [
      { name: "Enter purchase price and unit rents", text: "Input acquisition cost, unit count, and monthly rent per unit." },
      { name: "Set expenses and financing", text: "Add vacancy, operating expenses, down payment, rate, and loan term." },
      { name: "Review cash flow metrics", text: "Check NOI, DSCR, cap rate, and cash-on-cash return against your hurdle." },
    ],
    relatedLinks: [
      { path: routes.MULTI_FAMILY_PRICE_PER_DOOR, label: "Multifamily price per door calculator" },
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Multifamily land development calculator" },
      { path: routes.HOME_MORTGAGE_CALCULATOR, label: "Residential mortgage payment calculator" },
    ],
  },
  [routes.INDUSTRIAL_PROFORMA]: {
    keyTakeaways: [
      "Industrial NOI is lease income per SF minus vacancy and operating expenses.",
      "Cash-on-cash return measures annual cash flow divided by equity invested.",
      "Triple-net leases shift expense responsibility to tenants and simplify underwriting.",
    ],
    howToSteps: [
      { name: "Input purchase price and leasable SF", text: "Enter acquisition cost and total rentable square footage." },
      { name: "Set lease rate and expenses", text: "Add market rent per SF, vacancy, and operating expense ratio." },
      { name: "Add loan terms", text: "Enter down payment, interest rate, and amortization to see cash-on-cash return." },
    ],
    relatedLinks: [
      { path: routes.INDUSTRIAL_PRICE_PER_SQFT, label: "Industrial price per SF calculator" },
      { path: routes.INDUSTRIAL_DEVELOPMENT, label: "Industrial development feasibility calculator" },
      { path: routes.MULTIFAMILY_ANALYSIS, label: "Multifamily rental proforma calculator" },
    ],
  },
  [routes.MULTI_FAMILY_PRICE_PER_DOOR]: {
    keyTakeaways: [
      "Max price per door is the price that hits your target cash-on-cash return after debt service.",
      "Higher rent and lower expenses increase the price you can justify per unit.",
      "Many investors target 6%–10% cash-on-cash depending on market risk.",
    ],
    howToSteps: [
      { name: "Enter rent and operating expenses", text: "Input monthly rent per unit, vacancy, taxes, insurance, and management fees." },
      { name: "Set financing terms", text: "Add down payment percentage, interest rate, and loan amortization." },
      { name: "Set your return hurdle", text: "Enter target cash-on-cash return to see the maximum price per door." },
    ],
    relatedLinks: [
      { path: routes.MULTIFAMILY_ANALYSIS, label: "Multifamily underwriting proforma" },
      { path: routes.HOME_MORTGAGE_CALCULATOR, label: "Home mortgage PITI calculator" },
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Apartment development feasibility tool" },
    ],
  },
  [routes.HOME_MORTGAGE_CALCULATOR]: {
    keyTakeaways: [
      "Monthly PITI includes principal, interest, taxes, insurance, PMI, and HOA fees.",
      "PMI applies when your down payment is below 20% of the home price.",
      "Extra monthly payments reduce total interest and shorten the loan payoff timeline.",
    ],
    howToSteps: [
      { name: "Enter home price and down payment", text: "Input purchase price, down payment amount or percentage, and loan term." },
      { name: "Add rate and housing costs", text: "Set interest rate, property tax, insurance, PMI, and HOA if applicable." },
      { name: "Review monthly payment and amortization", text: "See total PITI, cash to close, and how equity builds over the loan term." },
    ],
    relatedLinks: [
      { path: routes.MULTI_FAMILY_PRICE_PER_DOOR, label: "Multifamily price per door calculator" },
      { path: routes.HARD_MONEY_COST_ESTIMATOR, label: "Hard money loan cost calculator" },
      { path: routes.HOUSE_FLIPPING_CALCULATOR, label: "House flipping ROI calculator" },
    ],
  },
  [routes.INDUSTRIAL_PRICE_PER_SQFT]: {
    keyTakeaways: [
      "Value per SF equals stabilized NOI divided by cap rate, then divided by leasable area.",
      "Market lease rate and expense ratio are the primary drivers of industrial property value.",
      "Financing terms affect cash-on-cash return but not intrinsic value at a given cap rate.",
    ],
    howToSteps: [
      { name: "Enter leasable square footage", text: "Input total rentable SF and annual lease rate per square foot." },
      { name: "Set expenses and cap rate", text: "Add vacancy, operating expense ratio, and target capitalization rate." },
      { name: "Review max price per SF", text: "See the maximum price per square foot that meets your return target." },
    ],
    relatedLinks: [
      { path: routes.INDUSTRIAL_PROFORMA, label: "Industrial investment proforma calculator" },
      { path: routes.INDUSTRIAL_DEVELOPMENT, label: "Industrial land development feasibility" },
      { path: routes.MULTI_FAMILY_PRICE_PER_DOOR, label: "Multifamily per-door pricing calculator" },
    ],
  },
  [routes.IRR_CALCULATOR]: {
    keyTakeaways: [
      "Seller financing IRR measures the annualized return on the note the seller carries.",
      "Balloon payments and shorter terms increase seller IRR compared to fully amortizing notes.",
      "Compare seller IRR to an all-cash sale net proceeds to decide if carryback makes sense.",
    ],
    howToSteps: [
      { name: "Enter note terms", text: "Input sale price, down payment, interest rate, term, and balloon if any." },
      { name: "Review payment schedule", text: "See monthly payments and total interest earned over the note life." },
      { name: "Compare to cash alternative", text: "Evaluate seller IRR against discounted cash sale proceeds." },
    ],
    relatedLinks: [
      { path: routes.HARD_MONEY_COST_ESTIMATOR, label: "Hard money loan cost estimator" },
      { path: routes.HOUSE_FLIPPING_CALCULATOR, label: "Fix-and-flip profit calculator" },
      { path: routes.WATERFALL, label: "Real estate waterfall distribution calculator" },
    ],
  },
  [routes.HARD_MONEY_COST_ESTIMATOR]: {
    keyTakeaways: [
      "Hard money all-in cost includes points, monthly interest, draw fees, and exit fees.",
      "Interest accrues on the full outstanding balance, not just undrawn amounts.",
      "Effective borrowing rate is higher than quoted rate once points and fees are included.",
    ],
    howToSteps: [
      { name: "Enter loan amount and rate", text: "Input principal, quoted interest rate, and origination points." },
      { name: "Set hold period and fees", text: "Add loan term in months plus any inspection, draw, or exit fees." },
      { name: "Review total cost", text: "See total interest, fees, and effective annual borrowing rate." },
    ],
    relatedLinks: [
      { path: routes.HOUSE_FLIPPING_CALCULATOR, label: "House flipping profit calculator" },
      { path: routes.CONSTRUCTION_LOAN_CALCULATOR, label: "Construction loan interest calculator" },
      { path: routes.IRR_CALCULATOR, label: "Seller financing IRR calculator" },
    ],
  },
  [routes.HOUSE_FLIPPING_CALCULATOR]: {
    keyTakeaways: [
      "Flip profit equals ARV minus purchase, rehab, holding, financing, and selling costs.",
      "Holding costs and loan interest grow with longer renovation timelines.",
      "Target 15%–20% ROI on invested capital as a common investor hurdle.",
    ],
    howToSteps: [
      { name: "Enter purchase and ARV", text: "Input acquisition price and after-repair value based on comparable sales." },
      { name: "Add rehab and holding costs", text: "Set renovation budget, monthly carrying costs, and loan terms." },
      { name: "Review net profit and ROI", text: "See net profit and return on invested capital after all costs." },
    ],
    relatedLinks: [
      { path: routes.HARD_MONEY_COST_ESTIMATOR, label: "Hard money loan cost calculator" },
      { path: routes.HOME_MORTGAGE_CALCULATOR, label: "Home mortgage payment calculator" },
      { path: routes.RESIDENTIAL_DEVELOPMENT, label: "Residential lot development calculator" },
    ],
  },
  [routes.WATERFALL]: {
    keyTakeaways: [
      "Waterfalls pay preferred return to LPs before GP promote tiers kick in.",
      "Promote tiers split profits at escalating IRR or equity multiple hurdles.",
      "Clear hurdle definitions prevent disputes at distribution time.",
    ],
    howToSteps: [
      { name: "Define equity splits", text: "Enter GP and LP equity contributions and preferred return rate." },
      { name: "Set promote tiers", text: "Add hurdle rates and profit split percentages for each tier." },
      { name: "Model distributions", text: "See how cash flow distributes between GP and LP at each return level." },
    ],
    relatedLinks: [
      { path: routes.IRR_CALCULATOR, label: "Seller financing IRR calculator" },
      { path: routes.MULTIFAMILY_ANALYSIS, label: "Multifamily investment proforma" },
      { path: routes.INDUSTRIAL_PROFORMA, label: "Industrial property proforma calculator" },
    ],
  },
  [routes.CONSTRUCTION_LOAN_CALCULATOR]: {
    keyTakeaways: [
      "Construction loan interest accrues on each draw as funds are disbursed, not upfront.",
      "Interest reserves are often required and add to total project cost.",
      "Extension fees apply if construction exceeds the original loan term.",
    ],
    howToSteps: [
      { name: "Set loan amount and rate", text: "Enter total commitment, interest rate, and origination points." },
      { name: "Define draw schedule", text: "Input draw amounts and timing across the construction period." },
      { name: "Review total interest cost", text: "See interest per draw, total interest, and all-in borrowing cost." },
    ],
    relatedLinks: [
      { path: routes.CONSTRUCTION_BUDGET, label: "Construction budget generator" },
      { path: routes.HARD_MONEY_COST_ESTIMATOR, label: "Hard money loan cost estimator" },
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Ground-up development feasibility calculator" },
    ],
  },
  [routes.SITE_PLAN_BUILDER]: {
    keyTakeaways: [
      "A site plan shows property lines, buildings, parking, driveways, and setbacks.",
      "Parking count and circulation drive usable coverage and entitlement approval.",
      "Early layout testing saves civil engineering fees before formal drawings.",
    ],
    howToSteps: [
      { name: "Draw the property boundary", text: "Trace or enter the parcel outline and set scale." },
      { name: "Place buildings and parking", text: "Add building footprints, parking stalls, and driveway entrances." },
      { name: "Check coverage and circulation", text: "Review stall count, setbacks, and driveway flow before entitlements." },
    ],
    relatedLinks: [
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Multifamily development feasibility calculator" },
      { path: routes.RESIDENTIAL_DEVELOPMENT, label: "Residential subdivision lot yield calculator" },
      { path: routes.INDUSTRIAL_DEVELOPMENT, label: "Industrial development feasibility tool" },
    ],
  },
  [routes.HOW_TO_LAND_FOR_MULTIFAMILY]: {
    keyTakeaways: [
      "Confirm zoning allows multifamily density before pricing land.",
      "Model units per acre against parking and setback requirements.",
      "Compare all-in development cost to stabilized value at market cap rate.",
    ],
    howToSteps: [
      { name: "Verify zoning and density", text: "Check allowed units per acre, height limits, and parking ratios." },
      { name: "Estimate buildable units", text: "Subtract unbuildable area and apply density limits to get unit count." },
      { name: "Run a feasibility model", text: "Use the multifamily development calculator to test cost versus return." },
    ],
    relatedLinks: [
      { path: routes.MULTIFAMILY_DEVELOPMENT, label: "Multifamily development feasibility calculator" },
      { path: routes.MULTIFAMILY_ANALYSIS, label: "Multifamily investment proforma" },
      { path: routes.SITE_PLAN_BUILDER, label: "Apartment site plan builder" },
    ],
  },
};

export function getAioExtras(path: string): AioExtras | undefined {
  return AIO_EXTRAS[path];
}
