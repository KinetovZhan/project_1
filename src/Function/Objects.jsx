import DefaultImage from '../img/default.jpg';
import KPPImage from '../img/КПП.png';
import RKImage from '../img/РК.png';
import HRImage from '../img/Гидрораспределитель.png';
import APImage from '../img/Автопилот.png';
import WeiImage from '../img/ДВС Weichai.png';
import TMZImage from '../img/ДВС ТМЗ.png';
import JMZImage from '../img/ДВС ЯМЗ.png';
import BKImage from '../img/БК дисплей контроллер.png';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../fetchAPI.js';

export function Objects({ activeFilters, activeFilters2, selectedModel, selectedProducers, searchQuery }) {

  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const { token, user } = useAuth();
  const [isVisible, setIsVisible] = useState(null);
  const [isVisible, setIsVisible] = useState(null);

  const hoverTimers = useRef({});

  const hoverTimers = useRef({});

  const userRole = user?.role || 'user';

  console.log(`dfadsjgosajif ${userRole}`);

  console.log(`dfadsjgosajif ${userRole}`);

  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Пользователь не авторизован');
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }
      if (userRole !== 'dealer') {
        try {
          const FilterToTypeMap = {
            DVS: ['dvs', 'engine'],
            KPP: ['kpp', 'transmission'],
            RK: ['suspension'],
            hydrorasp: ['hydraulics'],
          };
          const FilterToTractor = { K7: 'K-7', K5: 'K-5' };

          const FilterToTypeMap = {
            DVS: ['dvs', 'engine'],
            KPP: ['kpp', 'transmission'],
            RK: ['suspension'],
            hydrorasp: ['hydraulics'],
          };
          const FilterToTractor = { K7: 'K-7', K5: 'K-5' };

          const postData = {
            trac_model: activeFilters2.map(f => FilterToTractor[f] || f),
            type_comp: activeFilters.flatMap(f => FilterToTypeMap[f] || f),
            model_comp: Array.isArray(selectedModel) ? selectedModel : [],
            producers: Array.isArray(selectedProducers) ? selectedProducers : []
          };

          const data = await api.post('search/component-info', postData);

          const items = Array.isArray(data) ? data : data ? [data] : [];
          setSoftwareItems(items);
        } catch (err) {
          console.error('Ошибка:', err);
          setError(`Ошибка: ${err.message}`);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    };

    fetchFilteredData();
  }, [activeFilters, activeFilters2, selectedModel, selectedProducers, token, searchQuery]); 

  const ImageToComponent = (type_component, model_component) => {
    if (type_component && type_component !== 'engine' && type_component !== 'dvs') {
  const ImageToComponent = (type_component, model_component) => {
    if (type_component && type_component !== 'engine' && type_component !== 'dvs') {
      const ImageByType = {
        transmission: KPPImage,
        suspension: RKImage,
        hydraulics: HRImage,
        ap: APImage,
        bk: BKImage,
        transmission: KPPImage,
        suspension: RKImage,
        hydraulics: HRImage,
        ap: APImage,
        bk: BKImage,
      };
      return ImageByType[type_component] || DefaultImage;
      return ImageByType[type_component] || DefaultImage;
    }
    if (model_component && (type_component === 'engine' || type_component === 'dvs')) {
    if (model_component && (type_component === 'engine' || type_component === 'dvs')) {
      const ImageByModel = {
        Weichai: WeiImage,
        ТМЗ: TMZImage,
        ЯМЗ: JMZImage,
        Weichai: WeiImage,
        ТМЗ: TMZImage,
        ЯМЗ: JMZImage,
      };
      return ImageByModel[model_component] || DefaultImage;
      return ImageByModel[model_component] || DefaultImage;
    }
    return DefaultImage;
  };

  // Функция для получения имени файла из заголовков
  const getFilenameFromResponse = (response, defaultName) => {
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }

    return defaultName;
  };

  // Функция для определения расширения файла
  const ensureFileExtension = (filename, contentType) => {
    if (filename.match(/\.([a-zA-Z0-9]+)$/)) {
      return filename;
    }

    const extensionMap = {
      'application/octet-stream': '.bin',
      'application/zip': '.zip',
      'application/pdf': '.pdf',
      'application/x-binary': '.bin',
      'binary/octet-stream': '.bin',
      'application/json': '.json',
      'text/plain': '.txt',
    };

    const extension = extensionMap[contentType] || '.bin';
    return filename + extension;
  };
    return DefaultImage;
  };

  // Функция для получения имени файла из заголовков
  const getFilenameFromResponse = (response, defaultName) => {
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }

    return defaultName;
  };

  // Функция для определения расширения файла
  const ensureFileExtension = (filename, contentType) => {
    if (filename.match(/\.([a-zA-Z0-9]+)$/)) {
      return filename;
    }

    const extensionMap = {
      'application/octet-stream': '.bin',
      'application/zip': '.zip',
      'application/pdf': '.pdf',
      'application/x-binary': '.bin',
      'binary/octet-stream': '.bin',
      'application/json': '.json',
      'text/plain': '.txt',
    };

    const extension = extensionMap[contentType] || '.bin';
    return filename + extension;
  };

  const handleDownload = async (item) => {
    if (!item?.id_Firmwares) {
      alert('ID файла не указан');
      return;
    }
    if (!item?.id_Firmwares) {
      alert('ID файла не указан');
      return;
    }

    if (!token) {
      alert('Требуется авторизация');
      return;
    }
    if (!token) {
      alert('Требуется авторизация');
      return;
    }

    try {
      setDownloading(item.id_Firmwares);
    try {
      setDownloading(item.id_Firmwares);

      const response = await api.download(`software/download/${item.id_Firmwares}`);
      const response = await api.download(`software/download/${item.id_Firmwares}`);

      // Получаем имя файла из заголовка или используем ID
      let filename = getFilenameFromResponse(response, `firmware_${item.id_Firmwares}`);

      const contentType = response.headers.get('content-type') || '';

      // Добавляем расширение, если нужно
      filename = ensureFileExtension(filename, contentType);
      // Получаем имя файла из заголовка или используем ID
      let filename = getFilenameFromResponse(response, `firmware_${item.id_Firmwares}`);

      const contentType = response.headers.get('content-type') || '';

      // Добавляем расширение, если нужно
      filename = ensureFileExtension(filename, contentType);

      console.log('Скачиваем файл:', filename, 'Content-Type:', contentType);
      console.log('Скачиваем файл:', filename, 'Content-Type:', contentType);

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Файл пустой');
      }
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Файл пустой');
      }

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      console.log('Файл успешно скачан:', filename);
    } catch (error) {
      console.error('Ошибка при скачивании:', error);
      alert(`Ошибка при скачивании: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };
      console.log('Файл успешно скачан:', filename);
    } catch (error) {
      console.error('Ошибка при скачивании:', error);
      alert(`Ошибка при скачивании: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleMouseEnter = (id) => {
  const handleMouseEnter = (id) => {
    // Очищаем предыдущий таймер для этого элемента
    if (hoverTimers.current[id]) {
      clearTimeout(hoverTimers.current[id]);
      delete hoverTimers.current[id];
    }


    // Устанавливаем таймер на 3 секунды для показа popup
    hoverTimers.current[id] = setTimeout(() => {
      setIsVisible(id);
      delete hoverTimers.current[id];
    }, 3000);
    }, 3000);
  };

  // Функция для обработки ухода мыши
  const handleMouseLeave = (id) => {
    // Очищаем таймер при уходе мыши
    if (hoverTimers.current[id]) {
      clearTimeout(hoverTimers.current[id]);
      delete hoverTimers.current[id];
    }


    // Скрываем popup сразу при уходе мыши
    setIsVisible(null);
  };

  // Фильтрация по поиску СРЕДИ УЖЕ ЗАГРУЖЕННЫХ данных
  // Фильтрация по поиску СРЕДИ УЖЕ ЗАГРУЖЕННЫХ данных
  const filteredItems = useMemo(() => {
    if (!searchQuery) return softwareItems;
    if (!searchQuery) return softwareItems;

    const query = searchQuery.trim().toLowerCase();
    return softwareItems.filter(
      (item) =>
    const query = searchQuery.trim().toLowerCase();
    return softwareItems.filter(
      (item) =>
        (item.producer_version && item.producer_version.toLowerCase().includes(query)) ||
        (item.type_component && item.type_component.toLowerCase().includes(query)) ||
        (item.model_component && item.model_component.toLowerCase().includes(query)) ||
        (item.comp_model && item.comp_model.toLowerCase().includes(query))
    );
  }, [softwareItems, searchQuery]);
    );
  }, [softwareItems, searchQuery]);

  const getAllActiveFilters = () => {
    const filterNames = {
      DVS: 'ДВС',
      KPP: 'КПП',
      RK: 'РК',
      hydrorasp: 'Гидрораспределитель',
      AP: 'Автопилот',
      BK: 'БК',
      K7: 'К-7',
      K5: 'К-5',
      DVS: 'ДВС',
      KPP: 'КПП',
      RK: 'РК',
      hydrorasp: 'Гидрораспределитель',
      AP: 'Автопилот',
      BK: 'БК',
      K7: 'К-7',
      K5: 'К-5',
    };
    return [...activeFilters, ...activeFilters2]
      .map((f) => filterNames[f])
      .map((f) => filterNames[f])
      .filter(Boolean)
      .join(', ');
  };

  const getComponentName = () => {
    const filterNames = {
      '': 'всех компонентов',
      DVS: 'ДВС',
      KPP: 'КПП',
      RK: 'РК',
      hydrorasp: 'Гидрораспределитель',
      AP: 'Автопилот',
      BK: 'БК',
      DVS: 'ДВС',
      KPP: 'КПП',
      RK: 'РК',
      hydrorasp: 'Гидрораспределитель',
      AP: 'Автопилот',
      BK: 'БК',
    };

    if (activeFilters.length > 0) {
      return (
        activeFilters
          .map((f) => filterNames[f])
          .filter(Boolean)
          .join(', ') || 'компонентов'
      );
      return (
        activeFilters
          .map((f) => filterNames[f])
          .filter(Boolean)
          .join(', ') || 'компонентов'
      );
    }

    // При отсутствии фильтров — показываем "Всех компонентов"
    return 'всех компонентов';
  };

  // --- Рендер ---
  if (loading) {
    return (
      <div className="maininfo">
      <div className="maininfo">
        <h3>Последние версии ПО для {getComponentName()}</h3>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="maininfo">
      <div className="maininfo">
        <h3>Ошибка</h3>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="maininfo">
    <div className="maininfo">
      <h3>Последние версии ПО для {getComponentName()}</h3>
      <div>
        <h4>Компоненты ({filteredItems.filter((item) => item.id_Firmwares).length})</h4>
        <h4>Компоненты ({filteredItems.filter((item) => item.id_Firmwares).length})</h4>
        {activeFilters.length > 0 && (
          <div style={{ marginBottom: '10px', color: '#666' }}>
            Активные фильтры: {getAllActiveFilters()}
          </div>
        )}
      </div>
      <div className="list-container">
        <ul className="List">
      <div className="list-container">
        <ul className="List">
          {filteredItems.length === 0 ? (
            <li>
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <h4>Ничего не найдено</h4>
                <p>Попробуйте изменить фильтры или запрос</p>
              </div>
            </li>
          ) : (
            filteredItems
              .filter((item) => item.id_Firmwares)
              .map((item) => (
                <li key={item.id_Firmwares}>
                  <div className="objectmenu" data-testid="objectmenu">
                    <img
                      className="object"
                      src={ImageToComponent(item.type_component, item.model_component || item.comp_model)}
                      alt={item.type_component}
                    />
                    <div className="inform">
                      <h4 className="poster">
                        №: {item.producer_version} от {new Date(item.release_date).toLocaleDateString()}
                      </h4>
                      <div className="infodisc">
                        <h5
                          className="textunder"
                          onMouseEnter={() => handleMouseEnter(item.id_Firmwares)}
                          onMouseLeave={() => handleMouseLeave(item.id_Firmwares)}
                        >
                          Для компонента {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}
                          {item.part_type ? ` (${item.part_type})` : ' (—)'}
                        </h5>
                        {isVisible === item.id_Firmwares && (
                          <div className="popup-window">
                            {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}
                          </div>
                        )}
                      </div>
                      <button
                        className="download"
                        onClick={() => handleDownload(item)}
                        disabled={!item.id_Firmwares || downloading === item.id_Firmwares}
                      >
                        Скачать
                      </button>
                    </div>
                  </div>
                </li>
              ))
              .filter((item) => item.id_Firmwares)
              .map((item) => (
                <li key={item.id_Firmwares}>
                  <div className="objectmenu" data-testid="objectmenu">
                    <img
                      className="object"
                      src={ImageToComponent(item.type_component, item.model_component || item.comp_model)}
                      alt={item.type_component}
                    />
                    <div className="inform">
                      <h4 className="poster">
                        №: {item.producer_version} от {new Date(item.release_date).toLocaleDateString()}
                      </h4>
                      <div className="infodisc">
                        <h5
                          className="textunder"
                          onMouseEnter={() => handleMouseEnter(item.id_Firmwares)}
                          onMouseLeave={() => handleMouseLeave(item.id_Firmwares)}
                        >
                          Для компонента {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}
                          {item.part_type ? ` (${item.part_type})` : ' (—)'}
                        </h5>
                        {isVisible === item.id_Firmwares && (
                          <div className="popup-window">
                            {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}
                          </div>
                        )}
                      </div>
                      <button
                        className="download"
                        onClick={() => handleDownload(item)}
                        disabled={!item.id_Firmwares || downloading === item.id_Firmwares}
                      >
                        Скачать
                      </button>
                    </div>
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
}