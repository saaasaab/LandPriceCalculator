import { createContext, useState, useEffect, ReactNode, useContext } from 'react';

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
  login: () => {},
  logout: () => {},
};

// Create Context with default values
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext (Optional, for cleaner imports)
export const useAuth = () => useContext(AuthContext);
