// src/Login/KnowledgeBase.jsx
import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
// import { Header } from '../Header/Header.jsx';  // УДАЛЯЕМ
import './KnowledgeBase.css';

export function KnowledgeBase() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape нажата, закрываем');
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Эти функции больше не нужны
  // const handleLogout = () => {...}
  // const handleHelp = () => {...}
  // const handleKnowledgeBase = () => {...}

  return (
    <div className="knowledge-base-container">
      {/* Убираем Header */}
      
      <button onClick={handleBack} className="close-button"> 
        <svg width="34" height="35" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="32.3787" y1="2.62132" x2="1.49998" y2="33.5" stroke="black" strokeWidth="3" strokeLinecap="round"/>
          <line x1="1.49998" y1="1.5" x2="32.3787" y2="32.3787" stroke="black" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </button>
      
      <h1 className="knowledge-base-title">
        База знаний
      </h1>
    </div>
  );
}