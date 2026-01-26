// src/Function/AddAgg.test.jsx

// 1. Сначала создаём переменную для мока
const mockUseAuth = vi.fn();

// 2. Потом мокаем модуль (обязательно до импортов!)
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth
}));

// 3. Мокаем ip
vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: '127.0.0.1'
}));

// 4. Импорты
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AddAggForm } from './AddAgg';

// 5. Мокаем fetch глобально
global.fetch = vi.fn();

describe('AddAggForm', () => {
  const mockOnBack = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockOnBack.mockClear();
    mockOnSubmit.mockClear();
  });

  it('рендерит форму с полями', () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByPlaceholderText(/уникальный ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Добавление агрегата/i)).toBeInTheDocument();
  });

  it('вызывает onSubmit при успешной отправке', async () => {
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'test-id' })
    });

    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/уникальный ID/i), { target: { value: 'AGG-001' } });
    fireEvent.change(screen.getByLabelText(/Тип/), { target: { value: 'dvs' } });
    fireEvent.change(screen.getByPlaceholderText(/название/i), { target: { value: 'Motor X' } });

    fireEvent.click(screen.getByText(/Добавить/));

    await new Promise(setImmediate);

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1/component/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
    expect(mockOnSubmit).toHaveBeenCalledWith({ id: 'test-id' });
  });

  it('показывает ошибку при отсутствии токена', () => {
    // 6. Используем mockUseAuth, а не useAuth!
    mockUseAuth.mockReturnValue({ token: null });

    render(<AddAggForm onBack={mockOnBack} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/уникальный ID/i), { target: { value: 'AGG-001' } });
    fireEvent.change(screen.getByLabelText(/Тип/), { target: { value: 'dvs' } });
    fireEvent.change(screen.getByPlaceholderText(/название/i), { target: { value: 'Motor X' } });

    fireEvent.click(screen.getByText(/Добавить/));

    expect(screen.getByText(/Пользователь не авторизован/i)).toBeInTheDocument();
  });
});