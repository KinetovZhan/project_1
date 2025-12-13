import React, { useState,useRef, useEffect } from 'react';
import {SearchBar} from "./SearchBar.jsx";
import {TractorDetails} from "./TractorDetails.jsx";


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
        ap: '-'
      };
    }

    const type = item.component_type;
    const version = item.sw_name || '-';

    if (type === 'dvs') {
      grouped[vin].dvs = version;
    } else if (type === 'kpp') {
      grouped[vin].kpp = version;
    } else if (type === 'rk') {
      grouped[vin].rk = version;
    } else if (type === 'bk') {
      grouped[vin].bk = version;
    } else if (type === 'gr') {
      grouped[vin].gr = version;
    } else if (type === 'ap') {
      grouped[vin].ap = version;
    }

  });
  console.log(grouped)

  return Object.values(grouped);
};




export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, searchDate}) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTractor, setSelectedTractor] = useState(null);

  const tableContainerRef = useRef(null);
  const tableBodyRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const verticalScrollRef = useRef(null);


  // Синхронизация горизонтального скролла
  useEffect(() => {
    const syncHScroll = () => {
      if (tableBodyRef.current && horizontalScrollRef.current) {
        tableBodyRef.current.scrollLeft = horizontalScrollRef.current.scrollLeft;
      }
    };

    const syncHScrollReverse = () => {
      if (tableBodyRef.current && horizontalScrollRef.current) {
        horizontalScrollRef.current.scrollLeft = tableBodyRef.current.scrollLeft;
      }
    };

    const horizontal = horizontalScrollRef.current;
    const tableBody = tableBodyRef.current;
    
    horizontal?.addEventListener('scroll', syncHScroll);
    tableBody?.addEventListener('scroll', syncHScrollReverse);

    return () => {
      horizontal?.removeEventListener('scroll', syncHScroll);
      tableBody?.removeEventListener('scroll', syncHScrollReverse);
    };
  }, []);

  // Синхронизация вертикального скролла
  useEffect(() => {
  const syncVScroll = () => {
    if (tableBodyRef.current && verticalScrollRef.current) {
      verticalScrollRef.current.scrollTop = tableBodyRef.current.scrollTop;
    }
  };

  const syncVScrollReverse = () => {
    if (tableBodyRef.current && verticalScrollRef.current) {
      tableBodyRef.current.scrollTop = verticalScrollRef.current.scrollTop;
    }
  };

  const tableBody = tableBodyRef.current;
  const vertical = verticalScrollRef.current;
  
  tableBody?.addEventListener('scroll', syncVScroll);
  vertical?.addEventListener('scroll', syncVScrollReverse);

  return () => {
    tableBody?.removeEventListener('scroll', syncVScroll);
    vertical?.removeEventListener('scroll', syncVScrollReverse);
  };
}, []);

  // Функция для подготовки данных запроса с учетом фильтров
  const getPostData = () => {
    const hasModelFilters = activeFiltersTrac && activeFiltersTrac.length > 0;
    const hasStatusFilters = activeFiltersTrac2 && activeFiltersTrac2.length > 0;

    const postData = {
      trac_model: [],
      status: [],
      dealer: "",
      date_assemle: null
    };

    if (searchQuery && searchQuery.trim() !== '') {
      return { query: searchQuery.trim() };
    }

    if (searchDealer && searchDealer.trim() !== ''){
      postData.dealer = searchDealer;
    }

    if (searchDate && searchDate.trim() !== '') {
    postData.date_assemle = searchDate;
    console.log('Search date:', searchDate); 
  }

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
      let response;
      try {
        setLoading(true);
        if (searchQuery && searchQuery.trim() !== '') {
          const searchParams = new URLSearchParams({
            request: searchQuery.trim()
        });
            response = await fetch(`http://172.20.46.71:8000/search-tractor?${searchParams}`, {
            method: 'GET',
            headers: {  
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          })} else {
            // Добавляем дату в запрос, если она есть
            if (searchDate) {
              postData.date_assemle = searchDate;
            }
            
            response = await fetch('http://172.20.46.71:8000/tractor-info', {
              method: 'POST',
              headers: {  
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(postData)
            });
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

        if (Array.isArray(data) && data.length > 0) {
          const grouped = groupTractors(data);
          setTractors(grouped);
        } else if (data && typeof data === 'object') {
          // Если пришёл один объект — обрабатываем как массив из одного элемента
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
  }, [activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, searchDate]);

  // Обработка клика по строке
  const handleRowClick = (tractor) => {
    console.log('Клик по трактору:', tractor.vin);
    setSelectedTractor(tractor.vin);
  };

  // Если выбран трактор, отображаем его детали
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
          className="tractor-table-body-scroll" 
          ref={tableBodyRef}
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
              </tr> 
            </thead>
            <tbody>
              {tractors.map((tractor, index) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Горизонтальный скроллбар */}
      <div 
        className="tractor-table-horizontal-scroll-outer" 
        ref={horizontalScrollRef}
      >
        <div 
          className="scrollbar-spacer-horizontal" 

        />
      </div>
      
      {/* Вертикальный скроллбар */}
      <div 
        className="tractor-table-vertical-scroll-outer" 
        ref={verticalScrollRef}
      >
        <div 
          className="scrollbar-spacer-vertical" 
  
        />
      </div>
    </div>
  );
}