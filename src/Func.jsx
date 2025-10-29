import Image from './img/Image.png'
import { useState, useEffect } from 'react';

export function Header({ onLogout }) {
  return(
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
  )
}

export function Filters( {onFilterChange}) { 

  const [FilterItems, setFilterItems] = useState({
    DVS: false,
    KPP: false,
    RK: false,
    hydrorasp: false
  });

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

export function Sidebar({ activeButton, handleButtonClick, onFilterChange }) {
  return (
    <div className='sidebar'>
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
      {activeButton === 'aggregates' && <Filters onFilterChange={onFilterChange}/>}
      {activeButton === 'tractor' && <Filters2 />}
    </div>
  )
}




export function Objects({activeFilters = []}) {
  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredItems, setFilteredItems] = useState([])

useEffect(() => {
  const fetchSoftware = async () => {
    try {
      console.log('Начало загрузки данных...');
      
      const response = await fetch('http://localhost:8000/component-version/11/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Данные компонента:', data);
      console.log('Структура download_link:', data.download_link);
      console.log('Тип download_link:', typeof data.download_link);

      if (Array.isArray(data)) {
        setSoftwareItems(data);
        setFilteredItems(data); 
      } else if (data && typeof data === 'object') {
        setSoftwareItems([data]);
        setFilteredItems([data]); 
      } else {
        setSoftwareItems([]);
        setFilteredItems([]); 
      }
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(`Ошибка подключения к серверу: ${error.message}`);
      
    } finally {
      setLoading(false);
    }
  };

  fetchSoftware();
}, []);


  // Эффект для фильтрации данных при изменении активных фильтров
  useEffect(() => {
    if (activeFilters.length === 0) {
      // Если нет активных фильтров, показываем все элементы
      setFilteredItems(softwareItems);
    } else {
      // Фильтруем элементы по типу компонента
      const filtered = softwareItems.filter(item => {
        const type = item.type_component?.toLowerCase();

        // Сопоставление фильтров с типами компонентов
        const filterMap = {
          'DVS': 'двс',
          'KPP': 'кпп', 
          'RK': 'рк',
          'hydrorasp': 'гидрораспределитель'
        };
        
        // Проверяем, соответствует ли тип компонента любому из активных фильтров
        return activeFilters.some(filter => {
          const expectedType = filterMap[filter];
          return type && type.includes(expectedType);
        });
      });
      
      setFilteredItems(filtered);
    }
  }, [activeFilters, softwareItems]);




  const handleDownload = (item) => {
    console.log('Детали компонента:', item);
    
    if (item && (item.download_link).length > 10) {
      window.open(item.download_link, '_blank');
    } else {
      console.warn('Ссылка для скачивания не найдена для элемента:', item);
      alert('Ссылка для скачивания недоступна');
    }
  };

  if (loading) {
    return (
      <div className='maininfo'>
        <h3>Последние версии ПО для ДВС 1 220 ЛС</h3>
        <div>Загрузка данных с сервера...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='maininfo'>
        <h3>Внимание: режим разработки</h3>
        <div style={{color: 'orange'}}>{error}</div>
        <div style={{marginTop: '10px', color: '#666'}}>
          Используются демо-данные для тестирования интерфейса
        </div>
      </div>
    );
  }

  console.log('Рендеринг компонентов:', softwareItems);

  return (
    <div className='maininfo'>
      <h3>Последние версии ПО для ДВС 1 220 ЛС</h3>
      
      <div>
        <h4>Компоненты ({filteredItems.length})</h4>
        {activeFilters.length > 0 && (
          <div style={{marginBottom: '10px', color: '#666'}}>
            Активные фильтры: {activeFilters.map(filter => {
              const filterNames = {
                'DVS': 'ДВС',
                'KPP': 'КПП',
                'RK': 'РК',
                'hydrorasp': 'Гидрораспределитель'
              };
              return filterNames[filter];
            }).join(', ')}
          </div>
        )}
        
          <ul className='List'>
            {filteredItems.map((item) => ( 
              <li key={item.id_Firmwares}>
                <div className='objectmenu'>
                  <img className='object' src={Image} alt='Компонент' />
                  <div className='inform'>
                    <h4>Тип: {item.model_component} от {new   Date(item.release_date).toLocaleDateString()}</h4>
                    <button 
                      className='download'
                      onClick={() => handleDownload(item)}
                      disabled={!item.download_link}
                    >
                      Скачать
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredItems.length === 0 && softwareItems.length > 0 && (
          <div style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>
            Нет компонентов, соответствующих выбранным фильтрам
          </div>
          )}
      </div>
    </div>
  );
}



export function MainPart({activeButton, activeFilters}) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects activeFilters={activeFilters}/>}
      {activeButton === 'tractor'}
    </div>
  )
}

// Трактор
export function Filters2() {



  return (
    <>
      <div className='filterstrac'>
        <label>
          <span>К-742МСТ</span>
          <input type="checkbox" />
        </label>
        <label>
          <span>К-735</span>
          <input type="checkbox" />
        </label>
        <label>
          <span>К-525</span>
          <input type="checkbox" />
        </label>
      </div>

      <div className='Дата выпуска'>
        {/* Добавьте поля для даты выпуска */}
      </div>

      <div className='Поиск по дилеру'>
        {/* Добавьте поля для поиска по дилеру */}
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
  )
}