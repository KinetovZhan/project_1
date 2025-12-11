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


export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer, searchDate }) {
  // const [tractors, setTractors] = useState([]);
  const [tractors, setTractors] = useState([]); // все данные от сервера
const [filteredTractors, setFilteredTractors] = useState([]); // то, что показываем
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

 // Эффект для фильтрации тракторов по дате выпуска
  // useEffect(() => {
  //   if (!searchDate || searchDate === '') {
  //     setFilteredTractors(tractors);
  //     return;
  //   }

  //   try {
  //     const selectedDate = new Date(searchDate);
  //     const filtered = tractors.filter(tractor => {
  //       const tractorDate = new Date(tractor.assembly_date || tractor.releaseDate);
  //       return tractorDate.toDateString() === selectedDate.toDateString();
  //     });
  //     setFilteredTractors(filtered);
  //   } catch (error) {
  //     console.error('Ошибка фильтрации по дате:', error);
  //     setFilteredTractors(tractors);
  //   }
  // }, [searchDate, tractors]);

  // Функция для подготовки данных запроса с учетом фильтров
  const getPostData = () => {
    const hasModelFilters = activeFiltersTrac && activeFiltersTrac.length > 0;
    const hasStatusFilters = activeFiltersTrac2 && activeFiltersTrac2.length > 0;

    const postData = {
      trac_model: [],
      status: [],
      dealer: "",
      date_assemle: ""
    };

    if (searchQuery && searchQuery.trim() !== '') {
      return { query: searchQuery.trim() };
    }

    if (searchDealer && searchDealer.trim() !== ''){
      postData.dealer = searchDealer;
    }
    
    if (searchDate && searchDate.trim() !== '') {
    postData.date_assemle = searchDate;
    console.log('Search date:', searchDate); // Добавьте эту строку
  }


    if (hasModelFilters) {
      postData.trac_model = activeFiltersTrac;
    }
    if (hasStatusFilters) {
      postData.status = activeFiltersTrac2;
    }
    console.log('Данные для отправки:', postData);
    return postData;
  };

  useEffect(() => {
  const fetchTractors = async () => {
    const postData = getPostData();
    let response;
    
    try {
      setLoading(true);
      setError(null);
      
      if (searchQuery && searchQuery.trim() !== '') {
        const searchParams = new URLSearchParams({
          request: searchQuery.trim()
        });
        
        response = await fetch(`http://localhost:8000/search-tractor?${searchParams}`, {
          method: 'GET',
          headers: {  
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
      } else {
        // Добавляем дату в запрос, если она есть
        if (searchDate) {
          postData.date_assemle = searchDate;
        }
        
        response = await fetch('http://localhost:8000/tractor-info', {
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

      // Проверяем статус 404
      if (data && data.status_code === 404) {
        console.log("404 - тракторы не найдены");
        setTractors([]);
        setFilteredTractors([]);
        return;
      }

      // Проверяем статус ответа сервера
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Успешно получены данные тракторов:', data);

      if (Array.isArray(data)) {
        setTractors(data);
        setFilteredTractors(data);
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Если вернулся один объект, помещаем его в массив
        setTractors([data]);
        setFilteredTractors([data]);
      } else {
        setTractors([]);
        setFilteredTractors([]);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки тракторов:', error);
      setError(`Ошибка подключения к серверу: ${error.message}`);
      setTractors([]);
      setFilteredTractors([]);
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
              {filteredTractors.map((tractor, index) => (
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