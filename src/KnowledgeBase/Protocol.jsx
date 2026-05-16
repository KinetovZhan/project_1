import { useState, useEffect } from 'react';
import './Protocol.css';

const Protocol = ({ data }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (data && data.length > 0) {
            const protocolFiles = data.filter(item => item.type === 'protocol');
            setFiles(protocolFiles);
        }
        setLoading(false);
    }, [data]);

    const handleDownload = (path) => {
        const link = document.createElement('a');
        link.href = path;
        link.download = path.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <div className='head'>Протоколы обмена данными</div>
                    <div className='empty-message'>Нет доступных протоколов</div>
                </div>
            </div>
        );
    }

    return (
        <div className='maininfoProtocol'>
            <div className='title'>
                <div className='head'>Протоколы обмена данными</div>
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
                                onClick={() => handleDownload(file.path)}
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

export default Protocol;