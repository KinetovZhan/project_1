import React, { useState } from 'react';
import { Header } from '../Func';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { login, password });
    
    if (login && password) {
      navigate('/main');
    } else {
      alert('Введите логин и пароль');
    }
  };

  return (
    <>
      <Header/>
      
      <main className="login-main">
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Вход в систему</h2>
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