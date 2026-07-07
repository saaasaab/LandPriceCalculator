import { routes } from "../config/routes";
import { EPageNames } from "./types";
import { getAioExtras, HowToStep, RelatedLink } from "./pageMetaAio";

export const SITE_NAME = "Land Price Calculator";
export const SITE_URL = "https://www.landpricecalculator.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon-192x192.png`;
export const INDEXNOW_KEY = "8f3c2a9e1d4b7f6a0c5e8d2b9f1a4c7e";

export type FaqItem = {
  question: string;
  answer: string;
};

export type { HowToStep, RelatedLink };

export type PageMetaConfig = {
  title: string;
  description: string;
  path: string;
  geoAnswer: string;
  faqs?: FaqItem[];
  keyTakeaways?: string[];
  howToSteps?: HowToStep[];
  relatedLinks?: RelatedLink[];
  type?: "website" | "article";
  noIndex?: boolean;
  schemaType?: "WebApplication" | "WebPage" | "Article";
};

export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  description:
    "Land Price Calculator provides free real estate development, investment, and mortgage calculators for developers, investors, and analysts.",
};

const DEFAULT_META: PageMetaConfig = {
  title: `What Real Estate Calculators Do Developers Use? | ${SITE_NAME}`,
  description:
    "Free calculators for land development, multifamily analysis, mortgages, IRR, hard money loans, and site plans. Built for developers and investors.",
  path: "/",
  geoAnswer:
    "Land Price Calculator is a free suite of real estate tools that estimates land value, development costs, mortgage payments, and investment returns. Enter your project assumptions to get instant, shareable results.",
  type: "website",
  schemaType: "WebPage",
  faqs: [
    {
      question: "What is Land Price Calculator?",
      answer:
        "Land Price Calculator is a free web platform with calculators for land development, multifamily investing, home mortgages, IRR, hard money loans, and site plan design.",
    },
    {
      question: "Who should use Land Price Calculator?",
      answer:
        "Developers, investors, brokers, and analysts use it to model feasibility, pricing, cash flow, and financing before making acquisition or development decisions.",
    },
  ],
};

function calculator(
  path: string,
  title: string,
  description: string,
  geoAnswer: string,
  faqs: FaqItem[],
): PageMetaConfig {
  return {
    path,
    title: `${title} | ${SITE_NAME}`,
    description,
    geoAnswer,
    faqs,
    type: "website",
    schemaType: "WebApplication",
  };
}

export const PAGE_META: Record<string, PageMetaConfig> = {
  [routes.HOME]: {
    ...DEFAULT_META,
    title: `What Real Estate Calculators Do Developers Use? | ${SITE_NAME}`,
    description:
      "Free calculators for land development, multifamily analysis, mortgages, IRR, hard money loans, and site plans. Built for developers and investors.",
    geoAnswer: DEFAULT_META.geoAnswer,
    faqs: DEFAULT_META.faqs,
  },
  [routes.LANDING_PAGE]: {
    path: routes.LANDING_PAGE,
    title: `Which Real Estate Calculator Should I Use? | ${SITE_NAME}`,
    description:
      "Browse every free calculator for multifamily, industrial, residential development, mortgages, flipping, IRR, and site plan design in one place.",
    geoAnswer:
      "Pick the calculator that matches your deal type: per-door pricing for multifamily, development feasibility for land, mortgage PITI for homes, or site plan layout for entitlements.",
    faqs: DEFAULT_META.faqs,
    type: "website",
    schemaType: "WebPage",
  },
  [routes.MULTIFAMILY_DEVELOPMENT]: calculator(
    routes.MULTIFAMILY_DEVELOPMENT,
    "How Do You Analyze a Multifamily Development Site?",
    "Model multifamily land costs, unit yields, parking, setbacks, and returns. Free feasibility calculator for apartment development projects.",
    "A multifamily development site is feasible when land cost, unit count, parking, and hard costs produce a target return at market rents. This tool models yield, coverage, and profit from your acreage and assumptions.",
    [
      {
        question: "How do you analyze land for multifamily development?",
        answer:
          "Enter acreage, zoning constraints, unit density, construction costs, and rents. The calculator estimates buildable units, total development cost, and whether the project meets your return hurdle.",
      },
      {
        question: "What inputs matter most for multifamily feasibility?",
        answer:
          "Land price, units per acre, construction cost per unit, parking ratio, and market rent drive the model. Setback and impervious surface limits also affect buildable area.",
      },
    ],
  ),
  [routes.INDUSTRIAL_DEVELOPMENT]: calculator(
    routes.INDUSTRIAL_DEVELOPMENT,
    "How Do You Feasibility an Industrial Development Site?",
    "Analyze industrial land development costs, leasable SF, parking, and returns. Free calculator for warehouse and flex industrial projects.",
    "Industrial development feasibility compares land cost plus horizontal and vertical build costs against lease rates and vacancy to hit a target yield. Enter acreage, lease rates, and cost assumptions to test the deal.",
    [
      {
        question: "How do you calculate industrial development feasibility?",
        answer:
          "Model gross acres, leasable square footage, development cost per square foot, and market lease rate. The tool estimates total project cost and implied value at your expense ratio.",
      },
    ],
  ),
  [routes.COMMERCIAL_DEVELOPMENT]: calculator(
    routes.COMMERCIAL_DEVELOPMENT,
    "How Do You Analyze Commercial Land Development?",
    "Model commercial land development costs, leasable area, and investor returns. Free feasibility tool for retail, office, and build-to-suit sites.",
    "Commercial land is feasible when development cost plus land produces a stabilized value supported by market lease rates and vacancy assumptions. This calculator tests cost, rent, and yield in one model.",
    [
      {
        question: "What makes a commercial development site feasible?",
        answer:
          "Feasibility depends on buildable square footage, all-in development cost, achievable rents, operating expenses, and the cap rate buyers will pay at stabilization.",
      },
    ],
  ),
  [routes.RESIDENTIAL_DEVELOPMENT]: calculator(
    routes.RESIDENTIAL_DEVELOPMENT,
    "How Many Lots Fit on a Residential Development Site?",
    "Calculate residential lot yield, infrastructure cost per lot, and developer profit. Free subdivision and land development feasibility tool.",
    "Residential lot yield is determined by gross acres minus unbuildable area, lot size, and infrastructure cost per lot. This calculator estimates how many homes fit and whether the project clears your profit target.",
    [
      {
        question: "How do you calculate residential lot yield?",
        answer:
          "Subtract unbuildable acreage and roadway dedication, divide net acreage by lot size, and subtract development cost per lot from finished lot sale price to test profit.",
      },
    ],
  ),
  [routes.CONSTRUCTION_BUDGET]: calculator(
    routes.CONSTRUCTION_BUDGET,
    "How Do You Build a Construction Budget for Development?",
    "Generate a line-item construction budget for real estate development. Free tool covering land, soft costs, hard costs, and contingency.",
    "A development construction budget lists every cost from land acquisition through vertical construction and contingency. This generator builds a categorized budget you can adjust and export for lender or investor review.",
    [
      {
        question: "What should a development construction budget include?",
        answer:
          "Include land, entitlements, soft costs, hard costs, financing, contingency, and developer fee. Line items should match how lenders and equity partners underwrite the project.",
      },
    ],
  ),
  [routes.MULTIFAMILY_ANALYSIS]: calculator(
    routes.MULTIFAMILY_ANALYSIS,
    "How Do You Underwrite a Multifamily Property?",
    "Build a multifamily proforma with income, expenses, debt service, and cash flow. Free rental property analysis calculator for apartment investments.",
    "Multifamily underwriting starts with gross rent minus vacancy and expenses to get NOI, then subtracts debt service for cash flow. Enter purchase price, rents, and financing to see DSCR, cap rate, and returns.",
    [
      {
        question: "How do you calculate multifamily cash flow?",
        answer:
          "Gross rent minus vacancy, operating expenses, and debt service equals cash flow. Also track capex reserves and management fees for a conservative proforma.",
      },
      {
        question: "What is a good DSCR for multifamily?",
        answer:
          "Lenders typically want a debt service coverage ratio of 1.20x to 1.25x or higher. The calculator shows DSCR based on your NOI and loan payment.",
      },
    ],
  ),
  [routes.INDUSTRIAL_PROFORMA]: calculator(
    routes.INDUSTRIAL_PROFORMA,
    "How Do You Model an Industrial Property Proforma?",
    "Create an industrial or commercial proforma with lease income, expenses, and cash-on-cash return. Free investment analysis calculator.",
    "An industrial proforma projects lease income minus operating expenses and debt service to show NOI and investor returns. Enter purchase price, lease rate per SF, and financing to model the deal.",
    [
      {
        question: "How do you underwrite an industrial property?",
        answer:
          "Use market lease rate per square foot, vacancy and expense ratio, purchase price, and loan terms. Compare stabilized NOI to debt service and equity invested for cash-on-cash return.",
      },
    ],
  ),
  [routes.MULTI_FAMILY_PRICE_PER_DOOR]: calculator(
    routes.MULTI_FAMILY_PRICE_PER_DOOR,
    "What Should I Pay Per Door for a Multifamily Building?",
    "Calculate max price per unit from rent, expenses, financing, and cash-on-cash return. Free multifamily per-door pricing calculator.",
    "You should pay per door the price that achieves your target cash-on-cash return after rent, operating expenses, down payment, and mortgage payment. Enter unit rent and return goals to get a max offer price.",
    [
      {
        question: "How do you calculate price per door for multifamily?",
        answer:
          "Solve for the price where net operating income per unit minus debt service equals your required cash-on-cash return on equity invested.",
      },
      {
        question: "What is a good cash-on-cash return for multifamily?",
        answer:
          "Many investors target 6% to 10% cash-on-cash depending on market and risk. Adjust the calculator to match your hurdle rate.",
      },
    ],
  ),
  [routes.HOME_MORTGAGE_CALCULATOR]: calculator(
    routes.HOME_MORTGAGE_CALCULATOR,
    "How Much Will My Monthly Mortgage Payment Be?",
    "Calculate monthly PITI including principal, interest, taxes, insurance, PMI, and HOA. Free home mortgage calculator with amortization slider.",
    "Your monthly mortgage payment is principal and interest plus property tax, homeowners insurance, PMI if down payment is under 20%, and HOA fees. Enter home price, rate, and term for total PITI.",
    [
      {
        question: "How do I calculate my monthly mortgage payment?",
        answer:
          "Enter home price, down payment, interest rate, and loan term. The calculator computes principal and interest, then adds tax, insurance, PMI, and HOA for total monthly PITI.",
      },
      {
        question: "What is included in PITI?",
        answer:
          "PITI stands for principal, interest, taxes, and insurance. This calculator also includes PMI and HOA when applicable.",
      },
      {
        question: "When do I need PMI on a mortgage?",
        answer:
          "PMI is typically required when your down payment is less than 20% of the home price. The calculator estimates PMI until you reach 20% equity.",
      },
    ],
  ),
  [routes.LEASE_EXPIRY_SCHEDULE]: calculator(
    routes.LEASE_EXPIRY_SCHEDULE,
    "When Do My Tenant Leases Expire?",
    "Track tenant lease expirations, rent rollover risk, and weighted average lease term. Free printable lease expiry schedule for property managers.",
    "A lease expiry schedule lists each tenant's rent and end date so you can see rollover concentration by year. Enter leases to get WALT, weighted average expiry, and a printable timeline.",
    [
      {
        question: "What is weighted average lease term (WALT)?",
        answer:
          "WALT is the rent-weighted average of remaining lease term across all tenants. Higher-rent tenants with longer terms increase WALT more than small short-term leases.",
      },
      {
        question: "How do you calculate lease rollover risk?",
        answer:
          "Sum monthly rent for leases expiring within 12, 24, or 36 months and divide by total rent. This shows what percentage of income is at risk of vacancy or re-leasing.",
      },
    ],
  ),
  [routes.INDUSTRIAL_PRICE_PER_SQFT]: calculator(
    routes.INDUSTRIAL_PRICE_PER_SQFT,
    "What Should I Pay Per SF for Industrial Property?",
    "Calculate industrial property value per square foot from lease rates and expenses. Free price-per-SF calculator for warehouse investments.",
    "Industrial price per square foot is driven by market lease rate, expense ratio, cap rate, and financing. Enter annual rent per SF and return targets to find the maximum price you should pay.",
    [
      {
        question: "How do you value industrial property per square foot?",
        answer:
          "Divide stabilized NOI by cap rate to get value, then divide by leasable square feet. This calculator solves backward from rent and expenses to a max price per SF.",
      },
    ],
  ),
  [routes.IRR_CALCULATOR]: calculator(
    routes.IRR_CALCULATOR,
    "What Is the IRR on Seller Financing?",
    "Calculate internal rate of return for seller carryback and owner-financing scenarios. Free seller IRR estimator for real estate deals.",
    "Seller financing IRR is the annualized return the seller earns on the note based on down payment, interest rate, term, and balloon. Enter note terms to compare IRR against an all-cash sale.",
    [
      {
        question: "How do you calculate IRR on seller financing?",
        answer:
          "IRR is the discount rate that makes the present value of all note payments equal to the amount financed. Enter down payment, rate, term, and balloon to estimate seller IRR.",
      },
    ],
  ),
  [routes.HARD_MONEY_COST_ESTIMATOR]: calculator(
    routes.HARD_MONEY_COST_ESTIMATOR,
    "How Much Does a Hard Money Loan Cost?",
    "Estimate hard money loan points, interest, fees, and total cost. Free calculator for fix-and-flip and construction bridge financing.",
    "Hard money loan cost is points plus monthly interest plus origination and exit fees over the hold period. Enter loan amount, rate, points, and term to see total borrowing cost and effective rate.",
    [
      {
        question: "What fees are included in a hard money loan?",
        answer:
          "Typical hard money loans include origination points, monthly interest, inspection or draw fees, and sometimes an exit fee. This calculator totals all-in cost.",
      },
    ],
  ),
  [routes.HOUSE_FLIPPING_CALCULATOR]: calculator(
    routes.HOUSE_FLIPPING_CALCULATOR,
    "Is This House Flip Deal Profitable?",
    "Analyze fix-and-flip profit after purchase, rehab, holding costs, and sale. Free house flipping ROI calculator for investors.",
    "A house flip is profitable when ARV minus purchase, rehab, holding, financing, and selling costs exceeds your profit target. Enter those numbers to see net profit and return on invested capital.",
    [
      {
        question: "How do you calculate profit on a house flip?",
        answer:
          "Subtract purchase price, rehab budget, holding costs, loan costs, and selling commissions from after-repair value. The calculator shows net profit and ROI.",
      },
    ],
  ),
  [routes.WATERFALL]: calculator(
    routes.WATERFALL,
    "How Do Real Estate Waterfall Distributions Work?",
    "Model preferred return, promote tiers, and profit splits between GP and LP. Free waterfall distribution calculator for syndications.",
    "A real estate waterfall pays investors their preferred return first, then splits remaining profits by promote tiers. Enter equity splits and hurdle rates to see how cash flow distributes at each return level.",
    [
      {
        question: "What is a real estate waterfall distribution?",
        answer:
          "A waterfall defines the order and percentage splits for distributing cash flow and profits between general and limited partners after preferred return hurdles are met.",
      },
    ],
  ),
  [routes.CONSTRUCTION_LOAN_CALCULATOR]: calculator(
    routes.CONSTRUCTION_LOAN_CALCULATOR,
    "How Much Does a Construction Loan Cost?",
    "Model construction loan draws, interest reserves, and lender fees. Free calculator for development and ground-up construction financing.",
    "Construction loan cost is interest on outstanding draws plus origination, inspection, and extension fees through the build period. Enter draw schedule and rate to estimate total interest and all-in cost.",
    [
      {
        question: "How is interest calculated on a construction loan?",
        answer:
          "Interest accrues on each draw as funds are disbursed, not on the full loan amount upfront. This calculator models interest per draw over the construction timeline.",
      },
    ],
  ),
  [routes.SITE_PLAN_BUILDER]: calculator(
    routes.SITE_PLAN_BUILDER,
    "How Do You Draw a Site Plan for Development?",
    "Design property boundaries, parking, entrances, and setbacks online. Free interactive site plan builder for land development projects.",
    "A development site plan maps the property boundary, buildings, parking, driveways, and entrances to test coverage and circulation. This tool lets you draw and adjust layouts before hiring a civil engineer.",
    [
      {
        question: "What should a site plan include?",
        answer:
          "A site plan shows property lines, building footprints, parking stalls, driveways, entrances, setbacks, and landscape areas required for entitlement and lender review.",
      },
    ],
  ),
  [routes.CUT_FILL_CALCULATOR]: calculator(
    routes.CUT_FILL_CALCULATOR,
    "How Do You Estimate Cut and Fill for a Site?",
    "Model existing and finished grades on a grid and estimate cut and fill earthwork volumes with a 3D site map.",
    "Cut and fill estimates compare existing ground elevation to proposed finished grade across a site. This calculator uses a grid of spot elevations to estimate earthwork in cubic yards and visualize cut versus fill areas in 3D.",
    [
      {
        question: "How is cut and fill volume calculated?",
        answer:
          "Each grid cell inside the property boundary compares average existing elevation to average finished elevation. Cut is material removed; fill is material added. Volumes convert from cubic feet to cubic yards.",
      },
    ],
  ),
  [routes.TOPOLOGY_ANALYSIS]: calculator(
    routes.TOPOLOGY_ANALYSIS,
    "How Do You Analyze Site Topography for Development?",
    "Digitize a topo map and analyze slope, drainage, buildability, earthwork, and development feasibility metrics.",
    "Topology analysis turns a survey or topo image into a triangulated terrain model. Developers use it to evaluate slope distribution, flat building pads, drainage paths, cut and fill volumes, deal-killer risks, and an overall site development score.",
    [
      {
        question: "What can topology analysis tell a land developer?",
        answer:
          "It estimates gross and net buildable acreage, average and maximum slope, elevation range, drainage patterns, earthwork volumes, and flags common feasibility risks like steep slopes or large grade changes.",
      },
    ],
  ),
  [routes.SUBDIVISION_GENERATOR]: calculator(
    routes.SUBDIVISION_GENERATOR,
    "How Do You Lay Out a Residential Subdivision on a Parcel?",
    "Upload a site image, trace the property boundary, set scale, and prepare for lot layout design.",
    "Subdivision layout starts with an accurate property boundary and map scale. Upload a survey or aerial image, digitize the parcel outline, and set a known edge length so lot widths, setbacks, and street frontage can be designed to real-world dimensions.",
    [
      {
        question: "Why do you need scale before designing lots?",
        answer:
          "Without a calibrated scale, drawn lot dimensions are only proportional to the image. Setting scale from a known boundary length converts pixels to feet so lot sizes, setbacks, and road widths match zoning and engineering requirements.",
      },
    ],
  ),
  [routes.HOW_TO_LAND_FOR_MULTIFAMILY]: {
    path: routes.HOW_TO_LAND_FOR_MULTIFAMILY,
    title: `How Do You Analyze Land for Multifamily? | ${SITE_NAME}`,
    description:
      "Step-by-step guide to evaluating land for apartment and multifamily development. Zoning, density, costs, and return hurdles explained.",
    geoAnswer:
      "Analyze multifamily land by confirming zoning density, estimating buildable units, modeling all-in development cost, and comparing stabilized value to your return target before making an offer.",
    type: "article",
    schemaType: "Article",
    faqs: [
      {
        question: "What zoning do you need for multifamily land?",
        answer:
          "Land must allow multifamily or higher density residential use with sufficient units per acre, height, and parking ratios for your proforma to work.",
      },
    ],
  },
  [routes.TERMS]: {
    path: routes.TERMS,
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      "Read the terms of service and usage policies for Land Price Calculator tools, accounts, and subscriptions.",
    geoAnswer:
      "These terms govern use of Land Price Calculator, including calculator access, account registration, subscription billing, and acceptable use of the platform.",
    schemaType: "WebPage",
    noIndex: false,
  },
  [routes.SIGN_UP]: {
    path: routes.SIGN_UP,
    title: `Sign Up for Land Price Calculator`,
    description: "View pricing plans and subscribe to Land Price Calculator premium calculator access and features.",
    geoAnswer: "Choose a subscription plan to unlock full access to all Land Price Calculator tools after your free trial.",
    schemaType: "WebPage",
    noIndex: true,
  },
  [routes.LOGIN]: {
    path: routes.LOGIN,
    title: `Log In to Land Price Calculator`,
    description: "Sign in to your Land Price Calculator account to access saved calculators and subscription features.",
    geoAnswer: "Log in with your registered email and password to access your Land Price Calculator account.",
    schemaType: "WebPage",
    noIndex: true,
  },
  [routes.REGISTER]: {
    path: routes.REGISTER,
    title: `Create a Land Price Calculator Account`,
    description: "Register for a free Land Price Calculator account to save inputs and access premium development tools.",
    geoAnswer: "Create an account with your email to start using Land Price Calculator and manage your subscription.",
    schemaType: "WebPage",
    noIndex: true,
  },
  [routes.FORGOT_PASSWORD]: {
    path: routes.FORGOT_PASSWORD,
    title: `Reset Your Land Price Calculator Password`,
    description: "Reset your Land Price Calculator account password using your registered email address.",
    geoAnswer: "Enter your email to receive a password reset link for your Land Price Calculator account.",
    schemaType: "WebPage",
    noIndex: true,
  },
  [routes.PAYMENT]: {
    path: routes.PAYMENT,
    title: `Complete Your Subscription Payment`,
    description: "Secure checkout to complete your Land Price Calculator subscription purchase.",
    geoAnswer: "Complete payment to activate your Land Price Calculator subscription and unlock all tools.",
    schemaType: "WebPage",
    noIndex: true,
  },
  [routes.COMPLETION]: {
    path: routes.COMPLETION,
    title: `Payment Confirmation | ${SITE_NAME}`,
    description: "Your Land Price Calculator subscription payment was successful. Access all calculators now.",
    geoAnswer: "Your payment is complete and your Land Price Calculator subscription is now active.",
    schemaType: "WebPage",
    noIndex: true,
  },
  [routes.END_FREE_TRIAL]: {
    path: routes.END_FREE_TRIAL,
    title: `Free Trial Ended | ${SITE_NAME}`,
    description: "Your Land Price Calculator free trial has ended. Upgrade to continue using all development calculators.",
    geoAnswer: "Your free trial has expired. Subscribe to keep access to Land Price Calculator tools.",
    schemaType: "WebPage",
    noIndex: true,
  },
};

const PAGE_META_BY_E_PAGE_NAME: Partial<Record<EPageNames, PageMetaConfig>> = {
  [EPageNames.MULTIFAMILY_DEVELOPMENT]: PAGE_META[routes.MULTIFAMILY_DEVELOPMENT],
  [EPageNames.INDUSTRIAL_DEVELOPMENT]: PAGE_META[routes.INDUSTRIAL_DEVELOPMENT],
  [EPageNames.COMMERCIAL_DEVELOPMENT]: PAGE_META[routes.COMMERCIAL_DEVELOPMENT],
  [EPageNames.RESIDENTIAL_DEVELOPMENT]: PAGE_META[routes.RESIDENTIAL_DEVELOPMENT],
  [EPageNames.CONSTRUCTION_BUDGET]: PAGE_META[routes.CONSTRUCTION_BUDGET],
  [EPageNames.MULTIFAMILY_ANALYSIS]: PAGE_META[routes.MULTIFAMILY_ANALYSIS],
  [EPageNames.INDUSTRIAL_PROFORMA]: PAGE_META[routes.INDUSTRIAL_PROFORMA],
  [EPageNames.MULTI_FAMILY_PRICE_PER_DOOR]: PAGE_META[routes.MULTI_FAMILY_PRICE_PER_DOOR],
  [EPageNames.HOME_MORTGAGE_CALCULATOR]: PAGE_META[routes.HOME_MORTGAGE_CALCULATOR],
  [EPageNames.LEASE_EXPIRY_SCHEDULE]: PAGE_META[routes.LEASE_EXPIRY_SCHEDULE],
  [EPageNames.INDUSTRIAL_PRICE_PER_SQFT]: PAGE_META[routes.INDUSTRIAL_PRICE_PER_SQFT],
  [EPageNames.IRR_CALCULATOR]: PAGE_META[routes.IRR_CALCULATOR],
  [EPageNames.HARD_MONEY_COST_ESTIMATOR]: PAGE_META[routes.HARD_MONEY_COST_ESTIMATOR],
  [EPageNames.HOUSE_FLIPPING_CALCULATOR]: PAGE_META[routes.HOUSE_FLIPPING_CALCULATOR],
  [EPageNames.WATERFALL_GENERATOR]: PAGE_META[routes.WATERFALL],
  [EPageNames.CONSTRUCTION_LOAN_CALCULATOR]: PAGE_META[routes.CONSTRUCTION_LOAN_CALCULATOR],
  [EPageNames.SITE_PLAN_BUILDER]: PAGE_META[routes.SITE_PLAN_BUILDER],
  [EPageNames.CUT_FILL_CALCULATOR]: PAGE_META[routes.CUT_FILL_CALCULATOR],
  [EPageNames.TOPOLOGY_ANALYSIS]: PAGE_META[routes.TOPOLOGY_ANALYSIS],
  [EPageNames.SUBDIVISION_GENERATOR]: PAGE_META[routes.SUBDIVISION_GENERATOR],
};

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const withoutTrailing = pathname.replace(/\/+$/, "") || "/";
  if (!withoutTrailing.startsWith("/")) return `/${withoutTrailing}`;
  return withoutTrailing;
}

export function getPageMeta(pathname: string): PageMetaConfig {
  const path = normalizePath(pathname);
  return withAioExtras(PAGE_META[path] ?? DEFAULT_META);
}

export function getPageMetaByPageName(page: EPageNames): PageMetaConfig | undefined {
  const meta = PAGE_META_BY_E_PAGE_NAME[page];
  return meta ? withAioExtras(meta) : undefined;
}

function withAioExtras(meta: PageMetaConfig): PageMetaConfig {
  const aio = getAioExtras(meta.path);
  if (!aio) return meta;
  return {
    ...meta,
    keyTakeaways: aio.keyTakeaways,
    howToSteps: aio.howToSteps,
    relatedLinks: aio.relatedLinks,
  };
}

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

export function buildJsonLdGraph(meta: PageMetaConfig, canonicalUrl: string) {
  const graph: Record<string, unknown>[] = [
    ORGANIZATION_SCHEMA,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ];

  const schemaType = meta.schemaType ?? "WebPage";
  const pageNode: Record<string, unknown> = {
    "@type": schemaType,
    "@id": `${canonicalUrl}#webpage`,
    name: meta.title.replace(` | ${SITE_NAME}`, ""),
    description: meta.description,
    url: canonicalUrl,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };

  if (schemaType === "WebApplication") {
    pageNode.applicationCategory = "FinanceApplication";
    pageNode.operatingSystem = "Web";
    pageNode.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    };
  }

  graph.push(pageNode);

  if (meta.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: meta.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  if (meta.howToSteps?.length) {
    graph.push({
      "@type": "HowTo",
      "@id": `${canonicalUrl}#howto`,
      name: meta.title.replace(` | ${SITE_NAME}`, ""),
      description: meta.description,
      step: meta.howToSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function upsertJsonLd(meta: PageMetaConfig, canonicalUrl: string) {
  const scriptId = "page-meta-jsonld";
  let element = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement("script");
    element.id = scriptId;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(buildJsonLdGraph(meta, canonicalUrl));
}

export function applyPageMeta(meta: PageMetaConfig) {
  const canonicalUrl = `${SITE_URL}${meta.path === "/" ? "" : meta.path}`;

  document.title = meta.title;

  upsertMeta("name", "description", meta.description);
  upsertMeta("name", "robots", meta.noIndex ? "noindex, nofollow" : "index, follow");

  upsertMeta("property", "og:title", meta.title);
  upsertMeta("property", "og:description", meta.description);
  upsertMeta("property", "og:url", canonicalUrl);
  upsertMeta("property", "og:type", meta.type ?? "website");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);

  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", meta.title);
  upsertMeta("name", "twitter:description", meta.description);
  upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);

  upsertCanonical(canonicalUrl);
  upsertJsonLd(meta, canonicalUrl);
}
