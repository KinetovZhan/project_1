// src/Tests/Filters.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { Filters } from '../FiltersPo/Filters_agregates.jsx';
import '@testing-library/jest-dom';

// Мокаем API
vi.mock('../fetchAPI.js', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Мокаем useAuth
const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// Мокаем useCheckMobile
const mockUseCheckMobile = vi.hoisted(() => vi.fn());
vi.mock('../CheckMobile/checkMobile.jsx', () => ({
  default: mockUseCheckMobile,
}));

// Мокаем react-select (упрощённая версия для тестов)
vi.mock('react-select', () => {
  const MockSelect = ({ options, value, onChange, placeholder, isMulti, isDisabled, menuPortalTarget, styles, className }) => {
    const handleChange = (e) => {
      const selectedValue = e.target.value;
      if (!isMulti) {
        const selected = options?.find(opt => opt.value === selectedValue);
        onChange(selected);
      } else {
        // Для множественного выбора – эмулируем через массив
        const selectedOptions = Array.from(e.target.selectedOptions).map(opt => ({
          value: opt.value,
          label: opt.textContent,
        }));
        onChange(selectedOptions);
      }
    };

    // Определяем testId по placeholder
    let testId = 'react-select';
    if (placeholder === 'Модель трактора') testId = 'tractor-model-select';
    else if (placeholder === 'Производитель') testId = 'producer-select';
    else if (placeholder === 'Название узла') testId = 'component-model-select';
    else if (placeholder === 'Назначение') testId = 'status-select';
    else if (placeholder === 'Все статусы') testId = 'actuality-select';

    const currentValue = isMulti
      ? (Array.isArray(value) ? value.map(v => v.value) : [])
      : (value?.value || '');

    return (
      <div data-testid={testId}>
        <select
          value={currentValue}
          onChange={handleChange}
          multiple={isMulti}
          disabled={isDisabled}
          data-testid={`${testId}-inner`}
        >
          <option value="">{placeholder}</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  return { default: MockSelect };
});

import { api } from '../fetchAPI.js';

describe('Filters', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnFilterChange2 = vi.fn();
  const mockOnModelChange = vi.fn();
  const mockOnProducerChange = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnActualChangePo = vi.fn();

  const mockComponentModels = ['T-150', 'K-700', 'T-400', 'K-500'];
  const mockTractorModels = ['K-7', 'K-5', 'K-742МСТ'];
  const mockProducers = ['Производитель 1', 'Производитель 2'];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    mockUseCheckMobile.mockReturnValue(false);

    // Мокаем api.post для всех вызовов
    api.post.mockImplementation(async (url, data) => {
      if (url === 'search/component-models') {
        return { component_models: mockComponentModels.map(name => ({ name })) };
      }
      if (url === 'search/tractor-models') {
        return mockTractorModels.map(model => ({ model }));
      }
      if (url === 'search/component-producers') {
        return mockProducers.map(producer => ({ producer }));
      }
      return [];
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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
    expect(screen.getByText('Рулевая колонка')).toBeInTheDocument();
    expect(screen.getByText('Гидрораспределитель')).toBeInTheDocument();
    expect(screen.getByText('БК')).toBeInTheDocument();
  });

  it('обрабатывает выбор компонента ДВС', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    const dvsCheckbox = screen.getByLabelText('ДВС');
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
    const dvsCheckbox = screen.getByLabelText('ДВС');
    const kppCheckbox = screen.getByLabelText('КПП');
    fireEvent.click(dvsCheckbox);
    fireEvent.click(kppCheckbox);
    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS', 'KPP']);
  });

  it('обрабатывает выбор модели трактора', async () => {
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
    fireEvent.change(tractorSelect, { target: { value: 'K-7' } });
    expect(mockOnFilterChange2).toHaveBeenCalledWith(['K-7']);
  });

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
    const componentSelect = screen.getByTestId('component-model-select-inner');
    fireEvent.change(componentSelect, { target: { value: 'T-150' } });
    expect(mockOnModelChange).toHaveBeenCalledWith(['T-150']);
  });

  it('сбрасывает все фильтры при нажатии кнопки "Сброс"', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
        onProducerChange={mockOnProducerChange}
        onStatusChange={mockOnStatusChange}
        onActualChangePo={mockOnActualChangePo}
      />
    );
    // Выбираем несколько фильтров
    const dvsCheckbox = screen.getByLabelText('ДВС');
    fireEvent.click(dvsCheckbox);
    // Ждём загрузки селектов
    await waitFor(() => {
      expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
    });
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    fireEvent.change(tractorSelect, { target: { value: 'K-7' } });
    const clearButton = screen.getByTestId('Clearbutton');
    fireEvent.click(clearButton);
    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
    expect(mockOnFilterChange2).toHaveBeenCalledWith([]);
    expect(mockOnModelChange).toHaveBeenCalledWith([]);
    expect(mockOnProducerChange).toHaveBeenCalledWith([]);
    expect(mockOnStatusChange).toHaveBeenCalledWith([]);
    expect(mockOnActualChangePo).toHaveBeenCalledWith([]);
  });

  it('загружает модели компонентов при наличии токена', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        'search/component-models',
        expect.objectContaining({ trac_model: [], type_comp: [], producers: [], status: [] })
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
    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  it('обрабатывает ошибку сети при загрузке моделей', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'));
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    // Компонент не должен упасть, селект должен быть виден (пустой)
    await waitFor(() => {
      expect(screen.getByTestId('component-model-select')).toBeInTheDocument();
    });
    const componentSelect = screen.getByTestId('component-model-select-inner');
    expect(componentSelect).toBeInTheDocument();
  });

  it('правильно преобразует типы компонентов при отправке запроса', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    const dvsCheckbox = screen.getByLabelText('ДВС');
    fireEvent.click(dvsCheckbox);
    const kppCheckbox = screen.getByLabelText('КПП');
    fireEvent.click(kppCheckbox);
    // Ждём, что после изменения фильтров будет сделан запрос
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        'search/component-models',
        expect.objectContaining({ type_comp: ['DVS', 'KPP'] })
      );
    });
  });

  it('работает в мобильном режиме', () => {
    mockUseCheckMobile.mockReturnValue(true);
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
  });

  it('обновляет запрос при изменении фильтров компонентов', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    const initialCalls = api.post.mock.calls.length;
    const dvsCheckbox = screen.getByLabelText('ДВС');
    fireEvent.click(dvsCheckbox);
    await waitFor(() => {
      expect(api.post.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

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
    const initialCalls = api.post.mock.calls.length;
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    fireEvent.change(tractorSelect, { target: { value: 'K-7' } });
    await waitFor(() => {
      expect(api.post.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  it('деактивирует селект моделей при загрузке', async () => {
    // Задерживаем ответ API
    let resolveFetch;
    const promise = new Promise(resolve => { resolveFetch = resolve; });
    api.post.mockImplementationOnce(() => promise);
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
    const componentSelect = screen.getByTestId('component-model-select-inner');
    expect(componentSelect).toBeDisabled();
    // Разрешаем промис
    resolveFetch({ component_models: mockComponentModels.map(name => ({ name })) });
    await waitFor(() => {
      expect(componentSelect).not.toBeDisabled();
    });
  });

  it('инициализирует с правильными начальными значениями', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
    expect(screen.getByTestId('Clearbutton')).toBeInTheDocument();
  });

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
    expect(tractorSelect.multiple).toBe(true);
  });
});