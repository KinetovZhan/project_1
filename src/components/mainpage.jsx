import React, { useState, useMemo } from 'react';
import '../App.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../Function/Header.jsx';
import { Sidebar } from '../Function/Sidebar.jsx';
import { MainPart } from '../Function/MainPart.jsx';



function MainPage() {
  //const [activeButton, setActiveButton] = useState(null); 
  // Получаем состояния URL параметров (Тракторы или агрегаты и тд)
  const [searchParams, setSearchParams] = useSearchParams();


  const activeButton = searchParams.get('tab') || null;
  const selectedModel = useMemo(() => {
    const modelParam = searchParams.get('model');
    if (!modelParam) return [];
    return modelParam.split(',').filter(Boolean); // разбиваем по запятой
}, [searchParams]);
  const showAddForm = activeButton === 'addPO';
  const showAddAggForm = activeButton === 'addAgg';
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeFilters2, setActiveFilters2] = useState([]);
  const [activeFiltersTrac, setActiveFiltersTrac] = useState([]);
  const [activeFiltersTrac2, setActiveFiltersTrac2] = useState([]);
  const [activeMajMinButton, setActiveMajMinButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  
  // Поиск по дилеру
  const [searchDealer, setSearchDealer] =useState('');
  
  const navigate = useNavigate();

  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
  const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
  const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
  const memoizedActiveFiltersTrac2 = useMemo(() => activeFiltersTrac2, [activeFiltersTrac2]);


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
  const handleModelChange = (models) => {
  const newParams = new URLSearchParams(searchParams);
  if (Array.isArray(models) && models.length > 0) {
    newParams.set('model', models.join(',')); 
  } else {
    newParams.delete('model');
  }
  setSearchParams(newParams);
};
  const handleAddForm = () => {
    const newParams = new URLSearchParams(searchParams);
    if (activeButton === 'addPO') {
      newParams.delete('tab');
    } else
    newParams.set('tab','addPO');
    setSearchParams(newParams);
}
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

  const handleAggForm = () => {
    const newParams = new URLSearchParams(searchParams);
    if (activeButton === 'addAgg') {
      newParams.delete('tab');
    } else 
    newParams.set('tab','addAgg');
    setSearchParams(newParams);
  }

  const closeAddAggForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };
  

  const handleSearch = (query) => {
    console.log('Поиск:', query);
    setSearchQuery(query);
  };

  const handleDealer = (query) => {
    setSearchDealer(query);
  }

  const handleMajMinButtonClick = (buttonName) => {
    if(activeMajMinButton === buttonName) {
      setActiveMajMinButton(null);
    } else {
      setActiveMajMinButton(buttonName);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleFilterChange2 = (filters) => {
    setActiveFilters2(filters);
  };


  /*const handleModelChange = (model) => {
    setSelectedModel(model);
  };*/



  const handleFilterByModelTractors = (model) => {
    setActiveFiltersTrac(model);
  };

  const handleFilterByStatus = (model) => {
    setActiveFiltersTrac2(model);
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

            onFilterChange={handleFilterChange} 
            onFilterChange2={handleFilterChange2}
            onModelChange={handleModelChange}

            onAddPoClick={handleAddForm}
            selectedModel={selectedModel}

            onAddAggClick={handleAggForm}

            onFilterChangeTracByModel={handleFilterByModelTractors}
            onDealerChange={handleDealer}
            onFilterChangeByStatus = {handleFilterByStatus}
            activeMajMinButton={activeMajMinButton}
            handleMajMinButtonClick={handleMajMinButtonClick}
          />
          <MainPart 
            activeButton={activeButton}

            activeFilters={memoizedActiveFilters} 
            activeFilters2={memoizedActiveFilters2}
            selectedModel={selectedModel}

            showAddForm={showAddForm}
            onCloseAddForm={closeAddForm}
            onAddSubmit={handleAddSubmit}
            onBack={closeAddForm}

            showAddAggForm={showAddAggForm}
            onCloseAddAggForm={closeAddAggForm}
            

            activeFiltersTrac={memoizedActiveFiltersTrac}
            activeFiltersTrac2={memoizedActiveFiltersTrac2}
            activeMajMinButton={activeMajMinButton}
            onSearch={handleSearch}
            searchQuery={searchQuery}

            searchDealer={searchDealer}
            onDealerSearch={handleDealer}
            
          />
        </div>
      </main>
    </>
  );
}

export default MainPage; 