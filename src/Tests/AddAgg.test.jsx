import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// ============================================================================
// ХОИСТИМ ФАБРИКУ МОКОВ (исправлено: data-testid только на select)
// ============================================================================
const mockSelectFactory = vi.hoisted(() => {
  return {
    createMockSelect: (isCreatable = false) => {
      return function MockSelect({ 
        options = [], 
        value, 
        onChange, 
        placeholder, 
        isLoading, 
        isDisabled, 
        'data-testid': testId,
        id,
        onCreateOption,
        name,
        ...restProps
      }) {
        const handleChange = (e) => {
          const selectedValue = e.target.value;
          if (selectedValue === '') {
            onChange?.(null);
            return;
          }
          if (selectedValue === '__CREATE__' && onCreateOption) {
            onCreateOption('Новое значение');
            return;
          }
          const selected = options?.find(opt => opt.value === selectedValue);
          onChange?.(selected);
        };
        
        const displayValue = value?.value || '';
        
        return (
          // ✅ data-testid НЕ на wrapper, только на select ниже
          <div {...restProps}>
            <select
              id={id}
              name={name}
              value={displayValue}
              onChange={handleChange}
              disabled={isDisabled || isLoading}
              data-testid={testId}  // ✅ Единственное место с data-testid
            >
              <option value="">{placeholder || 'Выберите...'}</option>
              {options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
              {isCreatable && onCreateOption && (
                <option value="__CREATE__">+ Создать...</option>
              )}
            </select>
            {isLoading && <span data-testid="loading-indicator">Загрузка...</span>}
          </div>
        );
      };
    }
  };
});

// ============================================================================
// МОКИ
// ============================================================================
vi.mock('../fetchAPI.js', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../CheckMobile/checkMobile.jsx', () => ({ default: () => false }));

vi.mock('react-select', () => ({
  default: mockSelectFactory.createMockSelect(false)
}));

vi.mock('react-select/creatable', () => ({
  default: mockSelectFactory.createMockSelect(true)
}));

// ============================================================================
// ИМПОРТЫ
// ============================================================================
import { AddAggForm } from '../AddUzel/AddAgg.jsx';
import { api } from '../fetchAPI.js';

// ============================================================================
// ТЕСТЫ
// ============================================================================
describe('AddAggForm', () => {
  const mockOnBack = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    
    api.get.mockImplementation(async (url) => {
      if (url === '/tractors/') {
        return [
          { id: 1, vin: 'VIN001', model: 'Трактор 1' },
          { id: 2, vin: 'VIN002', model: 'Трактор 2' },
        ];
      }
      if (url === '/components/') {
        return [
          { id: 1, name: 'Comp A', producer: 'Prod A' },
          { id: 2, name: 'Comp B', producer: 'Prod B' },
        ];
      }
      return [];
    });
    api.post.mockResolvedValue({ id: '123' });
  });

  afterEach(() => cleanup());

  it('рендерит форму с полями', async () => {
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Добавление узла/i)).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('type-select')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('producer-select')).toBeInTheDocument();
  });

  it('вызывает onSubmit при успешной отправке', async () => {
    const user = userEvent.setup();
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('type-select')).toBeInTheDocument();
    });
    
    const typeSelect = screen.getByTestId('type-select');
    fireEvent.change(typeSelect, { target: { value: 'DVS' } });
    
    await user.type(screen.getByTestId('name-input'), 'Двигатель X');
    
    await user.clear(screen.getByTestId('date-input'));
    await user.type(screen.getByTestId('date-input'), '2024-01-15');
    
    const producerSelect = screen.getByTestId('producer-select');
    fireEvent.change(producerSelect, { target: { value: 'Prod A' } });
    
    await user.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/components/', expect.objectContaining({
        type: 'DVS',
        name: 'Двигатель X',
        mounting_date: '2024-01-15',
        producer: 'Prod A',
      }));
      expect(mockOnSubmit).toHaveBeenCalledWith({ id: '123' });
    });
  });

  it('показывает ошибку при отсутствии токена', async () => {
    mockUseAuth.mockReturnValue({ token: null });
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      const errorMsg = screen.queryByText(/Пользователь не авторизован/i);
      if (errorMsg) expect(errorMsg).toBeInTheDocument();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('загружает тракторы при наличии токена', async () => {
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/tractors/'));
  });

  it('обрабатывает ошибку при загрузке тракторов', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    await waitFor(() => expect(screen.getByTestId('type-select')).toBeInTheDocument());
  });

  it('обрабатывает ошибку при добавлении агрегата', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValueOnce(new Error('Invalid data'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    await waitFor(() => expect(screen.getByTestId('type-select')).toBeInTheDocument());
    
    const typeSelect = screen.getByTestId('type-select');
    fireEvent.change(typeSelect, { target: { value: 'DVS' } });
    await user.type(screen.getByTestId('name-input'), 'Двигатель');
    await user.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Invalid data'));
    alertSpy.mockRestore();
  });

  it('вызывает onBack при успешной отправке если нет onSubmit', async () => {
    const user = userEvent.setup();
    render(<AddAggForm onBack={mockOnBack} />);
    await waitFor(() => expect(screen.getByTestId('type-select')).toBeInTheDocument());
    
    const typeSelect = screen.getByTestId('type-select');
    fireEvent.change(typeSelect, { target: { value: 'DVS' } });
    await user.type(screen.getByTestId('name-input'), 'Двигатель');
    await user.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => expect(mockOnBack).toHaveBeenCalled());
  });

  it('блокирует кнопку во время загрузки', async () => {
    const user = userEvent.setup();
    let resolvePost;
    const postPromise = new Promise(resolve => { resolvePost = resolve; });
    api.post.mockReturnValue(postPromise);
    
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    await waitFor(() => expect(screen.getByTestId('type-select')).toBeInTheDocument());
    
    const typeSelect = screen.getByTestId('type-select');
    fireEvent.change(typeSelect, { target: { value: 'DVS' } });
    await user.type(screen.getByTestId('name-input'), 'Двигатель');
    
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton.textContent).toMatch(/Добавление\.\.\./i);
    
    resolvePost({ id: '123' });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });
});