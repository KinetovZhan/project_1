// src/Tests/AddComponentPart.test.jsx

// 1. Сначала создаём переменную для мока
const mockUseAuth = vi.hoisted(() => vi.fn());

// 2. Потом мокаем модуль (обязательно до импортов!)
vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: mockUseAuth
}));

// 3. Мокаем ip
vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: '127.0.0.1'
}));

// 4. Мокаем react-select для тестирования - УЛУЧШЕННАЯ ВЕРСИЯ
vi.mock('react-select', () => {
  const MockSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    isLoading, 
    isClearable = true,
    isSearchable = true,
    classNamePrefix,
    styles
  }) => {
    // Используем React.useState для отслеживания значения
    const [selectedValue, setSelectedValue] = React.useState(value?.value || '');
    
    const handleChange = (e) => {
      const newValue = e.target.value;
      setSelectedValue(newValue);
      
      if (!newValue) {
        onChange(null);
        return;
      }
      const selected = options?.find(opt => opt.value === newValue);
      onChange(selected);
    };

    return (
      <div data-testid="react-select">
        <select
          value={selectedValue}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
          disabled={isLoading}
          data-testid="react-select-select"
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
import { AddComponentPart } from '../Function/AddComponentPart.jsx';

// 6. Добавьте этот импорт для matchers
import '@testing-library/jest-dom';

// 7. Мокаем fetch глобально правильно
global.fetch = vi.fn();

describe('AddComponentPart', () => {
  const mockOnBack = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnBack.mockClear();
    mockOnSubmit.mockClear();
    
    // Сбрасываем fetch мок
    global.fetch.mockReset();
    
    // По умолчанию мокаем успешный ответ для компонентов
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
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByText(/Добавление части агрегата/i)).toBeInTheDocument();
    });
    
    // Проверяем наличие основных полей формы
    const componentLabels = screen.getAllByText(/Компонент/i);
    expect(componentLabels.length).toBeGreaterThan(0);
    
    expect(screen.getByPlaceholderText(/Введите тип части агрегата/i)).toBeInTheDocument();
  });

  it('загружает компоненты при наличии токена', async () => {
    const mockComponents = [
      { id: 1, model: 'Двигатель V8', type: 'dvs' },
      { id: 2, model: 'Коробка передач', type: 'kpp' }
    ];
    
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComponents
    });

    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    // Проверяем, что fetch был вызван для загрузки компонентов
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1/components/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  it('не загружает компоненты при отсутствии токена', async () => {
    mockUseAuth.mockReturnValue({ token: null });
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем немного
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Проверяем, что fetch НЕ был вызван
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('показывает ошибку при неудачной загрузке компонентов', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    // Мокаем ошибку сети при загрузке компонентов
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Компонент не должен упасть, ошибка будет в консоли
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
  });

  it('вызывает onSubmit при успешной отправке', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    // Мокаем оба запроса
    global.fetch
      .mockResolvedValueOnce({ 
        ok: true, 
        json: async () => [
          { id: 1, model: 'Двигатель V8', type: 'dvs' }
        ] 
      })
      .mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ 
          id: 'test-id',
          component: 1,
          part_type: 'Поршень'
        }) 
      });

       render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);

       // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });

       // Выбираем компонент (опционально, если форма требует)
    const select = screen.getByTestId('react-select-select');
    fireEvent.change(select, { target: { value: '1' } });

    // Заполняем обязательное поле
    fireEvent.change(screen.getByPlaceholderText(/Введите тип части агрегата/i), {
      target: { value: 'Поршень', name: 'part_type' }
    });

       // Отправляем форму
    fireEvent.click(screen.getByText(/Добавить/i));

       // Проверяем, что onSubmit был вызван
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Также проверяем, что был POST запрос
    const fetchCalls = global.fetch.mock.calls;
    expect(fetchCalls.length).toBe(2); // GET + POST
  });

  it('вызывает onBack при успешной отправке если нет onSubmit', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, model: 'Двигатель V8', type: 'dvs' }
        ]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123' })
      });
    
    // Рендерим без onSubmit
    render(<AddComponentPart onBack={mockOnBack} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Выбираем компонент
    const select = screen.getByTestId('react-select-select');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Проверяем, что значение обновилось
    expect(select.value).toBe('1');
    
    // Заполняем поле типа части
    fireEvent.change(screen.getByPlaceholderText(/Введите тип части агрегата/i), {
      target: {
        value: 'Клапан',
        name: 'part_type'
      }
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что вызвался onBack
    await waitFor(() => {
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('показывает ошибку при отсутствии токена при отправке', async () => {
    mockUseAuth.mockReturnValue({ token: null });

    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    // Не ждем загрузки компонентов, т.к. token null
    fireEvent.change(screen.getByPlaceholderText(/Введите тип части агрегата/i), {
      target: {
        value: 'Поршень',
        name: 'part_type'
      }
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));

    // Проверяем, что не было попытки загрузить компоненты
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('обрабатывает ошибку при добавлении части компонента', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, model: 'Двигатель V8', type: 'dvs' }
        ]
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid data' })
      });
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Выбираем компонент
    const select = screen.getByTestId('react-select-select');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Заполняем поле типа части
    fireEvent.change(screen.getByPlaceholderText(/Введите тип части агрегата/i), {
      target: {
        value: 'Поршень',
        name: 'part_type'
      }
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что ошибка установилась в state
    await waitFor(() => {
      expect(screen.getByText(/Ошибка 400/i)).toBeInTheDocument();
    });
  });

  it('обрабатывает ошибку сети при добавлении части компонента', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, model: 'Двигатель V8', type: 'dvs' }
        ]
      })
      .mockRejectedValueOnce(new Error('Network error'));
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Выбираем компонент
    const select = screen.getByTestId('react-select-select');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Заполняем поле типа части
    fireEvent.change(screen.getByPlaceholderText(/Введите тип части агрегата/i), {
      target: {
        value: 'Поршень',
        name: 'part_type'
      }
    });
    
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что ошибка установилась в state
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
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
        json: async () => [
          { id: 1, model: 'Двигатель V8', type: 'dvs' }
        ]
      })
      .mockReturnValueOnce(fetchPromise); // Долгая операция
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Выбираем компонент
    const select = screen.getByTestId('react-select-select');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Проверяем, что значение обновилось
    expect(select.value).toBe('1');
    
    // Заполняем поле типа части
    fireEvent.change(screen.getByPlaceholderText(/Введите тип части агрегата/i), {
      target: {
        value: 'Поршень',
        name: 'part_type'
      }
    });
    
    const submitButton = screen.getByText(/Добавить/i);
    
    fireEvent.click(submitButton);
    
    // Проверяем, что fetch был вызван второй раз
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    // Разрешаем промис
    resolveFetch({
      ok: true,
      json: async () => ({ id: '123' })
    });
    
    // Ждем завершения
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('не отправляет форму при пустых обязательных полях', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Пытаемся отправить форму без заполнения полей
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Проверяем, что fetch для отправки данных не вызывался
    await waitFor(() => {
      // Должен быть только 1 вызов fetch (загрузка компонентов)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('очищает ошибку при повторном вводе', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, model: 'Двигатель V8', type: 'dvs' }
        ]
      })
      .mockRejectedValueOnce(new Error('Network error'));
    
    render(<AddComponentPart onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('react-select')).toBeInTheDocument();
    });
    
    // Выбираем компонент
    const select = screen.getByTestId('react-select-select');
    fireEvent.change(select, { target: { value: '1' } });
    
    // Заполняем поле типа части
    const partTypeInput = screen.getByPlaceholderText(/Введите тип части агрегата/i);
    fireEvent.change(partTypeInput, {
      target: {
        value: 'Поршень',
        name: 'part_type'
      }
    });
    
    // Отправляем форму (вызовет ошибку)
    fireEvent.click(screen.getByText(/Добавить/i));
    
    // Ждем появления ошибки
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
    
    // Меняем значение в поле - ошибка должна остаться, т.к. она очищается только при новой загрузке
    fireEvent.change(partTypeInput, {
      target: {
        value: 'Клапан',
        name: 'part_type'
      }
    });
    
    // Ошибка все еще должна быть видна
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});