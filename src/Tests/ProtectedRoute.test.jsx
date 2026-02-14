// 1. Сначала импортируем jest-dom matchers
import '@testing-library/jest-dom/vitest';

// 2. Мокаем react-router-dom
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to, replace }) => (
    <div data-testid="navigate-mock" data-to={to} data-replace={replace}>
      Navigate to {to}
    </div>
  ))
}));

// 3. Мокаем AuthContext
const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth
}));

// 4. Импорты
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { ProtectedRoute } from '../auth/ProtectedRoute';

// 5. Тестовый компонент для проверки
const TestChild = () => <div data-testid="test-child">Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Loading state', () => {
    it('должен возвращать null когда loading=true', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true
      });

      const { container } = render(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });

    it('должен возвращать null когда loading=true даже если isAuthenticated=true', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: true
      });

      const { container } = render(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated state', () => {
    it('должен рендерить children когда isAuthenticated=true и loading=false', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      render(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });

    it('должен рендерить любой переданный children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      const AnotherChild = () => <div data-testid="another-child">Another Content</div>;

      render(
        <ProtectedRoute>
          <AnotherChild />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('another-child')).toBeInTheDocument();
      expect(screen.getByText('Another Content')).toBeInTheDocument();
    });

    it('должен рендерить несколько children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      render(
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated state', () => {
    it('должен перенаправлять на /login когда isAuthenticated=false и loading=false', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false
      });

      render(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      );

      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
      expect(navigate).toHaveAttribute('data-replace', 'true');
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    });

    it('должен перенаправлять на /login с replace=true', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false
      });

      render(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      );

      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toHaveAttribute('data-replace', 'true');
    });
  });

  describe('Edge cases', () => {
    it('должен обрабатывать undefined children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      render(
        <ProtectedRoute>
          {undefined}
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });

    it('должен обрабатывать null children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      render(
        <ProtectedRoute>
          {null}
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });

    it('должен обрабатывать массив children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      const childrenArray = [
        <div key="1" data-testid="array-child-1">Array Child 1</div>,
        <div key="2" data-testid="array-child-2">Array Child 2</div>
      ];

      render(
        <ProtectedRoute>
          {childrenArray}
        </ProtectedRoute>
      );

      expect(screen.getByTestId('array-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('array-child-2')).toBeInTheDocument();
    });
  });

  describe('Integration with AuthContext', () => {
    it('должен вызывать useAuth для получения состояния', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      render(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      );

      expect(mockUseAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props validation', () => {
    it('должен работать без children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      const { container } = render(<ProtectedRoute />);

      expect(container.firstChild).toBeNull();
    });

    it('должен работать с пустым children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });

      render(
        <ProtectedRoute>
          {null}
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });
  });
});