import React, { useState, useMemo, useEffect } from 'react';
import '../App.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../Function/Header.jsx';
import { Sidebar } from '../Function/Sidebar.jsx';
import { MainPart } from '../Function/MainPart.jsx';
import { useAuth } from '../auth/AuthContext';



// function MainPage() {
//   //const [activeButton, setActiveButton] = useState(null); 
//   // Получаем состояния URL параметров (Тракторы или агрегаты и тд)
//   const [searchParams, setSearchParams] = useSearchParams();


//   const activeButton = searchParams.get('tab') || null;
//   const selectedModel = searchParams.get('model') || '';
//   const showAddForm = activeButton === 'addPO';
//   const showAddAggForm = activeButton === 'addAgg';
//   const [activeFilters, setActiveFilters] = useState([]);
//   const [activeFilters2, setActiveFilters2] = useState([]);
//   const [activeFiltersTrac, setActiveFiltersTrac] = useState([]);
//   const [activeFiltersTrac2, setActiveFiltersTrac2] = useState([]);
//   const [activeMajMinButton, setActiveMajMinButton] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchType, setSearchType] = useState('');
  
//   // Поиск по дилеру
//   const [searchDealer, setSearchDealer] =useState('');
  
//   const navigate = useNavigate();

//   const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
//   const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
//   const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
//   const memoizedActiveFiltersTrac2 = useMemo(() => activeFiltersTrac2, [activeFiltersTrac2]);


//   const handleButtonClick = (buttonName) => {
//     const newParams = new URLSearchParams(searchParams);
//       if (activeButton === buttonName) {
//       newParams.delete('tab');
//     } else {
//       // Иначе активируем новую кнопку
//       newParams.set('tab', buttonName);
//     }
//     if (buttonName !== 'tractor') {
//       newParams.delete('model');
//     }
//     setSearchParams(newParams);
//   };
//   const handleModelChange = (model) => {
//     const newParams = new URLSearchParams(searchParams);
//     if (model)
//       {newParams.set('model', model);
//   } else {
//     newParams.delete('model');
//   } 
//   setSearchParams(newParams);
// }
//   const handleAddForm = () => {
//     const newParams = new URLSearchParams(searchParams);
//     if (activeButton === 'addPO') {
//       newParams.delete('tab');
//     } else
//     newParams.set('tab','addPO');
//     setSearchParams(newParams);
// }
//     const closeAddForm = () => {
//     const newParams = new URLSearchParams(searchParams);
//     newParams.delete('tab');
//     setSearchParams(newParams);
//   };

//   const handleAddSubmit = (e) => {
//     e.preventDefault();
//     const formdata = new FormData(e.target);
//     const poNumber = formdata.get('poNumber');
//     alert(`ПО №${poNumber} будет добавлено!`);
//     closeAddForm();
//   };

//   const handleAggForm = () => {
//     const newParams = new URLSearchParams(searchParams);
//     if (activeButton === 'addAgg') {
//       newParams.delete('tab');
//     } else 
//     newParams.set('tab','addAgg');
//     setSearchParams(newParams);
//   }

//   const closeAddAggForm = () => {
//     const newParams = new URLSearchParams(searchParams);
//     newParams.delete('tab');
//     setSearchParams(newParams);
//   };
  

//   const handleSearch = (query) => {
//     console.log('Поиск:', query);
//     setSearchQuery(query);
//   };

//   const handleDealer = (query) => {
//     setSearchDealer(query);
//   }

//   const handleMajMinButtonClick = (buttonName) => {
//     if(activeMajMinButton === buttonName) {
//       setActiveMajMinButton(null);
//     } else {
//       setActiveMajMinButton(buttonName);
//     }
//   };

//   const handleFilterChange = (filters) => {
//     setActiveFilters(filters);
//   };

//   const handleFilterChange2 = (filters) => {
//     setActiveFilters2(filters);
//   };


//   /*const handleModelChange = (model) => {
//     setSelectedModel(model);
//   };*/



//   const handleFilterByModelTractors = (model) => {
//     setActiveFiltersTrac(model);
//   };

//   const handleFilterByStatus = (model) => {
//     setActiveFiltersTrac2(model);
//   };


//   const handleLogout = () => {
//       navigate('/login');
//     };

//   return ( 
//     <>
//       <Header onLogout={handleLogout}/> 
//       <main>
//         <div className='table'>
//           <Sidebar 
//             activeButton={activeButton} 
//             handleButtonClick={handleButtonClick}

//             onFilterChange={handleFilterChange} 
//             onFilterChange2={handleFilterChange2}
//             onModelChange={handleModelChange}

//             onAddPoClick={handleAddForm}
//             selectedModel={selectedModel}

//             onAddAggClick={handleAggForm}

//             onFilterChangeTracByModel={handleFilterByModelTractors}
//             onDealerChange={handleDealer}
//             onFilterChangeByStatus = {handleFilterByStatus}
//             activeMajMinButton={activeMajMinButton}
//             handleMajMinButtonClick={handleMajMinButtonClick}
//           />
//           <MainPart 
//             activeButton={activeButton}

//             activeFilters={memoizedActiveFilters} 
//             activeFilters2={memoizedActiveFilters2}
//             selectedModel={selectedModel}

//             showAddForm={showAddForm}
//             onCloseAddForm={closeAddForm}
//             onAddSubmit={handleAddSubmit}
//             onBack={closeAddForm}

//             showAddAggForm={showAddAggForm}
//             onCloseAddAggForm={closeAddAggForm}
            

//             activeFiltersTrac={memoizedActiveFiltersTrac}
//             activeFiltersTrac2={memoizedActiveFiltersTrac2}
//             activeMajMinButton={activeMajMinButton}
//             onSearch={handleSearch}
//             searchQuery={searchQuery}

//             searchDealer={searchDealer}
//             onDealerSearch={handleDealer}
            
//           />
//         </div>
//       </main>
//     </>
//   );
// }

// export default MainPage; 
function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // ← получаем logout и данные пользователя

  const activeButton = searchParams.get('tab') || null;
  const selectedModel = searchParams.get('model') || '';
  const showAddForm = activeButton === 'addPO';
  const showAddAggForm = activeButton === 'addAgg';

  const [activeFilters, setActiveFilters] = useState([]);
  const [activeFilters2, setActiveFilters2] = useState([]);
  const [activeFiltersTrac, setActiveFiltersTrac] = useState([]);
  const [activeFiltersTrac2, setActiveFiltersTrac2] = useState([]);
  const [activeMajMinButton, setActiveMajMinButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDealer, setSearchDealer] = useState('');
  const [searchDate, setSearchDate] = useState('');


  // useMemo не обязателен, если вы не передаёте эти состояния в "тяжёлые" компоненты,
  // но оставим как есть
  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
  const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
  const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
  const memoizedActiveFiltersTrac2 = useMemo(() => activeFiltersTrac2, [activeFiltersTrac2]);

  useEffect(() => {
    console.log('Состояние searchDate в MainPage изменено:', searchDate);
  }, [searchDate]);

  // --- Все ваши обработчики остаются без изменений ---
  const handleButtonClick = (buttonName) => {
    const newParams = new URLSearchParams(searchParams);
    if (activeButton === buttonName) {
      newParams.delete('tab');
    } else {
      newParams.set('tab', buttonName);
    }
    if (buttonName !== 'tractor') {
      newParams.delete('model');
    }
    setSearchParams(newParams);
  };

  const handleModelChange = (model) => {
    const newParams = new URLSearchParams(searchParams);
    if (model) {
      newParams.set('model', model);
    } else {
      newParams.delete('model');
    }
    setSearchParams(newParams);
  };

  const handleAddForm = () => {
    const newParams = new URLSearchParams(searchParams);
    if (activeButton === 'addPO') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', 'addPO');
    }
    setSearchParams(newParams);
  };

  const closeAddForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const poNumber = formData.get('poNumber');
    alert(`ПО №${poNumber} будет добавлено!`);
    closeAddForm();
  };

  const handleAggForm = () => {
    const newParams = new URLSearchParams(searchParams);
    if (activeButton === 'addAgg') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', 'addAgg');
    }
    setSearchParams(newParams);
  };

  const closeAddAggForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };

  const handleDateChange = (date) => {
    console.log('Дата получена в MainPage:', date); // <-- Добавьте этот лог
    setSearchDate(date);
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDealer = (query) => {
    setSearchDealer(query);
  };

  const handleMajMinButtonClick = (buttonName) => {
    setActiveMajMinButton(activeMajMinButton === buttonName ? null : buttonName);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleFilterChange2 = (filters) => {
    setActiveFilters2(filters);
  };

  const handleFilterByModelTractors = (model) => {
    setActiveFiltersTrac(model);
  };

  const handleFilterByStatus = (model) => {
    setActiveFiltersTrac2(model);
  };

  // НОВАЯ ФУНКЦИЯ ВЫХОДА — через контекст
  const handleLogout = () => {
    logout(); // ← Удаляет токен + сбрасывает состояние
    navigate('/login', { replace: true }); // ← Перенаправляем на логин
  };

  return (
    <>
      {/* Передаём handleLogout в Header */}
      <Header onLogout={handleLogout} currentUser={user?.sub || 'Пользователь'} />
      
      <main>
        <div className="table">
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
            onDateChange={handleDateChange}
            onFilterChangeByStatus={handleFilterByStatus}
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
            searchDate={searchDate}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage;