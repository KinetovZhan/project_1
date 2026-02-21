import React, { useState,useRef, useEffect } from 'react';
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
      const tractors = await api.post('search/tractor-info',postData);
        
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
              if (type === 'dvs' || type === 'engine') enriched.dvs = c.comp_model;
              else if (type === 'kpp' || type === 'transmission') enriched.kpp = c.comp_model;
              else if (type === 'rk' || type === 'suspension') enriched.rk = c.comp_model;
              else if (type === 'bk') enriched.bk = c.comp_model;
              else if (type === 'gr' || type === 'hydraulics') enriched.gr = c.comp_model;
              else if (type === 'ap') enriched.ap = c.comp_model;
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
                <th>ГР</th>
                <th>Автопилот</th>
                <th>Дилер</th>
              </tr> 
            </thead>
            <tbody>
              {[...tractors]
                .sort((a, b) => {
                  const vinA = (a.vin || a.VIN || '').toString();
                  const vinB = (b.vin || b.VIN || '').toString();
                  return vinA.localeCompare(vinB, undefined, { numeric: true, sensitivity: 'base' });
                }).filter(tractor => tractor.vin !== 'TEMPLATE_SOFTWARE_ASSIGNMENT')
                .map((tractor, index) => (
                <tr 
                  key={tractor.id || tractor.vin || index}
                  onClick={() => handleRowClick(tractor)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                  
                >
                  <td   title={tractor.vin || tractor.VIN || '-'}
  className="tractor-cell">{tractor.vin || tractor.VIN || '-'}</td>
                  <td>{tractor.model || '-'}</td>
                  <td>{formatDateTime(tractor.assembly_date || tractor.releaseDate)}</td>
                  <td>{tractor.region || '-'}</td>
                  <td>{tractor.oh_hour || tractor.motoHours || '-'}</td>
                  <td>{formatDateTime(tractor.last_activity || tractor.lastActivity)}</td>
                  <td>{tractor.dvs || tractor.DVS || '-'}</td>
                  <td>{tractor.kpp || tractor.KPP || '-'}</td>
                  <td   title={tractor.rk || tractor.RK || '-'}
  className="tractor-cell">{tractor.rk || tractor.RK || '-'}</td>
                  <td>{tractor.bk || tractor.BK || '-'}</td>
                  <td>{tractor.gr || tractor.GR || '-'}</td>
                  <td>{tractor.ap || tractor.AP || '-'}</td> 
                  <td>{tractor.consumer || tractor.dealer || '-'}</td>                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>  );}