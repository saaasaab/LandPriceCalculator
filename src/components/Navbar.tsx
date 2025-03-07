import { Link } from 'react-router-dom';
import logo from '../assets/LandCalculatorLogo.svg'
import './Navbar.scss';
import { useState } from 'react';
import Hamburger from './Hamburger';
import { EPageTitles } from '../utils/types';
import { useAuth } from '../context/AuthContext';



export const routes = {
  MULTIFAMILY_DEVELOPMENT: "/residential-development",
  INDUSTRIAL_DEVELOPMENT: "/industrial-development",
  RESIDENTIAL_DEVELOPMENT: "/residential-development",
  MULTI_FAMILY_PRICE_PER_DOOR: "/multifamily-price-calculator",
  INDUSTRIAL_PRICE_PER_SQFT: "industrial-price-per-sqft-calculator",
  MULTIFAMILY_ANALYSIS: "/multifamily-analysis",
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


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };




  return (

    <nav className={`navbar ${isMobileMenuOpen ? 'is-open' : ''}`}>

      <Hamburger isOpen={isMobileMenuOpen} onClick={handleToggleMenu} />

      <div className="navbar-logo">
        <img src={logo} alt="Land Price Calculator Logo" />
        <h3>Land Price Calculators</h3>
      </div>


      <ul className={`navbar-links ${isMobileMenuOpen ? 'is-open' : ''}`}>

        <li className="dropdown">
          <Link className="dropdown-title" onClick={handleToggleMenu} to={routes.HOME}>{EPageTitles.HOME}</Link>

        </li>


        {/* Development Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Development Tools</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to={routes.MULTIFAMILY_DEVELOPMENT}>{EPageTitles.MULTIFAMILY_DEVELOPMENT}</Link>
            <Link onClick={handleToggleMenu} to={routes.INDUSTRIAL_DEVELOPMENT}>{EPageTitles.INDUSTRIAL_DEVELOPMENT}</Link>
            <Link onClick={handleToggleMenu} to={routes.RESIDENTIAL_DEVELOPMENT}>{EPageTitles.RESIDENTIAL_DEVELOPMENT}</Link>
            <Link onClick={handleToggleMenu} to={routes.CONSTRUCTION_BUDGET}>{EPageTitles.CONSTRUCTION_BUDGET}</Link>
          </div>
        </li>

        {/* Analysis Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Analysis Tools</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to={routes.MULTIFAMILY_ANALYSIS}>{EPageTitles.MULTIFAMILY_ANALYSIS}</Link>
            <Link onClick={handleToggleMenu} to={routes.MULTI_FAMILY_PRICE_PER_DOOR}>{EPageTitles.MULTI_FAMILY_PRICE_PER_DOOR}</Link>
            <Link onClick={handleToggleMenu} to={routes.INDUSTRIAL_PRICE_PER_SQFT}>{EPageTitles.INDUSTRIAL_PRICE_PER_SQFT}</Link>
            <Link onClick={handleToggleMenu} to={routes.IRR_CALCULATOR}>{EPageTitles.IRR_CALCULATOR}</Link>
            <Link onClick={handleToggleMenu} to={routes.HARD_MONEY_COST_ESTIMATOR}>{EPageTitles.HARD_MONEY_COST_ESTIMATOR}</Link>
            <Link onClick={handleToggleMenu} to={routes.HOUSE_FLIPPING_CALCULATOR}>{EPageTitles.HOUSE_FLIPPING_CALCULATOR}</Link>

            
            
            {/* <Link onClick={handleToggleMenu} to={routes.WATERFALL}>{EPageTitles.WATERFALL}</Link> */}
            {/* <Link onClick={handleToggleMenu} to={routes.SITE_PLAN_BUILDER}>{EPageTitles.SITE_PLAN_BUILDER}</Link> */}

          </div>
        </li>

        <li className="dropdown">
          <Link className="dropdown-title" onClick={handleToggleMenu} to={routes.SITE_PLAN_BUILDER}>{EPageTitles.SITE_PLAN_BUILDER}</Link>

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
            <Link to={routes.LOGIN} className="login-btn">Login</Link>
          )}
        </div>
      </ul>





    </nav>

  );
};

export default Navbar;
