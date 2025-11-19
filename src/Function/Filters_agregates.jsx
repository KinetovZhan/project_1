import React, { useState } from 'react'; 


export function Filters( {onFilterChange, onFilterChange2, onModelChange}) { 

  const [FilterItems, setFilterItems] = useState({
    DVS: false,
    KPP: false,
    RK: false,
    hydrorasp: false
  });

  const [FilterItems2, setFilterItems2] = useState({
    K7: false,
    K5: false,
  })

  const [selectedModel, setSelectedModel] = useState('');


  const handleModelChange = (event) => {
    const model = event.target.value;
    setSelectedModel(model);
    console.log('Выбрана модель:', model);
    
    if (onModelChange) {
      onModelChange(model); 
    }
  };


  const handleFilterChange = (FilterType) => {
    const newFilter = {
      ...FilterItems,
      [FilterType]: !FilterItems[FilterType]
    };
    setFilterItems(newFilter);

    if (onFilterChange) {
      const activeFilters = Object.keys(newFilter).filter(key => newFilter[key]);
      onFilterChange(activeFilters);
    }
  };


  const handleFilterChange2 = (FilterType2) => {
    const newFilter2 = {
      ...FilterItems2,
      [FilterType2]: !FilterItems2[FilterType2]
    }
    setFilterItems2(newFilter2);

    if (onFilterChange2) {
      const activeFilters2 = Object.keys(newFilter2).filter(key => newFilter2[key]);
      onFilterChange2(activeFilters2);
    }
  }




  return(
    <>
      <div className='filters'>
        <div className='filter'>
          <label> 
            <span>ДВС</span>
            <input 
              type="checkbox"
              checked={FilterItems.DVS}
              onChange={() => handleFilterChange('DVS')}
            />
            
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>КПП</span>
            <input 
              checked={FilterItems.KPP}
              onChange={() => handleFilterChange('KPP')}
              type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>РК</span>
            <input 
              checked={FilterItems.RK}
              onChange={() => handleFilterChange('RK')}
              type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label> 
            <span>Гидрораспределитель</span>
            <input 
              checked={FilterItems.hydrorasp}
              onChange={() => handleFilterChange('hydrorasp')}
              type="checkbox"/>
          </label>
        </div>
      </div>

      <div className='filters2'>
        <div className='filter'>
          <label>
            <span>Выбрать все</span>
            <input type="checkbox" />
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>К-7</span>
            <input 
              checked={FilterItems2.K7}
              onChange={() => handleFilterChange2('K7')}
              type="checkbox" 
            />
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>К-5</span>
            <input 
              checked={FilterItems2.K5}
              onChange={() => handleFilterChange2('K5')}
              type="checkbox" />
          </label>
        </div>

        <div className='model'>
          <select 
            id="tractor-select" 
            name="tractor"
            value={selectedModel}
            onChange={handleModelChange}>
            <option value="">Модель</option>
            <option value="K7">К-7</option>
            <option value="K5">К-5</option>
          </select>
        </div>
      </div>
    </>
  )
}
