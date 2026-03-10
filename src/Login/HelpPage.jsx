import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HelpImage from '../img/помощь.jpg';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';

export function HelpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedMessages, setExpandedMessages] = useState({});
  
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'user';
  const isModerator = userRole === 'moderator';

  const handleBack = () => {
    navigate(-1);
  };

  // Загрузка сообщений при монтировании
  useEffect(() => {
    if (!token) {
      console.log("Вы не авторизированы");
      alert("У вас нет прав");
      navigate("/main");
      return;
    }

    fetchMessages();
  }, [token, navigate]);

  // Загрузка сообщений с сервера
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/messages');
      setMessages(Array.isArray(response) ? response : []);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки сообщений');
      console.error(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Отправка нового сообщения (для dealer/engineer)
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const messageRequest = {
        content: newMessage,
      };
      
      await api.post("/support/messages", messageRequest);
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError('Ошибка отправки сообщения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Отправка ответа (для moderator)
  const handleSendReply = async (messageId) => {
    if (!replyContent.trim()) return;

    try {
      setLoading(true);
      const replyRequest = {
        content: replyContent,
        parentMessageId: messageId
      };
      
      await api.post("/support/messages/reply", replyRequest);
      setReplyContent('');
      setSelectedMessageId(null);
      fetchMessages();
    } catch (err) {
      setError('Ошибка отправки ответа');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Отметить сообщение как прочитанное
  const handleMarkAsRead = async (messageId) => {
    try {
      await api.patch(`/support/messages/${messageId}/read`);
      fetchMessages();
    } catch (err) {
      console.error('Ошибка при отметке о прочтении:', err);
    }
  };

  // Удалить сообщение (только для модератора)
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) return;
    
    try {
      await api.delete(`/support/messages/${messageId}`);
      fetchMessages();
    } catch (err) {
      setError('Ошибка при удалении сообщения');
      console.error(err);
    }
  };

  // Переключить расширение сообщения
  const toggleMessageExpanded = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Фильтрация сообщений для модератора
  const getFilteredMessages = () => {
    if (!isModerator) return messages;
    
    switch(filter) {
      case 'unread':
        return messages.filter(msg => !msg.is_read);
      case 'answered':
        return messages.filter(msg => msg.replies && msg.replies.length > 0);
      default:
        return messages;
    }
  };

  const filteredMessages = getFilteredMessages();

  // Обработчик Escape
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [handleBack]);

  return (
    <div className="formHelp">
      <button onClick={handleBack} className="add-po-back-button">
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}

      <div className="help-content">
        {/* Заголовок в зависимости от роли */}
        <h1 className="help-title">
          {isModerator ? '📬 Панель модератора' : '📨 Служба поддержки'}
        </h1>

        {/* Фильтры для модератора */}
        {isModerator && (
          <div className="moderator-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все сообщения
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Непрочитанные
            </button>
            <button 
              className={`filter-btn ${filter === 'answered' ? 'active' : ''}`}
              onClick={() => setFilter('answered')}
            >
              С ответами
            </button>
          </div>
        )}

        {/* Форма для создания сообщения (для dealer/engineer) */}
        {!isModerator && (
          <div className="new-message-form">
            <h3>Создать обращение</h3>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Опишите вашу проблему..."
              rows="4"
            />
            <button 
              onClick={handleSendMessage}
              disabled={loading || !newMessage.trim()}
              className="send-btn"
            >
              Отправить
            </button>
          </div>
        )}

        {/* Статистика для модератора */}
        {isModerator && (
          <div className="moderator-stats">
            <div className="stat-item">
              <span className="stat-label">Всего:</span>
              <span className="stat-value">{messages.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Непрочитанных:</span>
              <span className="stat-value">{messages.filter(m => !m.is_read).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">С ответами:</span>
              <span className="stat-value">{messages.filter(m => m.replies?.length > 0).length}</span>
            </div>
          </div>
        )}

        {/* Список сообщений */}
        <div className="messages-list">
          <h3>
            {isModerator ? 'Обращения пользователей' : 'Ваши обращения'}
            {filteredMessages.length > 0 && (
              <span className="messages-count"> ({filteredMessages.length})</span>
            )}
          </h3>
          
          {filteredMessages.length === 0 ? (
            <p className="no-messages">
              {isModerator 
                ? 'Нет сообщений, соответствующих фильтру' 
                : 'У вас пока нет обращений'}
            </p>
          ) : (
            filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`message-item ${!message.is_read && isModerator ? 'unread' : ''}`}
              >
                <div className="message-header">
                  <div className="message-header-left">
                    <strong className="message-sender">
                      {message.sender?.username || 'Пользователь'}
                    </strong>
                    {!message.is_read && isModerator && (
                      <span className="unread-badge">Новое</span>
                    )}
                  </div>
                  <div className="message-header-right">
                    <span className="message-date">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                    {isModerator && (
                      <div className="message-actions">
                        {!message.is_read && (
                          <button 
                            className="action-btn mark-read"
                            onClick={() => handleMarkAsRead(message.id)}
                            title="Отметить как прочитанное"
                          >
                            ✓
                          </button>
                        )}
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteMessage(message.id)}
                          title="Удалить"
                        >
                          ×
                        </button>
                        <button 
                          className="action-btn expand"
                          onClick={() => toggleMessageExpanded(message.id)}
                          title={expandedMessages[message.id] ? 'Свернуть' : 'Развернуть'}
                        >
                          {expandedMessages[message.id] ? '▼' : '▶'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="message-content">
                  {message.content}
                </div>

                {/* Ответы на сообщение (показываем всегда для модератора, для других - если есть ответы) */}
                {(isModerator || (message.replies && message.replies.length > 0)) && (
                  <div className={`message-replies ${!expandedMessages[message.id] && isModerator ? 'collapsed' : ''}`}>
                    {message.replies && message.replies.length > 0 ? (
                      <>
                        <h4 className="replies-title">Ответы:</h4>
                        {message.replies.map((reply) => (
                          <div key={reply.id} className="reply-item">
                            <div className="reply-header">
                              <strong className="reply-sender">
                                {reply.sender?.username || 'Модератор'}
                              </strong>
                              <span className="reply-date">
                                {new Date(reply.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                          </div>
                        ))}
                      </>
                    ) : (
                      isModerator && (
                        <p className="no-replies">Нет ответов</p>
                      )
                    )}

                    {/* Форма ответа для модератора */}
                    {isModerator && (
                      <div className="reply-form">
                        {selectedMessageId === message.id ? (
                          <div className="reply-form-active">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Введите ваш ответ..."
                              rows="3"
                              autoFocus
                            />
                            <div className="reply-form-actions">
                              <button 
                                onClick={() => handleSendReply(message.id)}
                                disabled={loading || !replyContent.trim()}
                                className="send-reply-btn"
                              >
                                Отправить
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedMessageId(null);
                                  setReplyContent('');
                                }}
                                className="cancel-reply-btn"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setSelectedMessageId(message.id)}
                            className="reply-btn"
                          >
                            Ответить
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}