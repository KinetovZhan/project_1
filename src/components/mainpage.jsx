import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; // Добавьте импорт
import '../App.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [activeButton, setActiveButton] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const navigate = useNavigate();

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    // Сбрасываем выбранную модель при смене раздела (кроме тракторов)
    if (buttonName !== 'tractor') {
      setSelectedModel('');
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleLogout = () => {
    navigate('/login');
  };
  

  return (
    <>
      <Header onLogout={handleLogout}/>
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={activeButton}
            handleButtonClick={handleButtonClick}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          <MainPart 
            activeButton={activeButton}
            selectedModel={selectedModel}
            
          />
        </div>
      </main>
    </>
  );
}

export default MainPage;