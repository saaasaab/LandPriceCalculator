import { Link } from 'react-router-dom';
import logo from '../assets/LandCalculatorLogo.svg'
import './Navbar.scss';
import { useState } from 'react';
import Hamburger from './Hamburger';
import { EPageTitles } from '../utils/types';
import { useAuth } from '../context/AuthContext';




export const routes = {
  MULTIFAMILY_DEVELOPMENT: "/multifamily-development",
  INDUSTRIAL_DEVELOPMENT: "/industrial-development",
  COMMERCIAL_DEVELOPMENT: "/commercial-development",
  RESIDENTIAL_DEVELOPMENT: "/residential-development",
  MULTI_FAMILY_PRICE_PER_DOOR: "/multifamily-price-calculator",
  INDUSTRIAL_PRICE_PER_SQFT: "industrial-price-per-sqft-calculator",
  MULTIFAMILY_ANALYSIS: "/multifamily-analysis",
  INDUSTRIAL_PROFORMA: "/industrial-commercial-proforma",
  HOW_TO_LAND_FOR_MULTIFAMILY: "/how-to-analyzis-land-for-multifamily",
  IRR_CALCULATOR: "/irr-calculator",
  HARD_MONEY_COST_ESTIMATOR: "/hard-money-calculator",
  WATERFALL: "/waterfall-generator",
  CONSTRUCTION_BUDGET: "/construction-budget-generator",
  SITE_PLAN_BUILDER: "/site-plan-builder",
  HOUSE_FLIPPING_CALCULATOR: "/house-flipping-calculator",
  HOME: "/",

  // Authentication & User-related Routes
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  REGISTER: "/register",

  // General Pages
  LANDING_PAGE: "/landing",
  END_FREE_TRIAL: "/end-free-trial",
  PAYMENT: "/payment",
  COMPLETION: "/completion",
  SIGN_UP: "/sign-up",
  TERMS: "/terms",
}

export const calculatorIcons = {
  [routes.MULTIFAMILY_DEVELOPMENT]: '🏢',
  [routes.INDUSTRIAL_DEVELOPMENT]: '🏭',
  [routes.COMMERCIAL_DEVELOPMENT]: '🏢',
  [routes.RESIDENTIAL_DEVELOPMENT]: '🏘️',
  [routes.CONSTRUCTION_BUDGET]: '📊',
  [routes.MULTIFAMILY_ANALYSIS]: '💰',
  [routes.INDUSTRIAL_PROFORMA]: '💰',
  [routes.INDUSTRIAL_PRICE_PER_SQFT]: '📏',
  [routes.MULTI_FAMILY_PRICE_PER_DOOR]: '🚪',
  [routes.IRR_CALCULATOR]: '📈',
  // [routes.SITE_PLAN_BUILDER]: '🗺️',
}


const IconLink = ({ route, text, handleToggleMenu,className }: { route: string, text: string, handleToggleMenu: () => void,className?: string }) => {

  const icon = calculatorIcons[route];
  const link = route;

  return (
    <Link className={`icon-link ${className!==""?className:"" }`} to={link} onClick={handleToggleMenu}>
      <div className="calculator-icon">{icon}</div>
      <div>{text}</div>
    </Link>

  );
};


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (

    <nav className={`navbar ${isMobileMenuOpen ? 'is-open-navbar' : ''}`}>

      <Hamburger isOpen={isMobileMenuOpen} onClick={handleToggleMenu} />

      <div className="navbar-logo">
        <img src={logo} alt="Land Price Calculator Logo" />
        <h3>Land Price Calculator</h3>
      </div>


      <ul className={`navbar-links ${isMobileMenuOpen ? 'is-open' : ''}`}>

        <li className="dropdown">
          <Link className="dropdown-title" onClick={handleToggleMenu} to={routes.HOME}>{EPageTitles.HOME}</Link>

        </li>


        {/* Development Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Development Tools</span>
          <div className="dropdown-content">
            <IconLink route={routes.RESIDENTIAL_DEVELOPMENT} handleToggleMenu={handleToggleMenu} text={EPageTitles.RESIDENTIAL_DEVELOPMENT} />
            <IconLink route={routes.MULTIFAMILY_DEVELOPMENT} handleToggleMenu={handleToggleMenu} text={EPageTitles.MULTIFAMILY_DEVELOPMENT} />
            <IconLink route={routes.INDUSTRIAL_DEVELOPMENT} handleToggleMenu={handleToggleMenu} text={EPageTitles.INDUSTRIAL_DEVELOPMENT} />
            <IconLink route={routes.COMMERCIAL_DEVELOPMENT} handleToggleMenu={handleToggleMenu} text={EPageTitles.COMMERCIAL_DEVELOPMENT} />
            <IconLink route={routes.CONSTRUCTION_BUDGET} handleToggleMenu={handleToggleMenu} text={EPageTitles.CONSTRUCTION_BUDGET} />
          </div>
        </li>

        {/* Analysis Dropdown */}
        {/* Analysis Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Analysis Tools</span>
          <div className="dropdown-content">
            <IconLink route={routes.MULTIFAMILY_ANALYSIS} handleToggleMenu={handleToggleMenu} text={EPageTitles.MULTIFAMILY_ANALYSIS} />
            {/* <IconLink route={routes.INDUSTRIAL_PROFORMA} handleToggleMenu={handleToggleMenu} text={EPageTitles.INDUSTRIAL_PROFORMA} /> */}

            <IconLink route={routes.MULTI_FAMILY_PRICE_PER_DOOR} handleToggleMenu={handleToggleMenu} text={EPageTitles.MULTI_FAMILY_PRICE_PER_DOOR} />
            <IconLink route={routes.INDUSTRIAL_PRICE_PER_SQFT} handleToggleMenu={handleToggleMenu} text={EPageTitles.INDUSTRIAL_PRICE_PER_SQFT} />
            <IconLink route={routes.IRR_CALCULATOR} handleToggleMenu={handleToggleMenu} text={EPageTitles.IRR_CALCULATOR} />
            <IconLink route={routes.HARD_MONEY_COST_ESTIMATOR} handleToggleMenu={handleToggleMenu} text={EPageTitles.HARD_MONEY_COST_ESTIMATOR} />
            <IconLink route={routes.HOUSE_FLIPPING_CALCULATOR} handleToggleMenu={handleToggleMenu} text={EPageTitles.HOUSE_FLIPPING_CALCULATOR} />

            {/* Uncomment these if needed */}
            {/* <IconLink route={routes.WATERFALL} handleToggleMenu={handleToggleMenu} text={EPageTitles.WATERFALL} /> */}
            {/* <IconLink route={routes.SITE_PLAN_BUILDER} handleToggleMenu={handleToggleMenu} text={EPageTitles.SITE_PLAN_BUILDER} /> */}
          </div>
        </li>

        <li className="dropdown">
          <IconLink route={routes.SITE_PLAN_BUILDER} handleToggleMenu={handleToggleMenu} text={EPageTitles.SITE_PLAN_BUILDER} />
        </li>



        {/* Howto and Blogs */}
        {/* <li className="dropdown">
          <span className="dropdown-title">Education Center</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to={routes.HOW_TO_LAND_FOR_MULTIFAMILY}>How to analyze land for multifamily</Link>
            <Link onClick={handleToggleMenu} to={routes.ARTICLES}>Articles</Link>
          </div>
        </li> */}

        <div className="navbar-auth">
          {user ? (
            <>
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
          <IconLink className="login-btn" route={routes.LOGIN} handleToggleMenu={handleToggleMenu} text={"Login"} />

          )}
        </div>
      </ul>





    </nav>

  );
};

export default Navbar;
