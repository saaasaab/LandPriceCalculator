import React, { useState, useRef, useEffect } from 'react';
import './LandingPage.scss';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../components/Navbar';
import EVERYTHING_BURGER from '../EVERYTHING_BURGER';
import { EPageNames } from '../../utils/types';
import SitePlanDesigner from '../SiteplanDesigner/SitePlanDesigner';
import HeroSection from './HeroSection';
import {
  Building2,
  Factory,
  Building,
  Home,
  Calculator,
  BarChart4,
  Ruler,
  TowerControl,
  TrendingUp,
  Map,
  Coins,
  Home as HomeIcon,
  GitFork,
  // Construction
} from 'lucide-react';

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  component: React.ComponentType<any>;
  pageType?: EPageNames;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const heroRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const calculatorViewRef = useRef<HTMLDivElement>(null);
  
  // Handle window resize and height calculations
  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(window.innerWidth <= 768);
      
      // Calculate available height
      // if (heroRef.current) {
        // const heroHeight = heroRef.current.offsetHeight;
        const navHeight = document.querySelector('nav')?.offsetHeight || 0;
        const availableHeight = window.innerHeight - (navHeight);
        
        // Set both heights as CSS variables
        document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
        document.documentElement.style.setProperty('--available-height', `${availableHeight}px`);
      // }
    };

    // Initial calculation
    updateLayout();
    
    // Recalculate on resize
    window.addEventListener('resize', updateLayout);
    
    // Add a small delay to ensure accurate hero height calculation
    const timeoutId = setTimeout(updateLayout, 100);

    return () => {
      window.removeEventListener('resize', updateLayout);
      clearTimeout(timeoutId);
      // document.documentElement.style.removeProperty('--hero-height');
      document.documentElement.style.removeProperty('--nav-height');
      document.documentElement.style.removeProperty('--available-height');
    };
  }, []);

  const calculators: Calculator[] = [
    {
      id: 'multi-family-dev',
      title: 'Multi-family Development Calculator',
      description: 'Comprehensive analysis tool for multi-family development projects.',
      icon: <Building2 size={24} />,
      link: routes.MULTIFAMILY_DEVELOPMENT,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.MULTIFAMILY_DEVELOPMENT
    },
    {
      id: 'industrial-dev',
      title: 'Industrial Development Calculator',
      description: 'Advanced calculator for industrial development projects.',
      icon: <Factory size={24} />,
      link: routes.INDUSTRIAL_DEVELOPMENT,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.INDUSTRIAL_DEVELOPMENT
    },
    {
      id: 'commercial-dev',
      title: 'Commercial Development Calculator',
      description: 'Advanced calculator for commercial development projects.',
      icon: <Building size={24} />,
      link: routes.COMMERCIAL_DEVELOPMENT,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.COMMERCIAL_DEVELOPMENT
    },
    {
      id: 'residential-dev',
      title: 'Residential Development Calculator',
      description: 'Essential tool for residential developers.',
      icon: <Home size={24} />,
      link: routes.RESIDENTIAL_DEVELOPMENT,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.RESIDENTIAL_DEVELOPMENT
    },
    {
      id: 'construction-budget',
      title: 'Construction Budget Generator',
      description: 'Automated budget creation tool.',
      icon: <Calculator size={24} />,
      link: routes.CONSTRUCTION_BUDGET,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.CONSTRUCTION_BUDGET
    },
    {
      id: 'multi-family-proforma',
      title: 'Multi-family Proforma',
      description: 'Detailed financial modeling tool.',
      icon: <BarChart4 size={24} />,
      link: routes.MULTIFAMILY_ANALYSIS,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.MULTIFAMILY_ANALYSIS
    },
    {
      id: 'industrial-sqft',
      title: 'Industrial Per SQFT Calculator',
      description: 'Quick calculations for industrial property metrics.',
      icon: <Ruler size={24} />,
      link: routes.INDUSTRIAL_PRICE_PER_SQFT,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.INDUSTRIAL_PRICE_PER_SQFT
    },
    {
      id: 'multi-family-door',
      title: 'Multi-family Per Door Calculator',
      description: 'Essential metrics calculator for multi-family properties.',
      icon: <TowerControl size={24} />,
      link: routes.MULTI_FAMILY_PRICE_PER_DOOR,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.MULTI_FAMILY_PRICE_PER_DOOR
    },
    {
      id: 'seller-irr',
      title: "Seller's IRR Estimator",
      description: 'Sophisticated tool for calculating IRR.',
      icon: <TrendingUp size={24} />,
      link: routes.IRR_CALCULATOR,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.IRR_CALCULATOR
    },
   
    {
      id: 'hard-money-calculator',
      title: 'Hard Money Cost Estimator',
      description: 'Calculate costs and terms for hard money loans.',
      icon: <Coins size={24} />,
      link: routes.HARD_MONEY_COST_ESTIMATOR,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.HARD_MONEY_COST_ESTIMATOR
    },
    {
      id: 'house-flipping',
      title: 'House Flipping Calculator',
      description: 'Analyze potential returns on house flipping projects.',
      icon: <HomeIcon size={24} />,
      link: routes.HOUSE_FLIPPING_CALCULATOR,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.HOUSE_FLIPPING_CALCULATOR
    },
    {
      id: 'waterfall',
      title: 'Waterfall Generator',
      description: 'Generate and analyze waterfall distribution structures.',
      icon: <GitFork size={24} />,
      link: routes.WATERFALL,
      component: EVERYTHING_BURGER,
      pageType: EPageNames.WATERFALL_GENERATOR
    },
    // {
    //   id: 'construction-loan',
    //   title: 'Construction Loan Calculator',
    //   description: 'Calculate construction loan terms and payments.',
    //   icon: <Construction size={24} />,
    //   link: routes.CONSTRUCTION_LOAN_CALCULATOR,
    //   component: EVERYTHING_BURGER,
    //   pageType: EPageNames.CONSTRUCTION_LOAN_CALCULATOR
    // },
    {
      id: 'site-plan',
      title: 'Site Plan Generator',
      description: 'Innovative tool for creating site plans.',
      icon: <Map size={24} />,
      link: routes.SITE_PLAN_BUILDER,
      component: SitePlanDesigner
    },
  ];

  // Set initial active calculator
  useEffect(() => {
    if (!activeCalculator && calculators.length > 0) {
      setActiveCalculator(calculators[0]);
    }
  }, []);

  // Scroll to top when calculator changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }
    if (calculatorViewRef.current) {
      calculatorViewRef.current.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }
  }, [activeCalculator]);

  const handleCalculatorInteraction = (calculator: Calculator) => {
    if (isMobile) {
      navigate(calculator.link);
    } else {
      // Force scroll reset before changing calculator
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
      setActiveCalculator(calculator);
    }
  };

  const currentCalculator = activeCalculator || calculators[0];
  const CurrentComponent = currentCalculator.component;

  // Memoize calculators to prevent unnecessary re-renders
  const calculatorItems = React.useMemo(() => calculators.map(calc => (
    <div
      key={calc.id}
      className={`calculator-item ${calc.id === activeCalculator?.id ? 'active' : ''}`}
      onClick={() => handleCalculatorInteraction(calc)}
      onMouseEnter={() => !isMobile && handleCalculatorInteraction(calc)}
    >
      <span className="calculator-icon">{calc.icon}</span>
      <h3>{calc.title}</h3>
      {isMobile ? <p>{calc.description}</p>: null} 
    </div>
  )), [activeCalculator?.id, isMobile]);

  return (
    <div className="landing-page">
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <div className="app-content">
        <div className="sidebar">
          <div className="calculator-list">
            {calculatorItems}
          </div>
        </div>

        <div ref={mainContentRef} className="main-content">
          <div ref={calculatorViewRef} className="calculator-view">
            {activeCalculator && (
              <CurrentComponent
                page={activeCalculator.pageType}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;