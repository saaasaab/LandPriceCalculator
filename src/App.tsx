
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotFound from './pages/NotFound';
import ResidentialCashFlowCalculator from './pages/ResidentialCashFlowCalculator';

import Navbar from './components/Navbar';
import EVERYTHING_BURGER from './pages/EVERYTHING_BURGER';

import { EPageNames } from './utils/types';

import './App.css'
import NeighborhoodMeeting from './pages/NeighborhoodMeeting';
import NeighborhoodMeetingConfirmationPage from './pages/NeighborhoodMeetingConfirmationPage';
import ResidentialPriceCalculator from './pages/ResidentialPriceCalculator';


function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleWindowSizeChange = () => {
    setIsMobile(window.innerWidth <= 768);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  return (
    <Router>
      <div className="land-calculator-container">
        {/* Navigation Links */}
        <Navbar />

        {/* Route Definitions */}
        <Routes>
          {/* <Route path="/" element={ <LandCalculator isMobile={isMobile} />} /> */}
          <Route path="/" element={<EVERYTHING_BURGER page={EPageNames.MULTIFAMILY_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/residential-development" element={<EVERYTHING_BURGER page={EPageNames.RESIDENTIAL_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/industrial-development" element={<EVERYTHING_BURGER page={EPageNames.INDUSTRIAL_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/multifamily-development" element={<EVERYTHING_BURGER page={EPageNames.MULTIFAMILY_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/multifamily-analysis" element={<ResidentialCashFlowCalculator isMobile={isMobile} page={EPageNames.MULTIFAMILY_ANALYSIS}>} />
          <Route path="/multifamily-price-calculator" element={<ResidentialPriceCalculator isMobile={isMobile} page={EPageNames.MULTI_FAMILY_PRICE}/>} />


          

          <Route path="/1579-se-3rd-ct" element={<NeighborhoodMeeting  />} />
          <Route path="/1579-se-3rd-ct-confirmation" element={<NeighborhoodMeetingConfirmationPage />} />
          <Route path="*" element={<NotFound />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App
