import React from 'react';
import './LandingPage.scss';
import HeroSection from './HeroSection';
import { Link } from 'react-router-dom';
import { routes } from '../../components/Navbar';

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: JSX.Element
}

const LandingPage: React.FC = () => {
  const calculators: Calculator[] = [
    {
      id: 'multi-family-dev',
      title: 'Multi-family Development Calculator',
      description: 'Comprehensive analysis tool for multi-family development projects including cost estimation, revenue projections, and ROI calculations.',
      icon: '🏢',
      link: <Link className="try-button" to="/">Try Now</Link>
    },
    {
      id: 'industrial-dev',
      title: 'Industrial Development Calculator',
      description: 'Advanced calculator for industrial development projects with specialized metrics for warehouse, manufacturing, and logistics facilities.',
      icon: '🏭',
      link:<Link className="try-button" to={routes.INDUSTRIAL_DEVELOPMENT}>Try Now</Link>
    },
    {
      id: 'residential-dev',
      title: 'Residential Development Calculator',
      description: 'Essential tool for residential developers to analyze project feasibility, costs, and potential returns.',
      icon: '🏘️',
      link: <Link className="try-button" to={routes.RESIDENTIAL_DEVELOPMENT}>Try Now</Link>
    },
    {
      id: 'construction-budget',
      title: 'Construction Budget Generator',
      description: 'Automated budget creation tool with industry-standard line items and cost estimation.',
      icon: '📊',
      link:<Link className="try-button" to={routes.CONSTRUCTION_BUDGET}>Try Now</Link>
    },
    {
      id: 'multi-family-proforma',
      title: 'Multi-family Proforma',
      description: 'Detailed financial modeling tool for multi-family properties with comprehensive cash flow analysis.',
      icon: '💰',
      link:<Link className="try-button" to={routes.MULTIFAMILY_ANALYSIS}>Try Now</Link>
    },
    {
      id: 'industrial-sqft',
      title: 'Industrial Per SQFT Calculator',
      description: 'Quick and accurate calculations for industrial property metrics on a per-square-foot basis.',
      icon: '📏',
      link:<Link className="try-button" to={routes.INDUSTRIAL_PRICE_PER_SQFT}>Try Now</Link>
    },
    {
      id: 'multi-family-door',
      title: 'Multi-family Per Door Calculator',
      description: 'Essential metrics calculator for multi-family properties on a per-unit basis.',
      icon: '🚪',
      link: <Link className="try-button" to={routes.MULTI_FAMILY_PRICE_PER_DOOR}>Try Now</Link>
    },
    {
      id: 'seller-irr',
      title: "Seller's IRR Estimator",
      description: 'Sophisticated tool for calculating and analyzing Internal Rate of Return for property sellers.',
      icon: '📈',
      link:<Link className="try-button" to={routes.IRR_CALCULATOR}>Try Now</Link>
    },
    {
      id: 'site-plan',
      title: 'Site Plan Generator',
      description: 'Innovative tool for creating preliminary site plans and layout options for development projects.',
      icon: '🗺️',
      link:<Link className="try-button"  to={routes.SITE_PLAN_BUILDER}>Try Now</Link>
    }
  ];

  return (
    <div className="landing-page">

      <HeroSection />

      <section className="benefits">
        <div className="container">
          <h2>Why Choose Our Tools?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>Professional Grade</h3>
              <p>Industry-standard calculations used by top developers</p>
            </div>
            <div className="benefit-item">
              <h3>Time Saving</h3>
              <p>Complete complex calculations in minutes, not hours</p>
            </div>
            <div className="benefit-item">
              <h3>Accurate Results</h3>
              <p>Trusted by industry professionals for reliable analysis</p>
            </div>
          </div>
        </div>
      </section>

      <section className="calculators">
        <div className="container">
          <h2>Our Calculator Suite</h2>
          <div className="calculator-grid">
            {calculators.map(calc => (
              <div key={calc.id} className="calculator-card">
                <span className="calculator-icon">{calc.icon}</span>
                <h3>{calc.title}</h3>
                <p>{calc.description}</p>
                {/* <button ></button> */}
                {calc.link}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Elevate Your Analysis?</h2>
          <p>Join thousands of real estate professionals who trust our tools</p>
          <Link className="cta-button" to="/register">Get Started Now</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;