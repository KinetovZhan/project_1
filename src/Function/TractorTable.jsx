import React, { useState,useRef, useEffect } from 'react';
import {SearchBar} from "./SearchBar.jsx";
import {TractorDetails} from "./TractorDetails.jsx";
import { useAuth } from '../auth/AuthContext';


import {ip} from "../shrineofvsakoe/ip.jsx";


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
  const { token } = useAuth();
  const getPostData = () => {

    const postData = {
      trac_model: activeFiltersTrac || [],
      status: activeFiltersTrac2 || [],
      date_assemle: null,
      date_start: null,
      date_end: null,
      is_major: null,
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
      postData.is_major = true;
    } else if (activeMajMinButton === 'MIN') {
      postData.is_major = false;
    } 

     console.log('Отправляемые данные на бэкенд:', postData);
    console.log('activeMajMinButton:', activeMajMinButton);
    console.log('postData.is_major:', postData.is_major);

    return postData;
  };

   useEffect(() => {
    const fetchTractors = async () => {
      if (!token) {
        setError("Пользователь не авторизован");
        setLoading(false);
        return;
      }

      const postData = getPostData();

      try {
        setLoading(true);
        const response = await fetch(`http://${ip}/search/tractor-info`, {
          method: 'POST',
          headers: {  
            "Authorization": `Bearer ${token}`,
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
        
        if (Array.isArray(data) && data.length > 0) {
          const grouped = groupTractors(data);
          setTractors(grouped);
        } else if (data && typeof data === 'object') {
          const grouped = groupTractors([data]);
          setTractors(grouped);
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
  }, [activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, dateFilter, activeMajMinButton, token]);

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
    <div className="tractor-table-outer-wrapper" ref={tableContainerRef}>
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
                })
                .map((tractor, index) => (
                <tr 
                  key={tractor.id || tractor.vin || index}
                  onClick={() => handleRowClick(tractor)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                  
                >
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
                  <td>{tractor.gr || tractor.GR || '-'}</td>
                  <td>{tractor.ap || tractor.AP || '-'}</td> 
                  <td>{tractor.consumer || tractor.dealer || '-'}</td>                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>  );}