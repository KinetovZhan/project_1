import Image from './img/Image.png'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';



export function Header({ onLogout }) {
  return(
    <>
      <header>
        <div className='mainText'>
          <h3>Сервис просмотра версий ПО</h3>
        </div>
        <div className='navigation'>
          <h3>Помощь</h3>
          {onLogout && (
            <h3 onClick={onLogout} style={{cursor: 'pointer'}}>Выйти</h3>
          )}
        </div>
      </header>
    </>
  )
}


export function Filters() {
  return(
    <>
      <div className='filters'>
        <div className='filter'>
          <label> 
            <span>ДВС</span>
            <input type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>КПП</span>
            <input type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>РК</span>
            <input type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label> 
            <span>Гидрораспределитель</span>
            <input type="checkbox"/>
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
            <span>К-525</span>
            <input type="checkbox" />
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>К-742МСТ1</span>
            <input type="checkbox" />
          </label>
        </div>

        <div className='model'>
          <select id="tractor-select" name="tractor">
            <option value="">Модель</option>
            <option value="m1">К-743</option>
            <option value="m2">К-745</option>
            <option value="m3">К-743</option>
          </select>
        </div>
      </div>
    </>
  )
}


export function Sidebar({ activeButton, handleButtonClick, onAddPoClick, selectedModel, onModelChange}) {
  return (
    <div className='sidebar'>
      {/* Блок с кнопками "Трактор" и "Агрегаты" */}
      <div className='choose'>
        <button 
          className={activeButton === 'tractor' ? 'active' : ''}
          onClick={() => handleButtonClick('tractor')}
        >
          Трактор
        </button>
        <br />
        <button
          className={activeButton === 'aggregates' ? 'active' : ''}
          onClick={() => handleButtonClick('aggregates')}
        >
          Агрегаты
        </button>
      </div>


      {activeButton !== 'aggregates' && activeButton !== 'tractor' && (
        <div className='add-po-container'>
          <button 
            // Не добавляем класс active — чтобы не было выделения как у активной кнопки
            onClick={onAddPoClick}> {}
            Добавить ПО
          </button>
        </div>
      )} 

      {/* Фильтры — остаются как есть */}
      {activeButton === 'aggregates' && <Filters />}
      {activeButton === 'tractor' && (
        <Filters2
          selectedModel={selectedModel}
          onModelChange={onModelChange}  
        />
      )}
    </div>
  );
}


export function Objects() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Запрос к твоему серверу
    fetch('http://localhost:5000/api/dvs')
      .then(response => response.json())
      .then(data => {
        setVersions(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки данных:', error);
        setLoading(false);
      });
  }, []);
  const handleDownload = (id) => {
    window.open(`http://localhost:5000/api/download/${ id }`, '_blank');
  };

  if (loading) {
    return <div className="maininfo">Загрузка версий ДВС...</div>;
  }

  return (
    <div className="maininfo">
      <h3>Последние версии ПО для ДВС</h3>
      <ul className="List">
        {versions.map(ver => (
          <li key={ver.id}>
            <div className="objectmenu">
              <img className="object" src={Image} alt="ДВС" />
              <div className="inform">
                <h3>№{ver.id} от {ver.date} ({ver.type})</h3>
                <h4>{ver.description}</h4>
                <button 
                  className="download"
                  onClick={() => handleDownload(ver.id)}
                >
                  Скачать
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


export function MainPart({activeButton, showAddForm, onAddSubmit, onBack, selectedModel}) {

  if (showAddForm) {
    return (
      <div className='MainPart'>
        <AddPoForm onBack={onBack} onSubmit={onAddSubmit} />  
      </div>
    );
  }

  if (!activeButton) {
    return <div className='MainPart'></div>
  }
  
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects />}
      {activeButton === 'tractor' && (selectedModel ? <TractorTable selectedModel={selectedModel} /> : '')}
      <SearchBar/> 
    </div>
  );
}

export function AddPoForm({onBack, onSubmit}) {
  return(
    <div className="maininfo add-po-form-container">
      <button
        onClick={onBack}
        className="add-po-back-button"
      >
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <h3 className="add-po-title">
        Добавление нового ПО
      </h3>

      <form className='add-po-form' onSubmit={onSubmit}>
        <div className='add-po-field'>
          <label className='add-po-label'>Номер ПО</label>
          <input
            type="text"
            name='poNumber'
            placeholder="Value"
            required
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Агрегат</label>
          <select
            name="aggregate"
            required
            className='add-po-select'
          >
            <option value="">Выберите агрегат</option>
            <option value="dvs">ДВС</option>
            <option value="kpp">КПП</option>
            <option value="rk">РК</option>
            <option value="hydro">Гидрораспределитель</option>
          </select>
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Модель трактора</label>
          <input
            type="text"
            name="tractorModel"
            placeholder="Value"
            required
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Major/Minor</label>
          <select
            name="majorMinor"
            required
            className='add-po-select'
          >
            <option value="">Выберите тип</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>    
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Версия ПО</label>
          <select
            name="version"
            required
            className='add-po-select'
          >
            <option value="">Выберите версию</option>
            <option value="1.0">1.0</option>
            <option value="2.0">2.0</option>
            <option value="3.0">3.0</option>
          </select>
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Описание</label>
          <textarea
            name="description"
            placeholder='Value'
            rows="5"
            required
            className='add-po-textarea'
          />
        </div>

        <button
          type="submit"
          className='add-po-submit-button'
        >
          Добавить
        </button> 
      </form>
    </div>   
    
  );
}

export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    motoHoursMin: '',
    motoHoursMax: ''
  });

  const handleSearch = () => {
    if (onSearch && typeof onSearch === 'function') {
      onSearch(query, filters);
    }
  };

  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); 
    } 
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

   const clearFilters = () => {
    setFilters({
      region: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      motoHoursMin: '',
      motoHoursMax: ''
    });
  };

  const applyFilters = () => {
    handleSearch();
    setShowFilters(false);
  };

  return (
    <div className="search-bar">
      {/* Иконка фильтров (три полоски) */}
      <button 
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className='filter-toggle-button'
      >
        <svg width="20" height="20" viewBox="0 0 50 50" class = 'multiple-lines' fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="40" y1="15" x2="0" y2="15" />
          <line x1="40" y1="25" x2="0" y2="25" />
          <line x1="40" y1="35" x2="0" y2="35" />
        </svg>
      </button>

      <input
        type="text"
        placeholder="Поиск"
        value={query}
        onChange={(e) => setQuery(e.target.value)} 
        onKeyDown={handleKeydown}
      />
      <button 
        type="button"
        onClick={handleSearch}
        className='search-icon-button'
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>  
      {/* Панель фильтров */}
      {showFilters && (
        <div className = "filters-panel" >
          <div className = 'filters-panel-inner'>
            {/* Регион */}
            <div > 
              <label >
                Регион
              </label>
              <select
                value = {filters.region}
                onChange = {(e) => handleFilterChange('region', e.target.value)}
                className = 'filters-region'
              >
                <option value="">Все регионы</option>
                <option value="Московская область">Московская область</option>
                <option value="Ленинградская область">Ленинградская область</option>
                <option value="Новосибирская область">Новосибирская область</option>
                <option value="Ростовская область">Ростовская область</option>
                <option value="Краснодарский край">Краснодарский край</option>
              </select>
            </div>

            {/* Статус */}
            <div>
              <label >
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className = 'filters-status'
              >
                <option value="">Все статусы</option>
                <option value="Исправен">Исправен</option>
                <option value="На обслуживании">На обслуживании</option>
                <option value="Требует проверки">Требует проверки</option>
                <option value="Требует ремонта">Требует ремонта</option>
              </select>
            </div>

            {/* Дата от */}
            <div>
              <label >
                Дата выпуска от
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Дата до */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                Дата выпуска до
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Моточасы от */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: ' rgb(8, 8, 8)' }}>
                Моточасы от
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.motoHoursMin}
                onChange={(e) => handleFilterChange('motoHoursMin', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Моточасы до */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                Моточасы до
              </label>
              <input
                type="number"
                placeholder="10000"
                value={filters.motoHoursMax}
                onChange={(e) => handleFilterChange('motoHoursMax', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Кнопки управления фильтрами */}
          <div className = 'clear-and-apply-container'>
            <button
              type="button"
              onClick={clearFilters}
              className = 'button-clearfilters'
            >
              Очистить
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className = 'button-applyfilters'
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



//Трактор

export function Filters2({ selectedModel, onModelChange }) {
  const models = ['К-742МСТ', 'К-735', 'К-525'];

 
  return (
    <>
      <div className='filterstrac'>
        {models.map(model => (
          <label key={model} >
            <span>{model}</span>
            <input 
              type="checkbox"
              checked={selectedModel === model}
              onChange={() => onModelChange(model)}
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
          <input type="checkbox" />
        </label>

        <label>
          <span>Опытное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Актуальное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Критические</span>
          <input type="checkbox" />
        </label>
      </div>

      <div className='Majmin'>
        <button className='majmin_button'>Требуется MAJ</button>
        <button className='majmin_button'>Требуется MIN</button>
      </div>
    </>
  );
}


export function TractorTable({ selectedModel }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mockTractors = [
    {
      id: 1,
      VIN: "1HGBH41JXMN109186",
      model: "К-742МСТ",
      releaseDate: "2023-01-15",
      region: "Московская область",
      motoHours: 1250,
      lastActivity: "2024-01-20",
      DVS: "Исправен",
      KPP: "Исправна",
      RK: "Требует проверки",
      BK: "Исправен"
    },
    {
      id: 2,
      VIN: "2FMDK3GC5DBA53674", 
      model: "К-735",
      releaseDate: "2022-08-10",
      region: "Ленинградская область",
      motoHours: 890,
      lastActivity: "2024-01-18",
      DVS: "Исправен",
      KPP: "Исправна",
      RK: "Исправен",
      BK: "Исправен"
    },
    {
      id: 4,
      VIN: "4HGBH41JXMN109187",
      model: "К-742МСТ",
      releaseDate: "2023-03-20",
      region: "Новосибирская область",
      motoHours: 980,
      lastActivity: "2024-01-19",
      DVS: "Исправен",
      KPP: "Требует ремонта",
      RK: "Исправен",
      BK: "Исправен"
    },
    {
      id: 5,
      VIN: "5FMDK3GC5DBA53675",
      model: "К-735", 
      releaseDate: "2022-11-05",
      region: "Ростовская область",
      motoHours: 1340,
      lastActivity: "2024-01-21",
      DVS: "На обслуживании",
      KPP: "Исправна",
      RK: "Требует проверки",
      BK: "Исправен"
    },
  ];
  
  const filteredTractors = selectedModel 
    ? tractors.filter(tractor => tractor.model === selectedModel)
    : tractors;

  useEffect(() => {
    const API_URL = '/api/tractors';
    
    const fetchTractors = async () => {
      try {
        const USE_MOCK_DATA = true;
        
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setTractors(mockTractors);
          return;
        }
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Сервер вернул не JSON формат');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Сервер вернул не массив');
        }
       
        setTractors(data);  
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
          setError('Ошибка: Сервер вернул HTML вместо JSON. Проверьте API endpoint.');
        } else {
          setError(`Ошибка: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTractors();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div>Загрузка данных о тракторах...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error">
        <div>Ошибка: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  if (tractors.length === 0) {
    return <div className="no-data">Нет данных о тракторах</div>;
  }

  return (
    <div className="tractor-table-container">
      {filteredTractors.length === 0 ? (
        <div className="no-data" >
          {selectedModel 
            ? `Нет тракторов модели "${selectedModel}"`
            : "Нет данных о тракторах"
          }
        </div>
      ) : (
        <>
          <table className="tractor-table">
            <thead>
              <tr>
                <th>Vin</th>
                <th>Модель</th>
                <th>Дата выпуска</th>
                <th>Регион</th>
                <th>Моточасы</th>
                <th>Последняя активность</th>
                <th>ДВС</th>
                <th>КПП</th>
                <th>РК</th>
                <th>БК</th>
              </tr>
            </thead>
            <tbody>
              {filteredTractors.map(tractor => (
                <tr key={tractor.id}>
                  <td>{tractor.VIN}</td>
                  <td> {tractor.model}</td>
                  <td>{tractor.releaseDate}</td>
                  <td>{tractor.region}</td>
                  <td>{tractor.motoHours}</td>
                  <td>{tractor.lastActivity}</td>
                  <td>{tractor.DVS}</td>
                  <td>{tractor.KPP}</td>
                  <td>{tractor.RK}</td>
                  <td>{tractor.BK}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}