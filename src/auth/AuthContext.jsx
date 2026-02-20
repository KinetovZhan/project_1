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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

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
      setUserRole(null)
    } else {
      setUser(decoded);
      setToken(token);
      setIsAuthenticated(true);

      setUserRole(decoded.role || 'user');
      // setUserRole('moderator'); // ⬅️ ВСЕГДА МОДЕРАТОР
    }
  } catch (error) {
    console.error ('Invalid token', error);
    localStorage.removeItem('accessToken');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
  }
}
setLoading(false);
}, []);

// const login = (token) => {
//   localStorage.setItem('accessToken', token);
//   const decoded = jwtDecode(token);
//   setUser(decoded);
//   setToken(token);
//   setIsAuthenticated(true);
//   setUserRole(decoded.role || 'user');

// };
const login = (token) => {
  try {
    const decoded = jwtDecode(token);
    localStorage.setItem('accessToken', token);
    setUser(decoded);
    setToken(token);
    setIsAuthenticated(true);
    setUserRole(decoded.role || 'user');
  } catch (error) {
    console.error('Ошибка декодирования токена при логине:', error);
    // Можно также показать сообщение пользователю через состояние ошибки
  }
};

const logout = () => {
  localStorage.removeItem('accessToken');
  setUser(null);
  setToken(null);
  setIsAuthenticated(false);
  setUserRole(null);
};

  const hasRole = (role) => {
    return userRole === role;
  };

  // Функция для проверки любой из ролей
  const hasAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      userRole, // Добавляем роль в контекст
      login, 
      logout, 
      loading,
      hasRole,
      hasAnyRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

