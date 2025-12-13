import React, { useState } from 'react';
import { Header } from '../Function/Header';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// const LoginPage = () => {
//   const [login, setLogin] = useState('');
 
//   const [password, setPassword] = useState('');
//   const [authorizationError, setAuthorizationError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setAuthorizationError('');

//     if (!login || !password) {
//       setAuthorizationError('Введите логин и пароль');
//       return;
//     }

//     const formData = new URLSearchParams();
//     formData.append('username', login);
//     formData.append('password', password);

//     try {
//       const response = await fetch('http://172.20.46.61/token', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: formData.toString(),
//       });

//       if (!response.ok) {
//         setAuthorizationError('Неверный логин или пароль');
//         return;
//       }

//       const data = await response.json();
//       // Сохраняем токен для последующих запросов
//       localStorage.setItem('access_token', data.access_token);
//       // Перенаправляем на главную страницу
//       navigate('/main');
//     } catch (error) {
//       console.error('Ошибка при авторизации:', error);
//       setAuthorizationError('Ошибка сети');
//     }
//   };

//   return (
//     <>
//       <Header />
//       <main className="login-main">
//         <div className="login-form-container">
//           <form onSubmit={handleSubmit} className="login-form">
//             <h2>Вход в систему</h2>
//             {authorizationError && (
//               <div className="error-message">{authorizationError}</div>
//             )}
//             <div className="login-form-group">
//               <label htmlFor="login-input">Логин</label>
//               <input
//                 id="login-input"
//                 type="text"
//                 value={login}
//                 onChange={(e) => setLogin(e.target.value)}
//                 placeholder="Введите логин"
                
//               />
//             </div>
//             <div className="login-form-group">
//               <label htmlFor="password-input">Пароль</label>
//               <input
//                 id="password-input"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Введите пароль"
                
//               />
//             </div>
//             <button type="submit" className="login-button">
//               Войти
//             </button>
//           </form>
//         </div>
//       </main>
//     </>
//   );
// };

// export default LoginPage;
const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [authorizationError, setAuthorizationError] = useState('');
  const navigate = useNavigate();
  const { login: loginContext } = useAuth(); // ← деструктуризация метода входа
  const ip = '172.20.46.61:8000';

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

    try {
      const response = await fetch(`http://${ip}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAuthorizationError(
          errorData.detail || 'Неверный логин или пароль'
        );
        return;
      }

      const data = await response.json();

      //  Используем login из контекста вместо ручного localStorage.setItem
      if (data.access_token) {
        loginContext(data.access_token); // ← сохраняет токен + обновляет состояние
        navigate('/main', { replace: true }); // replace — чтобы нельзя было вернуться назад на /login по кнопке "Назад"
      } else {
        setAuthorizationError('Сервер не вернул токен');
      }
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setAuthorizationError('Ошибка сети. Проверьте подключение.');
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