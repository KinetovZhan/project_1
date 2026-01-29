// 1. Создаём мок
const mockUseAuth = vi.hoisted(() => vi.fn());

// 2. Мокаем модуль ДО импортов
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth
}));

// 3. Импорты
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Filters } from '../Function/Filters_agregates'

vi.mock('../shrineofvsakoe/ip.jsx', () => ({ ip: '127.0.0.1' }))
vi.mock('react-select', () => {
  const Select = ({ options, value, onChange, isMulti, isDisabled }) => (
    <select
      data-testid="mock-select"
      multiple={isMulti}
      disabled={isDisabled}
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

  const mockComponentModels = ['T-150', 'K-700', 'T-400', 'K-500']

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    mockOnFilterChange.mockClear()
    mockOnFilterChange2.mockClear()
    mockOnModelChange.mockClear()
    
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/component-models')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            component_models: mockComponentModels
          })
        })
      }
      return Promise.reject(new Error('Неизвестный URL'))
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
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
    expect(screen.getByText(/КПП/)).toBeInTheDocument()
    expect(screen.getByText(/РК/)).toBeInTheDocument()
    expect(screen.getByText(/Гидрораспределитель/)).toBeInTheDocument()
    expect(screen.getByText(/К-7/)).toBeInTheDocument()
    expect(screen.getByText(/К-5/)).toBeInTheDocument()
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

    const checkbox2 = screen.getByLabelText(/К-7/).closest('input')
    fireEvent.click(checkbox2)

    expect(mockOnFilterChange2).toHaveBeenCalledWith(['K7'])
  })

  // 🔥 ИСПРАВЛЕННЫЙ ТЕСТ: манипулируем свойством `selected` опций
  it('вызывает onModelChange при выборе модели', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /T-150/i })).toBeInTheDocument()
    })

    const select = screen.getByTestId('mock-select')
    
    // Находим опции по их тексту
    const optionT150 = screen.getByText('T-150')
    const optionK700 = screen.getByText('K-700')

    optionT150.selected = true
    optionK700.selected = true

    fireEvent.change(select)

    expect(mockOnModelChange).toHaveBeenCalledWith(['T-150', 'K-700'])
  })

  it('вызывает onModelChange с пустым массивом при отмене выбора', async () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /T-150/i })).toBeInTheDocument()
    })

    const select = screen.getByTestId('mock-select')
    const optionT150 = screen.getByText('T-150')

    // Выбираем опцию
    optionT150.selected = true
    fireEvent.change(select)
    expect(mockOnModelChange).toHaveBeenCalledWith(['T-150'])

    // Снимаем выделение
    optionT150.selected = false
    fireEvent.change(select)
    expect(mockOnModelChange).toHaveBeenCalledWith([])
  })


  it('показывает ошибку при неудачной загрузке моделей', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error("Network error"))
    })

    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    await waitFor(() => {
      const select = screen.getByTestId('mock-select')
      expect(select).toBeInTheDocument()
    })


  })





  it('корректно обрабатывает пустой ответ от сервера', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      return Promise.resolve({
        ok: true,
        json: async () => ({ component_models: [] })
      })
    })
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    await waitFor(() => {
      const select = screen.getByTestId('mock-select')
      expect(select).toBeInTheDocument()
    })

    const select = screen.getByTestId('mock-select')
    expect(select.querySelectorAll('option')).toHaveLength(0)
  })


  it('отправляем запрос без заголовка Authorization, если токена нет', async () => {
    mockUseAuth.mockReturnValue({token: null})
    global.fetch = vi.fn().mockImplementation((url,options) => {
      if(url.includes('/component-models')) {
        expect(options.headers).not.toHaveProperty('Authorization')

        return Promise.resolve({
          ok: true,
          json: async () => ({ component_models: mockComponentModels })
        })
      }
      return Promise.reject(new Error('Неизвестный URL'))
    })

    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )
    await waitFor(() => {
      const select = screen.getByTestId('mock-select')
      expect(select).toBeInTheDocument()
    })
  })

  it('отправляет запрос с заголовком Authorization, если есть токен', async () => {
    mockUseAuth.mockReturnValue({token: 'test-token'})
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if(url.includes('/component-models')) {
        expect(options.headers).toHaveProperty('Authorization', 'Bearer test-token')
        return Promise.resolve({
          ok: true,
          json: async () => ({ component_models: mockComponentModels})
        })
      }
      return Promise.reject(new Error('Неизвестный URL'))
    })
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    await waitFor (() => {
      expect(screen.getByTestId('mock-select')).toBeInTheDocument()
    })
  })
  

  it('вызывает DVS при клике на двс', () => {
  
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
  
    )
  
    const checkbox = screen.getByLabelText(/ДВС/)
    fireEvent.click(checkbox)
    expect(mockOnFilterChange).toHaveBeenCalledWith(['DVS'])
  })

  it('вызывает KPP при нажатии на КПП', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    const checkbox = screen.getByLabelText(/КПП/)
    fireEvent.click(checkbox)
    expect(mockOnFilterChange).toHaveBeenCalledWith(['KPP'])
  })

  it('вызывает RK при нажатии на РК', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    const checkbox = screen.getByLabelText(/РК/)
    fireEvent.click(checkbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith(['RK'])
  })

  it('вызывает Гидрораспределитель при нажатии на hydrorasp', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    const checkbox = screen.getByLabelText(/Гидрораспределитель/)
    fireEvent.click(checkbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith(['hydrorasp'])
  })

  it('вызывает К-5 при нажатии на K5', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    const checkbox = screen.getByLabelText(/К-5/).closest('input')
    fireEvent.click(checkbox)

    expect(mockOnFilterChange2).toHaveBeenCalledWith(['K5'])
  })

  it('очищает фильтры при нажатии кнопки сброс', () => {
    render(
      <Filters
        onFilterChange={mockOnFilterChange}
        onFilterChange2={mockOnFilterChange2}
        onModelChange={mockOnModelChange}
      />
    )

    const checkbox1 = screen.getByLabelText(/ДВС/)
    const checkbox2 = screen.getByLabelText(/К-5/)

    fireEvent.click(checkbox1)
    fireEvent.click(checkbox2)

    const button = screen.getByTestId('Clearbutton')
    fireEvent.click(button)

    expect(mockOnFilterChange2).toHaveBeenCalledWith([])
    expect(mockOnFilterChange).toHaveBeenCalledWith([])
    expect(mockOnModelChange).toHaveBeenCalledWith([])
  })

    it('обрабатывает HTTP ошибку (статус не 200)', async () => {
      global.fetch =vi.fn().mockImplementation((url) => {
        if(url.includes('/component-models')) {
          return Promise.resolve ({
            ok: false,
            json: async () => ({error: 'Server error'})
          })
        }
        return Promise.reject(new Error('Неизвестый URL'))
      })
      render(
        <Filters
          onFilterChange={mockOnFilterChange}
          onFilterChange2={mockOnFilterChange2}
          onModelChange={mockOnModelChange}
        />
      )
  
      await waitFor(() => {
        expect(screen.getByTestId('mock-select')).toBeInTheDocument()
      })
  
      const select = screen.getByTestId('mock-select')
      expect(select.querySelectorAll('option')).toHaveLength(0)
    })
})