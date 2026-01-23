import Image from '../img/Image.png'
import { useState, useEffect } from 'react';

// export function TractorDetails({ vin, onBack }) {
//   const [tractor, setTractor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchTractorDetails = async () => {
//       if (!vin) {
//         setError('VIN не указан');
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Запрос деталей для VIN:', vin);
        
//         // Вариант 1: с параметром 'request'
//         const response = await fetch(`http://localhost:8000/search-tractor-vin?request=${encodeURIComponent(vin)}`, {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           },
//         });

//         console.log('Статус ответа:', response.status);

//         if (!response.ok) {
//           throw new Error(`Ошибка HTTP: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Полученные данные трактора:', data);

//         if (!data || data.length === 0) {
//           setError('Данные по трактору не найдены');
//           setTractor(null);
//         } else {
//           setTractor(data[0]);
//         }
//       } catch (err) {
//         console.error('Ошибка загрузки деталей трактора:', err);
//         setError(`Ошибка: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTractorDetails();
//   }, [vin]);
//    // Данные для всплывающих подсказок (можно вынести в отдельный файл или получать с API)
//   const poDescriptions = {
//     'ДВС': 'Изменена цикловая подача топлива в камеру сгорания, изменено количество вспрысков форсунки',
//     'КПП': 'Описание для КПП',
//     'РК': 'это не рекалмный кабинет, если что!',
//     'ГР': 'Описание для гидрораспределителя',
//     'БК': 'а это не бургер кинг',
//     'Автопилот': 'я хочу сырнеке'
//   };

//   if (loading) return (
//     <div className="loading">
//       <div>Загрузка деталей трактора...</div>
//       <div>VIN: {vin}</div>
//     </div>
//   );
  
//   if (error) return (
//     <div className="error">
//       <div>{error}</div>
//       <button onClick={onBack}>Назад к списку</button>
//     </div>
//   );
  
//   if (!tractor) return (
//     <div>
//       <div>Данные отсутствуют</div>
//       <button onClick={onBack}>Назад к списку</button>
//     </div>
//   );

//   const {
//     vin: VIN,
//     model,
//     assembly_date,
//     region,
//     oh_hour,
//     last_activity,
//     dvs,
//     kpp,
//     rk,
//     bk,
//     ap,
//     gr
//     // Добавьте другие поля по необходимости
//   } = tractor;

//    // Создаем список для комплектации и ПО с всплывающими подсказками
//   const poList = [
//     { name: 'ДВС', version: dvs },
//     { name: 'КПП', version: kpp },
//     { name: 'РК', version: rk },
//     { name: 'БК', version: bk },
//     { name: 'ГР', version: gr },
//     { name: 'Автопилот', version: ap }
//   ];

// return (
//     <div className="tractor-details-container">
//       <div className="tractor-details-content">
//         <div className="tractor-info">
//           <h2>{model}</h2>
//           <img src={Image} alt={model} className="tractor-image" />
//         </div>

//         <div className="details-columns">
//           <div className="column">
//             <div className="section">
//               <h3>Дата выпуска</h3>
//               <p>{assembly_date ? new Date(assembly_date).toLocaleDateString('ru-RU') : '-'}</p>
//             </div>
//             <div className="section">
//               <h3>Регион эксплуатации</h3>
//               <p>{region || '-'}</p>
//             </div>
//             <div className="section">
//               <h3>Дата последней эксплуатации, Кол-во МЧ</h3>
//               <p>{last_activity ? new Date(last_activity).toLocaleString('ru-RU') : '-'}, {oh_hour || '-'}</p>
//             </div>
//           </div>

//           <div className="column">
//             <div className="section">
//               <h3>Комплектация и ПО</h3>
//               <p>ДВС: {dvs || '-'}</p>
//               <p>КПП: {kpp || '-'}</p>
//               <p>РК: {rk || '-'}</p>
//               <p>БК: {bk || '-'}</p>
//               <p>ГР: {gr || '-'}</p>
//               <p>Автопилот: {ap || '-'}</p>
//             </div>
//             <div className="section">
//               <h3>Последние ошибки, дата</h3>
//               <p>Код ошибки:{error} </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// export function TractorDetails({ vin, onBack }) {
//   const [tractor, setTractor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTooltip, setActiveTooltip] = useState(null);

//   useEffect(() => {
//     const fetchTractorDetails = async () => {
//       if (!vin) {
//         setError('VIN не указан');
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Запрос деталей для VIN:', vin);
        
//         const response = await fetch(`http://localhost:8000/search-tractor-vin?request=${encodeURIComponent(vin)}`, {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           },
//         });

//         console.log('Статус ответа:', response.status);

//         if (!response.ok) {
//           throw new Error(`Ошибка HTTP: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Полученные данные трактора:', data);

//         if (!data || data.length === 0) {
//           setError('Данные по трактору не найдены');
//           setTractor(null);
//         } else {
//           setTractor(data[0]);
//         }
//       } catch (err) {
//         console.error('Ошибка загрузки деталей трактора:', err);
//         setError(`Ошибка: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTractorDetails();
//   }, [vin]);

//   // Данные для всплывающих подсказок
//   const poDescriptions = {
//     'ДВС': 'Изменена цикловая подача топлива в камеру сгорания, изменено количество вспрысков форсунки',
//     'КПП': 'Описание для КПП',
//     'РК': 'это не рекалмный кабинет, если что!',
//     'ГР': 'Описание для гидрораспределителя',
//     'БК': 'а это не бургер кинг',
//     'Автопилот': 'я хочу сырнеке'
//   };

//   const handleItemClick = (index) => {
//     if (activeTooltip === index) {
//       setActiveTooltip(null);
//     } else {
//       setActiveTooltip(index);
//     }
//   };

//   // Закрыть подсказку при клике вне элемента
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest('.po-item')) {
//         setActiveTooltip(null);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

//   if (loading) return (
//     <div className="loading">
//       <div>Загрузка деталей трактора...</div>
//       <div>VIN: {vin}</div>
//     </div>
//   );
  
//   if (error) return (
//     <div className="error">
//       <div>{error}</div>
//       <button onClick={onBack}>Назад к списку</button>
//     </div>
//   );

//   const {
//     vin: VIN,
//     model,
//     assembly_date,
//     region,
//     oh_hour,
//     last_activity,
//     dvs,
//     kpp,
//     rk,
//     bk,
//     ap,
//     gr
//   } = tractor;

//   // Создаем список для комплектации и ПО с всплывающими подсказками
//   const poList = [
//     { name: 'ДВС', version: dvs },
//     { name: 'КПП', version: kpp },
//     { name: 'РК', version: rk },
//     { name: 'БК', version: bk },
//     { name: 'ГР', version: gr },
//     { name: 'Автопилот', version: ap }
//   ];

//   return (
//     <div className="tractor-details-container">
//       <div className="tractor-details-content">
//         <div className="tractor-info">
//           <h2>{model}</h2>
//           <img src={Image} alt={model} className="tractor-image" />
//         </div>

//         <div className="details-columns">
//           <div className="column">
//             <div className="section">
//               <h3>Дата выпуска</h3>
//               <p>{assembly_date ? new Date(assembly_date).toLocaleDateString('ru-RU') : '-'}</p>
//             </div>
//             <div className="section">
//               <h3>Регион эксплуатации</h3>
//               <p>{region || '-'}</p>
//             </div>
//             <div className="section">
//               <h3>Дата последней эксплуатации, Кол-во МЧ</h3>
//               <p>{last_activity ? new Date(last_activity).toLocaleString('ru-RU') : '-'}, {oh_hour || '-'}</p>
//             </div>
//           </div>

//           <div className="column">
//             <div className="section">
//               <h3>Комплектация и ПО</h3>
//               <ul className="po-list">
//                 {poList.map((item, index) => (
//                   <li
//                     key={index}
//                     onClick={() => handleItemClick(index)}
//                     className="po-item"
//                   >
//                     {item.name}: {item.version || '-'}
//                     {activeTooltip === index && (
//                       <div className="tooltip">
//                         {poDescriptions[item.name] || 'Нет описания'}
//                       </div>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="section">
//               <h3>Последние ошибки, дата</h3>
//               <p>Код ошибки: {error}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
export function TractorDetails({ vin, onBack }) {
  const [tractor, setTractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [components, setComponents] = useState([]);
   const [poDescriptions, setPoDescriptions] = useState({});

  useEffect(() => {
    const fetchTractorDetails = async () => {
      if (!vin) {
        setError('VIN не указан');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('Запрос деталей для VIN:', vin);
        
        const response = await fetch(`http://172.20.46.66:8000/search-tractor-vin?request=${encodeURIComponent(vin)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('Статус ответа:', response.status);

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Полученные данные трактора:', data);

        if (!data || data.length === 0) {
          setError('Данные по трактору не найдены');
          setTractor(null);
          setComponents([]);
        } else {
          // Первый элемент содержит основную информацию о тракторе
          setTractor(data[0]);
          
          // Извлекаем компоненты из всех данных
          const componentData = data.filter(item => item.component_type && item.comp_model);
          console.log('Компоненты:', componentData);
          setComponents(componentData);
        }
      } catch (err) {
        console.error('Ошибка загрузки деталей трактора:', err);
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTractorDetails();
  }, [vin]);

    // Загружаем описания компонентов из базы данных
  useEffect(() => {
    const fetchPoDescriptions = async () => {
      try {
        const response = await fetch('http://172.20.46.66:8000/get-po-descriptions', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Полученные описания компонентов:', data);
        
        // Преобразуем данные в нужный формат
        const descriptions = {};
        data.forEach(item => {
          descriptions[item.component_name] = item.description;
        });
        
        setPoDescriptions(descriptions);
      } catch (err) {
        console.error('Ошибка загрузки описаний компонентов:', err);
        // Можно установить значения по умолчанию в случае ошибки
        setPoDescriptions({
          'ДВС': 'Описание временно недоступно',
          'КПП': 'Описание временно недоступно',
          'РК': 'Описание временно недоступно',
          'ГР': 'Описание временно недоступно',
          'БК': 'Описание временно недоступно',
          'Автопилот': 'Описание временно недоступно'
        });
      }
    };

    fetchPoDescriptions();
  }, []);


  const handleItemClick = (index) => {
    if (activeTooltip === index) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(index);
    }
  };

  // Закрыть подсказку при клике вне элемента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.po-item')) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (loading) return (
    <div className="loading">
      <div>Загрузка деталей трактора...</div>
      <div>VIN: {vin}</div>
    </div>
  );
  
  if (error) return (
    <div className="error">
      <div>{error}</div>
      <button onClick={onBack}>Назад к списку</button>
    </div>
  );

  const {
    vin: VIN,
    model,
    assembly_date,
    region,
    oh_hour,
    last_activity,
  } = tractor;

  // Создаем список для комплектации и ПО на основе реальных данных
  const poList = components.map(component => ({
    name: component.component_type,
    version: component.recommend_sw_version || component.sw_name || '-',
    model: component.comp_model
  }));

  // Если компонентов нет, показываем заглушку
  const displayComponents = components.length > 0 ? poList : [
    { name: 'ДВС', version: '-', model: '-' },
    { name: 'КПП', version: '-', model: '-' },
    { name: 'РК', version: '-', model: '-' },
    { name: 'БК', version: '-', model: '-' },
    { name: 'ГР', version: '-', model: '-' },
    { name: 'Автопилот', version: '-', model: '-' }
  ];

  return (
    <div className="tractor-details-container">
      <div className="tractor-details-content">
        <div className="tractor-info">
          <h2>{model}</h2>
          <img src={Image} alt={model} className="tractor-image" />
        </div>

        <div className="details-columns">
          <div className="column">
            <div className="section">
              <h3>Дата выпуска</h3>
              <p>{assembly_date ? new Date(assembly_date).toLocaleDateString('ru-RU') : '-'}</p>
            </div>
            <div className="section">
              <h3>Регион эксплуатации</h3>
              <p>{region || '-'}</p>
            </div>
            <div className="section">
              <h3>Дата последней эксплуатации, Кол-во МЧ</h3>
              <p>{last_activity ? new Date(last_activity).toLocaleString('ru-RU') : '-'}, {oh_hour || '-'}</p>
            </div>
          </div>

          <div className="column">
            <div className="section">
              <h3>Комплектация и ПО</h3>
              <ul className="po-list">
                {displayComponents.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleItemClick(index)}
                    className="po-item"
                  >
                    <div className="po-item-content">
                      <span className="po-item-name">{item.name}:</span>
                      <span className="po-item-version">{item.version}</span>
                      {item.model && item.model !== '-' && (
                        <span className="po-item-model">({item.model})</span>
                      )}
                    </div>
                    {activeTooltip === index && (
                      <div className="tooltip">
                        {poDescriptions[item.name] || 'Нет описания'}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="section">
              <h3>Последние ошибки, дата</h3>
              <p>Информация об ошибках временно недоступна</p>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}