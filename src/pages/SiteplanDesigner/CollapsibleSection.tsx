import { useState } from "react";
import './CollapsibleSection.scss';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
  }
  
  const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    return (
      <div className="sidebar-section">
        <div
          className="sidebar-section-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h3>{title}</h3>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && <div className="sidebar-section-content">{children}</div>}
      </div>
    );
  };

  export default CollapsibleSection;