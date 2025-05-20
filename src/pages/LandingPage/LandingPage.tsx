import React from 'react';
import './LandingPage.scss';
import HeroSection from './HeroSection';
import { Link } from 'react-router-dom';
import { calculatorIcons, routes } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string
}


const LandingPage: React.FC = () => {
  const { user } = useAuth(); // Use custom hook

  const calculators: Calculator[] = [
    {
      id: 'multi-family-dev',
      title: 'Multi-family Development Calculator',
      description: 'Comprehensive analysis tool for multi-family development projects including cost estimation, revenue projections, and ROI calculations.',
      icon: calculatorIcons[routes.MULTIFAMILY_DEVELOPMENT],
      link: routes.MULTIFAMILY_DEVELOPMENT
    },
    {
      id: 'industrial-dev',
      title: 'Industrial Development Calculator',
      description: 'Advanced calculator for industrial development projects with specialized metrics for warehouse, manufacturing, and logistics facilities.',
      icon: calculatorIcons[routes.INDUSTRIAL_DEVELOPMENT],
      link: routes.INDUSTRIAL_DEVELOPMENT
    },
    {
      id: 'commercial-dev',
      title: 'Commercial Development Calculator',
      description: 'Advanced calculator for commercial development projects with specialized metrics for office buildings and retail.',
      icon: calculatorIcons[routes.COMMERCIAL_DEVELOPMENT],
      link: routes.COMMERCIAL_DEVELOPMENT
    },
    {
      id: 'residential-dev',
      title: 'Residential Development Calculator',
      description: 'Essential tool for residential developers to analyze project feasibility, costs, and potential returns.',
      icon: calculatorIcons[routes.RESIDENTIAL_DEVELOPMENT],
      link: routes.RESIDENTIAL_DEVELOPMENT
    },
    {
      id: 'construction-budget',
      title: 'Construction Budget Generator',
      description: 'Automated budget creation tool with industry-standard line items and cost estimation.',
      icon: calculatorIcons[routes.CONSTRUCTION_BUDGET],
      link: routes.CONSTRUCTION_BUDGET
    },
    {
      id: 'multi-family-proforma',
      title: 'Multi-family Proforma',
      description: 'Detailed financial modeling tool for multi-family properties with comprehensive cash flow analysis.',
      icon: calculatorIcons[routes.MULTIFAMILY_ANALYSIS],
      link: routes.MULTIFAMILY_ANALYSIS
    },
    {
      id: 'industrial-sqft',
      title: 'Industrial Per SQFT Calculator',
      description: 'Quick and accurate calculations for industrial property metrics on a per-square-foot basis.',
      icon: calculatorIcons[routes.INDUSTRIAL_PRICE_PER_SQFT],
      link: routes.INDUSTRIAL_PRICE_PER_SQFT
    },
    {
      id: 'multi-family-door',
      title: 'Multi-family Per Door Calculator',
      description: 'Essential metrics calculator for multi-family properties on a per-unit basis.',
      icon: calculatorIcons[routes.MULTI_FAMILY_PRICE_PER_DOOR],
      link: routes.MULTI_FAMILY_PRICE_PER_DOOR
    },
    {
      id: 'seller-irr',
      title: "Seller's IRR Estimator",
      description: 'Sophisticated tool for calculating and analyzing Internal Rate of Return for property sellers.',
      icon: calculatorIcons[routes.IRR_CALCULATOR],
      link: routes.IRR_CALCULATOR
    },
    {
      id: 'site-plan',
      title: 'Site Plan Generator',
      description: 'Innovative tool for creating preliminary site plans and layout options for development projects.',
      icon: calculatorIcons[routes.SITE_PLAN_BUILDER],
      link: routes.SITE_PLAN_BUILDER
    }
  ];




  return (
    <div className="landing-page">

      {user ? <></> : <HeroSection />}





      <section className="calculators">
        <div className="container">
          

          {user ? <h2>Suite of Real Estate Underwriting Tools</h2> : <h2>
            Try expert real estate analysis Tools for free for 7 days, no account needed</h2>}

          <div className="calculator-grid">
            {calculators.map(calc => (
              <Link key={calc.id} className="calculator-link" to={calc.link}>
                <div className="calculator-card">
                  <span className="calculator-icon">{calc.icon}</span>
                  <h3>{calc.title}</h3>
                  <p>{calc.description}</p>

                  <button className="try-button">
                    Try Now

                  </button>
                </div>

              </Link>

            ))}
          </div>
        </div>
      </section>


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


      {user ? <></> : <section className="cta">
        <div className="container">
          <h2>Ready to Elevate Your Analysis?</h2>
          <p>Join thousands of real estate professionals who trust our tools</p>
          <Link className="cta-button" to={routes.SIGN_UP}>Get Started Now</Link>
        </div>
      </section>}


    </div>
  );
};

export default LandingPage;