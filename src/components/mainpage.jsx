import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; // Добавьте импорт
import '../App.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAggForm, setShowAddAggForm] = useState(false);
  const navigate = useNavigate();
  //Получаем состояния URL параметров (Тракторы или агрегаты и тд)
  const activeButton = searchParams.get('tab') || null;
  const selectedModel = searchParams.get('model') || '';
  const handleButtonClick = (buttonName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', buttonName);
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

  const handleLogout = () => {
    navigate('/login');
  };

  const openAddForm = () => {
     setShowAddForm(true);
  }

  const closeAddForm = () => {
    setShowAddForm(false);
  };

  const handleAddSubmit = (responseData) => {
  // ✅ Без preventDefault — это уже не событие, а ответ с бэка
  const poNumber = responseData?.name || 'без номера';
  alert(`✅ ПО «${poNumber}» успешно добавлено!`);
  closeAddForm();
};

  const openAddAggForm = () => {
    setShowAddAggForm(true);
  };

  const closeAddAggForm = () => {
    setShowAddAggForm(false);
  };

  return (
    <>
      <Header onLogout={handleLogout}/> {/* Исправьте onLogout */}
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={activeButton} 
            handleButtonClick={handleButtonClick}
            onAddPoClick={openAddForm}
            onAddAggClick={openAddAggForm}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          <MainPart 
            activeButton={activeButton}
            showAddForm={showAddForm}
            showAddAggForm={showAddAggForm}
            onCloseAddForm={closeAddForm}
            onCloseAddAggForm={closeAddAggForm}
            onAddSubmit={handleAddSubmit}
            onBack={() => {
              setShowAddForm(false);
              setShowAddAggForm(false);
              setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('tab');
                return newParams;
              });
            }}
            selectedModel={selectedModel}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage; // Добавьте экспорт