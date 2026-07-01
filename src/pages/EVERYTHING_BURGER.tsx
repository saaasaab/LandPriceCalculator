import { useRef, useState } from 'react';
import { EPageNames, EPageTitles } from '../utils/types';
import IndustrialDevelopmentCalculator from './IndustrialDevelopmentCalculator';
import ResidentialDevelopmentCalculator from './ResidentialDevelopmentCalculator';

import './LandCalculator.scss';
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
import HomeMortgageCalculator from './HomeMortgageCalculator';
import ConstructionLoanCalculator from '../futureItems/ConstructionLoanCalculator';
import LeaseExpiryScheduleCalculator from './LeaseExpiryScheduleCalculator';
import { Info } from 'lucide-react';
import { HELP_PAGES } from '../utils/constants';
import SavedProjectsPanel, { SavedProjectsPanelHandle } from '../components/SavedProjects/SavedProjectsPanel';
import { resetLeaseProject } from '../utils/leaseProjectDefaults';


const EVERYTHING_BURGER = ({
    isMobile,
    page,
    showSavedProjects = true,
}: {
    isMobile: boolean;
    page: EPageNames;
    showSavedProjects?: boolean;
}) => {
    const [calculatorKey, setCalculatorKey] = useState(0);
    const savedProjectsRef = useRef<SavedProjectsPanelHandle>(null);

    const handleProjectLoad = () => {
        setCalculatorKey((current) => current + 1);
    };

    const handleNewProject = () => {
        if (page === EPageNames.LEASE_EXPIRY_SCHEDULE) {
            resetLeaseProject(page);
        }
        savedProjectsRef.current?.clearActiveProject();
        setCalculatorKey((current) => current + 1);
    };
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
            case EPageNames.HOME_MORTGAGE_CALCULATOR:
                return <HomeMortgageCalculator
                    isMobile={isMobile}
                    page={page}
                />
            case EPageNames.LEASE_EXPIRY_SCHEDULE:
                return <LeaseExpiryScheduleCalculator
                    isMobile={isMobile}
                    page={page}
                    onNewProject={handleNewProject}
                />



            default:
                break;
        }
    }

    return (
        <div className="land-calculator">
            <div className={`land-calculator-layout ${showSavedProjects ? '' : 'no-sidebar'}`}>
                {showSavedProjects ? (
                    <SavedProjectsPanel
                        ref={savedProjectsRef}
                        page={page}
                        onProjectLoad={handleProjectLoad}
                    />
                ) : null}

                <div className="land-calculator-main">
                    <header className="app-header">
                        <div className="app-header__title-row">
                            <h1>{EPageTitles[page]}</h1>
                            {HELP_PAGES?.[page as keyof typeof HELP_PAGES] ? (
                                <a
                                    href={HELP_PAGES[page as keyof typeof HELP_PAGES]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="app-header__help-link"
                                    title="How to Use This Tool?"
                                    aria-label="How to Use This Tool?"
                                >
                                    <Info size={22} strokeWidth={2} aria-hidden />
                                </a>
                            ) : null}
                        </div>
                    </header>

                    <div key={calculatorKey}>
                        {PageToRender(page)}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default EVERYTHING_BURGER;
