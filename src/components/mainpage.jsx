import React, { useState, useMemo } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; 
import '../App.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [activeButton, setActiveButton] = useState(null); 
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeFilters2, setActiveFilters2] = useState([]);
  const [activeFiltersTrac, setActiveFiltersTrac] = useState([]);
  const [activeFiltersTrac2, setActiveFiltersTrac2] = useState([]);
  const navigate = useNavigate();

  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
  const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
  const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
  const [selectedModel, setSelectedModel] = useState('');


  const handleButtonClick = (buttonName) => {
      if (activeButton === buttonName) {
          setActiveButton(null);
      } else {
          setActiveButton(buttonName);
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

          />
          <MainPart 
            activeButton={activeButton}
            activeFilters={memoizedActiveFilters} 
            activeFilters2={memoizedActiveFilters2}
            selectedModel={selectedModel}
            activeFiltersTrac={memoizedActiveFiltersTrac}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage; 