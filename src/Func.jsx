import Image from './img/Image.png'
import { useState, useEffect } from 'react';



const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
};

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

export function Sidebar({ activeButton, handleButtonClick, handleMajMinButtonClick, activeMajMinButton, onFilterChange, onFilterChange2, onModelChange, onModelChangeTrac, onFilterChangeTracByModel, onFilterChangeByStatus }) {
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
      {activeButton === 'aggregates' && <Filters onFilterChange={onFilterChange} onFilterChange2={onFilterChange2} onModelChange={onModelChange}/>}
      {activeButton === 'tractor' && <Filters2 onFilterChangeTracByModel={onFilterChangeTracByModel} onFilterChangeByStatus={onFilterChangeByStatus} handleMajMinButtonClick={handleMajMinButtonClick} activeMajMinButton={activeMajMinButton}/>}
    </div>
  )
}




export function Objects({activeFilters, activeFilters2, selectedModel}) {
  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  


  const getPostData = () => {
    const hasComponentFilters = activeFilters.length > 0;
    const hasTractorFilter = activeFilters2.length > 0;
    const hasSelectedModel = selectedModel && selectedModel !== '';
    
    const FilterToTypeMap = {
      'DVS': 'двс',
      'KPP': 'кпп', 
      'RK': 'рк',
      'hydrorasp': 'гидрораспределитель'
    };

    const FilterToTractor = {
      'K7': 'K7',
      'K5': 'K5'
    };

    // Подготавливаем данные для POST запроса
    const postData = {
      trac_model: [],
      type_comp: [],
      model_comp: ""
    };

    // Заполняем данные в зависимости от активных фильтров
    if (hasTractorFilter) {
      postData.trac_model = activeFilters2.map(filter => FilterToTractor[filter]);
    }

    if (hasComponentFilters) {
      postData.type_comp = activeFilters.map(filter => FilterToTypeMap[filter]);
    }

    if (hasSelectedModel) {
      postData.model_comp = selectedModel;
    }

    return postData;
  };



  useEffect(() => {
    const fetchSoftware = async () => {
      setLoading(true);
      try {
        console.log('Начало загрузки данных...');


        const postData = getPostData();
        console.log('Данные для пост запроса:', postData)
        // const hasAnyFilter = postData.trac_model.length > 0 || postData.type_comp.length > 0 || postData.model_comp !== '';

        let response;
        let data;


        response = await fetch('http://localhost:8000/component-info/', {
          method: 'POST',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
          
        });


        data = await response.json();

        if (data && data.status_code === 404) {
          console.log("404");
          setSoftwareItems([])
          setFilteredItems([])
          alert("По вашим фильтрам ничего не нашлось");
          return;
      }

        
        console.log('Статус ответа:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        
        console.log('Данные компонента:', data);

        
        if (Array.isArray(data)) {
          if (data.status_code == 404){
            setSoftwareItems([]);
            setFilteredItems([]); 
          }
          else{
            setSoftwareItems(data);
            setFilteredItems(data); 
          }
          
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

  }, [activeFilters, activeFilters2, selectedModel]);


  // // Эффект для фильтрации данных при изменении активных фильтров
  // useEffect(() => {
  //   if (activeFilters.length === 0) {
  //     // Если нет активных фильтров, показываем все элементы
  //     setFilteredItems(softwareItems);
  //   } else {
  //     // Фильтруем элементы по типу компонента
  //     const filtered = softwareItems.filter(item => {
  //       const type = item.type_component?.toLowerCase();

  //       // Сопоставление фильтров с типами компонентов
  //       const filterMap = {
  //         'DVS': 'двс',
  //         'KPP': 'кпп', 
  //         'RK': 'рк',
  //         'hydrorasp': 'гидрораспределитель'
  //       };
        
  //       // Проверяем, соответствует ли тип компонента любому из активных фильтров
  //       return activeFilters.some(filter => {
  //         const expectedType = filterMap[filter];
  //         return type && type.includes(expectedType);
  //       });
  //     });
      
  //     setFilteredItems(filtered);
  //   }
  // }, [activeFilters, softwareItems]);




  const handleDownload = (item) => {
    console.log('Детали компонента:', item);
    
    if (item && (item.download_link).length > 10) {
      window.open(item.download_link, '_blank');
    } else {
      console.warn('Ссылка для скачивания не найдена для элемента:', item);
      alert('Ссылка для скачивания недоступна');
    }
  };


    const getAllActiveFilters = () => {
    const filterNames = {
      'DVS': 'ДВС',
      'KPP': 'КПП',
      'RK': 'РК',
      'hydrorasp': 'Гидрораспределитель',
      'K7': 'К7',
      'K5': 'К5'
    };

    const allActive = [...activeFilters, ...activeFilters2];
    return allActive.map(filter => filterNames[filter]).join(', ');
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
            Активные фильтры: {getAllActiveFilters()} 
          </div>
        )}
        
        
          <ul className='List'>
            {softwareItems.status ? (
              <li>
                <div
                  style={{
                    textAlign: 'center', 
                    color: '#666', 
                    padding: '20px'
                  }}>
                    <h4>Объектов нет</h4>
                    <p>Попробуйте изменить фильтры</p>
                </div>
              </li>) : (
              filteredItems.map((item) => ( 
                <li key={item.Tractor}>
                  <div className='objectmenu'>
                    <img className='object' src={Image} alt='Компонент' />
                    <div className='inform'>
                      <h4>№: {item.producer_version} от {new   Date(item.release_date).toLocaleDateString()}</h4>
                      <button 
                        className='download'
                        onClick={() => handleDownload(item)}
                        disabled={!item.type}
                      >
                        Скачать
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
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


export function TractorTable({ activeFiltersTrac, activeFiltersTrac2 }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Функция для подготовки данных запроса с учетом фильтров
  const getPostData = () => {
    const hasModelFilters = activeFiltersTrac && activeFiltersTrac.length > 0;
    const hasStatusFilters = activeFiltersTrac2 && activeFiltersTrac2.length > 0;

    const postData = {
      trac_model: [],
      status: [],
      dealer: ""
    };

    // Добавляем фильтры по моделям из чекбоксов
    if (hasModelFilters) {
      postData.trac_model = activeFiltersTrac;
    }
    if (hasStatusFilters) {
      postData.status = activeFiltersTrac2;
      
    }

    return postData;
  };

  useEffect(() => {
    const fetchTractors = async () => {
      const postData = getPostData();

      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/tractor-info/', {
          method: 'POST',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });

        console.log('Статус ответа:', response.status);

        const data = await response.json();
        console.log('Полученные данные:', data);

        if (data && data.status_code === 404) {
          console.log("404 - тракторы не найдены");
          setTractors([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Успешно получены данные тракторов:', data);

        if (Array.isArray(data)) {
          setTractors(data);
        } else if (data && typeof data === 'object') {
          setTractors([data]);
        } else {
          setTractors([]);
        }
        
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(`Ошибка подключения к серверу: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTractors();
  }, [activeFiltersTrac, activeFiltersTrac2]); 

  // Отладочная информация
  console.log('=== РЕНДЕР TractorTable ===');
  console.log('activeFiltersTrac:', activeFiltersTrac);
  console.log('tractors:', tractors);
  console.log('loading:', loading);



  if (loading) {
    return (
      <div className="loading">
        <div>Загрузка данных о тракторах...</div>
        <div>Активные фильтры: {activeFiltersTrac.join(', ')}</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error">
        <div>Ошибка: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="reload-button"
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  return (
    <div className="tractor-table-container">
      {/* Информация о фильтрах */}
      <div className="filter-info">
        {activeFiltersTrac.length > 0 && activeFiltersTrac2.length > 0 && (
          <div style={{marginBottom: '10px', color: '#666'}}>
            Активные фильтры: {activeFiltersTrac.join(', ')} {activeFiltersTrac2.join(',')}
          </div>
        )}
      </div>

      {tractors.length === 0 ? (
        <div className="no-data"> 
          Нет тракторов, соответствующих выбранным фильтрам
        </div>
      ) : (
        <>
          <div className="table-info">
            Показано {tractors.length} тракторов
            {` (фильтр: ${activeFiltersTrac.join(', ')})`}
          </div>
          <table className="tractor-table">
            <thead>
              <tr>
                <th>VIN</th>
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
              {tractors.map(tractor => (
                <tr key={tractor.id || tractor.vin}>
                  <td>{tractor.vin || tractor.VIN || '-'}</td>
                  <td>{tractor.model || '-'}</td>
                  <td>{formatDateTime(tractor.assembly_date || tractor.releaseDate)}</td>
                  <td>{tractor.region || '-'}</td>
                  <td>{tractor.oh_hour || tractor.motoHours || '-'}</td>
                  <td>{formatDateTime(tractor.last_activity || tractor.lastActivity)}</td>
                  <td>{tractor.dvs || tractor.DVS || '-'}</td>
                  <td>{tractor.kpp || tractor.KPP || '-'}</td>
                  <td>{tractor.rk || tractor.RK || '-'}</td>
                  <td>{tractor.bk || tractor.BK || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export function MainPart({activeButton, activeFilters, activeFilters2, selectedModel, selectedTractorModel, activeFiltersTrac, activeFiltersTrac2}) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects activeFilters={activeFilters} activeFilters2={activeFilters2} selectedModel={selectedModel}/>}
      {activeButton === 'tractor'&& <TractorTable activeFiltersTrac={activeFiltersTrac} activeFiltersTrac2={activeFiltersTrac2}/>}
    </div>
  )
}