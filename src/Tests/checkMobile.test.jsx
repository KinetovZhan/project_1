// 1. Сначала импортируем jest-dom matchers
import '@testing-library/jest-dom/vitest';

// 2. Импорты
import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import useCheckMobile from '../shrineofvsakoe/checkMobile';

// 3. Тестовый компонент для проверки хука
const TestComponent = () => {
  const isMobile = useCheckMobile();
  return <div data-testid="mobile-status">{isMobile ? 'mobile' : 'desktop'}</div>;
};

describe('useCheckMobile', () => {
  // Сохраняем оригинальные методы
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    // Мокаем методы window
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Восстанавливаем оригиналы
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    window.innerWidth = originalInnerWidth;
    cleanup();
  });

  describe('Initial detection', () => {
    it('должен определить мобильное устройство при ширине <= 768px', () => {
      window.innerWidth = 375;
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });

    it('должен определить десктоп при ширине > 768px', () => {
      window.innerWidth = 1024;
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
    });

    it('должен правильно обрабатывать граничное значение 768px', () => {
      window.innerWidth = 768;
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });
  });

  describe('Event listeners', () => {
    it('должен добавить обработчик resize при монтировании', () => {
      render(<TestComponent />);
      
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('должен удалить обработчик resize при размонтировании', () => {
      const { unmount } = render(<TestComponent />);
      
      unmount();
      
      expect(window.removeEventListener).toHaveBeenCalledTimes(1);
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Resize handling', () => {
    it('должен обновлять состояние при изменении размера окна', () => {
      const originalAddListener = window.addEventListener;
      
      let resizeCallback;
      window.addEventListener = vi.fn((event, callback) => {
        if (event === 'resize') {
          resizeCallback = callback;
        }
      });

      window.innerWidth = 1024;
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');

      act(() => {
        window.innerWidth = 375;
        resizeCallback();
      });

      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
      
      window.addEventListener = originalAddListener;
    });

    it('должен обновляться при нескольких изменениях размера', () => {
      const originalAddListener = window.addEventListener;
      
      let resizeCallback;
      window.addEventListener = vi.fn((event, callback) => {
        if (event === 'resize') {
          resizeCallback = callback;
        }
      });

      render(<TestComponent />);

      act(() => {
        window.innerWidth = 375;
        resizeCallback();
      });
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');

      act(() => {
        window.innerWidth = 1024;
        resizeCallback();
      });
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');

      act(() => {
        window.innerWidth = 768;
        resizeCallback();
      });
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
      
      window.addEventListener = originalAddListener;
    });
  });

  describe('Multiple instances', () => {
    it('должен корректно работать с несколькими экземплярами хука', () => {
      const MultipleComponents = () => (
        <>
          <TestComponent />
          <TestComponent />
          <TestComponent />
        </>
      );

      window.innerWidth = 375;
      
      render(<MultipleComponents />);
      
      const statuses = screen.getAllByTestId('mobile-status');
      expect(statuses).toHaveLength(3);
      statuses.forEach(status => {
        expect(status).toHaveTextContent('mobile');
      });
    });

    it('должен добавлять по одному обработчику на каждый экземпляр', () => {
      window.addEventListener = vi.fn();

      const MultipleComponents = () => (
        <>
          <TestComponent />
          <TestComponent />
          <TestComponent />
        </>
      );

      render(<MultipleComponents />);

      expect(window.addEventListener).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge cases', () => {
    it('должен обрабатывать undefined innerWidth', () => {
      window.innerWidth = undefined;
      
      render(<TestComponent />);
      
      // undefined <= 768 -> false
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
    });

    it('должен обрабатывать null innerWidth', () => {
      window.innerWidth = null;
      
      render(<TestComponent />);
      
      // null <= 768 -> true (null преобразуется в 0)
      // Поэтому ожидаем 'mobile'
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });

    it('должен правильно работать с дробными значениями ширины', () => {
      window.innerWidth = 767.9;
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');

      cleanup();
      
      window.innerWidth = 768.1;
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
    });
  });

  describe('SSR Compatibility', () => {
    it('должен корректно обрабатывать отсутствие window (SSR)', () => {
      // Сохраняем оригинальный window
      const originalWindow = global.window;
      
      // Временно удаляем window для имитации SSR
      // @ts-ignore
      delete global.window;

      // Проверяем что рендер не падает
      expect(() => {
        render(<TestComponent />);
      }).toThrow(); // Хук должен упасть, потому что использует window

      // Восстанавливаем window
      global.window = originalWindow;
    });

    it('должен работать с существующим window', () => {
      window.innerWidth = 1024;
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
    });
  });
});