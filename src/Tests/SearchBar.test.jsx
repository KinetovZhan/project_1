import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { SearchBar } from '../SearchBar/SearchBar';

// Добавляем matchers из jest-dom
import '@testing-library/jest-dom/vitest';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит поле ввода и кнопку', () => {
    render(<SearchBar />);

    expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('вызывает onSearch при вводе текста', () => {
    const mockOnSearch = vi.fn();
    
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/поиск/i);
    
    // Очищаем вызов от useEffect при монтировании
    mockOnSearch.mockClear();
    
    fireEvent.change(input, { target: { value: 'трактор' } });

    expect(mockOnSearch).toHaveBeenCalledWith('трактор');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('трактор');
  });

  it('вызывает onSearch с текущим значением при клике на кнопку', () => {
    const mockOnSearch = vi.fn();
    
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/поиск/i);
    const button = screen.getByRole('button');

    // Очищаем вызов от useEffect при монтировании
    mockOnSearch.mockClear();

    fireEvent.change(input, { target: { value: 'T-150' } });
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    
    fireEvent.click(button);
    expect(mockOnSearch).toHaveBeenCalledTimes(2);
    expect(mockOnSearch).toHaveBeenLastCalledWith('T-150');
  });

  it('работает без ошибок, если onSearch не передан', () => {
    expect(() => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText(/поиск/i);
      fireEvent.change(input, { target: { value: 'test' } });
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
    }).not.toThrow();
  });

  describe('activeButton', () => {
    it('сбрасывает значение query при изменении activeButton', () => {
      const mockOnSearch = vi.fn();
      const { rerender } = render(
        <SearchBar onSearch={mockOnSearch} activeButton="button1" />
      );

      const input = screen.getByPlaceholderText(/поиск/i);
      fireEvent.change(input, { target: { value: 'трактор' } });
      expect(input.value).toBe('трактор');

      rerender(<SearchBar onSearch={mockOnSearch} activeButton="button2" />);

      expect(input.value).toBe('');
    });

    it('вызывает onSearch со старым значением query при изменении activeButton', () => {
      const mockOnSearch = vi.fn();
      const { rerender } = render(
        <SearchBar onSearch={mockOnSearch} activeButton="button1" />
      );

      // Очищаем вызов от useEffect при монтировании
      mockOnSearch.mockClear();

      const input = screen.getByPlaceholderText(/поиск/i);
      
      // Вводим текст
      fireEvent.change(input, { target: { value: 'трактор' } });
      
      // Меняем activeButton - useEffect вызовет onSearch со СТАРЫМ значением query
      rerender(<SearchBar onSearch={mockOnSearch} activeButton="button2" />);

      // Проверяем, что было два вызова:
      // 1. вызов с 'трактор' (при вводе)
      // 2. вызов с 'трактор' (при изменении activeButton, берет старое значение)
      expect(mockOnSearch).toHaveBeenCalledTimes(2);
      
      // Оба вызова должны быть с 'трактор'
      expect(mockOnSearch.mock.calls[0][0]).toBe('трактор');
      expect(mockOnSearch.mock.calls[1][0]).toBe('трактор');
    });

    it('сбрасывает query после вызова onSearch при изменении activeButton', async () => {
      const mockOnSearch = vi.fn();
      const { rerender } = render(
        <SearchBar onSearch={mockOnSearch} activeButton="button1" />
      );

      // Очищаем вызов от useEffect при монтировании
      mockOnSearch.mockClear();

      const input = screen.getByPlaceholderText(/поиск/i);
      
      // Вводим текст
      fireEvent.change(input, { target: { value: 'трактор' } });
      
      // Меняем activeButton
      rerender(<SearchBar onSearch={mockOnSearch} activeButton="button2" />);

      // Проверяем, что onSearch вызвался со старым значением
      expect(mockOnSearch).toHaveBeenCalledWith('трактор');
      
      // Проверяем, что query сбросился
      expect(input.value).toBe('');
    });

    it('не вызывает onSearch при изменении activeButton, если onSearch не передан', () => {
      const { rerender } = render(
        <SearchBar activeButton="button1" />
      );

      expect(() => {
        rerender(<SearchBar activeButton="button2" />);
      }).not.toThrow();
    });

    it('вызывает onSearch с пустой строкой при первом рендере с activeButton', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} activeButton="button1" />);
      
      expect(mockOnSearch).toHaveBeenCalledWith('');
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('placeholder и фокус', () => {
    it('показывает placeholder когда нет фокуса и query пустой', () => {
      render(<SearchBar />);
      
      expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    });

    it('не показывает placeholder при фокусе', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText(/поиск/i);
      fireEvent.focus(input);
      
      expect(screen.queryByPlaceholderText(/поиск/i)).not.toBeInTheDocument();
    });

    it('возвращает placeholder при потере фокуса, если поле пустое', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText(/поиск/i);
      
      fireEvent.focus(input);
      expect(screen.queryByPlaceholderText(/поиск/i)).not.toBeInTheDocument();
      
      fireEvent.blur(input);
      expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    });

    it('не возвращает placeholder при потере фокуса, если в поле есть текст', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText(/поиск/i);
      
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'текст' } });
      fireEvent.blur(input);
      
      expect(screen.queryByPlaceholderText(/поиск/i)).not.toBeInTheDocument();
    });

    it('показывает placeholder после очистки поля и потери фокуса', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText(/поиск/i);
      
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'текст' } });
      fireEvent.blur(input);
      expect(screen.queryByPlaceholderText(/поиск/i)).not.toBeInTheDocument();
      
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      
      expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    });
  });

  describe('SVG иконка', () => {
    it('рендерит SVG иконку внутри кнопки', () => {
      render(<SearchBar />);
      
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      
      expect(svg?.querySelector('circle')).toHaveAttribute('cx', '11');
      expect(svg?.querySelector('circle')).toHaveAttribute('cy', '11');
      expect(svg?.querySelector('circle')).toHaveAttribute('r', '8');
      expect(svg?.querySelector('line')).toHaveAttribute('x1', '21');
      expect(svg?.querySelector('line')).toHaveAttribute('y1', '21');
      expect(svg?.querySelector('line')).toHaveAttribute('x2', '16.65');
      expect(svg?.querySelector('line')).toHaveAttribute('y2', '16.65');
    });
  });

  describe('onSearch вызовы', () => {
    it('вызывает onSearch с пустой строкой при первом рендере', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} />);
      
      expect(mockOnSearch).toHaveBeenCalledWith('');
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('вызывает onSearch при каждом вводе текста', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} />);
      
      // Очищаем вызов от useEffect при монтировании
      mockOnSearch.mockClear();
      
      const input = screen.getByPlaceholderText(/поиск/i);
      
      fireEvent.change(input, { target: { value: 'a' } });
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('a');
      
      fireEvent.change(input, { target: { value: 'ab' } });
      expect(mockOnSearch).toHaveBeenCalledTimes(2);
      expect(mockOnSearch).toHaveBeenCalledWith('ab');
    });
  });
});