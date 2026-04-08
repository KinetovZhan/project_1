import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { TractorDetails } from '../TractorDetails/TractorDetails';

// Мокаем изображения
vi.mock('../img/default.jpg', () => ({ default: 'default-image-mock' }));
vi.mock('../img/К5.png', () => ({ default: 'k5-image-mock' }));
vi.mock('../img/К7М.png', () => ({ default: 'k7-image-mock' }));

// Мокаем useAuth
vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }));

// Мокаем fetchAPI.js
vi.mock('../fetchAPI.js', () => ({
  api: { get: vi.fn(), post: vi.fn(), request: vi.fn() },
  buildApiUrl: (path) => `http://localhost:3000${path}`,
  API_BASE_URL: 'http://localhost:3000',
}));

// Мокаем PoDetails
vi.mock('../PoDetails/PoDetails.jsx', () => ({
  PoDetails: vi.fn(({ po, onBack }) => (
    <div data-testid="po-details-mock">
      <span>PoDetails для {po?.id_Firmwares}</span>
      <button onClick={onBack}>Назад из ПО</button>
    </div>
  ))
}));

import { useAuth } from '../auth/AuthContext';
import { api } from '../fetchAPI.js';

describe('TractorDetails', () => {
  const mockToken = 'test-token';
  const mockVin = 'TEST123456789';
  const mockOnBack = vi.fn();

  const mockTractorData = [
    {
      vin: 'TEST123456789',
      model: 'K-5',
      assembly_date: '2024-01-15T00:00:00.000Z',
      region: 'Московская область',
      oh_hour: 150,
      last_activity: '2024-03-20T10:30:00.000Z',
      consumer: 'ООО Рога и Копыта',
      dealer: 'Дилер'
    },
    {
      vin: 'TEST123456789',
      component_type: 'ДВС',
      comp_model: 'CUMMINS QSB6.7',
      recommend_sw_version: 'v2.1.0',
      description: 'Двигатель Cummins с системой common rail',
      component_id: 101,
      current_sw_version: 501
    },
    {
      vin: 'TEST123456789',
      component_type: 'КПП',
      comp_model: 'ZF 16S-2220',
      recommend_sw_version: 'v1.5.2',
      description: 'Механическая коробка передач',
      component_id: 102,
      current_sw_version: 502
    },
    {
      vin: 'TEST123456789',
      component_type: 'БК',
      comp_model: 'БК-03',
      recommend_sw_version: 'v3.0.1',
      description: 'Бортовой контроллер',
      component_id: 103,
      current_sw_version: 503
    }
  ];

  const renderWithRouter = (ui, { initialEntries = ['/'], ...options } = {}) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
      options
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: mockToken });
    api.get.mockReset();
  });

  afterEach(() => cleanup());

  describe('Rendering states', () => {
    it('should show loading state when fetching data', () => {
      api.get.mockImplementationOnce(() => new Promise(() => {}));
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      expect(screen.getByText(/Загрузка деталей трактора/i)).toBeInTheDocument();
      expect(screen.getByText(`VIN: ${mockVin}`)).toBeInTheDocument();
    });

    it('should show error when no VIN provided', async () => {
      renderWithRouter(<TractorDetails vin={null} onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByText('VIN не указан')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Назад к списку/i })).toBeInTheDocument();
    });

    it('should show error when fetch fails', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByText(/Ошибка: Network error/i)).toBeInTheDocument();
      });
    });

    it('should show error when response is empty array', async () => {
      api.get.mockResolvedValueOnce([]);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByText('Данные по трактору не найдены')).toBeInTheDocument();
      });
    });
  });

  describe('Successful data loading', () => {
    beforeEach(() => { api.get.mockResolvedValueOnce(mockTractorData); });

    it('should render tractor details correctly', async () => {
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /K-5/ })).toBeInTheDocument();
      });
      const dateSection = screen.getByText(/Дата выпуска/).closest('.section');
      expect(dateSection).toHaveTextContent(/2024/);
      expect(screen.getByText('Московская область')).toBeInTheDocument();
      const lastActivitySection = screen.getByText(/Дата последней эксплуатации/).closest('.section');
      expect(lastActivitySection).toHaveTextContent(/2024/);
      
      // 🔧 Исправлено: ищем 150 внутри конкретной секции "Кол-во МЧ"
      const ohHourSection = screen.getByText(/Кол-во МЧ/).closest('.section');
      expect(ohHourSection).toHaveTextContent('150');
    });

    it('should render tractor image based on model', async () => {
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        const image = screen.getByAltText('K-5');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'k5-image-mock');
      });
    });

    it('should render default image for unknown model', async () => {
      const dataWithUnknownModel = [{ ...mockTractorData[0], model: 'Unknown' }, ...mockTractorData.slice(1)];
      api.get.mockReset();
      api.get.mockResolvedValueOnce(dataWithUnknownModel);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        const image = screen.getByAltText('Unknown');
        expect(image).toHaveAttribute('src', 'default-image-mock');
      });
    });

    it('should render components/PO list correctly', async () => {
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByText(/ДВС:/)).toBeInTheDocument();
        expect(screen.getByText('v2.1.0')).toBeInTheDocument();
        expect(screen.getByText('(CUMMINS QSB6.7)')).toBeInTheDocument();
        expect(screen.getByText(/КПП:/)).toBeInTheDocument();
        expect(screen.getByText('v1.5.2')).toBeInTheDocument();
        expect(screen.getByText(/БК:/)).toBeInTheDocument();
        expect(screen.getByText('v3.0.1')).toBeInTheDocument();
      });
    });

    it('should show placeholder components when no data', async () => {
      api.get.mockReset();
      api.get.mockResolvedValueOnce([mockTractorData[0]]);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByText(/ДВС:/)).toBeInTheDocument();
        expect(screen.getByText(/КПП:/)).toBeInTheDocument();
        expect(screen.getByText(/РК:/)).toBeInTheDocument();
        expect(screen.getByText(/БК:/)).toBeInTheDocument();
        expect(screen.getByText(/ГР:/)).toBeInTheDocument();
        expect(screen.getByText(/Автопилот:/)).toBeInTheDocument();
        const dashes = screen.getAllByText('-');
        expect(dashes.length).toBeGreaterThanOrEqual(6);
      });
    });
  });

  describe('Tooltip functionality', () => {
    beforeEach(async () => {
      api.get.mockResolvedValueOnce(mockTractorData);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByRole('heading', { name: /K-5/ })).toBeInTheDocument());
    });

    it('should show tooltip when hovering on component', () => {
      const componentItem = screen.getByText(/ДВС:/).closest('.po-item');
      fireEvent.mouseEnter(componentItem);
      expect(screen.getByText('Двигатель Cummins с системой common rail')).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
      const componentItem = screen.getByText(/ДВС:/).closest('.po-item');
      fireEvent.mouseEnter(componentItem);
      expect(screen.getByText('Двигатель Cummins с системой common rail')).toBeInTheDocument();
      fireEvent.mouseLeave(componentItem);
      expect(screen.queryByText('Двигатель Cummins с системой common rail')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      api.get.mockResolvedValueOnce(mockTractorData);
      // 🔧 Исправлено: получаем container из render для доступа к кнопке по классу
      const { container } = renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByRole('heading', { name: /K-5/ })).toBeInTheDocument());
      
      // 🔧 Исправлено: ищем кнопку по классу, т.к. у неё нет accessible name
      const backButton = container.querySelector('.go-back');
      expect(backButton).toBeInTheDocument();
      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when clicking "Назад к списку" on error screen', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText(/Ошибка: Network error/i)).toBeInTheDocument());
      const backButton = screen.getByRole('button', { name: /Назад к списку/i });
      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('API calls', () => {
    it('should call api.get with correct URL', async () => {
      api.get.mockResolvedValueOnce(mockTractorData);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
      expect(api.get).toHaveBeenCalledWith(
        `search/search-tractor-vin?request=${encodeURIComponent(mockVin)}`
      );
    });

    it('should not call api.get when vin is null', async () => {
      renderWithRouter(<TractorDetails vin={null} onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('VIN не указан')).toBeInTheDocument());
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional fields gracefully', async () => {
      const incompleteData = [{ vin: 'TEST123', model: 'K-5' }];
      api.get.mockResolvedValueOnce(incompleteData);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByRole('heading', { name: /K-5/ })).toBeInTheDocument());
      expect(screen.getByText(/Дата выпуска/).closest('.section')).toHaveTextContent(/-/);
      expect(screen.getByText(/Регион эксплуатации/).closest('.section')).toHaveTextContent(/-/);
      expect(screen.getByText(/Кол-во МЧ/).closest('.section')).toHaveTextContent(/-/);
    });

    it('should handle components without version and model', async () => {
      const dataWithIncompleteComponents = [
        mockTractorData[0],
        { vin: 'TEST123', component_type: 'ГР' }
      ];
      api.get.mockReset();
      api.get.mockResolvedValueOnce(dataWithIncompleteComponents);
      renderWithRouter(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText(/ГР:/)).toBeInTheDocument());
      const versionSpan = screen.getByText(/ГР:/).closest('.po-item').querySelector('.po-item-version');
      expect(versionSpan).toHaveTextContent('-');
    });
  });
});