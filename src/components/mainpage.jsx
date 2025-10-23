import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; // Добавьте импорт
import '../App.css';

function MainPage({ onLogout }) {
  const [activeButton, setActiveButton] = useState(null); // Добавьте состояние

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return ( // ← ДОБАВЬТЕ return
    <>
      <Header onLogout={onLogout} /> {/* Исправьте onLogout */}
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
}

export default MainPage; // Добавьте экспорт