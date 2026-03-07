import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import DefaultImage from '../img/default.jpg';
import KPPImage from '../img/КПП.png';
import RKImage from '../img/РК.png';
import HRImage from '../img/Гидрораспределитель.png';
import APImage from '../img/Автопилот.png';
import WeiImage from '../img/ДВС Weichai.png';
import TMZImage from '../img/ДВС ТМЗ.png';
import JMZImage from '../img/ДВС ЯМЗ.png';
import BKImage from '../img/БК дисплей контроллер.png';
import  {api}  from '../fetchAPI.js';
import { API_BASE_URL } from '../fetchAPI.js';

export function PoDetails({ po, onBack }) {
  const { token } = useAuth();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false); // состояние для кнопки

  useEffect(() => {
  const fetchDetails = async () => {
    if (!po?.id_Firmwares || !po?.id_Component) {
      setError('Недостаточно данных для загрузки');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Явно формируем URL с параметрами
      const url = `/search/software-component-info?id_firmwares=${encodeURIComponent(po.id_Firmwares)}&id_component=${encodeURIComponent(po.id_Component)}`;
      console.log('Fetching URL:', url); // для отладки
      const data = await api.get(url);
      
      console.log('Received data:', data); // для отладки
      const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!item) throw new Error('Данные не найдены');
      setDetails(item);
    } catch (err) {
      console.error('Ошибка загрузки деталей ПО:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      setError(`Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchDetails();
}, [po]);

  if (loading) {
    return (
      <div className="po-details-container">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <div className="po-details-content">Загрузка...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="po-details-container">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <div className="po-details-content" style={{ color: 'red' }}>
          {error || 'Данные не найдены'}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const actualityPeriod = details.software_end_actuality
    ? `${formatDate(details.software_release_date)} — ${formatDate(details.software_end_actuality)}`
    : `с ${formatDate(details.software_release_date)} (бессрочно)`;

  const ImageToComponent = (type_component, model_component) => {
    const typeLower = type_component?.toLowerCase() || '';
    const modelLower = model_component?.toLowerCase() || '';

    if (typeLower.includes('кпп') || typeLower.includes('kpp') || 
        modelLower.includes('кпп') || modelLower.includes('kpp')) {
      return KPPImage;
    }

    if (typeLower && typeLower !== 'двс') {
      const ImageByType = {
        'рулевая колонка': RKImage,
        'гидрораспределитель': HRImage,
        'бк': BKImage,
        'автопилот': APImage,
      };
      for (const [key, image] of Object.entries(ImageByType)) {
        if (typeLower.includes(key)) return image;
      }
    }

    if (typeLower === 'двс' && modelLower) {
      if (modelLower.includes('weichai')) return WeiImage;
      if (modelLower.includes('тмз') || modelLower.includes('tmz')) return TMZImage;
      if (modelLower.includes('ямз') || modelLower.includes('yamz') || modelLower.includes('ymz')) return JMZImage;
    }

    return DefaultImage;
  };
   const handleDownloadInstruction = async () => {
    if (!details?.id_firmwares) return;
    setDownloading(true);
    try {
      // Используем метод download из fetchAPI (он возвращает response)
      const response = await api.download(`/firmware/download/${details.id_firmwares}?type=instruction`);
      const blob = await response.blob();

      // Пытаемся получить имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers.get('content-disposition');
      let filename = details.software_path_instruction || `instruction_${details.id_firmwares}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (match && match[1]) filename = match[1].replace(/['"]/g, '');
      }

      // Создаём ссылку и скачиваем
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      alert('Не удалось скачать файл');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="po-details-container">
      <div className="po-details-content">
        <div className="left-column">
          <div className="section">
            <h2>{details.software_path || 'ПО'} от {new Date(details.software_release_date).toLocaleDateString()}</h2>
            <img
              className="object"
              src={ImageToComponent(details.component_type, details.component_name)}
              alt={details.component_type}
            />
          </div>
          <div className="section">
            <h3>Дата выпуска</h3>
            <p>{formatDate(details.software_release_date)}</p>
          </div>
          <div className="section">
            <h3>Период актуальности</h3>
            <p>{actualityPeriod}</p>
          </div>
          <div className="section">
            <h3>Установщик</h3>
              {details.software_path ? (
              <button
                className="download-button"
                onClick={handleDownloadInstruction}
                disabled={downloading}
              >
                {downloading ? 'Скачивание...' : 'Скачать '}
              </button>
            ) : (
              <p>—</p>
            )}
          </div>
          <div className="section">
            <h3>Инструкция</h3>
            {details.software_path_instruction ? (
              <button
                className="download-button"
                onClick={handleDownloadInstruction}
                disabled={downloading}
              >
                {downloading ? 'Скачивание...' : 'Скачать'}
              </button>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>
        <div className="right-column">
          <div className="section">
            <h3>Описание</h3>
            <div className="description">
              {details.software_description || 'Описание отсутствует'}
            </div>
          </div>
          <div className="section">
            <h3>Предыдущие версии</h3>
            <p>
              {details.software_previous_sw_version ? (
                <a href={`#/software/${details.software_previous_sw_version}`}>
                  Версия {details.software_previous_sw_version}
                </a>
              ) : '—'}
            </p>
          </div>
          {/* <div className="section">
            <h3>Статус</h3>
            <p>
              {details.software_status === 'serial' && 'Серийное'}
              {details.software_status === 'experienced' && 'Опытное'}
              {details.software_status === 'in operation' && 'В эксплуатации'}
              {!details.software_status && '—'}
            </p>
          </div>
          <div className="section">
            <h3>Актуальность</h3>
            <p>
              {details.software_is_actual ? 'Актуально' : 'Не актуально'}
              {details.software_is_archive && ' (в архиве)'}
              {details.software_is_critical && ' (критическое)'}
            </p>
          </div>
          <div className="section">
            <h3>Модели тракторов</h3>
            <p>
              {details.software_tractor_models?.length
                ? details.software_tractor_models.join(', ')
                : '—'}
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}