import {useNavigate} from 'react-router-dom';
import { useEffect } from 'react';
import HelpImage from '../img/помощь.jpg';
export function HelpPage () {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  }

  // 👇 ДОБАВЛЯЕМ ОБРАБОТЧИК ESCAPE
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape нажата, возвращаемся назад');
        handleBack(); // Используем ту же функцию, что и для кнопки
      }
    };

    window.addEventListener('keydown', handleEscKey);
      
    // Убираем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [handleBack]); // Зависимость от handleBack
   
   return <div className = "formHelp">
        <button onClick={handleBack} className="add-po-back-button">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className = "textHelp">
          В разработке
          </div>
      
      </div>; 
}
