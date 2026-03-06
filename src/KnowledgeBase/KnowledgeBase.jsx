// src/Login/KnowledgeBase.jsx
import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header.jsx';
import './KnowledgeBase.css';

export function KnowledgeBase() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Возвращает на предыдущую страницу
  };

    // Обработчик нажатия клавиш
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape нажата, закрываем');
        handleBack();
      }
    };

    // Добавляем слушатель события
    window.addEventListener('keydown', handleKeyDown);

    // Убираем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Пустой массив зависимостей - эффект выполнится один раз

  const handleLogout = () => {
    console.log('Logout не доступен на публичной странице');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  const handleKnowledgeBase = () => {
    console.log('Уже на странице базы знаний');
  };

  return (
    <>
      <Header 
        onLogout={handleLogout}
        onHelp={handleHelp}
        onKnowledgeBase={handleKnowledgeBase}
      />

      <div className="knowledge-base-container">
      <button onClick={handleBack} className="close-button"> 
        <svg width="34" height="35" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="32.3787" y1="2.62132" x2="1.49998" y2="33.5" stroke="black" stroke-width="3" stroke-linecap="round"/>
<line x1="1.49998" y1="1.5" x2="32.3787" y2="32.3787" stroke="black" stroke-width="3" stroke-linecap="round"/>
</svg>

      </button>
      
      <h1 className="knowledge-base-title">
        База знаний
        </h1>
    </div>
    </>
  );
}