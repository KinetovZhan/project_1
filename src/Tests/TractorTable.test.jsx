// 1. Импортируем jest-dom matchers
import '@testing-library/jest-dom/vitest';

// 2. Устанавливаем переменную окружения ДО импорта компонента
vi.stubEnv('VITE_API_URL', 'http://127.0.0.1');

// 3. Мокаем useAuth
const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// 4. Мокаем fetchAPI.js
vi.mock('../fetchAPI.js', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    request: vi.fn(),
  },
  buildApiUrl: (path) => `http://127.0.0.1${path}`,
  API_BASE_URL: 'http://127.0.0.1',
}));

// 5. Мокаем SearchBar и TractorDetails
vi.mock('../SearchBar/SearchBar.jsx', () => ({
  SearchBar: vi.fn(() => <div data-testid="search-bar-mock">SearchBar Mock</div>)
}));

vi.mock('../TractorDetails/TractorDetails.jsx', () => ({
  TractorDetails: vi.fn(({ vin, onBack }) => (
    <div data-testid="tractor-details">
      <span>Детали трактора: {vin}</span>
      <button onClick={onBack}>Назад</button>
    </div>
  ))
}));

// 6. Импорты
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { TractorTable } from '../TractorTable/TractorTable';
import { api } from '../fetchAPI.js';

describe('TractorTable', () => {
  const mockTractorData = [
    {
      vin: 'VIN123',
      model: 'T-150',
      assembly_date: '2023-01-01T10:00:00Z',
      region: 'Сибирь',
      oh_hour: 1200,
      last_activity: '2024-01-01T12:00:00Z',
      consumer: 'Дилер Сибирь'
    }
  ];

  const mockComponentsData = [
    {
      vin: 'VIN123',
      component_type: 'dvs',
      comp_model: 'MotorX',
      software_path: 'some/path/MotorX_v1.bin',
      is_critical: false,
      is_actual: true,
    },
    {
      vin: 'VIN123',
      component_type: 'kpp',
      comp_model: 'GearBoxY',
      software_path: 'some/path/GearBoxY_v2.bin',
      is_critical: false,
      is_actual: true,
    },
    {
      vin: 'VIN123',
      component_type: 'rk',
      comp_model: 'SuspensionZ',
      software_path: null,
      is_critical: false,
      is_actual: false,
    },
    {
      vin: 'VIN123',
      component_type: 'bk',
      comp_model: 'ControllerW',
      software_path: 'some/path/ControllerW.bin',
      is_critical: true,
      is_actual: false,
    }
  ];

  const defaultProps = {
    activeFiltersTrac: [],
    activeFiltersTrac2: [],
    searchQuery: '',
    searchDealer: '',
    dateFilter: null,
    activeMajMinButton: null,
    actualFilter: [],
    uzelFilter: [],
    onCloseTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ 
      token: 'mock-token',
      user: { role: 'user', sub: 'test-user', username: 'test-user' }
    });
    api.post.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Loading and Error States', () => {
    it('рендерит загрузку при первом рендере', async () => {
      api.post.mockImplementationOnce(() => new Promise(() => {}));

      render(<TractorTable {...defaultProps} />);

      expect(screen.getByText(/Загрузка данных о тракторах.../i)).toBeInTheDocument();
    });

    it('показывает ошибку при отсутствии токена', () => {
      mockUseAuth.mockReturnValue({ token: null, user: null });

      render(<TractorTable {...defaultProps} />);

      expect(screen.getByText(/Пользователь не авторизован/i)).toBeInTheDocument();
    });

    it('показывает ошибку при ошибке fetch', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error'));

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Ошибка подключения к серверу: Network error/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Перезагрузить/i })).toBeInTheDocument();
    });
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockResolvedValueOnce(mockComponentsData);
    });

    it('рендерит таблицу с данными после успешного запроса', async () => {
      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.getByText('T-150')).toBeInTheDocument();
      expect(screen.getByText('MotorX_v1.bin')).toBeInTheDocument();
      expect(screen.getByText('GearBoxY_v2.bin')).toBeInTheDocument();
      // Для rk нет software_path, поэтому отображается '-'
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('ControllerW.bin')).toBeInTheDocument();
      expect(screen.getByText('Дилер Сибирь')).toBeInTheDocument();
    });

    it('форматирует даты в формате DD.MM.YYYY, HH:MM', async () => {
      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.getByText(/01.01.2023, 10:00/)).toBeInTheDocument();
      expect(screen.getByText(/01.01.2024, 12:00/)).toBeInTheDocument();
    });

    it('отображает прочерки для отсутствующих компонентов', async () => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(6);
    });

    it('фильтрует TEMPLATE_SOFTWARE_ASSIGNMENT', async () => {
      const dataWithTemplate = [
        ...mockTractorData,
        { vin: 'TEMPLATE_SOFTWARE_ASSIGNMENT', model: 'Template' }
      ];
      api.post
        .mockResolvedValueOnce(dataWithTemplate)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.queryByText('TEMPLATE_SOFTWARE_ASSIGNMENT')).not.toBeInTheDocument();
    });
  });

  describe('GroupTractors function (indirectly tested)', () => {
    it('группирует компоненты трактора правильно через второй запрос', async () => {
      const tractorWithMultipleComponents = [
        {
          vin: 'VIN789',
          model: 'T-250',
          assembly_date: '2023-01-01T10:00:00Z',
          region: 'Урал',
          oh_hour: 500,
          last_activity: '2024-01-01T12:00:00Z',
          consumer: 'Дилер Урал'
        }
      ];

      const componentsForGrouping = [
        { vin: 'VIN789', component_type: 'dvs', comp_model: 'EngineX', software_path: 'engine.bin', is_critical: false, is_actual: true },
        { vin: 'VIN789', component_type: 'engine', comp_model: 'EngineX', software_path: 'engine.bin', is_critical: false, is_actual: true },
        { vin: 'VIN789', component_type: 'kpp', comp_model: 'TransmissionY', software_path: 'trans.bin', is_critical: false, is_actual: true },
        { vin: 'VIN789', component_type: 'transmission', comp_model: 'TransmissionY', software_path: 'trans.bin', is_critical: false, is_actual: true },
        { vin: 'VIN789', component_type: 'rk', comp_model: 'SuspensionZ', software_path: null, is_critical: false, is_actual: false },
        { vin: 'VIN789', component_type: 'suspension', comp_model: 'SuspensionZ', software_path: null, is_critical: false, is_actual: false },
        { vin: 'VIN789', component_type: 'bk', comp_model: 'ControllerW', software_path: 'ctrl.bin', is_critical: true, is_actual: false },
        { vin: 'VIN789', component_type: 'gr', comp_model: 'HydraulicsV', software_path: 'hydr.bin', is_critical: false, is_actual: true },
        { vin: 'VIN789', component_type: 'hydraulics', comp_model: 'HydraulicsV', software_path: 'hydr.bin', is_critical: false, is_actual: true },
        { vin: 'VIN789', component_type: 'ap', comp_model: 'AutopilotU', software_path: 'ap.bin', is_critical: false, is_actual: true },
      ];

      api.post
        .mockResolvedValueOnce(tractorWithMultipleComponents)
        .mockResolvedValueOnce(componentsForGrouping);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN789')).toBeInTheDocument();
      });

      expect(screen.getByText('engine.bin')).toBeInTheDocument();
      expect(screen.getByText('trans.bin')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument(); // rk без software_path
      expect(screen.getByText('ctrl.bin')).toBeInTheDocument();
      expect(screen.getByText('hydr.bin')).toBeInTheDocument();
      expect(screen.getByText('ap.bin')).toBeInTheDocument();
    });

    it('обрабатывает ошибку во втором запросе компонентов', async () => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockRejectedValueOnce(new Error('Components error'));

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(6);
    });

    it('обрабатывает пустой массив компонентов', async () => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Role-based Filtering', () => {
    const dealerTractor = {
      ...mockTractorData[0],
      consumer: 'test-dealer'
    };

    const otherTractor = {
      ...mockTractorData[0],
      vin: 'VIN456',
      consumer: 'other-dealer'
    };

    it('фильтрует тракторы для дилера', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { role: 'dealer', sub: 'test-dealer', username: 'test-dealer' }
      });

      api.post
        .mockResolvedValueOnce([dealerTractor, otherTractor])
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.queryByText('VIN456')).not.toBeInTheDocument();
    });

    it('фильтрует тракторы для дилера с полем dealer вместо consumer', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { role: 'dealer', sub: 'test-dealer', username: 'test-dealer' }
      });

      const dealerTractorWithDealerField = {
        ...mockTractorData[0],
        dealer: 'test-dealer',
        consumer: undefined
      };

      api.post
        .mockResolvedValueOnce([dealerTractorWithDealerField])
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });
    });

    it('использует разные поля user для фильтрации дилера', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { role: 'dealer', name: 'test-dealer', username: 'test-dealer' }
      });

      const dealerTractor = {
        ...mockTractorData[0],
        consumer: 'test-dealer'
      };

      api.post
        .mockResolvedValueOnce([dealerTractor])
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });
    });

    it('показывает все тракторы для модератора', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { role: 'moderator', sub: 'moderator' }
      });

      api.post
        .mockResolvedValueOnce([dealerTractor, otherTractor])
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
        expect(screen.getByText('VIN456')).toBeInTheDocument();
      });
    });

    it('обрабатывает отсутствие consumer у трактора для дилера', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { role: 'dealer', sub: 'test-dealer', username: 'test-dealer' }
      });

      const tractorWithoutConsumer = {
        ...mockTractorData[0],
        consumer: undefined
      };

      api.post
        .mockResolvedValueOnce([tractorWithoutConsumer])
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('VIN123')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation to TractorDetails', () => {
    beforeEach(() => {
      api.post.mockReset();
    });

    it('переходит к TractorDetails при двойном клике на строку', async () => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockResolvedValueOnce(mockComponentsData);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const row = screen.getByText('VIN123').closest('tr');
      fireEvent.doubleClick(row);

      await waitFor(() => {
        expect(screen.getByTestId('tractor-details')).toBeInTheDocument();
        expect(screen.getByText('Детали трактора: VIN123')).toBeInTheDocument();
      });
    });

    it('возвращается к таблице при клике на "Назад"', async () => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockResolvedValueOnce(mockComponentsData);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const row = screen.getByText('VIN123').closest('tr');
      fireEvent.doubleClick(row);

      await waitFor(() => {
        expect(screen.getByTestId('tractor-details')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Назад');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
        expect(screen.queryByTestId('tractor-details')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Calls', () => {
    it('отправляет правильные данные в POST-запросе', async () => {
      const expectedPostData = {
        trac_model: ['T-150'],
        status: ['active'],
        query: 'VIN123',
        dealer: 'Дилер Сибирь',
        date_assemle: null,
        date_start: '2023-01-01',
        date_end: '2023-12-31',
        is_actual: true,
        is_critical: null,
        is_archive: null,
      };

      api.post.mockResolvedValueOnce([]);

      render(
        <TractorTable
          {...defaultProps}
          activeFiltersTrac={['T-150']}
          activeFiltersTrac2={['active']}
          searchQuery="VIN123"
          searchDealer="Дилер Сибирь"
          dateFilter={{
            date_start: '2023-01-01',
            date_end: '2023-12-31',
          }}
          activeMajMinButton="MAJ"
        />
      );

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1);
      });

      expect(api.post).toHaveBeenCalledWith(
        'search/tractor-info',
        expectedPostData
      );
    });

    it('отправляет корректные данные для MAJ/MIN фильтрации', async () => {
      const testCases = [
        { button: 'MAJ', expected: true },
        { button: 'MIN', expected: false },
        { button: null, expected: null },
      ];

      for (const { button, expected } of testCases) {
        api.post.mockReset();
        api.post.mockResolvedValueOnce([]);

        render(
          <TractorTable
            {...defaultProps}
            activeMajMinButton={button}
          />
        );

        await waitFor(() => {
          expect(api.post).toHaveBeenCalled();
        });

        const call = api.post.mock.calls[0];
        const actualBody = call[1];
        expect(actualBody.is_actual).toBe(expected);
        
        cleanup();
      }
    });

    it('отправляет корректные данные для фильтрации по датам', async () => {
      const testCases = [
        { 
          dateFilter: { date_assemle: '2023-01-01' },
          expected: { date_assemle: '2023-01-01', date_start: null, date_end: null }
        },
        { 
          dateFilter: { date_start: '2023-01-01', date_end: '2023-12-31' },
          expected: { date_assemle: null, date_start: '2023-01-01', date_end: '2023-12-31' }
        }
      ];

      for (const { dateFilter, expected } of testCases) {
        api.post.mockReset();
        api.post.mockResolvedValueOnce([]);

        render(
          <TractorTable
            {...defaultProps}
            dateFilter={dateFilter}
          />
        );

        await waitFor(() => {
          expect(api.post).toHaveBeenCalled();
        });

        const call = api.post.mock.calls[0];
        const actualBody = call[1];
        expect(actualBody.date_assemle).toBe(expected.date_assemle);
        expect(actualBody.date_start).toBe(expected.date_start);
        expect(actualBody.date_end).toBe(expected.date_end);
        
        cleanup();
      }
    });

    it('обрабатывает undefined в searchQuery и searchDealer', async () => {
      api.post.mockResolvedValueOnce([]);

      render(
        <TractorTable
          {...defaultProps}
          searchQuery={undefined}
          searchDealer={undefined}
        />
      );

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });

      const call = api.post.mock.calls[0];
      const actualBody = call[1];
      expect(actualBody.query).toBe('');
      expect(actualBody.dealer).toBe('');
    });

    it('обрабатывает пустую строку в searchQuery и searchDealer', async () => {
      api.post.mockResolvedValueOnce([]);

      render(
        <TractorTable
          {...defaultProps}
          searchQuery="   "
          searchDealer="   "
        />
      );

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });

      const call = api.post.mock.calls[0];
      const actualBody = call[1];
      expect(actualBody.query).toBe('');
      expect(actualBody.dealer).toBe('');
    });

    it('делает второй запрос за компонентами', async () => {
      api.post
        .mockResolvedValueOnce(mockTractorData)
        .mockResolvedValueOnce(mockComponentsData);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(2);
      });

      expect(api.post).toHaveBeenCalledWith(
        'search/tractor-components',
        { vins: ['VIN123'] }
      );
    });

    it('не делает запрос за компонентами если нет тракторов', async () => {
      api.post
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1);
      });

      expect(api.post).not.toHaveBeenCalledWith(
        'search/tractor-components',
        expect.anything()
      );
    });
  });

  describe('Edge Cases', () => {
    it('обрабатывает null значения в датах', async () => {
      const tractorWithNullDates = [{
        ...mockTractorData[0],
        assembly_date: null,
        last_activity: null
      }];

      api.post
        .mockResolvedValueOnce(tractorWithNullDates)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('обрабатывает undefined значения в датах', async () => {
      const tractorWithUndefinedDates = [{
        ...mockTractorData[0],
        assembly_date: undefined,
        last_activity: undefined
      }];

      api.post
        .mockResolvedValueOnce(tractorWithUndefinedDates)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('обрабатывает альтернативные названия полей', async () => {
      const tractorWithAltFields = [{
        VIN: 'ALT123',
        model: 'T-150',
        releaseDate: '2023-01-01T10:00:00Z',
        region: 'Сибирь',
        motoHours: 1200,
        lastActivity: '2024-01-01T12:00:00Z',
        dealer: 'Дилер Сибирь'
      }];

      api.post
        .mockResolvedValueOnce(tractorWithAltFields)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ALT123')).toBeInTheDocument();
      });

      expect(screen.getByText('Дилер Сибирь')).toBeInTheDocument();
    });

    it('сортирует тракторы по VIN', async () => {
      const unsortedTractors = [
        { ...mockTractorData[0], vin: 'VIN3' },
        { ...mockTractorData[0], vin: 'VIN1' },
        { ...mockTractorData[0], vin: 'VIN2' }
      ];

      api.post
        .mockResolvedValueOnce(unsortedTractors)
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('VIN1');
        expect(rows[2]).toHaveTextContent('VIN2');
        expect(rows[3]).toHaveTextContent('VIN3');
      });
    });

    it('обрабатывает случай, когда нет данных о тракторах', async () => {
      api.post
        .mockResolvedValueOnce([]);

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('VIN123')).not.toBeInTheDocument();
      });

      const rows = screen.queryAllByRole('row');
      expect(rows.length).toBe(1); // только заголовок
    });
  });
});