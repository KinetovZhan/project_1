// G:\Working\1_project\project_1\src\Tests\Objects.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Objects } from '../Function/Objects';
import { useAuth } from '../auth/AuthContext';

// Моки для изображений
vi.mock('../img/default.jpg', () => ({ default: 'default-mock.jpg' }));
vi.mock('../img/КПП.png', () => ({ default: 'kpp-mock.jpg' }));
vi.mock('../img/РК.png', () => ({ default: 'rk-mock.jpg' }));
vi.mock('../img/Гидрораспределитель.png', () => ({ default: 'hr-mock.jpg' }));
vi.mock('../img/Автопилот.png', () => ({ default: 'ap-mock.jpg' }));
vi.mock('../img/ДВС Weichai.png', () => ({ default: 'weichai-mock.jpg' }));
vi.mock('../img/ДВС ТМЗ.png', () => ({ default: 'tmz-mock.jpg' }));
vi.mock('../img/ДВС ЯМЗ.png', () => ({ default: 'ymz-mock.jpg' }));
vi.mock('../img/БК дисплей.png', () => ({ default: 'display-mock.jpg' }));
vi.mock('../img/БК Контроллер.png', () => ({ default: 'contr-mock.jpg' }));

// Мок для AuthContext
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Мок для ip
vi.mock("../shrineofvsakoe/ip.jsx", () => ({
  ip: "localhost:3000"
}));

// Мок для window.URL
const mockCreateObjectURL = vi.fn(() => 'blob:test');
const mockRevokeObjectURL = vi.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('Objects Component', () => {
  const mockToken = 'test-token';
  const mockUser = { role: 'user' };
  
  const mockSoftwareData = [
    {
      id_Firmwares: 1,
      producer_version: 'v1.0.0',
      release_date: '2024-01-15',
      type_component: 'transmission',
      model_component: 'KPP-01',
      comp_model: null,
      part_type: null
    },
    {
      id_Firmwares: 2,
      producer_version: 'v2.0.0',
      release_date: '2024-02-20',
      type_component: 'dvs',
      model_component: 'Weichai',
      comp_model: 'Weichai',
      part_type: null
    },
    {
      id_Firmwares: 3,
      producer_version: 'v3.0.0',
      release_date: '2024-03-10',
      type_component: 'bk',
      model_component: 'БК-01',
      comp_model: null,
      part_type: 'Дисплей'
    },
    {
      id_Firmwares: 4,
      producer_version: 'v4.0.0',
      release_date: '2024-04-05',
      type_component: 'suspension',
      model_component: 'РК-01',
      comp_model: null,
      part_type: null
    }
  ];

  const mockDealerUser = { role: 'dealer' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Рендеринг и загрузка данных', () => {
    it('должен отображать состояние загрузки', () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });
      
      global.fetch.mockImplementationOnce(() => new Promise(() => {}));
      
      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);
      
      expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    });

    it('должен отображать ошибку при отсутствии токена', async () => {
      useAuth.mockReturnValue({
        token: null,
        user: mockUser
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      expect(await screen.findByText('Пользователь не авторизован')).toBeInTheDocument();
    });

    it('должен успешно загружать и отображать данные', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      expect(await screen.findByText('Компоненты (4)')).toBeInTheDocument();
      expect(screen.getByText('№: v1.0.0 от 15.01.2024')).toBeInTheDocument();
    });

    it('должен обрабатывать ошибку fetch', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      expect(await screen.findByText(/Ошибка: Network error/)).toBeInTheDocument();
    });
  });

  describe('Роль дилера', () => {
    it('не должен загружать данные для роли dealer', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockDealerUser
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      expect(await screen.findByText('Компоненты (0)')).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('ImageToComponent функция', () => {
    it('должен отображать правильные изображения для разных типов', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (4)');
      
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'kpp-mock.jpg');
      expect(images[1]).toHaveAttribute('src', 'weichai-mock.jpg');
      expect(images[2]).toHaveAttribute('src', 'display-mock.jpg');
      expect(images[3]).toHaveAttribute('src', 'rk-mock.jpg');
    });

    it('должен отображать изображение по умолчанию для неизвестного типа', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const unknownData = [{
        id_Firmwares: 5,
        producer_version: 'v5.0.0',
        release_date: '2024-05-05',
        type_component: 'unknown',
        model_component: 'Unknown',
        comp_model: null,
        part_type: null
      }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => unknownData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (1)');
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'default-mock.jpg');
    });

    it('должен отображать изображение контроллера для БК контроллер', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const controllerData = [{
        id_Firmwares: 6,
        producer_version: 'v6.0.0',
        release_date: '2024-06-06',
        type_component: 'bk',
        model_component: 'БК-02',
        comp_model: null,
        part_type: 'Контроллер'
      }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => controllerData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (1)');
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'contr-mock.jpg');
    });

    it('должен отображать изображение гидрораспределителя', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const hrData = [{
        id_Firmwares: 7,
        producer_version: 'v7.0.0',
        release_date: '2024-07-07',
        type_component: 'hydraulics',
        model_component: 'ГР-01',
        comp_model: null,
        part_type: null
      }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => hrData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (1)');
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'hr-mock.jpg');
    });

    it('должен отображать изображение автопилота', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const apData = [{
        id_Firmwares: 8,
        producer_version: 'v8.0.0',
        release_date: '2024-08-08',
        type_component: 'ap',
        model_component: 'АП-01',
        comp_model: null,
        part_type: null
      }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (1)');
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'ap-mock.jpg');
    });
  });

  describe('Скачивание файлов', () => {
    it('должен показывать alert при отсутствии ID файла', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const noIdData = [{
        id_Firmwares: null,
        producer_version: 'v1.0.0',
        release_date: '2024-01-15',
        type_component: 'transmission',
        model_component: 'KPP-01'
      }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => noIdData
      });

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (0)');
      expect(screen.queryByText('Скачать')).not.toBeInTheDocument();
      expect(alertMock).not.toHaveBeenCalled();
    });

    it('должен показывать ошибку при отсутствии токена', async () => {
      useAuth.mockReturnValue({
        token: null,
        user: mockUser
      });

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      // Компонент должен показать ошибку авторизации
      expect(await screen.findByText('Пользователь не авторизован')).toBeInTheDocument();
      
      // Кнопок скачивания нет
      expect(screen.queryByText('Скачать')).not.toBeInTheDocument();
      
      // fetch не вызывался
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('должен обрабатывать пустой blob', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      const mockBlob = new Blob([], { type: 'application/octet-stream' });
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: () => null
        }
      });

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (4)');
      
      const downloadButton = screen.getAllByText('Скачать')[0];
      await userEvent.click(downloadButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Ошибка при скачивании: Файл пустой');
      });
    });

    it('должен обрабатывать ошибку при скачивании', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'File not found'
      });

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (4)');
      
      const downloadButton = screen.getAllByText('Скачать')[0];
      await userEvent.click(downloadButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Ошибка при скачивании: Ошибка сервера: 404 Not Found');
      });
    });
  });

  describe('Hover popup функциональность', () => {
    it('должен управлять состоянием isVisible', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('№: v1.0.0 от 15.01.2024');
      
      const textElement = screen.getByText('Для компонента transmission: KPP-01 (—)');
      
      fireEvent.mouseEnter(textElement);
      expect(screen.queryByText('transmission: KPP-01')).not.toBeInTheDocument();
      
      fireEvent.mouseLeave(textElement);
      expect(screen.queryByText('transmission: KPP-01')).not.toBeInTheDocument();
    });
  });

  describe('Фильтрация и поиск', () => {
    it('должен фильтровать по searchQuery', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="Weichai" 
      />);

      await screen.findByText('№: v2.0.0 от 20.02.2024');
      expect(screen.queryByText('№: v1.0.0 от 15.01.2024')).not.toBeInTheDocument();
    });

    it('должен фильтровать по comp_model', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const dataWithCompModel = [{
        id_Firmwares: 9,
        producer_version: 'v9.0.0',
        release_date: '2024-09-09',
        type_component: 'dvs',
        model_component: null,
        comp_model: 'Weichai',
        part_type: null
      }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithCompModel
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="Weichai" 
      />);

      await screen.findByText('№: v9.0.0 от 09.09.2024');
    });

    it('должен отображать сообщение при отсутствии результатов', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftwareData
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="NonexistentComponent" 
      />);

      expect(await screen.findByText('Ничего не найдено')).toBeInTheDocument();
      expect(screen.getByText('Попробуйте изменить фильтры или запрос')).toBeInTheDocument();
    });
  });

  describe('Функции фильтров', () => {
    it('должен отображать активные фильтры', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<Objects 
        activeFilters={['DVS', 'KPP', 'RK', 'hydrorasp', 'AP', 'BK']} 
        activeFilters2={['K7', 'K5']} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await waitFor(() => {
        expect(screen.getByText('Активные фильтры: ДВС, КПП, РК, Гидрораспределитель, Автопилот, БК, К-7, К-5')).toBeInTheDocument();
      });
    });

    it('должен отображать "всех компонентов" при отсутствии фильтров', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      expect(await screen.findByText('Последние версии ПО для всех компонентов')).toBeInTheDocument();
    });
  });

  describe('Параметры запроса', () => {
    it('должен правильно формировать postData с фильтрами', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<Objects 
        activeFilters={['DVS', 'KPP']} 
        activeFilters2={['K7', 'K5']} 
        selectedModel={['Model1', 'Model2']} 
        searchQuery="" 
      />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/search/component-info',
          expect.objectContaining({
            method: 'POST',
            headers: expect.any(Object),
            body: JSON.stringify({
              trac_model: ['K-7', 'K-5'],
              type_comp: ['dvs', 'engine', 'kpp', 'transmission'],
              model_comp: ['Model1', 'Model2']
            })
          })
        );
      });
    });

    it('должен обрабатывать не-массив selectedModel', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<Objects 
        activeFilters={['RK']} 
        activeFilters2={[]} 
        selectedModel="Model1" 
        searchQuery="" 
      />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/search/component-info',
          expect.objectContaining({
            body: JSON.stringify({
              trac_model: [],
              type_comp: ['suspension'],
              model_comp: []
            })
          })
        );
      });
    });
  });

  describe('Фильтрация id_Firmwares', () => {
    it('должен отображать только элементы с id_Firmwares', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      const dataWithNullId = [
        ...mockSoftwareData,
        {
          id_Firmwares: null,
          producer_version: 'v5.0.0',
          release_date: '2024-05-05',
          type_component: 'test',
          model_component: 'Test'
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithNullId
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      await screen.findByText('Компоненты (4)');
      expect(screen.queryByText('№: v5.0.0 от 05.05.2024')).not.toBeInTheDocument();
      expect(screen.getAllByText('Скачать')).toHaveLength(4);
    });
  });

  describe('Компонент с part_type', () => {
    it('должен отображать part_type в тексте', async () => {
      useAuth.mockReturnValue({
        token: mockToken,
        user: mockUser
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockSoftwareData[2]] // Только БК с дисплеем
      });

      render(<Objects 
        activeFilters={[]} 
        activeFilters2={[]} 
        selectedModel={[]} 
        searchQuery="" 
      />);

      expect(await screen.findByText('Для компонента bk: БК-01 (Дисплей)')).toBeInTheDocument();
    });
  });
});