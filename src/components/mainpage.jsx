import React, { useState, useMemo } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Function/Header.jsx';
import { Sidebar } from '../Function/Sidebar.jsx';
import { MainPart } from '../Function/MainPart.jsx';



function MainPage() {
  const [activeButton, setActiveButton] = useState(null); 
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeFilters2, setActiveFilters2] = useState([]);
  const [activeFiltersTrac, setActiveFiltersTrac] = useState([]);
  const [activeFiltersTrac2, setActiveFiltersTrac2] = useState([]);
  const [activeMajMinButton, setActiveMajMinButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  
  // Поиск по дилеру
  const [searchDealer, setSearchDealer] =useState('');
  
  const navigate = useNavigate();

  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
  const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
  const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
  const memoizedActiveFiltersTrac2 = useMemo(() => activeFiltersTrac2, [activeFiltersTrac2]);


  const handleButtonClick = (buttonName) => {
      if (activeButton === buttonName) {
          setActiveButton(null);
      } else {
          setActiveButton(buttonName);
      }
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


  const handleModelChange = (model) => {
    setSelectedModel(model);
  };



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