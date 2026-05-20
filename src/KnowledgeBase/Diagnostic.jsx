import { useState, useEffect } from 'react';
import './Protocol.css';
import { useAuth } from '../auth/AuthContext';
const Diagnostic = ({ data }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState({});
    const { token } = useAuth();

    useEffect(() => {
        if (data && data.length > 0) {
            const diagnosticFiles = data.filter(item => item.type === 'diagnostic');
            setFiles(diagnosticFiles);
        }
        setLoading(false);
    }, [data]);

    const handleDownload = async (id, fileName) => {
        try {
            setDownloading(prev => ({ ...prev, [id]: true }));
            
            const response = await fetch(`http://192.168.3.7:8000/knowledge_base/download/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Download failed');
            }
            
            // Получаем blob с правильным типом
            const blob = await response.blob();
            
            // Создаем URL для blob
            const url = window.URL.createObjectURL(blob);
            
            // Создаем временную ссылку
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            
            // Важно: добавляем в DOM перед кликом
            document.body.appendChild(link);
            
            // Кликаем и удаляем
            link.click();
            
            // Очищаем
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('Download error:', error);
            alert('Ошибка при скачивании файла');
        } finally {
            setDownloading(prev => ({ ...prev, [id]: false }));
        }
    };

    const getFileName = (path) => {
        return path.split('/').pop();
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FFEBEE"/>
                        <path d="M8 7H16" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 11H16" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 15H12" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round"/>
                        <text x="6" y="20" fontSize="8" fill="#D32F2F">PDF</text>
                    </svg>
                );
            case 'doc':
            case 'docx':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#E3F2FD"/>
                        <path d="M8 7H16" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 11H14" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"/>
                        <text x="4" y="20" fontSize="7" fill="#2196F3">DOC</text>
                    </svg>
                );
            case 'xls':
            case 'xlsx':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#E8F5E9"/>
                        <path d="M8 7H16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 11H16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                        <text x="5" y="20" fontSize="7" fill="#4CAF50">XLS</text>
                    </svg>
                );
            case 'exe':
            case 'msi':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#F3E5F5"/>
                        <path d="M8 7H16" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 11V17" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 14H15" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round"/>
                        <text x="5" y="20" fontSize="6" fill="#9C27B0">EXE</text>
                    </svg>
                );
            case 'txt':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#F5F5F5"/>
                        <path d="M8 7H16" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 11H16" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"/>
                        <text x="5" y="20" fontSize="7" fill="#9E9E9E">TXT</text>
                    </svg>
                );
            case 'zip':
            case 'rar':
            case '7z':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FFF3E0"/>
                        <path d="M12 7V17" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 11H16" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
                        <text x="5" y="20" fontSize="6" fill="#FF9800">ZIP</text>
                    </svg>
                );
            default:
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FAFAFA"/>
                        <path d="M8 7H16" stroke="#757575" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 11H16" stroke="#757575" strokeWidth="2" strokeLinecap="round"/>
                        <text x="5" y="20" fontSize="6" fill="#757575">FILE</text>
                    </svg>
                );
        }
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className='maininfoProtocol'>
                <div className='title'>
                    <div className='head'>Диагностическое программное оборудование</div>
                    <div className='empty-message'>Нет доступных диагностических файлов</div>
                </div>
            </div>
        );
    }

    return (
        <div className='maininfoProtocol'>
            <div className='title'>
                <div className='head'>Диагностическое программное оборудование</div>
            </div>
            
            <div className='protocol-list'>
                {files.map((file) => (
                    <div key={file.id} className='protocol-item'>
                        <div className='protocol-info'>
                            <div className='file-icon'>
                                {getFileIcon(getFileName(file.path))}
                            </div>
                            <span className='protocol-name'>{getFileName(file.path)}</span>
                        </div>
                        <div className='protocol-actions'>
                            <button 
                                className='download-btn'
                                onClick={() => handleDownload(file.id, getFileName(file.path))}  
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 1V11M8 11L11 8M8 11L5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                Скачать
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Diagnostic;