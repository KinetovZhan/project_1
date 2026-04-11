// 1. Импортируем jest-dom
import '@testing-library/jest-dom/vitest';

// 2. Мокаем ВСЕ зависимости ДО импорта MainPage
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    logout: vi.fn(), 
    user: { sub: 'test-user' } 
  })),
}));

vi.mock('../Header/Header.jsx', () => ({
  Header: () => <div>Header</div>
}));

vi.mock('../Sidebar/Sidebar.jsx', () => ({
  Sidebar: () => <div>Sidebar</div>
}));

vi.mock('../MainPart/MainPart.jsx', () => ({
  MainPart: () => <div>MainPart</div>
}));

vi.mock('../AddPo/AddPo.jsx', () => ({
  AddPoForm: () => <div>AddPoForm</div>
}));

vi.mock('../AddUzel/AddAgg.jsx', () => ({
  AddAggForm: () => <div>AddAggForm</div>
}));

// 3. Импортируем MainPage ПОСЛЕ всех моков
import { render, screen } from '@testing-library/react';
import React from 'react';
import MainPage from '../MainPage/mainpage.jsx';

// 4. Простой тест
test('рендерит без ошибок', () => {
  expect(() => render(<MainPage />)).not.toThrow();
});