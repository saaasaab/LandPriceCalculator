import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// import { getAppDefaultUrl } from '../Routes';
// import { postRequest } from '../utils/api';

// Define user and context types
export interface User {
  email: string;
  token: string;
  is_paid: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  tempEmail: string;
  updateTempEmail: (tempEmail: string) => void;
  tempPassword: string;
  updateTempPassword:  (tempPassword: string) => void;

}

const checkUser = () => {
  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  const _user = JSON.parse(storedUser);
  return _user
  // redirect user to app and log them in. 
}
// Default values to prevent `undefined`
const defaultAuthContext: AuthContextType = {
  user: checkUser(),
  login: () => { },
  logout: () => { },
  tempEmail: '',
  updateTempEmail: () => { },
  tempPassword: '',
  updateTempPassword: () => { },
};


const removeQueryParam = (param: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);

  window.history.replaceState({}, document.title, url.toString());
};


// Create Context with default values
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  

  const navigate = useNavigate();

  useEffect(() => {  
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // if (!window.location.href.includes('//app.')) {

      // // UNCOMMENT WHEN I WANT AUTO REDIRECT
      //   // const isLocal = window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost");
      //   // const targetUrl = `${getAppDefaultUrl(isLocal)}?token=${user.token || ""}`

      //   // window.location.href = targetUrl;
      // }

      const _user = JSON.parse(storedUser);

      // redirect user to app and log them in. 
      removeQueryParam("token");
      setUser(_user)
    }
    // else {
    //   if (window.location.href.includes('//app.')) {
    //     const urlParams = new URLSearchParams(location.search);
    //     const token = urlParams.get("token");

    //     if (token) {
    //       checkToken(token);

    //       // Remove "token" query param
    //       removeQueryParam("token");
    //     }

    //   }
    // }



    // async function checkToken(token: string) {
    //   // Store token in localStorage (or in cookies)
    //   localStorage.setItem("authToken", token);

    //   // Call the api to get the user and log them in. 

    //   const data = await postRequest<{ token: string; user: { email: string } }>(
    //     '/auth',
    //     { token }
    //   );

    //   login({ email: data.user.email, token: data.token }); // Save user data

    // }
  }, []);
  

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);

    const firstVisitDate = localStorage.getItem('firstVisitDate') || "";
    localStorage.clear();
    localStorage.setItem('firstVisitDate', firstVisitDate);

    location.reload();
    navigate('/')
  };

  const updateTempEmail = (email: string) => {
    setTempEmail(email);
  };

  const updateTempPassword = (password: string) => {
    setTempPassword(password);
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, tempEmail, updateTempEmail, tempPassword, updateTempPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext (Optional, for cleaner imports)
export const useAuth = () => useContext(AuthContext);
