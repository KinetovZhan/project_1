import { useState } from 'react'
import './App.css'
import LoginPage from './Login/LoginPage'
import MainPage from './components/mainpage'
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';


function App() {
  return (
   <AuthProvider>
    <Routes>
      {/* Публичный маршрут для входа */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Защищенный маршрут */}
      <Route 
        path="/main/*" 
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      
      {/* Перенаправление с корневого пути */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Обработка несуществующих маршрутов */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;