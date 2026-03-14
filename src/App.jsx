import { useState } from 'react'
// import './App.css'
import './FiltersPo/AggregatesFilters.css'
import './FiltersTractor/TractorsFilters.css'
import './TractorTable/TractorsTable.css'
import './TractorDetails/TractorWindow.css'
import './Header/navigationwindow.css'
import './Po/maininformation.css'
import './MainPage/mainpage.css'
// import './cssfiles/sidebar.css'
import './SearchBar/searchBar.css'
import './AddPo/AddPO.css'
import './AddUzel/AddUzel.css'
import './Login/LoginPage.css'
import './Login/HelpPage.css'
import './Sidebar/test.css'
import './KnowledgeBase/KnowledgeBase.css';
import './PoDetails/PoDetails.css'
import './MainPart/MainPart.css'
import LoginPage from './Login/LoginPage'
import {HelpPage} from './Login/HelpPage.jsx'
import MainPage from './MainPage/mainpage'
import {PoDetails} from './PoDetails/PoDetails.jsx'
import { KnowledgeBase } from './KnowledgeBase/KnowledgeBase.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';


function App() {
  return (
   <AuthProvider>
    <Routes>
      {/* Публичный маршрут для входа */}
      <Route path="/login" element={<LoginPage />} />

      {/*Публичный маршрут для Базы знаний (без авторизации) */}
      <Route path="/knowledge-base" element={<KnowledgeBase />} />
      
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
          // <ProtectedRoute>
            <HelpPage />
          // </ProtectedRoute>
        }
      />
      
      {/* Перенаправление с корневого пути */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/software/:id" element={<PoDetails />} />
      
      {/* Обработка несуществующих маршрутов */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;