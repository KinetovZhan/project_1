import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ip } from "../shrineofvsakoe/ip.jsx";

export function AddAggForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    type: '',
    model: '',
    mounting_date: new Date().toISOString().split('T')[0],
    comp_ser_num: '',
    selected_tractor_id: '', // Это поле должно соответствовать select
    number_of_parts: '',
    producer_comp: ''
  });

  const [tractors, setTractors] = useState([])
  const [loadingTractors, setLoadingTractors] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  useEffect(() => {
    const loadTractors = async () => {
      if (!token) {
        setLoadingTractors(false);
        return;
      }
      try {
        setLoadingTractors(true);
        const responseTractors = await fetch(`http://${ip}/tractors/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!responseTractors.ok) {
          const errorMessage = `Ошибка ${responseTractors.status}`;
          throw new Error(errorMessage);
        }
        const responseTractorsData = await responseTractors.json();
        setTractors(responseTractorsData);
        console.log('Трактора успешно загружены:', responseTractorsData);
      } catch (err) {
        console.error('Ошибка при загрузке тракторов:', err);
        setError('Не удалось загрузить список тракторов');
      } finally {
        setLoadingTractors(false);
      }
    };
    loadTractors();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTractorChange = (e) => {
    const selectedId = e.target.value; // Исправлено: e.target.value (не e.targer.value)
    setFormData(prev => ({
      ...prev,
      selected_tractor_id: selectedId
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

      const selectedTractor = tractors.find(t => t.id === parseInt(formData.selected_tractor_id)); // Исправлено: parseInt (не perseInt)

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
      console.log('Выбранный трактор:', selectedTractor);

      if (formData.selected_tractor_id && !selectedTractor) {
        throw new Error('Выбранный трактор не найден');
      }

      const response = await fetch(`http://${ip}/components/`, {
      const response = await fetch(`http://${ip}/components/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.detail || `Ошибка ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('Агрегат успешно добавлен:', responseData);

      if (typeof onSubmit === 'function') {
        onSubmit(responseData);
      } else if (typeof onBack === 'function') {
        onBack();
      }

    } catch (err) {
      console.error('Ошибка при добавлении агрегата:', err);
      setError(err.message);
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

        <div className='add-po-field'>
          <label className='add-po-label'>Трактор</label>
          <select
            name="selected_tractor_id" // Должно соответствовать полю в состоянии
            value={formData.selected_tractor_id} // Должно соответствовать полю в состоянии
            onChange={handleTractorChange} // Использует правильный обработчик
            className='add-po-select' // Для select должен быть add-po-select, а не add-po-input
            disabled={loading || loadingTractors}
          >
            <option value="">Выберите трактор</option>
            {loadingTractors ? (
              <option value="" disabled>Загрузка тракторов...</option>
            ) : (
              tractors.map(tractor => ( // Исправлено: tractor (в единственном числе)
                <option key={tractor.id} value={tractor.id}>
                  {tractor.vin}
                </option>
              ))
            )}
          </select>
          {/* Дополнительная информация о выбранном тракторе */}
          {formData.selected_tractor_id && !loadingTractors && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Выбран трактор VIN: {tractors.find(t => t.id === parseInt(formData.selected_tractor_id))?.vin}
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
          disabled={loading || loadingTractors} // Нельзя отправлять пока грузятся тракторы
        >
          {loading ? 'Добавление...' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}