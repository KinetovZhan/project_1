import { useState } from 'react'
import './App.css'
import LoginPage from './Login/LoginPage.jsx'
import MainPage from './components/mainpage.jsx'

function App() {
  const [activeButton, setActiveButton] = useState(null);
  const [currentPage, setCurrentPage] = useState('login'); // 'login' или 'main'


  // Функция для входа
  const handleLogin = () => {
    setCurrentPage('main');
  };


  // Функция для выхода
  const handleLogout = () => {
    setActiveButton(null);
    setCurrentPage('login');
  };


  // Рендерим нужную страницу
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'main':
        return <MainPage onLogout={handleLogout}/>;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return renderCurrentPage();
}

export default App;