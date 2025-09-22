import React from 'react';
import './EmailPopup.scss';
import { X } from 'lucide-react';

interface EmailPopupProps {
  onClose: () => void;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ onClose }) => {
//   const [email, setEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     // TODO: Add your email submission logic here
    
//     localStorage.setItem('popupShown', 'true');
//     onClose();
//   };

  return (
    <div className="email-popup-overlay">
      <div className="email-popup">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="popup-content">
          <h2>Unlock Premium Access</h2>
          <h3>14-Day Free Trial</h3>
          <p>Then get <span className="highlight">lifetime access</span> for just <span className="price">$20</span></p>
          
          {/* <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email to start your free trial"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Start Free Trial'}
            </button>
          </form> */}
          
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