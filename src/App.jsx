import { useState } from 'react'
import './App.css'
import LoginPage from './Login/LoginPage'
import MainPage from './components/mainpage'
import { Routes, Route, Navigate } from 'react-router-dom'; 


function App() {

  return (
  <Routes>
    <Route path="/software_vis/login" element={<LoginPage />} />
    <Route path="/software_vis/main" element={<MainPage />} />
    <Route path="/software_vis/" element={<Navigate to="/software_vis/login" replace />} />
  </Routes>

  )
}

export default App;