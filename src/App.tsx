
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotFound from './pages/NotFound';
import Navbar, { routes } from './components/Navbar';
import EVERYTHING_BURGER from './pages/EVERYTHING_BURGER';
import { EPageNames } from './utils/types';
import NeighborhoodMeeting from './pages/NeighborhoodMeeting';
import NeighborhoodMeetingConfirmationPage from './pages/NeighborhoodMeetingConfirmationPage';


import './App.css'
import BlogPost from './pages/BlogPost';


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
          <Route path={routes.RESIDENTIAL_DEVELOPMENT} element={<EVERYTHING_BURGER page={EPageNames.RESIDENTIAL_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/industrial-development" element={<EVERYTHING_BURGER page={EPageNames.INDUSTRIAL_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/multifamily-development" element={<EVERYTHING_BURGER page={EPageNames.MULTIFAMILY_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path="/multifamily-analysis" element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.MULTIFAMILY_ANALYSIS}/>} />
          <Route path="/multifamily-price-calculator" element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.MULTI_FAMILY_PRICE}/>} />
          <Route path={routes.IRR_CALCULATOR} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.IRR_CALCULATOR}/>} />
          <Route path={routes.HOW_TO_LAND_FOR_MULTIFAMILY} element={<BlogPost />} />
          

          
  

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
