import React, { useState,useRef, useEffect, useMemo, useCallback } from 'react';
import {SearchBar} from "../SearchBar/SearchBar.jsx";
import {TractorDetails} from "../TractorDetails/TractorDetails.jsx";
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';





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
const groupTractors = (data) => {
  const grouped = {};

  data.forEach(item => {
    const vin = item.vin;
    if (!grouped[vin]) {
      // Копируем общие поля трактора (они одинаковы для всех записей с этим VIN)
      const { sw_name, componentParts_id, component_id, comp_model, component_type, ...common } = item;
      grouped[vin] = {
        ...common,
        dvs: '-',
        kpp: '-',
        rk: '-',
        bk: '-',
        gr: '-',
        autopilot: '-',
      };
    }
    const type = item.component_type;
    const model = item.comp_model || '-';

    if ((type === 'dvs')|| (type === 'engine')) {
      grouped[vin].dvs = model;
    } else if ((type === 'kpp')||(type === 'transmission')) {
      grouped[vin].kpp = model;
    } else if ((type === 'rk')||(type === 'suspension')) {
      grouped[vin].rk = model;
    } else if (type === 'bk') {
      grouped[vin].bk = model;
    } else if ((type === 'gr')||(type === 'hydraulics')) {
      grouped[vin].gr = model;
    } else if (type === 'autopilot') {
      grouped[vin].ap = model;
    } 
  });
  console.log(grouped)
  return Object.values(grouped);
};
export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, dateFilter, activeMajMinButton, actualFilter=[],
  uzelFilter=[], onCloseTab }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTractor, setSelectedTractor] = useState(() => {
    const saved = sessionStorage.getItem('selectedTractor');
    return saved || null;
  });
  const [colorVin, setColorVin] = useState(null);
  const tableContainerRef = useRef(null);
  const { token, user } = useAuth();

    // Состояние для выбранных столбцов
  const [visibleColumns, setVisibleColumns] = useState({
    model: true,
    assembly_date: true,
    region: true,
    consumer: true,
    oh_hour: true,
    last_activity: true
  });

    // Сохраняем в sessionStorage при изменении selectedTractor
  useEffect(() => {
    if (selectedTractor) {
      sessionStorage.setItem('selectedTractor', selectedTractor);
    } else {
      sessionStorage.removeItem('selectedTractor');
    }
  }, [selectedTractor]);

    // Загружаем сохраненные настройки столбцов
  useEffect(() => {
    const saved = localStorage.getItem('visibleColumns');
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка загрузки настроек столбцов:', e);
      }
    }
  }, []);

    // Сохраняем выбранные столбцы в localStorage (с проверкой на первый рендер)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Сохраняем выбранные столбцы в localStorage
  useEffect(() => {
    if (isInitialLoad){
      setIsInitialLoad(false);
      return;
    }
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const userRole = user?.role || 'user';


  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null 
  });

  const columnsConfig = {
    vin: { label: 'VIN', getValue: (t) => t.vin || t.VIN || '-', isBase: true },
    model: { label: 'Модель', getValue: (t) => t.model || '-', isBase: true },
    assembly_date: { label: 'Дата выпуска', getValue: (t) => formatDateTime(t.assembly_date || t.releaseDate), isBase: true },
    region: { label: 'Регион', getValue: (t) => t.region || '-', isBase: true },
    consumer: { label: 'Дилер', getValue: (t) => t.dealer || '-', isBase: true },
    oh_hour: { label: 'Моточасы', getValue: (t) => t.oh_hour || t.motoHours || '-', isBase: true },
    last_activity: { label: 'Последняя активность', getValue: (t) => formatDateTime(t.last_activity || t.lastActivity), isBase: true },
    dvs: { label: 'ДВС', getValue: (t) => t.dvs || '-', getStatus: (t) => t.dvs_status, isNode: true },
    kpp: { label: 'КПП', getValue: (t) => t.kpp || '-', getStatus: (t) => t.kpp_status, isNode: true },
    rk: { label: 'РК', getValue: (t) => t.rk || '-', getStatus: (t) => t.rk_status, isNode: true },
    bk: { label: 'БК', getValue: (t) => t.bk || '-', getStatus: (t) => t.bk_status, isNode: true },
    gr: { label: 'ГР', getValue: (t) => t.gr || '-', getStatus: (t) => t.gr_status, isNode: true },
    autopilot: { label: 'Автопилот', getValue: (t) => t.autopilot || '-', getStatus: (t) => t.autopilot_status, isNode: true },
  };

  const allNodes = ['dvs', 'kpp', 'rk', 'bk', 'gr', 'autopilot'];
  // Порядок столбцов с учётом выбранных узлов и видимости
  const orderedColumns = useMemo(() => {
    const baseColumns = ['vin', 'model', 'assembly_date', 'region', 'consumer', 'oh_hour', 'last_activity'];
    const selectedNodes = uzelFilter || []; // массив строк, например ['dvs', 'kpp']
    const otherNodes = allNodes.filter(node => !selectedNodes.includes(node));
    // Все возможные столбцы в правильном порядке
    const allPossibleColumns = [...baseColumns, ...selectedNodes, ...otherNodes];

    // Фильтруем столбцы по видимости
    return allPossibleColumns.filter(colKey => {
      const col = columnsConfig[colKey];
      // Всегда показываем VIN и узлы
      if (col.alwaysShow) return true;
      // Для остальных проверяем состояние видимости
      return visibleColumns[colKey] !== false;
    });
  }, [uzelFilter, visibleColumns]);

  // Функция для переключения видимости столбца
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };
  


  const getPostData = () => {

    const postData = {
      trac_model: activeFiltersTrac || [],
      status: activeFiltersTrac2 || [],
      date_assemle: null,
      date_start: null,
      date_end: null,
      is_actual: null,
      is_critical:null,
      is_archive:null,
      query: searchQuery?.trim() || "",
      dealer: searchDealer?.trim() || "" 
    };

    if (dateFilter) {
        const { date_assemle, date_start, date_end } = dateFilter;
        
        if (date_assemle) {
            // Одна конкретная дата
            postData.date_assemle = date_assemle;
            console.log('Поиск по одной дате:', date_assemle);
        } else if (date_start || date_end) {
            // Диапазон дат
            postData.date_start = date_start || null;
            postData.date_end = date_end || null;
            console.log('Поиск по диапазону:', date_start, 'до', date_end);
        }
    }

    if (activeMajMinButton === 'MAJ') {
      postData.is_actual = true;
    } else if (activeMajMinButton === 'MIN') {
      postData.is_actual = false;
    } 

    console.log('Отправляемые данные на бэкенд:', postData);
    console.log('activeMajMinButton:', activeMajMinButton);
    console.log('postData.is_actual:', postData.is_actual);
    console.log('postData.is_actual:', postData.consumer);

    return postData;
  };

  console.log('actualFilter:', actualFilter);
console.log('uzelFilter:', uzelFilter);
console.log('Первый трактор:', tractors[0]);

  useEffect(() => {
  const fetchTractors = async () => {

    console.log('DEBUG: userRole =', userRole);
    console.log('DEBUG: user =', user); 

    if (!token) {
      setError("Пользователь не авторизован");
      setLoading(false);
      return;
    }

    const postData = getPostData();

    try {
      setLoading(true);

      // 1. Получаем тракторы
      let tractors = await api.post('search/tractor-info',postData);
        
      console.log(`dfsdfdasfdasvasdv ${userRole}`)

      if (userRole === 'dealer') {
        tractors = tractors.filter(tractor => {
          // Проверяем разные поля, где может быть информация о дилере
          const tractorConsumer = tractor.consumer || tractor.dealer || '';
          const userName = user?.sub || user?.name || user?.username || '';
          
          console.log (`dsfasdadfd ${tractorConsumer}`)
          // Ищем совпадение по имени пользователя или ID
          return tractorConsumer.toLowerCase().includes(userName.toLowerCase())
        });
        console.log(`Для дилера ${user?.username || user?.sub} отфильтровано ${tractors.length} тракторов`);
      }

      // 2. Если есть тракторы — получаем компоненты
      let enrichedTractors = tractors;
      if (tractors.length > 0) {
        const vins = tractors.map(t => t.vin);
        const components = await api.post('search/tractor-components', {vins});
          const vinToComponents = {};
          components.forEach(c => {
  if (!c.vin) {
    console.warn('Компонент без VIN:', c);
    return;
  }
  if (!c.component_type) {
    console.warn(`Компонент для VIN ${c.vin} не имеет типа:`, c);
  }

   let status;
            if (c.is_critical) {
              status = 'critical';
            } else if (c.is_actual) {
              status = 'actual';
            } else {
              status = 'oldy';
            }

  if (!vinToComponents[c.vin]) vinToComponents[c.vin] = [];
  vinToComponents[c.vin].push({
    type: c.component_type || 'unknown',
    model: c.comp_model || '-',
    status: status 
  });
});
console.log('vinToComponents:', vinToComponents); // отладка

// Маппинг типов компонентов на поля в таблице
const typeToField = {
  // Русские названия
  'dvs': 'dvs',
  'kpp': 'kpp',
  'bk': 'bk',

  'rk': 'rk',
  'hr': 'gr',
  'autopilot': 'autopilot'
  // Добавьте другие варианты по необходимости
};
          enrichedTractors = tractors.map(t => {
  if (!t.vin) {
    console.warn('Трактор без VIN:', t);
    return t;
  }
  const comps = vinToComponents[t.vin] || [];
  const enriched = { ...t };
  comps.forEach(c => {
    if (!c.type || c.type === 'unknown') {
      console.warn(`Пропуск компонента с неизвестным типом для VIN ${t.vin}:`, c);
      return;
    }
    const type = c.type.toLowerCase();
    const field = typeToField[type];
    if (field) {
      enriched[field] = c.model;
      enriched[`${field}_status`] = c.status;
      enriched[`${field}_is_actual`] = c.is_actual;   // <-- добавляем
enriched[`${field}_is_critical`] = c.is_critical; // <-- добавляем

      // Добавляем поле path, если оно существует в компоненте
      if (c.hasOwnProperty('path')) {
        enriched[`${field}_path`] = c.path || '';
      } else {
        // По умолчанию пустая строка, если поле path отсутствует
        enriched[`${field}_path`] = '';
      }
    } else {
      console.warn(`Неизвестный тип компонента: ${c.type} для VIN ${t.vin}`);
    }
  });
  return enriched;
});
      }
      setTractors(enrichedTractors);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(`Ошибка подключения к серверу: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchTractors();
}, [activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, dateFilter, activeMajMinButton, token, userRole, user]);



  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      // Если кликнули по тому же столбцу
      if (prevConfig.key === key) {
        // Цикл: asc -> desc -> null
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return { key: null, direction: null }; // сброс сортировки
        }
      }
      // Если кликнули по новому столбцу - сортируем по возрастанию
      return { key, direction: 'asc' };
    });
  };


  const getCellValue = (tractor, key) => {
    let value = tractor[key];
    
    // Для моточасов - преобразуем в число для правильной сортировки
    if (key === 'oh_hour' || key === 'motoHours') {
      // Если значение отсутствует, возвращаем -1 для сортировки (пустые значения в конец)
      if (value === undefined || value === null || value === '-') {
        return -1;
      }
      // Пробуем преобразовать в число
      const numValue = parseFloat(value);
      return isNaN(numValue) ? -1 : numValue;
    }
    
    // Для дат преобразуем в timestamp для правильной сортировки
    if (key === 'assembly_date' || key === 'releaseDate' || key === 'last_activity' || key === 'lastActivity') {
      if (value) {
        const timestamp = new Date(value).getTime();
        return isNaN(timestamp) ? value : timestamp;
      }
      return value || '-';
    }
    
    // Для остальных полей возвращаем значение или '-'
    return value || '-';
  };

  const safeActualFilter = actualFilter || [];
const safeUzelFilter = uzelFilter || [];

const isOnlyOldyMode = safeActualFilter.length === 1 && safeActualFilter[0] === 'oldy';
const isOldyCritMode = safeActualFilter.length === 2 && safeActualFilter[0] === 'oldy'||safeActualFilter[0] === 'actual'&& safeActualFilter[1] === 'actual'||safeActualFilter[1] === 'oldy';

const shouldHighlight = useCallback((tractor, componentType) => {

   if (safeUzelFilter.length > 0 && !safeUzelFilter.includes(componentType)) {
    return false;
  }
  // Получаем статус и флаг is_actual для данного компонента
  const status = tractor[`${componentType}_status`];

  // Если статус не определён (нет компонента), не подсвечиваем
  if (!status) return false;

  // 2. Если фильтр по статусам пуст — подсвечиваем все ячейки с любым статусом
  if (safeActualFilter.length === 0) return true;
   if (isOnlyOldyMode) {
    return status==='critical'||status==='oldy'
  }

  if (isOldyCritMode) {
    return status
  }

  // 3. Иначе подсвечиваем только те, чей статус есть в actualFilter
  return safeActualFilter.includes(status);
  

  // // Применяем фильтр по узлам
  // if (safeUzelFilter.length > 0 && !safeUzelFilter.includes(componentType)) return false;

  

  // Обычная логика: подсвечиваем, если статус есть в actualFilter
  // return safeActualFilter.includes(status);
});

const getStatusColorClass = (status) => {
  // if (isOnlyOldyMode && status === 'critical') {
  //   return 'cell-oldy'; // жёлтый
  // }
  switch (status) {
    case 'critical': return 'cell-critical';
    case 'actual': return 'cell-actual';
    case 'oldy': return 'cell-oldy';
    default: return '';
  }
};

  // Функция для определения стиля текста в зависимости от значения поля path
  const getTextStyle = (tractor, colKey) => {
    // Определяем, является ли столбец одним из компонентов ПО
    const nodeFields = ['dvs', 'kpp', 'rk', 'bk', 'gr', 'autopilot'];
    
    if (nodeFields.includes(colKey)) {
      // Используем поле path, связанное с конкретным компонентом
      const pathField = `${colKey}_path`; // Например, dvs_path, kpp_path и т.д.
      const pathValue = tractor[pathField];
      
      // Применяем стиль в зависимости от значения path
      return {
        color: pathValue === '' || pathValue === null || pathValue === undefined ? 'gray' : 'black'
      };
    }
    
    // Для других столбцов не применяем специальное форматирование
    return {};
  };


  // Отсортированные тракторы с использованием useMemo
  const sortedTractors = useMemo(() => {
    let sortableTractors = [...tractors].filter(tractor => tractor.vin !== 'TEMPLATE_SOFTWARE_ASSIGNMENT');
    
    if (sortConfig.key && sortConfig.direction) {
      sortableTractors.sort((a, b) => {
        // Получаем значения для сравнения
        let aValue = getCellValue(a, sortConfig.key);
        let bValue = getCellValue(b, sortConfig.key);
        
        // Приводим к строке для сравнения, если это не число
        if (typeof aValue !== 'number' || typeof bValue !== 'number') {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }
        
        // Сравниваем значения
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Если сортировка сброшена, сортируем по VIN (как было изначально)
      sortableTractors.sort((a, b) => {
        const vinA = (a.vin || a.VIN || '').toString();
        const vinB = (b.vin || b.VIN || '').toString();
        return vinA.localeCompare(vinB, undefined, { numeric: true, sensitivity: 'base' });
      });
    }
    
    return sortableTractors;
  }, [tractors, sortConfig]);
  const filteredOnStatusTractors = useMemo(() => {
    if (safeActualFilter.length === 0 && safeUzelFilter.length===0) {
      return sortedTractors;
    }
    return sortedTractors.filter(tractor => {
      const types = ['dvs', 'kpp', 'rk', 'bk', 'gr', 'autopilot'];
      for (let type of types) {
        if (shouldHighlight(tractor,type)) {
          return true;
        }
      }
      return false;
    });
  },[sortedTractors,actualFilter,uzelFilter,shouldHighlight]);



  // Функция для отображения иконки сортировки
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return ' ↕'; // Иконка для несортированного столбца
    }
    if (sortConfig.direction === 'asc') {
      return ' ↑'; // Иконка для сортировки по возрастанию
    }
    if (sortConfig.direction === 'desc') {
      return ' ↓'; // Иконка для сортировки по убыванию
    }
    return ' ↕';
  }


  const handleColorClick = (tractor) => {
    if (colorVin === tractor.vin) {
      setColorVin(null);
    } else {
      setColorVin(tractor.vin)
    }
  };
   const handleRowClick = (tractor) => {
    console.log('Клик по трактору:', tractor.vin);
    setSelectedTractor(tractor.vin);
  };


  if (selectedTractor) {
    return <TractorDetails vin={selectedTractor} onBack={() => setSelectedTractor(null)} />;
  }

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

    // Список столбцов, которые можно скрыть
  const hideableColumns = [
    { key: 'model', label: 'Модель' },
    { key: 'assembly_date', label: 'Дата выпуска' },
    { key: 'region', label: 'Регион' },
    { key: 'consumer', label: 'Дилер' },
    { key: 'oh_hour', label: 'Моточасы' },
    { key: 'last_activity', label: 'Последняя активность' }
  ];

  return (
    <>
          <div className="columns-selector" >
        {hideableColumns.map(col => (
          <label key={col.key} style={{ 
            display: 'flex',  
            cursor: 'pointer',
            fontSize: '16px',
            color: 'black',
          }}>
            <input
              type="checkbox"
              checked={visibleColumns[col.key] !== false}
              onChange={() => toggleColumnVisibility(col.key)}
              style={{ cursor: 'pointer' }}
            />
            {col.label}
          </label>
        ))}
      </div>

    <div className="tractor-table-container" >
        <button onClick={onCloseTab} className="go-back" style={{top: '-40px'}}></button>
        <div className="scroll-bar">
          <table className="tractor-table">
            <thead>
              <tr>
                {orderedColumns.map(colKey => (
                <th
                  key={colKey}
                  onClick={() => handleSort(colKey)}
                  style={{ cursor: 'pointer' }}
                >
                  {columnsConfig[colKey].label}{getSortIcon(colKey)}
                </th>
              ))}
              </tr> 
            </thead>
            <tbody>
              {filteredOnStatusTractors.map((tractor, index) => (
                <tr 
                  key={tractor.id || tractor.vin || index}
                  onClick={() => handleColorClick(tractor)}
                  onDoubleClick={() => handleRowClick(tractor)}
                  style={{ cursor: 'pointer' }}
                  className={colorVin === tractor.vin ? "colored-row" : "clickable-row"}

                >
                {orderedColumns.map(colKey => {
                  const col = columnsConfig[colKey];
                  const value = col.getValue(tractor);
                  
                  if (col.isNode) {
                    const status = col.getStatus(tractor);
                    const className = shouldHighlight(tractor, colKey) ? getStatusColorClass(status) : '';
                    
                    // Применяем стиль цвета текста в зависимости от значения поля path
                    const textStyle = getTextStyle(tractor, colKey);
                    
                    return <td key={colKey} className={className} style={textStyle}>{value}</td>;
                  }
                  
                  // Применяем стиль цвета текста в зависимости от значения поля path
                  const textStyle = getTextStyle(tractor, colKey);
                  
                  return <td key={colKey} style={textStyle}>{value}</td>;
                })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  </>  );}