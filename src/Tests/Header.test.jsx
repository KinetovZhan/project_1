import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Header } from '../Function/Header';

describe('Header', () => {
  const mockOnLogout = vi.fn();
  const mockOnHelp = vi.fn();

  it('рендерит заголовок', () => {
    render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
    
    expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
  });

  it('рендерит кнопку "Помощь"', () => {
    render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
    
    expect(screen.getByText('Помощь')).toBeInTheDocument();
    expect(screen.getByText('Помощь')).toHaveStyle({ cursor: 'pointer' });
  });

  it('рендерит кнопку "Выйти"', () => {
    render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
    
    expect(screen.getByText('Выйти')).toBeInTheDocument();
    expect(screen.getByText('Выйти')).toHaveStyle({ cursor: 'pointer' });
  });

  it('вызывает onHelp при клике на "Помощь"', () => {
    render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
    
    fireEvent.click(screen.getByText('Помощь'));
    expect(mockOnHelp).toHaveBeenCalledTimes(1);
  });

  it('вызывает onLogout при клике на "Выйти"', () => {
    render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
    
    fireEvent.click(screen.getByText('Выйти'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('не рендерит кнопку "Выйти" если onLogout не передан', () => {
    render(<Header onHelp={mockOnHelp} />);
    
    expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    expect(screen.getByText('Помощь')).toBeInTheDocument();
  });
});