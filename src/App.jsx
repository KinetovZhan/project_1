import { useState } from 'react'
import './App.css'
import LoginPage from './Login/LoginPage'
import MainPage from './components/mainpage'
import { Routes, Route, Navigate } from 'react-router-dom'; // ← ДОБАВЬТЕ этот импорт


function App() {

  return (
  <Routes>
    <Route path="/login" element={<LoginPage />} />      // Страница логина
    <Route path="/main" element={<MainPage />} />        // Главная страница
    <Route path="/" element={<Navigate to="/login" replace />} />  // Перенаправление
  </Routes>

  )
}

export default App;