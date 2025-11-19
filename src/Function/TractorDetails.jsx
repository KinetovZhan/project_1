import Image from '../img/Image.png'
import { useState, useEffect } from 'react';

export function TractorDetails({ tractor }) {
  if (!tractor) return null;

  const {
    VIN,
    model,
    releaseDate,
    region,
    motoHours,
    lastActivity,
    DVS,
    KPP,
    RK,
    BK
  } = tractor;

  // Пример данных для "Комплектация и ПО" (можно адаптировать под реальные данные)
  const poList = [
    { name: 'ДВС', version: '1.320' },
    { name: 'КПП', version: '2.15' },
    { name: 'РК', version: '1.0' },
    { name: 'ГР', version: '3.2' },
    { name: 'БК', version: '4.0' },
    { name: 'Автопилот', version: '1.5' }
  ];

  // Пример данных для "Последние ошибки"
  const lastError = {
    code: 'E-001',
    date: '02.08.2025'
  };

  // Пример данных для "Дата последней эксплуатации"
  const lastOperation = {
    date: '15.08.2025',
    hours: '65,5 ч.'
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
          <img src={Image} alt={model} className="tractor-image" />
        </div>

        <div className="details-columns">
          <div className="column">
            <div className="section">
              <h3>Дата выпуска</h3>
              <p>{releaseDate}</p>
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

                    <div className="tooltip"> {poDescriptions[item.name] || 'Нет описания'}</div>
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