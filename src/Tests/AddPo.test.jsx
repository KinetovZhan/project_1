// src/Tests/AddPo.test.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ===== МОКИ ДОЛЖНЫ БЫТЬ ПЕРЕД ИМПОРТОМ КОМПОНЕНТА =====
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token-123' })
}))

vi.mock('../CheckMobile/checkMobile.jsx', () => ({
  default: () => false
}))

// Мок для react-select (заменяем на нативный select)
vi.mock('react-select', () => {
  const MockSelect = ({
    isMulti,
    options = [],
    onChange,
    value,
    placeholder = 'Выберите...',
    'data-testid': testId,
    isDisabled,
    ...props
  }) => {
    const handleChange = (e) => {
      if (isMulti) {
        const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value)
        const selectedOptions = options.filter(opt => selectedValues.includes(opt.value))
        onChange(selectedOptions)
      } else {
        const selectedValue = e.target.value
        const selectedOption = options.find(opt => opt.value === selectedValue) || null
        onChange(selectedOption)
      }
    }

    const getValue = () => {
      if (isMulti) {
        if (Array.isArray(value)) return value.map(v => v.value)
        return []
      }
      return value?.value ?? ''
    }

    return (
      <select
        data-testid={testId || `mock-select-${placeholder}`}
        aria-label={placeholder}
        onChange={handleChange}
        value={getValue()}
        multiple={isMulti}
        disabled={isDisabled}
        style={{ width: '100%', height: '40px', border: '1px solid #ccc', borderRadius: '4px', padding: '0 12px' }}
        {...props}
      >
        {!isMulti && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
  return { __esModule: true, default: MockSelect }
})

// Мок для react-select/creatable (используем тот же компонент)
vi.mock('react-select/creatable', () => {
  const MockCreatable = (props) => {
    const MockSelect = require('react-select').default
    return <MockSelect {...props} />
  }
  return { __esModule: true, default: MockCreatable }
})

// Теперь импортируем компонент после моков
import { AddPoForm } from '../AddPo/AddPo.jsx'

global.fetch = vi.fn()
global.alert = vi.fn()

describe('AddPoForm', () => {
  const mockOnBack = vi.fn()
  const mockOnSubmit = vi.fn()

  const mockComponentOptions = [
    { id: 1, name: 'Двигатель', type: 'engine', producer: 'Producer A' },
    { id: 2, name: 'КПП', type: 'transmission', producer: 'Producer B' },
  ]

  const mockSoftwareOptions = [
    { id: 10, filename: 'some_long_name_software_v1.bin', release_date: '2024-01-01', producer: 'Producer X' },
    { id: 11, filename: 'another_software_v2.bin', release_date: '2024-02-01', producer: 'Producer Y' },
  ]

  const mockTractorModels = {
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => [{ model: 'Tractor Model 1' }, { model: 'Tractor Model 2' }]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.alert.mockClear()

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockComponentOptions
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockSoftwareOptions
      })
      .mockResolvedValueOnce(mockTractorModels)
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockSoftwareOptions
      })
  })

  afterEach(() => {
    cleanup()
  })

  describe('Базовые тесты', () => {
    it('должен отображать заголовок и основные поля', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Добавление нового ПО')).toBeInTheDocument()
      })

      expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument()
      // Ищем селекты по data-testid, который мы добавили в мок
      expect(screen.getByTestId('mock-select-Выберите производителя')).toBeInTheDocument()
      expect(screen.getByTestId('mock-select-Выберите модели тракторов')).toBeInTheDocument()
      expect(screen.getByTestId('mock-select-Выберите узлы')).toBeInTheDocument()
      expect(screen.getByTestId('mock-select-Выберите назначение')).toBeInTheDocument()
      expect(screen.getByTestId('filePo')).toBeInTheDocument()
    })

    it('должен устанавливать сегодняшнюю дату по умолчанию', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />)

      await waitFor(() => {
        const dateInput = document.querySelector('input[name="releaseDate"]')
        expect(dateInput).toBeInTheDocument()
        expect(dateInput.value).toBeTruthy()
      })
    })

    it('должен вызывать onBack при клике на кнопку назад', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument()
      })

      const backButton = document.querySelector('.go-back')
      expect(backButton).toBeInTheDocument()
      await userEvent.click(backButton)
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Тесты валидации', () => {
    it('должен показывать alert при отсутствии файла', async () => {
      const user = userEvent.setup()
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('Введите название'), 'Test Software')

      const producerSelect = screen.getByTestId('mock-select-Выберите производителя')
      await user.selectOptions(producerSelect, 'Producer X')

      const tractorSelect = screen.getByTestId('mock-select-Выберите модели тракторов')
      await user.selectOptions(tractorSelect, 'Tractor Model 1')

      const statusSelect = screen.getByTestId('mock-select-Выберите назначение')
      await user.selectOptions(statusSelect, 'serial')

      const form = document.querySelector('form.add-po-form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Пожалуйста, выберите файл ПО')
      })

      alertSpy.mockRestore()
    })
  })

  describe('Успешная отправка', () => {
    it('должен отправлять форму при skipValidation=true', async () => {
      const user = userEvent.setup()

      const mockSubmitResponse = { success: true, id: 456 }
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockComponentOptions })
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions })
        .mockResolvedValueOnce(mockTractorModels)
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions })
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockSubmitResponse })
      global.fetch = fetchMock

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('Введите название'), 'Test Software')

      const producerSelect = screen.getByTestId('mock-select-Выберите производителя')
      await user.selectOptions(producerSelect, 'Producer X')

      const tractorSelect = screen.getByTestId('mock-select-Выберите модели тракторов')
      await user.selectOptions(tractorSelect, 'Tractor Model 1')

      const statusSelect = screen.getByTestId('mock-select-Выберите назначение')
      await user.selectOptions(statusSelect, 'serial')

      const fileInput = screen.getByTestId('filePo')
      const file = new File(['content'], 'software.bin', { type: 'application/octet-stream' })
      await user.upload(fileInput, file)

      const form = document.querySelector('form.add-po-form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(5)
      })
      expect(mockOnSubmit).toHaveBeenCalledWith(mockSubmitResponse)
    })
  })

  describe('Обработка ошибок', () => {
    it('должен обрабатывать ошибку сервера', async () => {
      const user = userEvent.setup()
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockComponentOptions })
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions })
        .mockResolvedValueOnce(mockTractorModels)
        .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => mockSoftwareOptions })
        .mockResolvedValueOnce({ ok: false, status: 400, headers: { get: () => 'application/json' }, json: async () => ({ detail: 'Invalid file format' }) })
      global.fetch = fetchMock

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Введите название')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('Введите название'), 'Error Software')

      const producerSelect = screen.getByTestId('mock-select-Выберите производителя')
      await user.selectOptions(producerSelect, 'Producer X')

      const tractorSelect = screen.getByTestId('mock-select-Выберите модели тракторов')
      await user.selectOptions(tractorSelect, 'Tractor Model 1')

      const statusSelect = screen.getByTestId('mock-select-Выберите назначение')
      await user.selectOptions(statusSelect, 'serial')

      const fileInput = screen.getByTestId('filePo')
      await user.upload(fileInput, new File(['error'], 'error.bin', { type: 'application/octet-stream' }))

      const form = document.querySelector('form.add-po-form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled()
      })

      alertSpy.mockRestore()
    })
  })
})