import { useState } from 'react'
import './App.css'
import { Header, Sidebar, MainPart } from './Func.jsx'
import LoginPage from './Login/LoginPage.jsx'

function App() {
  const [activeButton, setActiveButton] = useState(null);
  const [currentPage, setCurrentPage] = useState('login'); // 'login' или 'main'

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

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
        return (
          <>
            <Header onLogout={handleLogout} />
            <main>
              <div className='table'>
                <Sidebar 
                  activeButton={activeButton} 
                  handleButtonClick={handleButtonClick} 
                />
                <MainPart activeButton={activeButton}/>
              </div>
            </main>
          </>
        );
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return renderCurrentPage();
}

export default App;