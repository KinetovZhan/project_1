import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Select from 'react-select';
import { api } from '../fetchAPI.js'; // Импортируем единый экземпляр api
import Creatable from 'react-select/creatable';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';

export function AddAggForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    type: '',
    model: '',
    comp_ser_num: '',
    tractor_models: [],
    number_of_parts: '',
    producer_comp: ''
  });

  const options = [
    { value: 'dvs', label: 'ДВС' },
    { value: 'kpp', label: 'КПП' },
    { value: 'rk', label: 'РК' },
    { value: 'hydro', label: 'Гидрораспределитель' },
    { value: 'ap', label: 'Автопилот' },
    { value: 'bk', label: 'БК' }
  ];

  const isMobile = useCheckMobile();

  const [tractors, setTractors] = useState([]);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Для react-select нужен формат { value, label }
  const [tractorOptions, setTractorOptions] = useState([]);
  const [selectedTractor, setSelectedTractor] = useState(null);

  // Состояния для производителей
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);

  useEffect(() => {
    const loadTractors = async () => {
      if (!token) {
        setLoadingTractors(false);
        return;
      }
      try {
        setLoadingTractors(true);
        // Используем api.get вместо fetch
        const responseTractorsData = await api.get('/tractors/');
        
        // Сохраняем исходные данные
        setTractors(responseTractorsData);

           // Получаем уникальные модели
        const uniqueModels = responseTractorsData
          .map(t => t.model)
          .filter(model => model && model.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
            // Формируем опции для react-select
        const options = uniqueModels.map(model => ({
          value: model,
          label: model
        }));
      
        
        setTractorOptions(options);
        console.log('Трактора успешно загружены:', responseTractorsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке тракторов:', err);
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
        
        // Используем api.get вместо fetch
        const data = await api.get('/components/');
        
        console.log('Полученные данные компонентов для производителей:', data);
        
        // Извлекаем уникальных производителей
        const producers = data
          .map(item => item.producer_comp)
          .filter(producer => producer && producer.trim() !== '') // убираем пустые и null
          .filter((value, index, self) => self.indexOf(value) === index); // уникальные значения
        
        console.log('Уникальные производители:', producers);
        
        // Формируем опции для react-select
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
    
    // Обновляем formData с выбранным ID трактора
    setFormData(prev => ({
      ...prev,
      selected_tractor_id: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitDataToServer = async () => {
    if (!token) {
      setError('Пользователь не авторизован');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        type: formData.type,
        model: formData.model,
        mounting_date: formData.mounting_date || null,
        comp_ser_num: formData.comp_ser_num || null,
        tractor_id: formData.selected_tractor_id ? parseInt(formData.selected_tractor_id, 10) : null,
        number_of_parts: formData.number_of_parts ? parseInt(formData.number_of_parts, 10) : null,
        producer_comp: formData.producer_comp || null
      };

      console.log('Отправляемые данные:', submitData);

      // Используем api.post вместо fetch
      const responseData = await api.post('/components/', submitData);

      console.log('Агрегат успешно добавлен:', responseData);

      if (typeof onSubmit === 'function') {
        onSubmit(responseData);
      } else if (typeof onBack === 'function') {
        onBack();
      }

    } catch (err) {
      console.error('Ошибка при добавлении агрегата:', err);
      alert(err.message);
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
      producer_comp: inputValue
    }));
  };

  // Обработчик выбора производителя (существующего или нового)
  const handleProducerChange = (selectedOption) => {
    setSelectedProducer(selectedOption);
    setFormData(prev => ({
      ...prev,
      producer_comp: selectedOption ? selectedOption.value : ''
    }));
  };

  return (
    <div className="add-po-form-container uzel">
      {/* {!isMobile ? (
        <button onClick={onBack} className="add-po-back-button">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : null} */}

      <h3 className="add-po-title">Добавление узла</h3>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      <div className='add-po-form-scroll-bar'>

      <form className="add-po-form" onSubmit={handleSubmit}>
        <div className='add-po-field'>
          <label htmlFor="type-select" className='add-po-label'>Тип</label>
          <Select
            id="type-select"
            name="type"
            value={options.find(opt => opt.value === formData.type)}
            onChange={(selected) => handleChange({
              target: { name: 'type', value: selected?.value }
            })}
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
          <label className='add-po-label'>Название</label>
          <input
            type="text"
            name="model"
            placeholder="Введите название"
            value={formData.model}
            onChange={handleChange}
            required
            className='add-po-input'
            disabled={loading}
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Серийный номер</label>
          <input
            type="text"
            name="comp_ser_num"
            placeholder="Введите серийный номер"
            value={formData.comp_ser_num}
            onChange={handleChange}
            className='add-po-input'
            disabled={loading}
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Дата установки</label>
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

        {/* Выбор трактора с использованием react-select */}
        <div className="add-po-field">
          <label className="add-po-label">Модели тракторов</label>
          <Select
            isMulti
            options={tractorOptions}
            value={selectedTractor}
            onChange={handleTractorSelectChange}
            placeholder={loadingTractors ? "Загрузка тракторов..." : "Выберите модель"}
            classNamePrefix="add-po-select"
            isClearable={true}
            isSearchable={true}
            isLoading={loadingTractors}
            noOptionsMessage={() => "Нет доступных тракторов"}
            
            styles={{
              control: (base, state) => ({
                ...base,
                color: '#ccc',
                height: '40px',
                minHeight: '40px',
                width: '100%',
                border: '1px solid',
                borderColor: state.isFocused ? '#13be00' : '#ccc',
                boxSizing: 'border-box',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
                outline: 'none',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#070707'
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
                backgroundColor: state.isSelected ? '#0a0a0a' : 
                                state.isFocused ? '#f0f9ff' : 'white',
                color: state.isSelected ? 'white' : '#1E1E1E',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f0f9ff'
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
              })
            }}
          />
          
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Количество подчастей</label>
          <input
            type="number"
            name="number_of_parts"
            placeholder="Введите количество"
            value={formData.number_of_parts}
            onChange={handleChange}
            className='add-po-input'
            disabled={loading}
          />
        </div>

        {/* Производитель с загрузкой из бэкенда */}
        {/* Производитель с загрузкой из бэкенда */}
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
        borderColor: state.isFocused ? '#f0f9ff' : '#ccc',
        boxSizing: 'border-box',
        fontSize: isMobile ? '12px' : '16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
        outline: 'none',
        boxShadow: 'none',
        backgroundColor: 'white',
        '&:hover': {
          borderColor: '#070707'
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
        // backgroundColor: state.isSelected ? '#f0f9ff' : 
        //                 state.isFocused ? '#f0f9ff' : 'white',
        // color: state.isSelected ? '#333' : '#333',
        cursor: 'pointer',
        '&:hover': {
          // backgroundColor: '#f0f9ff'
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