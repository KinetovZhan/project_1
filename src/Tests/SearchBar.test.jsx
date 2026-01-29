import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SearchBar } from '../Function/SearchBar';

describe('SearchBar', () => {
  it('рендерит поле ввода и кнопку', () => {
    const mockOnSearch = vi.fn();
    
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('вызывает onSearch при вводе текста', () => {
    const mockOnSearch = vi.fn();
    
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(input, { target: { value: 'трактор' } });

    expect(mockOnSearch).toHaveBeenCalledWith('трактор');
    expect(input.value).toBe('трактор');
  });

  it('вызывает onSearch с текущим значением при клике на кнопку', () => {
    const mockOnSearch = vi.fn();
    
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/поиск/i);
    const button = screen.getByRole('button');

    // Вводим текст
    fireEvent.change(input, { target: { value: 'T-150' } });

    // Кликаем по кнопке
    fireEvent.click(button);

    // onSearch должен быть вызван ещё раз с тем же значением
    expect(mockOnSearch).toHaveBeenCalledTimes(2); // 1 раз при вводе + 1 при клике
    expect(mockOnSearch).toHaveBeenLastCalledWith('T-150');
  });

  it('работает без ошибок, если onSearch не передан', () => {
    // Не должно выбросить ошибку
    expect(() => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText(/поиск/i);
      fireEvent.change(input, { target: { value: 'test' } });
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
    }).not.toThrow();
  });
});