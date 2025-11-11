/*import React, { useState } from 'react';
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

export default MainPage;*/
import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useHistoryState } from '../useHistoryState.jsx';

function MainPage() {
  const navigate = useNavigate();
  
  // 🔹 Отслеживаем все состояния через хук истории
  const [appState, setAppState, undo, redo] = useHistoryState({
    activeButton: null,
    selectedModel: '',
    searchQuery: '',
  });

  const handleButtonClick = (buttonName) => {
    const newState = {
      ...appState,
      activeButton: buttonName,
      selectedModel: buttonName !== 'tractor' ? '' : appState.selectedModel
    };
    setAppState(newState);
  };

  const handleModelChange = (model) => {
    const newState = {
      ...appState,
      selectedModel: model
    };
    setAppState(newState);
  };

  const handleSearch = (query) => {
    const newState = {
      ...appState,
      searchQuery: query
    };
    setAppState(newState);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // 🔹 Обработка кнопки "Назад" в браузере
  React.useEffect(() => {
    const handlePopState = (event) => {
      // При нажатии кнопки "Назад" в браузере - откатываем состояние
      undo();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [undo]);

  // 🔹 Сохраняем состояние в URL при изменениях
  React.useEffect(() => {
    const urlParams = new URLSearchParams();
    if (appState.activeButton) urlParams.set('tab', appState.activeButton);
    if (appState.selectedModel) urlParams.set('model', appState.selectedModel);
    if (appState.searchQuery) urlParams.set('search', appState.searchQuery);
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ appState }, '', newUrl);
  }, [appState]);

  return (
    <>
      <Header onLogout={handleLogout}/>
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={appState.activeButton}  
            handleButtonClick={handleButtonClick}
            selectedModel={appState.selectedModel} 
            onModelChange={handleModelChange}
          />
          <MainPart 
            activeButton={appState.activeButton} 
            selectedModel={appState.selectedModel} 
            onSearch={handleSearch}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage;