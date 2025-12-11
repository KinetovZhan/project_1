import React, { useState } from 'react'; 


// Трактор
export function Filters2({ onFilterChangeTracByModel, onFilterChangeByStatus, activeMajMinButton, handleMajMinButtonClick, onDealerChange, onDateChange}) {
  const models = ['К-742МСТ', 'К-7', 'К-525'];

  const [FilterTractors_by_model, setFilterTractors_by_model] = useState({
    'К-742МСТ': false,
    'К-7': false,
    'К-525': false
  });


  const FilterToTractor = {
    'К-742МСТ': 'K742MST',
    'К-7': 'K-7', 
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

  const [Dealer, setDealer] = useState('')

  const [releaseDate, setReleaseDate] = useState('');





  const handleDealer = (event) => {
    const dealer = event.target.value;
    setDealer(dealer)
  }


    const handleSearch = () => {
    if (onDealerChange && typeof onDealerChange === 'function') {
      onDealerChange(Dealer);
    }
  };

    const handleDateChange = (event) => {
      const date = event.target.value;
      console.log('Дата выбрана в фильтре:', date); // <-- Добавьте этот лог
      setReleaseDate(date);
      if (onDateChange && typeof onDateChange === 'function') {
        onDateChange(date);
      }
    }

      // Функция для сброса фильтра по дате
    const handleClearDate = () => {
      setReleaseDate('');
      if (onDateChange && typeof onDateChange === 'function') {
        onDateChange('');
      }
    };

  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); 
    } 
  };



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

      <div className='release-date'>
        <input 
          type="date" 

          placeholder="Дата выпуска"
          className='choose_date_release'
          value = {releaseDate}
          onChange = {handleDateChange}
          onKeyDown={handleKeydown}
          />
      </div>

      <div className='search_by_dealer'>

        <input
          type="text"
          placeholder="Поиск по дилеру"
          className='searcher_dealer'
          value={Dealer}
          onChange={handleDealer} 
          onKeyDown={handleKeydown}
        />
        <button 
          type="button"
          onClick={handleSearch}
          className='search_button'
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>  
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