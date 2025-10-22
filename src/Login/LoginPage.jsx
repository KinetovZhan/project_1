// src/Login/LoginPage.jsx
import React, { useState } from 'react';
import { Header } from '../Func'; // Используем ваш готовый Header
import './LoginPage.css'; // Стили только для формы

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { login, password });
    // Здесь будет ваша логика входа
    // Например: const success = await api.login(login, password);
    // if (success) { navigate('/'); }
  };

  return (
    <>
      {/* Используем ваш существующий Header без изменений */}
      <Header />
      
      {/* Основное содержимое страницы */}
      <main className="login-main">
        <div className="login-form-container">
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="login-input">Логин</label>
              <input
                id="login-input"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Value"
                required
              />
            </div>
            <div className="login-form-group">
              <label htmlFor="password-input">Пароль</label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Value"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Войти
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default LoginPage;