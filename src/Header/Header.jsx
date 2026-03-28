import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';
import { useEffect, useState } from 'react';
import icon from '../img/icon.png';

export function Header({ onLogout, onHelp, onKnowledgeBase, isMobileSidebarOpen, toggleMobileSidebar }) {
  const isMobile = useCheckMobile();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const userRole = user?.role || 'user';
  const isModerator = userRole === 'moderator';
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [error, setError] = useState('')

  const handleMainPage = () => {
    navigate('/main');
  }


  useEffect(() => {
    if(!token) {
      console.log("Пользователь не авторизован")
      setHasUnreadMessages(false)
      return
    }

    const fetchUnread = async () => {
      try{
        if(isModerator){
          let data = await api.get('/support/support/unread-count')
          console.log(data)
          if (data.unread_count !== 0 ){
            setHasUnreadMessages(true)
          }else{setHasUnreadMessages(false)}
        } else {
          let data = await api.get('/support/unread/replies-count')
          if(data.unread_replies_count !== 0){
            setHasUnreadMessages(true)
          }else {
            setHasUnreadMessages(false)
          }
        }
      } catch (err){
        setError('Ошибка загрузки cчетчика непрочитанных сообщений', err);
      }
    }

    fetchUnread()

  },[token, navigate])


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
      
      {/* <div className='icon-ptz'>
        <img
          className="object-pi"
          src={icon}
          alt={icon}
        /> 
      </div> */}
      <div className='mainText'>
        <h3 onClick={handleMainPage}>Сервис просмотра версий ПО</h3>
      </div>
      
      <div className='navigation'>
        <h3 onClick={onKnowledgeBase} style={{cursor: 'pointer'}}>База знаний</h3>
        <h3 onClick={onHelp} 
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          >
          Помощь
          {hasUnreadMessages && (
            <span style={{
              width: '10px',
              height: '10px',
              backgroundColor: 'red',
              borderRadius: '50%',
              display: 'inline-block',
              marginTop: '-8px'
            }} />
          )}
        </h3>
        {onLogout && (
          <h3 onClick={onLogout} style={{cursor: 'pointer'}}>Выйти</h3>
        )}
      </div>
      <div className='icon-ptz'>
        <img
          className="object-pi"
          src={icon}
          alt={icon}
        /> 
      </div>
    </header>
  )
}