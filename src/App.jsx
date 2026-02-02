import { useState } from 'react'
// import './App.css'
import './cssfiles/AggregatesFilters.css'
import './cssfiles/TractorsFilters.css'
import './cssfiles/TractorsTable.css'
import './cssfiles/TractorWindow.css'
import './cssfiles/navigationwindow.css'
import './cssfiles/maininformation.css'
import './cssfiles/mainpage.css'
// import './cssfiles/sidebar.css'
import './cssfiles/searchBar.css'
import './cssfiles/AddPO.css'
import './cssfiles/LoginPage.css'
import './cssfiles/HelpPage.css'
import './cssfiles/AddCompPartButton.css'
import './cssfiles/test.css'
import LoginPage from './Login/LoginPage'
import HelpPage from './Login/HelpPage.jsx'
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
        <Route 
        path="/help/*" 
        element={
          <ProtectedRoute>
            <HelpPage />
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