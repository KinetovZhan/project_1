import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; // Добавьте импорт
import '../App.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  //const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  //Получаем состояния URL параметров (Тракторы или агрегаты и тд)
  const activeButton = searchParams.get('tab') || null;
  const selectedModel = searchParams.get('model') || '';
  const showAddForm = activeButton === 'addPO';
  const handleButtonClick = (buttonName) => {
    const newParams = new URLSearchParams(searchParams);
     if (activeButton === buttonName) {
      newParams.delete('tab');
    } else {
      // Иначе активируем новую кнопку
      newParams.set('tab', buttonName);
    }
    if (buttonName !== 'tractor') {
      newParams.delete('model');
    }
    setSearchParams(newParams);
  };
  const handleModelChange = (model) => {
    const newParams = new URLSearchParams(searchParams);
    if (model)
      {newParams.set('model', model);
  } else {
    newParams.delete('model');
  } 
  setSearchParams(newParams);
}
  const handleAddForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab','addPO');
    setSearchParams(newParams);
  }

  const handleLogout = () => {
    navigate('/login');
  };

  /*const openAddForm = () => {
     setShowAddForm(true);
  }*/

  const closeAddForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const poNumber = formdata.get('poNumber');
    alert(`ПО №${poNumber} будет добавлено!`);
    closeAddForm();
  };

  

  return ( // ← ДОБАВЬТЕ return
    <>
      <Header onLogout={handleLogout}/> {/* Исправьте onLogout */}
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={activeButton} 
            handleButtonClick={handleButtonClick}
            onAddPoClick={handleAddForm}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          <MainPart 
            activeButton={activeButton}
            showAddForm={showAddForm}
            onCloseAddForm={closeAddForm}
            onAddSubmit={handleAddSubmit}
            onBack={closeAddForm}
            selectedModel={selectedModel}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage; // Добавьте экспорт