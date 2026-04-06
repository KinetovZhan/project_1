import { useState, useEffect } from 'react';
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { useAuth } from '../auth/AuthContext.jsx';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { api, buildApiUrl } from '../fetchAPI.js';

export function AddPoForm({ onBack, onSubmit, skipValidation = false, componentInfo }) {
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
  const [PoName, setPoName] = useState('');

  // Состояния для производителей
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);

  const { token } = useAuth();
  const isMobile = useCheckMobile();

  // Загрузка информации о компоненте и тракторе, если передана
  useEffect(() => {
    if (componentInfo) {
      // Автоматически выбрать компонент и трактор на основе переданной информации
      // Загрузить опции компонентов, если они еще не загружены
      if (componentOptions.length === 0) {
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
            
            // Если передана информация о компоненте, пытаемся найти и выбрать его
            if (componentInfo.component_type) {
              const matchedOption = options.find(opt => opt.type === componentInfo.component_type);
              if (matchedOption) {
                setSelectedComponents([{ ...matchedOption }]);
              }
            }
          })
          .catch(err => console.error('Ошибка загрузки компонентов:', err));
      } else {
        // Если опции уже загружены, сразу пытаемся выбрать компонент
        if (componentInfo.component_type) {
          const matchedOption = componentOptions.find(opt => opt.type === componentInfo.component_type);
          if (matchedOption) {
            setSelectedComponents([{ ...matchedOption }]);
          }
        }
      }

      // Автоматически выбрать трактор, если передана информация о нем
      if (componentInfo.tractor_vin && componentInfo.tractor_model) {
        setSelectedTractorModels([{
          value: componentInfo.tractor_vin,
          label: `${componentInfo.tractor_model} (${componentInfo.tractor_vin})`
        }]);
      }

      // Установить имя ПО на основе информации о компоненте
      if (componentInfo.component_name) {
        setPoName(`${componentInfo.component_name} для ${componentInfo.tractor_model || ''}`);
      }
    }
  }, [componentInfo, componentOptions]);

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
      .catch(err => console.error('Ошибка загрузки компонентов:', err));
  }, []);

  // Загрузка тракторов
  useEffect(() => {
    setLoadingTractors(true);
    api.get('tractors/')
      .then(data => {
        const options = data.map(item => ({
          value: item.vin,
          label: `${item.model} (${item.vin})`,
        }));
        setTractorOptions(options);
        setLoadingTractors(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки тракторов:', err);
        setTractorError(err.message);
        setLoadingTractors(false);
      });
  }, []);

  // Загрузка производителей
  useEffect(() => {
    setLoadingProducers(true);
    api.get('producers/')
      .then(data => {
        const options = data.map(item => ({
          value: item.id,
          label: item.name,
        }));
        setProducerOptions(options);
        setLoadingProducers(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки производителей:', err);
        setProducerError(err.message);
        setLoadingProducers(false);
      });
  }, []);

  // Загрузка предыдущих версий ПО
  useEffect(() => {
    if (selectedComponents.length > 0) {
      setLoadingSoftware(true);
      const componentIds = selectedComponents.map(c => c.value).join(',');
      api.get(`software/versions/?component_ids=${componentIds}`)
        .then(data => {
          const options = data.map(item => ({
            value: item.id,
            label: `${item.name} (${new Date(item.release_date).toLocaleDateString()})`,
          }));
          setSoftwareOptions(options);
          setLoadingSoftware(false);
        })
        .catch(err => {
          console.error('Ошибка загрузки версий ПО:', err);
          setSoftwareError(err.message);
          setLoadingSoftware(false);
        });
    } else {
      setSoftwareOptions([]);
    }
  }, [selectedComponents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Подготовка данных для отправки
    const data = {
      name: formData.get('name') || PoName,
      description: formData.get('description'),
      component_ids: selectedComponents.map(c => c.value),
      previous_sw_version_id: selectedPreviousVersion?.value || null,
      software_status: selectedStatus?.value || 'serial',
      software_producer_id: selectedProducer?.value || null,
      tractor_models: selectedTractorModels.map(t => t.value),
      is_archive: isArchive,
      is_critical: isCritical,
      is_actual: isActual,
      release_date: formData.get('releaseDate'),
    };

    // Отправка файла ПО, если он выбран
    const softwareFile = formData.get('file');
    // Отправка файла инструкции, если он выбран
    const instructionFile = formData.get('instructionFile');

    try {
      // Отправка данных о ПО
      const response = await api.post('software/', data);
      
      // Если файлы были выбраны, загружаем их
      if (softwareFile && softwareFile.size > 0) {
        const fileFormData = new FormData();
        fileFormData.append('file', softwareFile);
        await api.upload(`/software/${response.id}/upload`, fileFormData);
      }
      
      if (instructionFile && instructionFile.size > 0) {
        const instructionFormData = new FormData();
        instructionFormData.append('file', instructionFile);
        await api.upload(`/software/${response.id}/instruction-upload`, instructionFormData);
      }
      
      // Вызов внешнего обработчика, если он передан
      if (onSubmit) {
        onSubmit(response);
      }
      
      // Возврат к предыдущему представлению
      onBack && onBack();
    } catch (error) {
      console.error('Ошибка при добавлении ПО:', error);
      alert(`Ошибка при добавлении ПО: ${error.message}`);
    }
  };

  return (
    <div className="add-po-container">
      <div className="add-po-form">
        <button onClick={onBack} className="add-po-back-button">
          ← Назад
        </button>
        
        <h2>Добавить программное обеспечение</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Имя ПО */}
          <div className="add-po-field">
            <label className="add-po-label">Имя ПО *</label>
            <input
              type="text"
              name="name"
              placeholder="Введите имя ПО"
              className="add-po-input"
              value={PoName}
              onChange={(e) => setPoName(e.target.value)}
              required
            />
          </div>

          {/* Компоненты */}
          <div className="add-po-field">
            <label className="add-po-label">Компоненты *</label>
            <Select
              options={componentOptions}
              value={selectedComponents}
              onChange={setSelectedComponents}
              placeholder="Выберите компоненты"
              isMulti
              classNamePrefix="add-po-select"
              isDisabled={skipValidation && selectedComponents.length > 0}
            />
          </div>

          {/* Предыдущая версия ПО */}
          <div className="add-po-field">
            <label className="add-po-label">Предыдущая версия ПО</label>
            <Select
              options={softwareOptions}
              value={selectedPreviousVersion}
              onChange={setSelectedPreviousVersion}
              placeholder="Выберите предыдущую версию"
              classNamePrefix="add-po-select"
              isLoading={loadingSoftware}
              isClearable
            />
            {softwareError && <div className="error-message">Ошибка загрузки версий: {softwareError}</div>}
          </div>

          {/* Статус */}
          <div className="add-po-field">
            <label className="add-po-label">Статус</label>
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Выберите статус"
              classNamePrefix="add-po-select"
              isClearable
            />
          </div>

          {/* Производитель */}
          <div className="add-po-field">
            <label className="add-po-label">Производитель</label>
            <Select
              options={producerOptions}
              value={selectedProducer}
              onChange={setSelectedProducer}
              placeholder="Выберите производителя"
              classNamePrefix="add-po-select"
              isLoading={loadingProducers}
              isClearable
            />
            {producerError && <div className="error-message">Ошибка загрузки производителей: {producerError}</div>}
          </div>

          {/* Модели тракторов */}
          <div className="add-po-field">
            <label className="add-po-label">Модели тракторов</label>
            <Select
              options={tractorOptions}
              value={selectedTractorModels}
              onChange={setSelectedTractorModels}
              placeholder="Выберите модели тракторов"
              classNamePrefix="add-po-select"
              isMulti
              isLoading={loadingTractors}
              isClearable
            />
            {tractorError && <div className="error-message">Ошибка загрузки тракторов: {tractorError}</div>}
          </div>

          {/* Флажки */}
          <div className="add-po-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={isArchive}
                onChange={(e) => setIsArchive(e.target.checked)}
              />
              В архиве
            </label>
            <label>
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
              />
              Критическое обновление
            </label>
            <label>
              <input
                type="checkbox"
                checked={isActual}
                onChange={(e) => setIsActual(e.target.checked)}
              />
              Актуальное
            </label>
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