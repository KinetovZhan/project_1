import { SearchBar } from '../SearchBar/SearchBar';
import { Objects } from '../Po/Objects';
import { TractorTable } from '../TractorTable/TractorTable';
import { AddPoForm } from '../AddPo/AddPo';
import { AddAggForm } from '../AddUzel/AddAgg';
import React, { useEffect, useState } from 'react'; //  исправлено: useEffect, а не useffect
import { useNavigate } from 'react-router-dom';

export function MainPart({
  activeButton,
  activeFilters,
  activeFilters2,
  selectedModel,
  selectedProducers,
  activeFiltersTrac,
  activeFiltersTrac2,
  onSearch,
  searchQuery,
  searchDealer,
  selectedStatus,
  actualFilter,   
  uzelFilter,
  actualFilterPo,

  // --- Форма ПО ---
  showAddForm,
  onCloseAddForm,
  onAddSubmit, // ← для AddPoForm
  dateFilter,
  activeMajMinButton,

  // --- Форма агрегата ---
  showAddAggForm,
  onCloseAddAggForm,
  onAddAggSubmit, // ← ДОБАВЛЕНО: отдельный колбэк для агрегата


  showAddCompPartForm,
  onCloseAddCompPartForm,
  onAddCompPartSubmit,

  handleTractorDetails,
  handleAggregateDetails,
  onCloseTab

  // onBack — не нужен, используйте onClose...
}) {
  const navigate = useNavigate();

  // State to persist form data when switching tabs
  const [formData, setFormData] = useState({
    selectedProducer: null,
    selectedTractorModels: [],
    selectedComponents: [],
    selectedPreviousVersion: null,
    selectedStatus: null,
    isArchive: false,
    isCritical: false,
    isActual: false
  });

  const handleGoBack = () => {
    navigate(-1); // Возврат на предыдущую страницу в истории
  };

  // Закрываем форму ПО, если переключились на другую вкладку
  useEffect(() => {
    if (activeButton && activeButton !== 'addPO' && showAddForm) {
      onCloseAddForm();
    }
  }, [activeButton, showAddForm, onCloseAddForm]);

  // Закрываем форму агрегата, если переключились
  useEffect(() => {
    if (activeButton && activeButton !== 'addAgg' && showAddAggForm) {
      onCloseAddAggForm();
    }
  }, [activeButton, showAddAggForm, onCloseAddAggForm]);


  useEffect(() => {
    if (activeButton && activeButton !== 'AddCompPart' && showAddCompPartForm) {
      onCloseAddCompPartForm();
    }
  }, [activeButton, showAddCompPartForm, onCloseAddCompPartForm]);

  // Отображаем форму ПО
  if (showAddForm) {
    return (
      <div className="MainPart">
        <AddPoForm 
          onBack={onCloseAddForm} 
          onSubmit={onAddSubmit} 
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    );
  }

  // Отображаем форму агрегата
  if (showAddAggForm) {
    return (
      <div className="MainPart">
        <AddAggForm onBack={onCloseAddAggForm} onSubmit={onAddAggSubmit} />
      </div>
    );
  }

  

  // Основной контент
  if (!activeButton) {
    return <div className="MainPart"></div>;
  }

  return (
    <div className="MainPart">
      
      {activeButton === 'aggregates' && (
        <>
          <SearchBar onSearch={onSearch} activeButton={activeButton} />
          <Objects
            activeFilters={activeFilters}
            activeFilters2={activeFilters2}
            selectedModel={selectedModel}
            selectedProducers={selectedProducers}
            onSearch={onSearch}
            searchQuery={searchQuery}
            selectedStatus={selectedStatus}
            onCloseTab={() => onCloseTab('aggregates')}
            actualFilterPo = {actualFilterPo}

          />
        </>
      )}
      {activeButton === 'tractor' && (
        <>
          <SearchBar onSearch={onSearch} activeButton={activeButton}/>
          <TractorTable
            activeFiltersTrac={activeFiltersTrac}
            activeFiltersTrac2={activeFiltersTrac2}
            onSearch={onSearch}
            searchQuery={searchQuery}
            searchDealer={searchDealer}
            dateFilter={dateFilter}
            activeMajMinButton={activeMajMinButton}
            actualFilter = {actualFilter}    
            uzelFilter = {uzelFilter}
            onCloseTab={() => onCloseTab('tractor')}
          />
        </>
      )}
    </div>
  );
}