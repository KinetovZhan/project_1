import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // чтобы не мигало при загрузке

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
    } else {
      setUser(decoded);
      setIsAuthenticated(true);
    }
  } catch (error) {
    console.error ('Invalid token', error);
    localStirage.removeItem('access__token');
    setUser(null);
    setIsAuthenticated(false);
  }
}
setLoading(false);
}, []);

const login = (token) => {
  localStorage.setItem('access_token', token);
  const decoded = jwtDecode(token);
  setIsAuthenticated(true);
};

const logout = () => {
  localStorage.removeItem('access_token');
  setUser(null);
  setIsAuthenticated(false);
};

return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

