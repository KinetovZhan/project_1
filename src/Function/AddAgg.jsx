import { useState } from 'react';

export function AddAggForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    id: '',
    type: '',
    model: '',
    mounting_date: '',
    comp_ser_num: '',
    tractor_id: '',
    number_of_parts: '',
    producer_comp: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Вся логика отправки — внутри этой функции
  const submitDataToServer = async () => {
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        id: formData.id,
        type: formData.type,
        model: formData.model,
        mounting_date: formData.mounting_date || null,
        comp_ser_num: formData.comp_ser_num || null,
        tractor_id: formData.tractor_id ? parseInt(formData.tractor_id, 10) : null,
        number_of_parts: formData.number_of_parts ? parseInt(formData.number_of_parts, 10) : null,
        producer_comp: formData.producer_comp || null
      };

      console.log('Отправляемые данные:', submitData);

      const response = await fetch('http://172.20.46.66:8000/component/', {
        method: 'POST',
        headers: {
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

      // alert('Модель создана');
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
    e.preventDefault(); // Теперь безопасно — всегда вызывается из формы
    submitDataToServer();
  };

  return (
    <div className="maininfo add-po-form-container">
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
          <label className='add-po-label'>ID агрегата (обязательно)</label>
          <input
            type="text"
            name="id"
            placeholder="Введите уникальный ID агрегата"
            value={formData.id}
            onChange={handleChange}
            required
            className='add-po-input'
            disabled={loading}
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Тип</label>
          <select
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
          <label className='add-po-label'>ID Трактора</label>
          <input
            type="number"
            name="tractor_id"
            value={formData.tractor_id}
            onChange={handleChange}
            placeholder="Введите ID трактора"
            className='add-po-input'
            disabled={loading}
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
          disabled={loading}
        >
          {loading ? 'Добавление...' : 'Добавить'}
        </button> 
      </form> 
    </div>   
  );
}