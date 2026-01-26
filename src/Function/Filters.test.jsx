// 1. Создаём мок
const mockUseAuth = vi.hoisted(() => vi.fn());

// 2. Мокаем модуль ДО импортов
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth
}));


import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Filters } from './Filters_agregates'

vi.mock('../shrineofvsakoe/ip.jsx', () => ({ ip: '127.0.0.1' }))
vi.mock('react-select', () => {
  const Select = ({ options, value, onChange, isMulti }) => (
    <select
      data-testid="mock-select"
      multiple={isMulti}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map(opt => ({
          value: opt.value,
          label: opt.label,
          model: opt.getAttribute('data-model'),
          part_number: opt.getAttribute('data-part')
        }))
        onChange(selected)
      }}
    >
      {options.map(opt => (
        <option
          key={opt.value}
          value={opt.value}
          label={opt.label}
          data-model={opt.model}
          data-part={opt.part_number}
        >
          {opt.label}
        </option>
      ))}
    </select>
  )
  return { default: Select }
})

describe('Filters', () => {
  const mockOnFilterChange = vi.fn()
  const mockOnFilterChange2 = vi.fn()
  const mockOnModelChange = vi.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    mockOnFilterChange.mockClear()
    mockOnFilterChange2.mockClear()
    mockOnModelChange.mockClear()
  })

  it('рендерит чекбоксы', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    expect(screen.getByText(/ДВС/)).toBeInTheDocument()
    expect(screen.getByText(/К-7/)).toBeInTheDocument()
  })

  it('вызывает onFilterChange при клике на ДВС', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    const checkbox = screen.getByLabelText(/ДВС/).closest('input')
    fireEvent.click(checkbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS'])
  })
})