import { Link } from "react-router-dom";
import type { CalculatorTool } from "../config/calculators";
import CalculatorIcon from "./CalculatorIcon";
import "./CalculatorCard.scss";

const cardTitle = (tool: CalculatorTool) =>
  tool.name.replace(/\s+Calculator$/i, "").trim();

const CalculatorCard = ({ tool }: { tool: CalculatorTool }) => {
  const showBadges = tool.isAlpha || tool.isDesktopOnly;

  return (
    <Link className="calculator-card" to={tool.route}>
      <span className="calculator-card-icon">
        <CalculatorIcon name={tool.icon} size={16} />
      </span>
      <div className="calculator-card-body">
        <h3>{cardTitle(tool)}</h3>
        <p>{tool.description}</p>
        {showBadges ? (
          <div className="calculator-card-meta">
            {tool.isAlpha ? <span className="calculator-card-badge">Alpha</span> : null}
            {tool.isDesktopOnly ? <span className="calculator-card-badge">Desktop only</span> : null}
          </div>
        ) : null}
      </div>
      <span className="calculator-card-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
};

export default CalculatorCard;
