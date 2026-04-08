// src/Tests/Filters.test.jsx
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { Filters } from '../FiltersPo/Filters_agregates.jsx';
import '@testing-library/jest-dom';

// 🔧 Мокаем API
vi.mock('../fetchAPI.js', () => ({
  api: {
    post: vi.fn(),
  },
}));

// 🔧 Мокаем useAuth
const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// 🔧 Мокаем useCheckMobile
const mockUseCheckMobile = vi.hoisted(() => vi.fn());
vi.mock('../CheckMobile/checkMobile.jsx', () => ({
  default: mockUseCheckMobile,
}));

// 🔧 Исправленный мок react-select с поддержкой isDisabled
vi.mock('react-select', () => {
  const MockSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    isMulti, 
    isDisabled, 
    menuPortalTarget, 
    styles, 
    className,
    isLoading 
  }) => {
    const handleChange = (e) => {
      if (isDisabled) return;
      const selectedValue = e.target.value;
      if (!isMulti) {
        const selected = options?.find(opt => opt.value === selectedValue);
        onChange?.(selected);
      } else {
        const selectedOptions = Array.from(e.target.selectedOptions).map(opt => ({
          value: opt.value,
          label: opt.textContent,
        }));
        onChange?.(selectedOptions.length ? selectedOptions : null);
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
      <div data-testid={testId} data-loading={isLoading || false}>
        <select
          value={currentValue}
          onChange={handleChange}
          multiple={isMulti}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          data-testid={`${testId}-inner`}
        >
          <option value="">{placeholder}</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value} disabled={isDisabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {isLoading && <span data-testid="loading-indicator">Загрузка...</span>}
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

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    mockUseCheckMobile.mockReturnValue(false);

    // 🔧 Мокаем api.post с микро-задержкой для реалистичности
    await act(async () => {
      api.post.mockImplementation(async (url, data) => {
        await new Promise(resolve => setTimeout(resolve, 0));
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит все чекбоксы фильтров', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      expect(screen.getByText('ДВС')).toBeInTheDocument();
      expect(screen.getByText('КПП')).toBeInTheDocument();
      expect(screen.getByText('Рулевая колонка')).toBeInTheDocument();
      expect(screen.getByText('Гидрораспределитель')).toBeInTheDocument();
      expect(screen.getByText('БК')).toBeInTheDocument();
    });
  });

  it('обрабатывает выбор компонента ДВС', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => screen.getByLabelText('ДВС'));
    const dvsCheckbox = screen.getByLabelText('ДВС');
    await act(async () => {
      fireEvent.click(dvsCheckbox);
    });
    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS']);
  });

  it('обрабатывает выбор нескольких компонентов', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => screen.getByLabelText('ДВС'));
    const dvsCheckbox = screen.getByLabelText('ДВС');
    const kppCheckbox = screen.getByLabelText('КПП');
    await act(async () => {
      fireEvent.click(dvsCheckbox);
      fireEvent.click(kppCheckbox);
    });
    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS', 'KPP']);
  });

  it('обрабатывает выбор модели трактора', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => screen.getByTestId('tractor-model-select'));
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    await act(async () => {
      fireEvent.change(tractorSelect, { target: { value: 'K-7' } });
    });
    expect(mockOnFilterChange2).toHaveBeenCalledWith(['K-7']);
  });

  it('обрабатывает выбор модели компонента', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => screen.getByTestId('component-model-select'));
    const componentSelect = screen.getByTestId('component-model-select-inner');
    await act(async () => {
      fireEvent.change(componentSelect, { target: { value: 'T-150' } });
    });
    expect(mockOnModelChange).toHaveBeenCalledWith(['T-150']);
  });

  it('сбрасывает все фильтры при нажатии кнопки "Сброс"', async () => {
    await act(async () => {
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
    });
    
    await waitFor(() => screen.getByLabelText('ДВС'));
    const dvsCheckbox = screen.getByLabelText('ДВС');
    await act(async () => {
      fireEvent.click(dvsCheckbox);
    });
    
    await waitFor(() => screen.getByTestId('tractor-model-select'));
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    await act(async () => {
      fireEvent.change(tractorSelect, { target: { value: 'K-7' } });
    });
    
    const clearButton = screen.getByTestId('Clearbutton');
    await act(async () => {
      fireEvent.click(clearButton);
    });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
    expect(mockOnFilterChange2).toHaveBeenCalledWith([]);
    expect(mockOnModelChange).toHaveBeenCalledWith([]);
    expect(mockOnProducerChange).toHaveBeenCalledWith([]);
    expect(mockOnStatusChange).toHaveBeenCalledWith([]);
    expect(mockOnActualChangePo).toHaveBeenCalledWith([]);
  });

  it('загружает модели компонентов при наличии токена', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        'search/component-models',
        expect.objectContaining({ trac_model: [], type_comp: [], producers: [], status: [] })
      );
    });
  });

  it('не загружает модели компонентов при отсутствии токена', async () => {
    mockUseAuth.mockReturnValue({ token: null });
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  it('обрабатывает ошибку сети при загрузке моделей', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('component-model-select')).toBeInTheDocument();
    });
    const componentSelect = screen.getByTestId('component-model-select-inner');
    expect(componentSelect).toBeInTheDocument();
  });

  it('правильно преобразует типы компонентов при отправке запроса', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => screen.getByLabelText('ДВС'));
    const dvsCheckbox = screen.getByLabelText('ДВС');
    const kppCheckbox = screen.getByLabelText('КПП');
    await act(async () => {
      fireEvent.click(dvsCheckbox);
      fireEvent.click(kppCheckbox);
    });
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        'search/component-models',
        expect.objectContaining({ type_comp: expect.arrayContaining(['DVS', 'KPP']) })
      );
    });
  });

  it('работает в мобильном режиме', async () => {
    mockUseCheckMobile.mockReturnValue(true);
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
    });
  });

  it('обновляет запрос при изменении фильтров компонентов', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    const initialCalls = api.post.mock.calls.length;
    await waitFor(() => screen.getByLabelText('ДВС'));
    const dvsCheckbox = screen.getByLabelText('ДВС');
    await act(async () => {
      fireEvent.click(dvsCheckbox);
    });
    await waitFor(() => {
      expect(api.post.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  it('обновляет запрос при изменении моделей тракторов', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => screen.getByTestId('tractor-model-select'));
    const initialCalls = api.post.mock.calls.length;
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    await act(async () => {
      fireEvent.change(tractorSelect, { target: { value: 'K-7' } });
    });
    await waitFor(() => {
      expect(api.post.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  // 🔧 ИСПРАВЛЕННЫЙ ТЕСТ: деактивация селекта при загрузке
  it('деактивирует селект моделей при загрузке', async () => {
    // 🔧 1. Создаём контролируемую задержку ТОЛЬКО для endpoint component-models
    let resolveComponentModels;
    const componentModelsPromise = new Promise(resolve => {
      resolveComponentModels = resolve;
    });

    // 🔧 2. Мокаем api.post с фильтрацией по endpoint
    api.post.mockImplementation(async (url, data) => {
      if (url === 'search/component-models') {
        // 🔧 Только этот запрос "зависает"
        return componentModelsPromise;
      }
      // Остальные запросы работают нормально с микро-задержкой
      await new Promise(res => setTimeout(res, 0));
      if (url === 'search/tractor-models') {
        return mockTractorModels.map(model => ({ model }));
      }
      if (url === 'search/component-producers') {
        return mockProducers.map(producer => ({ producer }));
      }
      return [];
    });

    // 🔧 3. Рендер в act
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });

    // 🔧 4. Ждём появления селекта
    await waitFor(() => {
      expect(screen.getByTestId('component-model-select')).toBeInTheDocument();
    });
    
    const componentSelect = screen.getByTestId('component-model-select-inner');
    
    // 🔧 5. Ждём, что loading=true и селект заблокирован
    await waitFor(() => {
      expect(componentSelect).toBeDisabled();
    }, { timeout: 2000 });
    
    // 🔧 6. Разрешаем промис и ждём разблокировки
    await act(async () => {
      resolveComponentModels({ 
        component_models: mockComponentModels.map(name => ({ name })) 
      });
    });
    
    // 🔧 7. После загрузки данных селект должен разблокироваться
    await waitFor(() => {
      expect(componentSelect).not.toBeDisabled();
    });
    
    // 🔧 8. Восстанавливаем оригинальный мок для следующих тестов
    api.post.mockImplementation(async (url, data) => {
      await new Promise(resolve => setTimeout(resolve, 0));
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

  it('инициализирует с правильными начальными значениями', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
      expect(screen.getByTestId('Clearbutton')).toBeInTheDocument();
    });
  });

  it('поддерживает множественный выбор в селектах', async () => {
    await act(async () => {
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('tractor-model-select')).toBeInTheDocument();
    });
    const tractorSelect = screen.getByTestId('tractor-model-select-inner');
    expect(tractorSelect.multiple).toBe(true);
  });
});