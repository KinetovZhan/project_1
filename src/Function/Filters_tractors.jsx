import React, { useState } from 'react'; 


// Трактор
export function Filters2({ onFilterChangeTracByModel, onFilterChangeByStatus, activeMajMinButton, handleMajMinButtonClick }) {
  const models = ['К-742МСТ', 'К7', 'К-525'];

  const [FilterTractors_by_model, setFilterTractors_by_model] = useState({
    'К-742МСТ': false,
    'К7': false,
    'К-525': false
  });

  const FilterToTractor = {
    'К-742МСТ': 'K742MST',
    'К7': 'K7', 
    'К-525': 'K525'
  };

  const [FilterTractor_by_status, setFilterTractor_by_status] = useState({
    Serial: false,
    Experienced: false,
    Actual: false,
    Critical: false
  });

  const FilterStatus = {
    'Serial': 'Серийное',
    'Experienced': 'Опытное',
    'Actual': 'Актуальное',
    'Critical': 'Критические'
  }



  const handleFilterByStatus = (FilterType) => {
    const newFilter = {
      ...FilterTractor_by_status,
      [FilterType]: !FilterTractor_by_status[FilterType]
    };
    setFilterTractor_by_status(newFilter)


    if(onFilterChangeByStatus) {
      const activeFiltersTrac2 = Object.keys(newFilter)
        .filter(key => newFilter[key])
        .map(filter => FilterStatus[filter]);
      onFilterChangeByStatus(activeFiltersTrac2);
    }
  }
  


  const handleFilterByModelTractors = (FilterType) => {
    const newFilter = {
      ...FilterTractors_by_model,
      [FilterType]: !FilterTractors_by_model[FilterType]
    };
    setFilterTractors_by_model(newFilter)

    if (onFilterChangeTracByModel) {
      const activeFiltersTrac = Object.keys(newFilter)
        .filter(key => newFilter[key])
        .map(filter => FilterToTractor[filter]);
      onFilterChangeTracByModel(activeFiltersTrac);
    }
  }
  

  return (
    <>
      <div className='filterstrac'>
        {models.map(model => (
          <label key = {model}>
            <span>{model}</span>
            <input 
              type="checkbox"
              checked={FilterTractors_by_model[model]}
              onChange={() => handleFilterByModelTractors(model)}
            />
          </label>
        ))}
      </div>

      <div className='Дата выпуска'>
      </div>

      <div className='Поиск по дилеру'>
      </div>

      <div className='filterstrac2'>
        <label>
          <span>Серийное</span>
          <input type="checkbox"
          checked={FilterTractor_by_status.Serial} 
          onChange={() => handleFilterByStatus('Serial')}/>
        </label>

        <label>
          <span>Опытное</span>
          <input type="checkbox"
          checked={FilterTractor_by_status.Experienced} 
          onChange={() => handleFilterByStatus('Experienced')}/>
        </label>

        <label>
          <span>Актуальное</span>
          <input type="checkbox"
          checked={FilterTractor_by_status.Actual} 
          onChange={() => handleFilterByStatus('Actual')}/>
        </label>

        <label>
          <span>Критические</span>
          <input type="checkbox"
          checked={FilterTractor_by_status.Critical} 
          onChange={() => handleFilterByStatus('Critical')}/>
        </label>
      </div>

      <div className='Majmin'>
        <button 
          className={activeMajMinButton === 'MAJ'?'majmin_button_active' : 'majmin_button'}
          onClick={() => handleMajMinButtonClick('MAJ')}
        >
          Требуется MAJ
        </button>
        <button 
          className={activeMajMinButton === 'MIN'? 'majmin_button_active' : 'majmin_button'}
          onClick={() => handleMajMinButtonClick('MIN')}
        >
          Требуется MIN
        </button>
      </div>
    </>
  );
}