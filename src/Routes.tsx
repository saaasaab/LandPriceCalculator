
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation, Routes, Route } from 'react-router-dom';

import NotFound from './pages/NotFound';
import Navbar, { routes } from './components/Navbar';
import EVERYTHING_BURGER from './pages/EVERYTHING_BURGER';
import { EPageNames } from './utils/types';

import BlogPost from './futureItems/BlogPost';
import SitePlanDesigner from './pages/SiteplanDesigner/SitePlanDesigner';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import Register from './components/Auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage/LandingPage';

import Payment from './pages/Payment';
import Terms from './pages/Terms';
import Footer from './components/Footer';
import Pricing from './pages/Pricing';
import EndFreeTrial from './pages/EndFreeTrial';
import Completion from './pages/Completion';

import './App.css'

export function AppRouter() {
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





  // const [isPaid, setIsPaid] = useState(false);
  const [freeAccessExpired, setFreeAccessExpired] = useState(false);

  useEffect(() => {
    let firstVisitDate = localStorage.getItem("firstVisitDate");

    if (!firstVisitDate) {
      firstVisitDate = new Date().toISOString();
      localStorage.setItem("firstVisitDate", firstVisitDate);
    }
    const firstVisit = new Date(firstVisitDate).getTime();
    const currentDate = new Date().getTime();
    const daysSinceFirstVisit = (currentDate - firstVisit) / (1000 * 60 * 60 * 24);

    if (daysSinceFirstVisit > 7) {
      setFreeAccessExpired(true);
    }

    // ✅ Check if user has paid
    // if (localStorage.getItem("isPaid") === "true") {
    //   // setIsPaid(true);
    // }
  }, []);


  function Children() {

    // user needs to be here otherwise the user doesn't update on change.
    const { user } = useAuth(); // Use custom hook


    return (
      // {/* if is logged in and user is paid   OR   the user hasn't exceeded their free trial*/}
      (user && user.is_paid) || (!freeAccessExpired) ? (
        // ✅ Redirect all pages to Payment if free access expired
        <div className="land-calculator-container">
          {/* Navigation Links */}
          <Navbar />

          {/* Route Definitions */}
          <Routes>
            <Route path={routes.HOME} element={<LandingPage />} />
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
            <Route path={routes.LOGIN} element={<Login />} />
            <Route path={routes.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={routes.REGISTER} element={<Register />} />
            <Route path={routes.LANDING_PAGE} element={<LandingPage />} />
            <Route path={routes.END_FREE_TRIAL} element={<EndFreeTrial />} />
            <Route path={routes.PAYMENT} element={<Payment />} />
            <Route path={routes.COMPLETION} element={<Completion />} />
            <Route path={routes.SIGN_UP} element={<Pricing />} />
            <Route path={routes.TERMS} element={<Terms />} />
            <Route path="*" element={<NotFound />} />
            {/* <Route path="/contact" element={<Contact />} /> */}
          </Routes>

          <Footer />
        </div>

      ) : (
        <>
          <Routes>
            <Route path="*" element={<EndFreeTrial />} />
            <Route path={routes.COMPLETION} element={<Completion />} />
            <Route path={routes.HOME} element={<LandingPage />} />
            <Route path={routes.LOGIN} element={<Login />} />
            <Route path={routes.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={routes.REGISTER} element={<Register />} />
            <Route path={routes.LANDING_PAGE} element={<LandingPage />} />
            <Route path={routes.TERMS} element={<Terms />} />
            <Route path={routes.PAYMENT} element={<Payment />} />
            <Route path={routes.SIGN_UP} element={<Pricing />} />

          </Routes>
          <Footer />
        </>
      )
    )
  }


  return (
    <Router>
      {/* <FeatureFlagsProvider> */}
      <AuthProvider>

        <Children />




      </AuthProvider>
      {/* </FeatureFlagsProvider> */}
    </Router>

  );
}


// export const getTargetUrl = (isLocal: boolean) => isLocal
//   ? `http://app.localhost:${window.location.port}${location.pathname}${location.search}` // Local dev
//   : `https://app.landpricecalculator.com${location.pathname}${location.search}`; // Production

// export const getAppDefaultUrl = (isLocal: boolean) => isLocal
//   ? `http://app.localhost:${window.location.port}` // Local dev
//   : `https://app.landpricecalculator.com`; // Production


export const getTargetUrl = (isLocal: boolean) => isLocal
  ? `http://localhost:${window.location.port}${location.pathname}${location.search}` // Local dev
  : `https://www.landpricecalculator.com${location.pathname}${location.search}`; // Production

export const getAppDefaultUrl = (isLocal: boolean) => isLocal
  ? `http://localhost:${window.location.port}` // Local dev
  : `https://www.landpricecalculator.com`; // Production


export const RedirectToApp = () => {
  const location = useLocation();

  useEffect(() => {
    // Determine if running on localhost
    const isLocal = window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost");

    // Construct the redirect URL
    const targetUrl = getTargetUrl(isLocal);

    // Redirect to the appropriate subdomain

    window.location.replace(targetUrl);
  }, [location]);

  return null; // No UI needed
};



export function LandingRouter() {
  return (
    <AuthProvider>
      <Router>
        <div className="land-calculator-container">
          <Routes>
            {/* <Route path="/*" element={<RedirectToApp />} /> */}
            <Route path="/*" element={<LandingPage />} />
            {/* <Route path="/" element={<LandingPage />} /> */}
            <Route path={routes.LANDING_PAGE} element={<LandingPage />} />
            <Route path={routes.LOGIN} element={<Login />} />
            <Route path={routes.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={routes.REGISTER} element={<Pricing />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}



