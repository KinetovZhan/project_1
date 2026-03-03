import { useState, useEffect } from 'react';
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { useAuth } from '../auth/AuthContext.jsx';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { api, buildApiUrl } from '../fetchAPI.js';

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
  
  // Состояния для производителей
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);
  
  const { token } = useAuth();
  const isMobile = useCheckMobile();

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

   // Загрузка компонентов с частями
   // Загрузка компонентов с частями
  useEffect(() => {
    api.get('search/component-parts/')
    api.get('search/component-parts/')
      .then(data => {
        console.log('Полученные данные компонентов:', data);
        setComponentOptions(data);
      })
      .catch(err => {
        console.error('Ошибка загрузки компонентов:', err);
        alert('Не удалось загрузить список компонентов');
      });
  }, []);

  // Загрузка списка ПО (для предыдущих версий)
  // Загрузка списка ПО (для предыдущих версий)
  useEffect(() => {
    if (!token) {
      setSoftwareError('Для загрузки списка ПО требуется авторизация');
      return;
    }

    setLoadingSoftware(true);
    setSoftwareError(null);
    if (!token) {
      setSoftwareError('Для загрузки списка ПО требуется авторизация');
      return;
    }

    setLoadingSoftware(true);
    setSoftwareError(null);

    api.get('software/')
      .then(data => {
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
        setSoftwareOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки ПО:', err);
        setSoftwareError(err.message);
      })
      .finally(() => setLoadingSoftware(false));
    api.get('software/')
      .then(data => {
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
        setSoftwareOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки ПО:', err);
        setSoftwareError(err.message);
      })
      .finally(() => setLoadingSoftware(false));
  }, [token]);

  // Загрузка производителей (из того же эндпоинта ПО)
  // Загрузка производителей (из того же эндпоинта ПО)
  useEffect(() => {
    if (!token) {
      setProducerError('Для загрузки производителей требуется авторизация');
      return;
    }

    setLoadingProducers(true);
    setProducerError(null);
    if (!token) {
      setProducerError('Для загрузки производителей требуется авторизация');
      return;
    }

    setLoadingProducers(true);
    setProducerError(null);

    api.get('software/')
      .then(data => {
        const producers = data
          .map(item => item.producer)
          .filter(producer => producer && producer.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
        
        const options = producers.map(producer => ({ value: producer, label: producer }));
        setProducerOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки производителей:', err);
        setProducerError(err.message);
      })
      .finally(() => setLoadingProducers(false));
    api.get('software/')
      .then(data => {
        const producers = data
          .map(item => item.producer)
          .filter(producer => producer && producer.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
        
        const options = producers.map(producer => ({ value: producer, label: producer }));
        setProducerOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки производителей:', err);
        setProducerError(err.message);
      })
      .finally(() => setLoadingProducers(false));
  }, [token]);

  // Загрузка тракторов
  // Загрузка тракторов
  useEffect(() => {
    if (!token) {
      setTractorError('Для загрузки тракторов требуется авторизация');
      return;
    }

    setLoadingTractors(true);
    setTractorError(null);

    api.get('tractors/')
      .then(data => {
        let tractorsArray = [];
        if (Array.isArray(data)) {
          tractorsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          tractorsArray = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          tractorsArray = data.items;
        } else if (data.results && Array.isArray(data.results)) {
          tractorsArray = data.results;
        }

        const options = tractorsArray.map(item => ({
          value: item.id,
          label: item.model && item.vin 
            ? `${item.model} (VIN: ${item.vin})`
            : item.model || (item.vin ? `VIN: ${item.vin}` : `Трактор ${item.id}`),
          model: item.model,
          vin: item.vin,
          oh_hour: item.oh_hour,
          region: item.region,
          consumer: item.consumer,
          serv_center: item.serv_center,
          original: item
        }));
    if (!token) {
      setTractorError('Для загрузки тракторов требуется авторизация');
      return;
    }

    setLoadingTractors(true);
    setTractorError(null);

    api.get('tractors/')
      .then(data => {
        let tractorsArray = [];
        if (Array.isArray(data)) {
          tractorsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          tractorsArray = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          tractorsArray = data.items;
        } else if (data.results && Array.isArray(data.results)) {
          tractorsArray = data.results;
        }

        const options = tractorsArray.filter(item => item.vin && item.vin.includes('system')).map(item => ({
          value: item.id,
          label: item.model && item.vin 
            ? `${item.model}`
            : item.model,
          model: item.model,
          vin: item.vin,
          oh_hour: item.oh_hour,
          region: item.region,
          consumer: item.consumer,
          serv_center: item.serv_center,
          original: item
        }));

        setTractorOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки тракторов:', err);
        setTractorError(err.message);
      })
      .finally(() => setLoadingTractors(false));
        setTractorOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки тракторов:', err);
        setTractorError(err.message);
      })
      .finally(() => setLoadingTractors(false));
  }, [token]);

  // Обработчики для производителя
  // Обработчики для производителя
  const handleProducerCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setProducerOptions(prev => [...prev, newOption]);
    setSelectedProducer(newOption);
  };

  const handleProducerChange = (selectedOption) => {
    setSelectedProducer(selectedOption);
  };

  // Отправка формы (оставляем fetch, но используем buildApiUrl для URL)
  // Отправка формы (оставляем fetch, но используем buildApiUrl для URL)
  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const file = form.elements.file.files[0];
    if (!file) {
      alert('Пожалуйста, выберите файл ПО');
      return;
    }

    if (!selectedRelevance) {
      alert('Пожалуйста, выберите актуальность');
      alert('Пожалуйста, выберите актуальность');
      return;
    }

    if (!selectedStatus) {
      alert('Пожалуйста, выберите статус');
      alert('Пожалуйста, выберите статус');
      return;
    }

    if (!skipValidation && selectedComponents.length === 0) {
      alert('Пожалуйста, выберите хотя бы один компонент и часть');
      return;
    }

    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.') || file.name;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileNameWithoutExt);
    formData.append('inner_name', fileNameWithoutExt);
    formData.append('is_actual', selectedRelevance.value === 'actual');
    formData.append('status', selectedStatus.value);
    
    selectedComponents.forEach(opt => {
      formData.append('component_models', opt.model);
    });

    selectedComponents.forEach(opt => {
      if (opt?.part_type == null) {
        alert(`Ошибка: у компонента "${opt?.model}" нет типа части`);
        return;
      }
      formData.append('part_type', opt.part_type);
    });

    if (selectedProducer) {
      formData.append('producer', selectedProducer.value);
    }

    if (selectedTractorModel) {
      formData.append('tractor_id', selectedTractorModel.value);
    }

    if (selectedPreviousVersion) {
      formData.append('previous_sw_version', selectedPreviousVersion.value);
    }

    const releaseDate = form.elements.releaseDate.value;
    if (releaseDate) {
      formData.append('release_date', releaseDate);
    }

    const description = form.elements.description.value.trim();
    if (description) {
      formData.append('description', description);
    }

    // Для отладки
    console.log('Отправляемые данные:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      // Используем fetch с URL от buildApiUrl и токеном
      const url = buildApiUrl('software/assign');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type не указываем – браузер установит сам с boundary
          // Content-Type не указываем – браузер установит сам с boundary
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

        const errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      
        if (errorDetail.includes('UniqueViolation') && errorDetail.includes('Software_name_key')) {
          const nameMatch = errorDetail.match(/Key "\(name\)=\((.*?)\)"/);
          const duplicateName = nameMatch ? nameMatch[1] : fileNameWithoutExt;
          alert(`❌ Файл с именем "${duplicateName}" уже существует в системе.\n\nПожалуйста, переименуйте файл или выберите другой.`);
          return;
          return;
        }

        const errMsg = data.detail 
          ? JSON.stringify(data.detail, null, 2)
          : data.message || 'Unknown error';
        throw new Error(`HTTP ${response.status}:\n${errMsg}`);
      }

      // alert('✅ ПО успешно добавлено!');
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
      border: '1px solid #ccc',
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
    }),
    singleValue: (base) => ({
      ...base,
      // color: '#333',
    }),
    placeholder: (base) => ({
      ...base,
      // color: '#999',
    }),
    multiValue: (base) => ({
      ...base,
      // backgroundColor: '#ccc',
    }),
    multiValueLabel: (base) => ({
      ...base,
      // color: '#333',
    }),
  };

  return (
    <div className="add-po-form-container">
      {/* {!isMobile ? (
        <button onClick={onBack} className="add-po-back-button">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : null} */}
          

      <h3 className="add-po-title">Добавление нового ПО</h3>

      <div className='add-po-form-scroll-bar'>

      <form className="add-po-form" onSubmit={handleSubmit}>

        {/* Производитель с возможностью создания нового */}
        <div className="add-po-field">
          <label className="add-po-label">Производитель</label>
          <Creatable
            options={producerOptions}
            value={selectedProducer}
            onChange={handleProducerChange}
            onCreateOption={handleProducerCreate}
            placeholder="Выберите или создайте производителя"
            classNamePrefix="add-po-select"
            isClearable={true}
            isSearchable={true}
            isLoading={loadingProducers}
            isDisabled={!token || loadingProducers}
            noOptionsMessage={() => {
              if (!token) return "Требуется авторизация";
              if (loadingProducers) return "Загрузка...";
              if (producerError) return producerError;
              return "Нет доступных производителей";
            }}
            styles={selectStyles}
            formatCreateLabel={(inputValue) => `Создать: ${inputValue}`}
          />
          {producerError && token && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Ошибка загрузки: {producerError}
            </div>
          )}
        </div>

        {/* Модель трактора с VIN */}
        <div className="add-po-field">
          <label className="add-po-label">Модель трактора</label>
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
          <label className="add-po-label">Узел</label>
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
    </div>

  );
}