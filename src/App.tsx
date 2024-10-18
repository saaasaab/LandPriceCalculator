
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandCalculator from './pages/ResidentialDevelopmentCalculator'
import NotFound from './pages/NotFound';
import ResidentialCashFlowCalculator from './pages/ResidentialCashFlowCalculator';
import IndustrialDevelopmentCalculator from './pages/IndustrialDevelopmentCalculator';

import './App.css'
import Navbar from './components/Navbar';
import MultifamilyDevelopmentCalculator from './pages/MultifamilyDevelopmentCalculator';
// import MultiFamilyDevelopmentCalculator from './pages/MultiFamilyDevelopmentCalculator';


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
                <Route path="/" element={ <LandCalculator isMobile={isMobile} />} />
                <Route path="/industrial-development" element={< IndustrialDevelopmentCalculator  isMobile={isMobile}/>} />
                <Route path="/multifamily-development" element={<MultifamilyDevelopmentCalculator  isMobile={isMobile}/>} />                
                <Route path="/multifamily-analysis" element={<ResidentialCashFlowCalculator  isMobile={isMobile}/>} />                
                <Route path="*" element={<NotFound />} />
                {/* <Route path="/contact" element={<Contact />} /> */}
            </Routes>
        </div>
    </Router>
);

  return (
    <>
      
       
    </>

  )
}

export default App
