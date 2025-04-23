import { EPageNames, EPageTitles } from '../utils/types';
import IndustrialDevelopmentCalculator from './IndustrialDevelopmentCalculator';
import ResidentialDevelopmentCalculator from './ResidentialDevelopmentCalculator';

import './LandCalculator.scss';
import ContactMe from '../components/ContactMe';
import ResidentialCashFlowCalculator from './ResidentialCashFlowCalculator';
import ResidentialPriceCalculator from './PricePerDoorCalculatorMultifamily';
import IRRCalculator from './IRRCalculator';
// import HardMoneyLoanCalculator from './HardMoneyLoanCalculator';
import WaterfallGenerator from '../futureItems/WaterfallGenerator';
import ConstructionBudget from './ConstructionBudget';
import PricePerSQFTCalculatorIndustrial from './PricePerSQFTCalculatorIndustrial';
import HardMoneyLoanCalculator from './HardMoneyLoanCalculator';
import HouseFlippingCalculator from './HouseFlippingCalculator';
import IndustrialProformaCalculator from './IndustrialProformaCalculator';
import MultifamilyDevelopmentCalculator from './MultiFamilyDevelopmentCalculator';
import ConstructionLoanCalculator from '../futureItems/ConstructionLoanCalculator';
import { HELP_PAGES } from '../utils/constants';


const EVERYTHING_BURGER = ({ isMobile, page }: { isMobile: boolean, page: EPageNames }) => {

    const PageToRender = (page: EPageNames) => {
        switch (page) {
            case EPageNames.MULTIFAMILY_DEVELOPMENT:
                return <MultifamilyDevelopmentCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.INDUSTRIAL_DEVELOPMENT:
                return <IndustrialDevelopmentCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.COMMERCIAL_DEVELOPMENT:
                return <IndustrialDevelopmentCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.RESIDENTIAL_DEVELOPMENT:
                return <ResidentialDevelopmentCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.MULTIFAMILY_ANALYSIS:
                return <ResidentialCashFlowCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.INDUSTRIAL_PROFORMA:
                return <IndustrialProformaCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.MULTI_FAMILY_PRICE_PER_DOOR:
                return <ResidentialPriceCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.INDUSTRIAL_PRICE_PER_SQFT:
                return <PricePerSQFTCalculatorIndustrial
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.IRR_CALCULATOR:
                return <IRRCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.HARD_MONEY_COST_ESTIMATOR:
                return <HardMoneyLoanCalculator
                    isMobile={isMobile}
                    page={page}
                />

            case EPageNames.HOUSE_FLIPPING_CALCULATOR:
                return <HouseFlippingCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.WATERFALL_GENERATOR:
                return <WaterfallGenerator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.CONSTRUCTION_BUDGET:
                return <ConstructionBudget
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.CONSTRUCTION_LOAN_CALCULATOR:
                return <ConstructionLoanCalculator
                    isMobile={isMobile}
                    page={page}
                />



            default:
                break;
        }
    }

    return (
        <div className="land-calculator">
            <header className="app-header">
                <h1>{EPageTitles[page]}</h1>

                {HELP_PAGES?.[page as keyof typeof HELP_PAGES] ? (
                    <p>
                        <a href={HELP_PAGES[page as keyof typeof HELP_PAGES]} target="_blank">
                            📺 How to Use This Tool?
                        </a>
                    </p>
                ) : null}
            </header>
            {/* <MonteCarloSimulator {...inputs} /> */}
            {PageToRender(page)}

            <ContactMe />

        </div >
    );
};

export default EVERYTHING_BURGER;
