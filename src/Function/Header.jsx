import useCheckMobile from '../shrineofvsakoe/checkMobile.jsx';
import { useNavigate } from 'react-router-dom';

export function Header({ onLogout,onHelp }) {
  const isMobile = useCheckMobile();
  const navigate = useNavigate();

  const handleMainPage = (poID) => {
    navigate('/main');
  }

  return(
    <header className = "header">
      <div className='mainText'>
        <h3 onDoubleClick={handleMainPage}>Сервис просмотра версий ПО</h3>
      </div>
      <div className='navigation'>
        <h3 onClick={onHelp} style={{cursor: 'pointer'}}>Помощь</h3>
        {onLogout && (
          <h3 onClick={onLogout} style={{cursor: 'pointer'}}>Выйти</h3>
        )}
      </div>
    </header>
  )
}
