import React, { useState, useEffect } from 'react';
import {SearchBar} from "./SearchBar.jsx";


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




export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, onSearch, searchQuery}) {
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

    if (searchQuery && searchQuery.trim() !== '') {
      return { query: searchQuery.trim() };
    }


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
      let response
      try {
        setLoading(true);
        if(searchQuery) {
          response = await fetch('http://localhost:8000/search-tractor', {
          method: 'POST',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        })} else {
        
          response = await fetch('http://localhost:8000/tractor-info', {
          method: 'POST',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        })
      }

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
  }, [activeFiltersTrac, activeFiltersTrac2, searchQuery]); 

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