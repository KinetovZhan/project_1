// src/Function/Filters2.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Filters2 } from '../Function/Filters_tractors';

// Мокаем IP
vi.mock('../shrineofvsakoe/ip.jsx', () => ({ ip: '127.0.0.1' }));

// Мокаем DatePicker
vi.mock('react-datepicker', () => {
  const MockDatePicker = ({ onChange, startDate, endDate, onClear }) => (
    <div data-testid="mock-date-picker">
      <input
        data-testid="start-date"
        value={startDate?.toISOString() || ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange([date, endDate]);
        }}
      />
      <input
        data-testid="end-date"
        value={endDate?.toISOString() || ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange([startDate, date]);
        }}
      />
      <button data-testid="clear-date" onClick={onClear}>
        Очистить
      </button>
    </div>
  );
  MockDatePicker.defaultProps = { selectsRange: true };
  return { default: MockDatePicker };
});

describe('Filters2', () => {
  const mockOnDealerChange = vi.fn();
  const mockOnDateChange = vi.fn();
  const mockOnFilterChangeTracByModel = vi.fn();
  const mockOnFilterChangeByStatus = vi.fn();
  const mockHandleMajMinButtonClick = vi.fn();

  beforeEach(() => {
    mockOnDealerChange.mockClear();
    mockOnDateChange.mockClear();
    mockOnFilterChangeTracByModel.mockClear();
    mockOnFilterChangeByStatus.mockClear();
    mockHandleMajMinButtonClick.mockClear();
  });

  const renderComponent = (props = {}) =>
    render(
      <Filters2
        onDealerChange={mockOnDealerChange}
        onDateChange={mockOnDateChange}
        onFilterChangeTracByModel={mockOnFilterChangeTracByModel}
        onFilterChangeByStatus={mockOnFilterChangeByStatus}
        handleMajMinButtonClick={mockHandleMajMinButtonClick}
        activeMajMinButton={null}
        {...props}
      />
    );

  it('рендерит все элементы', () => {
    renderComponent();

    // ✅ Кириллическая "К" — потому что в интерфейсе отображается кириллица
    expect(screen.getByText('К-742МСТ')).toBeInTheDocument();
    expect(screen.getByText('К-7')).toBeInTheDocument();
    expect(screen.getByText('К-525')).toBeInTheDocument();

    // Статусы
    expect(screen.getByText('Серийное')).toBeInTheDocument();
    expect(screen.getByText('Опытное')).toBeInTheDocument();
    expect(screen.getByText('Актуальное')).toBeInTheDocument();
    expect(screen.getByText('Критические')).toBeInTheDocument();

    // Дилер и дата
    expect(screen.getByPlaceholderText(/Поиск по дилеру/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();

    // Кнопки MAJ/MIN
    expect(screen.getByText('Требуется MAJ')).toBeInTheDocument();
    expect(screen.getByText('Требуется MIN')).toBeInTheDocument();
  });

  // === Фильтрация по моделям ===
  it('вызывает onFilterChangeTracByModel при клике на чекбокс модели', () => {
    renderComponent();

    // ✅ Кириллическая "К" — ищем в интерфейсе
    const checkbox = screen.getByLabelText('К-742МСТ').closest('input');
    fireEvent.click(checkbox);

    // ✅ Латинская "K" — компонент преобразует через FilterToTractor
    expect(mockOnFilterChangeTracByModel).toHaveBeenCalledWith(['K-742МСТ']);
  });

  it('поддерживает множественный выбор моделей', () => {
    renderComponent();

    // ✅ Кириллическая "К" — ищем в интерфейсе
    fireEvent.click(screen.getByLabelText('К-742МСТ').closest('input'));
    fireEvent.click(screen.getByLabelText('К-7').closest('input'));

    // ✅ Латинская "K" — компонент преобразует через FilterToTractor
    expect(mockOnFilterChangeTracByModel).toHaveBeenLastCalledWith(['K-742МСТ', 'K-7']);
  });

  // === Фильтрация по статусу ===
  it('вызывает onFilterChangeByStatus при клике на чекбокс статуса', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Серийное').closest('input'));

    expect(mockOnFilterChangeByStatus).toHaveBeenCalledWith(['s']);
  });

  it('поддерживает множественный выбор статусов', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Серийное').closest('input'));
    fireEvent.click(screen.getByLabelText('Опытное').closest('input'));

    expect(mockOnFilterChangeByStatus).toHaveBeenLastCalledWith(['s', 't']);
  });

  it('вызывает onDealerChange при вводе текста', () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/Поиск по дилеру/i);
    fireEvent.change(input, { target: { value: 'АгроТех' } });

    expect(mockOnDealerChange).toHaveBeenCalledWith('АгроТех');
  });

  it('вызывает onDealerChange при нажатии Enter', () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/Поиск по дилеру/i);
    fireEvent.change(input, { target: { value: 'АгроТех' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnDealerChange).toHaveBeenCalledWith('АгроТех');
  });

  it('вызывает onDealerChange при клике на кнопку поиска', () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/Поиск по дилеру/i);
    fireEvent.change(input, { target: { value: 'АгроТех' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    expect(mockOnDealerChange).toHaveBeenCalledWith('АгроТех');
  });

  // === Работа с датами ===
  it('вызывает onDateChange при выборе одной даты', () => {
    renderComponent();

    const startDateInput = screen.getByTestId('start-date');
    fireEvent.change(startDateInput, { target: { value: '2023-05-15' } });

    expect(mockOnDateChange).toHaveBeenCalledWith({
      date_assemle: '2023-05-15',
      date_start: null,
      date_end: null,
    });
  });

  it('вызывает onDateChange при выборе диапазона дат', () => {
    renderComponent();

    const startInput = screen.getByTestId('start-date');
    const endInput = screen.getByTestId('end-date');

    fireEvent.change(startInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endInput, { target: { value: '2023-12-31' } });

    expect(mockOnDateChange).toHaveBeenCalledWith({
      date_assemle: null,
      date_start: '2023-01-01',
      date_end: '2023-12-31',
    });
  });

  it('вызывает onDateChange при очистке даты', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('clear-date'));

    expect(mockOnDateChange).toHaveBeenCalledWith({
      date_assemle: null,
      date_start: null,
      date_end: null,
    });
  });

  // === Кнопки MAJ / MIN ===
  it('вызывает handleMajMinButtonClick с "MAJ"', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Требуется MAJ'));
    expect(mockHandleMajMinButtonClick).toHaveBeenCalledWith('MAJ');
  });

  it('вызывает handleMajMinButtonClick с "MIN"', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Требуется MIN'));
    expect(mockHandleMajMinButtonClick).toHaveBeenCalledWith('MIN');
  });

  // === Проверка активного состояния кнопок (через пропс) ===
  it('применяет активный класс к MAJ, если activeMajMinButton = "MAJ"', () => {
    renderComponent({ activeMajMinButton: 'MAJ' });
    expect(screen.getByText('Требуется MAJ')).toHaveClass('majmin_button_active');
    expect(screen.getByText('Требуется MIN')).not.toHaveClass('majmin_button_active');
  });

  it('применяет активный класс к MIN, если activeMajMinButton = "MIN"', () => {
    renderComponent({ activeMajMinButton: 'MIN' });
    expect(screen.getByText('Требуется MIN')).toHaveClass('majmin_button_active');
    expect(screen.getByText('Требуется MAJ')).not.toHaveClass('majmin_button_active');
  });
});