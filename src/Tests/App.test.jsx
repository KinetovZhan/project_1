// src/Tests/App.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import App from '../App';

// Мокаем дочерние компоненты, чтобы изолировать тестирование маршрутов
vi.mock('../Login/LoginPage', () => ({
  default: () => <div data-testid="login-page">LoginPage Mock</div>
}));

vi.mock('../Login/HelpPage.jsx', () => ({
  HelpPage: () => <div data-testid="help-page">HelpPage Mock</div>
}));

vi.mock('../MainPage/mainpage', () => ({
  default: () => <div data-testid="main-page">MainPage Mock</div>
}));

vi.mock('../KnowledgeBase/KnowledgeBase.jsx', () => ({
  KnowledgeBase: () => <div data-testid="knowledge-base">KnowledgeBase Mock</div>
}));

vi.mock('../PoDetails/PoDetails.jsx', () => ({
  PoDetails: () => <div data-testid="po-details">PoDetails Mock</div>
}));

vi.mock('../TractorDetails/TractorDetails.jsx', () => ({
  TractorDetails: () => <div data-testid="tractor-details">TractorDetails Mock</div>
}));

// Мокаем AuthContext и ProtectedRoute, чтобы не зависеть от реальной логики авторизации
vi.mock('../auth/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

vi.mock('../auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }) => <div data-testid="protected-route">{children}</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route rendering', () => {
    it('должен рендерить LoginPage на пути /login', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('должен рендерить KnowledgeBase на пути /knowledge-base', () => {
      render(
        <MemoryRouter initialEntries={['/knowledge-base']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('knowledge-base')).toBeInTheDocument();
    });

    it('должен рендерить MainPage (через ProtectedRoute) на пути /main', () => {
      render(
        <MemoryRouter initialEntries={['/main']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-page')).toBeInTheDocument();
    });

    it('должен рендерить MainPage на пути /main/something', () => {
      render(
        <MemoryRouter initialEntries={['/main/123']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-page')).toBeInTheDocument();
    });

    it('должен рендерить HelpPage на пути /help', () => {
      render(
        <MemoryRouter initialEntries={['/help']}>
          <App />
        </MemoryRouter>
      );
      // HelpPage не обёрнут в ProtectedRoute, поэтому проверяем напрямую
      expect(screen.getByTestId('help-page')).toBeInTheDocument();
    });

    it('должен рендерить PoDetails на пути /software/:id', () => {
      render(
        <MemoryRouter initialEntries={['/software/123']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('po-details')).toBeInTheDocument();
    });

    it('должен рендерить TractorDetails на пути /tractors/details', () => {
      render(
        <MemoryRouter initialEntries={['/tractors/details']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('tractor-details')).toBeInTheDocument();
    });

    it('должен перенаправлять с корневого пути / на /login', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );
      // Проверяем, что отображается LoginPage (перенаправление)
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('должен перенаправлять с неизвестного пути на /login', () => {
      render(
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('AuthProvider', () => {
    it('должен оборачивать все маршруты в AuthProvider', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-provider')).toContainElement(screen.getByTestId('login-page'));
    });
  });

  describe('CSS imports', () => {
    it('должен импортировать все CSS файлы без ошибок', () => {
      expect(() => render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      )).not.toThrow();
    });
  });
});