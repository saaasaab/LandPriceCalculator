import { Link } from 'react-router-dom';
import logo from '../../public/LandCalculatorLogo.svg'
import './Navbar.scss';

const Navbar = () => {
  return (

    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Land Price Calculator Logo" />
          <h3>Land Price Calculators</h3>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Residential Development</Link> </li>
        <li><Link to="/industrial-development">Industrial Development</Link></li>
        {/* <li><Link to="/multifamily-development">Multi-Family Development</Link></li> */}
        <li><Link to="/multifamily-analysis">Multi-Family Analysis</Link></li>

      </ul>
    </nav>
  );
};

export default Navbar;
