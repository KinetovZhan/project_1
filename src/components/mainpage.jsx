import React, { useState } from 'react';
import { Header, Sidebar, MainPart } from '../Func'; 
import '../App.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [activeButton, setActiveButton] = useState(null); 
  const [activeFilters, setActiveFilters] = useState([]);
  const navigate = useNavigate();

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
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
          />
          <MainPart 
            activeButton={activeButton}
            activeFilters={activeFilters} 
          />
        </div>
      </main>
    </>
  );
}

export default MainPage; 