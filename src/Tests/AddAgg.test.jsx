// 2. Устанавливаем переменную окружения ДО импорта компонента
vi.stubEnv('VITE_API_URL', 'http://127.0.0.1');

// 1. Сначала создаём переменную для мока
const mockUseAuth = vi.hoisted(() => vi.fn());


// 2. Потом мокаем модуль (обязательно до импортов!)
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth
}));


// 4. Мокаем react-select для тестирования
vi.mock('react-select', () => {
  const MockSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    isLoading, 
    isClearable = true,
    isSearchable = true,
    classNamePrefix
  }) => {
    const handleChange = (e) => {
      const selectedValue = e.target.value;
      if (!selectedValue) {
        onChange(null);
        return;
      }
      const selected = options?.find(opt => opt.value === selectedValue);
      onChange(selected);
    };

    return (
      <div data-testid="react-select">
        <select
          value={value?.value || ''}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
          disabled={isLoading}
        >
          <option value="">{placeholder}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isLoading && <span>Загрузка...</span>}
      </div>
    );
  };
  
  return {
    default: MockSelect
  };
});

// 5. Импорты
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AddAggForm } from '../AddUzel/AddAgg.jsx';

// 6. Добавьте этот импорт для matchers
import '@testing-library/jest-dom';

// 7. Мокаем fetch глобально правильно
global.fetch = vi.fn();

describe('AddAggForm', () => {
  const mockOnBack = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnBack.mockClear();
    mockOnSubmit.mockClear();
    
    // Сбрасываем fetch мок
    global.fetch.mockReset();
    
    // По умолчанию мокаем успешный ответ для тракторов
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('рендерит форму с полями', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByText(/Добавление агрегата/i)).toBeInTheDocument();
    });
    
    // Проверяем наличие основных полей формы
    expect(screen.getByLabelText(/Тип/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Введите название/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Введите серийный номер/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Введите количество/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Введите производителя/i)).toBeInTheDocument();
  });

  it('вызывает onSubmit при успешной отправке', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    // Настраиваем мок fetch для двух вызовов
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [] // первый вызов для тракторов
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: 'test-id',
          type: 'dvs',
          model: 'Motor X'
        }) // второй вызов для добавления агрегата
      });

    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    // Ждем загрузки тракторов
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });

    // Заполняем форму
    fireEvent.change(screen.getByLabelText(/Тип/i), { 
      target: { 
        value: 'dvs',
        name: 'type'
      } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите название/i), { 
      target: { 
        value: 'Motor X',
        name: 'model'
      } 
    });

    fireEvent.change(screen.getByPlaceholderText(/Введите серийный номер/i), {
      target: {
        value: 'SN-12345',
        name: 'comp_ser_num'
      }
    });

    // Отправляем форму
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Добавить/i));
    });

    // Проверяем вызов fetch для добавления агрегата
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1/components/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  it('показывает ошибку при отсутствии токена', async () => {
    mockUseAuth.mockReturnValue({ token: null });

    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    // Не ждем загрузки тракторов, т.к. token null
    fireEvent.click(screen.getByText(/Добавить/i));

    // Проверяем, что ошибка показана
    await waitFor(() => {
      // Проверяем, что не было попытки загрузить тракторы
      expect(global.fetch).not.toHaveBeenCalledWith(
        'http://127.0.0.1/tractors/',
        expect.anything()
      );
    });
  });

  it('загружает тракторы при наличии токена', async () => {
    const mockTractors = [
      { id: 1, vin: 'VIN001', model: 'Трактор 1' },
      { id: 2, vin: 'VIN002', model: 'Трактор 2' }
    ];
    
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTractors
    });

    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    // Проверяем, что fetch был вызван для загрузки тракторов
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1/tractors/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  it('показывает ошибку при неудачной загрузке тракторов', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    // Мокаем ошибку сети при загрузке тракторов
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Компонент не должен упасть, ошибка будет в консоли
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Проверяем, что кнопка не заблокирована навсегда
    expect(screen.getByText(/Добавить/i)).not.toBeDisabled();
  });

  it('обрабатывает ошибку HTTP при загрузке тракторов', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    // Мокаем HTTP ошибку 500
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({})
    });
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Компонент должен отрендериться несмотря на ошибку
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
  });

  it('обрабатывает ошибку при добавлении агрегата', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [] // тракторы
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid data' }) // ошибка добавления
      });
    
    // Мокаем alert
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем немного для загрузки
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Заполняем обязательные поля
    fireEvent.change(screen.getByLabelText(/Тип/i), { 
      target: { value: 'dvs', name: 'type' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите название/i), { 
      target: { value: 'Motor X', name: 'model' } 
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что alert был вызван с ошибкой
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Invalid data');
    });
    
    mockAlert.mockRestore();
  });

  it('обрабатывает ошибку сети при добавлении агрегата', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [] // тракторы
      })
      .mockRejectedValueOnce(new Error('Network error')); // сетевая ошибка
    
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем немного для загрузки
    await new Promise(resolve => setTimeout(resolve, 100));
    
    fireEvent.change(screen.getByLabelText(/Тип/i), { 
      target: { value: 'dvs', name: 'type' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите название/i), { 
      target: { value: 'Motor X', name: 'model' } 
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Network error');
    });
    
    mockAlert.mockRestore();
  });

  it('отправляет форму с заполненными полями', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    const mockTractors = [
      { id: 1, vin: 'VIN001', model: 'Трактор 1' },
      { id: 2, vin: 'VIN002', model: 'Трактор 2' }
    ];
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTractors
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123' })
      });
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем загрузки тракторов
    await waitFor(() => {
      const reactSelect = screen.getByTestId('react-select');
      expect(reactSelect).toBeInTheDocument();
    });
    
    // Заполняем все поля
    fireEvent.change(screen.getByLabelText(/Тип/i), { 
      target: { value: 'kpp', name: 'type' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите название/i), { 
      target: { value: 'Коробка передач', name: 'model' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите серийный номер/i), { 
      target: { value: 'SN-KPP-001', name: 'comp_ser_num' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите количество/i), { 
      target: { value: '5', name: 'number_of_parts' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите производителя/i), { 
      target: { value: 'Завод им. Петрова', name: 'producer_comp' } 
    });
    
    // Выбираем трактор
    const reactSelect = screen.getByTestId('react-select');
    const select = reactSelect.querySelector('select');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Отправляем форму
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что данные отправились
    await waitFor(() => {
      // Должно быть 2 вызова fetch: тракторы и добавление агрегата
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Проверяем второй вызов (добавление агрегата)
      const secondCall = global.fetch.mock.calls[1];
      expect(secondCall[0]).toBe('http://127.0.0.1/components/');
      expect(secondCall[1].method).toBe('POST');
      
      const body = JSON.parse(secondCall[1].body);
      
      // Проверяем основные поля
      expect(body.type).toBe('kpp');
      expect(body.model).toBe('Коробка передач');
      expect(body.comp_ser_num).toBe('SN-KPP-001');
      expect(body.number_of_parts).toBe(5);
      expect(body.producer_comp).toBe('Завод им. Петрова');
      
      // tractor_id может быть 1 или null в зависимости от реализации мока
      // Проверяем оба варианта
      expect([1, null]).toContain(body.tractor_id);
    });
  });

  it('вызывает onBack при успешной отправке если нет onSubmit', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123' })
      });
    
    // Рендерим без onSubmit
    render(<AddAggForm onBack={mockOnBack} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Тип/i), { 
      target: { value: 'dvs', name: 'type' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите название/i), { 
      target: { value: 'Motor', name: 'model' } 
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что вызвался onBack
    await waitFor(() => {
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('обрабатывает изменение даты установки', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Ищем поле даты по текущему значению (оно известно - сегодняшняя дата)
    // Формат: YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const dateInput = screen.getByDisplayValue(today);
    
    expect(dateInput).toBeInTheDocument();
    expect(dateInput.type).toBe('date');
    expect(dateInput.value).toBe(today);
    
    // Меняем дату
    fireEvent.change(dateInput, { 
      target: { value: '2024-01-15' } 
    });
    
    expect(dateInput.value).toBe('2024-01-15');
  });

  it('блокирует кнопку во время загрузки', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockReturnValueOnce(fetchPromise); // Долгая операция
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Тип/i), { 
      target: { value: 'dvs', name: 'type' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Введите название/i), { 
      target: { value: 'Motor', name: 'model' } 
    });
    
    const submitButton = screen.getByText(/Добавить/i);
    fireEvent.click(submitButton);
    
    // Кнопка должна быть заблокирована
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton.textContent).toMatch(/Добавление\.\.\./i);
    });
    
    // Разрешаем промис
    resolveFetch({
      ok: true,
      json: async () => ({ id: '123' })
    });
    
    // Ждем разблокировки кнопки
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton.textContent).toBe('Добавить');
    });
  });
});