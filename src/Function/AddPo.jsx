import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../auth/AuthContext';
import useCheckMobile from '../shrineofvsakoe/checkMobile.jsx';
import { api } from '../fetchAPI.js'; // Импортируем единый экземпляр api

export function AddPoForm({ onBack, onSubmit, skipValidation = false }) {
  // Состояния
  const [componentOptions, setComponentOptions] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [softwareOptions, setSoftwareOptions] = useState([]);
  const [selectedPreviousVersion, setSelectedPreviousVersion] = useState(null);
  const [loadingSoftware, setLoadingSoftware] = useState(false);
  const [softwareError, setSoftwareError] = useState(null);
  const { token } = useAuth();
  const isMobile = useCheckMobile();

  // Загружаем список компонентов с частями
  useEffect(() => {
    console.log('Токен из useAuth:', token ? `Есть (${token.substring(0, 20)}...)` : 'Нет');

    // Используем api.get вместо fetch
    api.get('/search/component-parts/')
      .then(data => {
        console.log('Полученные данные:', data);
        setComponentOptions(data);
      })
      .catch(err => {
        console.error('Ошибка загрузки компонентов:', err);
        alert('Не удалось загрузить список компонентов');
      });

    // Загружаем список ПО для предыдущих версий
    if (token) {
      setLoadingSoftware(true);
      setSoftwareError(null);

      api.get('/software/')
        .then(data => {
          console.log('Полученные данные ПО:', data);
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
          console.log('Сформированные options:', options);
          setSoftwareOptions(options);
        })
        .catch(err => {
          console.error('Ошибка загрузки ПО:', err);
          setSoftwareError(err.message);
        })
        .finally(() => {
          setLoadingSoftware(false);
        });
    } else {
      console.log('Токен отсутствует, пропускаем загрузку ПО');
      setSoftwareError('Для загрузки списка ПО требуется авторизация');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const file = form.elements.file.files[0];
    if (!file) {
      alert('Пожалуйста, выберите файл ПО');
      return;
    }

    const name = form.elements.poNumber.value.trim();
    const is_major = form.elements.majorMinor.value === 'major';
    const inner_name = form.elements.innerName?.value.trim() || undefined;
    const description = form.elements.description?.value.trim() || undefined;
    const release_date = form.elements.releaseDate?.value || undefined;

    if (!skipValidation && selectedComponents.length === 0) {
      alert('Пожалуйста, выберите хотя бы один компонент и часть');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('inner_name', inner_name);
    formData.append('is_major', is_major.toString());

    // Отправляем массив всех выбранных моделей
    selectedComponents.forEach(opt => {
      formData.append('component_models', opt.model);
    });

    // Отправляем массив всех выбранных номеров частей
    for (const opt of selectedComponents) {
      if (opt?.part_type == null) {
        alert(`Ошибка: у компонента "${opt?.model}" нет типа части`);
        return;
      }
      formData.append('part_type', opt.part_type);
    }

    if (selectedPreviousVersion) {
      formData.append('previous_sw_version_str', selectedPreviousVersion.value.toString());
    }

    if (inner_name) formData.append('inner_name', inner_name);
    if (description) formData.append('description', description);
    if (release_date) formData.append('release_date', release_date);

    // Для отладки
    console.log('Отправляемые данные:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      // Используем api.request напрямую, чтобы передать FormData
      // Убираем Content-Type из заголовков, чтобы браузер установил его сам с boundary
      const response = await api.request('/software/assign', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': undefined, // убираем application/json
        },
      });

      // api.request возвращает уже распарсенный JSON (если ответ - JSON)
      // Но для FormData ответ может быть не JSON, поэтому нужно обработать по-другому
      // Поскольку api.handleResponse вызывает response.json(), если ответ не JSON, упадёт ошибка.
      // Поэтому лучше использовать fetch напрямую для этого случая или модифицировать api.
      // Временно оставим как есть, предполагая, что сервер возвращает JSON.
      onSubmit?.(response);
    } catch (err) {
      console.error('❌ Ошибка:', err);
      alert(`Ошибка: ${err.message}`);
    }
  };

  const selectOptions = componentOptions.map(item => ({
    value: `${item.model}___${item.part_type}`,
    label: item['model(part)'],
    model: item.model,
    part_type: item.part_type
  }));

  return (
    <div className="add-po-form-container">
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
            data-testid="po-number-input"
            placeholder='Введите имя / номер ПО'
          />
        </div>

        {/* inner_name */}
        <div className="add-po-field">
          <label className="add-po-label">Внутреннее имя ПО</label>
          <input
            type="text"
            name="innerName"
            required
            className="add-po-input"
            placeholder="Введите внутреннее имя ПО"
            data-testid="po-number-input2"
          />
        </div>

        {/* Мультивыбор компонентов и частей */}
        <div className="add-po-field">
          <label className="add-po-label">Компонент и часть</label>
          <Select
            isMulti
            options={selectOptions}
            value={selectedComponents}
            onChange={(selected) => setSelectedComponents(selected || [])}
            placeholder="Выберите компонент и часть"
            classNamePrefix="add-po-select"
            isDisabled={componentOptions.length === 0}
            noOptionsMessage={() => "Нет доступных компонентов"}
            data-testid="component-select"
            styles={{
              control: (base, state) => ({
                ...base,
                color: '#ccc',
                height: '40px',
                width: '100%',
                border: '1px solid',
                borderColor: state.isFocused ? '#13be00' : '#ccc',
                boxSizing: 'border-box',
                fontSize: isMobile ? '14px' : '16px',
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

        {/* Выбор предыдущей версии ПО */}
        <div className="add-po-field">
          <label className="add-po-label">Предыдущая версия ПО</label>
          <Select
            options={softwareOptions}
            value={selectedPreviousVersion}
            onChange={setSelectedPreviousVersion}
            placeholder="Выберите предыдущую версию ПО (необязательно)"
            classNamePrefix="add-po-select"
            isClearable
            isSearchable
            noOptionsMessage={() => "Нет доступных версий ПО"}
            styles={{
              control: (base, state) => ({
                ...base,
                color: '#ccc',
                height: '40px',
                width: '100%',
                border: '1px solid',
                borderColor: state.isFocused ? '#13be00' : '#ccc',
                boxSizing: 'border-box',
                fontSize: isMobile ? '14px' : '16px',
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
          <select name="majorMinor" required className="add-po-select" data-testid="type-select">
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
            data-testid='filePo'
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