import { Link } from 'react-router-dom';
import logo from '../assets/LandCalculatorLogo.svg'
import './Navbar.scss';
import { useState } from 'react';
import Hamburger from './Hamburger';
import { EPageTitles } from '../utils/types';


export const routes = {
  MULTIFAMILY_DEVELOPMENT:"/residential-development",
  INDUSTRIAL_DEVELOPMENT :"/industrial-development",
  RESIDENTIAL_DEVELOPMENT: "/multifamily-development",
  MULTI_FAMILY_PRICE: "/multifamily-price-calculator",
  MULTIFAMILY_ANALYSIS:"/multifamily-analysis",
  HOW_TO_LAND_FOR_MULTIFAMILY:"/how-to-analyzis-land-for-multifamily",
  IRR_CALCULATOR:"/irr-calculator"
}


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        {/* Development Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Development</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to="/">{EPageTitles.MULTIFAMILY_DEVELOPMENT}</Link>
            <Link onClick={handleToggleMenu} to={routes.INDUSTRIAL_DEVELOPMENT}>{EPageTitles.INDUSTRIAL_DEVELOPMENT}</Link>
            <Link onClick={handleToggleMenu} to={routes.RESIDENTIAL_DEVELOPMENT}>{EPageTitles.RESIDENTIAL_DEVELOPMENT}</Link>
          </div>
        </li>

        {/* Analysis Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Analysis</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to={routes.MULTIFAMILY_ANALYSIS}>{EPageTitles.MULTIFAMILY_ANALYSIS}</Link>
            <Link onClick={handleToggleMenu} to={routes.MULTI_FAMILY_PRICE}>{EPageTitles.MULTI_FAMILY_PRICE}</Link>
            <Link onClick={handleToggleMenu} to={routes.IRR_CALCULATOR}>{EPageTitles.IRR_CALCULATOR}</Link>


          </div>
        </li>

         {/* Howto and Blogs */}
         {/* <li className="dropdown">
          <span className="dropdown-title">Analyzing real estate</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to={routes.HOW_TO_LAND_FOR_MULTIFAMILY}>How to analyze land for multifamily</Link>
          </div>
        </li> */}
      </ul>
    </nav>

  );
};

export default Navbar;
