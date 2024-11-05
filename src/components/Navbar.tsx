import { Link } from 'react-router-dom';
import logo from '../assets/LandCalculatorLogo.svg'
import './Navbar.scss';
import { useState } from 'react';
import Hamburger from './Hamburger';

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
            <Link onClick={handleToggleMenu} to="/">Multi-Family Development</Link>
            <Link onClick={handleToggleMenu} to="/industrial-development">Industrial Development</Link>
            <Link onClick={handleToggleMenu} to="/residential-development">Residential Development</Link>
          </div>
        </li>

        {/* Analysis Dropdown */}
        <li className="dropdown">
          <span className="dropdown-title">Analysis</span>
          <div className="dropdown-content">
            <Link onClick={handleToggleMenu} to="/multifamily-analysis">Multi-Family Analysis</Link>
            <Link onClick={handleToggleMenu} to="/multifamily-price-calculator">Multi-Family Price Calculator</Link>
          </div>
        </li>
      </ul>
    </nav>

  );
};

export default Navbar;
