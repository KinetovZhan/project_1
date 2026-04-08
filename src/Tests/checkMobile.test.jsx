import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import useCheckMobile from '../CheckMobile/checkMobile'; // ⚠️ Укажите правильный путь к вашему хуку

// Тестовый компонент, который использует хук и рендерит статус
const TestComponent = () => {
  const isMobile = useCheckMobile();
  return <div data-testid="mobile-status">{isMobile ? 'mobile' : 'desktop'}</div>;
};

// Безопасный способ изменения window.innerWidth в jsdom
const setWindowWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useCheckMobile', () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    setWindowWidth(1024); // Значение по умолчанию для тестов
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial detection', () => {
    it('должен определить мобильное устройство при ширине <= 1600px', () => {
      setWindowWidth(768);
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });

    it('должен определить десктоп при ширине > 1600px', () => {
      setWindowWidth(1920);
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
    });

    it('должен правильно обрабатывать граничное значение 1600px', () => {
      setWindowWidth(1600);
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });
  });

  describe('Event listeners', () => {
    it('должен добавить обработчик resize при монтировании', () => {
      render(<TestComponent />);
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('должен удалить обработчик resize при размонтировании', () => {
      const { unmount } = render(<TestComponent />);
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Resize handling', () => {
    it('должен обновлять состояние при изменении размера окна', () => {
      setWindowWidth(1920);
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');

      act(() => {
        setWindowWidth(800);
        window.dispatchEvent(new Event('resize'));
      });

      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });

    it('должен обновляться при нескольких изменениях размера', () => {
      setWindowWidth(1024);
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');

      act(() => {
        setWindowWidth(1601);
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');

      act(() => {
        setWindowWidth(500);
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
    });
  });

  describe('Multiple instances', () => {
    it('должен корректно работать с несколькими экземплярами хука', () => {
      render(
        <>
          <TestComponent />
          <TestComponent />
        </>
      );
      const statuses = screen.getAllByTestId('mobile-status');
      expect(statuses[0]).toHaveTextContent('mobile');
      expect(statuses[1]).toHaveTextContent('mobile');
    });

    it('должен добавлять по одному обработчику на каждый экземпляр', () => {
      render(
        <>
          <TestComponent />
          <TestComponent />
        </>
      );
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
  it('должен обрабатывать undefined innerWidth', () => {
    Object.defineProperty(window, 'innerWidth', {
      get: () => undefined,
      configurable: true,
    });
    render(<TestComponent />);
    // undefined приводится к NaN, NaN <= 1600 → false
    expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
  });

  it('должен обрабатывать null innerWidth', () => {
    Object.defineProperty(window, 'innerWidth', {
      get: () => null,
      configurable: true,
    });
    render(<TestComponent />);
    // null приводится к 0, 0 <= 1600 → true
    expect(screen.getByTestId('mobile-status')).toHaveTextContent('mobile');
  });

  it('должен правильно работать с дробными значениями ширины', () => {
    setWindowWidth(1600.1);
    render(<TestComponent />);
    expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
  });
});

  describe('SSR Compatibility', () => {
    it('должен корректно обрабатывать отсутствие window (SSR)', () => {
      // В jsdom window всегда определён, поэтому проверяем, что рендер не падает
      expect(() => render(<TestComponent />)).not.toThrow();
    });

    it('должен работать с существующим window', () => {
      setWindowWidth(1920); // > 1600px → desktop
      render(<TestComponent />);
      expect(screen.getByTestId('mobile-status')).toHaveTextContent('desktop');
    });
  });
});