import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={{ textAlign: "center", padding: "20px", marginTop: "40px", borderTop: "1px solid #ddd" }}>
      <p>© {new Date().getFullYear()} LandPriceCalculator. All rights reserved.</p>
      <p>
        <Link to="/terms">Terms & Conditions</Link>
      </p>
    </footer>
  );
};

export default Footer;