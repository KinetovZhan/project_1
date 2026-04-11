// MainPart.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MainPart } from '../MainPart/MainPart';
import '@testing-library/jest-dom';

// Мок для AuthContext (если используется в дочерних компонентах)
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

// Мок для AddComponentPart (добавлен)
vi.mock('../AddComponentPart/AddComponentPart', () => ({
  AddComponentPart: ({ onBack, onSubmit }) => (
    <div data-testid="add-component-part-form">
      <h2>Add Component Part Form</h2>
      <button data-testid="close-component-part-form" onClick={onBack}>Close Component Part</button>
      <button data-testid="submit-component-part-form" onClick={() => onSubmit && onSubmit({ test: 'component-part' })}>Submit Component Part</button>
    </div>
  )
}));

describe('MainPart Component', () => {
  const mockOnSearch = vi.fn();
  const mockOnCloseAddForm = vi.fn();
  const mockOnAddSubmit = vi.fn();
  const mockOnCloseAddAggForm = vi.fn();
  const mockOnAddAggSubmit = vi.fn();
  const mockOnCloseAddCompPartForm = vi.fn();
  const mockOnAddCompPartSubmit = vi.fn();
  const mockOnCloseTab = vi.fn();

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
    showAddCompPartForm: false,
    onCloseAddCompPartForm: mockOnCloseAddCompPartForm,
    onAddCompPartSubmit: mockOnAddCompPartSubmit,
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
    expect(mainPart.children).toHaveLength(0);
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

  it('5.1. Отображает форму компонентных частей когда showAddCompPartForm=true', () => {
    render(<MainPart {...defaultProps} showAddCompPartForm={true} />);
    expect(screen.getByTestId('add-component-part-form')).toBeInTheDocument();
    expect(screen.getByText('Add Component Part Form')).toBeInTheDocument();
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  it('6. Форма ПО имеет приоритет над другими компонентами', () => {
    render(<MainPart {...defaultProps} activeButton="aggregates" showAddForm={true} showAddAggForm={true} showAddCompPartForm={true} />);
    expect(screen.getByTestId('add-po-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-agg-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('add-component-part-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('objects')).not.toBeInTheDocument();
  });

  it('7. Форма агрегата имеет приоритет над компонентными частями', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" showAddForm={false} showAddAggForm={true} showAddCompPartForm={true} />);
    expect(screen.getByTestId('add-agg-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-component-part-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tractor-table')).not.toBeInTheDocument();
  });

  it('7.1. Форма компонентных частей отображается когда только она активна', () => {
    render(<MainPart {...defaultProps} activeButton="tractor" showAddForm={false} showAddAggForm={false} showAddCompPartForm={true} />);
    expect(screen.getByTestId('add-component-part-form')).toBeInTheDocument();
    expect(screen.queryByTestId('tractor-table')).not.toBeInTheDocument();
  });

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

  it('13.1. Вызывает onCloseAddCompPartForm при нажатии кнопки закрытия формы компонентных частей', () => {
    render(<MainPart {...defaultProps} showAddCompPartForm={true} />);
    fireEvent.click(screen.getByTestId('close-component-part-form'));
    expect(mockOnCloseAddCompPartForm).toHaveBeenCalledTimes(1);
  });

  it('13.2. Вызывает onAddCompPartSubmit при отправке формы компонентных частей', () => {
    render(<MainPart {...defaultProps} showAddCompPartForm={true} />);
    fireEvent.click(screen.getByTestId('submit-component-part-form'));
    expect(mockOnAddCompPartSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnAddCompPartSubmit).toHaveBeenCalledWith({ test: 'component-part' });
  });

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
    rerender(<MainPart {...defaultProps} showAddCompPartForm={true} />);
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

    it('19.1. Закрывает форму компонентных частей при смене activeButton на другую вкладку', async () => {
      const { rerender } = render(<MainPart {...defaultProps} activeButton="AddCompPart" showAddCompPartForm={true} />);
      rerender(<MainPart {...defaultProps} activeButton="aggregates" showAddCompPartForm={true} />);
      await waitFor(() => expect(mockOnCloseAddCompPartForm).toHaveBeenCalledTimes(1));
    });

    it('19.2. Не закрывает форму компонентных частей если активная кнопка остается "AddCompPart"', async () => {
      const { rerender } = render(<MainPart {...defaultProps} activeButton="AddCompPart" showAddCompPartForm={true} />);
      rerender(<MainPart {...defaultProps} activeButton="AddCompPart" showAddCompPartForm={true} searchQuery="new" />);
      await waitFor(() => expect(mockOnCloseAddCompPartForm).not.toHaveBeenCalled());
    });
  });

  it('20. Рендерится без ошибок при минимальных пропсах', () => {
    const minimalProps = {
      onSearch: mockOnSearch,
      onCloseAddForm: mockOnCloseAddForm,
      onAddSubmit: mockOnAddSubmit,
      onCloseAddAggForm: mockOnCloseAddAggForm,
      onAddAggSubmit: mockOnAddAggSubmit,
      onCloseAddCompPartForm: mockOnCloseAddCompPartForm,
      onAddCompPartSubmit: mockOnAddCompPartSubmit,
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
    render(<MainPart {...defaultProps} activeButton="aggregates" showAddForm={false} showAddAggForm={false} showAddCompPartForm={false} />);
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

  it('25. Проверяет правильный порядок приоритета форм: ПО > Агрегат > Компонентные части', () => {
    render(<MainPart {...defaultProps} showAddForm={true} showAddAggForm={true} showAddCompPartForm={true} />);
    expect(screen.getByTestId('add-po-form')).toBeInTheDocument();
    expect(screen.queryByTestId('add-agg-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('add-component-part-form')).not.toBeInTheDocument();
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

  it('31. Форма компонентных частей работает без onSubmit обработчика', () => {
    const propsWithoutSubmit = { ...defaultProps, showAddCompPartForm: true, onAddCompPartSubmit: undefined };
    render(<MainPart {...propsWithoutSubmit} />);
    expect(() => fireEvent.click(screen.getByTestId('submit-component-part-form'))).not.toThrow();
  });

  it('32. SearchBar работает без onSearch обработчика', () => {
    const propsWithoutOnSearch = { ...defaultProps, activeButton: 'aggregates', onSearch: undefined };
    render(<MainPart {...propsWithoutOnSearch} />);
    expect(() => fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } })).not.toThrow();
  });

  it('33. Компонент корректно обновляется при изменении activeButton', () => {
    const { rerender } = render(<MainPart {...defaultProps} activeButton="aggregates" />);
    expect(screen.getByTestId('objects')).toBeInTheDocument();
    rerender(<MainPart {...defaultProps} activeButton="tractor" />);
    expect(screen.getByTestId('tractor-table')).toBeInTheDocument();
    expect(screen.queryByTestId('objects')).not.toBeInTheDocument();
  });

  it('34. useEffect правильно отслеживает зависимости', () => {
    const { rerender } = render(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} />);
    rerender(<MainPart {...defaultProps} activeButton="addPO" showAddForm={true} searchQuery="new query" />);
    expect(mockOnCloseAddForm).not.toHaveBeenCalled();
  });
});