import React from 'react';
import './App.css'
import './components/PrintingStyles.scss'
import { getApp } from './utils/subdomains';

const App: React.FC = () => {
  const AppRoute = getApp()
  
  return (
    // <BrowserRouter>
     
        <div className="app">
          <AppRoute />
        </div>

    // </BrowserRouter>
  );
};

export default App
