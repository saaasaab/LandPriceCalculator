import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Payment from './Payment';
import { plans } from './Pricing';
import { TRIAL_DAYS } from '../utils/constants';
import './UpgradeAfterTrial.scss';

const FEATURES = [
  'Land Analysis & Zoning Insights',
  'Automated Site Plan Generation',
  'Financial Projections & ROI Analysis',
  'Multi-Family & Commercial Development Tools',
  'Investor Returns Modeling',
  'Construction Budget Generator',
  'Profitability & Offer Price Calculator',
];

const UpgradeAfterTrial = () => {
  const { user } = useAuth();
  const plan = plans[0];
  const daysUsed = user?.days_since_first_login ?? TRIAL_DAYS;

  return (
    <section className="upgrade-after-trial">
      <div className="layout">
        <aside className="sidebar">
          <h2>Your account</h2>
          <p className="account-email">{user?.email}</p>

          <p className="trial-summary">
            You have been using Land Price Calculator for{' '}
            <strong>{daysUsed} {daysUsed === 1 ? 'day' : 'days'}</strong>.
          </p>

          <p className="trial-ended">
            Your {TRIAL_DAYS}-day free trial has ended.
          </p>

          <p className="continue-note">
            To keep using the calculators and saved projects, upgrade to lifetime access below.
          </p>
        </aside>

        <div className="payment-panel">
          <div className="header">
            <h1>Continue with lifetime access</h1>
            <p>One-time payment. No subscription.</p>
          </div>

          <div className="price-display">
            <p className="price">${plan.price}</p>
            <div className="duration">{plan.duration}</div>
          </div>

          <ul className="features-list">
            {FEATURES.map((feature) => (
              <li key={feature}>
                <Check className="icon" size={16} aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="payment-form">
            <Payment email={user?.email ?? ''} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpgradeAfterTrial;
