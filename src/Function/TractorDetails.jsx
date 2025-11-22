import Image from '../img/Image.png'
import { useState, useEffect } from 'react';

export function TractorDetails({ vin, onBack }) {
  const [tractor, setTractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Вариант 1: с параметром 'request'
        const response = await fetch(`http://localhost:8000/search-tractor-vin?request=${encodeURIComponent(vin)}`, {
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
        } else {
          setTractor(data[0]);
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
  
  if (!tractor) return (
    <div>
      <div>Данные отсутствуют</div>
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
    dvs,
    kpp,
    rk,
    bk,
    ap,
    gr
    // Добавьте другие поля по необходимости
  } = tractor;


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
              <p>ДВС: {dvs || '-'}</p>
              <p>КПП: {kpp || '-'}</p>
              <p>РК: {rk || '-'}</p>
              <p>БК: {bk || '-'}</p>
              <p>ГР: {gr || '-'}</p>
              <p>Автопилот: {ap || '-'}</p>
            </div>
            <div className="section">
              <h3>Последние ошибки, дата</h3>
              <p>Код ошибки:{error} </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}