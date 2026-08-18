import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmailPopup.scss';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TRIAL_DAYS, getPurchaseRoute, PRICING_CTA, PRICING_HEADLINE, LIFETIME_PRICE } from '../../utils/constants';

interface EmailPopupProps {
  onClose: () => void;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartTrial = () => {
    onClose();
    navigate(getPurchaseRoute(user));
  };

  return (
    <div className="email-popup-overlay">
      <div className="email-popup">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="popup-content">
          <h2>Start a free {TRIAL_DAYS}-day trial</h2>
          <p>{PRICING_HEADLINE}</p>
          <p>Lifetime access is a one-time ${LIFETIME_PRICE} payment.</p>
          
          <div className="cta-section">
            <button type="button" className="signup-button" onClick={handleStartTrial}>
              {PRICING_CTA}
            </button>
          </div>
          
          <div className="features">
            <p>✓ Land Analysis & Zoning Insights</p>
            <p>✓ Automated Site Plan Generation</p>
            <p>✓ Financial Projections & ROI Analysis</p>
            <p>✓ Multi-Family & Commercial Development Tools</p>
            <p>✓ Investor Returns Modeling</p>
            <p>✓ Construction Budget Generator</p>
            <p>✓ Profitability & Offer Price Calculator</p>
          </div>

          <div className="guarantee">
            <p>No credit card required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPopup; 