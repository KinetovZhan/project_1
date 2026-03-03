import React, { useState, useMemo, useEffect } from 'react';
// import '../cssfiles/sidebar.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Header } from '../Header/Header.jsx';  // УДАЛЯЕМ импорт Header
import { Sidebar } from '../Sidebar/Sidebar.jsx';
import { MainPart } from '../MainPart/MainPart.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev)

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
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    date_assemle: null,
    date_start: null,
    date_end: null
  });
  const [actualFilter, setActualFilter] = useState(null);

  const { user } = useAuth();  // Убрали logout, так как он теперь в App.js
  const navigate = useNavigate();

  // Убрали handleLogout, handleHelp, handleKnowledgeBase - они теперь в App.js

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape нажата, закрываем текущий вид');
        
        const newParams = new URLSearchParams(searchParams);
        let paramsChanged = false;

        if (activeButton === 'addPO' || activeButton === 'addAgg' || activeButton === 'AddCompPart') {
          newParams.delete('tab');
          paramsChanged = true;
          console.log('Закрываем форму добавления');
        }
        else if (activeButton === 'tractor' || activeButton === 'aggregates') {
          newParams.delete('tab');
          paramsChanged = true;
          console.log('Закрываем вкладку с таблицей');
        }

        if (paramsChanged) {
          setSearchParams(newParams);
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [activeButton, searchParams, setSearchParams]);

  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);
  const memoizedActiveFilters2 = useMemo(() => activeFilters2, [activeFilters2]);
  const memoizedActiveFiltersTrac = useMemo(() => activeFiltersTrac, [activeFiltersTrac]);
  const memoizedActiveFiltersTrac2 = useMemo(() => activeFiltersTrac2, [activeFiltersTrac2]);

  const handleMainPage = () => {
    navigate('/main');
  }

  useEffect(() => {
    const shouldPreserveFilters = ['aggregates'].includes(activeButton);
    if (!shouldPreserveFilters) {
      setActiveFilters([]);
      setActiveFilters2([]);
      setSelectedProducers([]);
      setActualFilter(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('model');
      setSearchParams(newParams, { replace: true });
    }
  }, [activeButton, searchParams, setSearchParams]);

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

  const handleAddSubmit = (responseData) => {
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
    const newParams = new URLSearchParams(searchParams);
    if (activeButton === 'AddCompPart') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', 'AddCompPart');
    }
    setSearchParams(newParams);
  };

  const handleStatusChange = (statuses) => {
    console.log('Выбранные статусы:', statuses); 
    setSelectedStatus(statuses);
  };

  const closeAddCompPartForm = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };

  const handleAddCompPartSubmit = (responseData) => {
    console.log('Часть агрегата добавлен:', responseData);
    alert('Часть агрегата создана!');
    closeAddCompPartForm();
  };

  const handleSearch = (query) => setSearchQuery(query);
  const handleDealer = (query) => setSearchDealer(query);
  const handleDateChange = (date) => {
    console.log('Дата получена в MainPage:', date);
    setDateFilter(date);
  };

  const handleActualChange = (value) => {
    console.log('📢 Фильтр актуальности изменился:', value);
    setActualFilter(value);
  };

  const handleMajMinButtonClick = (buttonName) => {
    setActiveMajMinButton(activeMajMinButton === buttonName ? null : buttonName);
  };

  const handleFilterChange = (filters) => setActiveFilters(filters);
  const handleFilterChange2 = (filters) => setActiveFilters2(filters);
  const handleFilterByModelTractors = (model) => setActiveFiltersTrac(model);
  const handleFilterByStatus = (model) => setActiveFiltersTrac2(model);

  return (
    <>
      {/* Удалили Header отсюда! */}
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
            onStatusChange={handleStatusChange} 
            onActualChange={handleActualChange}
            isMobileSidebarOpen={isMobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          />

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
            selectedStatus={selectedStatus}
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
            actualFilter={actualFilter}
          />
        </div>
      </main>
    </>
  );
}

export default MainPage;