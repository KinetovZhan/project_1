import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { TractorDetails } from '../Function/TractorDetails';

// Мокаем изображения
vi.mock('../img/default.jpg', () => ({
  default: 'default-image-mock'
}));

vi.mock('../img/К5.png', () => ({
  default: 'k5-image-mock'
}));

vi.mock('../img/К7М.png', () => ({
  default: 'k7-image-mock'
}));

// Мокаем useAuth
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Мокаем ip
vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: 'localhost:3000'
}));

import { useAuth } from '../auth/AuthContext';
import { ip } from '../shrineofvsakoe/ip.jsx';

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
      last_activity: '2024-03-20T10:30:00.000Z'
    },
    {
      vin: 'TEST123456789',
      component_type: 'ДВС',
      comp_model: 'CUMMINS QSB6.7',
      recommend_sw_version: 'v2.1.0',
      description: 'Двигатель Cummins с системой common rail'
    },
    {
      vin: 'TEST123456789',
      component_type: 'КПП',
      comp_model: 'ZF 16S-2220',
      recommend_sw_version: 'v1.5.2',
      description: 'Механическая коробка передач'
    },
    {
      vin: 'TEST123456789',
      component_type: 'БК',
      comp_model: 'БК-03',
      recommend_sw_version: 'v3.0.1',
      description: 'Бортовой контроллер'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      token: mockToken
    });

    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  describe('Rendering states', () => {
    it('should show loading state when fetching data', () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {}));
      
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      expect(screen.getByText(/Загрузка деталей трактора/i)).toBeInTheDocument();
      expect(screen.getByText(`VIN: ${mockVin}`)).toBeInTheDocument();
    });

    it('should show error when no VIN provided', async () => {
      render(<TractorDetails vin={null} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('VIN не указан')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /Назад к списку/i })).toBeInTheDocument();
    });

    it('should show error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Ошибка: Network error/i)).toBeInTheDocument();
      });
    });

    it('should show error when response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      });
      
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Ошибка HTTP: 404/i)).toBeInTheDocument();
      });
    });

    it('should show error when no data found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });
      
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('Данные по трактору не найдены')).toBeInTheDocument();
      });
    });
  });

  describe('Successful data loading', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTractorData)
      });
    });

    it('should render tractor details correctly', async () => {
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('K-5')).toBeInTheDocument();
      });

      // Проверяем, что даты отображаются (в любом формате)
      const dateSection = screen.getByText(/Дата выпуска/).parentElement;
      expect(dateSection).toHaveTextContent(/2024/);
      
      expect(screen.getByText('Московская область')).toBeInTheDocument();
      
      const lastActivitySection = screen.getByText(/Дата последней эксплуатации/).parentElement;
      expect(lastActivitySection).toHaveTextContent(/2024/);
      expect(lastActivitySection).toHaveTextContent(/150/);
    });

    it('should render tractor image based on model', async () => {
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        const image = screen.getByAltText('K-5');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'k5-image-mock');
      });
    });

    it('should render default image for unknown model', async () => {
      const dataWithUnknownModel = [
        { ...mockTractorData[0], model: 'Unknown' },
        ...mockTractorData.slice(1)
      ];

      global.fetch.mockReset();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(dataWithUnknownModel)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        const image = screen.getByAltText('Unknown');
        expect(image).toHaveAttribute('src', 'default-image-mock');
      });
    });

    it('should render components/PO list correctly', async () => {
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('ДВС:')).toBeInTheDocument();
        expect(screen.getByText('v2.1.0')).toBeInTheDocument();
        expect(screen.getByText('(CUMMINS QSB6.7)')).toBeInTheDocument();
        
        expect(screen.getByText('КПП:')).toBeInTheDocument();
        expect(screen.getByText('v1.5.2')).toBeInTheDocument();
        
        expect(screen.getByText('БК:')).toBeInTheDocument();
        expect(screen.getByText('v3.0.1')).toBeInTheDocument();
      });
    });

    it('should show placeholder components when no data', async () => {
      global.fetch.mockReset();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockTractorData[0]]) // Только трактор, без компонентов
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        // Проверяем, что отображаются все 6 компонентов-заглушек
        expect(screen.getByText('ДВС:')).toBeInTheDocument();
        expect(screen.getByText('КПП:')).toBeInTheDocument();
        expect(screen.getByText('РК:')).toBeInTheDocument();
        expect(screen.getByText('БК:')).toBeInTheDocument();
        expect(screen.getByText('ГР:')).toBeInTheDocument();
        expect(screen.getByText('Автопилот:')).toBeInTheDocument();
        
        // Проверяем, что версии - прочерки
        const dashes = screen.getAllByText('-');
        expect(dashes.length).toBeGreaterThanOrEqual(6);
      });
    });
  });

  describe('Tooltip functionality', () => {
    beforeEach(async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTractorData)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('K-5')).toBeInTheDocument();
      });
    });

    it('should show tooltip when clicking on component', () => {
      const componentItem = screen.getByText('ДВС:').closest('.po-item');
      fireEvent.click(componentItem);
      
      expect(screen.getByText('Двигатель Cummins с системой common rail')).toBeInTheDocument();
    });

    it('should hide tooltip when clicking on same component twice', () => {
      const componentItem = screen.getByText('ДВС:').closest('.po-item');
      
      fireEvent.click(componentItem);
      expect(screen.getByText('Двигатель Cummins с системой common rail')).toBeInTheDocument();
      
      fireEvent.click(componentItem);
      expect(screen.queryByText('Двигатель Cummins с системой common rail')).not.toBeInTheDocument();
    });

    it('should show different tooltip for different components', () => {
      const dvsItem = screen.getByText('ДВС:').closest('.po-item');
      const kppItem = screen.getByText('КПП:').closest('.po-item');
      
      fireEvent.click(dvsItem);
      expect(screen.getByText('Двигатель Cummins с системой common rail')).toBeInTheDocument();
      expect(screen.queryByText('Механическая коробка передач')).not.toBeInTheDocument();
      
      fireEvent.click(kppItem);
      expect(screen.getByText('Механическая коробка передач')).toBeInTheDocument();
      expect(screen.queryByText('Двигатель Cummins с системой common rail')).not.toBeInTheDocument();
    });

    it('should hide tooltip when clicking outside', () => {
      const componentItem = screen.getByText('ДВС:').closest('.po-item');
      
      fireEvent.click(componentItem);
      expect(screen.getByText('Двигатель Cummins с системой common rail')).toBeInTheDocument();
      
      fireEvent.click(document.body);
      
      expect(screen.queryByText('Двигатель Cummins с системой common rail')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTractorData)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('K-5')).toBeInTheDocument();
      });

      const backButton = screen.getAllByRole('button')[0];
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when clicking "Назад к списку" on error screen', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Ошибка: Network error/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Назад к списку/i });
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('API calls', () => {
    it('should call fetch with correct URL and headers', async () => {
      // Мокаем успешный ответ
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTractorData)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/search/search-tractor-vin?request=${encodeURIComponent(mockVin)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should not call fetch when vin is null', async () => {
      render(<TractorDetails vin={null} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('VIN не указан')).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional fields gracefully', async () => {
      const incompleteData = [
        {
          vin: 'TEST123',
          model: 'K-5',
          // Нет assembly_date, region, oh_hour, last_activity
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(incompleteData)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('K-5')).toBeInTheDocument();
      });

      // Проверяем прочерки в основных полях
      expect(screen.getByText(/Дата выпуска/).parentElement).toHaveTextContent(/-/);
      expect(screen.getByText(/Регион эксплуатации/).parentElement).toHaveTextContent(/-/);
      expect(screen.getByText(/Кол-во МЧ/).parentElement).toHaveTextContent(/-/);
    });

    it('should handle components without version and model', async () => {
      const dataWithIncompleteComponents = [
        mockTractorData[0],
        {
          vin: 'TEST123',
          component_type: 'ГР',
          // Нет comp_model, recommend_sw_version, description
        }
      ];

      global.fetch.mockReset();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(dataWithIncompleteComponents)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('ГР:')).toBeInTheDocument();
      });

      // Проверяем, что версия - прочерк
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('should handle dates in any locale format', async () => {
      // Мокаем успешный ответ с данными
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTractorData)
      });

      render(<TractorDetails vin={mockVin} onBack={mockOnBack} />);
      
      // Ждем загрузки данных
      await waitFor(() => {
        expect(screen.getByText('K-5')).toBeInTheDocument();
      });

      // Проверяем, что даты отображаются (не важно в каком формате)
      const dateSection = screen.getByText(/Дата выпуска/).parentElement;
      expect(dateSection).toHaveTextContent(/2024/);
      
      const lastActivitySection = screen.getByText(/Дата последней эксплуатации/).parentElement;
      expect(lastActivitySection).toHaveTextContent(/2024/);
      
      // Проверяем, что на странице нет ошибки
      expect(screen.queryByText(/Ошибка/)).not.toBeInTheDocument();
    });
  });
});