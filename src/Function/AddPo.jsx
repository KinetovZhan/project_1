import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../auth/AuthContext';
import {ip} from "../shrineofvsakoe/ip.jsx";
import useCheckMobile from '../shrineofvsakoe/checkMobile.jsx';

export function AddPoForm({ onBack, onSubmit, skipValidation = false }) {
  // Состояния
  const [componentOptions, setComponentOptions] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [softwareOptions, setSoftwareOptions] = useState([]);
  const [selectedPreviousVersion, setSelectedPreviousVersion] = useState(null);
  const [loadingSoftware, setLoadingSoftware] = useState(false);
  const [softwareError, setSoftwareError] = useState(null);
  const [selectedRelevance, setSelectedRelevance] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [selectedTractorModel, setSelectedTractorModel] = useState(null);
  const [tractorOptions, setTractorOptions] = useState([]);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [tractorError, setTractorError] = useState(null);
  const { token } = useAuth();
  const isMobile = useCheckMobile();

  // Заглушка для производителей (пока нет на бэкенде)
  const producerOptions = [
    { value: 'producer1', label: 'Производитель 1' },
    { value: 'producer2', label: 'Производитель 2' },
    { value: 'producer3', label: 'Производитель 3' },
  ];

  // Опции для актуальности
  const relevanceOptions = [
    { value: 'actual', label: 'Актуальное' },
    { value: 'outdated', label: 'Устаревшее' },
  ];

  // Опции для статуса
  const statusOptions = [
    { value: 'serial', label: 'Серийное' },
    { value: 'experimental', label: 'Опытное' },
    { value: 'in_operation', label: 'В эксплуатации' },
  ];

  // Загружаем список компонентов с частями
  useEffect(() => {
    console.log('Токен из useAuth:', token ? `Есть (${token.substring(0, 20)}...)` : 'Нет');

    fetch(`http://${ip}/search/component-parts/`)
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить компоненты');
        return res.json();
      })
      .then(data => {
        console.log('Полученные данные компонентов:', data);
        setComponentOptions(data);
      })
      .catch(err => {
        console.error('Ошибка загрузки компонентов:', err);
        alert('Не удалось загрузить список компонентов');
      });
  }, []);

  // Загружаем список ПО для предыдущих версий
  useEffect(() => {
    if (token) {
      setLoadingSoftware(true);
      setSoftwareError(null);

      fetch(`http://${ip}/software/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          console.log('Статус ответа ПО:', res.status, res.statusText);
          if (res.status === 401) {
            throw new Error('Токен недействителен. Пожалуйста, войдите заново.');
          }
          if (!res.ok) throw new Error('Не удалось загрузить список ПО');
          return res.json();
        })
        .then(data => {
          console.log('Полученные данные ПО:', data);
          if (!Array.isArray(data)) {
            throw new Error('Данные не являются массивом');
          }
          const options = data.map(item => ({
            value: item.id,
            label: `${item.name}${item.inner_name ? ` (${item.inner_name})` : ''}${item.release_date ? ` - ${new Date(item.release_date).toLocaleDateString()}` : ''}`,
            id: item.id,
            name: item.name,
            inner_name: item.inner_name,
            release_date: item.release_date
          }));
          console.log('Сформированные options ПО:', options);
          setSoftwareOptions(options);
        })
        .catch(err => {
          console.error('Ошибка загрузки ПО:', err);
          setSoftwareError(err.message);
        })
        .finally(() => {
          setLoadingSoftware(false);
        });
    } else {
      console.log('Токен отсутствует, пропускаем загрузку ПО');
      setSoftwareError('Для загрузки списка ПО требуется авторизация');
    }
  }, [token]);

  // Загружаем модели тракторов
  useEffect(() => {
    if (token) {
      setLoadingTractors(true);
      setTractorError(null);
      
      fetch(`http://${ip}/tractors/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          console.log('Статус ответа тракторов:', res.status, res.statusText);
          if (res.status === 401) {
            throw new Error('Токен недействителен. Пожалуйста, войдите заново.');
          }
          if (!res.ok) throw new Error('Не удалось загрузить модели тракторов');
          return res.json();
        })
        .then(data => {
          console.log('✅ Полученные данные тракторов:', data);
          
          if (!data) {
            throw new Error('Получены пустые данные');
          }

          let tractorsArray = [];
          
          if (Array.isArray(data)) {
            tractorsArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            tractorsArray = data.data;
          } else if (data.items && Array.isArray(data.items)) {
            tractorsArray = data.items;
          } else if (data.results && Array.isArray(data.results)) {
            tractorsArray = data.results;
          } else {
            console.log('Неизвестная структура данных:', data);
            tractorsArray = [];
          }

          console.log('Обработанный массив тракторов:', tractorsArray);

          if (tractorsArray.length === 0) {
            console.log('Массив тракторов пуст');
            setTractorOptions([]);
            return;
          }

          // Создаем опции для react-select с отображением модели и VIN
          const options = tractorsArray.map(item => {
            console.log('Обработка элемента трактора:', item);
            
            // Формируем метку с моделью и VIN
            let label = '';
            if (item.model && item.vin) {
              label = `${item.model} (VIN: ${item.vin})`;
            } else if (item.model) {
              label = item.model;
            } else if (item.vin) {
              label = `VIN: ${item.vin}`;
            } else {
              label = `Трактор ${item.id || 'без названия'}`;
            }

            // Используем id как значение
            const value = item.id;

            return {
              value: value,
              label: label,
              model: item.model,
              vin: item.vin,
              oh_hour: item.oh_hour,
              region: item.region,
              consumer: item.consumer,
              serv_center: item.serv_center,
              original: item
            };
          });

          console.log('✅ Сформированные options тракторов:', options);
          setTractorOptions(options);
        })
        .catch(err => {
          console.error('❌ Ошибка загрузки моделей тракторов:', err);
          setTractorError(err.message);
        })
        .finally(() => {
          setLoadingTractors(false);
        });
    } else {
      console.log('Токен отсутствует, пропускаем загрузку тракторов');
      setTractorError('Для загрузки списка тракторов требуется авторизация');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const file = form.elements.file.files[0];
    if (!file) {
      alert('Пожалуйста, выберите файл ПО');
      return;
    }

    if (!selectedRelevance) {
      alert('Пожалуйста, выберите актуальность (Актуальное/Устаревшее)');
      return;
    }

    if (!selectedStatus) {
      alert('Пожалуйста, выберите статус (Серийное/Опытное/В эксплуатации)');
      return;
    }

    if (!skipValidation && selectedComponents.length === 0) {
      alert('Пожалуйста, выберите хотя бы один компонент и часть');
      return;
    }

    // Формируем FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Отправляем актуальность
    formData.append('is_actual', selectedRelevance.value === 'actual');
    
    // Отправляем статус
    formData.append('status', selectedStatus.value);
    
    // Отправляем массив всех выбранных моделей
    selectedComponents.forEach(opt => {
      formData.append('component_models', opt.model);
    });

    // Отправляем массив всех выбранных номеров частей
    selectedComponents.forEach(opt => {
      if (opt?.part_type == null) {
        alert(`Ошибка: у компонента "${opt?.model}" нет типа части`);
        return;
      }
      formData.append('part_type', opt.part_type);
    });

    // Отправляем предыдущую версию ПО если выбрана
    if (selectedPreviousVersion) {
      formData.append('previous_sw_version_str', selectedPreviousVersion.value.toString());
    }

    // Добавляем производителя (пока заглушка)
    if (selectedProducer) {
      formData.append('producer', selectedProducer.value);
    }

    // Добавляем модель трактора - отправляем ID трактора
    if (selectedTractorModel) {
      formData.append('tractor_id', selectedTractorModel.value);
      // Также можно отправить отдельно модель и VIN, если нужно
      formData.append('tractor_model', selectedTractorModel.model);
      formData.append('tractor_vin', selectedTractorModel.vin);
    }

    // Для отладки
    console.log('Отправляемые данные:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch(`http://${ip}/software/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() || 'No content' };
      }

      if (!response.ok) {
        console.error('Ошибка:', data);
        const errMsg = data.detail 
          ? JSON.stringify(data.detail, null, 2)
          : data.message || 'Unknown error';
        throw new Error(`HTTP ${response.status}:\n${errMsg}`);
      }

      onSubmit?.(data);
    } catch (err) {
      console.error('❌ Ошибка:', err);
      alert(`Ошибка: ${err.message}`);
    }
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      color: '#333',
      height: '40px',
      width: '100%',
      border: '1px solid',
      borderColor: state.isFocused ? '#13be00' : '#ccc',
      boxSizing: 'border-box',
      fontSize: isMobile ? '14px':'16px',
      cursor: 'pointer',
      transition: 'border-color 0.15s ease',
      outline: 'none',
      boxShadow: 'none',
      backgroundColor: 'white',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 200,
      padding: '4px 0',
      backgroundColor: 'white'
    }),
    option: (base, state) => ({
      ...base,
      color: '#333',
      backgroundColor: state.isFocused ? '#e6f7e4' : 'white',
      '&:hover': {
        backgroundColor: '#e6f7e4',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: '#333',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e6f7e4',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#333',
    }),
  };

  return (
    <div className="add-po-form-container">
      {!isMobile ? (
        <button onClick={onBack} className="add-po-back-button">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : null}
          

      <h3 className="add-po-title">Добавление нового ПО</h3>

      <form className="add-po-form" onSubmit={handleSubmit}>

        {/* Производитель */}
        <div className="add-po-field">
          <label className="add-po-label">Производитель</label>
          <Select
            options={producerOptions}
            value={selectedProducer}
            onChange={setSelectedProducer}
            placeholder="Выберите производителя"
            classNamePrefix="add-po-select"
            isClearable={true}
            isSearchable={true}
            styles={selectStyles}
          />
        </div>

        {/* Модель трактора с VIN */}
        <div className="add-po-field">
          <label className="add-po-label">Трактор (модель и VIN)</label>
          <Select
            options={tractorOptions}
            value={selectedTractorModel}
            onChange={setSelectedTractorModel}
            placeholder="Выберите трактор по модели или VIN"
            classNamePrefix="add-po-select"
            isClearable={true}
            isSearchable={true}
            isLoading={loadingTractors}
            isDisabled={!token || loadingTractors}
            noOptionsMessage={() => {
              if (!token) return "Требуется авторизация";
              if (loadingTractors) return "Загрузка...";
              if (tractorError) return tractorError;
              if (tractorOptions.length === 0) return "Нет доступных тракторов";
              return null;
            }}
            styles={selectStyles}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
            filterOption={(option, searchText) => {
              // Поиск по модели и VIN
              const searchLower = searchText.toLowerCase();
              return (
                option.data.model?.toLowerCase().includes(searchLower) ||
                option.data.vin?.toLowerCase().includes(searchLower) ||
                option.label.toLowerCase().includes(searchLower)
              );
            }}
          />
          {tractorError && token && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Ошибка загрузки: {tractorError}
            </div>
          )}
          {!loadingTractors && tractorOptions.length === 0 && token && !tractorError && (
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              Нет данных для отображения. Проверьте консоль браузера (F12)
            </div>
          )}
        </div>

        {/* Мультивыбор компонентов и частей */}
        <div className="add-po-field">
          <label className="add-po-label">Агрегат</label>
          <Select
            isMulti
            options={componentOptions.map(item => ({
              value: `${item.model}___${item.part_type}`,
              label: item['model(part)'],
              model: item.model,
              part_type: item.part_type
            }))}
            value={selectedComponents}
            onChange={(selected) => {
              setSelectedComponents(selected || []);
            }}
            placeholder="Выберите компонент и часть"
            classNamePrefix="add-po-select"
            isDisabled={componentOptions.length === 0}
            noOptionsMessage={() => "Нет доступных компонентов"}
            data-testid="component-select"
            styles={selectStyles}
          />
        </div>

        {/* Предыдущая версия ПО */}
        <div className="add-po-field">
          <label className="add-po-label">Предыдущая версия ПО</label>
          <Select
            options={softwareOptions}
            value={selectedPreviousVersion}
            onChange={setSelectedPreviousVersion}
            placeholder="Выберите предыдущую версию ПО (необязательно)"
            classNamePrefix="add-po-select"
            isClearable={true}
            isSearchable={true}
            isLoading={loadingSoftware}
            isDisabled={!token || loadingSoftware}
            noOptionsMessage={() => {
              if (!token) return "Требуется авторизация";
              if (loadingSoftware) return "Загрузка...";
              if (softwareError) return softwareError;
              if (softwareOptions.length === 0) return "Нет доступных версий ПО";
              return null;
            }}
            styles={selectStyles}
          />
          {softwareError && token && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Ошибка загрузки: {softwareError}
            </div>
          )}
        </div>

        {/* Актуальность (Актуальное/Устаревшее) */}
        <div className="add-po-field">
          <label className="add-po-label">Актуальность</label>
          <Select
            options={relevanceOptions}
            value={selectedRelevance}
            onChange={setSelectedRelevance}
            placeholder="Выберите актуальность"
            classNamePrefix="add-po-select"
            isClearable={false}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        {/* Статус (Серийное/Опытное/В эксплуатации) */}
        <div className="add-po-field">
          <label className="add-po-label">Статус</label>
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Выберите статус"
            classNamePrefix="add-po-select"
            isClearable={false}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        {/* Дата релиза */}
        <div className="add-po-field">
          <label className="add-po-label">Дата релиза</label>
          <input
            type="date"
            name="releaseDate"
            className="add-po-input"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Файл */}
        <div className="add-po-field">
          <label className="add-po-label">Файл ПО *</label>
          <input
            type="file"
            name="file"
            required
            className="add-po-input"
            data-testid='filePo'
            accept=".bin,.hex,.zip,.elf,.doc,.docx"
          />
        </div>

        {/* Описание */}
        <div className="add-po-field">
          <label className="add-po-label">Описание</label>
          <textarea
            name="description"
            placeholder="Что изменено..."
            rows="4"
            className="add-po-textarea"
          />
        </div>

        <button type="submit" className="add-po-submit-button">
          Добавить ПО
        </button>
      </form>
    </div>
  );
}