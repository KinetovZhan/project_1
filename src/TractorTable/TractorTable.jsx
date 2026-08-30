import React, { useState,useRef, useEffect, useMemo, useCallback } from 'react';
import {SearchBar} from "../SearchBar/SearchBar.jsx";
import {TractorDetails} from "../TractorDetails/TractorDetails.jsx";
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';
import { AddPoForm } from '../AddPo/AddPo.jsx';


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
  uzelFilter=[], onCloseTab, showAlert }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTractor, setSelectedTractor] = useState(() => {
    const saved = sessionStorage.getItem('selectedTractor');
    return saved || null;
  });
  const [colorVin, setColorVin] = useState(null);
  const [showAddPoForm, setShowAddPoForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const tableContainerRef = useRef(null);
  const { token, user } = useAuth();

    // Состояние для выбранных столбцов
  const [visibleColumns, setVisibleColumns] = useState({
    model: true,
    assembly_date: true,
    region: true,
    dealer: true,
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
    vin: { 
      label: 'VIN', 
      getValue: (t) => t.vin || t.VIN || '-', 
      isBase: true 
    },
    model: { 
      label: 'Модель', 
      getValue: (t) => t.model || '-', 
      isBase: true 
    },
    assembly_date: { 
      label: 'Дата выпуска', 
      getValue: (t) => formatDateTime(t.assembly_date || t.releaseDate), 
      isBase: true 
    },
    // region: { 
    //   label: 'Регион', 
    //   getValue: (t) => t.region || '-', 
    //   isBase: true 
    // },
    dealer: { 
      label: 'Дилер', 
      getValue: (t) => t.dealer || '-', 
      isBase: true 
    },
    oh_hour: { 
      label: 'Моточасы', 
      getValue: (t) => t.oh_hour || t.motoHours || '-', 
      isBase: true 
    },
    last_activity: { 
      label: 'Последняя активность', 
      getValue: (t) => formatDateTime(t.last_activity || t.lastActivity), 
      isBase: true 
    },
    dvs: { 
      label: 'ДВС', 
      getValue: (t) => {
        const softwareName = t.dvs_software_name;
        if (softwareName && softwareName !== '-') {
          const version =  softwareName;
          return version;
        }
        return '-';
      }, 
      getStatus: (t) => t.dvs_status, 
      isNode: true 
    },
    kpp: { 
      label: 'КПП', 
      getValue: (t) => {
        const softwareName = t.kpp_software_name;
        if (softwareName && softwareName !== '-') {
          const version =  softwareName;
          return version;
        }
        return '-';
      }, 
      getStatus: (t) => t.kpp_status, 
      isNode: true 
    },
    rk: { 
      label: 'РК', 
      getValue: (t) => {
        const softwareName = t.rk_software_name;
        if (softwareName && softwareName !== '-') {
          const version = softwareName;
          return version;
        }
        return '-';
      }, 
      getStatus: (t) => t.rk_status, 
      isNode: true 
    },
    bk: { 
      label: 'БК', 
      getValue: (t) => {
        const softwareName = t.bk_software_name;
        if (softwareName && softwareName !== '-') {
          const version = softwareName;
          return version;
        }
        return '-';
      }, 
      getStatus: (t) => t.bk_status, 
      isNode: true 
    },
    gr: { 
      label: 'ГР', 
      getValue: (t) => {
        const softwareName = t.gr_software_name;
        if (softwareName && softwareName !== '-') {
          const version = softwareName;
          return version;
        }
        return '-';
      }, 
      getStatus: (t) => t.gr_status, 
      isNode: true 
    },
    autopilot: { 
      label: 'Автопилот', 
      getValue: (t) => {
        const softwareName = t.autopilot_software_name;
        if (softwareName && softwareName !== '-') {
          const version = softwareName;
          return version;
        }
        return '-';
      }, 
      getStatus: (t) => t.autopilot_status, 
      isNode: true 
    },
  };

  const allNodes = ['dvs', 'kpp', 'rk', 'bk', 'gr', 'autopilot'];
  // Порядок столбцов с учётом выбранных узлов и видимости
  const orderedColumns = useMemo(() => {
    const baseColumns = ['vin', 'model', 'assembly_date', 'dealer', 'oh_hour', 'last_activity'];
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
    console.log('postData.is_actual:', postData.dealer);

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
      showAlert("Пользователь не авторизован");
      setError("Пользователь не авторизован");
      setLoading(false);
      return;
    }

    const postData = getPostData();

    try {
      setLoading(true);

      // 1. Получаем тракторы
      let tractors = await api.post('search/tractor-info', postData);
        
      // if (userRole === 'dealer') {
      //   tractors = tractors.filter(tractor => {
      //     const tractorConsumer = tractor.dealer || '';
      //     const userName = user?.sub || user?.name || user?.username || '';
      //     return tractorConsumer.toLowerCase() === userName.toLowerCase();
      //   });
      //   console.log(`Для дилера ${user?.username || user?.sub} отфильтровано ${tractors.length} тракторов`);
      // }

      // 2. Получаем компоненты (НОВЫЙ ФОРМАТ ОТВЕТА)
      let enrichedTractors = tractors;
      if (tractors.length > 0) {
        const vins = tractors.map(t => t.vin);
        const componentsResponse = await api.post('search/tractor-components', {vins});
        
        // 🔄 Новый формат: [{vin, components: []}]
        const vinToComponents = {};
        
        componentsResponse.forEach(item => {
          if (!item.vin) {
            console.warn('Элемент без VIN:', item);
            return;
          }
          
          const vin = item.vin;
          if (!vinToComponents[vin]) {
            vinToComponents[vin] = [];
          }
          
          // Обрабатываем вложенный массив компонентов
          if (Array.isArray(item.components)) {
            item.components.forEach(c => {
              if (!c.component_type) {
                console.warn(`Компонент для VIN ${vin} не имеет типа:`, c);
                return;
              }
              
              // Определяем статус
              let status;
              if (c.is_critical) {
                status = 'critical';
              } else if (c.is_actual) {
                status = 'actual';
              } else {
                status = 'oldy';
              }
              
              vinToComponents[vin].push({
                type: c.component_type.toLowerCase(), // приводим к нижнему регистру
                model: c.comp_model || '-',
                status: status,
                is_actual: c.is_actual,
                is_critical: c.is_critical,
                path: c.software_path || '',
                name: c.software_name || '-'
              });
            });
          }
        });
        
        console.log('vinToComponents:', vinToComponents);
        
        // Маппинг типов (поддерживаем оба регистра)
        const typeToField = {
          'dvs': 'dvs', 'engine': 'dvs',
          'kpp': 'kpp', 'transmission': 'kpp',
          'rk': 'rk', 'suspension': 'rk',
          'bk': 'bk',
          'gr': 'gr', 'hydraulics': 'gr', 'hr': 'gr',
          'autopilot': 'autopilot'
        };
        
        enrichedTractors = tractors.map(t => {
          if (!t.vin) {
            console.warn('Трактор без VIN:', t);
            return t;
          }
          
          const comps = vinToComponents[t.vin] || [];
          const enriched = { ...t };
          
          // Инициализируем все поля компонентов со значениями по умолчанию
          ['dvs', 'kpp', 'rk', 'bk', 'gr', 'autopilot'].forEach(field => {
            enriched[field] = '-';
            enriched[`${field}_status`] = null;
            enriched[`${field}_is_actual`] = false;
            enriched[`${field}_is_critical`] = false;
            enriched[`${field}_path`] = '';
            enriched[`${field}_software_name`] = '-';
          });
          
          // Группируем компоненты по типу
          const groupedByType = {};
          comps.forEach(c => {
            const field = typeToField[c.type];
            if (!field) {
              console.warn(`Неизвестный тип компонента: ${c.type} для VIN ${t.vin}`);
              return;
            }
            if (!groupedByType[field]) groupedByType[field] = [];
            groupedByType[field].push(c);
          });
          
          // Выбираем приоритетный компонент для каждого типа: critical > actual > oldy
          Object.entries(groupedByType).forEach(([field, components]) => {
            const sorted = components.sort((a, b) => {
              if (a.is_critical && !b.is_critical) return -1;
              if (!a.is_critical && b.is_critical) return 1;
              if (a.is_actual && !b.is_actual) return -1;
              if (!a.is_actual && b.is_actual) return 1;
              return 0;
            });
            
            const selected = sorted[0];
            enriched[field] = selected.model;
            enriched[`${field}_status`] = selected.status;
            enriched[`${field}_is_actual`] = selected.is_actual;
            enriched[`${field}_is_critical`] = selected.is_critical;
            enriched[`${field}_path`] = selected.path || '';
            enriched[`${field}_software_name`] = selected.name || '-';
          });
          
          return enriched;
        });
      }
      setTractors(enrichedTractors);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showAlert('Ошибка подключния к серверу', 'error');
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

  // Цвета текста версий под статус ячейки (оформление)
  const statusTextColor = {
    'cell-critical': '#c2181e',
    'cell-actual': '#1f7a3d',
    'cell-oldy': '#a06a00'
  };

  // Функция для определения стиля текста в зависимости от значения поля path
  const getTextStyle = (tractor, colKey, statusClassName = '') => {
    const nodeFields = ['dvs', 'kpp', 'rk', 'bk', 'gr', 'autopilot'];

    if (nodeFields.includes(colKey)) {
      const pathField = `${colKey}_path`;
      const pathValue = tractor[pathField];

      // Нет файла ПО — серый текст (как и раньше)
      if (!pathValue || pathValue === '') {
        return { color: 'gray' };
      }

      // Есть файл — цвет по статусу подсвеченной ячейки
      return {
        color: statusTextColor[statusClassName] || 'black',
        // Опционально: можно добавить tooltip с путём
        // title: pathValue || undefined
      };
    }

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


  const handleSoftwareClick = useCallback((e, tractor, componentType) => {
    e.stopPropagation(); // 🔥 Важно: не триггерить клик по строке!
    
    const path = tractor[`${componentType}_path`];
    const softwareName = tractor[`${componentType}_software_name`];
    const model = tractor[componentType];
    
    console.log(`Click on ${componentType} software:`, { path, softwareName, model });
    
    // Если путь пустой — показываем форму создания ПО
    if ((softwareName && softwareName !== '' && softwareName !== '-')&&(!path || path === '' || path === '-')) {
      setSelectedComponent({
        type: componentType,
        model: model,
        tractor: tractor
      });
      setShowAddPoForm(true);
    }
  }, [])


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

  // Обработчик для возврата назад из формы добавления PO
  const handleAddPoBack = () => {
    setShowAddPoForm(false);
    setSelectedComponent(null);
  };

  // Обработчик после успешного добавления PO
  const handleAddPoSubmit = () => {
    setShowAddPoForm(false);
    setSelectedComponent(null);
    // Перезагружаем данные таблицы
    // fetchTractors(); // вызов повторного получения данных
  };

  if (showAddPoForm && selectedComponent) {
    return <AddPoForm onBack={handleAddPoBack} onSubmit={handleAddPoSubmit} />;
  }

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

  return (
    <>

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
                    const textStyle = getTextStyle(tractor, colKey, className);

                    return <td
                      key={colKey}
                      className={className} 
                      style={textStyle}
                      onClick={(e) => handleSoftwareClick(e, tractor, colKey)}
                    >{value}</td>;
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
  </>);
}