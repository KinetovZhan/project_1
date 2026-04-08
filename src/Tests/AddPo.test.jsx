// src/Tests/AddPo.test.jsx

// 🔧 ВСЕ импорты и моки ДО импорта компонента!
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ===== 🔧 Создаём общий мок-компонент через hoisted =====
const mockSelectComponent = vi.hoisted(() => {
  return ({
    isMulti = false,
    options = [],
    onChange,
    value,
    placeholder = 'Выберите...',
    'data-testid': explicitTestId,
    isDisabled = false,
    // 🔧 Игнорируем react-select-специфичные пропсы
    classNamePrefix,
    noOptionsMessage,
    isClearable,
    isSearchable,
    isLoading,
    formatCreateLabel,
    onCreateOption,
    menuPortalTarget,
    styles,
    ..._rest
  }) => {
    const handleChange = (e) => {
      if (isDisabled) return;
      if (isMulti) {
        const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
        const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
        onChange?.(selectedOptions);
      } else {
        const selectedValue = e.target.value;
        const selectedOption = options.find(opt => opt.value === selectedValue) || null;
        onChange?.(selectedOption);
      }
    };

    const getValue = () => {
      if (isMulti) {
        if (Array.isArray(value)) return value.map(v => v?.value ?? '');
        return [];
      }
      return value?.value ?? '';
    };

    // 🔧 Генерируем testId из placeholder, если не передан явно
    const testId = explicitTestId || `mock-select-${placeholder}`;

    return (
      <select
        data-testid={testId}
        aria-label={placeholder}
        onChange={handleChange}
        value={getValue()}
        multiple={isMulti}
        disabled={isDisabled}
        style={{ width: '100%', height: '40px', border: '1px solid #ccc', borderRadius: '4px' }}
        {..._rest}
      >
        {!isMulti && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };
});

// ===== МОК useAuth =====
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token-123' })
}));

// ===== МОК useCheckMobile =====
vi.mock('../CheckMobile/checkMobile.jsx', () => ({
  default: () => false
}));

// ===== МОК react-select (используем hoisted компонент) =====
vi.mock('react-select', () => ({
  __esModule: true,
  default: mockSelectComponent
}));

// ===== МОК react-select/creatable (ТАКЖЕ используем hoisted компонент!) =====
vi.mock('react-select/creatable', () => ({
  __esModule: true,
  default: mockSelectComponent  // 🔧 Тот же компонент, что и для обычного Select
}));

// 🔧 Теперь импортируем компонент ПОСЛЕ всех моков
import { AddPoForm } from '../AddPo/AddPo.jsx';

// Глобальные моки
global.fetch = vi.fn();
global.alert = vi.fn();

describe('AddPoForm', () => {
  const mockOnBack = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockComponentOptions = [
    { id: 1, name: 'Двигатель', type: 'engine', producer: 'Producer A' },
    { id: 2, name: 'КПП', type: 'transmission', producer: 'Producer B' },
  ];

  const mockSoftwareOptions = [
    { id: 10, filename: 'some_long_name_software_v1.bin', release_date: '2024-01-01', producer: 'Producer X' },
    { id: 11, filename: 'another_software_v2.bin', release_date: '2024-02-01', producer: 'Producer Y' },
  ];

  const mockTractorModels = {
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => [{ model: 'Tractor Model 1' }, { model: 'Tractor Model 2' }]
  };

  // 🔧 Функция для настройки моков fetch с контролем порядка вызовов
  const setupFetchMocks = (additionalMocks = []) => {
    let callIndex = 0;
    
    global.fetch.mockImplementation(async (url, options) => {
      if (callIndex < additionalMocks.length) {
        return additionalMocks[callIndex++];
      }
      // Дефолтные ответы по endpoint
      if (url.includes('components')) {
        return {
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => mockComponentOptions
        };
      }
      if (url.includes('software')) {
        return {
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => mockSoftwareOptions
        };
      }
      if (url.includes('tractor-models')) {
        return mockTractorModels;
      }
      return { ok: true, json: async () => [] };
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.alert.mockClear();
    setupFetchMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Базовые тесты', () => {
    it('должен отображать заголовок и основные поля', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

      await waitFor(() => {
        expect(screen.getByText('Добавление нового ПО')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument();
      
      // 🔧 Ищем селекты по data-testid из мока
      expect(screen.getByTestId('mock-select-Выберите производителя')).toBeInTheDocument();
      expect(screen.getByTestId('mock-select-Выберите модели тракторов')).toBeInTheDocument();
      expect(screen.getByTestId('mock-select-Выберите узлы')).toBeInTheDocument();
      expect(screen.getByTestId('mock-select-Выберите назначение')).toBeInTheDocument();
      expect(screen.getByTestId('filePo')).toBeInTheDocument();
    });

    it('должен устанавливать сегодняшнюю дату по умолчанию', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

      await waitFor(() => {
        const dateInput = document.querySelector('input[name="releaseDate"]');
        expect(dateInput).toBeInTheDocument();
        expect(dateInput.value).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('должен вызывать onBack при клике на кнопку назад', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument();
      }, { timeout: 3000 });

      const backButton = document.querySelector('.go-back');
      expect(backButton).toBeInTheDocument();
      await userEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Тесты валидации', () => {
    it('должен показывать alert при отсутствии файла', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument();
      }, { timeout: 3000 });

      await user.type(screen.getByPlaceholderText('Введите название'), 'Test Software');

      const producerSelect = screen.getByTestId('mock-select-Выберите производителя');
      await user.selectOptions(producerSelect, 'Producer X');

      const tractorSelect = screen.getByTestId('mock-select-Выберите модели тракторов');
      await user.selectOptions(tractorSelect, 'Tractor Model 1');

      const statusSelect = screen.getByTestId('mock-select-Выберите назначение');
      await user.selectOptions(statusSelect, 'serial');

      const form = document.querySelector('form.add-po-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Пожалуйста, выберите файл ПО');
      }, { timeout: 2000 });

      alertSpy.mockRestore();
    });
  });

  describe('Успешная отправка', () => {
    it('должен отправлять форму при skipValidation=true', async () => {
      const user = userEvent.setup();
      const mockSubmitResponse = { success: true, id: 456 };

      // 🔧 Настраиваем моки fetch с правильным порядком вызовов
      const submitMock = {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockSubmitResponse
      };
      
      setupFetchMocks([
        { ok: true, headers: { get: () => 'application/json' }, json: async () => mockComponentOptions },
        { ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions },
        mockTractorModels,
        { ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions },
        submitMock
      ]);

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument();
      }, { timeout: 3000 });

      await user.type(screen.getByPlaceholderText('Введите название'), 'Test Software');

      const producerSelect = screen.getByTestId('mock-select-Выберите производителя');
      await user.selectOptions(producerSelect, 'Producer X');

      const tractorSelect = screen.getByTestId('mock-select-Выберите модели тракторов');
      await user.selectOptions(tractorSelect, 'Tractor Model 1');

      const statusSelect = screen.getByTestId('mock-select-Выберите назначение');
      await user.selectOptions(statusSelect, 'serial');

      const fileInput = screen.getByTestId('filePo');
      const file = new File(['content'], 'software.bin', { type: 'application/octet-stream' });
      await user.upload(fileInput, file);

      const form = document.querySelector('form.add-po-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      expect(mockOnSubmit).toHaveBeenCalledWith(mockSubmitResponse);
    });
  });

  describe('Обработка ошибок', () => {
    it('должен обрабатывать ошибку сервера', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      setupFetchMocks([
        { ok: true, headers: { get: () => 'application/json' }, json: async () => mockComponentOptions },
        { ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions },
        mockTractorModels,
        { ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions },
        { 
          ok: false, 
          status: 400, 
          headers: { get: () => 'application/json' }, 
          json: async () => ({ detail: 'Invalid file format' }) 
        }
      ]);

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument();
      }, { timeout: 3000 });

      await user.type(screen.getByPlaceholderText('Введите название'), 'Error Software');

      const producerSelect = screen.getByTestId('mock-select-Выберите производителя');
      await user.selectOptions(producerSelect, 'Producer X');

      const tractorSelect = screen.getByTestId('mock-select-Выберите модели тракторов');
      await user.selectOptions(tractorSelect, 'Tractor Model 1');

      const statusSelect = screen.getByTestId('mock-select-Выберите назначение');
      await user.selectOptions(statusSelect, 'serial');

      const fileInput = screen.getByTestId('filePo');
      await user.upload(fileInput, new File(['error'], 'error.bin', { type: 'application/octet-stream' }));

      const form = document.querySelector('form.add-po-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      }, { timeout: 3000 });

      alertSpy.mockRestore();
    });
  });
});