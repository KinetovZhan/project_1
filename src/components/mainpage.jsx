import React, { useState, useMemo, useEffect } from 'react';
// import '../cssfiles/sidebar.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../Function/Header.jsx';
import { Sidebar } from '../Function/Sidebar.jsx';
import { MainPart } from '../Function/MainPart.jsx';
import { useAuth } from '../auth/AuthContext';
// Убедитесь, что пути к формам правильные
import { AddPoForm } from '../Function/AddPo.jsx';
import { AddAggForm } from '../Function/AddAgg.jsx';

function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeButton = searchParams.get('tab') || null;
  const selectedModel = useMemo(() => {
    const modelParam = searchParams.get('model');
    return modelParam ? modelParam.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const showAddForm = activeButton === 'addPO';
  const showAddAggForm = activeButton === 'addAgg';
  const showAddCompPartForm = activeButton === 'AddCompPart'

  const [activeFilters, setActiveFilters] = useState([]);
  const [activeFilters2, setActiveFilters2] = useState([]);
  const [activeFiltersTrac, setActiveFiltersTrac] = useState([]);
  const [activeFiltersTrac2, setActiveFiltersTrac2] = useState([]);
  const [activeMajMinButton, setActiveMajMinButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDealer, setSearchDealer] = useState('');
  const [selectedProducers, setSelectedProducers] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    date_assemle: null,  // Для обратной совместимости
    date_start: null,
    date_end: null
  });
  const { logout, user } = useAuth();

  const navigate = useNavigate();

  // Memoized filters (опционально, можно убрать, если не используете)
  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
  const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
  const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
  const memoizedActiveFiltersTrac2 = useMemo(() => activeFiltersTrac2, [activeFiltersTrac2]);

  // Сброс фильтров при смене вкладки
  useEffect(() => {
    const shouldPreserveFilters = ['aggregates'].includes(activeButton);
    if (!shouldPreserveFilters) {
      setActiveFilters([]);
      setActiveFilters2([]);
      setSelectedProducers([]);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('model');
      setSearchParams(newParams, { replace: true });
    }
  }, [activeButton, searchParams, setSearchParams]);

  // Общие обработчики
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

  const handleModelChange = (models) => {
    const newParams = new URLSearchParams(searchParams);
    if (Array.isArray(models) && models.length > 0) {
      newParams.set('model', models.join(','));
    } else {
      newParams.delete('model');
    }
    setSearchParams(newParams);
  };

  const handleProducerChange = (producers) => {
    setSelectedProducers(producers);
  };

  // ===== Форма "ПО" =====
  const handleAddSubmit = (responseData) => {
  // Без preventDefault — это уже не событие, а ответ с бэка
  const poNumber = responseData?.name || 'без номера';
  alert(`✅ ПО «${poNumber}» успешно добавлено!`);
  closeAddForm();
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

  // ===== Форма "Агрегат" =====
  const handleAddAggSubmit = (responseData) => {
    console.log('Агрегат добавлен:', responseData);
    alert('Модель создана!');
    closeAddAggForm();
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
  



  const handleCompPartForm = () => {
    const newParams = new URLSearchParams(searchParams)
    if (activeButton === 'AddCompPart') {
      newParams.delete('tab')
    } else {
      newParams.set('tab', 'AddCompPart')
    }
    setSearchParams(newParams)
  }

  const closeAddCompPartForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams)
  }

  const handleAddCompPartSubmit = (responseData) => {
    console.log('Часть агрегата добавлен:', responseData);
    alert('Часть агрегата создана!');
    closeAddCompPartForm();
  }


  // Остальные обработчики
  const handleSearch = (query) => setSearchQuery(query);
  const handleDealer = (query) => setSearchDealer(query);
  const handleDateChange = (date) => {
    console.log('Дата получена в MainPage:', date); // <-- Добавьте этот лог
    setDateFilter(date);
  }


  const handleMajMinButtonClick = (buttonName) => {
    setActiveMajMinButton(activeMajMinButton === buttonName ? null : buttonName);
  };

  const handleFilterChange = (filters) => setActiveFilters(filters);
  const handleFilterChange2 = (filters) => setActiveFilters2(filters);
  const handleFilterByModelTractors = (model) => setActiveFiltersTrac(model);
  const handleFilterByStatus = (model) => setActiveFiltersTrac2(model);

  const handleLogout = () => {
    logout(); // ← Удаляет токен + сбрасывает состояние
    navigate('/login', { replace: true }); // ← Перенаправляем на логин
  };

  const handleHelp = () => {
    navigate('/help/');
  }

  return (
    <>
      <Header 
      onLogout={handleLogout} currentUser={user?.sub || 'Пользователь'} 
      onHelp={handleHelp}/>
      <main>
        <div className="table">
          <Sidebar
            activeButton={activeButton}
            handleButtonClick={handleButtonClick}
            onFilterChange={handleFilterChange}
            onFilterChange2={handleFilterChange2}
            onModelChange={handleModelChange}
            onProducerChange={handleProducerChange} 
            onAddPoClick={handleAddForm}
            selectedModel={selectedModel}
            selectedProducers={selectedProducers}
            onAddAggClick={handleAggForm}
            onAddCompPartClick={handleCompPartForm}
            onFilterChangeTracByModel={handleFilterByModelTractors}
            onDealerChange={handleDealer}
            onFilterChangeByStatus={handleFilterByStatus}
            activeMajMinButton={activeMajMinButton}
            onDateChange={handleDateChange}
            handleMajMinButtonClick={handleMajMinButtonClick}
          />

          {/* Основной контент — ТОЛЬКО таблицы и фильтры */}
          <MainPart
            activeButton={activeButton}
            activeFilters={memoizedActiveFilters}
            activeFilters2={memoizedActiveFilters2}
            selectedModel={selectedModel}
            selectedProducers={selectedProducers}
            activeFiltersTrac={memoizedActiveFiltersTrac}
            activeFiltersTrac2={memoizedActiveFiltersTrac2}
            activeMajMinButton={activeMajMinButton}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            searchDealer={searchDealer}
            onDealerSearch={handleDealer}

            showAddForm={showAddForm}
            showAddAggForm={showAddAggForm}
            showAddCompPartForm={showAddCompPartForm}
            onCloseAddForm={closeAddForm}
            onCloseAddAggForm={closeAddAggForm}
            onCloseAddCompPartForm={closeAddCompPartForm}
            onAddSubmit={handleAddSubmit}
            onAddAggSubmit={handleAddAggSubmit}
            onAddCompPartSubmit={handleAddCompPartSubmit}
            dateFilter={dateFilter}

          />

        </div>
      </main>
    </>
  );
}

export default MainPage;
