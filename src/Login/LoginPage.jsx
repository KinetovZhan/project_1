import React, { useState } from 'react';
import { Header } from '../Function/Header';
import '../cssfiles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../fetchAPI.js'; // Импортируем единый экземпляр api

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
    formData.append('username', login);
    formData.append('password', password);

    console.log('Отправка запроса на /token/');
    console.log('Данные:', formData.toString());

    try {
      // Используем api.request с переопределёнными заголовками и skipAuth
      const data = await api.request('/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        skipAuth: true, // флаг, чтобы не добавлять токен (если он уже есть в localStorage)
      });

      console.log('Полученные данные:', data);

      if (data.access_token) {
        loginContext(data.access_token);
        navigate('/main', { replace: true });
      } else {
        setAuthorizationError('Сервер не вернул токен');
      }
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setAuthorizationError(error.message || 'Ошибка сети. Проверьте подключение.');
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