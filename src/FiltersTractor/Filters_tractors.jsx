import React, { useState, useEffect } from 'react'; 
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../auth/AuthContext.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '../fetchAPI.js';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';

// Трактор
export function Filters2({ 
  onFilterChangeTracByModel, 
  onFilterChangeByStatus, 
  activeMajMinButton, 
  handleMajMinButtonClick, 
  onDealerChange, 
  onDateChange,
  // Добавляем новый проп для фильтра актуальности
  onActualChange,
  onUzelChange 
}) {
  // Опции для Select с моделями тракторов
  // const tractorOptions = [
  //   { value: 'K-742МСТ', label: 'К-742МСТ' },
  //   { value: 'K-7', label: 'К-7' },
  //   { value: 'K-525', label: 'К-525' }
  // ];

  const actualityOptions = [
    {value:'critical', label: 'Требуется обновление'},
    {value:'actual', label: 'Актуальное'},
    {value:'oldy', label: 'Устаревшее'}
  ];

  // const uzelOptions = [
  //   {value:'DVS', label: 'ДВС'},
  //   {value:'HR', label: 'ГР'},
  //   {value:'RK', label: 'РК'},
  //   {value:'BK', label: 'БК'},
  //   {value:'KPP', label: 'КПП'},
  // ];

  const uzelOptions = [
  {value:'dvs', label: 'ДВС'},
  {value:'gr', label: 'ГР'},
  {value:'rk', label: 'РК'},
  {value:'bk', label: 'БК'},
  {value:'kpp', label: 'КПП'},
  {value:'autopilot', label: 'Автопилот'}
];

  const isMobile = useCheckMobile()
  const [selectedActuality, setSelectedActuality] = useState(null);
  const [loadingTractorModels, setLoadingTractorModels] = useState(null);
  const [tractorError, setTractorError] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedUzel, setSelectedUzel] = useState(null);
  const [Dealer, setDealer] = useState('');
  const [tractorOptions, setTractorOptions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [agg, setAgg] = useState(null);
  const { token, user } = useAuth();

  // const [isCritical, setIsCritical] = useState(null);
  // const [isActual, setIsActual] = useState(null);
  // const [isOldy, setIsOldy] = useState(null);


  // useEffect(() => {
  //   const checkStatus =() => {
  //     if (actualityOptions.value === 'critical') {
  //       setIsCritical(true)
  //     } else {setIsCritical(false)}

  //     if(actualityOptions.value === 'actual') {
  //       setIsActual(true)
  //     } else {setIsActual(false)}

  //     if(actualityOptions.value === 'oldy') {
  //       setIsOldy(true)
  //     } else {setIsOldy(false)}
  //   }
  //   checkStatus()
  // },[])

  useEffect(() => {
    const fetchTractorModel = async () => {
      if (!token) {
        setTractorOptions([]);
        return;
      }

      try {
        setLoadingTractorModels(true);
        setTractorError(null);
        
        const response = await api.get('search/get-all-models-from-back');
        // Извлекаем уникальные модели тракторов из поля tractor_model (которое является массивом)
        const tractorModels= response.map(item => item.model).filter(Boolean);
        tractorModels.sort();
  
        // Формируем опции для react-select
        const options = tractorModels.map(model => ({
          value: model,
          label: model
        }));
  
        console.log('Найденные модели тракторов:', tractorModels); // Для отладки
        setTractorOptions(options);
        
      } catch (err) {
        console.error('Ошибка загрузки моделей тракторов:', err);
        setTractorError(err.message);
      } finally {
        setLoadingTractorModels(false);
      }
    };
  
    fetchTractorModel();
  }, [token]);


  const handleSearch = () => {
    if (onDealerChange && typeof onDealerChange === 'function') {
      onDealerChange(Dealer);
    }
  };


  const handleChange = (e) => {
    const dealer = e.target.value;
    setDealer(dealer);
    if (onDealerChange && typeof onDealerChange === 'function') {
      onDealerChange(dealer);
    }
  };

  // Обработчик для начальной даты
  const handleStartDateChange = (date) => {
  setStartDate(date);
  if (onDateChange) {
    const formatDate = (date) => {
      if (!date) return null;
      return format(date, 'yyyy-MM-dd');
    };
    
    // Если конечная дата меньше начальной или равна null, устанавливаем конечную равной начальной
    if (date && endDate && date > endDate) {
      setEndDate(date);
      onDateChange({
        date_assemle: null,
        date_start: formatDate(date),
        date_end: formatDate(date)
      });
    } else {
      onDateChange({
        date_assemle: null,
        date_start: formatDate(date),
        date_end: endDate ? formatDate(endDate) : null
      });
    }
  }
};


// Обработчик для конечной даты
const handleEndDateChange = (date) => {
  setEndDate(date);
  if (onDateChange) {
    const formatDate = (date) => {
      if (!date) return null;
      return format(date, 'yyyy-MM-dd');
    };
    
    // Если начальная дата больше конечной, обновляем начальную
    if (date && startDate && date < startDate) {
      setStartDate(date);
      onDateChange({
        date_assemle: null,
        date_start: formatDate(date),
        date_end: formatDate(date)
      });
    } else {
      onDateChange({
        date_assemle: null,
        date_start: startDate ? formatDate(startDate) : null,
        date_end: formatDate(date)
      });
    }
  }
};

// Очистка начальной даты
const handleClearStartDate = () => {
  setStartDate(null);
  if (onDateChange) {
    onDateChange({
      date_assemle: null,
      date_start: null,
      date_end: endDate ? format(endDate, 'yyyy-MM-dd') : null
    });
  }
};

// Очистка конечной даты
const handleClearEndDate = () => {
  setEndDate(null);
  if (onDateChange) {
    onDateChange({
      date_assemle: null,
      date_start: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      date_end: null
    });
  }
};

  // Обработчик нажатия клавиш (Enter для поиска)
  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); 
    } 
  };

  // Кастомный инпут для DatePicker с метками
  const CustomInput = React.forwardRef(({ value, onClick, label }, ref) => (
    <div className="release-date">
      {label && <span className="date-label">{label}</span>}
      <input
        className="choose_date_release"
        onClick={onClick}
        ref={ref}
        value={value || ""}
        readOnly
        placeholder={label ? "" : "Дата выпуска"}
      />
      <div className="calendar-icon" onClick={onClick}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
    </div>
  ));

  const CustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {
    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - 10 + i);
     const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

    return (
      <div className="custom-datepicker-header">
        <button
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="nav-button"
        >
          &lt;
        </button>
        
        <div className="month-year-display">
          {/* Выпадающий список для месяца */}
        <div className="custom-month-select">
          <div 
            className="selected-month"
            onClick={() => setIsMonthOpen(!isMonthOpen)}
          >
            {months[date.getMonth()]}
          </div>
          
          {isMonthOpen && (
            <div className="month-dropdown">
              {months.map((month, index) => (
                <div
                  key={month}
                  className={`month-option ${index === date.getMonth() ? 'selected' : ''}`}
                  onClick={() => {
                    changeMonth(index);
                    setIsMonthOpen(false);
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
          <div className="custom-year-select">
            <div 
              className="selected-year"
              onClick={() => setIsYearOpen(!isYearOpen)}
            >
              {date.getFullYear()}
            </div>
            
            {isYearOpen && (
              <div className="year-dropdown">
                {years.map((year) => (
                  <div
                    key={year}
                    className={`year-option ${year === date.getFullYear() ? 'selected' : ''}`}
                    onClick={() => {
                      changeYear(year);
                      setIsYearOpen(false);
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="nav-button"
        >
          &gt;
        </button>
      </div>
    );
  };

  // Обработчик для Select с моделями тракторов
  const handleModelChange = (selectedOptions) => {
    const values = selectedOptions 
      ? selectedOptions.map(opt => opt.value) 
      : [];
    
    setSelectedModels(selectedOptions || []);
    
    if (onFilterChangeTracByModel) {
      onFilterChangeTracByModel(values);
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

const handleActualChange = (selectedOptions) => {
  const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
  setSelectedActuality(selectedOptions);
  if (onActualChange) {
    onActualChange(values); // передаём массив строк
  }
};

const handleUzelChange = (selectedOptions) => {
  const values = selectedOptions ? selectedOptions.map(opt => opt.value.toLowerCase()) : [];
  setSelectedUzel(selectedOptions);
  if (onUzelChange) {
    onUzelChange(values);
  }
};


  // Форматирование опций с цветным кружком для фильтра актуальности
const formatActualityOptionLabel = ({ value, label }) => {
  let color;
  switch (value) {
    case 'critical': color = '#ff4444'; break; // красный
    case 'actual': color = '#44ff44'; break;   // зелёный
    case 'oldy': color = '#ffff44'; break;     // жёлтый
    default: color = '#ccc';
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: '8px',
        }}
      />
      {label}
    </div>
  );
};

  return (
    <>
      {/* Фильтр по моделям тракторов */}
      <div className='tractorModel'>
        <Select
          className='modelSelect'
          isMulti
          options={tractorOptions}
          value={selectedModels}
          onChange={handleModelChange}
          placeholder="Модель трактора"
          menuPortalTarget={document.body}
          styles={{ 
            control: (base) => ({ 
              ...base, 
              maxHeight: 200, 
              overflowY: 'auto', 
              color: 'black', 
              backgroundColor: '#ffffff', borderColor: '#e3e5e8', boxShadow: 'none', 
              // width: isMobile ? '100%':'360px', 
              width: '45vw',
              borderRadius: '16px', 
              height:'53px',
              left: '50%',
              transform: 'Translate(-50%)', 
            }),
            menuPortal: (base) => ({
              ...base,  
              zIndex: 9999
            }),
            menuList: (base) => ({ 
              ...base, 
              maxHeight: 150, 
              // width:'42vh',
              overflowY: 'auto', 
              backgroundColor:'white',
              color:'black', 
              border: '1px solid #e3e5e8',
              scrollbarWidth:'thin',
              fontSize: (isMobile?'12px':'16px')


            })
          }}
        />
      </div>

      {/* Два отдельных поля для дат */}
      <div className='release-date-container'>
        <div className='date-range'>
          <div style={{ transform: 'scale(0.75)', position: 'relative', zIndex: 9999 }}>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              locale={ru}
              dateFormat="dd.MM.yyyy"
              customInput={<CustomInput label="С:"/>}
              renderCustomHeader={CustomHeader}
              isClearable={true}
              onClear={handleClearStartDate}
              clearButtonTitle="Очистить"
              placeholderText="Начальная дата"
              popperClassName="super-zindex"
            />
          </div>
          <div style={{ transform: 'scale(0.75)', position: 'relative', zIndex: 9999}}>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              locale={ru}
              dateFormat="dd.MM.yyyy"
              customInput={<CustomInput label="По:" />}
              renderCustomHeader={CustomHeader}
              isClearable={true}
              onClear={handleClearEndDate}
              clearButtonTitle="Очистить"
              placeholderText="Конечная дата"
              popperClassName="super-zindex"
            />
          </div>
        </div>
      </div>

        {(user.role !== 'dealer')?
        <>
        <div className='search_by_dealer'>
          <input
            type="text"
            placeholder={isFocused || Dealer ? '' : "Поиск по дилеру" }
            className='searcher_dealer'
            value={Dealer}
            onChange={handleChange} 
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeydown}
            onBlur={() => {
              if (!Dealer) {
                setIsFocused(false);
              }
            }}
          />
          <button 
            type="button"
            onClick={handleSearch}
            className='search_button'
            data-testid="search-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>  
        </div>
        </>:null
        }


      <div className='tractors-status'>
        <span>Статус:</span>
        <div className="actuality-filter">
          <Select
            isMulti
            className="actuality-select"
            options={actualityOptions}
            value={selectedActuality}
            onChange={handleActualChange}
            placeholder="Все статусы"
            isClearable={true}
            menuPortalTarget={document.body}
            formatOptionLabel={formatActualityOptionLabel}   // <-- добавлено
            styles={{
              control: (base) => ({
                ...base,
                width: '100%',
                borderRadius: '16px',
                borderColor: '#e3e5e8',
                height: '53px',
                backgroundColor: '#ffffff', boxShadow: 'none',
                color: 'black',
                overflowY: 'auto',
                overflowX: 'auto',
              }),
              multiValue: (base) => ({
                ...base,
                fontSize: '13px'
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({
                ...base,
                maxHeight: 150,
                overflowY: 'auto',
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid #e3e5e8',
                scrollbarWidth: 'thin',
                fontSize: '16px'
              }),
              option: (base, state) => ({
                ...base,
                display: 'flex',
                alignItems: 'center',
              }),
            }}
          />
        </div>

        <span>Узел:</span>
        <div className="uzel-filter">
          <Select
            isMulti
            className="uzel-select"
            options={uzelOptions}
            value={selectedUzel}
            onChange={handleUzelChange}
            placeholder="Узлы"
            isClearable={true}
            menuPortalTarget={document.body}
            styles={{
              control: (base) => ({
                ...base,
                width: '100%',
                borderRadius: '16px',
                height: '53px',
                borderColor: '#e3e5e8',
                backgroundColor: '#ffffff', boxShadow: 'none',
                color: 'black',
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({
                ...base,
                maxHeight: 200,
                overflowY: 'auto',
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid #e3e5e8',
                scrollbarWidth: 'thin',
                fontSize: '16px'
              })
            }}
          />
        </div>
      </div>
    </>
  );
}