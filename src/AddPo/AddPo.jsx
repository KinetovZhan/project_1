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
  const [selectedStatus, setSelectedStatus] = useState(null);         // Статус (serial/experienced/in operation)
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [selectedTractorModels, setSelectedTractorModels] = useState([]); // массив выбранных моделей
  const [tractorOptions, setTractorOptions] = useState([]);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [tractorError, setTractorError] = useState(null);
  const [isArchive, setIsArchive] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [isActual, setIsActual] = useState(false);


  // Состояния для производителей
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);

  const { token } = useAuth();
  const isMobile = useCheckMobile();

  // Опции для статуса (software_status)
  const statusOptions = [
    { value: 'serial', label: 'Серийное' },
    { value: 'experienced', label: 'Опытное' },
    { value: 'in operation', label: 'В эксплуатации' },
  ];

  // Загрузка компонентов
  useEffect(() => {
    api.get('components/')
      .then(data => {
        const options = data.map(item => ({
          value: item.id,
          label: `${item.name} (${item.type})`,
          name: item.name,
          type: item.type,
          producer: item.producer,
        }));
        setComponentOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки компонентов:', err);
        alert('Не удалось загрузить список компонентов');
      });
  }, []);

  // Загрузка списка ПО (для предыдущих версий)
  useEffect(() => {
    if (!token) {
      setSoftwareError('Для загрузки списка ПО требуется авторизация');
      return;
    }
    setLoadingSoftware(true);
    setSoftwareError(null);

    api.get('software/')
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Данные не являются массивом');
        const options = data.map(item => ({
          value: item.id,
          label: `${item.filename.slice(33) || ''}${item.release_date ? ` - ${new Date(item.release_date).toLocaleDateString()}` : ''}`,
        }));
        setSoftwareOptions(options);
      })
      .catch(err => {
        console.error('Ошибка загрузки ПО:', err);
        setSoftwareError(err.message);
      })
      .finally(() => setLoadingSoftware(false));
  }, [token]);

  // Загрузка уникальных моделей тракторов
  // useEffect(() => {
  //   if (!token) {
  //     setTractorError('Для загрузки моделей тракторов требуется авторизация');
  //     return;
  //   }
  //   setLoadingTractors(true);
  //   setTractorError(null);

  //   api.get('tractors/')
  //     .then(data => {
  //       const models = [...new Set(data.map(item => item.model).filter(Boolean))];
  //       const options = models.map(model => ({ value: model, label: model }));
  //       setTractorOptions(options);
  //     })
  //     .catch(err => {
  //       console.error('Ошибка загрузки тракторов:', err);
  //       setTractorError(err.message);
  //     })
  //     .finally(() => setLoadingTractors(false));
  // }, [token]);

  useEffect(() => {
  if (!token) {
    setTractorError('Для загрузки моделей тракторов требуется авторизация');
    setTractorOptions([]); // очищаем опции, если нет токена
    return;
  }

  const fetchAllTractorModels = async () => {
    setLoadingTractors(true);
    setTractorError(null);

    const requestBody = {
      component_models: [],
      component_types: [],
      component_producers: [],
      software_status: []
    };

    try {
      const response = await api.post('search/tractor-models', requestBody);
      
      let tractorModels = [];
      if (Array.isArray(response)) {
        tractorModels = response;
      } else if (response && Array.isArray(response.tractor_models)) {
        tractorModels = response.tractor_models;
      } else {
        console.warn('Неожиданный формат ответа:', response);
        tractorModels = [];
      }

      const modelNames = tractorModels
        .map(item => item && item.model)
        .filter(model => typeof model === 'string' && model.trim() !== '')
        .map(model => model.trim());

      const options = modelNames.map(model => ({ value: model, label: model }));
      setTractorOptions(options);
    } catch (err) {
      console.error('Ошибка загрузки моделей тракторов:', err);
      setTractorError(err.message);
    } finally {
      setLoadingTractors(false);
    }
  };

  fetchAllTractorModels();
}, [token]);
  // Загрузка производителей из ПО
  useEffect(() => {
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
  }, [token]);

  // Обработчики для производителя
  const handleProducerCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setProducerOptions(prev => [...prev, newOption]);
    setSelectedProducer(newOption);
  };
  
   const handleModelCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setTractorOptions(prev => [...prev, newOption]);
    setSelectedTractorModels(prev => [...prev, newOption]);
  };
  const handleProducerChange = (selectedOption) => {
    setSelectedProducer(selectedOption);
  };

  // Отправка формы
  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const file = form.elements.file.files[0];
    const instructionFile = form.elements.instructionFile.files[0];

    // Валидация
    if (!file) {
      alert('Пожалуйста, выберите файл ПО');
      return;
    }
    
    if (!selectedStatus) {
      alert('Пожалуйста, выберите статус');
      return;
    }
    if (!selectedProducer) {
      alert('Пожалуйста, укажите производителя');
      return;
    }
    if (selectedTractorModels.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну модель трактора');
      return;
    }
    if (!skipValidation && selectedComponents.length === 0) {
      alert('Пожалуйста, выберите хотя бы один компонент');
      return;
    }

    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.') || file.name;

    const formData = new FormData()
    formData.append('file', file);
    formData.append('instruction_file', instructionFile);

    // Основные поля (имена должны совпадать с ожидаемыми на бэкенде)
    formData.append('software_producer', selectedProducer.value);
    formData.append('software_is_actual', isActual);
    formData.append('software_status', selectedStatus.value);
    formData.append('software_is_archive', isArchive);
    formData.append('software_is_critical', isCritical);
    // Если нужно поле критичности – добавьте отдельно (software_is_critical)

    // Предыдущая версия (опционально)
    if (selectedPreviousVersion) {
      formData.append('previous_sw_version', String(selectedPreviousVersion.value));
    }

    // Модели тракторов (JSON-строка)
    formData.append(
      'software_tractor_models',
      JSON.stringify(selectedTractorModels.map(t => t.value))
    );

    // Данные компонентов (JSON-строки)
    const componentModels = selectedComponents.map(c => c.name);
    const componentTypes = selectedComponents.map(c => c.type);
    const componentProducers = selectedComponents.map(c => c.producer);

    formData.append('component_models', JSON.stringify(componentModels));
    formData.append('component_types', JSON.stringify(componentTypes));
    formData.append('component_producers', JSON.stringify(componentProducers));

    // Дата релиза (опционально)
    const releaseDate = form.elements.releaseDate.value;
    if (releaseDate) {
      formData.append('software_release_date', releaseDate);
    }

    // Описание (опционально)
    const description = form.elements.description.value.trim();
    if (description) {
      formData.append('software_description', description);
    }

    // Отладка
    console.log('Отправляемые данные:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const url = buildApiUrl('software/assign');
      const response = await fetch(url, {
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
        const errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        if (errorDetail.includes('UniqueViolation') && errorDetail.includes('Software_name_key')) {
          alert(`❌ Файл с таким именем уже существует. Переименуйте файл или выберите другой.`);
          return;
        }
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

  const changeArchive = () => setIsArchive(!isArchive);
  const changeActual = () => setIsActual(!isActual);
  const changeCritical = () => setIsCritical(!isCritical);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      color: '#333',
      minHeight: '40px',
      width: '100%',
      border: '1px solid #ccc',
      borderColor: state.isFocused ? '#13be00' : '#ccc',
      boxSizing: 'border-box',
      fontSize: isMobile ? '14px' : '16px',
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
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e0e0e0',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#333',
    }),
  };

  return (
    <div className="add-po-form-container">
      <button onClick={onBack} className="go-back" style={{left:'-50px'}}></button>
      <h3 className="add-po-title">Добавление нового ПО</h3>

      <div className="add-po-form-scroll-bar">
        <form className="add-po-form" onSubmit={handleSubmit}>


          {/* Производитель */}
          <div className="add-po-field">
            <label className="add-po-label">Производитель *</label>
            <Creatable
              options={producerOptions}
              value={selectedProducer}
              onChange={handleProducerChange}
              onCreateOption={handleProducerCreate}
              placeholder="Выберите производителя"
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
              formatCreateLabel={(inputValue) => `Добавить: ${inputValue}`}
            />
            {producerError && token && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                Ошибка загрузки: {producerError}
              </div>
            )}
          </div>

          {/* Модели тракторов (множественный выбор) */}
          <div className="add-po-field">
            <label className="add-po-label">Модели тракторов *</label>
            <Creatable
              isMulti
              options={tractorOptions}
              value={selectedTractorModels}
              onChange={setSelectedTractorModels}
              onCreateOption={handleModelCreate}
              placeholder="Выберите модели тракторов"
              classNamePrefix="add-po-select"
              isClearable={false}
              isSearchable={true}
              isLoading={loadingTractors}
              isDisabled={!token || loadingTractors}
              noOptionsMessage={() => {
                if (!token) return "Требуется авторизация";
                if (loadingTractors) return "Загрузка...";
                if (tractorError) return tractorError;
                return "Нет доступных моделей";
              }}
              styles={selectStyles}
              formatCreateLabel={(inputValue) => `Добавить: ${inputValue}`}
            />
            {tractorError && token && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                Ошибка загрузки: {tractorError}
              </div>
            )}
          </div>

          {/* Выбор компонентов */}
          <div className="add-po-field">
            <label className="add-po-label">Узлы *</label>
            <Select
              isMulti
              options={componentOptions}
              value={selectedComponents}
              onChange={setSelectedComponents}
              placeholder="Выберите узлы"
              classNamePrefix="add-po-select"
              isDisabled={componentOptions.length === 0}
              noOptionsMessage={() => "Нет доступных узлов"}
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
                return "Нет доступных версий ПО";
              }}
              styles={selectStyles}
            />
            {softwareError && token && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                Ошибка загрузки: {softwareError}
              </div>
            )}
          </div>


          {/* Статус */}
          <div className="add-po-field">
            <label className="add-po-label">Назначение *</label>
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Выберите назначение"
              classNamePrefix="add-po-select"
              isClearable={false}
              styles={selectStyles}
            />
          </div>

          <div className="add-po-field actual" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
            <label className="add-po-label" onClick={changeActual} style={{userSelect: 'none'}}>Актуальная версия </label>
            <input
              type="checkbox"
              name="actual"
              className="add-po-input checkbox"
              checked={isActual}
              onChange={changeActual}
            />
          </div>

          <div className="add-po-field critical" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
            <label className="add-po-label" style={{userSelect: 'none'}} onClick={changeCritical}>Критическая версия </label>
            <input
              type="checkbox"
              name="critical"
              className="add-po-input checkbox"
              checked={isCritical}
              onChange={changeCritical}
            />
          </div>

          {/* Архивная версия */}
          <div className="add-po-field archive" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
            <label className="add-po-label" style={{ marginBottom: 0, userSelect: 'none' }} onClick={changeArchive}>Архивная версия</label>
            <input
              type="checkbox"
              name="archive"
              className="add-po-input checkbox"
              checked={isArchive}
              onChange={changeArchive}
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

          {/* Файл ПО */}
          <div className="add-po-field">
            <label className="add-po-label">Файл ПО *</label>
            <input
              type="file"
              name="file"
              required
              className="add-po-input"
              data-testid="filePo"
            />
          </div>

          {/* Файл инструкции */}
          <div className="add-po-field">
            <label className="add-po-label">Файл инструкции</label>
            <input
              type="file"
              name="instructionFile"
              className="add-po-input"
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