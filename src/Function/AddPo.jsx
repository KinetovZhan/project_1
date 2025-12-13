import { useState, useEffect } from 'react';
import Select from 'react-select';

export function AddPoForm({ onBack, onSubmit }) {
  // Состояния
  const [componentOptions, setComponentOptions] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);

  // Загружаем список компонентов с частями
  useEffect(() => {
    fetch('http://172.20.46.71:8000/component-parts') // ← замени на реальный эндпоинт
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить компоненты');
        return res.json();
      })
      .then(data => setComponentOptions(data))
      .catch(err => {
        console.error('Ошибка:', err);
        alert('Не удалось загрузить список компонентов');
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const file = form.elements.file.files[0];
    if (!file) {
      alert('Пожалуйста, выберите файл ПО');
      return;
    }

    // Обязательные поля
    const name = form.elements.poNumber.value.trim();
    const is_major = form.elements.majorMinor.value === 'major';

    // Необязательные
    const inner_name = form.elements.innerName?.value.trim() || undefined;
    const description = form.elements.description?.value.trim() || undefined;
    const release_date = form.elements.releaseDate?.value || undefined;

    // Обязательный выбор компонента и части
     if (selectedComponents.length === 0) {
      alert('Пожалуйста, выберите хотя бы один компонент и часть');
      return;
    }

    // Формируем FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('is_major', is_major.toString());
    // Отправляем массив всех выбранных моделей
    selectedComponents.forEach(opt => {
      formData.append('component_models', opt.model);
    });

    // Отправляем массив всех выбранных номеров частей
    selectedComponents.forEach(opt => {
      if (opt?.part_number == null) {
        alert(`Ошибка: у компонента "${opt?.model}" нет номера части`);
        return;
      }
      formData.append('part_number', opt.part_number);
    });

    if (inner_name) formData.append('inner_name', inner_name);
    if (description) formData.append('description', description);
    if (release_date) formData.append('release_date', release_date);

    try {
      const response = await fetch('http://172.20.46.71:8000/software/assign', {
        method: 'POST',
        body: formData,
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
  const selectOptions = componentOptions.map(item => ({
    value: `${item.model}___${item.part_number}`,
    label: item['model(part)'],
    model: item.model,
    part_number: item.part_number
  }));

  return (
    <div className="maininfo add-po-form-container">
      <button onClick={onBack} className="add-po-back-button">
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <h3 className="add-po-title">Добавление нового ПО</h3>

      <form className="add-po-form" onSubmit={handleSubmit}>

        {/* name */}
        <div className="add-po-field">
          <label className="add-po-label">Имя / номер ПО</label>
          <input
            type="text"
            name="poNumber"
            required
            className="add-po-input"
          />
        </div>

        {/* 🔥 Мультивыбор компонентов и частей */}
        <div className="add-po-field">
          <label className="add-po-label">Компонент и часть </label>
          <Select
            isMulti
            options={componentOptions.map(item => ({
              value: `${item.model}___${item.part_number}`,
              label: item['model(part)'],
              model: item.model,
              part_number: item.part_number
            }))}
            value={selectedComponents}
            onChange={(selected) => {
              // Сохраняем выбранные значения
              setSelectedComponents(selected || []);

              // Если нужно, можно извлечь первый компонент для совместимости с бэкендом
              // но лучше отправлять все
            }}
            placeholder="Выберите компонент и часть"
            
            classNamePrefix="add-po-select"
            isDisabled={componentOptions.length === 0}
            noOptionsMessage={() => "Нет доступных компонентов"}
            styles={{
              // 🔹 Контрол (внешний контейнер) — как у твоего <select>
              control: (base, state) => ({
                ...base,
                color: '#ccc',
                height: '40px',
                width: '100%',
                border: '1px solid',
                borderColor: state.isFocused ? '#13be00' : '#ccc',
                boxSizing: 'border-box',
                padding: '0 12px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
                outline: 'none',
                boxShadow: 'none',
              }),
              
              menuList: (base) => ({
                ...base,
                maxHeight: 200,
                padding: '4px 0',
                backgroundColor: 'white'
              }),
            
            }}
          />
        </div>
        {/* is_major */}
        <div className="add-po-field">
          <label className="add-po-label">Тип</label>
          <select name="majorMinor" required className="add-po-select">
            <option value="">Выберите тип</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        {/* release_date */}
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
            accept=".bin,.hex,.zip,.elf,.doc,.docx"
          />
        </div>

        {/* description */}
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