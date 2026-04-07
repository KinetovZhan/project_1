import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Select from 'react-select';
import { api } from '../fetchAPI.js';
import Creatable from 'react-select/creatable';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';

export function AddAggForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    tractor_models: [],
    mounting_date: '', 
    producer: '',
    selected_tractor_id: ''
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

  const [tractorOptions, setTractorOptions] = useState([]);
  const [selectedTractor, setSelectedTractor] = useState(null);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);

  useEffect(() => {
    const loadTractors = async () => {
      if (!token) { setLoadingTractors(false); return; }
      try {
        setLoadingTractors(true);
        const responseTractorsData = await api.get('/tractors/');
        setTractors(responseTractorsData);
        const uniqueModels = responseTractorsData
          .map(t => t.model)
          .filter(model => model && model.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
        const opts = uniqueModels.map(model => ({ value: model, label: model }));
        setTractorOptions(opts);
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

  useEffect(() => {
    const loadProducers = async () => {
      if (!token) { setLoadingProducers(false); return; }
      try {
        setLoadingProducers(true);
        setProducerError(null);
        const data = await api.get('/components/');
        const producers = data
          .map(item => item.producer)
          .filter(producer => producer && producer.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index);
        const opts = producers.map(producer => ({ value: producer, label: producer }));
        setProducerOptions(opts);
      } catch (err) {
        console.error('Ошибка загрузки производителей:', err);
        setProducerError(err.message);
      } finally {
        setLoadingProducers(false);
      }
    };
    loadProducers();
  }, [token]);
  
  const handleTractorSelectChange = (selectedOption) => {
    setSelectedTractor(selectedOption);
    setFormData(prev => ({
      ...prev,
      selected_tractor_id: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitDataToServer = async () => {
    if (!token) { setError('Пользователь не авторизован'); return; }
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
      const responseData = await api.post('/components/', submitData);
      if (typeof onSubmit === 'function') onSubmit(responseData);
      else if (typeof onBack === 'function') onBack();
    } catch (err) {
      console.error('Ошибка при добавлении агрегата:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); submitDataToServer(); };

  const handleProducerCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setProducerOptions(prev => [...prev, newOption]);
    setSelectedProducer(newOption);
    setFormData(prev => ({ ...prev, producer: inputValue }));
  };

  const handleProducerChange = (selectedOption) => {
    setSelectedProducer(selectedOption);
    setFormData(prev => ({ ...prev, producer: selectedOption ? selectedOption.value : '' }));
  };

  const handleModelCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setTractorOptions(prev => [...prev, newOption]);
    setSelectedTractor(newOption);
  };

  return (
    <div className="add-po-form-container uzel">
      <button onClick={onBack} className="go-back" style={{left:'-50px'}} data-testid="back-button"></button>
      <h3 className="add-po-title">Добавление узла</h3>

      {error && (
        <div className="error-message" data-testid="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      <div className='add-po-form-scroll-bar'>
        <form className="add-po-form" onSubmit={handleSubmit} data-testid="add-agg-form">
          
          {/* 🔹 Поле Тип - ДОБАВЛЕНО data-testid */}
          <div className='add-po-field'>
            <label htmlFor="type-select" className='add-po-label'>Тип *</label>
            <Select
              id="type-select"
              name="type"
              data-testid="type-select"
              value={options.find(opt => opt.value === formData.type)}
              onChange={(selected) => handleChange({
                target: { name: 'type', value: selected?.value }
              })}
              options={options}
              placeholder="Выберите узел"
              isDisabled={loading}
              styles={{
                menu: (base) => ({ ...base, zIndex: 9999, position: 'absolute', backgroundColor: 'white', marginBottom: '5px' }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menuList: (base) => ({
                  ...base, maxHeight: 150, overflowY: 'auto', backgroundColor: 'white',
                  color: 'black', border: '1px solid rgba(217, 217, 217, 1)', scrollbarWidth: 'thin', zIndex: 9999
                })
              }}
            />
          </div>

          {/* 🔹 Поле Название */}
          <div className='add-po-field'>
            <label htmlFor="name-input" className='add-po-label'>Название *</label>
            <input
              id="name-input"
              data-testid="name-input"
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

          {/* 🔹 Поле Дата установки */}
          <div className='add-po-field'>
            <label htmlFor="mounting_date-input" className='add-po-label'>Дата установки *</label>
            <input
              id="mounting_date-input"
              data-testid="date-input"
              type="date"
              name="mounting_date"
              value={formData.mounting_date}
              onChange={handleChange}
              className='add-po-input'
              disabled={loading}
              style={{color:'grey'}}
            />
          </div>

          {/* 🔹 Поле Производитель - ДОБАВЛЕНО data-testid */}
          <div className="add-po-field">
            <label htmlFor="producer-select" className="add-po-label">Производитель *</label>
            <Creatable
              id="producer-select"
              data-testid="producer-select"
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
                  ...base, color: '#333', height: '40px', width: '100%',
                  border: '1px solid', borderColor: state.isFocused ? '#f0f9ff' : '#ccc',
                  boxSizing: 'border-box', fontSize: isMobile ? '12px' : '16px',
                  cursor: 'pointer', transition: 'border-color 0.15s ease',
                  outline: 'none', boxShadow: 'none', backgroundColor: 'white',
                  '&:hover': { borderColor: '#070707' }
                }),
                menuList: (base) => ({ ...base, maxHeight: 200, padding: '4px 0', backgroundColor: 'white' }),
                option: (base, state) => ({ ...base, cursor: 'pointer', '&:hover': {} }),
                singleValue: (base) => ({ ...base, color: '#1E1E1E' }),
                placeholder: (base) => ({ ...base, color: '#999' }),
                loadingIndicator: (base) => ({ ...base, color: '#0c0c0c' }),
                menu: (base) => ({ ...base, zIndex: 9999, position: 'absolute', backgroundColor: 'white', marginBottom: '5px' }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
            {producerError && token && (
              <div data-testid="producer-error" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                Ошибка загрузки: {producerError}
              </div>
            )}
          </div>

          {/* 🔹 Кнопка - ДОБАВЛЕНО data-testid */}
          <button
            type="submit"
            className='add-po-submit-button'
            data-testid="submit-button"
            disabled={loading || loadingTractors}
          >
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </form>
      </div>
    </div>
  );
}