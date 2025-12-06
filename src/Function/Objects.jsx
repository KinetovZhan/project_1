import Image from '../img/Image.png';
import { useState, useEffect, useMemo } from 'react'; // ← добавьте useMemo

export function Objects({ activeFilters, activeFilters2, selectedModel, searchQuery }) {
  const [softwareItems, setSoftwareItems] = useState([]); // все данные по фильтрам
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);
      try {
        const FilterToTypeMap = { 'DVS': 'dvs', 'KPP': 'kpp', 'RK': 'rk', 'hydrorasp': 'hydro' };
        const FilterToTractor = { 'K7': 'K-7', 'K5': 'K-5' };

        const postData = {
          trac_model: activeFilters2.map(f => FilterToTractor[f] || f),
          type_comp: activeFilters.map(f => FilterToTypeMap[f] || f),
          model_comp: Array.isArray(selectedModel) ? selectedModel : []
        };

        const response = await fetch('http://localhost:8000/component-info', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const items = Array.isArray(data) ? data : (data ? [data] : []);
        setSoftwareItems(items);
      } catch (err) {
        console.error('Ошибка:', err);
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };


    fetchFilteredData();
  }, [activeFilters, activeFilters2, selectedModel]); 

  // --- 2. Фильтрация по поиску СРЕДИ УЖЕ ЗАГРУЖЕННЫХ данных ---
  const filteredItems = useMemo(() => {
    if (!searchQuery) return softwareItems;

    const query = searchQuery.trim().toLowerCase();
    return softwareItems.filter(item =>
      (item.producer_version && item.producer_version.toLowerCase().includes(query)) ||
      (item.type_component && item.type_component.toLowerCase().includes(query)) ||
      (item.model_component && item.model_component.toLowerCase().includes(query)) ||
      (item.comp_model && item.comp_model.toLowerCase().includes(query))
    );
  }, [softwareItems, searchQuery]);

  // --- Ваши функции (перенесены в начало!) ---
  const getAllActiveFilters = () => {
    const filterNames = {
      'DVS': 'ДВС', 'KPP': 'КПП', 'RK': 'РК', 'hydrorasp': 'Гидрораспределитель',
      'K7': 'К-7', 'K5': 'К-5'
    };
    return [...activeFilters, ...activeFilters2]
      .map(f => filterNames[f])
      .filter(Boolean)
      .join(', ');
  };

  const getComponentName = () => {
    const filterNames = { 'DVS': 'ДВС', 'KPP': 'КПП', 'RK': 'РК', 'hydrorasp': 'Гидрораспределитель' };
    if (activeFilters.length > 0) {
      return activeFilters
        .map(f => filterNames[f])
        .filter(Boolean)
        .join(', ') || 'компонентов';
    }
    return softwareItems[0]?.type_component || 'компонентов';
  };

  const handleDownload = (item) => {
    const url = item?.download_link?.trim();
    if (!url) {
      alert('Файл недоступен');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Рендер ---
  if (loading) {
    return (
      <div className='maininfo'>
        <h3>Последние версии ПО для {getComponentName()}</h3>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='maininfo'>
        <h3>Ошибка</h3>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className='maininfo'>
      <h3>Последние версии ПО для {getComponentName()}</h3>
      <div>
        <h4>Компоненты ({filteredItems.length})</h4>
        {activeFilters.length > 0 && (
          <div style={{ marginBottom: '10px', color: '#666' }}>
            Активные фильтры: {getAllActiveFilters()}
          </div>
        )}
        <ul className='List'>
          {filteredItems.length === 0 ? (
            <li>
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <h4>Ничего не найдено</h4>
                <p>Попробуйте изменить фильтры или запрос</p>
              </div>
            </li>
          ) : (
            filteredItems.map((item, index) => (
              <li key={item.id_Firmwares || item.id || `comp-${index}`}>
                <div className='objectmenu'>
                  <img className='object' src={Image} alt='Компонент' />
                  <div className='inform'>
                    <h4 className='poster'>
                      №: {item.producer_version} от {new Date(item.release_date).toLocaleDateString()}
                    </h4>
                    <h5 className='textunder'>
                      Для компонента {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}
                    </h5>
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
            ))
          )}
        </ul>
      </div>
    </div>
  );
}