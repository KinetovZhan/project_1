import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { KnowledgeBase } from './KnowledgeBase/KnowledgeBase.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';
import { Header } from './Header/Header.jsx';
import { useAuth } from './auth/AuthContext';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Функции для Header
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleHelp = () => {
    navigate('/help/');
  };

  const handleKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  // Функция для определения ключа анимации
  const getAnimationKey = () => {
    if (location.pathname.startsWith('/main')) {
      return '/main';
    }
    return location.pathname;
  };

  return (
    <AuthProvider>
      {/* Header всегда сверху */}
      <Header 
        onLogout={handleLogout}
        onHelp={handleHelp}
        onKnowledgeBase={handleKnowledgeBase}
        isMobileSidebarOpen={false}
        toggleMobileSidebar={() => {}}
      />

      {/* Контент с отступом под Header */}
      <div> 
        <AnimatePresence mode="wait">
          <motion.div
            key={getAnimationKey()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "relative",
              width: "100%",
              minHeight: "calc(100vh - 60px)",
              background: "transparent"
            }}
          >
            <Routes location={location}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route 
                path="/main/*" 
                element={
                  <ProtectedRoute>
                    <MainPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/help/*" element={<HelpPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}

export default App;