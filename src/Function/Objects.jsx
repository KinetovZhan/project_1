import Image from '../img/Image.png'
import { useState, useEffect } from 'react';


export function Objects({activeFilters, activeFilters2, selectedModel, searchQuery}) {
  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);


  const getPostData = () => {

    const hasComponentFilters = activeFilters.length > 0;
    const hasTractorFilter = activeFilters2.length > 0;
    const hasSelectedModel = selectedModel && selectedModel.length > 0;
    
    const FilterToTypeMap = {
      'DVS': 'dvs',
      'KPP': 'kpp', 
      'RK': 'rk',
      'hydrorasp': 'hydro'
    };

    const FilterToTractor = {
      'K7': 'K-7'||'K7',
      'K5': 'K-5'
    };


    const postData = {
      trac_model: [],
      type_comp: [],
      model_comp: []
    };


    if (searchQuery && searchQuery.trim() !== '') {
      return { filters: searchQuery.trim() };
    }

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

  const handleDownload = (item) => {
  const url = item?.download_link?.trim();
  if (!url) {
    alert('Файл недоступен');
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = ''; // или имя файла
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};


useEffect(() => {
  const fetchSoftware = async () => {
    setLoading(true);
    try {
      console.log('Начало загрузки данных...');

      const postData = getPostData();  
      let response;
      let downloadResponse;
      let data;
      let downloadData;

      if (searchQuery && searchQuery.trim() !== '') {
        const searchParams = new URLSearchParams({
          query: searchQuery.trim()
        });

              
        response = await fetch(`http://localhost:8000/search-component?${searchParams}`, {
          method: 'GET',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });

      } else {
        response = await fetch('http://localhost:8000/component-info', {
          method: 'POST',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });
      } 
        data = await response.json();



      downloadResponse = await fetch(`http://localhost:8000/software/download?${data.id_Firmwares}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      downloadData = await downloadResponse.json();

      if (data && data.status_code === 404) {
        console.log("404 - ничего не найдено");
        setSoftwareItems([]);
        setFilteredItems([]);
        alert("По вашим фильтрам ничего не нашлось");
        return;
      }

      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Данные компонента:', data);

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
}, [activeFilters, activeFilters2, selectedModel, searchQuery]);





    const getAllActiveFilters = () => {
    const filterNames = {
      'DVS': 'ДВС',
      'KPP': 'КПП',
      'RK': 'РК',
      'hydrorasp': 'Гидрораспределитель',
      'K7': 'К-7',
      'K5': 'К-5'
    };

    const allActive = [...activeFilters, ...activeFilters2];
    return allActive.map(filter => filterNames[filter]).join(', ');
  };


  const getComponentName = () => {
  const filterNames = {
    'DVS': 'ДВС',
    'KPP': 'КПП', 
    'RK': 'РК',
    'hydrorasp': 'Гидрораспределитель'
  };
  
  // Если есть активные фильтры, показываем все выбранные
  if (activeFilters.length > 0) {
    const selectedNames = activeFilters.map(filter => filterNames[filter]).filter(Boolean);
    return selectedNames.length > 0 ? selectedNames.join(', ') : 'компонентов';
  }
  
  // Если нет фильтров, показываем из данных или по умолчанию
  return softwareItems[0]?.type_comp || 'компонентов';
};


  if (loading) {
    return (
      <div className='maininfo'>
        <h3>Последние версии ПО для {getComponentName()}</h3>
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
      <h3>Последние версии ПО для {getComponentName()}</h3>
      
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
              filteredItems.map((item, index) => ( 
                <li key={item.id_Firmwares || item.id || `component-${index}`}>
                  <div className='objectmenu'>
                    <img className='object' src={Image} alt='Компонент' />
                    <div className='inform'>
                      <h4 className='poster'>№: {item.producer_version} от {new   Date(item.release_date).toLocaleDateString()}</h4>
                      <h5 className='textunder'>Для компонента {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}</h5>
                      <button 
                        className='download'
                        onClick={() => handleDownload(item)}
                        disabled={!item.download_link || item.download_link.trim() === ''}
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