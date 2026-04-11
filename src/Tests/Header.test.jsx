// src/Tests/Header.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { Header } from '../Header/Header';

// Добавляем импорт для jest-dom matchers
import '@testing-library/jest-dom';

describe('Header', () => {
  const mockOnLogout = vi.fn();
  const mockOnHelp = vi.fn();

  // Очищаем моки после каждого теста
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Базовый рендеринг', () => {
    it('рендерит заголовок', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeVisible();
    });

    it('рендерит кнопку "Помощь"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const helpButton = screen.getByText('Помощь');
      expect(helpButton).toBeInTheDocument();
      expect(helpButton).toBeVisible();
      expect(helpButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('рендерит кнопку "Выйти" когда onLogout передан', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const logoutButton = screen.getByText('Выйти');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toBeVisible();
      expect(logoutButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('не рендерит кнопку "Выйти" если onLogout не передан', () => {
      render(<Header onHelp={mockOnHelp} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      expect(screen.getByText('Помощь')).toBeInTheDocument();
    });

    it('рендерит только заголовок и помощь когда onLogout отсутствует', () => {
      render(<Header onHelp={mockOnHelp} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('Помощь')).toBeInTheDocument();
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    });

    it('проверяет структуру header', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
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
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const helpButton = screen.getByText('Помощь');
      fireEvent.click(helpButton);
      
      expect(mockOnHelp).toHaveBeenCalledTimes(1);
      // Убираем проверку toHaveBeenCalledWith(), так как передается событие
    });

    it('вызывает onLogout при клике на "Выйти"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const logoutButton = screen.getByText('Выйти');
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
      // Убираем проверку toHaveBeenCalledWith(), так как передается событие
    });

    it('вызывает onHelp несколько раз при многократных кликах', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const helpButton = screen.getByText('Помощь');
      
      fireEvent.click(helpButton);
      fireEvent.click(helpButton);
      fireEvent.click(helpButton);
      
      expect(mockOnHelp).toHaveBeenCalledTimes(3);
    });

    it('вызывает onLogout несколько раз при многократных кликах', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const logoutButton = screen.getByText('Выйти');
      
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(2);
    });

    it('не вызывает onLogout при клике на "Помощь"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      
      expect(mockOnLogout).not.toHaveBeenCalled();
    });

    it('не вызывает onHelp при клике на "Выйти"', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      fireEvent.click(screen.getByText('Выйти'));
      
      expect(mockOnHelp).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('работает когда onLogout и onHelp - стрелочные функции', () => {
      const arrowOnLogout = vi.fn(() => {});
      const arrowOnHelp = vi.fn(() => {});
      
      render(<Header onLogout={arrowOnLogout} onHelp={arrowOnHelp} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      fireEvent.click(screen.getByText('Выйти'));
      
      expect(arrowOnHelp).toHaveBeenCalledTimes(1);
      expect(arrowOnLogout).toHaveBeenCalledTimes(1);
    });

    it('работает когда onHelp не передан', () => {
      render(<Header onLogout={mockOnLogout} />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      
      const helpButton = screen.getByText('Помощь');
      expect(helpButton).toBeInTheDocument();
      
      expect(() => {
        fireEvent.click(helpButton);
      }).not.toThrow();
      
      expect(screen.getByText('Выйти')).toBeInTheDocument();
    });

    it('работает когда оба обработчика не переданы', () => {
      render(<Header />);
      
      expect(screen.getByText('Сервис просмотра версий ПО')).toBeInTheDocument();
      expect(screen.getByText('Помощь')).toBeInTheDocument();
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      
      expect(() => {
        fireEvent.click(screen.getByText('Помощь'));
      }).not.toThrow();
    });

    it('обрабатывает null для onLogout', () => {
      render(<Header onLogout={null} onHelp={mockOnHelp} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      expect(screen.getByText('Помощь')).toBeInTheDocument();
    });

    it('обрабатывает undefined для onLogout', () => {
      render(<Header onLogout={undefined} onHelp={mockOnHelp} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
      expect(screen.getByText('Помощь')).toBeInTheDocument();
    });
  });

  describe('Стили и CSS классы', () => {
    it('имеет правильные CSS классы', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('header');
      
      const mainText = header.querySelector('.mainText');
      expect(mainText).toHaveClass('mainText');
      
      const navigation = header.querySelector('.navigation');
      expect(navigation).toHaveClass('navigation');
    });

    it('применяет стиль курсора к кнопкам', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      expect(screen.getByText('Помощь')).toHaveStyle('cursor: pointer');
      expect(screen.getByText('Выйти')).toHaveStyle('cursor: pointer');
    });

    it('проверяет структуру DOM', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const header = screen.getByRole('banner');
      
      const children = header.children;
      expect(children).toHaveLength(2);
      
      expect(children[0]).toHaveClass('mainText');
      expect(children[1]).toHaveClass('navigation');
    });
  });

  describe('Доступность (a11y)', () => {
    it('заголовок имеет семантический тег h3', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const headerElement = screen.getByText('Сервис просмотра версий ПО');
      expect(headerElement.tagName).toBe('H3');
    });

    it('кнопка помощи имеет семантический тег h3', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const helpButton = screen.getByText('Помощь');
      expect(helpButton.tagName).toBe('H3');
    });

    it('кнопка выхода имеет семантический тег h3', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      const logoutButton = screen.getByText('Выйти');
      expect(logoutButton.tagName).toBe('H3');
    });

    it('header имеет роль banner', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Snapshots', () => {
    it('соответствует снимку с полными пропсами', () => {
      const { container } = render(
        <Header onLogout={mockOnLogout} onHelp={mockOnHelp} />
      );
      
      expect(container.firstChild).toMatchSnapshot();
    });

    it('соответствует снимку без onLogout', () => {
      const { container } = render(<Header onHelp={mockOnHelp} />);
      
      expect(container.firstChild).toMatchSnapshot();
    });

    it('соответствует снимку без обработчиков', () => {
      const { container } = render(<Header />);
      
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Интеграционные тесты', () => {
    it('корректно работает с реальными функциями', () => {
      let helpClicked = false;
      let logoutClicked = false;
      
      const handleHelp = () => { helpClicked = true; };
      const handleLogout = () => { logoutClicked = true; };
      
      render(<Header onLogout={handleLogout} onHelp={handleHelp} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      expect(helpClicked).toBe(true);
      
      fireEvent.click(screen.getByText('Выйти'));
      expect(logoutClicked).toBe(true);
    });

    it('сохраняет состояние между кликами', () => {
      const onHelpMock = vi.fn();
      const onLogoutMock = vi.fn();
      
      const { rerender } = render(
        <Header onLogout={onLogoutMock} onHelp={onHelpMock} />
      );
      
      fireEvent.click(screen.getByText('Помощь'));
      expect(onHelpMock).toHaveBeenCalledTimes(1);
      
      rerender(<Header onLogout={onLogoutMock} onHelp={onHelpMock} />);
      
      fireEvent.click(screen.getByText('Помощь'));
      expect(onHelpMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Проверка типов пропсов', () => {
    it('принимает onLogout как функцию', () => {
      const onLogout = vi.fn();
      render(<Header onLogout={onLogout} onHelp={mockOnHelp} />);
      
      expect(screen.getByText('Выйти')).toBeInTheDocument();
    });

    it('принимает onLogout как undefined', () => {
      render(<Header onLogout={undefined} onHelp={mockOnHelp} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    });

    it('принимает onLogout как null', () => {
      render(<Header onLogout={null} onHelp={mockOnHelp} />);
      
      expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
    });

    it('принимает onHelp как функцию', () => {
      render(<Header onLogout={mockOnLogout} onHelp={mockOnHelp} />);
      
      expect(screen.getByText('Помощь')).toBeInTheDocument();
    });

    it('принимает onHelp как undefined', () => {
      render(<Header onLogout={mockOnLogout} onHelp={undefined} />);
      
      expect(screen.getByText('Помощь')).toBeInTheDocument();
      
      expect(() => {
        fireEvent.click(screen.getByText('Помощь'));
      }).not.toThrow();
    });
  });
});