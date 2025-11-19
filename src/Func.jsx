import Image from './img/Image.png'
import { useState, useEffect } from 'react';



// const formatDateTime = (dateString) => {
//   if (!dateString) return '-';
  
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleString('ru-RU', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   } catch (error) {
//     return '-';
//   }
// };








// // Трактор
// export function Filters2({ onFilterChangeTracByModel, onFilterChangeByStatus, activeMajMinButton, handleMajMinButtonClick }) {
//   const models = ['К-742МСТ', 'К7', 'К-525'];

//   const [FilterTractors_by_model, setFilterTractors_by_model] = useState({
//     'К-742МСТ': false,
//     'К7': false,
//     'К-525': false
//   });

//   const FilterToTractor = {
//     'К-742МСТ': 'K742MST',
//     'К7': 'K7', 
//     'К-525': 'K525'
//   };

//   const [FilterTractor_by_status, setFilterTractor_by_status] = useState({
//     Serial: false,
//     Experienced: false,
//     Actual: false,
//     Critical: false
//   });

//   const FilterStatus = {
//     'Serial': 'Серийное',
//     'Experienced': 'Опытное',
//     'Actual': 'Актуальное',
//     'Critical': 'Критические'
//   }



//   const handleFilterByStatus = (FilterType) => {
//     const newFilter = {
//       ...FilterTractor_by_status,
//       [FilterType]: !FilterTractor_by_status[FilterType]
//     };
//     setFilterTractor_by_status(newFilter)


//     if(onFilterChangeByStatus) {
//       const activeFiltersTrac2 = Object.keys(newFilter)
//         .filter(key => newFilter[key])
//         .map(filter => FilterStatus[filter]);
//       onFilterChangeByStatus(activeFiltersTrac2);
//     }
//   }
  


//   const handleFilterByModelTractors = (FilterType) => {
//     const newFilter = {
//       ...FilterTractors_by_model,
//       [FilterType]: !FilterTractors_by_model[FilterType]
//     };
//     setFilterTractors_by_model(newFilter)

//     if (onFilterChangeTracByModel) {
//       const activeFiltersTrac = Object.keys(newFilter)
//         .filter(key => newFilter[key])
//         .map(filter => FilterToTractor[filter]);
//       onFilterChangeTracByModel(activeFiltersTrac);
//     }
//   }
  

//   return (
//     <>
//       <div className='filterstrac'>
//         {models.map(model => (
//           <label key = {model}>
//             <span>{model}</span>
//             <input 
//               type="checkbox"
//               checked={FilterTractors_by_model[model]}
//               onChange={() => handleFilterByModelTractors(model)}
//             />
//           </label>
//         ))}
//       </div>

//       <div className='Дата выпуска'>
//       </div>

//       <div className='Поиск по дилеру'>
//       </div>

//       <div className='filterstrac2'>
//         <label>
//           <span>Серийное</span>
//           <input type="checkbox"
//           checked={FilterTractor_by_status.Serial} 
//           onChange={() => handleFilterByStatus('Serial')}/>
//         </label>

//         <label>
//           <span>Опытное</span>
//           <input type="checkbox"
//           checked={FilterTractor_by_status.Experienced} 
//           onChange={() => handleFilterByStatus('Experienced')}/>
//         </label>

//         <label>
//           <span>Актуальное</span>
//           <input type="checkbox"
//           checked={FilterTractor_by_status.Actual} 
//           onChange={() => handleFilterByStatus('Actual')}/>
//         </label>

//         <label>
//           <span>Критические</span>
//           <input type="checkbox"
//           checked={FilterTractor_by_status.Critical} 
//           onChange={() => handleFilterByStatus('Critical')}/>
//         </label>
//       </div>

//       <div className='Majmin'>
//         <button 
//           className={activeMajMinButton === 'MAJ'?'majmin_button_active' : 'majmin_button'}
//           onClick={() => handleMajMinButtonClick('MAJ')}
//         >
//           Требуется MAJ
//         </button>
//         <button 
//           className={activeMajMinButton === 'MIN'? 'majmin_button_active' : 'majmin_button'}
//           onClick={() => handleMajMinButtonClick('MIN')}
//         >
//           Требуется MIN
//         </button>
//       </div>
//     </>
//   );
// }


// export function TractorTable({ activeFiltersTrac, activeFiltersTrac2 }) {
//   const [tractors, setTractors] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Функция для подготовки данных запроса с учетом фильтров
//   const getPostData = () => {
//     const hasModelFilters = activeFiltersTrac && activeFiltersTrac.length > 0;
//     const hasStatusFilters = activeFiltersTrac2 && activeFiltersTrac2.length > 0;

//     const postData = {
//       trac_model: [],
//       status: [],
//       dealer: ""
//     };

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

//       try {
//         setLoading(true);
//         const response = await fetch('http://localhost:8000/tractor-info/', {
//           method: 'POST',
//           headers: {  
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(postData)
//         });

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
//   }, [activeFiltersTrac, activeFiltersTrac2]); 

//   // Отладочная информация
//   console.log('=== РЕНДЕР TractorTable ===');
//   console.log('activeFiltersTrac:', activeFiltersTrac);
//   console.log('tractors:', tractors);
//   console.log('loading:', loading);



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
//     <div className="tractor-table-container">
//       {/* Информация о фильтрах */}
//       <div className="filter-info">
//         {activeFiltersTrac.length > 0 && activeFiltersTrac2.length > 0 && (
//           <div style={{marginBottom: '10px', color: '#666'}}>
//             Активные фильтры: {activeFiltersTrac.join(', ')} {activeFiltersTrac2.join(',')}
//           </div>
//         )}
//       </div>

//       {tractors.length === 0 ? (
//         <div className="no-data"> 
//           Нет тракторов, соответствующих выбранным фильтрам
//         </div>
//       ) : (
//         <>
//           <div className="table-info">
//             Показано {tractors.length} тракторов
//             {` (фильтр: ${activeFiltersTrac.join(', ')})`}
//           </div>
//           <table className="tractor-table">
//             <thead>
//               <tr>
//                 <th>VIN</th>
//                 <th>Модель</th>
//                 <th>Дата выпуска</th>
//                 <th>Регион</th>
//                 <th>Моточасы</th>
//                 <th>Последняя активность</th>
//                 <th>ДВС</th>
//                 <th>КПП</th>
//                 <th>РК</th>
//                 <th>БК</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tractors.map(tractor => (
//                 <tr key={tractor.id || tractor.vin}>
//                   <td>{tractor.vin || tractor.VIN || '-'}</td>
//                   <td>{tractor.model || '-'}</td>
//                   <td>{formatDateTime(tractor.assembly_date || tractor.releaseDate)}</td>
//                   <td>{tractor.region || '-'}</td>
//                   <td>{tractor.oh_hour || tractor.motoHours || '-'}</td>
//                   <td>{formatDateTime(tractor.last_activity || tractor.lastActivity)}</td>
//                   <td>{tractor.dvs || tractor.DVS || '-'}</td>
//                   <td>{tractor.kpp || tractor.KPP || '-'}</td>
//                   <td>{tractor.rk || tractor.RK || '-'}</td>
//                   <td>{tractor.bk || tractor.BK || '-'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       )}
//     </div>
//   );
// }





// export function MainPart({activeButton, activeFilters, activeFilters2, selectedModel, selectedTractorModel, activeFiltersTrac, activeFiltersTrac2, onSearch, searchQuery, searchType}) {
//   return(
//     <div className='MainPart'> 
//       {activeButton === 'aggregates'&& (<><SearchBar onSearch={onSearch}/> <Objects activeFilters={activeFilters} activeFilters2={activeFilters2} selectedModel={selectedModel} onSearch={onSearch} searchQuery={searchQuery} searchType={searchType}/></>)}
//       {activeButton === 'tractor'&& (<><SearchBar onSearch={onSearch}/> <TractorTable activeFiltersTrac={activeFiltersTrac} activeFiltersTrac2={activeFiltersTrac2}/></>)}
//     </div>
//   )
// }