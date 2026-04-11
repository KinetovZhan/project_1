// src/Tests/Filters2.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters2 } from '../FiltersTractor/Filters_tractors';
import '@testing-library/jest-dom/vitest';

// Моки с hoisting
const mockFormat = vi.hoisted(() => 
  vi.fn((date, formatStr) => {
    if (!date) return null;
    if (formatStr === 'yyyy-MM-dd') {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    return date.toLocaleDateString();
  })
);

const MockSelect = vi.hoisted(() => 
  vi.fn(({ placeholder, isMulti, onChange, options, value }) => (
    <div data-testid="mock-select">
      <input 
        data-testid="select-input" 
        placeholder={placeholder} 
        readOnly 
        value={value?.map(v => v.value).join(',') || ''}
      />
      <div data-testid="select-options">
        {options?.map(opt => (
          <div 
            key={opt.value}
            data-testid={`option-${opt.value}`}
            onClick={() => {
              if (onChange) {
                if (isMulti) {
                  const newValue = value ? [...value, opt] : [opt];
                  onChange(newValue);
                } else {
                  onChange(opt);
                }
              }
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  ))
);

const MockDatePicker = vi.hoisted(() => 
  vi.fn(({ selected, onChange, customInput }) => {
    if (customInput) {
      return (
        <div data-testid="mock-datepicker">
          {customInput}
          <button data-testid="datepicker-clear" onClick={() => onChange && onChange(null)}>Clear</button>
        </div>
      );
    }
    return (
      <div data-testid="mock-datepicker">
        <input data-testid="datepicker-input" readOnly value={selected ? selected.toLocaleDateString() : ''} />
        <button data-testid="datepicker-clear" onClick={() => onChange && onChange(null)}>Clear</button>
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

  const defaultProps = {
    onFilterChangeTracByModel: mockOnFilterChangeTracByModel,
    onFilterChangeByStatus: mockOnFilterChangeByStatus,
    activeMajMinButton: null,
    handleMajMinButtonClick: mockHandleMajMinButtonClick,
    onDealerChange: mockOnDealerChange,
    onDateChange: mockOnDateChange,
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('рендерится без ошибок', () => {
    render(<Filters2 {...defaultProps} />);
    expect(screen.getByTestId('mock-select')).toBeInTheDocument();
  });

  it('содержит все основные элементы', () => {
    render(<Filters2 {...defaultProps} />);
    expect(screen.getByTestId('mock-select')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-datepicker')).toHaveLength(2);
    expect(screen.getByPlaceholderText(/поиск по дилеру/i)).toBeInTheDocument();
    expect(screen.getByText('Серийное')).toBeInTheDocument();
    expect(screen.getByText('Опытное')).toBeInTheDocument();
    expect(screen.getByText('Актуальное')).toBeInTheDocument();
    expect(screen.getByText('Критические')).toBeInTheDocument();
    expect(screen.getByText('Требуется MAJ')).toBeInTheDocument();
    expect(screen.getByText('Требуется MIN')).toBeInTheDocument();
  });

  describe('Select моделей тракторов', () => {
    it('выбор модели вызывает обработчик', async () => {
      render(<Filters2 {...defaultProps} />);
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      expect(mockOnFilterChangeTracByModel).toHaveBeenCalledWith(['K-742МСТ']);
    });

    it('множественный выбор моделей', async () => {
      render(<Filters2 {...defaultProps} />);
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      await userEvent.click(screen.getByTestId('option-K-7'));
      expect(mockOnFilterChangeTracByModel).toHaveBeenLastCalledWith(['K-742МСТ', 'K-7']);
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
  });

  describe('Фильтры по статусам', () => {
    it('чекбокс "Серийное"', async () => {
      render(<Filters2 {...defaultProps} />);
      const checkbox = screen.getByLabelText('Серийное');
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['s']);
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith([]);
    });

    it('чекбокс "Опытное"', async () => {
      render(<Filters2 {...defaultProps} />);
      const checkbox = screen.getByLabelText('Опытное');
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['t']);
    });

    it('чекбокс "Актуальное"', async () => {
      render(<Filters2 {...defaultProps} />);
      const checkbox = screen.getByLabelText('Актуальное');
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['b']);
    });

    it('чекбокс "Критические"', async () => {
      render(<Filters2 {...defaultProps} />);
      const checkbox = screen.getByLabelText('Критические');
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['o']);
    });

    it('несколько чекбоксов одновременно', async () => {
      render(<Filters2 {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Серийное'));
      await userEvent.click(screen.getByLabelText('Опытное'));
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['s', 't']);
    });
  });

  describe('Кнопки MAJ/MIN', () => {
    it('кнопка MAJ вызывает обработчик', async () => {
      render(<Filters2 {...defaultProps} />);
      await userEvent.click(screen.getByText('Требуется MAJ'));
      expect(mockHandleMajMinButtonClick).toHaveBeenCalledWith('MAJ');
    });

    it('кнопка MIN вызывает обработчик', async () => {
      render(<Filters2 {...defaultProps} />);
      await userEvent.click(screen.getByText('Требуется MIN'));
      expect(mockHandleMajMinButtonClick).toHaveBeenCalledWith('MIN');
    });

    it('активный класс для MAJ кнопки', () => {
      render(<Filters2 {...defaultProps} activeMajMinButton="MAJ" />);
      expect(screen.getByText('Требуется MAJ')).toHaveClass('majmin_button_active');
    });

    it('активный класс для MIN кнопки', () => {
      render(<Filters2 {...defaultProps} activeMajMinButton="MIN" />);
      expect(screen.getByText('Требуется MIN')).toHaveClass('majmin_button_active');
    });
  });

  describe('DatePicker', () => {
    it('очистка даты вызывает onDateChange', async () => {
      render(<Filters2 {...defaultProps} />);
      const clearButtons = screen.getAllByTestId('datepicker-clear');
      await userEvent.click(clearButtons[0]);
      expect(mockOnDateChange).toHaveBeenCalledWith({
        date_assemle: null,
        date_start: null,
        date_end: null
      });
    });
  });

  describe('Взаимодействие с фокусом', () => {
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

  describe('Edge cases', () => {
    it('работает без опциональных обработчиков', () => {
      const minimalProps = { activeMajMinButton: null, handleMajMinButtonClick: vi.fn() };
      expect(() => render(<Filters2 {...minimalProps} />)).not.toThrow();
    });
  });

  describe('Дополнительные интеграционные тесты', () => {
    it('работает со всеми фильтрами одновременно', async () => {
      render(<Filters2 {...defaultProps} />);
      await userEvent.click(screen.getByTestId('option-K-742МСТ'));
      await userEvent.type(screen.getByPlaceholderText(/поиск по дилеру/i), 'Тестовый дилер');
      await userEvent.click(screen.getByLabelText('Серийное'));
      await userEvent.click(screen.getByLabelText('Критические'));
      expect(mockOnFilterChangeTracByModel).toHaveBeenCalledWith(['K-742МСТ']);
      expect(mockOnDealerChange).toHaveBeenCalledWith('Тестовый дилер');
      expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['s', 'o']);
    });
  });
});