import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Sidebar } from '../Function/Sidebar';
import { Filters } from '../Function/Filters_agregates.jsx';
import { Filters2 } from '../Function/Filters_tractors.jsx';

// Мокаем компоненты Filters и Filters2
vi.mock('../Function/Filters_agregates.jsx', () => ({
  Filters: vi.fn(({ onFilterChange, onFilterChange2, onModelChange }) => (
    <div data-testid="filters-aggregates">
      <button onClick={() => onFilterChange?.('filter1')}>Filter 1</button>
      <button onClick={() => onFilterChange2?.('filter2')}>Filter 2</button>
      <button onClick={() => onModelChange?.('model1')}>Model Change</button>
    </div>
  ))
}));

vi.mock('../Function/Filters_tractors.jsx', () => ({
  Filters2: vi.fn(({ 
    onFilterChangeTracByModel, 
    onFilterChangeByStatus, 
    handleMajMinButtonClick, 
    activeMajMinButton, 
    onDealerChange,
    onDateChange 
  }) => (
    <div data-testid="filters-tractors">
      <button onClick={() => onFilterChangeTracByModel?.('tractor-model')}>Filter by Model</button>
      <button onClick={() => onFilterChangeByStatus?.('status')}>Filter by Status</button>
      <button onClick={() => handleMajMinButtonClick?.('maj')}>Maj Button</button>
      <div data-testid="active-majmin">{activeMajMinButton}</div>
      <input 
        data-testid="dealer-input" 
        onChange={(e) => onDealerChange?.(e.target.value)} 
        placeholder="Dealer"
      />
      <input 
        data-testid="date-input" 
        onChange={(e) => onDateChange?.(e.target.value)} 
        placeholder="Date"
      />
    </div>
  ))
}));

describe('Sidebar Component', () => {
  const mockProps = {
    activeButton: null,
    handleButtonClick: vi.fn(),
    handleMajMinButtonClick: vi.fn(),
    activeMajMinButton: 'maj',
    onFilterChange: vi.fn(),
    onFilterChange2: vi.fn(),
    onModelChange: vi.fn(),
    onModelChangeTrac: vi.fn(),
    onFilterChangeTracByModel: vi.fn(),
    onFilterChangeByStatus: vi.fn(),
    onDealerChange: vi.fn(),
    onAddPoClick: vi.fn(),
    onAddAggClick: vi.fn(),
    selectedModel: 'test-model',
    onDateChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the sidebar with tractor and aggregates buttons', () => {
      render(<Sidebar {...mockProps} />);
      
      expect(screen.getByText('Трактор')).toBeInTheDocument();
      expect(screen.getByText('Агрегаты')).toBeInTheDocument();
    });

    it('should add active class to tractor button when activeButton is tractor', () => {
      render(<Sidebar {...mockProps} activeButton="tractor" />);
      
      const tractorButton = screen.getByText('Трактор');
      expect(tractorButton).toHaveClass('active');
      expect(screen.getByText('Агрегаты')).not.toHaveClass('active');
    });

    it('should add active class to aggregates button when activeButton is aggregates', () => {
      render(<Sidebar {...mockProps} activeButton="aggregates" />);
      
      const aggregatesButton = screen.getByText('Агрегаты');
      expect(aggregatesButton).toHaveClass('active');
      expect(screen.getByText('Трактор')).not.toHaveClass('active');
    });

    it('should render "Добавить ПО" button when no active button is selected', () => {
      render(<Sidebar {...mockProps} activeButton={null} />);
      
      expect(screen.getByText('Добавить ПО')).toBeInTheDocument();
      expect(screen.getByText('Добавить агрегат')).toBeInTheDocument();
    });

    it('should NOT render "Добавить ПО" button when tractor is active', () => {
      render(<Sidebar {...mockProps} activeButton="tractor" />);
      
      expect(screen.queryByText('Добавить ПО')).not.toBeInTheDocument();
      expect(screen.queryByText('Добавить агрегат')).not.toBeInTheDocument();
    });

    it('should NOT render "Добавить ПО" button when aggregates is active', () => {
      render(<Sidebar {...mockProps} activeButton="aggregates" />);
      
      expect(screen.queryByText('Добавить ПО')).not.toBeInTheDocument();
      expect(screen.queryByText('Добавить агрегат')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call handleButtonClick with "tractor" when tractor button is clicked', () => {
      render(<Sidebar {...mockProps} />);
      
      fireEvent.click(screen.getByText('Трактор'));
      expect(mockProps.handleButtonClick).toHaveBeenCalledWith('tractor');
    });

    it('should call handleButtonClick with "aggregates" when aggregates button is clicked', () => {
      render(<Sidebar {...mockProps} />);
      
      fireEvent.click(screen.getByText('Агрегаты'));
      expect(mockProps.handleButtonClick).toHaveBeenCalledWith('aggregates');
    });

    it('should call onAddPoClick when "Добавить ПО" button is clicked', () => {
      render(<Sidebar {...mockProps} activeButton={null} />);
      
      fireEvent.click(screen.getByText('Добавить ПО'));
      expect(mockProps.onAddPoClick).toHaveBeenCalled();
    });

    it('should call onAddAggClick when "Добавить агрегат" button is clicked', () => {
      render(<Sidebar {...mockProps} activeButton={null} />);
      
      fireEvent.click(screen.getByText('Добавить агрегат'));
      expect(mockProps.onAddAggClick).toHaveBeenCalled();
    });
  });

  describe('Conditional Rendering of Filters', () => {
    it('should render Filters component when activeButton is aggregates', () => {
      render(<Sidebar {...mockProps} activeButton="aggregates" />);
      
      expect(screen.getByTestId('filters-aggregates')).toBeInTheDocument();
      expect(screen.queryByTestId('filters-tractors')).not.toBeInTheDocument();
    });

    it('should render Filters2 component when activeButton is tractor', () => {
      render(<Sidebar {...mockProps} activeButton="tractor" />);
      
      expect(screen.getByTestId('filters-tractors')).toBeInTheDocument();
      expect(screen.queryByTestId('filters-aggregates')).not.toBeInTheDocument();
    });

    it('should pass correct props to Filters component', () => {
      render(<Sidebar {...mockProps} activeButton="aggregates" />);
      
      const filtersComponent = screen.getByTestId('filters-aggregates');
      expect(filtersComponent).toBeInTheDocument();
      
      // Test that Filters component receives callbacks
      fireEvent.click(screen.getByText('Filter 1'));
      expect(mockProps.onFilterChange).toHaveBeenCalledWith('filter1');
      
      fireEvent.click(screen.getByText('Filter 2'));
      expect(mockProps.onFilterChange2).toHaveBeenCalledWith('filter2');
      
      fireEvent.click(screen.getByText('Model Change'));
      expect(mockProps.onModelChange).toHaveBeenCalledWith('model1');
    });

    it('should pass correct props to Filters2 component', () => {
      render(<Sidebar {...mockProps} activeButton="tractor" />);
      
      expect(screen.getByTestId('filters-tractors')).toBeInTheDocument();
      
      // Test activeMajMinButton display
      expect(screen.getByTestId('active-majmin')).toHaveTextContent('maj');
      
      // Test callbacks
      fireEvent.click(screen.getByText('Filter by Model'));
      expect(mockProps.onFilterChangeTracByModel).toHaveBeenCalledWith('tractor-model');
      
      fireEvent.click(screen.getByText('Filter by Status'));
      expect(mockProps.onFilterChangeByStatus).toHaveBeenCalledWith('status');
      
      fireEvent.click(screen.getByText('Maj Button'));
      expect(mockProps.handleMajMinButtonClick).toHaveBeenCalledWith('maj');
      
      // Test input callbacks
      const dealerInput = screen.getByTestId('dealer-input');
      fireEvent.change(dealerInput, { target: { value: 'test dealer' } });
      expect(mockProps.onDealerChange).toHaveBeenCalledWith('test dealer');
      
      const dateInput = screen.getByTestId('date-input');
      fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
      expect(mockProps.onDateChange).toHaveBeenCalledWith('2024-01-01');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callback functions gracefully', () => {
      const propsWithoutCallbacks = {
        activeButton: 'tractor',
        handleButtonClick: vi.fn(),
      };
      
      // This should not throw errors even though many callbacks are undefined
      expect(() => {
        render(<Sidebar {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });

    it('should render correctly when activeButton is neither tractor nor aggregates', () => {
      render(<Sidebar {...mockProps} activeButton="other" />);
      
      // Should show only the basic buttons
      expect(screen.getByText('Трактор')).toBeInTheDocument();
      expect(screen.getByText('Агрегаты')).toBeInTheDocument();
      expect(screen.queryByTestId('filters-aggregates')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filters-tractors')).not.toBeInTheDocument();
    });

    it('should render "Добавить ПО" and "Добавить агрегат" when activeButton is undefined', () => {
      render(<Sidebar {...mockProps} activeButton={undefined} />);
      
      expect(screen.getByText('Добавить ПО')).toBeInTheDocument();
      expect(screen.getByText('Добавить агрегат')).toBeInTheDocument();
    });
  });
});