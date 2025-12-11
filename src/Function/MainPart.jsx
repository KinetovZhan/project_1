import {SearchBar} from '../Function/SearchBar';
import {Objects} from '../Function/Objects';
import {TractorTable} from '../Function/TractorTable';
import {AddPoForm} from '../Function/AddPo';
import {AddAggForm} from '../Function/AddAgg';
import React, {useffect} from 'react';


export function MainPart({activeButton, activeFilters, activeFilters2, selectedModel, selectedTractorModel, activeFiltersTrac, activeFiltersTrac2, onSearch, searchQuery, searchDealer, showAddForm, onCloseAddForm, showAddAggForm, onCloseAddAggForm, onAddSubmit, onBack,dateFilter}) {
  React.useEffect(() => {
    if (activeButton && activeButton !== 'addPO' && showAddForm) {
      onCloseAddForm();
    }
  }, [activeButton, showAddForm, onCloseAddForm]);


    React.useEffect(() => {
      if(activeButton && activeButton !== 'addAgg' && showAddAggForm) {
        onCloseAddAggForm();
      }
    }, [activeButton, showAddAggForm, onCloseAddAggForm]);

  if (showAddForm) {
    return (
      <div className='MainPart'>
        <AddPoForm onBack = {onBack} onSubmit={onAddSubmit} />  
      </div>
    );
  }
    
  if (showAddAggForm) {
      return (
        <div className = 'MainPart'>
         <AddAggForm onBack = {onBack} onSubmit = {onAddSubmit}/>
         </div>
      );
    }
  if (!activeButton) {
    return <div className='MainPart'></div>
  }
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates'&& (<><SearchBar onSearch={onSearch}/> <Objects activeFilters={activeFilters} activeFilters2={activeFilters2} selectedModel={selectedModel} onSearch={onSearch} searchQuery={searchQuery}/></>)}
      {activeButton === 'tractor'&& (<><SearchBar onSearch={onSearch}/> <TractorTable activeFiltersTrac={activeFiltersTrac} activeFiltersTrac2={activeFiltersTrac2} onSearch={onSearch} searchQuery={searchQuery} searchDealer={searchDealer} dateFilter={dateFilter}/></>)}
    </div>
  )
}