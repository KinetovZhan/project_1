// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // Импортируем роутер
import './index.css';

// Импортируем наши страницы
import App from './App.jsx'; // Основная страница
import LoginPage from './Login/LoginPage.jsx'; // Страница логина (мы её создадим)

// Создаём конфигурацию маршрутов
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Основной интерфейс по пути "/"
  },
  {
    path: "/login",
    element: <LoginPage />, // Страница логина по пути "/login"
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);