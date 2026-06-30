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
  const [info, setInfo] = useState(false)
  const { token, user } = useAuth();
  const userRole = user?.role || 'user';
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState([])
  
  // ========== НОВЫЙ СТЕЙТ ДЛЯ ЗАГРУЗКИ ==========
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const getData = async () => {
      if(!info) return

      try {
        setLoading(true)
        const response = await api.get(`/knowledge_base?type=${info}`)
        setKnowledgeBase(response)
      } catch(error){
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [info]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape нажата, закрываем');
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        setUploading(true);
        setUploadError('');
        setUploadSuccess('');
        
        // 1. Загружаем файл через НАТИВНЫЙ FETCH (не api.post)
        const API_URL = import.meta.env.VITE_API_URL;

        const uploadResponse = await fetch(`${API_URL}/knowledge_base/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Upload failed');
        }
        
        const { path: filePath } = await uploadResponse.json();
        
        // 2. Сохраняем в БД через api.post (JSON)
        const response = await api.post('/knowledge_base', {
            type: info,
            path: filePath
        });

        setUploadSuccess('Файл успешно загружен!');
        
        // Обновляем список
        const updatedResponse = await api.get(`/knowledge_base?type=${info}`);
        setKnowledgeBase(updatedResponse);
        
        event.target.value = '';
        
    } catch (error) {
        console.error('Upload error:', error);
        setUploadError(error.message || 'Ошибка при загрузке файла');
    } finally {
        setUploading(false);
    }
};

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
            <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
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
                  <a onClick={() => setInfo('protocol')}>Протоколы обмена данными</a>
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
                    
                    {/* ========== ОБНОВЛЁННАЯ СЕКЦИЯ ЗАГРУЗКИ ========== */}
                    {userRole === 'moderator' && (
                      <div className="upload-section">
                        <label className={`upload-label ${uploading ? 'uploading' : ''}`}>
                          {uploading ? 'Загрузка...' : 'Добавить файл'}
                          <input 
                            type="file" 
                            className="AddFile"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </label>
                        
                        {uploadError && (
                          <div className="upload-error">
                            ❌ {uploadError}
                          </div>
                        )}
                        
                        {uploadSuccess && (
                          <div className="upload-success">
                            ✅ {uploadSuccess}
                          </div>
                        )}
                      </div>
                    )}
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