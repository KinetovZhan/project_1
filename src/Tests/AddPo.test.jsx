// src/Tests/AddPo.test.jsx - ОКОНЧАТЕЛЬНАЯ ЧИСТАЯ ВЕРСИЯ
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPoForm } from '../Function/AddPo.jsx'

// Мокируем зависимости
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-token-123'
  })
}))

vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: 'localhost:8000'
}))

vi.mock('../shrineofvsakoe/checkMobile.jsx', () => ({
  default: () => false
}))

// ЧИСТЫЙ МОК ДЛЯ react-select без предупреждений
vi.mock('react-select', () => ({
  __esModule: true,
  default: function MockSelect({ 
    isMulti, 
    options = [], 
    onChange, 
    value, 
    placeholder = 'Выберите...',
    'data-testid': testId,
    isDisabled,
    ...props 
  }) {
    // Убираем ВСЕ нераспознанные пропсы React
    const safeProps = { ...props };
    delete safeProps.noOptionsMessage;
    delete safeProps.styles;
    delete safeProps.classNamePrefix;
    delete safeProps.isClearable;
    delete safeProps.isSearchable;
    
    const handleChange = (e) => {
      const selectedValue = e.target.value;
      
      if (selectedValue === "") {
        onChange(isMulti ? [] : null);
        return;
      }
      
      const selectedOption = options.find(opt => opt.value === selectedValue);
      
      if (isMulti) {
        onChange(selectedOption ? [selectedOption] : []);
      } else {
        onChange(selectedOption || null);
      }
    };

    let displayValue = "";
    if (isMulti) {
      if (Array.isArray(value) && value.length > 0) {
        displayValue = value[0]?.value || "";
      }
    } else {
      displayValue = value?.value || "";
    }

    return (
      <select 
        data-testid={testId}
        onChange={handleChange}
        value={displayValue}
        multiple={false}
        disabled={isDisabled}
        style={{ 
          width: '100%', 
          height: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '0 12px'
        }}
        {...safeProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option 
            key={option.value || index} 
            value={option.value}
            data-testid={`${testId}-option`}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
}))

global.fetch = vi.fn()
global.alert = vi.fn()

describe('AddPoForm', () => {
  const mockOnBack = vi.fn()
  const mockOnSubmit = vi.fn()
  
  const mockComponentOptions = [
    { model: 'Model-A', part_type: 1, 'model(part)': 'Model-A (Part 1)' },
    { model: 'Model-B', part_type: 2, 'model(part)': 'Model-B (Part 2)' },
    { model: 'Model-C', part_type: 3, 'model(part)': 'Model-C (Part 3)' }
  ]

  const mockSoftwareOptions = [
    { id: 1, name: 'Software 1.0', inner_name: 'Internal 1', release_date: '2024-01-01' },
    { id: 2, name: 'Software 2.0', inner_name: 'Internal 2', release_date: '2024-02-01' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    global.alert.mockClear()
    
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockComponentOptions
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockSoftwareOptions
      });
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
      
      expect(screen.getByTestId('po-number-input')).toBeInTheDocument()
      expect(screen.getByTestId('po-number-input2')).toBeInTheDocument()
      expect(screen.getByTestId('type-select')).toBeInTheDocument()
      expect(screen.getByTestId('filePo')).toBeInTheDocument()
    })

    it('должен устанавливать сегодняшнюю дату по умолчанию', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />)
      
      await waitFor(() => {
        const dateInput = document.querySelector('input[type="date"]')
        expect(dateInput).toBeInTheDocument()
        expect(dateInput.value).toBeTruthy()
      })
    })

    it('должен вызывать onBack при клике на кнопку назад', async () => {
      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} />)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })

      const buttons = screen.getAllByRole('button')
      const backButton = buttons[0]
      
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
        expect(screen.getByTestId('po-number-input')).toBeInTheDocument()
      })

      await user.type(screen.getByTestId('po-number-input'), 'PO-NO-FILE')
      await user.type(screen.getByTestId('po-number-input2'), 'Internal-NO-FILE')
      await user.selectOptions(screen.getByTestId('type-select'), 'minor')

      const fileInput = screen.getByTestId('filePo')
      expect(fileInput.files).toHaveLength(0)

      const form = document.querySelector('form.add-po-form')
      fireEvent.submit(form)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(alertSpy).toHaveBeenCalledWith('Пожалуйста, выберите файл ПО')
      alertSpy.mockRestore()
    })

    it.skip('должен показывать alert при отсутствии компонента', async () => {})
  })

  describe('Успешная отправка', () => {
    it('должен отправлять форму при skipValidation=true', async () => {
      const user = userEvent.setup()
      
      const mockFetch = vi.fn()
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
      
      const mockSubmitResponse = { success: true, id: 456 }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockSubmitResponse
      })
      
      global.fetch = mockFetch

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('po-number-input')).toBeInTheDocument()
      })

      await user.type(screen.getByTestId('po-number-input'), 'PO-123')
      await user.type(screen.getByTestId('po-number-input2'), 'Internal-123')
      await user.selectOptions(screen.getByTestId('type-select'), 'minor')
      
      const fileInput = screen.getByTestId('filePo')
      const file = new File(['content'], 'software.bin', { type: 'application/octet-stream' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      fireEvent.change(fileInput)

      const form = document.querySelector('form.add-po-form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3)
      })
      
      expect(mockOnSubmit).toHaveBeenCalledWith(mockSubmitResponse)
    })

    it.skip('должен отправлять форму с выбранным компонентом', async () => {})
  })

  describe('Обработка ошибок', () => {
    it('должен обрабатывать ошибку сервера', async () => {
      const user = userEvent.setup()
      
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      const mockFetch = vi.fn()
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
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: async () => ({ detail: 'Invalid file format' })
      })
      
      global.fetch = mockFetch

      render(<AddPoForm onBack={mockOnBack} onSubmit={mockOnSubmit} skipValidation={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('po-number-input')).toBeInTheDocument()
      })

      await user.type(screen.getByTestId('po-number-input'), 'PO-ERROR')
      await user.type(screen.getByTestId('po-number-input2'), 'Internal-ERROR')
      await user.selectOptions(screen.getByTestId('type-select'), 'major')
      
      const fileInput = screen.getByTestId('filePo')
      const file = new File(['error'], 'error.bin', { type: 'application/octet-stream' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      fireEvent.change(fileInput)

      const form = document.querySelector('form.add-po-form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled()
      })
      
      alertSpy.mockRestore()
    })
  })
})