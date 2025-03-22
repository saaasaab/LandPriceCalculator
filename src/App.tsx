import './App.css'
import './components/PrintingStyles.scss'
import { getApp } from './utils/subdomains';

function App() {
  const AppRoute = getApp()
  
  return (
    <AppRoute />
  );
}

export default App
