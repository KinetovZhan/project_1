import React, { useState,useRef, useEffect, useMemo } from 'react';
import {SearchBar} from "./SearchBar.jsx";
import {TractorDetails} from "./TractorDetails.jsx";
import { useAuth } from '../auth/AuthContext';
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
        ap: '-',
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
    } else if (type === 'ap') {
      grouped[vin].ap = model;
    } 
  });
  console.log(grouped)
  return Object.values(grouped);
};
export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, dateFilter, activeMajMinButton}) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTractor, setSelectedTractor] = useState(null);
  const tableContainerRef = useRef(null);
  const { token, user } = useAuth();


  const userRole = user?.role || 'user';


  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null 
  });


  const getPostData = () => {

    const postData = {
      trac_model: activeFiltersTrac || [],
      status: activeFiltersTrac2 || [],
      date_assemle: null,
      date_start: null,
      date_end: null,
      is_actual: null,
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

    return postData;
  };

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
            if (!vinToComponents[c.vin]) vinToComponents[c.vin] = [];
            vinToComponents[c.vin].push(c);
          });

          enrichedTractors = tractors.map(t => {
            const comps = vinToComponents[t.vin] || [];
            const enriched = { ...t };
            comps.forEach(c => {
              const type = c.component_type?.toLowerCase();
              if (type === 'двс' || type === 'engine') enriched.dvs = c.comp_model;
              else if (type === 'кпп' || type === 'transmission') enriched.kpp = c.comp_model;
              else if (type === 'рулевая колонка' || type === 'suspension') enriched.rk = c.comp_model;
              else if (type === 'бк') enriched.bk = c.comp_model;
              else if (type === 'гидрораспределитель' || type === 'hydraulics') enriched.gr = c.comp_model;
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

  return (
    <div className="tractor-table-container" >
        <div 
          className="scroll-bar" 
          
        >
          <table className="tractor-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('vin')} style={{ cursor: 'pointer' }}>
                  VIN{getSortIcon('vin')}
                </th>
                <th onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>
                  Модель{getSortIcon('model')}
                </th>
                <th onClick={() => handleSort('assembly_date')} style={{ cursor: 'pointer' }}>
                  Дата выпуска{getSortIcon('assembly_date')}
                </th>
                <th onClick={() => handleSort('region')} style={{ cursor: 'pointer' }}>
                  Регион{getSortIcon('region')}
                </th>
                <th onClick={() => handleSort('oh_hour')} style={{ cursor: 'pointer' }}>
                  Моточасы{getSortIcon('oh_hour')}
                </th>
                <th onClick={() => handleSort('last_activity')} style={{ cursor: 'pointer' }}>
                  Последняя активность{getSortIcon('last_activity')}
                </th>
                <th onClick={() => handleSort('dvs')} style={{ cursor: 'pointer' }}>
                  ДВС{getSortIcon('dvs')}
                </th>
                <th onClick={() => handleSort('kpp')} style={{ cursor: 'pointer' }}>
                  КПП{getSortIcon('kpp')}
                </th>
                <th onClick={() => handleSort('rk')} style={{ cursor: 'pointer' }}>
                  РК{getSortIcon('rk')}
                </th>
                <th onClick={() => handleSort('bk')} style={{ cursor: 'pointer' }}>
                  БК{getSortIcon('bk')}
                </th>
                <th onClick={() => handleSort('gr')} style={{ cursor: 'pointer' }}>
                  ГР{getSortIcon('gr')}
                </th>
                <th onClick={() => handleSort('consumer')} style={{ cursor: 'pointer' }}>
                  Дилер{getSortIcon('consumer')}
                </th>
              </tr> 
            </thead>
            <tbody>
              {sortedTractors.map((tractor, index) => (
                <tr 
                  key={tractor.id || tractor.vin || index}
                  onClick={() => handleRowClick(tractor)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td title={tractor.vin || tractor.VIN || '-'} className="tractor-cell">
                    {tractor.vin || tractor.VIN || '-'}
                  </td>
                  <td>{tractor.model || '-'}</td>
                  <td>{formatDateTime(tractor.assembly_date || tractor.releaseDate)}</td>
                  <td>{tractor.region || '-'}</td>
                  <td>{tractor.oh_hour || tractor.motoHours || '-'}</td>
                  <td>{formatDateTime(tractor.last_activity || tractor.lastActivity)}</td>
                  <td>{tractor.dvs || tractor.DVS || '-'}</td>
                  <td>{tractor.kpp || tractor.KPP || '-'}</td>
                  <td title={tractor.rk || tractor.RK || '-'} className="tractor-cell">
                    {tractor.rk || tractor.RK || '-'}
                  </td>
                  <td>{tractor.bk || tractor.BK || '-'}</td>
                  <td>{tractor.gr || tractor.GR || '-'}</td>
                  <td>{tractor.consumer || tractor.dealer || '-'}</td>                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>  );}