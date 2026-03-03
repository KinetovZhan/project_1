import { SearchBar } from '../SearchBar/SearchBar';
import { Objects } from '../Po/Objects';
import { TractorTable } from '../TractorTable/TractorTable';
import { AddPoForm } from '../AddPo/AddPo';
import { AddAggForm } from '../AddUzel/AddAgg';
import React, { useEffect } from 'react'; //  исправлено: useEffect, а не useffect

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
  onAddCompPartSubmit

  // onBack — не нужен, используйте onClose...
}) {
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
        <AddPoForm onBack={onCloseAddForm} onSubmit={onAddSubmit} />
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
          />
        </>
      )}
    </div>
  );
}