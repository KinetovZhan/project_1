// src/Tests/Header.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// 🔧 МОК react-router-dom (ОБЯЗАТЕЛЬНО перед импортом компонента!)
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  Navigate: ({ to }) => <div data-testid="navigate-mock" data-to={to} />
}));

// 🔧 МОК useCheckMobile
vi.mock('../CheckMobile/checkMobile.jsx', () => ({
  default: vi.fn(() => false)
}));

// 🔧 МОК useAuth
vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: vi.fn(() => ({
    token: 'mock-token',
    user: { role: 'user' }
  }))
}));

// 🔧 МОК api (для useEffect в Header)
vi.mock('../fetchAPI.js', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ unread_count: 0, unread_replies_count: 0 }))
  }
}));

// 🔧 Теперь импортируем компонент ПОСЛЕ всех моков
import { Header } from '../Header/Header';

describe('Header', () => {
  const mockOnLogout = vi.fn();
  const mockOnHelp = vi.fn();
  const mockOnKnowledgeBase = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Базовый рендеринг', () => {
    it('рендерит заголовок', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeVisible();
    });

    it('рендерит кнопку "Помощь"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const helpButton = screen.getByText('Помощь');
      expect(helpButton).toBeInTheDocument();
      expect(helpButton).toBeVisible();
      expect(helpButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('рендерит кнопку "Выйти" когда onLogout передан', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const logoutButton = screen.getByText('Выйти');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toBeVisible();
      expect(logoutButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('не рендерит кнопку "Выйти" если onLogout не передан', () => {
      render(<Header onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      // 🔧 "Помощь" тоже не рендерится без onLogout (условие в компоненте)
      expect(screen.queryByText('Помощь')).not.toBeInTheDocument();
      expect(screen.getByText('База знаний')).toBeInTheDocument();
    });

    it('рендерит только заголовок и базу знаний когда onLogout отсутствует', () => {
      render(<Header onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('База знаний')).toBeInTheDocument();
      expect(screen.queryByText('Помощь')).not.toBeInTheDocument();
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    });

    it('проверяет структуру header', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('header');
      
      const mainText = header?.querySelector('.mainText');
      expect(mainText).toBeInTheDocument();
      
      const navigation = header?.querySelector('.navigation');
      expect(navigation).toBeInTheDocument();
    });
  });

  describe('Обработчики событий', () => {
    it('вызывает onHelp при клике на "Помощь"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const helpButton = screen.getByText('Помощь');
      fireEvent.click(helpButton);
      
      expect(mockOnHelp).toHaveBeenCalledTimes(1);
    });

    it('вызывает onLogout при клике на "Выйти"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const logoutButton = screen.getByText('Выйти');
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('вызывает onHelp несколько раз при многократных кликах', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const helpButton = screen.getByText('Помощь');
      
      fireEvent.click(helpButton);
      fireEvent.click(helpButton);
      fireEvent.click(helpButton);
      
      expect(mockOnHelp).toHaveBeenCalledTimes(3);
    });

    it('вызывает onLogout несколько раз при многократных кликах', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const logoutButton = screen.getByText('Выйти');
      
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(2);
    });

    it('не вызывает onLogout при клике на "Помощь"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      
      expect(mockOnLogout).not.toHaveBeenCalled();
    });

    it('не вызывает onHelp при клике на "Выйти"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      fireEvent.click(screen.getByText('Выйти'));
      
      expect(mockOnHelp).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('работает когда onLogout и onHelp - стрелочные функции', () => {
      const arrowOnLogout = vi.fn(() => {});
      const arrowOnHelp = vi.fn(() => {});
      
      render(<Header onLogout={arrowOnLogout} onHelp={arrowOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      fireEvent.click(screen.getByText('Выйти'));
      
      expect(arrowOnHelp).toHaveBeenCalledTimes(1);
      expect(arrowOnLogout).toHaveBeenCalledTimes(1);
    });

    it('работает когда onHelp не передан', () => {
      render(<Header onLogout={mockOnLogout} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('База знаний')).toBeInTheDocument();
      expect(screen.getByText('Выйти')).toBeInTheDocument();
      
      // "Помощь" не рендерится без onHelp, но это не ошибка
      expect(() => {
        fireEvent.click(screen.getByText('База знаний'));
      }).not.toThrow();
    });

    it('работает когда оба обработчика не переданы', () => {
      render(<Header onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('База знаний')).toBeInTheDocument();
      expect(screen.queryByText('Помощь')).not.toBeInTheDocument();
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      
      // Не кликаем на несуществующие элементы
      expect(() => {
        fireEvent.click(screen.getByText('База знаний'));
      }).not.toThrow();
    });

    it('обрабатывает null для onLogout', () => {
      render(<Header onLogout={null} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      expect(screen.queryByText('Помощь')).not.toBeInTheDocument(); // null = не передан
      expect(screen.getByText('База знаний')).toBeInTheDocument();
    });

    it('обрабатывает undefined для onLogout', () => {
      render(<Header onLogout={undefined} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      expect(screen.queryByText('Помощь')).not.toBeInTheDocument(); // undefined = не передан
      expect(screen.getByText('База знаний')).toBeInTheDocument();
    });
  });

  describe('Стили и CSS классы', () => {
    it('имеет правильные CSS классы', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('header');
      
      const mainText = header.querySelector('.mainText');
      expect(mainText).toHaveClass('mainText');
      
      const navigation = header.querySelector('.navigation');
      expect(navigation).toHaveClass('navigation');
    });

    it('применяет стиль курсора к кнопкам', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('База знаний')).toHaveStyle('cursor: pointer');
      expect(screen.getByText('Помощь')).toHaveStyle('cursor: pointer');
      expect(screen.getByText('Выйти')).toHaveStyle('cursor: pointer');
    });

    it('проверяет структуру DOM', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const header = screen.getByRole('banner');
      
      expect(header.querySelector('.mainText')).toBeInTheDocument();
      expect(header.querySelector('.navigation')).toBeInTheDocument();
      expect(header.querySelector('.icon-ptz')).toBeInTheDocument();
    });
  });

  describe('Доступность (a11y)', () => {
    it('заголовок имеет семантический тег h3', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const headerElement = screen.getByText('Сервис просмотра версий ПО');
      expect(headerElement.tagName).toBe('H3');
    });

    it('кнопка помощи имеет семантический тег h3', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const helpButton = screen.getByText('Помощь');
      expect(helpButton.tagName).toBe('H3');
    });

    it('кнопка выхода имеет семантический тег h3', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      const logoutButton = screen.getByText('Выйти');
      expect(logoutButton.tagName).toBe('H3');
    });

    it('header имеет роль banner', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Snapshots', () => {
    it('соответствует снимку с полными пропсами', () => {
      const { container } = render(
        <Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />
      );
      
      expect(container.firstChild).toMatchSnapshot();
    });

    it('соответствует снимку без onLogout', () => {
      const { container } = render(<Header onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(container.firstChild).toMatchSnapshot();
    });

    it('соответствует снимку без обработчиков', () => {
      const { container } = render(<Header onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Интеграционные тесты', () => {
    it('корректно работает с реальными функциями', () => {
      let helpClicked = false;
      let logoutClicked = false;
      
      const handleHelp = () => { helpClicked = true; };
      const handleLogout = () => { logoutClicked = true; };
      
      render(<Header onLogout={handleLogout} onHelp={handleHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      expect(helpClicked).toBe(true);
      
      fireEvent.click(screen.getByText('Выйти'));
      expect(logoutClicked).toBe(true);
    });

    it('сохраняет состояние между кликами', () => {
      const onHelpMock = vi.fn();
      const onLogoutMock = vi.fn();
      
      const { rerender } = render(
        <Header onLogout={onLogoutMock} onHelp={onHelpMock} onKnowledgeBase={mockOnKnowledgeBase} />
      );
      
      fireEvent.click(screen.getByText('Помощь'));
      expect(onHelpMock).toHaveBeenCalledTimes(1);
      
      rerender(<Header onLogout={onLogoutMock} onHelp={onHelpMock} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      expect(onHelpMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Проверка типов пропсов', () => {
    it('принимает onLogout как функцию', () => {
      const onLogout = vi.fn();
      render(<Header onLogout={onLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('Выйти')).toBeInTheDocument();
    });

    it('принимает onLogout как undefined', () => {
      render(<Header onLogout={undefined} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    });

    it('принимает onLogout как null', () => {
      render(<Header onLogout={null} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    });

    it('принимает onHelp как функцию', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      expect(screen.getByText('Помощь')).toBeInTheDocument();
    });

    it('принимает onHelp как undefined', () => {
      render(<Header onLogout={mockOnLogout} onHelp={undefined} onKnowledgeBase={mockOnKnowledgeBase} />);
      
      // "Помощь" рендерится если onLogout передан, независимо от onHelp
      expect(screen.getByText('Помощь')).toBeInTheDocument();
      
      expect(() => {
        fireEvent.click(screen.getByText('Помощь'));
      }).not.toThrow();
    });
  });
});