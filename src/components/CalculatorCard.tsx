import { Link } from "react-router-dom";
import type { CalculatorTool } from "../config/calculators";
import CalculatorIcon from "./CalculatorIcon";
import "./CalculatorCard.scss";

const CalculatorCard = ({ tool }: { tool: CalculatorTool }) => {
  return (
    <Link className="calculator-card" to={tool.route}>
      <span className="calculator-card-icon">
        <CalculatorIcon name={tool.icon} size={22} />
      </span>
      <div className="calculator-card-body">
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
        <p className="calculator-card-answer">{tool.primaryAnswer}</p>
        <div className="calculator-card-meta">
          {tool.propertyTypes.map((type) => (
            <span key={type} className="calculator-card-tag">{type}</span>
          ))}
          {tool.isAlpha ? <span className="calculator-card-badge">Alpha</span> : null}
          {tool.isDesktopOnly ? <span className="calculator-card-badge">Desktop only</span> : null}
        </div>
      </div>
    </Link>
  );
};

export default CalculatorCard;
