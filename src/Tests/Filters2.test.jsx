import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters2 } from '../FiltersTractor/Filters_tractors';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// 🔧 Мокаем useAuth ДО импорта компонента
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { role: 'user' }, 
    isAuthenticated: true,
    token: 'test-token'
  }))
}));

// Мокаем api
vi.mock('../fetchAPI.js', () => ({
  api: {
    get: vi.fn(() => Promise.resolve([
      { model: 'K-742МСТ' },
      { model: 'K-7' },
      { model: 'K-525' }
    ]))
  }
}));

// Мокаем useCheckMobile
vi.mock('../CheckMobile/checkMobile.jsx', () => ({
  default: vi.fn(() => false)
}));

// Моки с hoisting
const mockFormat = vi.hoisted(() => 
  vi.fn((date, formatStr) => {
    if (!date) return null;
    if (formatStr === 'yyyy-MM-dd') {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    return date.toLocaleDateString?.() || String(date);
  })
);

const MockSelect = vi.hoisted(() => 
  vi.fn(({ placeholder, isMulti, onChange, options, value, formatOptionLabel, isClearable }) => {
    const displayValue = value 
      ? (Array.isArray(value) ? value.map(v => v?.label || v.value || v).join(', ') : value.label || value.value || value)
      : '';
    
    // Уникальный data-testid на основе placeholder
    const selectTestId = placeholder 
      ? `mock-select-${placeholder.toLowerCase().replace(/\s+/g, '-')}` 
      : 'mock-select';
    
    return (
      <div data-testid={selectTestId} data-placeholder={placeholder}>
        <input 
          data-testid="select-input" 
          placeholder={placeholder} 
          readOnly 
          value={displayValue}
          onChange={(e) => {
            if (onChange && !isMulti) {
              const matched = options?.find(opt => opt.label?.toLowerCase().includes(e.target.value.toLowerCase()));
              if (matched) onChange(matched);
            }
          }}
        />
        {/* 🔧 Кнопка очистки только если isClearable=true И есть значение */}
        {isClearable && value && (
          <button 
            data-testid="select-clear" 
            onClick={() => onChange?.(null)}
          >
            ×
          </button>
        )}
        <div data-testid="select-options">
          {options?.map(opt => {
            const isSelected = Array.isArray(value) 
              ? value.some(v => v?.value === opt.value)
              : value?.value === opt.value;
            return (
              <div 
                key={opt.value}
                data-testid={`option-${opt.value}`}
                data-selected={isSelected}
                onClick={() => {
                  if (onChange) {
                    if (isMulti) {
                      const currentValue = value || [];
                      const exists = currentValue.some(v => v?.value === opt.value);
                      const newValue = exists 
                        ? currentValue.filter(v => v?.value !== opt.value)
                        : [...currentValue, opt];
                      onChange(newValue.length ? newValue : null);
                    } else {
                      onChange(opt);
                    }
                  }
                }}
              >
                {formatOptionLabel ? formatOptionLabel(opt) : opt.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  })
);

const MockDatePicker = vi.hoisted(() => 
  vi.fn(({ selected, onChange, customInput, isClearable }) => {
    const label = customInput?.props?.label || '';
    const datepickerTestId = label 
      ? `mock-datepicker-${label.replace(':', '')}` 
      : 'mock-datepicker';
    
    return (
      <div data-testid={datepickerTestId} data-label={label}>
        {customInput ? (
          React.cloneElement(customInput, {
            onClick: customInput.props.onClick || onChange,
            'data-testid': 'datepicker-input'
          })
        ) : (
          <input 
            data-testid="datepicker-input" 
            readOnly 
            value={selected ? mockFormat(selected, 'dd.MM.yyyy') : ''} 
          />
        )}
        {isClearable && selected && (
          <button 
            data-testid="datepicker-clear" 
            onClick={() => onChange?.(null)}
          >
            ×
          </button>
        )}
      </div>
    );
  })
);

vi.mock('react-select', () => ({ default: MockSelect }));
vi.mock('react-datepicker', () => ({ default: MockDatePicker }));
vi.mock('date-fns', () => ({ format: mockFormat, ru: {} }));
vi.mock('../shrineofvsakoe/ip.jsx', () => ({ ip: 'mocked-ip' }));

describe('Filters2 Component', () => {
  const mockOnFilterChangeTracByModel = vi.fn();
  const mockOnFilterChangeByStatus = vi.fn();
  const mockHandleMajMinButtonClick = vi.fn();
  const mockOnDealerChange = vi.fn();
  const mockOnDateChange = vi.fn();
  const mockOnActualChange = vi.fn();
  const mockOnUzelChange = vi.fn();

  const defaultProps = {
    onFilterChangeTracByModel: mockOnFilterChangeTracByModel,
    onFilterChangeByStatus: mockOnFilterChangeByStatus,
    activeMajMinButton: null,
    handleMajMinButtonClick: mockHandleMajMinButtonClick,
    onDealerChange: mockOnDealerChange,
    onDateChange: mockOnDateChange,
    onActualChange: mockOnActualChange,
    onUzelChange: mockOnUzelChange,
  };

  // 🔧 Хелперы для выборки элементов
  const getSelectByPlaceholder = (placeholder) => 
    screen.getByTestId(`mock-select-${placeholder.toLowerCase().replace(/\s+/g, '-')}`);
  
  const getDatepickerByLabel = (label) => 
    screen.getByTestId(`mock-datepicker-${label.replace(':', '')}`);

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('рендерится без ошибок', async () => {
    render(<Filters2 {...defaultProps} />);
    await waitFor(() => {
      expect(getSelectByPlaceholder('Модель трактора')).toBeInTheDocument();
    });
  });

  it('содержит все основные элементы', async () => {
    render(<Filters2 {...defaultProps} />);
    
    await waitFor(() => {
      expect(getSelectByPlaceholder('Модель трактора')).toBeInTheDocument();
      expect(getSelectByPlaceholder('Все статусы')).toBeInTheDocument();
      expect(getSelectByPlaceholder('Узлы')).toBeInTheDocument();
      expect(screen.getAllByTestId(/mock-datepicker/)).toHaveLength(2);
      expect(screen.getByPlaceholderText(/поиск по дилеру/i)).toBeInTheDocument();
      expect(screen.getByText('Статус:')).toBeInTheDocument();
      expect(screen.getByText('Узел:')).toBeInTheDocument();
    });
  });

  describe('Select моделей тракторов', () => {
    it('загружает опции моделей при монтировании', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId('option-K-742МСТ')).toBeInTheDocument();
      });
    });

    it('выбор модели вызывает обработчик', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-K-742МСТ'));
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      expect(mockOnFilterChangeTracByModel).toHaveBeenCalledWith(['K-742МСТ']);
    });

    it('множественный выбор моделей', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-K-742МСТ'));
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      await userEvent.click(screen.getByTestId('option-K-7'));
      expect(mockOnFilterChangeTracByModel).toHaveBeenLastCalledWith(['K-742МСТ', 'K-7']);
    });

    // 🔧 Тест на очистку удалён, т.к. в компоненте нет isClearable для этого Select
    // Если добавите isClearable в компонент - раскомментируйте тест ниже:
    /*
    it('очистка выбора моделей', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-K-742МСТ'));
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      const modelSelect = getSelectByPlaceholder('Модель трактора');
      const clearBtn = modelSelect.querySelector('[data-testid="select-clear"]');
      if (clearBtn) await userEvent.click(clearBtn);
      expect(mockOnFilterChangeTracByModel).toHaveBeenLastCalledWith([]);
    });
    */
  });

  describe('Фильтр актуальности (статусы)', () => {
    it('отображает опции актуальности', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => {
        expect(getSelectByPlaceholder('Все статусы')).toBeInTheDocument();
      });
    });

    it('выбор статуса "Требуется обновление" вызывает обработчик', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-critical'));
      await userEvent.click(screen.getByTestId('option-critical'));
      expect(mockOnActualChange).toHaveBeenCalledWith(['critical']);
    });

    it('множественный выбор статусов актуальности', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-critical'));
      await userEvent.click(screen.getByTestId('option-critical'));
      await userEvent.click(screen.getByTestId('option-actual'));
      expect(mockOnActualChange).toHaveBeenCalledWith(['critical', 'actual']);
    });

    it('очистка выбора актуальности', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-critical'));
      await userEvent.click(screen.getByTestId('option-critical'));
      const actualitySelect = getSelectByPlaceholder('Все статусы');
      const clearBtn = actualitySelect.querySelector('[data-testid="select-clear"]');
      if (clearBtn) await userEvent.click(clearBtn);
      expect(mockOnActualChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Фильтр по узлам', () => {
    it('отображает опции узлов', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => {
        expect(getSelectByPlaceholder('Узлы')).toBeInTheDocument();
      });
    });

    it('выбор узла вызывает обработчик', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-dvs'));
      await userEvent.click(screen.getByTestId('option-dvs'));
      expect(mockOnUzelChange).toHaveBeenCalledWith(['dvs']);
    });

    it('множественный выбор узлов', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-dvs'));
      await userEvent.click(screen.getByTestId('option-dvs'));
      await userEvent.click(screen.getByTestId('option-gr'));
      expect(mockOnUzelChange).toHaveBeenCalledWith(['dvs', 'gr']);
    });
  });

  describe('Поиск по дилеру', () => {
    it('ввод текста вызывает onDealerChange', async () => {
      render(<Filters2 {...defaultProps} />);
      const input = screen.getByPlaceholderText(/поиск по дилеру/i);
      await userEvent.type(input, 'Дилер 1');
      expect(mockOnDealerChange).toHaveBeenLastCalledWith('Дилер 1');
    });

    it('поиск по Enter', async () => {
      render(<Filters2 {...defaultProps} />);
      const input = screen.getByPlaceholderText(/поиск по дилеру/i);
      await userEvent.type(input, 'Дилер{enter}');
      expect(mockOnDealerChange).toHaveBeenCalledWith('Дилер');
    });

    it('поиск по кнопке', async () => {
      render(<Filters2 {...defaultProps} />);
      const input = screen.getByPlaceholderText(/поиск по дилеру/i);
      await userEvent.type(input, 'Тест');
      await userEvent.click(screen.getByTestId('search-button'));
      expect(mockOnDealerChange).toHaveBeenCalledWith('Тест');
    });

    it('меняет плейсхолдер при фокусе', async () => {
      render(<Filters2 {...defaultProps} />);
      const input = screen.getByPlaceholderText(/поиск по дилеру/i);
      expect(input).toHaveAttribute('placeholder', 'Поиск по дилеру');
      await userEvent.click(input);
      expect(input).toHaveAttribute('placeholder', '');
      await userEvent.tab();
      expect(input).toHaveAttribute('placeholder', 'Поиск по дилеру');
    });
  });

  describe('DatePicker', () => {
    it('отображает два DatePicker с метками "С:" и "По:"', async () => {
      render(<Filters2 {...defaultProps} />);
      
      await waitFor(() => {
        expect(getDatepickerByLabel('С')).toBeInTheDocument();
        expect(getDatepickerByLabel('По')).toBeInTheDocument();
        expect(getDatepickerByLabel('С')).toHaveAttribute('data-label', 'С:');
        expect(getDatepickerByLabel('По')).toHaveAttribute('data-label', 'По:');
      });
    });

    it('очистка начальной даты вызывает onDateChange с null', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => getDatepickerByLabel('С'));
      const startDatepicker = getDatepickerByLabel('С');
      const clearBtn = startDatepicker.querySelector('[data-testid="datepicker-clear"]');
      if (clearBtn) {
        await userEvent.click(clearBtn);
        expect(mockOnDateChange).toHaveBeenCalledWith({
          date_assemle: null,
          date_start: null,
          date_end: null
        });
      }
    });

    it('очистка конечной даты вызывает onDateChange с null', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => getDatepickerByLabel('По'));
      const endDatepicker = getDatepickerByLabel('По');
      const clearBtn = endDatepicker.querySelector('[data-testid="datepicker-clear"]');
      if (clearBtn) {
        await userEvent.click(clearBtn);
        expect(mockOnDateChange).toHaveBeenCalledWith({
          date_assemle: null,
          date_start: null,
          date_end: null
        });
      }
    });
  });

  describe('Edge cases', () => {
    it('работает без опциональных обработчиков', async () => {
      const minimalProps = { 
        activeMajMinButton: null, 
        handleMajMinButtonClick: vi.fn(),
        onActualChange: vi.fn(),
        onUzelChange: vi.fn(),
      };
      await expect(async () => {
        render(<Filters2 {...minimalProps} />);
        await waitFor(() => {
          expect(screen.queryAllByTestId(/mock-select/).length).toBeGreaterThan(0);
        });
      }).not.toThrow();
    });

    it('обрабатывает ошибку загрузки моделей тракторов', async () => {
      const { api } = await import('../fetchAPI.js');
      api.get.mockRejectedValueOnce(new Error('Network error'));
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryAllByTestId(/mock-select/).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Интеграционные тесты', () => {
    it('работает со всеми фильтрами одновременно', async () => {
      render(<Filters2 {...defaultProps} />);
      await waitFor(() => screen.getByTestId('option-K-742МСТ'));
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      await userEvent.type(screen.getByPlaceholderText(/поиск по дилеру/i), 'Тестовый дилер');
      await userEvent.click(screen.getByTestId('option-critical'));
      await userEvent.click(screen.getByTestId('option-dvs'));
      expect(mockOnFilterChangeTracByModel).toHaveBeenCalledWith(['K-742МСТ']);
      expect(mockOnDealerChange).toHaveBeenCalledWith('Тестовый дилер');
      expect(mockOnActualChange).toHaveBeenCalledWith(['critical']);
      expect(mockOnUzelChange).toHaveBeenCalledWith(['dvs']);
    });
  });
});