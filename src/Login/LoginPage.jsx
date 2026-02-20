import React, { useState } from 'react';
import { Header } from '../Function/Header';
import '../cssfiles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api, buildApiUrl, API_BASE_URL } from '../fetchAPI.js';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [authorizationError, setAuthorizationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthorizationError('');

    if (!login || !password) {
      setAuthorizationError('Введите логин и пароль');
      return;
    }

    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', login);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    // Подробное логирование
    const fullUrl = buildApiUrl('/token/');
    console.log('=== ДЕТАЛИ ЗАПРОСА ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Полный URL:', fullUrl);
    console.log('Метод:', 'POST');
    console.log('Данные:', formData.toString());
    console.log('Content-Type:', 'application/x-www-form-urlencoded');
    console.log('======================');

    try {
      const data = await api.request('/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        skipAuth: true,
      });

      console.log('Полученные данные:', data);

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
    } finally {
      setIsLoading(false);
    }
  };

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
                disabled={isLoading}
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
                disabled={isLoading}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default LoginPage;