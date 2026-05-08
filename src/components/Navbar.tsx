import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  DoorOpen,
  Factory,
  GitFork,
  HardHat,
  Home,
  Landmark,
  LineChart,
  LogIn,
  LogOut,
  Map,
  PaintRoller,
  PiggyBank,
  Ruler,
  TrendingUp,
} from "lucide-react";
import logo from "../assets/LandCalculatorLogo.svg";
import "./Navbar.scss";
import Hamburger from "./Hamburger";
import { EPageTitles } from "../utils/types";
import { useAuth } from "../context/AuthContext";

const navIconProps = { size: 22, strokeWidth: 2, "aria-hidden": true as const };
const authLinkIconProps = { size: 18, strokeWidth: 2, "aria-hidden": true as const };




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
  CONSTRUCTION_LOAN_CALCULATOR: "/construction-loan-calculator",
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

export const calculatorIcons: Record<string, React.ReactNode> = {
  [routes.RESIDENTIAL_DEVELOPMENT]: <Home {...navIconProps} />,
  [routes.MULTIFAMILY_DEVELOPMENT]: <Building2 {...navIconProps} />,
  [routes.INDUSTRIAL_DEVELOPMENT]: <Factory {...navIconProps} />,
  [routes.COMMERCIAL_DEVELOPMENT]: <Landmark {...navIconProps} />,
  [routes.CONSTRUCTION_BUDGET]: <BarChart3 {...navIconProps} />,
  [routes.MULTIFAMILY_ANALYSIS]: <CircleDollarSign {...navIconProps} />,
  [routes.INDUSTRIAL_PROFORMA]: <LineChart {...navIconProps} />,
  [routes.INDUSTRIAL_PRICE_PER_SQFT]: <Ruler {...navIconProps} />,
  [routes.MULTI_FAMILY_PRICE_PER_DOOR]: <DoorOpen {...navIconProps} />,
  [routes.IRR_CALCULATOR]: <TrendingUp {...navIconProps} />,
  [routes.HARD_MONEY_COST_ESTIMATOR]: <PiggyBank {...navIconProps} />,
  [routes.HOUSE_FLIPPING_CALCULATOR]: <PaintRoller {...navIconProps} />,
  [routes.WATERFALL]: <GitFork {...navIconProps} />,
  [routes.CONSTRUCTION_LOAN_CALCULATOR]: <HardHat {...navIconProps} />,
  [routes.SITE_PLAN_BUILDER]: <Map {...navIconProps} />,
  [routes.LOGIN]: <LogIn {...authLinkIconProps} />,
};

const IconLink = ({
  route,
  text,
  handleToggleMenu,
  className,
}: {
  route: string;
  text: string;
  handleToggleMenu: () => void;
  className?: string;
}) => {
  const icon = calculatorIcons[route];

  return (
    <Link
      className={`icon-link ${className ?? ""}`}
      to={route}
      onClick={handleToggleMenu}
    >
      {icon ? <span className="calculator-icon">{icon}</span> : null}
      <span className="icon-link__text">{text}</span>
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


      <div className={`navbar-menu ${isMobileMenuOpen ? "is-open" : ""}`}>
      <ul className="navbar-links">

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
            <IconLink route={routes.WATERFALL} handleToggleMenu={handleToggleMenu} text={EPageTitles.WATERFALL_GENERATOR} />
            <IconLink route={routes.CONSTRUCTION_LOAN_CALCULATOR} handleToggleMenu={handleToggleMenu} text={EPageTitles.CONSTRUCTION_LOAN_CALCULATOR} />
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
      </ul>

        <div className="navbar-auth">
          {user ? (
            <button type="button" onClick={logout} className="logout-btn">
              <LogOut size={18} strokeWidth={2} aria-hidden />
              <span>Logout</span>
            </button>
          ) : (
            <IconLink
              className="navbar-auth__link"
              route={routes.LOGIN}
              handleToggleMenu={handleToggleMenu}
              text="Login"
            />
          )}
        </div>
      </div>





    </nav>

  );
};

export default Navbar;
