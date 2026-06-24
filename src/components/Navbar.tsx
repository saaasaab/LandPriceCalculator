import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
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
  Mountain,
  PaintRoller,
  PiggyBank,
  Ruler,
  Sparkles,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import logo from "../assets/LandCalculatorLogo.svg";
import "./Navbar.scss";
import Hamburger from "./Hamburger";
import { EPageTitles } from "../utils/types";
import { useAuth } from "../context/AuthContext";
import { getPurchaseRoute } from "../utils/constants";

const navIconProps = { size: 22, strokeWidth: 2, "aria-hidden": true as const };
const authLinkIconProps = { size: 18, strokeWidth: 2, "aria-hidden": true as const };




export const routes = {
  MULTIFAMILY_DEVELOPMENT: "/multifamily-development",
  INDUSTRIAL_DEVELOPMENT: "/industrial-development",
  COMMERCIAL_DEVELOPMENT: "/commercial-development",
  RESIDENTIAL_DEVELOPMENT: "/residential-development",
  MULTI_FAMILY_PRICE_PER_DOOR: "/multifamily-price-calculator",
  INDUSTRIAL_PRICE_PER_SQFT: "/industrial-price-per-sqft-calculator",
  MULTIFAMILY_ANALYSIS: "/multifamily-analysis",
  INDUSTRIAL_PROFORMA: "/industrial-commercial-proforma",
  HOW_TO_LAND_FOR_MULTIFAMILY: "/how-to-analyzis-land-for-multifamily",
  IRR_CALCULATOR: "/irr-calculator",
  HARD_MONEY_COST_ESTIMATOR: "/hard-money-calculator",
  WATERFALL: "/waterfall-generator",
  CONSTRUCTION_BUDGET: "/construction-budget-generator",
  SITE_PLAN_BUILDER: "/site-plan-builder",
  CUT_FILL_CALCULATOR: "/cut-fill-calculator",
  HOUSE_FLIPPING_CALCULATOR: "/house-flipping-calculator",
  CONSTRUCTION_LOAN_CALCULATOR: "/construction-loan-calculator",
  HOME_MORTGAGE_CALCULATOR: "/home-mortgage-calculator",
  LEASE_EXPIRY_SCHEDULE: "/lease-expiry-schedule",
  HOME: "/",

  // Authentication & User-related Routes
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
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
  [routes.HOME_MORTGAGE_CALCULATOR]: <Banknote {...navIconProps} />,
  [routes.LEASE_EXPIRY_SCHEDULE]: <CalendarClock {...navIconProps} />,
  [routes.CONSTRUCTION_LOAN_CALCULATOR]: <HardHat {...navIconProps} />,
  [routes.SITE_PLAN_BUILDER]: <Map {...navIconProps} />,
  [routes.CUT_FILL_CALCULATOR]: <Mountain {...navIconProps} />,
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

type NavMenuItem = {
  route: string;
  title: string;
};

type NavMenu = {
  label: string;
  items: NavMenuItem[];
};

const NAV_MENUS: NavMenu[] = [
  {
    label: "Developer",
    items: [
      { route: routes.RESIDENTIAL_DEVELOPMENT, title: EPageTitles.RESIDENTIAL_DEVELOPMENT },
      { route: routes.MULTIFAMILY_DEVELOPMENT, title: EPageTitles.MULTIFAMILY_DEVELOPMENT },
      { route: routes.INDUSTRIAL_DEVELOPMENT, title: EPageTitles.INDUSTRIAL_DEVELOPMENT },
      { route: routes.COMMERCIAL_DEVELOPMENT, title: EPageTitles.COMMERCIAL_DEVELOPMENT },
      { route: routes.CONSTRUCTION_BUDGET, title: EPageTitles.CONSTRUCTION_BUDGET },
      { route: routes.SITE_PLAN_BUILDER, title: EPageTitles.SITE_PLAN_BUILDER },
      { route: routes.CUT_FILL_CALCULATOR, title: EPageTitles.CUT_FILL_CALCULATOR },
      { route: routes.CONSTRUCTION_LOAN_CALCULATOR, title: EPageTitles.CONSTRUCTION_LOAN_CALCULATOR },
    ],
  },
  {
    label: "Investor",
    items: [
      { route: routes.MULTI_FAMILY_PRICE_PER_DOOR, title: EPageTitles.MULTI_FAMILY_PRICE_PER_DOOR },
      { route: routes.INDUSTRIAL_PRICE_PER_SQFT, title: EPageTitles.INDUSTRIAL_PRICE_PER_SQFT },
      { route: routes.WATERFALL, title: EPageTitles.WATERFALL_GENERATOR },
      { route: routes.MULTIFAMILY_ANALYSIS, title: EPageTitles.MULTIFAMILY_ANALYSIS },
      { route: routes.LEASE_EXPIRY_SCHEDULE, title: EPageTitles.LEASE_EXPIRY_SCHEDULE },
    ],
  },
  {
    label: "Property Manager",
    items: [
      { route: routes.MULTIFAMILY_ANALYSIS, title: EPageTitles.MULTIFAMILY_ANALYSIS },
      { route: routes.LEASE_EXPIRY_SCHEDULE, title: EPageTitles.LEASE_EXPIRY_SCHEDULE },
    ],
  },
  {
    label: "Realtor",
    items: [
      { route: routes.HOME_MORTGAGE_CALCULATOR, title: EPageTitles.HOME_MORTGAGE_CALCULATOR },
      { route: routes.IRR_CALCULATOR, title: EPageTitles.IRR_CALCULATOR },
    ],
  },
  {
    label: "Flipper",
    items: [
      { route: routes.HOUSE_FLIPPING_CALCULATOR, title: EPageTitles.HOUSE_FLIPPING_CALCULATOR },
      { route: routes.HARD_MONEY_COST_ESTIMATOR, title: EPageTitles.HARD_MONEY_COST_ESTIMATOR },
    ],
  },
];

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


        {NAV_MENUS.map((menu) => (
          <li key={menu.label} className="dropdown">
            <span className="dropdown-title">{menu.label}</span>
            <div className="dropdown-content">
              {menu.items.map((item) => (
                <IconLink
                  key={item.route}
                  route={item.route}
                  handleToggleMenu={handleToggleMenu}
                  text={item.title}
                />
              ))}
            </div>
          </li>
        ))}

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
            <>
              {!user.is_paid ? (
                <Link
                  to={getPurchaseRoute(user)}
                  className="upgrade-btn"
                  onClick={handleToggleMenu}
                >
                  <Sparkles size={18} strokeWidth={2} aria-hidden />
                  <span>Upgrade</span>
                </Link>
              ) : null}
              <button type="button" onClick={logout} className="logout-btn">
                <LogOut size={18} strokeWidth={2} aria-hidden />
                <span>Logout</span>
              </button>
            </>
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
