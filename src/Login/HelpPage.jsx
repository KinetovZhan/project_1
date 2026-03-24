import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../fetchAPI.js';

export function HelpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [filter, setFilter] = useState('new');
  const [userList, setUserList] = useState([])
  const [choosedUser, setChoosedUser] = useState(null)
  const [isRead,setIsRead] = useState()
  
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'user';
  const isModerator = userRole === 'moderator';

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!token) {
      alert("У вас нет прав");
      navigate("/main");
      return;
    }
    fetchMessages();
  }, [token, navigate]);
  console.log(choosedUser)
  console.log(`isRead ${isRead}`)

  // Функция для нормализации данных
  const normalizeMessages = (data) => {
    if (!Array.isArray(data)) return [];
    
    // Если это массив сообщений (как у обычного пользователя)
    if (data.length > 0 && data[0].hasOwnProperty('id') && !data[0].hasOwnProperty('user_id')) {
      return data.map(msg => ({
        ...msg,
        sender_name: 'Вы',
        sender_role: userRole
      }));
    }
    
    // Если это массив пользователей с сообщениями (как у модератора)
    const flatMessages = [];
    data.forEach(userData => {
      if (userData.messages && Array.isArray(userData.messages)) {
        userData.messages.forEach(msg => {
          flatMessages.push({
            ...msg,
            sender_name: userData.username,
            sender_role: userData.role,
            sender_id: userData.user_id
          });
        });
      }
    });
    
    // Сортируем по дате (новые сверху)
    return flatMessages.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/messages');
      console.log('Полученные данные:', response);
      
      const normalizedMessages = normalizeMessages(response);
      console.log('Нормализованные сообщения:', normalizedMessages);
      if(isModerator) {
        const users = response.map(userData => ({
        user_id: userData.user_id,
        username: userData.username,
        role: userData.role,
        unread_count: userData.messages?.filter(msg => !msg.is_read).length || 0
      }));
      setUserList(users);
        console.log("список пользователей",userList)
      }
      
      setMessages(normalizedMessages);
      console.log(messages)
      setIsRead(response.is_read)
      setError('');
    } catch (err) {
      setError('Ошибка загрузки сообщений');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setLoading(true);
      await api.post("/support/messages", { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError('Ошибка отправки сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (messageId) => {
    if (!replyContent.trim()) return;
    try {
      setLoading(true);
      await api.post("/support/messages/reply", {
        content: replyContent,
        message_id: messageId
      });
      console.log(` письмо ${replyContent} айдишник${messageId}`)
      setReplyContent('');
      setSelectedMessageId(null);
      fetchMessages();
    } catch (err) {
      setError('Ошибка отправки ответа');
    } finally {
      setLoading(false);
    }
  };

 

  const getFilteredMessages = () => {
  if (!isModerator) return messages || [];
  if (choosedUser === null) return [];
  
  const userMessages = messages.filter(msg => msg.sender_name === choosedUser);
  
  switch(filter) {
    case 'new':
      return userMessages.filter(msg => !msg.is_read && msg.replies.length === 0);
    case 'in-work':
      return userMessages.filter(msg => msg.is_read === true);
    case 'closed':
      return userMessages.filter(msg => msg.is_read === true && is_closed===true);
  }};

  const filteredMessages = getFilteredMessages();

  const fetchRead = async (id) => {
    try{
      if(isModerator){
        const data = api.get(`/support/read-message/{moderator_id}/${id}`)
        console.log(data)

      }
    } catch(err){
      setError('Ошибка прочтения сообщения', err)
    }
    
  }

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [handleBack]);

  return (
    <div className="help-page-container">
      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}

      <div className="help-content-wrapper">
        {/* Левая колонка */}
        <div className="help-left-column" style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          <div>

            <h1 className="help-title" style={{color:'white'}}>
              {isModerator ? 'Панель модератора' : 'Служба поддержки'}
            </h1>

            {isModerator && (
              <>
              <div className="moderator-filters">
                <button 
                  className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
                  onClick={() => setFilter('new')}
                >
                  Новые
                </button>

                <button 
                  className={`filter-btn ${filter === 'in-work' ? 'active' : ''}`}
                  onClick={() => setFilter('in-work')}
                >
                  В работе
                </button>

                <button 
                  className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
                  onClick={() => setFilter('closed')}
                >
                  Закрытые
                </button>
              </div>
              <div className='chooseUsers'>
                <div className='users'>
                  {userList.map((item) => (
                    <div 
                      key={item.user_id} 
                      className={`user-item ${choosedUser === item.username ? 'selected' : ''}`} 
                      onClick={() => {
                        if(choosedUser !== item.username) {
                          setChoosedUser(item.username)}
                        else{
                          setChoosedUser(null)}}
                        }>
                      
                      <div className="user-info" >
                        <span className="user-name">Пользователь {item.username} Роль  {item.role} {(item.unread_count !== undefined && item.unread_count !== null && item.unread_count !== 0)?(`Непрочитанных сообщений ${item.unread_count}  `):''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}

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
          </div>
          <button onClick={handleBack} className="add-po-back-button">
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Правая колонка - список сообщений */}
        <div className="help-right-column">
          <h3 style={{userSelect: 'none', color:'white'}}>
            {isModerator ? 'Обращения пользователей' : 'Ваши обращения'}
            {filteredMessages !== undefined && filteredMessages !== null && filteredMessages.length > 0 && (
              <span className="messages-count"> ({filteredMessages.length})</span>
            )}
          </h3>
          
          <div className="messages-scroll-container">
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
                        {message.sender_name || 'Вы'}
                      </strong>
                      {message.sender_role && isModerator && (
                        <span className="user-role-badge">
                          {message.sender_role}
                        </span>
                      )}
                      {!message.is_read && isModerator && (
                        <span className="unread-badge">Новое</span>
                      )}
                      {!message.is_read?(<input
                                            type='checkbox'
                                            onChange={()=>fetchRead(message.id)}/>):('')}
                    </div>
                    <div className="message-header-right">
                      <span className="message-date">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                      {isModerator && (
                        <button 
                          className="reply-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessageId(
                              selectedMessageId === message.id ? null : message.id
                            );
                            setReplyContent('');
                          }}
                        >
                          {selectedMessageId === message.id ? 'Отмена' : 'Ответить'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="message-content">
                    {message.content}
                  </div>

                  {/* Ответы на сообщение */}
                  {message.replies && message.replies.length > 0 && (
                    <div className="message-replies">
                      <h4 className="replies-title">Ответы:</h4>
                      {message.replies.map((reply) => (
                        <div key={reply.id} className="reply-item">
                          <div className="reply-header">
                            <strong className="reply-sender">
                              {reply.moderator_name || 'Модератор'}
                            </strong>
                            <span className="reply-date">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="reply-content">{reply.content}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Форма ответа для модератора */}
                  {isModerator && selectedMessageId === message.id && (
                    <div className="reply-form">
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
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}