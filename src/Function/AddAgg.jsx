import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import Select from 'react-select';
import { api } from '../fetchAPI.js'; // Импортируем единый экземпляр api

export function AddAggForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    type: '',
    model: '',
    mounting_date: new Date().toISOString().split('T')[0],
    comp_ser_num: '',
    selected_tractor_id: '',
    number_of_parts: '',
    producer_comp: ''
  });

  const [tractors, setTractors] = useState([]);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Для react-select нужен формат { value, label }
  const [tractorOptions, setTractorOptions] = useState([]);
  const [selectedTractor, setSelectedTractor] = useState(null);

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
        
        // Преобразуем в формат для react-select
        const options = responseTractorsData.map(tractor => ({
          value: tractor.id,
          label: tractor.vin,
          data: tractor // сохраняем полные данные трактора
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

  return (
    <div className="add-po-agg-container">
      <button
        onClick={onBack}
        className="add-po-back-button"
        disabled={loading}
      >
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <h3 className="add-po-title">Добавление агрегата</h3>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <form className="add-po-form" onSubmit={handleSubmit}>
        <div className='add-po-field'>
          <label htmlFor="type-select" className='add-po-label'>Тип</label>
          <select
            id="type-select"
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className='add-po-select'
            disabled={loading}
          >
            <option value="">Выберите агрегат</option>
            <option value="dvs">ДВС</option>
            <option value="kpp">КПП</option>
            <option value="rk">РК</option>
            <option value="hydro">Гидрораспределитель</option>
            <option value="ap">Автопилот</option>
            <option value="bk">БК</option>
          </select>
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
          />
        </div>

        {/* Выбор трактора с использованием react-select */}
        <div className="add-po-field">
          <label className="add-po-label">Трактор</label>
          <Select
            options={tractorOptions}
            value={selectedTractor}
            onChange={handleTractorSelectChange}
            placeholder={loadingTractors ? "Загрузка тракторов..." : "Выберите трактор"}
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
                backgroundColor: state.isSelected ? '#13be00' : 
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
                color: '#13be00'
              })
            }}
          />
          
          {/* Информация о выбранном тракторе */}
          {selectedTractor && !loadingTractors && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '5px',
              padding: '6px 8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              Выбран: {selectedTractor.label}
            </div>
          )}
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

        <div className='add-po-field'>
          <label className='add-po-label'>Производитель</label>
          <input
            type="text"
            name="producer_comp"
            placeholder="Введите производителя"
            value={formData.producer_comp}
            onChange={handleChange}
            className='add-po-input'
            disabled={loading}
          />
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
  );
}