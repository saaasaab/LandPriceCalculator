import Pricing from './Pricing';
import { TRIAL_DAYS } from '../utils/constants';

const EndFreeTrial = () => {
  return (
    <section className="pricing-section">
      <div className="container">
        <div className="header">
          <h2 className="title">Your free trial has ended</h2>
          <div className="subtitle">
            Create an account to start a {TRIAL_DAYS}-day trial, then upgrade for lifetime access.
          </div>
        </div>
      </div>
      <Pricing />
    </section>
  );
};

export default EndFreeTrial;
