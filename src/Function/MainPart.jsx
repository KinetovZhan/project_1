import { SearchBar } from '../Function/SearchBar';
import { Objects } from '../Function/Objects';
import { TractorTable } from '../Function/TractorTable';
import { AddPoForm } from '../Function/AddPo';
import { AddAggForm } from '../Function/AddAgg';
import React, { useEffect } from 'react'; // ✅ исправлено: useEffect, а не useffect

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
  searchDate,

  // --- Форма агрегата ---
  showAddAggForm,
  onCloseAddAggForm,
  onAddAggSubmit, // ← ДОБАВЛЕНО: отдельный колбэк для агрегата

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
          <SearchBar onSearch={onSearch} />
          <Objects
            activeFilters={activeFilters}
            activeFilters2={activeFilters2}
            selectedModel={selectedModel}
            onSearch={onSearch}
            searchQuery={searchQuery}
          />
        </>
      )}
      {activeButton === 'tractor' && (
        <>
          <SearchBar onSearch={onSearch} />
          <TractorTable
            activeFiltersTrac={activeFiltersTrac}
            activeFiltersTrac2={activeFiltersTrac2}
            onSearch={onSearch}
            searchQuery={searchQuery}
            searchDealer={searchDealer}
            searchDate={searchDate}
          />
        </>
      )}
    </div>
  );
}