import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import EmailPopup from '../components/EmailPopup/EmailPopup';
import { useAuth } from './AuthContext';
import { routes } from '../config/routes';

interface PopupContextType {
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  handleClosePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

const MARKETING_PATHS = new Set<string>([
  routes.HOME,
  routes.TOOLS,
  routes.LANDING_PAGE,
  routes.LOGIN,
  routes.REGISTER,
  routes.SIGN_UP,
  routes.FORGOT_PASSWORD,
  routes.PAYMENT,
  routes.TERMS,
  routes.COMPLETION,
  routes.END_FREE_TRIAL,
]);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupTimerRef = useRef<number>();
  const { user } = useAuth();
  const location = useLocation();
  const isCalculatorPage = !MARKETING_PATHS.has(location.pathname) && !location.pathname.startsWith(routes.RESET_PASSWORD);

  useEffect(() => {
    if (user || !isCalculatorPage) {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
        popupTimerRef.current = undefined;
      }
      setShowPopup(false);
      return;
    }

    const hasSeenPopup = localStorage.getItem('popupShown');

    if (!hasSeenPopup) {
      popupTimerRef.current = window.setTimeout(() => {
        setShowPopup(true);
      }, 90000);
    }

    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [user, isCalculatorPage]);

  const handleClosePopup = () => {
    setShowPopup(false);
    localStorage.setItem('popupShown', 'true');
  };

  return (
    <PopupContext.Provider value={{ showPopup, setShowPopup, handleClosePopup }}>
      {showPopup && <EmailPopup onClose={handleClosePopup} />}
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}; 