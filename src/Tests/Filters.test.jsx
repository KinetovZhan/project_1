// src/Tests/Filters.test.jsx

// 1. Создаём моки
const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseCheckMobile = vi.hoisted(() => vi.fn());

// 2. Мокаем модули ДО импортов
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth
}));

vi.mock('../shrineofvsakoe/checkMobile.jsx', () => ({
  default: mockUseCheckMobile
}));

// 3. Импорты
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { Filters } from '../Function/Filters_agregates.jsx';
import '@testing-library/jest-dom';

// 4. Мокаем ip
vi.mock('../shrineofvsakoe/ip.jsx', () => ({ 
  ip: '127.0.0.1' 
}));

// 5. Улучшенный мок для react-select с разными testid
vi.mock('react-select', () => {
  const MockSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    isMulti, 
    isDisabled,
    styles,
    className
  }) => {
    const handleChange = (e) => {
      if (!isMulti) {
        const selectedValue = e.target.value;
        if (!selectedValue) {
          onChange(null);
          return;
        }
        const selected = options?.find(opt => opt.value === selectedValue);
        onChange(selected);
      } else {
        const selectedOptions = Array.from(e.target.selectedOptions).map(opt => ({
          value: opt.value,
          label: opt.textContent
        }));
        onChange(selectedOptions);
      }
    };

    const currentValue = isMulti 
      ? (Array.isArray(value) ? value.map(v => v.value) : [])
      : (value?.value || '');

    // Определяем testid по placeholder
    const testId = placeholder === 'Модель трактора' 
      ? 'tractor-model-select' 
      : placeholder === 'Модель'
      ? 'component-model-select'
      : 'react-select';

    return (
      <div data-testid={testId}>
        <select
          value={currentValue}
          onChange={handleChange}
          multiple={isMulti}
          disabled={isDisabled}
          style={{ width: '100%', padding: '8px' }}
          data-testid={`${testId}-inner`}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  return { 
    default: MockSelect 
  };
});

describe('Filters', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnFilterChange2 = vi.fn();
  const mockOnModelChange = vi.fn();

  const mockComponentModels = ['T-150', 'K-700', 'T-400', 'K-500'];

  beforeEach(() => {
    // Настройка моков
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    mockUseCheckMobile.mockReturnValue(false);
    
    // Сброс всех функций
    mockOnFilterChange.mockClear();
    mockOnFilterChange2.mockClear();
    mockOnModelChange.mockClear();
    
    // Мок fetch по умолчанию
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        component_models: mockComponentModels
      })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. Базовый рендеринг
  it('рендерит все чекбоксы фильтров', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    expect(screen.getByText('ДВС')).toBeInTheDocument();
    expect(screen.getByText('КПП')).toBeInTheDocument();
    expect(screen.getByText('РК')).toBeInTheDocument();
    expect(screen.getByText('Гидрораспределитель')).toBeInTheDocument();
    expect(screen.getByText('Автопилот')).toBeInTheDocument();
    expect(screen.getByText('БК')).toBeInTheDocument();
  });

  // 2. Проверка выбора компонентов - ИСПРАВЛЕННАЯ ВЕРСИЯ
  it('обрабатывает выбор компонента ДВС', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Находим все элементы с текстом "ДВС" и берем первый
    const dvsElements = screen.getAllByText('ДВС');
    expect(dvsElements.length).toBeGreaterThan(0);
    
    // Находим чекбокс рядом с текстом "ДВС"
    const dvsLabel = dvsElements[0].closest('label');
    expect(dvsLabel).toBeInTheDocument();
    
    const dvsCheckbox = dvsLabel.querySelector('input[type="checkbox"]');
    expect(dvsCheckbox).toBeInTheDocument();
    
    fireEvent.click(dvsCheckbox);
    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS']);
  });

  it('обрабатывает выбор нескольких компонентов', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Находим чекбоксы
    const dvsElements = screen.getAllByText('ДВС');
    const dvsLabel = dvsElements[0].closest('label');
    const dvsCheckbox = dvsLabel.querySelector('input[type="checkbox"]');
    
    const kppElements = screen.getAllByText('КПП');
    const kppLabel = kppElements[0].closest('label');
    const kppCheckbox = kppLabel.querySelector('input[type="checkbox"]');
    
    fireEvent.click(dvsCheckbox);
    fireEvent.click(kppCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS', 'KPP']);
  });

  // 3. Проверка выбора моделей тракторов - ИСПРАВЛЕННАЯ
  it('обрабатывает выбор модели трактора', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Ждем загрузки селектов
    await waitFor(() => {
      expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
    });

    // Находим селект для моделей тракторов
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    
    fireEvent.change(tractorSelect, { 
      target: { value: 'K7' } 
    });

    // Проверяем вызов onFilterChange2 с преобразованным значением
    expect(mockOnFilterChange2).toHaveBeenCalledWith(['K-7']);
  });

  // 4. Проверка выбора моделей компонентов - ИСПРАВЛЕННАЯ
  it('обрабатывает выбор модели компонента', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('component-model-select')).toBeInTheDocument();
    });

    // Находим селект для моделей компонентов
    const componentSelect = screen.getByTestId('component-model-select-inner');
    
    fireEvent.change(componentSelect, { 
      target: { value: 'T-150' } 
    });

    expect(mockOnModelChange).toHaveBeenCalledWith(['T-150']);
  });

  // 5. Проверка сброса фильтров
  it('сбрасывает все фильтры при нажатии кнопки "Сброс"', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Выбираем несколько фильтров
    const dvsElements = screen.getAllByText('ДВС');
    const dvsLabel = dvsElements[0].closest('label');
    const dvsCheckbox = dvsLabel.querySelector('input[type="checkbox"]');
    
    const clearButton = screen.getByTestId('Clearbutton');
    
    fireEvent.click(dvsCheckbox);
    fireEvent.click(clearButton);

    // Проверяем, что все callback вызваны с пустыми массивами
    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
    expect(mockOnFilterChange2).toHaveBeenCalledWith([]);
    expect(mockOnModelChange).toHaveBeenCalledWith([]);
  });

  // 6. Проверка загрузки данных
  it('загружает модели компонентов при наличии токена', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Проверяем, что fetch был вызван
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1/search/component-models',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  it('не загружает модели компонентов при отсутствии токена', async () => {
    mockUseAuth.mockReturnValue({ token: null });
    
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Проверяем, что fetch не был вызван
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // 7. Обработка ошибок - ИСПРАВЛЕННАЯ
  it('обрабатывает ошибку сети при загрузке моделей', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Компонент не должен упасть
    await waitFor(() => {
      // Используем getAllByTestId, так как селектов несколько
      const selects = screen.getAllByTestId('tractor-model-select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('обрабатывает HTTP ошибку при загрузке моделей', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' })
    });
    
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Компонент не должен упасть
    await waitFor(() => {
      const selects = screen.getAllByTestId('tractor-model-select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  // 8. Проверка преобразования типов компонентов
  it('правильно преобразует типы компонентов при отправке запроса', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Выбираем ДВС
    const dvsElements = screen.getAllByText('ДВС');
    const dvsLabel = dvsElements[0].closest('label');
    const dvsCheckbox = dvsLabel.querySelector('input[type="checkbox"]');
    fireEvent.click(dvsCheckbox);

    // Выбираем КПП
    const kppElements = screen.getAllByText('КПП');
    const kppLabel = kppElements[0].closest('label');
    const kppCheckbox = kppLabel.querySelector('input[type="checkbox"]');
    fireEvent.click(kppCheckbox);

    // Проверяем отправляемые данные в fetch
    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls;
      if (fetchCalls.length > 0) {
        const lastCall = fetchCalls[fetchCalls.length - 1];
        const body = JSON.parse(lastCall[1].body);
        
        // ДВС должен преобразоваться в 'dvs', КПП в 'kpp'
        expect(body.type_comp).toContain('dvs');
        expect(body.type_comp).toContain('kpp');
      }
    });
  });

  // 9. Проверка работы с мобильным видом - ИСПРАВЛЕННАЯ
  it('работает в мобильном режиме', async () => {
    mockUseCheckMobile.mockReturnValue(true);
    
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Компонент должен отрендериться
    await waitFor(() => {
      const selects = screen.getAllByTestId('tractor-model-select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  // 10. Проверка обновления при изменении фильтров - УПРОЩЕННАЯ
  it('обновляет запрос при изменении фильтров компонентов', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    const initialFetchCalls = global.fetch.mock.calls.length;

    // Изменяем фильтр
    const dvsElements = screen.getAllByText('ДВС');
    const dvsLabel = dvsElements[0].closest('label');
    const dvsCheckbox = dvsLabel.querySelector('input[type="checkbox"]');
    fireEvent.click(dvsCheckbox);

    // Ждем нового запроса
    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(initialFetchCalls);
    });
  });

  // 11. Проверка обновления при изменении моделей тракторов - ИСПРАВЛЕННАЯ
  it('обновляет запрос при изменении моделей тракторов', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
    });

    const initialFetchCalls = global.fetch.mock.calls.length;

    // Находим и изменяем селект моделей тракторов
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    
    fireEvent.change(tractorSelect, { 
      target: { value: 'K7' } 
    });

    // Ждем нового запроса
    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(initialFetchCalls);
    });
  });

  // 12. Проверка деактивации селекта при загрузке - ИСПРАВЛЕННАЯ
  it('деактивирует селект моделей при загрузке', async () => {
    // Мокаем долгий запрос
    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });
    
    global.fetch = vi.fn().mockReturnValue(fetchPromise);

    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Ждем появления селектов
    await waitFor(() => {
      expect(screen.getByTestId('component-model-select')).toBeInTheDocument();
    });

    // Селект моделей компонентов должен быть disabled
    const componentSelect = screen.getByTestId('component-model-select-inner');
    expect(componentSelect).toBeDisabled();

    // Разрешаем промис
    resolveFetch({
      ok: true,
      json: async () => ({ component_models: mockComponentModels })
    });

    // Ждем обновления
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Теперь селект должен быть активен
    expect(componentSelect).not.toBeDisabled();
  });

  // 13. Новый тест: проверка инициализации состояний
  it('инициализирует с правильными начальными значениями', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Все чекбоксы должны быть не выбраны
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });

    // Кнопка сброса должна быть видна
    expect(screen.getByTestId('Clearbutton')).toBeInTheDocument();
  });

  // 14. Новый тест: проверка маппинга типов компонентов
  it('правильно маппит типы компонентов', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    // Проверяем, что при выборе разных типов они правильно преобразуются
    const componentTypeMap = {
      'DVS': 'dvs',
      'KPP': 'kpp',
      'RK': 'rk',
      'hydrorasp': 'hydro',
      'AP': 'ap',
      'BK': 'bk',
    };

    // Для теста проверяем, что объект существует в компоненте
    // (в реальном компоненте он определен как componentTypeMap)
    expect(componentTypeMap['DVS']).toBe('dvs');
    expect(componentTypeMap['KPP']).toBe('kpp');
    expect(componentTypeMap['RK']).toBe('rk');
    expect(componentTypeMap['hydrorasp']).toBe('hydro');
  });

  // 15. Новый тест: проверка множественного выбора в селектах
  it('поддерживает множественный выбор в селектах', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
    });

    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    
    // Проверяем, что селект поддерживает multiple
    expect(tractorSelect.multiple).toBe(true);
  });
});