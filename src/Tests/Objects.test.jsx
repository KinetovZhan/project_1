

const mockUseAuth = vi.hoisted(() => vi.fn());


vi.mock('../auth/AuthContext', () => ({
    useAuth : mockUseAuth
}));


vi.mock('../shrineofvsakoe/ip.jsx', () => ({
  ip: '127.0.0.1'
}));

vi.mock('../img/Image.png', () => ({
    default: 'test-image.png'
}));

import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import React from 'react';
import { Objects } from '../Function/Objects';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';


global.fetch = vi.fn()

describe('Objects', () => {
    const mockToken = 'test-token-123';
    const mockSoftwareItems = [
        {
            id_Firmwares: 1,
            producer_version: 'VER_1.0',
            release_date: '2024-01-15',
            type_component: 'engine',
            model_component: 'DVS-500',
            comp_model: 'Model-A',
            download_link: 'http://example.com/file1.zip'
        },
        {
            id_Firmwares: 2,
            producer_version: 'VER_2.0',
            release_date: '2024-02-20',
            type_component: 'transmission',
            model_component: 'KPP-300',
            comp_model: 'Model-B',
            download_link: 'http://example.com/file2.zip'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ token: mockToken });
    });


    it('проверяет рендер objects', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockSoftwareItems)
        })

        await act(async () => {
        render(
            <Objects 
                activeFilters={[]}
                activeFilters2={[]}
                selectedModel={[]}
                searchQuery=""
            />
            );
        });
        

        await waitFor(() => {
            expect(screen.getAllByTestId('objectmenu')).toHaveLength(2); // Два элемента
    });
    });
    it('проверяет ошибку при рендер objects', async () => {
        mockUseAuth.mockReturnValue({ token: null})

        await act(async () => {
        render(
            <Objects 
                activeFilters={[]}
                activeFilters2={[]}
                selectedModel={[]}
                searchQuery=""
            />
            );
        });
        

        await waitFor(() => {
            expect(screen.getByText('Пользователь не авторизован')).toBeInTheDocument(); 
    });
    });
    it('показывает ошибку при HTTP запросе', async() => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        await act(async () => {
        render(
            <Objects 
                activeFilters={[]}
                activeFilters2={[]}
                selectedModel={[]}
                searchQuery=""
            />
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/Ошибка: HTTP error! status: 500/i)).toBeInTheDocument();
        })
    })

    it('проверяет что фильтры правильно передают запрос ', async() => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockSoftwareItems)
        })
        global.fetch = fetchSpy

    
        await act(async () => {
            render(
                <Objects 
                    activeFilters={[ 'DVS', 'KPP' ]}
                    activeFilters2={[]}
                    selectedModel={[]}
                />
            )
        });
        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);

        expect(requestBody.type_comp).toEqual([ 'engine', 'transmission'])
        expect(requestBody.trac_model).toEqual([]);
        expect(requestBody.model_comp).toEqual([]);
    })


    it('проверяет что фильтры правильно передают запрос на трактор', async() => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockSoftwareItems)
        })
        global.fetch = fetchSpy;
        await act(async () => {
            render(<Objects
                activeFilters={[]}
                activeFilters2={['K-7', 'K-5']}
                selectedModel={[]}
                searchQuery=''
            />);
        })
        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        },{timeout: 2000});

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);

        await waitFor(() => {
            expect(requestBody.type_comp).toEqual([])
            expect(requestBody.trac_model).toEqual(['K-7', 'K-5'])
            expect(requestBody.model_comp).toEqual([])
        });
    })

})