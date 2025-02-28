import { Link } from "react-router-dom";
import { routes } from "./Navbar";

const Footer = () => {
  return (
    <footer style={{ textAlign: "center", padding: "20px", marginTop: "40px", borderTop: "1px solid #ddd" }}>
      <p>© {new Date().getFullYear()} LandPriceCalculator. All rights reserved.</p>
      <p>
        <Link to={routes.TERMS}>Terms & Conditions</Link>
      </p>
    </footer>
  );
};

export default Footer;