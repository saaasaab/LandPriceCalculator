
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotFound from './pages/NotFound';
import Navbar, { routes } from './components/Navbar';
import EVERYTHING_BURGER from './pages/EVERYTHING_BURGER';
import { EPageNames } from './utils/types';

import './App.css'
import BlogPost from './futureItems/BlogPost';
import SitePlanDesigner from './pages/SiteplanDesigner/SitePlanDesigner';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import Register from './components/Auth/Register';

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
          <Route path={routes.INDUSTRIAL_DEVELOPMENT} element={<EVERYTHING_BURGER page={EPageNames.INDUSTRIAL_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path={routes.MULTIFAMILY_DEVELOPMENT} element={<EVERYTHING_BURGER page={EPageNames.MULTIFAMILY_DEVELOPMENT} isMobile={isMobile} />} />
          <Route path={routes.MULTIFAMILY_ANALYSIS} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.MULTIFAMILY_ANALYSIS} />} />
          <Route path={routes.MULTI_FAMILY_PRICE_PER_DOOR} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.MULTI_FAMILY_PRICE_PER_DOOR} />} />
          <Route path={routes.INDUSTRIAL_PRICE_PER_SQFT} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.INDUSTRIAL_PRICE_PER_SQFT} />} />

          <Route path={routes.IRR_CALCULATOR} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.IRR_CALCULATOR} />} />
          <Route path={routes.HOW_TO_LAND_FOR_MULTIFAMILY} element={<BlogPost />} />
          <Route path={routes.LENDING_COST} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.LENDING_COST} />} />
          <Route path={routes.WATERFALL} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.WATERFALL} />} />
          <Route path={routes.CONSTRUCTION_BUDGET} element={<EVERYTHING_BURGER isMobile={isMobile} page={EPageNames.CONSTRUCTION_BUDGET} />} />
          <Route path={routes.SITE_PLAN_BUILDER} element={<SitePlanDesigner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />


          <Route path="*" element={<NotFound />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App
