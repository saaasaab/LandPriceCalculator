import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequest } from '../utils/api';

export interface User {
  email: string;
  token: string;
  is_paid: boolean;
  days_since_first_login?: number;
  free_access_expired?: boolean;
  first_logged_in?: string | null;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  tempEmail: string;
  updateTempEmail: (tempEmail: string) => void;
  tempPassword: string;
  updateTempPassword: (tempPassword: string) => void;
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
  authLoading: true,
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
  const [authLoading, setAuthLoading] = useState(true);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setAuthLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      removeQueryParam('token');

      if (!parsedUser.token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await getRequest<{
          success: boolean;
          data: Omit<User, 'token'>;
        }>('/land-price-calculator/me');

        const updatedUser = { ...parsedUser, ...response.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch {
        // Keep stored user if refresh fails.
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
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
    <AuthContext.Provider value={{ user, authLoading, login, logout, tempEmail, updateTempEmail, tempPassword, updateTempPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext (Optional, for cleaner imports)
export const useAuth = () => useContext(AuthContext);
