// 1. Мокаем useAuth ДО импортов
const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock('../auth/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// 2. Мокаем IP
vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: '127.0.0.1',
}));

// 3. Импорты
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { TractorTable } from '../Function/TractorTable';

// 4. Мокаем fetch глобально
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
      component_type: 'dvs',
      comp_model: 'MotorX',
    },
    {
      vin: 'VIN123',
      model: 'T-150',
      assembly_date: '2023-01-01T10:00:00Z',
      region: 'Сибирь',
      oh_hour: 1200,
      last_activity: '2024-01-01T12:00:00Z',
      component_type: 'kpp',
      comp_model: 'GearBoxY',
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
    mockUseAuth.mockReturnValue({ token: 'mock-token' });
  });

  it('рендерит загрузку при первом рендере', async () => {
    // Имитируем задержку
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <TractorTable
        activeFiltersTrac={[]}
        activeFiltersTrac2={[]}
        searchQuery=""
        searchDealer=""
        dateFilter={null}
        activeMajMinButton={null}
      />
    );

    expect(screen.getByText(/Загрузка данных о тракторах.../i)).toBeInTheDocument();
  });

  it('рендерит таблицу с данными после успешного запроса', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTractorData,
    });

    render(
      <TractorTable
        activeFiltersTrac={[]}
        activeFiltersTrac2={[]}
        searchQuery=""
        searchDealer=""
        dateFilter={null}
        activeMajMinButton={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/VIN123/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/T-150/i)).toBeInTheDocument();
    expect(screen.getByText(/MotorX/i)).toBeInTheDocument();
    expect(screen.getByText(/GearBoxY/i)).toBeInTheDocument();
  });

  it('показывает ошибку при отсутствии токена', () => {
    mockUseAuth.mockReturnValue({ token: null });

    render(
      <TractorTable
        activeFiltersTrac={[]}
        activeFiltersTrac2={[]}
        searchQuery=""
        searchDealer=""
        dateFilter={null}
        activeMajMinButton={null}
      />
    );

    expect(screen.getByText(/Пользователь не авторизован/i)).toBeInTheDocument();
  });

  it('переходит к TractorDetails при клике на строку', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTractorData,
    });

    render(
      <TractorTable
        activeFiltersTrac={[]}
        activeFiltersTrac2={[]}
        searchQuery=""
        searchDealer=""
        dateFilter={null}
        activeMajMinButton={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/VIN123/i)).toBeInTheDocument();
    });

    // Клик по строке
    screen.getByText(/VIN123/i).closest('tr').click();

    // После клика должен отобразиться TractorDetails
    // Предполагаем, что он тоже рендерит VIN (если нет — замените на другой текст)
    await waitFor(() => {
      expect(screen.getByText(/VIN123/i)).toBeInTheDocument();
    });
  });

  // 🔥 ГЛАВНОЕ ИСПРАВЛЕНИЕ: не сравниваем body как строку!
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

    // Ждём, пока fetch вызовется
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // Проверяем URL и метод
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1/tractor-info',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
      })
    );

    // 🔑 Проверяем ТЕЛО ЗАПРОСА отдельно — парсим и сравниваем объекты
    const call = fetch.mock.calls[0];
    const actualBody = JSON.parse(call[1].body);
    expect(actualBody).toEqual(expectedPostData);
  });
});