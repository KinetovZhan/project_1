import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; // Добавьте импорт
import '../App.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [activeButton, setActiveButton] = useState(null); // Добавьте состояние
  const navigate = useNavigate();

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };
  const handleAddSoftware = () => {
    // Здесь может быть логика для добавления ПО
    console.log('Добавить новое ПО');
    // Например: navigate('/add-software') или открытие модального окна
  };


  const handleLogout = () => {
      navigate('/login');
    };

  return ( // ← ДОБАВЬТЕ return
    <>
      <Header onLogout={handleLogout}/> {/* Исправьте onLogout */}
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={activeButton} 
            handleButtonClick={handleButtonClick}
            onAddSoftware={handleAddSoftware} 
          />
          <MainPart activeButton={activeButton}/>
        </div>
      </main>
    </>
  );
}

export default MainPage; // Добавьте экспорт