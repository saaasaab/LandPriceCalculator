import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import EmailPopup from '../components/EmailPopup/EmailPopup';

interface PopupContextType {
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  handleClosePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupTimerRef = useRef<number>();

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('popupShown');
    
    console.log(hasSeenPopup);
    if (!hasSeenPopup) {
      popupTimerRef.current = window.setTimeout(() => {
        setShowPopup(true);
      }, 60000); // 60 seconds
    }

    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

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