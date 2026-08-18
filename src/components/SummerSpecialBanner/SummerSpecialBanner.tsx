import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPurchaseRoute, LIFETIME_PRICE, PROMOTION_END_DATE, PRICING_CTA } from '../../utils/constants';
import './SummerSpecialBanner.scss';

const SUMMER_BANNER_DISMISSED_KEY = 'summerSpecialBannerDismissed';

const SummerSpecialBanner = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(
    () => !localStorage.getItem(SUMMER_BANNER_DISMISSED_KEY),
  );

  if (user?.is_paid || !isVisible) {
    return null;
  }

  const dismiss = () => {
    localStorage.setItem(SUMMER_BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  return (
    <div className="summer-special-banner" role="region" aria-label="Summer special offer">
      <div className="content">
        <p>
          <strong>Summer special:</strong> ${LIFETIME_PRICE} for life through {PROMOTION_END_DATE}. Then pricing moves to ${LIFETIME_PRICE}/month.
        </p>
        <Link to={getPurchaseRoute(user)} className="cta">
          {PRICING_CTA}
        </Link>
      </div>

      <button
        type="button"
        className="close"
        onClick={dismiss}
        aria-label="Dismiss summer special banner"
      >
        <X size={18} aria-hidden />
      </button>
    </div>
  );
};

export default SummerSpecialBanner;
