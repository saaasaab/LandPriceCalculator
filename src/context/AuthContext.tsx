import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { getAppDefaultUrl } from '../Routes';
import { postRequest } from '../utils/api';

// Define user and context types
interface User {
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Default values to prevent `undefined`
const defaultAuthContext: AuthContextType = {
  user: null,
  login: () => { },
  logout: () => { },
};


const removeQueryParam = (param:string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, document.title, url.toString());
};


// Create Context with default values
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');



    if (storedUser) {
      if (!window.location.href.includes('//app.')) {
        const user = JSON.parse(storedUser);
        // redirect user to app and log them in. 

        const isLocal = window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost");
        const targetUrl = `${getAppDefaultUrl(isLocal)}?token=${user.token || ""}`

        window.location.href = targetUrl;
      }
      
      removeQueryParam("token");
      setUser(JSON.parse(storedUser));
    }


    else {
      if (window.location.href.includes('//app.')) {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get("token");

        if (token) {
          checkToken(token);

          // Remove "token" query param
          removeQueryParam("token");
        } 

      }
    }



    async function checkToken(token: string) {
      // Store token in localStorage (or in cookies)
      localStorage.setItem("authToken", token);

      // Call the api to get the user and log them in. 

      const data = await postRequest<{ token: string; user: { email: string } }>(
        '/auth',
        { token }
      );

      login({ email: data.user.email, token: data.token }); // Save user data

    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');

    localStorage.clear()    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext (Optional, for cleaner imports)
export const useAuth = () => useContext(AuthContext);
