// 1. Сначала импортируем jest-dom matchers
import '@testing-library/jest-dom/vitest';

// 2. Мокаем jwt-decode
const mockJwtDecode = vi.hoisted(() => vi.fn());
vi.mock('jwt-decode', () => ({
  jwtDecode: mockJwtDecode
}));

// 3. Мокаем localStorage
const mockLocalStorage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}));

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// 4. Импорты
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth } from '../auth/AuthContext';

// 5. Тестовый компонент для проверки контекста
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <div data-testid="token">{auth.token || 'null'}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="userRole">{auth.userRole || 'null'}</div>
      <div data-testid="loading">{auth.loading ? 'true' : 'false'}</div>
      <button onClick={() => auth.login('test-token')} data-testid="login-btn">Login</button>
      <button onClick={() => auth.logout()} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6Im1vZGVyYXRvciIsImV4cCI6MTc2NzIyNTUwMH0.3rzX9qO3qUqUqUqUqUqUqUqUqUqUqUqUqUqUqUqUqU';
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6Im1vZGVyYXRvciIsImV4cCI6MTUxNjIzOTAyMn0.KJk3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3';

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockJwtDecode.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Initial state', () => {
    it('должен установить loading=false после монтирования', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Token validation on mount', () => {
    it('должен установить пользователя если токен валидный', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator',
        exp: Math.floor(Date.now() / 1000) + 3600
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        expect(screen.getByTestId('userRole')).toHaveTextContent('moderator');
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(mockJwtDecode).toHaveBeenCalledWith(mockToken);
    });

    it('должен удалить токен если он истек', async () => {
      mockLocalStorage.getItem.mockReturnValue(expiredToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator',
        exp: Math.floor(Date.now() / 1000) - 3600
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
    });

    it('должен установить роль "user" если роль не указана', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        exp: Math.floor(Date.now() / 1000) + 3600
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('userRole')).toHaveTextContent('user');
      });
    });

    it('должен обработать ошибку декодирования токена', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('invalid-token');
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      
      consoleSpy.mockRestore();
    });

    it('должен ничего не делать если токена нет', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
      });

      expect(mockJwtDecode).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Login function', () => {
    it('должен установить токен и данные пользователя при логине', async () => {
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator'
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginBtn.click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
      expect(mockJwtDecode).toHaveBeenCalledWith('test-token');
      
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('token')).toHaveTextContent('test-token');
        expect(screen.getByTestId('userRole')).toHaveTextContent('moderator');
      });
    });

    it('должен установить роль "user" если роль не указана при логине', async () => {
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe'
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginBtn.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('userRole')).toHaveTextContent('user');
      });
    });
  });

  describe('Logout function', () => {
    it('должен очистить все данные при выходе', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator',
        exp: Math.floor(Date.now() / 1000) + 3600
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      
      await act(async () => {
        logoutBtn.click();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('userRole')).toHaveTextContent('null');
      });
    });
  });

  describe('useAuth hook', () => {
    it('должен выбрасывать ошибку при использовании вне AuthProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('должен предоставлять все значения контекста', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator',
        exp: Math.floor(Date.now() / 1000) + 3600
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        expect(screen.getByTestId('userRole')).toHaveTextContent('moderator');
      });
    });
  });

  describe('Edge cases', () => {
    it('должен обработать случай когда decoded.exp отсутствует', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator'
        // нет exp
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
      });

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('должен сохранять пользователя при ререндере', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue({
        sub: '1234567890',
        name: 'John Doe',
        role: 'moderator',
        exp: Math.floor(Date.now() / 1000) + 3600
      });

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    });
  });
});