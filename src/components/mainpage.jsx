import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; // Добавьте импорт
import '../App.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [activeButton, setActiveButton] = useState(null); // Добавьте состояние
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedModel, setSelectedModel] = useState(''); 
  const navigate = useNavigate();

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    if (buttonName !== 'tractor') {
      setSelectedModel('');
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const openAddForm = () => {
     setShowAddForm(true);
  }

  const closeAddForm = () => {
    setShowAddForm(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const poNumber = formdata.get('poNumber');
    alert(`ПО №${poNumber} будет добавлено!`);
    closeAddForm();
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  }

  return ( // ← ДОБАВЬТЕ return
    <>
      <Header onLogout={handleLogout}/> {/* Исправьте onLogout */}
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={activeButton} 
            handleButtonClick={handleButtonClick}
            onAddPoClick={openAddForm}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          <MainPart 
            activeButton={activeButton}
            showAddForm={showAddForm}
            onCloseAddForm={closeAddForm}
            onAddSubmit={handleAddSubmit}
            onBack={() => {
              setShowAddForm(false);
              setActiveButton(null);
            }}
            selectedModel={selectedModel}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage; // Добавьте экспорт