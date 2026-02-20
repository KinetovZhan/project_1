import React, { useState } from 'react';
import { Header } from '../Function/Header';
import '../cssfiles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../fetchAPI.js';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [authorizationError, setAuthorizationError] = useState('');
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthorizationError('');

    if (!login || !password) {
      setAuthorizationError('Введите логин и пароль');
      return;
    }

      const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', login);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    console.log('Отправка запроса на /token/');
    console.log('Данные:', formData.toString());

  
    try {
  const response = await fetch('http://192.168.0.102:8000/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  const data = await response.json();
  console.log('Ответ сервера:', data);
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  if (data.access_token) {
    try {
      loginContext(data.access_token);
      navigate('/main', { replace: true });
    } catch (err) {
      console.error('Ошибка при сохранении токена:', err);
      setAuthorizationError('Ошибка при входе: ' + err.message);
    }
  } else {
    setAuthorizationError('Сервер не вернул токен');
  }
} catch (error) {
  console.error('Ошибка при авторизации:', error);
  setAuthorizationError(error.message);
}
  }
  return (
    <>
      <Header />
      <main className="login-main">
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Вход в систему</h2>
            {authorizationError && (
              <div className="error-message">{authorizationError}</div>
            )}
            <div className="login-form-group">
              <label htmlFor="login-input">Логин</label>
              <input
                id="login-input"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
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
                placeholder="Введите пароль"
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