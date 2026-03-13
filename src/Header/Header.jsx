import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { useNavigate } from 'react-router-dom';

export function Header({ onLogout, onHelp, onKnowledgeBase, isMobileSidebarOpen, toggleMobileSidebar }) {
  const isMobile = useCheckMobile();
  const navigate = useNavigate();

  const handleMainPage = () => {
    navigate('/main');
  }

  return (
    <header className="header">
      {isMobile && (
        <button
          className={`mobile-sidebar ${isMobileSidebarOpen ? 'active' : ''}`}
          onClick={toggleMobileSidebar}
        >
            <svg 
              width="25" 
              height="21" 
              viewBox="0 0 25 21" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="0" width="25" height="3" fill="white"/>
              <rect y="9" width="25" height="3" fill="white"/>
              <rect y="18" width="25" height="3" fill="white"/>
            </svg>
        </button>
      )}
      
      <div className='mainText'>
        <h3 onClick={handleMainPage}>Сервис просмотра версий ПО</h3>
      </div>
      
      <div className='navigation'>
        <h3 onClick={onKnowledgeBase} style={{cursor: 'pointer'}}>База знаний</h3>
        <h3 onClick={onHelp} style={{cursor: 'pointer'}}>Помощь</h3>
        {onLogout && (
          <h3 onClick={onLogout} style={{cursor: 'pointer'}}>Выйти</h3>
        )}
      </div>
    </header>
  )
}