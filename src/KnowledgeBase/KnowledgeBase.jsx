// src/Login/KnowledgeBase.jsx
import React, {use, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header.jsx';
import './KnowledgeBase.css';
import { useAuth } from '../auth/AuthContext';
import Protocol from './Protocol.jsx';
import Diagnostic from './Diagnostic.jsx';
import Exploitation from './Exploitation.jsx';
import InstructionAboutRework from './InstructionAboutRework.jsx';
import { api } from '../fetchAPI.js';
export function KnowledgeBase() {
  const navigate = useNavigate();
  const  [info, setInfo] = useState(false)
  const { token, user } = useAuth();
  const userRole = user?.role || 'user';
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState([])
  const handleBack = () => {
    navigate(-1); // Возвращает на предыдущую страницу
  };



  useEffect(() => {
    const getData = async () => {

      if(!info){
        return
      }

      try {
        setLoading(true)
        const response = await api.get(`/knowledge_base?type=${info}`)
        setKnowledgeBase(response)
      } catch(error){
        setError(error.message);
      }finally {
        setLoading(false);
      }
    };
    getData();
  }, [info]);

    // Обработчик нажатия клавиш
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape нажата, закрываем');
        handleBack();
      }
    };

    // Добавляем слушатель события
    window.addEventListener('keydown', handleKeyDown);

    // Убираем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Пустой массив зависимостей - эффект выполнится один раз

  const handleLogout = () => {
    console.log('Logout не доступен на публичной странице');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  const handleKnowledgeBase = () => {
    console.log('Уже на странице базы знаний');
  };

  return (
    <div>
      <Header 
        onLogout={handleLogout}
        onHelp={handleHelp}
        onKnowledgeBase={handleKnowledgeBase}
      />

      <div>
        <button onClick={handleBack} className="close-button"> 
          <svg width="34" height="35" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="32.3787" y1="2.62132" x2="1.49998" y2="33.5" stroke="black" stroke-width="3" stroke-linecap="round"/>
          <line x1="1.49998" y1="1.5" x2="32.3787" y2="32.3787" stroke="black" stroke-width="3" stroke-linecap="round"/>
          </svg>

        </button>
        <div className="knowledge-base-container-base">
          <div className="knowledge-base-container">
              <div>
                <h1 className="knowledge-base-title">
                  База знаний
                </h1>
              </div>
              <div style = {{display: 'flex', flexDirection: 'row', height: '100%'}}>
                <div className='left-column'>
                  <div className='knowledge-base-maininfo'>
                    <a onClick={() => setInfo('diagnostic')}>Диагностическое программное оборудование</a>
                  </div>
                  <div className='knowledge-base-maininfo'>
                    <a onClick={() => setInfo('instruction_about_exploitation')}>Инструкции по эксплуатации</a>
                  </div>
                  <div className='knowledge-base-maininfo'>
                    <a onClick={() => setInfo('instruction_about_rework')}>Инструкция по доработке</a>
                  </div>
                  <div className='knowledge-base-maininfo'>
                    <a onClick={() => setInfo('protocol')}>Протоклолы обмена данными</a>
                  </div>
                </div>
                <div className='right-column'>
                  {info !== false && 
                  <div className='info'>
                    <div className='files'>
                      {info === 'protocol' && <Protocol data={knowledgeBase} />}
                      {info === 'diagnostic' && <Diagnostic data={knowledgeBase} />}
                      {info === 'instruction_about_exploitation' && <Exploitation data={knowledgeBase} />}

                      {info === 'instruction_about_rework' && <InstructionAboutRework data={knowledgeBase} />}
                    </div>
                    {userRole === 'moderator' && <input type='file' placeholder='Добавить файл' className='AddFile'/>}
                  </div>
                  }
                </div>
                
              </div>
          </div>
        </div>

      </div>

    </div>
  );
}