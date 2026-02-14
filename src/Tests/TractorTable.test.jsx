// 1. Сначала импортируем jest-dom matchers
import '@testing-library/jest-dom/vitest';

// 2. Мокаем useAuth ДО импортов
const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// 3. Мокаем IP
vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: '127.0.0.1',
}));

// 4. Мокаем SearchBar (чтобы не влиял на покрытие)
vi.mock('../Function/SearchBar.jsx', () => ({
  SearchBar: vi.fn(() => <div data-testid="search-bar-mock">SearchBar Mock</div>)
}));

// 5. Мокаем TractorDetails
vi.mock('../Function/TractorDetails.jsx', () => ({
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
import { TractorTable } from '../Function/TractorTable';

// 7. Мокаем fetch глобально
global.fetch = vi.fn();

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
    },
    {
      vin: 'VIN123',
      component_type: 'kpp',
      comp_model: 'GearBoxY',
    },
    {
      vin: 'VIN123',
      component_type: 'rk',
      comp_model: 'SuspensionZ',
    },
    {
      vin: 'VIN123',
      component_type: 'bk',
      comp_model: 'ControllerW',
    }
  ];

  const defaultProps = {
    activeFiltersTrac: [],
    activeFiltersTrac2: [],
    searchQuery: '',
    searchDealer: '',
    dateFilter: null,
    activeMajMinButton: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
    mockUseAuth.mockReturnValue({ 
      token: 'mock-token',
      user: { role: 'user', sub: 'test-user', username: 'test-user' }
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Loading and Error States', () => {
    it('рендерит загрузку при первом рендере', async () => {
      fetch.mockImplementationOnce(() => new Promise(() => {}));

      render(<TractorTable {...defaultProps} />);

      expect(screen.getByText(/Загрузка данных о тракторах.../i)).toBeInTheDocument();
    });

    it('показывает ошибку при отсутствии токена', () => {
      mockUseAuth.mockReturnValue({ token: null, user: null });

      render(<TractorTable {...defaultProps} />);

      expect(screen.getByText(/Пользователь не авторизован/i)).toBeInTheDocument();
    });

    it('показывает ошибку при ошибке fetch', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Ошибка подключения к серверу: Network error/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Перезагрузить/i })).toBeInTheDocument();
    });

    it('показывает ошибку при HTTP ошибке', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Ошибка подключения к серверу: HTTP error! status: 500/i)).toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockComponentsData });
    });

    it('рендерит таблицу с данными после успешного запроса', async () => {
      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.getByText('T-150')).toBeInTheDocument();
      expect(screen.getByText('MotorX')).toBeInTheDocument();
      expect(screen.getByText('GearBoxY')).toBeInTheDocument();
      expect(screen.getByText('SuspensionZ')).toBeInTheDocument();
      expect(screen.getByText('ControllerW')).toBeInTheDocument();
      expect(screen.getByText('Дилер Сибирь')).toBeInTheDocument();
    });

    it('форматирует даты в формате DD.MM.YYYY, HH:MM', async () => {
      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.getByText(/01.01.2023/)).toBeInTheDocument();
      expect(screen.getByText(/01.01.2024/)).toBeInTheDocument();
    });

    it('отображает прочерки для отсутствующих компонентов', async () => {
      fetch.mockReset();
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

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

      fetch.mockReset();
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => dataWithTemplate })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

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
        { vin: 'VIN789', component_type: 'dvs', comp_model: 'EngineX' },
        { vin: 'VIN789', component_type: 'engine', comp_model: 'EngineX' },
        { vin: 'VIN789', component_type: 'kpp', comp_model: 'TransmissionY' },
        { vin: 'VIN789', component_type: 'transmission', comp_model: 'TransmissionY' },
        { vin: 'VIN789', component_type: 'rk', comp_model: 'SuspensionZ' },
        { vin: 'VIN789', component_type: 'suspension', comp_model: 'SuspensionZ' },
        { vin: 'VIN789', component_type: 'bk', comp_model: 'ControllerW' },
        { vin: 'VIN789', component_type: 'gr', comp_model: 'HydraulicsV' },
        { vin: 'VIN789', component_type: 'hydraulics', comp_model: 'HydraulicsV' },
        { vin: 'VIN789', component_type: 'ap', comp_model: 'AutopilotU' },
      ];

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => tractorWithMultipleComponents })
        .mockResolvedValueOnce({ ok: true, json: async () => componentsForGrouping });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN789')).toBeInTheDocument();
      });

      expect(screen.getByText('EngineX')).toBeInTheDocument();
      expect(screen.getByText('TransmissionY')).toBeInTheDocument();
      expect(screen.getByText('SuspensionZ')).toBeInTheDocument();
      expect(screen.getByText('ControllerW')).toBeInTheDocument();
      expect(screen.getByText('HydraulicsV')).toBeInTheDocument();
      expect(screen.getByText('AutopilotU')).toBeInTheDocument();
    });

    it('обрабатывает ошибку во втором запросе компонентов', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: false, status: 500 });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(6);
    });

    it('обрабатывает пустой массив компонентов', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

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
        user: { 
          role: 'dealer', 
          sub: 'test-dealer',
          username: 'test-dealer'
        }
      });

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [dealerTractor, otherTractor] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      expect(screen.queryByText('VIN456')).not.toBeInTheDocument();
    });

    it('фильтрует тракторы для дилера с полем dealer вместо consumer', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { 
          role: 'dealer', 
          sub: 'test-dealer',
          username: 'test-dealer'
        }
      });

      const dealerTractorWithDealerField = {
        ...mockTractorData[0],
        dealer: 'test-dealer',
        consumer: undefined
      };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [dealerTractorWithDealerField] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });
    });

    it('использует разные поля user для фильтрации дилера', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { 
          role: 'dealer', 
          name: 'test-dealer',
          username: 'test-dealer'
        }
      });

      const dealerTractor = {
        ...mockTractorData[0],
        consumer: 'test-dealer'
      };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [dealerTractor] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

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

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [dealerTractor, otherTractor] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
        expect(screen.getByText('VIN456')).toBeInTheDocument();
      });
    });

    it('обрабатывает отсутствие consumer у трактора для дилера', async () => {
      mockUseAuth.mockReturnValue({
        token: 'mock-token',
        user: { 
          role: 'dealer', 
          sub: 'test-dealer',
          username: 'test-dealer'
        }
      });

      const tractorWithoutConsumer = {
        ...mockTractorData[0],
        consumer: undefined
      };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [tractorWithoutConsumer] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('VIN123')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation to TractorDetails', () => {
    beforeEach(() => {
      fetch.mockReset();
    });

    it('переходит к TractorDetails при клике на строку', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockComponentsData });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const row = screen.getByText('VIN123').closest('tr');
      fireEvent.click(row);

      await waitFor(() => {
        expect(screen.getByTestId('tractor-details')).toBeInTheDocument();
        expect(screen.getByText('Детали трактора: VIN123')).toBeInTheDocument();
      });
    });

    it('возвращается к таблице при клике на "Назад"', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockComponentsData });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('VIN123')).toBeInTheDocument();
      });

      const row = screen.getByText('VIN123').closest('tr');
      fireEvent.click(row);

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
        is_major: true,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(
        <TractorTable
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
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1/search/tractor-info',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );

      const call = fetch.mock.calls[0];
      const actualBody = JSON.parse(call[1].body);
      expect(actualBody).toEqual(expectedPostData);
    });

    it('отправляет корректные данные для MAJ/MIN фильтрации', async () => {
      const testCases = [
        { button: 'MAJ', expected: true },
        { button: 'MIN', expected: false },
        { button: null, expected: null },
      ];

      for (const { button, expected } of testCases) {
        fetch.mockReset();
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

        render(
          <TractorTable
            {...defaultProps}
            activeMajMinButton={button}
          />
        );

        await waitFor(() => {
          expect(fetch).toHaveBeenCalled();
        });

        const call = fetch.mock.calls[0];
        const actualBody = JSON.parse(call[1].body);
        expect(actualBody.is_major).toBe(expected);
        
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
        fetch.mockReset();
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

        render(
          <TractorTable
            {...defaultProps}
            dateFilter={dateFilter}
          />
        );

        await waitFor(() => {
          expect(fetch).toHaveBeenCalled();
        });

        const call = fetch.mock.calls[0];
        const actualBody = JSON.parse(call[1].body);
        expect(actualBody.date_assemle).toBe(expected.date_assemle);
        expect(actualBody.date_start).toBe(expected.date_start);
        expect(actualBody.date_end).toBe(expected.date_end);
        
        cleanup();
      }
    });

    it('обрабатывает undefined в searchQuery и searchDealer', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TractorTable
          {...defaultProps}
          searchQuery={undefined}
          searchDealer={undefined}
        />
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const call = fetch.mock.calls[0];
      const actualBody = JSON.parse(call[1].body);
      expect(actualBody.query).toBe('');
      expect(actualBody.dealer).toBe('');
    });

    it('обрабатывает пустую строку в searchQuery и searchDealer', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TractorTable
          {...defaultProps}
          searchQuery="   "
          searchDealer="   "
        />
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const call = fetch.mock.calls[0];
      const actualBody = JSON.parse(call[1].body);
      expect(actualBody.query).toBe('');
      expect(actualBody.dealer).toBe('');
    });

    it('делает второй запрос за компонентами', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTractorData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockComponentsData });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1/search/tractor-components',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ vins: ['VIN123'] })
        })
      );
    });

    it('не делает запрос за компонентами если нет тракторов', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      expect(fetch).not.toHaveBeenCalledWith(
        'http://127.0.0.1/search/tractor-components',
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

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => tractorWithNullDates })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

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

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => tractorWithUndefinedDates })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

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
        DVS: 'MotorX',
        KPP: 'GearBoxY',
        RK: 'SuspensionZ',
        BK: 'ControllerW',
        GR: '-',
        AP: '-',
        dealer: 'Дилер Сибирь'
      }];

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => tractorWithAltFields })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ALT123')).toBeInTheDocument();
      });

      expect(screen.getByText('MotorX')).toBeInTheDocument();
      expect(screen.getByText('GearBoxY')).toBeInTheDocument();
      expect(screen.getByText('Дилер Сибирь')).toBeInTheDocument();
    });

    it('сортирует тракторы по VIN', async () => {
      const unsortedTractors = [
        { ...mockTractorData[0], vin: 'VIN3' },
        { ...mockTractorData[0], vin: 'VIN1' },
        { ...mockTractorData[0], vin: 'VIN2' }
      ];

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => unsortedTractors })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('VIN1');
        expect(rows[2]).toHaveTextContent('VIN2');
        expect(rows[3]).toHaveTextContent('VIN3');
      });
    });

    it('обрабатывает случай, когда нет данных о тракторах', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      render(<TractorTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('VIN123')).not.toBeInTheDocument();
      });

      const rows = screen.queryAllByRole('row');
      expect(rows.length).toBe(1);
    });
  });
});