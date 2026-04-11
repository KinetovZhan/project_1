// LoginPage.test.jsx
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Мокаем fetchAPI.js ДО импорта компонента
vi.mock('../fetchAPI.js', () => ({
  api: {
    request: vi.fn(),
  },
  buildApiUrl: (path) => `http://127.0.0.1${path}`,
  API_BASE_URL: 'http://127.0.0.1',
}));

// Мокаем useAuth
const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// Мокаем useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Мокаем Header
vi.mock('../Header/Header.jsx', () => ({
  Header: vi.fn(() => <header data-testid="header-mock">Header Mock</header>)
}));

// Импортируем компонент и api
import LoginPage from '../Login/LoginPage.jsx';
import { api } from '../fetchAPI.js';

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseAuth.mockReturnValue({ login: mockLogin });
    api.request.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('рендерит Header', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    });

    it('рендерит форму входа', () => {
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: /Вход в систему/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Логин/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    });
  });

  describe('Successful Login', () => {
    it('отправляет правильные данные на сервер', async () => {
      api.request.mockResolvedValueOnce({ access_token: 'mock-token-123' });

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/Логин/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'test123' } });
      fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

      await waitFor(() => {
        expect(api.request).toHaveBeenCalledTimes(1);
      });

      expect(api.request).toHaveBeenCalledWith(
        '/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.stringContaining('username=testuser'),
          skipAuth: true,
        })
      );
    });

    it('вызывает loginContext с токеном при успешной авторизации', async () => {
      api.request.mockResolvedValueOnce({ access_token: 'mock-token-123' });

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/Логин/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'test123' } });
      fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('mock-token-123');
      });
    });

    it('перенаправляет на /main после успешного входа', async () => {
      api.request.mockResolvedValueOnce({ access_token: 'mock-token-123' });

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/Логин/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'test123' } });
      fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/main', { replace: true });
      });
    });
  });

  describe('Error Handling', () => {
    it('показывает ошибку сервера при неверных учетных данных', async () => {
      const error = new Error('Request failed with status code 401');
      error.message = 'Unauthorized';
      api.request.mockRejectedValueOnce(error);

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/Логин/i), { target: { value: 'wrong' } });
      fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument();
      });
    });

    it('показывает ошибку при сетевой ошибке', async () => {
      api.request.mockRejectedValueOnce(new Error('Network Error'));

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/Логин/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'test123' } });
      fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/Ошибка сети. Проверьте подключение./i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('корректно обрабатывает URL-кодирование спецсимволов', async () => {
      api.request.mockResolvedValueOnce({ access_token: 'mock-token' });

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/Логин/i), { target: { value: 'user@email.com' } });
      fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'pass&word!123' } });
      fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

      await waitFor(() => {
        expect(api.request).toHaveBeenCalled();
      });

      const call = api.request.mock.calls[0];
      expect(call[1].body).toContain('username=user%40email.com');
      expect(call[1].body).toContain('password=pass%26word%21123');
    });
  });
});