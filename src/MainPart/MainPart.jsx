import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '../SearchBar/SearchBar';
import { Objects } from '../Po/Objects';
import { TractorTable } from '../TractorTable/TractorTable';
import { AddPoForm } from '../AddPo/AddPo';
import { AddAggForm } from '../AddUzel/AddAgg';
import React, { useEffect } from 'react';

// Одинаковая анимация для всех компонентов
const contentVariants = {
  initial: { 
    opacity: 0,
    y: 20 
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.15
    }
  }
};

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
  onAddSubmit,
  dateFilter,
  activeMajMinButton,

  // --- Форма агрегата ---
  showAddAggForm,
  onCloseAddAggForm,
  onAddAggSubmit,

  showAddCompPartForm,
  onCloseAddCompPartForm,
  onAddCompPartSubmit
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

  return (
    <div className="MainPart"> {/* Фон остается здесь, не анимируется */}
      <AnimatePresence mode="wait">
        {/* Форма ПО */}
        {showAddForm && (
          <motion.div
            key="addPoForm"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            <AddPoForm onBack={onCloseAddForm} onSubmit={onAddSubmit} />
          </motion.div>
        )}

        {/* Форма агрегата */}
        {showAddAggForm && (
          <motion.div
            key="addAggForm"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            <AddAggForm onBack={onCloseAddAggForm} onSubmit={onAddAggSubmit} />
          </motion.div>
        )}

        {/* Таблица агрегатов */}
        {!showAddForm && !showAddAggForm && activeButton === 'aggregates' && (
          <motion.div
            key="aggregatesTable"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
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
          </motion.div>
        )}

        {/* Таблица тракторов */}
        {!showAddForm && !showAddAggForm && activeButton === 'tractor' && (
          <motion.div
            key="tractorTable"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SearchBar onSearch={onSearch} activeButton={activeButton} />
            <TractorTable
              activeFiltersTrac={activeFiltersTrac}
              activeFiltersTrac2={activeFiltersTrac2}
              onSearch={onSearch}
              searchQuery={searchQuery}
              searchDealer={searchDealer}
              dateFilter={dateFilter}
              activeMajMinButton={activeMajMinButton}
            />
          </motion.div>
        )}

        {/* Пустой MainPart (когда нет активной кнопки) */}
        {!activeButton && !showAddForm && !showAddAggForm && (
          <motion.div
            key="empty"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}