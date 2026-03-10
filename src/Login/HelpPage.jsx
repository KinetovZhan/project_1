import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';

export function HelpPage () {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const userRole = user?.role || 'user';

  const handleBack = () => {
    navigate(-1);
  };

  // Обработчик Escape
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [handleBack]);

  // Загрузка сообщений при монтировании
  useEffect(() => {
    if (!token) {
      alert("Ошибка: не авторизован");
      navigate('/login');
      return;
    }
    loadMessages();
    
    // Обновляем сообщения каждые 10 секунд
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [token, userRole]);

  const loadMessages = async () => {
    try {
      const response = await api.get('/support/messages');
      console.log('Загруженные сообщения:', response); // Для отладки
      setMessages(response || []);
      setError('');
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      setError('Не удалось загрузить сообщения');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      await api.post('/support/messages', {content});
      setContent('');
      await loadMessages();
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setError('Не удалось отправить сообщение');
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;
    
    setLoading(true);
    try {
      await api.post('/support/messages/reply', {
        message_id: replyingTo.id,
        content: replyContent
      });
      console.log(replyingTo.id)
      setReplyContent('');
      setReplyingTo(null);
      await loadMessages();
    } catch (error) {
      console.error('Ошибка отправки ответа:', error);
      setError('Не удалось отправить ответ');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    // Добавляем несколько проверок
    if (!messageId) {
      console.warn('markAsRead: messageId is undefined или null');
      return;
    }
    
    // Проверяем тип messageId
    if (typeof messageId !== 'number' && typeof messageId !== 'string') {
      console.warn('markAsRead: messageId имеет неправильный тип:', typeof messageId, messageId);
      return;
    }
    
    try {
      await api.post(`/support/messages/${messageId}/read`);
      await loadMessages();
    } catch (error) {
      console.error('Ошибка отметки прочтения:', error);
    }
  };


  // Для модератора: группируем сообщения по отправителям
  const groupMessagesBySender = () => {
  // Фильтруем только корневые сообщения (не ответы)
  const rootMessages = messages.filter(msg => !msg.messages.id);
  
  const groups = {};
  rootMessages.forEach(msg => {
    if (!groups[msg.sender_id]) {
      groups[msg.sender_id] = {
        sender_id: msg.sender_id,
        sender_name: msg.sender,
        role: msg.role || 'user',
        messages: []
      };
    }
    groups[msg.sender_id].messages.push(msg);
  });
  return Object.values(groups);
};

  if (userRole === 'moderator') {
  // Данные уже сгруппированы по пользователям!
  // messages - это массив объектов с полями user_id, username, role, messages[]

  return (
    <div className="help-page moderator-view">
      <div className="help-container">
        <h1 className="help-title">
          Все обращения пользователей
          <span className="messages-count">
            Пользователей: {messages.length}
          </span>
        </h1>

        {error && <div className="error-message">{error}</div>}

        {messages.length === 0 ? (
          <div className="no-messages">Нет сообщений от пользователей</div>
        ) : (
          <div className="all-messages">
            {messages.map(userGroup => (
              <div key={userGroup.user_id} className="user-messages-group">
                <div className="user-header">
                  <h3>{userGroup.username}</h3>
                  <span className="user-role-badge">{userGroup.role}</span>
                  <span className="messages-count-badge">
                    Сообщений: {userGroup.messages?.length || 0}
                  </span>
                </div>
                
                <div className="messages-list">
                  {userGroup.messages?.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`message-item ${!msg.is_read ? 'unread' : ''}`}
                      onMouseEnter={() => {
                        if (!msg.is_read && msg.id) {
                          markAsRead(msg.id);
                        }
                      }}
                    >
                      <div className="message-header">
                        <span className="message-time">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                        {!msg.is_read && (
                          <span className="unread-label">Новое</span>
                        )}
                      </div>
                      
                      <div className="message-content">
                        {msg.content}
                      </div>

                      {msg.replies && msg.replies.length > 0 && (
                        <div className="message-replies">
                          <h4>Ответы ({msg.replies.length}):</h4>
                          {msg.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                              <span className="reply-moderator">
                                {reply.moderator_name}:
                              </span>
                              <span className="reply-text">{reply.content}</span>
                              <span className="reply-time">
                                {new Date(reply.created_at).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyingTo?.id === msg.id ? (
                        <form onSubmit={sendReply} className="reply-form">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Введите ответ..."
                            rows="2"
                            autoFocus
                          />
                          <div className="reply-actions">
                            <button type="submit" disabled={!replyContent.trim()}>
                              Отправить
                            </button>
                            <button type="button" onClick={() => setReplyingTo(null)}>
                              Отмена
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button 
                          className="reply-button"
                          onClick={() => setReplyingTo(msg)}
                        >
                          Ответить
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="loading">Загрузка...</div>}
    </div>
  );
} else {
    // Интерфейс обычного пользователя (dealer/engineer)
    return (
      <div className="help-page user-view">
        <div className="help-container">
        <div className='hzclass'>
          <div className='sendform'>
            <h1 className="help-title">Техническая поддержка</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={sendMessage} className="message-form">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Опишите вашу проблему или вопрос..."
                rows="4"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !content.trim()}>
                Отправить сообщение
              </button>
            </form>

          </div>
          <button onClick={handleBack} className="add-po-back-button">
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
              <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
        


          <div className="user-messages">
            <h2>Ваши обращения</h2>
            {messages.length === 0 ? (
              <p className="no-messages">У вас пока нет обращений</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="message-card">
                  <div className="message-header">
                    <span className="message-date">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                    <span className={`message-status ${msg.is_read ? 'read' : 'unread'}`}>
                      {msg.is_read ? ' Прочитано' : ' Отправлено'}
                    </span>
                  </div>
                  
                  <div className="message-body">
                    {msg.content}
                  </div>
                  
                  {msg.replies && msg.replies.length > 0 && (
                    <div className="message-replies">
                      <h4 style={{margin:'0px'}}>Ответы поддержки:</h4>
                      {msg.replies.map(reply => (
                        <div key={reply.id} className="reply">
                          <span className="reply-moderator">{reply.moderator_name} </span>
                          <span className="reply-content">{reply.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {loading && <div className="loading">Загрузка...</div>}
      </div>
    );
  }
}