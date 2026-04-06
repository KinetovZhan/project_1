import { SearchBar } from '../SearchBar/SearchBar.jsx';
import { Objects } from '../Po/Objects.jsx';
import { TractorTable } from '../TractorTable/TractorTable.jsx';
import { AddPoForm } from '../AddPo/AddPo.jsx';
import { AddAggForm } from '../AddUzel/AddAgg.jsx';

import React, { useEffect } from 'react'; //  исправлено: useEffect, а не useffect
import { useNavigate } from 'react-router-dom';

export function MainPart({
  activeButton,
  activeFilters,
  activeFilters2,
  selectedModel,
  activeFiltersTrac,
  activeFiltersTrac2,
  onSearch,
  searchQuery,
  searchDealer,

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
}) {
  const navigate = useNavigate();

  

  const handleGoBack = () => {
    navigate(-1); // Возврат на предыдущую страницу в истории
  };

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
  return (
    <div className="MainPart">
      <SearchBar onSearch={onSearch} searchQuery={searchQuery} />

      {activeButton === 'aggregates' && (
        <Objects 
          activeFilters={activeFilters}
          activeFilters2={activeFilters2}
          selectedModel={selectedModel}
          handleAggregateDetails={() => {}}
          onCloseTab={() => {}}
          actualFilterPo={[]}
        />
      )}

      {activeButton === 'tractor' && (
        <TractorTable 
          activeFiltersTrac={activeFiltersTrac}
          activeFiltersTrac2={activeFiltersTrac2}
          searchQuery={searchQuery}
          searchDealer={searchDealer}
          dateFilter={dateFilter}
          activeMajMinButton={activeMajMinButton}
          onCloseTab={() => {}}
          showAddForm={showAddForm}
          onCloseAddForm={onCloseAddForm}
          onAddSubmit={onAddSubmit}
        />
      )}
    </div>
  );
}