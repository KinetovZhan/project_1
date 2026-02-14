// 1. Сначала импортируем jest-dom matchers
import '@testing-library/jest-dom/vitest';

// 2. Мокаем react-router-dom
vi.mock('react-router-dom', () => ({
  Routes: vi.fn(({ children }) => <div data-testid="routes-mock">{children}</div>),
  Route: vi.fn(({ path, element }) => (
    <div data-testid="route-mock" data-path={path}>
      {element}
    </div>
  )),
  Navigate: vi.fn(({ to, replace }) => (
    <div data-testid="navigate-mock" data-to={to} data-replace={replace}>
      Navigate to {to}
    </div>
  ))
}));

// 3. Мокаем дочерние компоненты
vi.mock('../Login/LoginPage', () => ({
  default: () => <div data-testid="login-page-mock">LoginPage Mock</div>
}));

vi.mock('../Login/HelpPage.jsx', () => ({
  HelpPage: () => <div data-testid="help-page-mock">HelpPage Mock</div>
}));

vi.mock('../components/mainpage', () => ({
  default: () => <div data-testid="main-page-mock">MainPage Mock</div>
}));

// 4. Мокаем AuthContext и ProtectedRoute
vi.mock('../auth/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider-mock">{children}</div>
}));

vi.mock('../auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }) => (
    <div data-testid="protected-route-mock">{children}</div>
  )
}));

// 5. Импорты
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering structure', () => {
    it('должен рендерить AuthProvider', () => {
      render(<App />);
      
      expect(screen.getByTestId('auth-provider-mock')).toBeInTheDocument();
    });

    it('должен рендерить Routes внутри AuthProvider', () => {
      render(<App />);
      
      const authProvider = screen.getByTestId('auth-provider-mock');
      expect(authProvider).toContainElement(screen.getByTestId('routes-mock'));
    });
  });

  describe('Route configuration', () => {
    it('должен иметь маршрут для /login с LoginPage', () => {
      render(<App />);
      
      // Просто проверяем что LoginPage отрендерился
      expect(screen.getByTestId('login-page-mock')).toBeInTheDocument();
    });

    it('должен иметь защищенный маршрут для /main/* с MainPage', () => {
      render(<App />);
      
      const protectedRoutes = screen.getAllByTestId('protected-route-mock');
      expect(protectedRoutes).toHaveLength(2);
      
      const mainRoute = protectedRoutes.find(route => 
        route.querySelector('[data-testid="main-page-mock"]')
      );
      
      expect(mainRoute).toBeInTheDocument();
      expect(mainRoute).toContainElement(screen.getByTestId('main-page-mock'));
    });

    it('должен иметь защищенный маршрут для /help/* с HelpPage', () => {
      render(<App />);
      
      const protectedRoutes = screen.getAllByTestId('protected-route-mock');
      expect(protectedRoutes).toHaveLength(2);
      
      const helpRoute = protectedRoutes.find(route => 
        route.querySelector('[data-testid="help-page-mock"]')
      );
      
      expect(helpRoute).toBeInTheDocument();
      expect(helpRoute).toContainElement(screen.getByTestId('help-page-mock'));
    });

    it('должен перенаправлять с корневого пути на /login', () => {
      render(<App />);
      
      const navigates = screen.getAllByTestId('navigate-mock');
      expect(navigates).toHaveLength(2);
      
      const rootNavigate = navigates[0];
      expect(rootNavigate).toHaveAttribute('data-to', '/login');
      expect(rootNavigate).toHaveAttribute('data-replace', 'true');
    });

    it('должен перенаправлять с неизвестных путей на /login', () => {
      render(<App />);
      
      const navigates = screen.getAllByTestId('navigate-mock');
      expect(navigates).toHaveLength(2);
      
      const catchAllNavigate = navigates[1];
      expect(catchAllNavigate).toHaveAttribute('data-to', '/login');
      expect(catchAllNavigate).toHaveAttribute('data-replace', 'true');
    });
  });

  describe('Protected routes', () => {
    it('должен оборачивать MainPage в ProtectedRoute', () => {
      render(<App />);
      
      const protectedRoutes = screen.getAllByTestId('protected-route-mock');
      const mainPage = screen.getByTestId('main-page-mock');
      
      const mainRoute = protectedRoutes.find(route => route.contains(mainPage));
      expect(mainRoute).toBeInTheDocument();
      expect(mainRoute).toContainElement(mainPage);
    });

    it('должен оборачивать HelpPage в ProtectedRoute', () => {
      render(<App />);
      
      const protectedRoutes = screen.getAllByTestId('protected-route-mock');
      const helpPage = screen.getByTestId('help-page-mock');
      
      const helpRoute = protectedRoutes.find(route => route.contains(helpPage));
      expect(helpRoute).toBeInTheDocument();
      expect(helpRoute).toContainElement(helpPage);
    });
  });

  describe('CSS imports', () => {
    it('должен импортировать все CSS файлы (проверяем что нет ошибок)', () => {
      expect(() => render(<App />)).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('должен правильно структурировать все компоненты', () => {
      render(<App />);
      
      const authProvider = screen.getByTestId('auth-provider-mock');
      const routes = screen.getByTestId('routes-mock');
      const protectedRoutes = screen.getAllByTestId('protected-route-mock');
      const mainPage = screen.getByTestId('main-page-mock');
      const helpPage = screen.getByTestId('help-page-mock');
      const loginPage = screen.getByTestId('login-page-mock');
      
      expect(authProvider).toContainElement(routes);
      expect(routes).toContainElement(loginPage);
      
      protectedRoutes.forEach(route => {
        expect(routes).toContainElement(route);
      });
      
      const mainRoute = protectedRoutes.find(route => route.contains(mainPage));
      const helpRoute = protectedRoutes.find(route => route.contains(helpPage));
      
      expect(mainRoute).toBeInTheDocument();
      expect(helpRoute).toBeInTheDocument();
    });

    it('должен рендериться без ошибок при ререндере', () => {
      const { rerender } = render(<App />);
      expect(() => rerender(<App />)).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('должен корректно обрабатывать вложенные маршруты', () => {
      render(<App />);
      
      // Проверяем что все маршруты отрендерились
      expect(screen.getByTestId('login-page-mock')).toBeInTheDocument();
      expect(screen.getByTestId('main-page-mock')).toBeInTheDocument();
      expect(screen.getByTestId('help-page-mock')).toBeInTheDocument();
      expect(screen.getAllByTestId('navigate-mock')).toHaveLength(2);
    });
  });
});