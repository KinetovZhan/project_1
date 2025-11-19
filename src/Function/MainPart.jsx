import {SearchBar} from '../Function/SearchBar';
import {Objects} from '../Function/Objects';
import {TractorTable} from '../Function/TractorTable';


export function MainPart({activeButton, activeFilters, activeFilters2, selectedModel, selectedTractorModel, activeFiltersTrac, activeFiltersTrac2, onSearch, searchQuery, searchType}) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates'&& (<><SearchBar onSearch={onSearch}/> <Objects activeFilters={activeFilters} activeFilters2={activeFilters2} selectedModel={selectedModel} onSearch={onSearch} searchQuery={searchQuery} searchType={searchType}/></>)}
      {activeButton === 'tractor'&& (<><SearchBar onSearch={onSearch}/> <TractorTable activeFiltersTrac={activeFiltersTrac} activeFiltersTrac2={activeFiltersTrac2} onSearch={onSearch} searchQuery={searchQuery} searchType={searchType}/></>)}
    </div>
  )
}