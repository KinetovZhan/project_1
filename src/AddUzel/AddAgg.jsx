import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Select from 'react-select';
import { api } from '../fetchAPI.js';
import Creatable from 'react-select/creatable';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';

export function AddAggForm({ onBack, onSubmit, formData: externalFormData, setFormData: setExternalFormData, showAlert }) {
  const [formData, setFormData] = useState(externalFormData || {
    type: '',
    name: '',
    tractor_models: [],
    mounting_date: '', 
    producer: ''
  });

  const options = [
    { value: 'DVS', label: 'ДВС' },
    { value: 'KPP', label: 'КПП' },
    { value: 'RK', label: 'РК' },
    { value: 'HR', label: 'Гидрораспределитель' },
    { value: 'BK', label: 'БК' },
    { value: 'AUTOPILOT', label: 'Автопилот' }
  ];

  const isMobile = useCheckMobile();

  const [tractors, setTractors] = useState([]);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Для react-select нужен формат { value, label }
  const [tractorOptions, setTractorOptions] = useState([]);
  const [selectedTractor, setSelectedTractor] = useState(() => {
    if (externalFormData && externalFormData.selected_tractor_id) {
      return { value: externalFormData.selected_tractor_id, label: externalFormData.tractor_model || '' };
    }
    return null;
  });

  // Состояния для производителей
  const [selectedProducer, setSelectedProducer] = useState(() => {
    if (externalFormData && externalFormData.producer) {
      return { value: externalFormData.producer, label: externalFormData.producer };
    }
    return null;
  });
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);

  // Состояние для выбранного типа
  const [selectedType, setSelectedType] = useState(() => {
    if (externalFormData && externalFormData.type) {
      return options.find(opt => opt.value === externalFormData.type);
    }
    return null;
  });

  // Обновляем внешний formData при изменении внутреннего состояния
  useEffect(() => {
    if (setExternalFormData) {
      setExternalFormData(formData);
    }
  }, [formData, setExternalFormData]);

  useEffect(() => {
    const loadTractors = async () => {
      if (!token) {
        setLoadingTractors(false);
        return;
      }
      try {
        setLoadingTractors(true);
        const responseTractorsData = await api.get('/tractors/');
        
        setTractors(responseTractorsData);

        const uniqueModels = responseTractorsData
          .map(t => t.model)
          .filter(model => model && model.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
        
        const options = uniqueModels.map(model => ({
          value: model,
          label: model
        }));
      
        setTractorOptions(options);
        console.log('Трактора успешно загружены:', responseTractorsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке тракторов:', err);
        showAlert('Ошибка при загрузке тракторов', 'error');
        setError('Не удалось загрузить список тракторов');
      } finally {
        setLoadingTractors(false);
      }
    };
    loadTractors();
  }, [token]);

  // Загружаем список производителей из компонентов через api
  useEffect(() => {
    const loadProducers = async () => {
      if (!token) {
        setLoadingProducers(false);
        return;
      }
      try {
        setLoadingProducers(true);
        setProducerError(null);
        
        const data = await api.get('/components/');
        
        console.log('Полученные данные компонентов для производителей:', data);
        
        const producers = data
          .map(item => item.producer)
          .filter(producer => producer && producer.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
        
        console.log('Уникальные производители:', producers);
        
        const options = producers.map(producer => ({
          value: producer,
          label: producer
        }));
        
        setProducerOptions(options);
      } catch (err) {
        console.error('Ошибка загрузки производителей:', err);
        setProducerError(err.message);
      } finally {
        setLoadingProducers(false);
      }
    };
    
    loadProducers();
  }, [token]);
  
  // Обработчик выбора трактора из react-select
  const handleTractorSelectChange = (selectedOption) => {
    setSelectedTractor(selectedOption);
    
    setFormData(prev => ({
      ...prev,
      selected_tractor_id: selectedOption ? selectedOption.value : '',
      tractor_model: selectedOption ? selectedOption.label : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (selected) => {
    setSelectedType(selected);
    setFormData(prev => ({
      ...prev,
      type: selected?.value || ''
    }));
  };

  const submitDataToServer = async () => {
    if (!token) {
      if (showAlert) {
        showAlert('Пользователь не авторизован', 'error');
      } else {
        setError('Пользователь не авторизован');
      }
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        type: formData.type,
        name: formData.name,
        mounting_date: formData.mounting_date || null,
        tractor_id: formData.selected_tractor_id ? parseInt(formData.selected_tractor_id, 10) : null,
        producer: formData.producer || null
      };

      console.log('Отправляемые данные:', submitData);

      const responseData = await api.post('/components/', submitData);

      console.log('Агрегат успешно добавлен:', responseData);

      // Сбрасываем форму после успешной отправки
      const resetFormData = {
        type: '',
        name: '',
        tractor_models: [],
        mounting_date: '',
        producer: '',
        selected_tractor_id: '',
        tractor_model: ''
      };
      
      setFormData(resetFormData);
      setSelectedType(null);
      setSelectedTractor(null);
      setSelectedProducer(null);
      
      if (setExternalFormData) {
        setExternalFormData(resetFormData);
      }

      if (typeof onSubmit === 'function') {
        onSubmit(responseData);
      } else if (typeof onBack === 'function') {
        onBack();
      }

    } catch (err) {
      console.error('Ошибка при добавлении агрегата:', err);
      if (showAlert) {
        showAlert(err.message, 'error');
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitDataToServer();
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
      fontSize:(isMobile?'12px':'16px'),
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

  // Обработчик создания нового производителя
  const handleProducerCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setProducerOptions(prev => [...prev, newOption]);
    setSelectedProducer(newOption);
    setFormData(prev => ({
      ...prev,
      producer: inputValue
    }));
  };

  // Обработчик выбора производителя
  const handleProducerChange = (selectedOption) => {
    setSelectedProducer(selectedOption);
    setFormData(prev => ({
      ...prev,
      producer: selectedOption ? selectedOption.value : ''
    }));
  };

  // Обработчик создания новой модели трактора
  const handleModelCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setTractorOptions(prev => [...prev, newOption]);
    setSelectedTractor(newOption);
    setFormData(prev => ({
      ...prev,
      selected_tractor_id: inputValue,
      tractor_model: inputValue
    }));
  };

  return (
    <div className="add-po-form-container uzel">
      <button onClick={onBack} className="go-back" style={{left:'-50px'}}></button>
      <h3 className="add-po-title">Добавление узла</h3>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      <div className='add-po-form-scroll-bar'>
        <form className="add-po-form" onSubmit={handleSubmit}>
          <div className='add-po-field'>
            <label htmlFor="type-select" className='add-po-label'>Тип *</label>
            <Select
              id="type-select"
              name="type"
              value={selectedType}
              onChange={handleTypeChange}
              options={options}
              placeholder="Выберите узел"
              isDisabled={loading}
              styles={{
                menu: (base) => ({ 
                  ...base,
                  zIndex: 9999,
                  position: 'absolute',
                  backgroundColor: 'white',
                  marginBottom: '5px'
                }),
                menuPortal: (base) => ({  
                  ...base,
                  zIndex: 9999
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: 150,
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  color: 'black',
                  border: '1px solid rgba(217, 217, 217, 1)',
                  scrollbarWidth: 'thin',
                  zIndex: 9999
                })
              }}
            />
          </div>

          <div className='add-po-field'>
            <label className='add-po-label'>Название *</label>
            <input
              type="text"
              name="name"
              placeholder="Введите название"
              value={formData.name}
              onChange={handleChange}
              required
              className='add-po-input'
              disabled={loading}
            />
          </div>

          <div className='add-po-field'>
            <label className='add-po-label'>Дата установки *</label>
            <input
              type="date"
              name="mounting_date"
              value={formData.mounting_date}
              onChange={handleChange}
              className='add-po-input'
              disabled={loading}
              style={{color:'grey'}}
            />
          </div>

          <div className="add-po-field">
            <label className="add-po-label">Модель трактора *</label>
            <Creatable
              options={tractorOptions}
              value={selectedTractor}
              onChange={handleTractorSelectChange}
              onCreateOption={handleModelCreate}
              placeholder="Выберите модель трактора"
              classNamePrefix="add-po-select"
              isClearable={true}
              isSearchable={true}
              isLoading={loadingTractors}
              menuPlacement="top"
              isDisabled={!token || loadingTractors}
              noOptionsMessage={() => {
                if (!token) return "Требуется авторизация";
                if (loadingTractors) return "Загрузка...";
                if (error) return error;
                return "Нет доступных моделей";
              }}
              formatCreateLabel={(inputValue) => `Добавить: ${inputValue}`}
              styles={{
                control: (base, state) => ({
                  ...base,
                  color: '#333',
                  height: '40px',
                  width: '100%',
                  border: '1px solid',
                  borderColor: state.isFocused ? '#13be00' : '#ccc',
                  boxSizing: 'border-box',
                  fontSize: isMobile ? '12px' : '16px',
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
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#e6f7e4'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  position: 'absolute',
                  backgroundColor: 'white',
                  marginBottom: '5px'
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
          </div>

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
              menuPlacement="top" 
              isDisabled={!token || loadingProducers}
              noOptionsMessage={() => {
                if (!token) return "Требуется авторизация";
                if (loadingProducers) return "Загрузка...";
                if (producerError) return producerError;
                if (producerOptions.length === 0) return "Нет доступных производителей";
                return null;
              }}
              formatCreateLabel={(inputValue) => `Создать: ${inputValue}`}
              styles={{
                control: (base, state) => ({
                  ...base,
                  color: '#333',
                  height: '40px',
                  width: '100%',
                  border: '1px solid',
                  borderColor: state.isFocused ? '#13be00' : '#ccc',
                  boxSizing: 'border-box',
                  fontSize: isMobile ? '12px' : '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'white',
                  '&:hover': {
                    borderColor: '#13be00'
                  }
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
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#e6f7e4'
                  }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#1E1E1E'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#999'
                }),
                loadingIndicator: (base) => ({
                  ...base,
                  color: '#0c0c0c'
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  position: 'absolute',
                  backgroundColor: 'white',
                  marginBottom: '5px'
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
            {producerError && token && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                Ошибка загрузки: {producerError}
              </div>
            )}
          </div>

          <button
            type="submit"
            className='add-po-submit-button'
            disabled={loading || loadingTractors}
          >
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </form>
      </div>
    </div>
  );
}