// Objects.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Objects } from '../Po/Objects';
import { useAuth } from '../auth/AuthContext';

// Мокаем fetchAPI.js
vi.mock('../fetchAPI.js', () => ({
  api: {
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

// Моки для изображений
vi.mock('../img/default.jpg', () => ({ default: 'default-mock.jpg' }));
vi.mock('../img/КПП.png', () => ({ default: 'kpp-mock.jpg' }));
vi.mock('../img/РК.png', () => ({ default: 'rk-mock.jpg' }));
vi.mock('../img/Гидрораспределитель.png', () => ({ default: 'hr-mock.jpg' }));
vi.mock('../img/Автопилот.png', () => ({ default: 'ap-mock.jpg' }));
vi.mock('../img/ДВС Weichai.png', () => ({ default: 'weichai-mock.jpg' }));
vi.mock('../img/ДВС ТМЗ.png', () => ({ default: 'tmz-mock.jpg' }));
vi.mock('../img/ДВС ЯМЗ.png', () => ({ default: 'ymz-mock.jpg' }));
vi.mock('../img/БК дисплей контроллер.png', () => ({ default: 'bk-mock.jpg' }));

// Мок для AuthContext
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Мок для PoDetails
vi.mock('../PoDetails/PoDetails.jsx', () => ({
  PoDetails: ({ po, onBack }) => (
    <div data-testid="po-details">
      <span>PoDetails Mock for ID {po?.id_Firmwares}</span>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Мок для window.URL
const mockCreateObjectURL = vi.fn(() => 'blob:test');
const mockRevokeObjectURL = vi.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

import { api } from '../fetchAPI.js';

describe('Objects Component', () => {
  const mockToken = 'test-token';
  const mockUser = { role: 'user' };
  const mockDealerUser = { role: 'dealer' };

  const mockSoftwareData = [
    {
      id_Firmwares: 1,
      name: 'kpp_v1.bin',
      release_date: '2024-01-15T00:00:00Z',
      type_component: 'transmission',
      name_component: 'KPP-01',
      download_link: 'kpp_v1.bin',
      software_path: 'some/path/kpp_v1.bin',
    },
    {
      id_Firmwares: 2,
      name: 'weichai_v2.bin',
      release_date: '2024-02-20T00:00:00Z',
      type_component: 'dvs',
      name_component: 'Weichai',
      download_link: 'weichai_v2.bin',
    },
    {
      id_Firmwares: 3,
      name: 'bk_v3.bin',
      release_date: '2024-03-10T00:00:00Z',
      type_component: 'bk',
      name_component: 'БК-01',
      download_link: 'bk_v3.bin',
    },
    {
      id_Firmwares: 4,
      name: 'rk_v4.bin',
      release_date: '2024-04-05T00:00:00Z',
      type_component: 'suspension',
      name_component: 'РК-01',
      download_link: 'rk_v4.bin',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();

    // Мокаем глобальный fetch для скачивания (в компоненте используется fetch)
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Рендеринг и загрузка данных', () => {
    it('должен отображать состояние загрузки', () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post.mockImplementation(() => new Promise(() => {}));

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    });

    it('должен отображать ошибку при отсутствии токена', async () => {
      useAuth.mockReturnValue({ token: null, user: mockUser });

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      expect(await screen.findByText('Пользователь не авторизован')).toBeInTheDocument();
    });

    it('должен успешно загружать и отображать данные', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)   // active
        .mockResolvedValueOnce([]);                // archive

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      await waitFor(() => {
        expect(screen.getByText('Актуальные версии (4)')).toBeInTheDocument();
      });
      expect(screen.getByText('kpp_v1.bin от 15.01.2024')).toBeInTheDocument();
      expect(screen.getByText('weichai_v2.bin от 20.02.2024')).toBeInTheDocument();
      expect(screen.getByText('bk_v3.bin от 10.03.2024')).toBeInTheDocument();
      expect(screen.getByText('rk_v4.bin от 05.04.2024')).toBeInTheDocument();
    });

    it('должен обрабатывать ошибку fetch', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post.mockRejectedValueOnce(new Error('Network error'));

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      expect(await screen.findByText(/Ошибка: Network error/)).toBeInTheDocument();
    });
  });

  describe('Роль дилера', () => {
    it('не должен загружать данные для роли dealer', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockDealerUser });

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      expect(await screen.findByText('Актуальные версии (0)')).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe('ImageToComponent функция', () => {
    it('должен отображать правильные изображения для разных типов', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      await screen.findByText('Актуальные версии (4)');
      const images = screen.getAllByRole('img');
      // порядок зависит от данных: transmission -> kpp-mock, dvs -> weichai-mock, bk -> bk-mock, suspension -> rk-mock
      expect(images[0]).toHaveAttribute('src', 'kpp-mock.jpg');
      expect(images[1]).toHaveAttribute('src', 'weichai-mock.jpg');
      expect(images[2]).toHaveAttribute('src', 'bk-mock.jpg');
      expect(images[3]).toHaveAttribute('src', 'rk-mock.jpg');
    });

    it('должен отображать изображение по умолчанию для неизвестного типа', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      const unknownData = [{
        id_Firmwares: 5,
        name: 'unknown.bin',
        release_date: '2024-05-05T00:00:00Z',
        type_component: 'unknown',
        name_component: 'Unknown',
      }];
      api.post
        .mockResolvedValueOnce(unknownData)
        .mockResolvedValueOnce([]);

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);

      await screen.findByText('Актуальные версии (1)');
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'default-mock.jpg');
    });
  });

  describe('Скачивание файлов', () => {
    it('должен обрабатывать ошибку при отсутствии токена', async () => {
      useAuth.mockReturnValue({ token: null, user: mockUser });
      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      expect(await screen.findByText('Пользователь не авторизован')).toBeInTheDocument();
    });

    it('должен успешно скачать файл', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);

      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: (name) => {
            if (name === 'content-disposition') return 'attachment; filename="test.bin"';
            return null;
          },
        },
      });

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      await screen.findByText('Актуальные версии (4)');

      const downloadButtons = screen.getAllByText('Скачать');
      await userEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'api/software/download/1',
          expect.objectContaining({ headers: { Authorization: `Bearer ${mockToken}` } })
        );
      });
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('должен обрабатывать ошибку при скачивании', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      await screen.findByText('Актуальные версии (4)');

      const downloadButtons = screen.getAllByText('Скачать');
      await userEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Ошибка при скачивании: HTTP error! status: 404');
      });
    });
  });

  describe('Hover popup функциональность', () => {
    it('должен показывать тултип при наведении', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      await screen.findByText('kpp_v1.bin от 15.01.2024');

      const textElement = screen.getByText('Для компонента transmission: KPP-01');
      fireEvent.mouseEnter(textElement);

      // Тултип появляется через 250 мс, ждём
      await waitFor(() => {
        expect(screen.getByText('transmission: KPP-01')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(textElement);
      await waitFor(() => {
        expect(screen.queryByText('transmission: KPP-01')).not.toBeInTheDocument();
      });
    });
  });

  describe('Фильтрация и поиск', () => {
    it('должен фильтровать по searchQuery', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="weichai" />);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          'search/component-info',
          expect.objectContaining({ search: 'weichai' })
        );
      });
    });

    it('должен отображать сообщение при отсутствии результатов', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="nonexistent" />);

      expect(await screen.findByText('Ничего не найдено')).toBeInTheDocument();
    });
  });

  describe('Архивация', () => {
    it('должен перемещать в архив и обновлять список', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      // Первый вызов: активные
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);
      // После архивации перезагружаем
      api.post
        .mockResolvedValueOnce([])   // активные становятся пустыми
        .mockResolvedValueOnce(mockSoftwareData); // архивные

      api.patch.mockResolvedValueOnce({});

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      await screen.findByText('Актуальные версии (4)');

      const archiveButtons = screen.getAllByText('В архив');
      await userEvent.click(archiveButtons[0]);

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith('search/firmware/1/archive', { is_archive: true });
      });
      // Должны перезагрузиться данные
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(4); // два вызова при первом рендере + два после архивации
      });
    });
  });

  describe('Переключение между активными и архивными', () => {
    it('должен показывать архивные версии при клике на кнопку', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)   // active
        .mockResolvedValueOnce([]);                // archive

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      await screen.findByText('Актуальные версии (4)');

      // Мокаем новые данные для архива
      api.post
        .mockResolvedValueOnce([])                 // active (не изменится)
        .mockResolvedValueOnce(mockSoftwareData);  // archive

      const archiveButton = screen.getByText('Архивные версии (0)');
      await userEvent.click(archiveButton);

      await waitFor(() => {
        expect(screen.getByText('Архивные версии (4)')).toBeInTheDocument();
      });
      expect(screen.getByText('kpp_v1.bin от 15.01.2024')).toBeInTheDocument();
    });
  });

  describe('Навигация в PoDetails', () => {
    it('должен открывать PoDetails при клике на элемент', async () => {
      useAuth.mockReturnValue({ token: mockToken, user: mockUser });
      api.post
        .mockResolvedValueOnce(mockSoftwareData)
        .mockResolvedValueOnce([]);

      render(<Objects activeFilters={[]} activeFilters2={[]} selectedModel={[]} searchQuery="" />);
      await screen.findByText('Актуальные версии (4)');

      const image = screen.getAllByRole('img')[0];
      await userEvent.click(image);

      await waitFor(() => {
        expect(screen.getByTestId('po-details')).toBeInTheDocument();
        expect(screen.getByText('PoDetails Mock for ID 1')).toBeInTheDocument();
      });
    });
  });
});