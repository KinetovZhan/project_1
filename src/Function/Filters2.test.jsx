// src/Function/Filters2.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Filters2 } from './Filters_tractors'

// Мокаем зависимости
vi.mock('../shrineofvsakoe/ip.jsx', () => ({ ip: '127.0.0.1' }))
vi.mock('react-datepicker', () => {
  const DatePicker = ({ onChange, selected }) => (
    <input
      data-testid="date-picker-mock"
      onChange={(e) => onChange(new Date(e.target.value))}
      value={selected?.toISOString() || ''}
    />
  )
  return { default: DatePicker }
})

describe('Filters2', () => {
  const mockOnDealerChange = vi.fn()
  const mockOnDateChange = vi.fn()
  const mockOnFilterChangeTracByModel = vi.fn()
  const mockOnFilterChangeByStatus = vi.fn()
  const mockHandleMajMinButtonClick = vi.fn()

  beforeEach(() => {
    mockOnDealerChange.mockClear()
    mockOnDateChange.mockClear()
    mockOnFilterChangeTracByModel.mockClear()
    mockOnFilterChangeByStatus.mockClear()
    mockHandleMajMinButtonClick.mockClear()
  })

  it('рендерит все элементы', () => {
    render(
      <Filters2
        onDealerChange={mockOnDealerChange}
        onDateChange={mockOnDateChange}
        onFilterChangeTracByModel={mockOnFilterChangeTracByModel}
        onFilterChangeByStatus={mockOnFilterChangeByStatus}
        handleMajMinButtonClick={mockHandleMajMinButtonClick}
        activeMajMinButton={null}
      />
    )

    expect(screen.getByText(/К-742МСТ/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Поиск по дилеру/i)).toBeInTheDocument()
    expect(screen.getByText(/Серийное/)).toBeInTheDocument()
  })

  it('вызывает onDealerChange при вводе', () => {
    render(
      <Filters2
        onDealerChange={mockOnDealerChange}
        onDateChange={mockOnDateChange}
        onFilterChangeTracByModel={mockOnFilterChangeTracByModel}
        onFilterChangeByStatus={mockOnFilterChangeByStatus}
        handleMajMinButtonClick={mockHandleMajMinButtonClick}
        activeMajMinButton={null}
      />
    )

    const input = screen.getByPlaceholderText(/Поиск по дилеру/i)
    fireEvent.change(input, { target: { value: 'АгроТех' } })

    expect(mockOnDealerChange).toHaveBeenCalledWith('АгроТех')
  })

  it('вызывает onFilterChangeTracByModel при клике на чекбокс модели', () => {
    render(
      <Filters2
        onDealerChange={mockOnDealerChange}
        onDateChange={mockOnDateChange}
        onFilterChangeTracByModel={mockOnFilterChangeTracByModel}
        onFilterChangeByStatus={mockOnFilterChangeByStatus}
        handleMajMinButtonClick={mockHandleMajMinButtonClick}
        activeMajMinButton={null}
      />
    )

    const checkbox = screen.getByLabelText(/К-742МСТ/).closest('input')
    fireEvent.click(checkbox)

    expect(mockOnFilterChangeTracByModel).toHaveBeenCalledWith(['K742MST'])
  })

  it('вызывает handleMajMinButtonClick при клике на кнопку MAJ', () => {
    render(
      <Filters2
        onDealerChange={mockOnDealerChange}
        onDateChange={mockOnDateChange}
        onFilterChangeTracByModel={mockOnFilterChangeTracByModel}
        onFilterChangeByStatus={mockOnFilterChangeByStatus}
        handleMajMinButtonClick={mockHandleMajMinButtonClick}
        activeMajMinButton={null}
      />
    )

    fireEvent.click(screen.getByText(/Требуется MAJ/))
    expect(mockHandleMajMinButtonClick).toHaveBeenCalledWith('MAJ')
  })
})