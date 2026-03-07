import { PoDetails } from '../PoDetails/PoDetails.jsx';
import DefaultImage from '../img/default.jpg';
import KPPImage from '../img/КПП.png';
import RKImage from '../img/РК.png';
import HRImage from '../img/Гидрораспределитель.png';
import APImage from '../img/Автопилот.png';
import WeiImage from '../img/ДВС Weichai.png';
import TMZImage from '../img/ДВС ТМЗ.png';
import JMZImage from '../img/ДВС ЯМЗ.png';
import BKImage from '../img/БК дисплей контроллер.png';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../fetchAPI.js';

export function Objects({ activeFilters, activeFilters2, selectedModel, selectedProducers, searchQuery, selectedStatus }) {

  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const { token, user } = useAuth();
  const [selectedPo,setSelectedPo]=useState(null);
  // Состояние для тултипа
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    targetId:null
  });

  const hoverTimers = useRef({});
  const tooltipRef = useRef(null);

  const userRole = user?.role || 'user';

  console.log(`dfadsjgosajif ${userRole}`);

  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }
      if (userRole !== 'dealer') {
        try {
          const FilterToTypeMap = {
            DVS: ['dvs', 'engine'],
            KPP: ['kpp', 'transmission'],
            RK: ['suspension'],
            hydrorasp: ['hydraulics'],
          };
          const FilterToTractor = { K7: 'K-7', K5: 'K-5' };

          const postData = {
            trac_model: activeFilters2.map(f => FilterToTractor[f] || f),
            type_comp: activeFilters.flatMap(f => FilterToTypeMap[f] || f),
            name_component: Array.isArray(selectedModel) ? selectedModel : [],
            producers: Array.isArray(selectedProducers) ? selectedProducers : [],
            status: Array.isArray(selectedStatus) ? selectedStatus : []
          };


          const data = await api.post('search/component-info', postData);

          const items = Array.isArray(data) ? data : data ? [data] : [];
          setSoftwareItems(items);
        } catch (err) {
          console.error('Ошибка:', err);
          setError(`Ошибка: ${err.message}`);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [activeFilters, activeFilters2, selectedModel, selectedProducers, token, searchQuery, selectedStatus]); 

  const ImageToComponent = (type_component, name_component) => {
  // Приводим типы к нижнему регистру для единообразия
  const typeLower = type_component?.toLowerCase() || '';
  const modelLower =  name_component?.toLowerCase() || '';

  // Обработка КПП в первую очередь (и по типу, и по модели)
  if (typeLower.includes('кпп') || typeLower.includes('kpp') || 
      modelLower.includes('кпп') || modelLower.includes('kpp')) {
    return KPPImage;
  }

  // Обработка остальных компонентов по типу
  if (typeLower && typeLower !== 'двс') {
    const ImageByType = {
      'рулевая колонка': RKImage,
      'гидрораспределитель': HRImage,
      'бк': BKImage,
      'автопилот': APImage,
    };
    
    // Ищем соответствие по ключевым словам
    for (const [key, image] of Object.entries(ImageByType)) {
      if (typeLower.includes(key)) {
        return image;
      }
    }
  }

  // Обработка ДВС по модели
  if (typeLower === 'двс' && modelLower) {
    if (modelLower.includes('weichai')) {
      return WeiImage;
    }
    if (modelLower.includes('тмз') || modelLower.includes('tmz')) {
      return TMZImage;
    }
    if (modelLower.includes('ямз') || modelLower.includes('yamz') || modelLower.includes('ymz')) {
      return JMZImage;
    }
  }

  return DefaultImage;
};

  // Функция для получения имени файла из заголовков
  const getFilenameFromResponse = (response, defaultName) => {
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }

    return defaultName;
  };

  // Функция для определения расширения файла
  const ensureFileExtension = (filename, contentType) => {
    if (filename.match(/\.([a-zA-Z0-9]+)$/)) {
      return filename;
    }

    const extensionMap = {
      'application/octet-stream': '.bin',
      'application/zip': '.zip',
      'application/pdf': '.pdf',
      'application/x-binary': '.bin',
      'binary/octet-stream': '.bin',
      'application/json': '.json',
      'text/plain': '.txt',
    };

    const extension = extensionMap[contentType] || '.bin';
    return filename + extension;
  };

  const handleDownload = async (item) => {
    if (!item?.id_Firmwares) {
      alert('ID файла не указан');
      return;
    }

    if (!token) {
      alert('Требуется авторизация');
      return;
    }

    try {
      setDownloading(item.id_Firmwares);
      
      const response = await api.get(`firmware/download/${item.id_Firmwares}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type') || '';
      let filename = getFilenameFromResponse(response, `firmware_${item.id_Firmwares}`);
      filename = ensureFileExtension(filename, contentType);

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Файл пустой');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Ошибка при скачивании:', error);
      alert(`Ошибка при скачивании: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };

  // Обработчики для тултипа с задержкой 3 секунды
  const handleMouseEnter = (event, text, id) => {
    // Очищаем предыдущий таймер для этого элемента
    if (hoverTimers.current[id]) {
      clearTimeout(hoverTimers.current[id]);
      delete hoverTimers.current[id];
    }

    // Устанавливаем таймер на 3 секунды для показа тултипа
    hoverTimers.current[id] = setTimeout(() => {
      setTooltip({
        visible: true,
        text: text,
        x: event.clientX,
        y: event.clientY,
        targetId: id
      });
      delete hoverTimers.current[id];
    }, 250);
  };

  const handleMouseMove = (event) => {
    if (tooltip.visible && tooltip.targetId) {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY
      }));
    }
  };

  const handleMouseLeave = (id) => {
    // Очищаем таймер при уходе мыши
    if (hoverTimers.current[id]) {
      clearTimeout(hoverTimers.current[id]);
      delete hoverTimers.current[id];
    }

    // Скрываем тултип сразу при уходе мыши
    setTooltip({
      visible: false,
      text: '',
      x: 0,
      y: 0,
      targetId: null
    });
  };

  // Фильтрация по поиску СРЕДИ УЖЕ ЗАГРУЖЕННЫХ данных
  const filteredItems = useMemo(() => {
    if (!searchQuery) return softwareItems;

    const query = searchQuery.trim().toLowerCase();
    return softwareItems.filter(
      (item) =>
        (item.producer_version && item.producer_version.toLowerCase().includes(query)) ||
        (item.type_component && item.type_component.toLowerCase().includes(query)) ||
        (item. name_component && item. name_component.toLowerCase().includes(query)) ||
        (item.comp_model && item.comp_model.toLowerCase().includes(query))
    );
  }, [softwareItems, searchQuery]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Фильтрация по поиску и сортировка по дате
  const filteredAndSortedItems = useMemo(() => {
    // Сначала фильтруем по поиску
    let filtered = softwareItems;
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      filtered = softwareItems.filter(
        (item) =>
          (item.producer_version && item.producer_version.toLowerCase().includes(query)) ||
          (item.type_component && item.type_component.toLowerCase().includes(query)) ||
          (item. name_component &&  name_component.toLowerCase().includes(query)) ||
          (item.comp_model && item.comp_model.toLowerCase().includes(query))
      );
    }

    // Затем сортируем по дате
    return filtered.sort((a, b) => {
      const dateA = new Date(a.release_date).getTime();
      const dateB = new Date(b.release_date).getTime();
      
      if (sortOrder === 'desc') {
        return dateB - dateA; // Сначала новые
      } else {
        return dateA - dateB; // Сначала старые
      }
    });
  }, [softwareItems, searchQuery, sortOrder]);

  const getAllActiveFilters = () => {
    const filterNames = {
      DVS: 'ДВС',
      KPP: 'КПП',
      RK: 'РК',
      hydrorasp: 'Гидрораспределитель',
      AP: 'Автопилот',
      BK: 'БК',
      K7: 'К-7',
      K5: 'К-5',
    };
    return [...activeFilters, ...activeFilters2]
      .map((f) => filterNames[f])
      .filter(Boolean)
      .join(', ');
  };
  

  const getComponentName = () => {
    const filterNames = {
      '': 'всех компонентов',
      DVS: 'ДВС',
      KPP: 'КПП',
      RK: 'РК',
      hydrorasp: 'Гидрораспределитель',
      AP: 'Автопилот',
      BK: 'БК',
    };

    if (activeFilters.length > 0) {
      return (
        activeFilters
          .map((f) => filterNames[f])
          .filter(Boolean)
          .join(', ') || 'компонентов'
      );
    }

    // При отсутствии фильтров — показываем "Всех компонентов"
    return 'всех компонентов';
  };

  // --- Рендер ---
  if (loading) {
    return (
      <div className="maininfo">
        <h3>Последние версии ПО для {getComponentName()}</h3>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="maininfo">
        <h3>Ошибка</h3>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  const handlePoClick = (po) => {
    console.log('Клик по по:', po);
    const selectedItem = softwareItems.find(item => item.id_Firmwares === po);
    setSelectedPo(selectedItem);
  };

  if (selectedPo) {
      return <PoDetails po={selectedPo} onBack={() => setSelectedPo(null)} />;
    }

  

  return (
    <div className="maininfo">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Последние версии ПО для {getComponentName()}</h3>
        <button 
          onClick={toggleSortOrder}
          style={{
            padding: '8px 15px',
            backgroundColor: 'rgba(217, 217, 217, 1)',
            border: '1px solid #ddd',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px',
            width:'30%'
          }}
        >
          <span>Сортировка по дате</span>
          <span style={{ marginLeft: '5px', color: '#666', fontSize: '12px' }}>
            {sortOrder === 'desc' ? '(сначала новые)' : '(сначала старые)'}
          </span>
        </button>
        </div>
      <div>
        <h4>Компоненты ({filteredItems.filter((item) => item.id_Firmwares).length})</h4>
        {activeFilters.length > 0 && (
          <div style={{ marginBottom: '10px', color: '#666' }}>
            Активные фильтры: {getAllActiveFilters()}
          </div>
        )}
      </div>
      <div className="list-container">
        <ul className="List">
          {filteredItems.length === 0 ? (
            <li>
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <h4>Ничего не найдено</h4>
                <p>Попробуйте изменить фильтры или запрос</p>
              </div>
            </li>
          ) : (
            filteredItems
              .filter((item) => item.id_Firmwares)
              .map((item) => {
                // Формируем текст для тултипа
                const tooltipText = `${item.type_component || '—'}: ${item.name_component || item.comp_model || '—'}`;
                const tooltipText2 = `${item.producer_version} от ${new Date(item.release_date).toLocaleDateString()}`;
               return (
                <li key={item.id_Firmwares}>
                  <div className="objectmenu" data-testid="objectmenu">
                    <img
                      className="object"
                      src={ImageToComponent(item.type_component, item.model_component || item.comp_model)}
                      alt={item.type_component}
                      onClick={()=> handlePoClick(item.id_Firmwares)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="inform">
                      <h4 
                      className="poster"
                      onMouseEnter={(e) => handleMouseEnter(e, tooltipText2, item.id_Firmwares)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => handleMouseLeave(item.id_Firmwares)}>
                        {item.download_link} от {new Date(item.release_date).toLocaleDateString()}
                      </h4>
                      <div className="infodisc">
                        <h5
                          className="textunder"
                          onMouseEnter={(e) => handleMouseEnter(e, tooltipText, item.id_Firmwares)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={() => handleMouseLeave(item.id_Firmwares)}
                        >
                          Для компонента {item.type_component || '—'}: {item.model_component || item.name_component }
                          {item.part_type ? ` (${item.part_type})` : ' (—)'}
                        </h5>
                      </div>
                      <button
                        className="download"
                        onClick={() => handleDownload(item)}
                        disabled={!item.id_Firmwares || downloading === item.id_Firmwares}
                      >
                        Скачать
                      </button>
                    </div>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </div>
       {tooltip.visible && (
        <div 
          className="popup-window"
          style={{
            position: 'fixed',
            left: tooltip.x + 15,
            top: tooltip.y + 15,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
    