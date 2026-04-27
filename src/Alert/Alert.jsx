import React, { createContext, useContext, useState, useEffect } from 'react';
import './Alert.css';

const Alert = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    // Ждем окончания анимации перед удалением компонента
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // 300ms - время анимации исчезновения
  };

  if (!isVisible) return null;

  return (
    <div className="alert-overlay">
      <div className={`alert-container alert-${type} ${isClosing ? 'alert-closing' : 'alert-opening'}`}>
        <div className="alert-content">
          <div className="alert-icon">
            {type === 'success' && '🗹'}
            {type === 'error' && '⌧'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </div>
          <div className="alert-message">{message}</div>
        </div>
      </div>
    </div>
  );
};

// // Хук для управления алертом
// export const useAlert = () => {
//   const [alert, setAlert] = useState(null);

//   const showAlert = (message, type = 'success', duration = 3000) => {
//     setAlert({ message, type, duration });
//   };

//   const hideAlert = () => {
//     setAlert(null);
//   };

//   const AlertComponent = alert ? (
//     <Alert
//       message={alert.message}
//       type={alert.type}
//       duration={alert.duration}
//       onClose={hideAlert}
//     />
//   ) : null;

//   return { showAlert, hideAlert, AlertComponent };
// };

// export default Alert;

// Создаем контекст
const AlertContext = createContext(null);

// Провайдер для всего приложения
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success', duration = 3000) => {
    setAlert({ message, type, duration });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          duration={alert.duration}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

// Хук для использования
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export default Alert;