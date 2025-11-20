import Image from '../img/Image.png'
import { useState, useEffect } from 'react';

export function TractorDetails({ tractor }) {
  const [tractorDetails, setTractorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

   useEffect(() => {
    if (!tractor) return;

    const fetchTractorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Используем VIN для получения детальной информации
        const vin = tractor.vin || tractor.VIN;
        if (!vin) {
          throw new Error('VIN трактора не указан');
        }

        const response = await fetch(`http://localhost:8000/tractor-details/${vin}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });

        console.log('Статус ответа деталей трактора:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Полученные детали трактора:', data);

        setTractorDetails(data);
        
      } catch (error) {
        console.error('Ошибка загрузки деталей трактора:', error);
        setError(`Ошибка загрузки деталей: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTractorDetails();
  }, [tractor]);

  // Если данные еще загружаются
  if (loading) {
    return (
      <div className="loading">
        <div>Загрузка детальной информации о тракторе...</div>
      </div>
    );
  }

  // Если произошла ошибка
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

  // Если нет данных о тракторе
  if (!tractorDetails && !tractor) return null;

  // Используем данные из fetch-запроса или fallback на пропсы
  const details = tractorDetails || tractor;


  const {
    VIN,
    model,
    releaseDate,
    assembly_date,
    region,
    motoHours,
    oh_hour,
    lastActivity,
    last_activity,
    DVS,
    dvs,
    KPP,
    kpp,
    RK,
    rk,
    BK,
    bk
  } = details;

  // Пример данных для "Комплектация и ПО" (можно адаптировать под реальные данные)
  // В реальном приложении эти данные должны приходить с сервера
  const poList = [
    { name: 'ДВС', version: dvs || DVS || '1.320' },
    { name: 'КПП', version: kpp || KPP || '2.15' },
    { name: 'РК', version: rk || RK || '1.0' },
    { name: 'ГР', version: '3.2' },
    { name: 'БК', version: bk || BK || '4.0' },
    { name: 'Автопилот', version: '1.5' }
  ];

  // Пример данных для "Последние ошибки" (должны приходить с сервера)
  const lastError = {
    code: 'E-001',
    date: '02.08.2025'
  };

  // Пример данных для "Дата последней эксплуатации"
  const lastOperation = {
    date: last_activity || lastActivity || '15.08.2025',
    hours: oh_hour || motoHours || '65,5 ч.'
  };

  const poDescriptions = {
    'ДВС': 'Изменена цикловая подача топлива в камеру сгорания, изменено количество вспрысков форсунки',
    'КПП': '',
    'РК': 'это не рекалмный кабинет, если что!',
    'ГР': '',
    'БК': 'а это не бургер кинг',
    'Автопилот': 'я хочу сырнеке'
  };

  return (
    <div className="tractor-details-container">
      <div className="tractor-details-content">
        <div className="tractor-info">
          <h2>{model}</h2>
          <p className="vin">VIN: {VIN || tractor?.vin}</p>
          <img src={Image} alt={model} className="tractor-image" />
        </div>

        <div className="details-columns">
          <div className="column">
            <div className="section">
              <h3>Дата выпуска</h3>
              <p>{assembly_date || releaseDate}</p>
            </div>
            <div className="section">
              <h3>Регион эксплуатации</h3>
              <p>{region}</p>
            </div>
            <div className="section">
              <h3>Дата последней эксплуатации, Кол-во МЧ</h3>
              <p>{lastOperation.date}, {lastOperation.hours}</p>
            </div>
          </div>

          <div className="column">
            <div className="section">
              <h3>Комплектация и ПО</h3>
              <ul className="po-list">
                {poList.map((item, index) => (
                  <li
                    key={index}
                    onMouseEnter={(e) =>{
                      const tooltip = e.currentTarget.querySelector('.tooltip');
                      if (tooltip) tooltip.style.display = 'block';
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.querySelector('.tooltip');
                      if (tooltip) tooltip.style.display = 'none';
                    }}
                    className="po-item"
                  >
                    {item.name} {item.version && `v${item.version}`}

                    <div className="tooltip"> 
                      {poDescriptions[item.name] || 'Нет описания'}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="section">
              <h3>Последние ошибки, дата</h3>
              <p>Код ошибки: {lastError.code}, {lastError.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}