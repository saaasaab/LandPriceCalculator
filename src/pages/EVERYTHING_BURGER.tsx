import { EPageNames, EPageTitles } from '../utils/types';
import MultifamilyDevelopmentCalculator from './MultifamilyDevelopmentCalculator';
import IndustrialDevelopmentCalculator from './IndustrialDevelopmentCalculator';
import ResidentialDevelopmentCalculator from './ResidentialDevelopmentCalculator';

import './LandCalculator.scss';
import ContactMe from '../components/ContactMe';
import ResidentialCashFlowCalculator from './ResidentialCashFlowCalculator';
import ResidentialPriceCalculator from './ResidentialPriceCalculator';
import IRRCalculator from './IRRCalculator';
import LendingCosts from './LendingCosts';
import WaterfallGenerator from './WaterfallGenerator';
import ConstructionBudget from './ConstructionBudget';


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
            case EPageNames.MULTI_FAMILY_PRICE_PER_DOOR:
                return <ResidentialPriceCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.IRR_CALCULATOR:
                return <IRRCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.LENDING_COST:
                return <LendingCosts
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.WATERFALL:
                return <WaterfallGenerator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.CONSTRUCTION_BUDGET:
                return <ConstructionBudget
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
            </header>
            {/* <MonteCarloSimulator {...inputs} /> */}
            {PageToRender(page)}
            
            <ContactMe />

        </div >
    );
};

export default EVERYTHING_BURGER;
