import Image from '../img/Image.png';
import { useState, useEffect, useMemo } from 'react'; // ← добавьте useMemo
import { useAuth } from '../auth/AuthContext';
import {ip} from "../shrineofvsakoe/ip.jsx";

export function Objects({ activeFilters, activeFilters2, selectedModel, searchQuery }) {
  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null)
  const { token } = useAuth();


  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);
;
      if (!token) {
        setError("Пользователь не авторизован");
        setLoading(false);
        return;
      }

      try {
        const FilterToTypeMap = { 'DVS': 'dvs', 'KPP': 'kpp','RK': 'suspension', 'hydrorasp': 'hydraulics', 'DVS': 'engine', 'KPP': 'transmission'};
        const FilterToTractor = { 'K7': 'K-7', 'K5': 'K-5' };

        const postData = {
          trac_model: activeFilters2.map(f => FilterToTractor[f] || f),
          type_comp: activeFilters.map(f => FilterToTypeMap[f] || f),
          model_comp: Array.isArray(selectedModel) ? selectedModel : []
        };

        const response = await fetch(`http://${ip}/search/component-info`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const items = Array.isArray(data) ? data : (data ? [data] : []);
        setSoftwareItems(items);
      } catch (err) {
        console.error('Ошибка:', err);
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };


    fetchFilteredData();
  }, [activeFilters, activeFilters2, selectedModel, token, searchQuery]); 


  const handleDownload = async (item) => {
  if (!item?.id_Firmwares) {
    alert('ID файла не указан');
    return;
  }

  if (!token) {
    alert('Требуется авторизация');
    return;
  }

  try {
    setDownloading(item.id_Firmwares);

    const response = await fetch(`http://${ip}/software/download/${item.id_Firmwares}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Текст ошибки:', errorText);
      throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
    }

    // Получаем имя файла из заголовка или используем ID
    let filename = `firmware_${item.id_Firmwares}`;
    const contentDisposition = response.headers.get('content-disposition');
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Улучшенное определение расширения
    let extension = '';
    const contentType = response.headers.get('content-type') || '';
    
    // Проверяем расширение в имени файла
    const nameMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
    if (nameMatch) {
      extension = `.${nameMatch[1]}`;
    } else {
      // Определяем по типу контента
      const extensionMap = {
        'application/octet-stream': '.bin',
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'application/x-7z-compressed': '.7z',
        'application/x-tar': '.tar',
        'application/x-gzip': '.gz',
        'application/pdf': '.pdf',
        'application/x-binary': '.bin',
        'binary/octet-stream': '.bin'
      };
      
      extension = extensionMap[contentType] || '.bin';
      filename += extension;
    }

    console.log('Скачиваем файл:', filename, 'Content-Type:', contentType);

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

    console.log('Файл успешно скачан:', filename);

  } catch (error) {
    console.error('Ошибка при скачивании:', error);
    alert(`Ошибка при скачивании: ${error.message}`);
  } finally {
    setDownloading(null);
  }
};


  // --- 2. Фильтрация по поиску СРЕДИ УЖЕ ЗАГРУЖЕННЫХ данных ---
  const filteredItems = useMemo(() => {
      if (!searchQuery) return softwareItems;

      const query = searchQuery.trim().toLowerCase();
      return softwareItems.filter(item =>
        (item.producer_version && item.producer_version.toLowerCase().includes(query)) ||
        (item.type_component && item.type_component.toLowerCase().includes(query)) ||
        (item.model_component && item.model_component.toLowerCase().includes(query)) ||
        (item.comp_model && item.comp_model.toLowerCase().includes(query))
      );
    }, [softwareItems, searchQuery]);

  // --- Ваши функции (перенесены в начало!) ---
  const getAllActiveFilters = () => {
    const filterNames = {
      'DVS': 'ДВС', 'KPP': 'КПП', 'RK': 'РК', 'hydrorasp': 'Гидрораспределитель',
      'K7': 'К-7', 'K5': 'К-5'
    };
    return [...activeFilters, ...activeFilters2]
      .map(f => filterNames[f])
      .filter(Boolean)
      .join(', ');
  };

  const getComponentName = () => {
    const filterNames = {
      '': 'всех компонентов',
      'DVS': 'ДВС',
      'KPP': 'КПП',
      'RK': 'РК',
      'hydrorasp': 'Гидрораспределитель'
    };

    if (activeFilters.length > 0) {
      return activeFilters
        .map(f => filterNames[f])
        .filter(Boolean)
        .join(', ') || 'компонентов';
    }

    // При отсутствии фильтров — показываем "Всех компонентов"
    return 'всех компонентов';
  };

  const [downloadingId, setDownloadingId] = useState(null);

const handleDownload = async (item) => {
  if (!item?.download_link) {
    alert('Файл недоступен');
    return;
  }

  setDownloadingId(item.id_Firmwares);

  try {
    // 1. Формируем URL (если относительный путь)
    let url = item.download_link.trim();
    
    // Если путь начинается с /, добавляем IP
    if (url.startsWith('/')) {
      url = `http://${ip}${url}`;
    }

    console.log('Скачиваем с URL:', url);

    // 2. Делаем запрос с авторизацией
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    // 3. Проверяем ответ
    if (response.status === 404) {
      throw new Error('Файл не найден на сервере');
    }

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    // 4. Определяем тип файла и имя
    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    let filename = 'firmware.bin';
    let fileExtension = '.bin';

    // Определяем имя файла из заголовка
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Если имени нет, создаем из данных
    if (filename === 'firmware.bin') {
      filename = `firmware_${item.producer_version || item.id_Firmwares}`;
      
      // Определяем расширение по content-type
      if (contentType.includes('application/zip')) {
        fileExtension = '.zip';
      } else if (contentType.includes('application/rar')) {
        fileExtension = '.rar';
      } else if (contentType.includes('application/x-7z-compressed')) {
        fileExtension = '.7z';
      } else if (contentType.includes('text/plain')) {
        fileExtension = '.txt';
      } else if (contentType.includes('application/pdf')) {
        fileExtension = '.pdf';
      } else if (contentType.includes('application/vnd.ms-excel')) {
        fileExtension = '.xls';
      } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        fileExtension = '.xlsx';
      }
      
      filename += fileExtension;
    }

    console.log('Тип файла:', contentType);
    console.log('Имя файла:', filename);

    // 5. Получаем файл и создаем ссылку для скачивания
    const blob = await response.blob();
    
    // Создаем Blob с правильным типом
    const typedBlob = new Blob([blob], { type: contentType });
    const downloadUrl = window.URL.createObjectURL(typedBlob);
    
    // 6. Создаем и кликаем ссылку
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // 7. Очистка
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadingId(null);
    }, 100);

  } catch (err) {
    console.error('Ошибка скачивания:', err);
    alert(`Не удалось скачать файл: ${err.message}`);
    setDownloadingId(null);
  }
};

  // --- Рендер ---
  if (loading) {
    return (
      <div className='maininfo'>
        <h3>Последние версии ПО для {getComponentName()}</h3>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='maininfo'>
        <h3>Ошибка</h3>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className='maininfo'>
      <h3>Последние версии ПО для {getComponentName()}</h3>
      <div>
        <h4>Компоненты ({filteredItems.filter(item => item.id_Firmwares).length})</h4>
        {activeFilters.length > 0 && (
          <div style={{ marginBottom: '10px', color: '#666' }}>
            Активные фильтры: {getAllActiveFilters()}
          </div>
        )}
      </div>
      <div className = 'list-container'>
        <ul className='List'>
          {filteredItems.length === 0 ? (
            <li>
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <h4>Ничего не найдено</h4>
                <p>Попробуйте изменить фильтры или запрос</p>
              </div>
            </li>
          ) : (
            filteredItems
            .filter(item => item.id_Firmwares)
            .map((item) => (
              <li key={item.id_Firmwares}>
                <div className='objectmenu' data-testid='objectmenu'>
                  <img className='object' src={Image} alt='Компонент' />
                  <div className='inform'>
                    <h4 className='poster'>
                      №: {item.producer_version} от {new Date(item.release_date).toLocaleDateString()}
                    </h4>
                    <h5 className='textunder'>
                      Для компонента {item.type_component || '—'}: {item.model_component || item.comp_model || '—'}
                    </h5>
                    <button 
                      className='download'
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