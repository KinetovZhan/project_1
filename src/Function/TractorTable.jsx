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




// export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer}) {
//   const [tractors, setTractors] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedTractor, setSelectedTractor] = useState(null);

//   const tableContainerRef = useRef(null);
//   const tableBodyRef = useRef(null);
//   const horizontalScrollRef = useRef(null);
//   const verticalScrollRef = useRef(null);

//   useEffect(() => {
//     const syncHScroll = () => {
//       if (tableBodyRef.current && horizontalScrollRef.current) {
//         tableBodyRef.current.scrollLeft = horizontalScrollRef.current.scrollLeft;
//       }
//     };

//     const horizontal = horizontalScrollRef.current;
    
//     horizontal?.addEventListener('scroll', syncHScroll);

//     const syncVScroll = () => {
//       if (tableBodyRef.current && verticalScrollRef.current) {
//         tableBodyRef.current.scrollTop = verticalScrollRef.current.scrollTop;
//       }
//     };

//     const vertical = verticalScrollRef.current;
    
//     vertical?.addEventListener('scroll', syncVScroll);

//     return () => {
//       horizontal?.removeEventListener('scroll', syncHScroll);
//       vertical?.removeEventListener('scroll', syncVScroll);
//     };
//   }, []);

//   // useEffect(() => {
//   //   const syncScroll = () => {
//   //     if (tableBodyRef.current && verticalScrollRef.current) {
//   //       tableBodyRef.current.scrollTop = verticalScrollRef.current.scrollTop;
//   //     }
//   //   };

//   //   const vertical = verticalScrollRef.current;
    
//   //   vertical?.addEventListener('scroll', syncScroll);

//   //   return () => {
//   //     vertical?.removeEventListener('scroll', syncScroll);
    
//   //   };
//   // }, []);

//   // Функция для подготовки данных запроса с учетом фильтров
//   const getPostData = () => {
//     const hasModelFilters = activeFiltersTrac && activeFiltersTrac.length > 0;
//     const hasStatusFilters = activeFiltersTrac2 && activeFiltersTrac2.length > 0;

//     const postData = {
//       trac_model: [],
//       status: [],
//       dealer: ""
//     };

//     if (searchQuery && searchQuery.trim() !== '') {
//       return { query: searchQuery.trim() };
//     }

//     if (searchDealer && searchDealer.trim() !== ''){
//       postData.dealer = searchDealer
//     }


//     // Добавляем фильтры по моделям из чекбоксов
//     if (hasModelFilters) {
//       postData.trac_model = activeFiltersTrac;
//     }
//     if (hasStatusFilters) {
//       postData.status = activeFiltersTrac2;
//     }
    

//     return postData;
//   };

//   useEffect(() => {
//     const fetchTractors = async () => {
//       const postData = getPostData();
//       let response
//       try {
//         setLoading(true);
//         if (searchQuery && searchQuery.trim() !== '') {
//           const searchParams = new URLSearchParams({
//             request: searchQuery.trim()
//         });
//             response = await fetch(`http://localhost:8000/search-tractor?${searchParams}`, {
//             method: 'GET',
//             headers: {  
//               'Accept': 'application/json',
//               'Content-Type': 'application/json'
//             },
//           })} else {
//             response = await fetch('http://localhost:8000/tractor-info', {
//             method: 'POST',
//             headers: {  
//               'Accept': 'application/json',
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(postData)
//           })
//         }
      

//         console.log('Статус ответа:', response.status);

//         const data = await response.json();
//         console.log('Полученные данные:', data);

//         if (data && data.status_code === 404) {
//           console.log("404 - тракторы не найдены");
//           setTractors([]);
//           return;
//         }

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         console.log('Успешно получены данные тракторов:', data);

//         if (Array.isArray(data)) {
//           setTractors(data);
//         } else if (data && typeof data === 'object') {
//           setTractors([data]);
//         } else {
//           setTractors([]);
//         }
        
//       } catch (error) {
//         console.error('Ошибка загрузки данных:', error);
//         setError(`Ошибка подключения к серверу: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTractors();
//   }, [activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer]); 

//   // Отладочная информация
//   console.log('=== РЕНДЕР TractorTable ===');
//   console.log('activeFiltersTrac:', activeFiltersTrac);
//   console.log('tractors:', tractors);
//   console.log('loading:', loading);
//     // Функция для обработки клика по строке
//   const handleRowClick = (tractor) => {
//   console.log('Клик по трактору:', tractor.vin);
//   setSelectedTractor(tractor.vin);
// };

//   // Если выбран трактор, отображаем его детали
//   if (selectedTractor) {
//   return <TractorDetails vin={selectedTractor} onBack={() => setSelectedTractor(null)} />;
// }


//   if (loading) {
//     return (
//       <div className="loading">
//         <div>Загрузка данных о тракторах...</div>
//         <div>Активные фильтры: {activeFiltersTrac.join(', ')}</div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="error">
//         <div>Ошибка: {error}</div>
//         <button 
//           onClick={() => window.location.reload()} 
//           className="reload-button"
//         >
//           Перезагрузить
//         </button>
//       </div>
//     );
//   }

//   return (
//   <div className="tractor-table-outer-wrapper">
//     <div className="tractor-table-container" >
//        <div className="tractor-table-body-scroll" ref={tableBodyRef}>
//          <table className="tractor-table">
//         <thead>
//           <tr>
//             <th>VIN</th>
//             <th>Модель</th>
//             <th>Дата выпуска</th>
//             <th>Регион</th>
//             <th>Моточасы</th>
//             <th>Последняя активность</th>
//             <th>ДВС</th>
//             <th>КПП</th>
//             <th>РК</th>
//             <th>БК</th>
//             <th>ГР</th>
//             <th>Автопилот</th>
//           </tr> 
//         </thead>
//         <tbody>
//           {tractors.map(tractor => (
//             <tr key={tractor.id || tractor.vin}
//               onClick={() => handleRowClick(tractor)}
//               style={{ cursor: 'pointer' }}
//               className="clickable-row">
//               <td>{tractor.vin || tractor.VIN || '-'}</td>
//               <td>{tractor.model || '-'}</td>
//               <td>{formatDateTime(tractor.assembly_date || tractor.releaseDate)}</td>
//               <td>{tractor.region || '-'}</td>
//               <td>{tractor.oh_hour || tractor.motoHours || '-'}</td>
//               <td>{formatDateTime(tractor.last_activity || tractor.lastActivity)}</td>
//               <td>{tractor.dvs || tractor.DVS || '-'}</td>
//               <td>{tractor.kpp || tractor.KPP || '-'}</td>
//               <td>{tractor.rk || tractor.RK || '-'}</td>
//               <td>{tractor.bk || tractor.BK || '-'}</td>
//               <td>{tractor.gr || tractor.GR || '-'}</td>
//               <td>{tractor.ap || tractor.AP || '-'}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
  
//   {/* Горизонтальный скроллбар ВНЕ контейнера */}
//   <div className="tractor-table-horizontal-scroll-outer" ref={horizontalScrollRef}>
//     <div className="scrollbar-spacer-horizontal" />
//      </div>
//     <div className="tractor-table-vertical-scroll-outer" ref={verticalScrollRef}>
//     <div className="scrollbar-spacer-vertical" />
//   </div>
// </div>
// );
// }
export function TractorTable({ activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTractor, setSelectedTractor] = useState(null);

  

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

    if (searchDealer && searchDealer.trim() !== ''){
      postData.dealer = searchDealer;
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
          response = await fetch(`http://localhost:8000/search-tractor?${searchParams}`, {
            method: 'GET',
            headers: {  
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          });
        } else {
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
  }, [activeFiltersTrac, activeFiltersTrac2, searchQuery, searchDealer]);

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
    <div className="tractor-table-outer-wrapper" >
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
      
      
      </div>
    
  );
}