import { Link } from "react-router-dom";
import { routes } from "./Navbar";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} LandPriceCalculator. All rights reserved.</p>
      <p>
        <Link to={routes.TERMS}>Terms & Conditions</Link>
      </p>
    </footer>
  );
};

export default Footer;
