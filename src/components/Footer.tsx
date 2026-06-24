import { Link } from "react-router-dom";
import { routes } from "./Navbar";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <p>© {new Date().getFullYear()} LandPriceCalculator. All rights reserved.</p>
        <p>
          <Link to={routes.TERMS}>Terms & Conditions</Link>
        </p>
      </div>

      <div className="footer-contact-note">
        <p>Let's talk. If you have any questions, suggestions, or if you're working on anything interesting, email me:</p>
        <a href="mailto:ExpanseInvestments@gmail.com">ExpanseInvestments@gmail.com</a>
      </div>
    </footer>
  );
};

export default Footer;
