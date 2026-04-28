import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';
import { useEffect, useState, useRef } from 'react';
import icon from '../img/icon.png';

export function Header({ onLogout, onHelp, onKnowledgeBase, isMobileSidebarOpen, toggleMobileSidebar }) {
  const isMobile = useCheckMobile();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const userRole = user?.role || 'user';
  const isModerator = userRole === 'moderator';
  const isDealer = userRole === 'dealer';

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [dealerUnreadCount, setDealerUnreadCount] = useState(0);
  const [error, setError] = useState('');

  // State для дропдауна уведомлений
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const dropdownRef = useRef(null);

  const handleMainPage = () => {
    navigate('/main');
  };

  // Получение количества непрочитанных уведомлений дилера
  const fetchDealerUnreadCount = async () => {
    try {
      const data = await api.get('/notifications/unread-count');
      setDealerUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Ошибка загрузки уведомлений дилера:', err);
      setDealerUnreadCount(0);
    }
  };

  // Загрузка списка уведомлений (последние 10)
  const loadNotifications = async () => {
    if (!isDealer) return;
    setLoadingNotif(true);
    try {
      const data = await api.get('/notifications?limit=10');
      setNotifications(data || []);
    } catch (err) {
      console.error('Ошибка загрузки списка уведомлений:', err);
    } finally {
      setLoadingNotif(false);
    }
  };

  // Отметить уведомление как прочитанное
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      // Обновить список: изменить is_read у соответствующего уведомления
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      // Обновить общий счётчик непрочитанных
      fetchDealerUnreadCount();
    } catch (err) {
      console.error('Ошибка отметки прочитанным:', err);
    }
  };

  // Удаление уведомления
 // Удаление уведомления
const deleteNotification = async (notificationId, event) => {
  event.stopPropagation();
  try {
    await api.delete(`/notifications/${notificationId}`);
    await Promise.all([
      fetchDealerUnreadCount(),
      loadNotifications()
    ]);
  } catch (err) {
    console.error('Ошибка удаления уведомления:', err);
  }
};
  // Эффект для обработки клика вне дропдауна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // При открытии дропдауна – загружаем свежие уведомления
  useEffect(() => {
    if (dropdownOpen && isDealer) {
      loadNotifications();
    }
  }, [dropdownOpen, isDealer]);

  // Загрузка счётчиков при монтировании и изменении токена/роли
  useEffect(() => {
    if (!token) {
      console.log('Пользователь не авторизован');
      setHasUnreadMessages(false);
      setDealerUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        if (isModerator) {
          let data = await api.get('/support/unread-count');
          console.log(data);
          setHasUnreadMessages(data.unread_count !== 0);
        } 
      } catch (err) {
        setError('Ошибка загрузки счетчика непрочитанных сообщений', err);
      }
    };

    fetchUnread();

    if (isDealer) {
      fetchDealerUnreadCount();
    } else {
      setDealerUnreadCount(0);
    }
  }, [token, navigate, isDealer, isModerator, userRole]);

  const roleMap = () => {
    if (userRole === 'moderator') return 'модератор';
    if (userRole === 'dealer') return 'дилер';
    if (userRole === 'engineer') return 'инженер';
    return userRole;
  };

  // Форматирование даты для отображения
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="header">
      {isMobile && (
        <button
          className={`mobile-sidebar ${isMobileSidebarOpen ? 'active' : ''}`}
          onClick={toggleMobileSidebar}
        >
          <svg width="25" height="21" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="0" width="25" height="3" fill="white" />
            <rect y="9" width="25" height="3" fill="white" />
            <rect y="18" width="25" height="3" fill="white" />
          </svg>
        </button>
      )}

      <div className="mainText">
        <h3 onClick={handleMainPage}>Сервис просмотра версий ПО</h3>
      </div>

      <div className="navigation">
        {onLogout?
        (<h3 onClick={onKnowledgeBase} style={{ cursor: 'pointer' }}>База знаний</h3>) : null
          }

        {/* Уведомления для дилера с выпадающим списком */}
        {isDealer && (
          <div ref={dropdownRef} >
            <h3
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              Уведомления
              {dealerUnreadCount > 0 && (
                <span
                className='red-circle'
                />
              )}
            </h3>

            {dropdownOpen && (
              <div className = 'notification-list'
                // style={{
                //   position: 'absolute',
                //   top: '100%',
                //   right: 0,
                //   width: '320px',
                //   backgroundColor: 'white',
                //   color: '#333',
                //   borderRadius: '8px',
                //   boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                //   zIndex: 1000,
                //   marginTop: '8px',
                //   overflow: 'hidden',
                // }}
              >
                <div style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                  Уведомления
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loadingNotif ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                      Нет уведомлений
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          position: 'relative',
                          padding: '12px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          backgroundColor: notif.is_read ? 'transparent' : '#f0f7ff',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9ecef')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : '#f0f7ff')
                        }
                      >
                        <div style={{ fontWeight: notif.is_read ? 'normal' : 'bold' }}>
                          {notif.message || `Изменение ПО: ${notif.software_name} ${notif.software_version}`}
                        </div>
                        {notif.tractor_vin && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            Трактор: {notif.tractor_vin}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                          {formatDate(notif.created_at)}
                        </div>
                        {/* Кнопка удаления */}
                        <button
                          onClick={(e) => deleteNotification(notif.id, e)}
                          style={{
                            display: 'flex',
                            top: '8px',
                            right: '8px',
                            background: 'none',
                            width:'10%',
                            height:'10%',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#999',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#f00')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
                          aria-label="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    borderTop: '1px solid #eee',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  Закрыть
                </div>
              </div>
            )}
          </div>
        )}

        {onLogout ? (
          <h3
            onClick={onHelp}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            Помощь
            {hasUnreadMessages && (
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginTop: '-8px',
                }}
              />
            )}
          </h3>
        ) : null}
        {onLogout && (
          <h3 onClick={onLogout} style={{ cursor: 'pointer' }}>
            Выйти
          </h3>
        )}
        {onLogout && (
           <h3>Роль:{roleMap()}</h3>
        )}
        
      </div>
      <div className="icon-ptz">
        <img className="object-pi" src={icon} alt={icon} />
      </div>
    </header>
  );
}