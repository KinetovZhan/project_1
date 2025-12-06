import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './AuthContext';

// export function ProtectedRoute({ children }) {
//   const token = localStorage.getItem('access_token');

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   try {
//     const decoded = jwtDecode(token);
//     const isExpired = decoded.exp * 1000 < Date.now(); // exp в секундах → переводим в миллисекунды

//     if (isExpired) {
//       localStorage.removeItem('access_token'); // очищаем просроченный токен
//       return <Navigate to="/login" replace />;
//     }
//   } catch (error) {
//     // Если токен повреждён — тоже перенаправляем
//     localStorage.removeItem('access_token');
//     return <Navigate to="/login" replace />;
//   }


//   return children;
// }
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Опционально: показать спиннер, но можно и просто ничего не рендерить
    return null; // или <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}