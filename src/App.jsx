import { useState } from 'react'
import './App.css'
import LoginPage from './Login/LoginPage'
import MainPage from './components/mainpage'
import { Routes, Route, Navigate } from 'react-router-dom'; 


function App() {

  return (
  <Routes>
    <Route path="//login" element={<LoginPage />} />
    <Route path="//main" element={<MainPage />} />
    <Route path="/" element={<Navigate to="/login" replace />} />
  </Routes>

  )
}

export default App;