// src/Tests/MainPart.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MainPart } from '../MainPart/MainPart';
import '@testing-library/jest-dom';

// 🔧 МОК react-router-dom (ОБЯЗАТЕЛЬНО перед импортом компонента!)
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  Navigate: ({ to }) => <div data-testid="navigate-mock" data-to={to} />
}));

// Мок для AuthContext
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { name: 'Test User' },
    isAuthenticated: true
  })),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Моковые компоненты
vi.mock('../SearchBar/SearchBar', () => ({
  SearchBar: ({ onSearch, activeButton }) => (
    <div data-testid="search-bar">
      <div data-testid="search-bar-active-button">{activeButton}</div>
      <input 
        data-testid="search-input" 
        placeholder="Search..." 
        onChange={(e) => onSearch && onSearch(e.target.value)} 
      />
    </div>
  )
}));

vi.mock('../Po/Objects', () => ({
  Objects: ({ activeFilters, activeFilters2, selectedModel, searchQuery }) => (
    <div data-testid="objects">
      <div>Filters: {JSON.stringify(activeFilters)}</div>
      <div>Filters2: {JSON.stringify(activeFilters2)}</div>
      <div>Model: {selectedModel}</div>
      <div>Query: {searchQuery}</div>
    </div>
  )
}));

vi.mock('../TractorTable/TractorTable', () => ({
  TractorTable: ({ 
    activeFiltersTrac, 
    activeFiltersTrac2, 
    searchQuery, 
    searchDealer,
    dateFilter,
    activeMajMinButton 
  }) => (
    <div data-testid="tractor-table">
      <div>Filters: {JSON.stringify(activeFiltersTrac)}</div>
      <div>Filters2: {JSON.stringify(activeFiltersTrac2)}</div>
      <div>Query: {searchQuery}</div>
      <div>Dealer: {searchDealer}</div>
      <div>Date: {dateFilter}</div>
      <div>Button: {activeMajMinButton}</div>
    </div>
  )
}));

vi.mock('../AddPo/AddPo', () => ({
  AddPoForm: ({ onBack, onSubmit }) => (
    <div data-testid="add-po-form">
      <h2>Add PO Form</h2>
      <button data-testid="close-po-form" onClick={onBack}>Close PO</button>
      <button data-testid="submit-po-form" onClick={() => onSubmit && onSubmit({ test: 'po' })}>Submit PO</button>
    </div>
  )
}));

vi.mock('../AddUzel/AddAgg', () => ({
  AddAggForm: ({ onBack, onSubmit }) => (
    <div data-testid="add-agg-form">
      <h2>Add Agg Form</h2>
      <button data-testid="close-agg-form" onClick={onBack}>Close Agg</button>
      <button data-testid="submit-agg-form" onClick={() => onSubmit && onSubmit({ test: 'agg' })}>Submit Agg</button>
    </div>
  )
}));

// 🔧 УДАЛЕН мок для AddComponentPart — компонента больше нет

describe('MainPart Component', () => {
  const mockOnSearch = vi.fn();
  const mockOnCloseAddForm = vi.fn();
  const mockOnAddSubmit = vi.fn();
  const mockOnCloseAddAggForm = vi.fn();
  const mockOnAddAggSubmit = vi.fn();
  const mockOnCloseTab = vi.fn();

  // 🔧 УДАЛЕНЫ пропсы для компонентных частей
  const defaultProps = {
    activeButton: null,
    activeFilters: ['filter1'],
    activeFilters2: ['filter2'],
    selectedModel: 'model1',
    selectedProducers: [],
    activeFiltersTrac: ['tracFilter1'],
    activeFiltersTrac2: ['tracFilter2'],
    onSearch: mockOnSearch,
    searchQuery: '',
    searchDealer: '',
    selectedStatus: [],
    actualFilter: [],
    uzelFilter: [],
    actualFilterPo: [],
    showAddForm: false,
    onCloseAddForm: mockOnCloseAddForm,
    onAddSubmit: mockOnAddSubmit,
    dateFilter: '2024-01-01',
    activeMajMinButton: 'all',
    showAddAggForm: false,
    onCloseAddAggForm: mockOnCloseAddAggForm,
    onAddAggSubmit: mockOnAddAggSubmit,
    // 🔧 УДАЛЕНО: showAddCompPartForm, onCloseAddCompPartForm, onAddCompPartSubmit
    handleTractorDetails: vi.fn(),
    handleAggregateDetails: vi.fn(),
    onCloseTab: mockOnCloseTab
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Рендерит пустой div когда activeButton не установлен', () => {
    const { container } = render(<MainPart {...defaultProps} />);
    const mainPart = container.querySelector('.MainPart');
    expect(mainPart).toBeInTheDocument();
    expect(mainPart?.children).toHaveLength(0);
  });

  it('2. Отображает агрегаты с SearchBar и Objects когда activeButton="aggregates"', () => {
    render(<MainPart {...defaultProps} activeButton="aggregates" />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('objects')).toBeInTheDocument();
    expect(screen.queryByTestId('tractor-table')).not.toBeInTheDocument();
  });

  it('3. Отображает тракторы с SearchBar и TractorTable когда activeButton="tractor"', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" searchQuery="test" />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('tractor-table')).toBeInTheDocument();
    expect(screen.getByText('Query: test')).toBeInTheDocument();
    expect(screen.queryByTestId('objects')).not.toBeInTheDocument();
  });

  it('4. Отображает форму ПО когда showAddForm=true', () => {
    render(<MainPart {...defaultProps} showAddForm={true} />);
    expect(screen.getByTestId('add-po-form')).toBeInTheDocument();
    expect(screen.getByText('Add PO Form')).toBeInTheDocument();
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  it('5. Отображает форму агрегата когда showAddAggForm=true', () => {
    render(<MainPart {...defaultProps} showAddAggForm={true} />);
    expect(screen.getByTestId('add-agg-form')).toBeInTheDocument();
    expect(screen.getByText('Add Agg Form')).toBeInTheDocument();
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  // 🔧 УДАЛЕН тест 5.1 про форму компонентных частей

  it('6. Форма ПО имеет приоритет над формой агрегата', () => {
    render(<MainPart {...defaultProps} activeButton="aggregates" showAddForm={true} showAddAggForm={true} />);
    expect(screen.getByTestId('add-po-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-agg-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('objects')).not.toBeInTheDocument();
  });

  it('7. Форма агрегата отображается когда только она активна', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" showAddForm={false} showAddAggForm={true} />);
    expect(screen.getByTestId('add-agg-form')).toBeInTheDocument();
    expect(screen.queryByTestId('tractor-table')).not.toBeInTheDocument();
  });

  // 🔧 УДАЛЕН тест 7.1 про компонентные части

  it('8. Передает правильные пропсы в Objects компонент', () => {
    const customProps = {
      ...defaultProps,
      activeButton: 'aggregates',
      activeFilters: ['test1', 'test2'],
      activeFilters2: ['test3'],
      selectedModel: 'special-model',
      searchQuery: 'search-test'
    };
    render(<MainPart {...customProps} />);
    expect(screen.getByText('Filters: ["test1","test2"]')).toBeInTheDocument();
    expect(screen.getByText('Filters2: ["test3"]')).toBeInTheDocument();
    expect(screen.getByText('Model: special-model')).toBeInTheDocument();
    expect(screen.getByText('Query: search-test')).toBeInTheDocument();
  });

  it('9. Передает правильные пропсы в TractorTable компонент', () => {
    const customProps = {
      ...defaultProps,
      activeButton: 'tractor',
      activeFiltersTrac: ['t1', 't2'],
      activeFiltersTrac2: ['t3'],
      searchQuery: 'tractor-search',
      searchDealer: 'dealer1',
      dateFilter: '2024-12-31',
      activeMajMinButton: 'major'
    };
    render(<MainPart {...customProps} />);
    expect(screen.getByText('Filters: ["t1","t2"]')).toBeInTheDocument();
    expect(screen.getByText('Filters2: ["t3"]')).toBeInTheDocument();
    expect(screen.getByText('Query: tractor-search')).toBeInTheDocument();
    expect(screen.getByText('Dealer: dealer1')).toBeInTheDocument();
    expect(screen.getByText('Date: 2024-12-31')).toBeInTheDocument();
    expect(screen.getByText('Button: major')).toBeInTheDocument();
  });

  it('10. Вызывает onCloseAddForm при нажатии кнопки закрытия формы ПО', () => {
    render(<MainPart {...defaultProps} showAddForm={true} />);
    fireEvent.click(screen.getByTestId('close-po-form'));
    expect(mockOnCloseAddForm).toHaveBeenCalledTimes(1);
  });

  it('11. Вызывает onAddSubmit при отправке формы ПО', () => {
    render(<MainPart {...defaultProps} showAddForm={true} />);
    fireEvent.click(screen.getByTestId('submit-po-form'));
    expect(mockOnAddSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnAddSubmit).toHaveBeenCalledWith({ test: 'po' });
  });

  it('12. Вызывает onCloseAddAggForm при нажатии кнопки закрытия формы агрегата', () => {
    render(<MainPart {...defaultProps} showAddAggForm={true} />);
    fireEvent.click(screen.getByTestId('close-agg-form'));
    expect(mockOnCloseAddAggForm).toHaveBeenCalledTimes(1);
  });

  it('13. Вызывает onAddAggSubmit при отправке формы агрегата', () => {
    render(<MainPart {...defaultProps} showAddAggForm={true} />);
    fireEvent.click(screen.getByTestId('submit-agg-form'));
    expect(mockOnAddAggSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnAddAggSubmit).toHaveBeenCalledWith({ test: 'agg' });
  });

  // 🔧 УДАЛЕНЫ тесты 13.1 и 13.2 про компонентные части

  it('14. SearchBar вызывает onSearch при изменении ввода', () => {
    render(<MainPart {...defaultProps} activeButton="aggregates" />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'new search' } });
    expect(mockOnSearch).toHaveBeenCalledWith('new search');
  });

  it('15. Не отображает SearchBar когда активны формы', () => {
    const { rerender } = render(<MainPart {...defaultProps} showAddForm={true} />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
    rerender(<MainPart {...defaultProps} showAddAggForm={true} />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  describe('useEffect тесты', () => {
    it('16. Закрывает форму ПО при смене activeButton на другую вкладку', async () => {
      const { rerender } = render(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} />);
      expect(mockOnCloseAddForm).not.toHaveBeenCalled();
      rerender(<MainPart {...defaultProps} activeButton="aggregates" showAddForm={true} />);
      await waitFor(() => expect(mockOnCloseAddForm).toHaveBeenCalledTimes(1));
    });

    it('17. Не закрывает форму ПО если активная кнопка остается "addPO"', async () => {
      const { rerender } = render(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} />);
      rerender(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} searchQuery="new" />);
      await waitFor(() => expect(mockOnCloseAddForm).not.toHaveBeenCalled());
    });

    it('18. Закрывает форму агрегата при смене activeButton на другую вкладку', async () => {
      const { rerender } = render(<MainPart {...defaultProps} activeButton="addAgg" showAddAggForm={true} />);
      rerender(<MainPart {...defaultProps} activeButton="tractor" showAddAggForm={true} />);
      await waitFor(() => expect(mockOnCloseAddAggForm).toHaveBeenCalledTimes(1));
    });

    it('19. Не закрывает форму агрегата если активная кнопка остается "addAgg"', async () => {
      const { rerender } = render(<MainPart {...defaultProps} activeButton="addAgg" showAddAggForm={true} />);
      rerender(<MainPart {...defaultProps} activeButton="addAgg" showAddAggForm={true} searchQuery="new" />);
      await waitFor(() => expect(mockOnCloseAddAggForm).not.toHaveBeenCalled());
    });

    // 🔧 УДАЛЕНЫ тесты 19.1 и 19.2 про компонентные части
  });

  it('20. Рендерится без ошибок при минимальных пропсах', () => {
    const minimalProps = {
      onSearch: mockOnSearch,
      onCloseAddForm: mockOnCloseAddForm,
      onAddSubmit: mockOnAddSubmit,
      onCloseAddAggForm: mockOnCloseAddAggForm,
      onAddAggSubmit: mockOnAddAggSubmit,
      onCloseTab: mockOnCloseTab
    };
    expect(() => render(<MainPart {...minimalProps} />)).not.toThrow();
  });

  it('21. Обрабатывает несуществующий activeButton корректно', () => {
    render(<MainPart {...defaultProps} activeButton="nonExistentButton" />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('objects')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tractor-table')).not.toBeInTheDocument();
  });

  it('22. Обрабатывает случай когда обе формы false', () => {
    render(<MainPart {...defaultProps} activeButton="aggregates" showAddForm={false} showAddAggForm={false} />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('objects')).toBeInTheDocument();
  });

  it('23. Корректно обрабатывает изменение activeButton с null на значение', () => {
    const { rerender } = render(<MainPart {...defaultProps} />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
    rerender(<MainPart {...defaultProps} activeButton="aggregates" />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('objects')).toBeInTheDocument();
  });

  it('24. Проверяет корректность передачи searchDealer в TractorTable', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" searchDealer="Test Dealer" />);
    expect(screen.getByText('Dealer: Test Dealer')).toBeInTheDocument();
  });

  it('25. Проверяет правильный порядок приоритета форм: ПО > Агрегат', () => {
    render(<MainPart {...defaultProps} showAddForm={true} showAddAggForm={true} />);
    expect(screen.getByTestId('add-po-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-agg-form')).not.toBeInTheDocument();
  });

  it('26. Передает activeButton в SearchBar', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" />);
    expect(screen.getByTestId('search-bar-active-button')).toHaveTextContent('tractor');
  });

  it('27. Objects компонент обрабатывает пустые фильтры', () => {
    render(<MainPart {...defaultProps} activeButton="aggregates" activeFilters={[]} activeFilters2={[]} selectedModel="" searchQuery="" />);
    expect(screen.getByText('Filters: []')).toBeInTheDocument();
    expect(screen.getByText('Filters2: []')).toBeInTheDocument();
    expect(screen.getByText('Model:')).toBeInTheDocument();
    expect(screen.getByText('Query:')).toBeInTheDocument();
  });

  it('28. TractorTable компонент обрабатывает пустые пропсы', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" activeFiltersTrac={[]} activeFiltersTrac2={[]} searchQuery="" searchDealer="" dateFilter="" activeMajMinButton="" />);
    expect(screen.getByText('Filters: []')).toBeInTheDocument();
    expect(screen.getByText('Filters2: []')).toBeInTheDocument();
    expect(screen.getByText('Query:')).toBeInTheDocument();
    expect(screen.getByText('Dealer:')).toBeInTheDocument();
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('Button:')).toBeInTheDocument();
  });

  it('29. Форма ПО работает без onSubmit обработчика', () => {
    const propsWithoutSubmit = { ...defaultProps, showAddForm: true, onAddSubmit: undefined };
    render(<MainPart {...propsWithoutSubmit} />);
    expect(() => fireEvent.click(screen.getByTestId('submit-po-form'))).not.toThrow();
  });

  it('30. Форма агрегата работает без onSubmit обработчика', () => {
    const propsWithoutSubmit = { ...defaultProps, showAddAggForm: true, onAddAggSubmit: undefined };
    render(<MainPart {...propsWithoutSubmit} />);
    expect(() => fireEvent.click(screen.getByTestId('submit-agg-form'))).not.toThrow();
  });

  // 🔧 УДАЛЕН тест 31 про компонентные части

  it('31. SearchBar работает без onSearch обработчика', () => {
    // 🔧 Нумерация сдвинута на 1
    const propsWithoutOnSearch = { ...defaultProps, activeButton: 'aggregates', onSearch: undefined };
    render(<MainPart {...propsWithoutOnSearch} />);
    expect(() => fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } })).not.toThrow();
  });

  it('32. Компонент корректно обновляется при изменении activeButton', () => {
    const { rerender } = render(<MainPart {...defaultProps} activeButton="aggregates" />);
    expect(screen.getByTestId('objects')).toBeInTheDocument();
    rerender(<MainPart {...defaultProps} activeButton="tractor" />);
    expect(screen.getByTestId('tractor-table')).toBeInTheDocument();
    expect(screen.queryByTestId('objects')).not.toBeInTheDocument();
  });

  it('33. useEffect правильно отслеживает зависимости', () => {
    const { rerender } = render(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} />);
    rerender(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} searchQuery="new query" />);
    expect(mockOnCloseAddForm).not.toHaveBeenCalled();
  });
});