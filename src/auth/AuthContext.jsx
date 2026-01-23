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
  const [token, setToken] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // чтобы не мигало при загрузке

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('accessToken');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } else {
      setUser(decoded);
      setToken(token);
      setIsAuthenticated(true);
    }
  } catch (error) {
    console.error ('Invalid token', error);
    localStorage.removeItem('accessToken');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }
}
setLoading(false);
}, []);

const login = (token) => {
  localStorage.setItem('accessToken', token);
  const decoded = jwtDecode(token);
  setUser(decoded);
  setToken(token);
  setIsAuthenticated(true);
};

const logout = () => {
  localStorage.removeItem('accessToken');
  setUser(null);
  setToken(null);
  setIsAuthenticated(false);
};

return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

