
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DefaultImage from '../img/default.jpg';
import K5Image from '../img/К5.png';
import K7Image from '../img/К7М.png';
import {api} from '../fetchAPI.js';
import { PoDetails } from '../PoDetails/PoDetails.jsx';
import ReactDOM from 'react-dom';

export function TractorDetails({ vin, onBack }) {
  const [tractor, setTractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [activeTooltip, setActiveTooltip] = useState(null);
  const [components, setComponents] = useState([]);
  const [poDescriptions, setPoDescriptions] = useState({});
  const [selectedPo,setSelectedPo]=useState(null);
  const { token } = useAuth();

  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0
  });
  const navigate = useNavigate ();

  const ImageToModel = (model) => {
    const ImageJpg = {
      'K-5': K5Image,
      'K-7': K7Image,
      'K-742МСТ':K7Image,
      'K-525':K5Image,
    }

    return ImageJpg[model]|| DefaultImage;
  }

   const handleBack = () => {
    navigate(-1);
  };
  

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

        // Используем нашу новую api утилиту
        const data = await api.get(
          `search/search-tractor-vin?request=${encodeURIComponent(vin)}`,
          {
            headers: {
              // Можно добавить специфические заголовки
              'X-Custom-Header': 'value',
            },
          }
        );

        console.log('Полученные данные:', data);

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

          // Создаем объект для хранения описаний ПО
          const poDescriptions = {};
          componentData.forEach(component => {
            if (component.description && component.component_type) {
              poDescriptions[component.component_type] = component.description;
            }
          });

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

// Обработчики для тултипа
  const handleMouseEnter = (event, description) => {
    setTooltip({
      visible: true,
      text: description || 'Нет описания',
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseMove = (event) => {
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({
      visible: false,
      text: '',
      x: 0,
      y: 0
    });
  };


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
    model: component.comp_model,
    description: component.description || 'Нет описания' ,
    component_id: component.component_id,
  firmware_id: component.current_sw_version,
    
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

   const handlePoClick = (component) => {
       if (component.firmware_id && component.component_id) {
    setSelectedPo({
      id_Firmwares: component.firmware_id,
      id_Component: component.component_id,
    });
  } else {
    console.warn('Недостаточно данных для отображения ПО', component);
  }
};
  
    if (selectedPo) {
        return <PoDetails po={selectedPo} onBack={() => setSelectedPo(null)} />;
      }
  
  

  return (
    <div className="tractor-details-container add-po-form-scroll-bar">
      <button onClick={onBack} className="go-back"></button>
      <div className="tractor-details-content">
        <div className="tractor-info">
          <h2>{model} {VIN}</h2>
          <img src={ImageToModel(model)} alt={model} className="tractor-image" />
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
                    // onClick={() => handleItemClick(index)}
                    className="po-item"
                    onMouseEnter={(e) => handleMouseEnter(e,item.description)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={()=> handlePoClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="po-item-content">
                      <span className="po-item-name">{item.name}:</span>
                      <span className="po-item-version">{item.version}</span>
                      {item.model && item.model !== '-' && (
                        <span className="po-item-model">({item.model})</span>
                      )}
                    </div>
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
     {/* Кастомный тултип с вашими стилями */}
      {/* Кастомный тултип с порталом */}
{tooltip.visible && typeof document !== 'undefined' && document.body && ReactDOM.createPortal(
  <div 
    className="tooltip"
    style={{
      position: 'fixed',
      left: tooltip.x + 15,
      top: tooltip.y + 15,
      marginLeft: 0,
      pointerEvents: 'none',
      width: '200px',
      background: '#333',
      color: 'white',
      padding: '12px',
      borderRadius: '6px',
      zIndex: 1000,
      fontSize: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      wordWrap: 'break-word',
      height: 'auto'
    }}
  >
    {tooltip.text}
  </div>,
  document.body
)}
    </div>
  );
}