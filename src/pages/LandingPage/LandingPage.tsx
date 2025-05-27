import React, { useState, useRef, useEffect } from 'react';
import './LandingPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { calculatorIcons, routes } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
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
  Map
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredCalculator, setHoveredCalculator] = useState<Calculator | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);
  const transitionTimeoutRef = useRef<number>();
  
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
      id: 'site-plan',
      title: 'Site Plan Generator',
      description: 'Innovative tool for creating site plans.',
      icon: <Map size={24} />,
      link: routes.SITE_PLAN_BUILDER,
      component: SitePlanDesigner
    }
  ];

  useEffect(() => {
    // Set initial calculator
    if (!activeCalculator && calculators.length > 0) {
      setActiveCalculator(calculators[0]);
    }
  }, []);

  useEffect(() => {
    if (hoveredCalculator) {
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Set a small delay before changing the component to avoid rapid changes
      transitionTimeoutRef.current = window.setTimeout(() => {
        setActiveCalculator(hoveredCalculator);
      }, 100);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [hoveredCalculator]);

  const currentCalculator = activeCalculator || calculators[0];
  const CurrentComponent = currentCalculator.component;

  const handleCalculatorClick = (calculator: Calculator) => {
    navigate(calculator.link);
  };

  return (
    <div className="landing-page">
      {/* {!user && } */}
      <HeroSection />
      <div className="app-content">
        <div className="sidebar">
          <div className="calculator-list">
            {calculators.map(calc => (
              <div
                key={calc.id}
                className={`calculator-item ${calc === hoveredCalculator ? 'active' : ''}`}
                onMouseEnter={() => setHoveredCalculator(calc)}
              >
                <span className="calculator-icon">{calc.icon}</span>
                <h3>{calc.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className={`calculator-view ${currentCalculator === activeCalculator ? 'active' : ''}`}>
            <CurrentComponent 
              page={currentCalculator.pageType} 
              isMobile={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;