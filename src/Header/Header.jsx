import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react';
export function Header({ onLogout,onHelp, isMobileSidebarOpen, toggleMobileSidebar }) {
  const isMobile = useCheckMobile();
  const navigate = useNavigate();

  const handleMainPage = (poID) => {
    navigate('/main');
  }

  return(
    <header className = "header">
      {isMobile && (
      <button
       className = {`mobile-sidebar ${isMobileSidebarOpen ? 'active' : ''}`}
       onClick = {toggleMobileSidebar}
      >
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          {/* <span className="toggle-text">Меню</span> */}
      </button>
     )}
      <div className='mainText'>
        <h3 onDoubleClick={handleMainPage}>Сервис просмотра версий ПО</h3>
      </div>
      <div className='navigation'>
        <h3 onClick={onHelp} style={{cursor: 'pointer'}}>Помощь</h3>
        {onLogout && (
          <h3 onClick={onLogout} style={{cursor: 'pointer'}}>Выйти</h3>
        )}
      </div>
    </header>
  )
}
