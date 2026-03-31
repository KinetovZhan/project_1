import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import DefaultImage from '../img/default.jpg';
import KPPImage from '../img/КПП.png';
import RKImage from '../img/РК.png';
import HRImage from '../img/Гидрораспределитель.png';
import WeiImage from '../img/ДВС Weichai.png';
import TMZImage from '../img/ДВС ТМЗ.png';
import JMZImage from '../img/ДВС ЯМЗ.png';
import BKImage from '../img/БК дисплей контроллер.png';
import { api } from '../fetchAPI.js';
import { input } from '@testing-library/user-event/dist/cjs/event/input.js';



export function PoDetails({ po, onBack }) {
  const { token, user } = useAuth();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [allPreviousVersions, setAllPreviousVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [nextVersions, setNextVersions] = useState([]);
  const [loadingNextVersions, setLoadingNextVersions] = useState(false);
  const userRole = user?.role || 'user';
  const isModerator = userRole === 'moderator';
  const [discr, setDiscr ] = useState(po.description);
  const [producer, setProducer] = useState('');
  const [isActual, setIsActual] = useState(po.software_is_actual);
  const [isArchive, setIsArchive] = useState(po.software_is_archive);
  const [isCritical, setIsCritical] = useState(po.software_is_critical);
  const [status, setStatus] = useState(po.status);
  const isEngineer = userRole === 'engineer';
  const [releaseDate, setReleaseDate] = useState(po.release_date)
  const [change, setChange] = useState(false);
  const [instruction, setInstruction] = useState(po.software_path_instruction)
  const [endActuality, setEndActuality] = useState(po.end_actuality)

  // const swId = po.id_Firmwares

  // console.log(`Айдишник ${swId}`)
  console.log(po)
  console.log(releaseDate)


  // const postData = {
  //   description: discr,
  //   producer: producer,
  //   status: status || po.status,
  //   release_date: releaseDate,
  //   software_path_instruction: instruction,
  //   is_actual:isActual,
  //   is_archive:isArchive,
  //   is_critical:isCritical,
  //   end_actuality: endActuality
  // }

  // const postData2 = {
  //   description: discr,
  //   status: status || po.status
  // }

  // Загрузка основных деталей ПО
  useEffect(() => {
    const fetchDetails = async () => {
      if (!po?.id_Firmwares || !po?.id_Component) {
        setError('Недостаточно данных для загрузки');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = `/search/software-component-info?id_firmwares=${encodeURIComponent(po.id_Firmwares)}&id_component=${encodeURIComponent(po.id_Component)}`;
        console.log('Fetching URL:', url);
        const data = await api.get(url);
        
        console.log('Received data:', data);
        const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!item) throw new Error('Данные не найдены');
        setDetails(item);
        console.log(details)
        // setStatus(details.software_status)
        // setDiscr(details.software_description)
      } catch (err) {
        console.error('Ошибка загрузки деталей ПО:', err);
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [po, status,  change]);
  
  

  // Загрузка всех предыдущих версий
  useEffect(() => {
    const fetchAllPreviousVersions = async () => {
      if (!details?.software_previous_sw_version) {
        setAllPreviousVersions([]);
        return;
      }

      setLoadingVersions(true);
      const versions = [];
      let currentVersionId = details.software_previous_sw_version;
      let currentComponentId = po.id_Component;

      while (currentVersionId) {
        try {
          // Загружаем детали текущей предыдущей версии
          const url = `/search/software-component-info?id_firmwares=${encodeURIComponent(currentVersionId)}&id_component=${encodeURIComponent(currentComponentId)}`;
          console.log('Fetching previous version:', url);
          
          const data = await api.get(url);
          const versionData = Array.isArray(data) && data.length > 0 ? data[0] : null;
          
          if (versionData) {
            versions.push(versionData);
            // Переходим к следующей предыдущей версии
            currentVersionId = versionData.software_previous_sw_version;
          } else {
            break;
          }
        } catch (err) {
          console.error('Ошибка загрузки предыдущей версии:', err);
          break;
        }
      }

      setAllPreviousVersions(versions);
      setLoadingVersions(false);
    };

    fetchAllPreviousVersions();
  }, [details?.software_previous_sw_version, po.id_Component]);


  // Загрузка новых версий (тех, которые ссылаются на текущую)
useEffect(() => {
  const fetchNextVersions = async () => {
    if (!details?.id_firmwares || !details?.id_component) {
      setNextVersions([]);
      return;
    }

    setLoadingNextVersions(true);
    try {
      const url = `/search/software-component-next-versions?id_firmwares=${encodeURIComponent(details.id_firmwares)}&id_component=${encodeURIComponent(details.id_component)}`;
      const data = await api.get(url);
      setNextVersions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки новых версий:', err);
      setNextVersions([]);
    } finally {
      setLoadingNextVersions(false);
    }
  };

  fetchNextVersions();
}, [details?.id_firmwares, details?.id_component]);
useEffect(() => {
  if (details) {
    setDiscr(details.software_description || '');
    setStatus(details.software_status || '');
    setIsActual(details.software_is_actual);
    setIsCritical(details.software_is_critical);
    setReleaseDate(details.software_release_date?.split('T')[0] || '');
    setEndActuality(details.software_end_actuality?.split('T')[0] || '');
    setInstruction(details.software_path_instruction || '');
    setProducer(details.software_producer || '');
  }
}, [details]);


  const changePoInfo = async () => {
    const swId = details?.id_firmwares;
  if (!swId) {
    setError('Нет ID прошивки для обновления');
    return;
  }

  try {
    // Формируем payload ТОЛЬКО из актуальных значений стейта
    const payload = isModerator ? {
      description: discr,
      producer: producer,
      status: status || po.status,
      release_date: releaseDate,
      software_path_instruction: instruction,
      is_actual: isActual,
      is_archive: isArchive,
      is_critical: isCritical,
      end_actuality: endActuality
    } : {
      description: discr,
      status: status || po.status
    };

    console.log('PATCH payload:', payload);
    
    await api.patch(`/software/${swId}`, payload);
    
    // Обновляем данные после успешного изменения
    const url = `/search/software-component-info?id_firmwares=${swId}&id_component=${details.id_component}`;
    const updated = await api.get(url);
    if (updated?.[0]) {
      setDetails(updated[0]);
    }
    
    setChange(false);
  } catch(err) {
    console.error('Ошибка обновления ПО:', err);
    setError(`Ошибка изменения данных: ${err.message || err}`);
  }
};

  const handleVersionClick = async (e, versionId) => {
    e.preventDefault();
    if (!versionId) return;

    setLoading(true);
    try {
      const url = `/search/software-component-info?id_firmwares=${encodeURIComponent(versionId)}&id_component=${encodeURIComponent(po.id_Component)}`;
      const data = await api.get(url);
      const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!item) throw new Error('Данные не найдены');

      setDetails(item);
    } catch (err) {
      console.error('Ошибка загрузки версии:', err);
      setError(`Ошибка загрузки версии: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="po-details-container">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <div className="po-details-content">Загрузка...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="po-details-container">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <div className="po-details-content" style={{ color: 'red' }}>
          {error || 'Данные не найдены'}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const actualityPeriod = details.software_end_actuality
    ? `${formatDate(details.software_release_date)} — ${formatDate(details.software_end_actuality)}`
    : `с ${formatDate(details.software_release_date)} (бессрочно)`;

  const ImageToComponent = (type_component, name_component) => {
    const typeLower = type_component?.toLowerCase() || '';
    const modelLower = name_component?.toLowerCase() || '';

    if (typeLower.includes('кпп') || typeLower.includes('kpp')) {
      return KPPImage;
    }

    if (typeLower && typeLower !== 'dvs') {
      const ImageByType = {
        'рулевая колонка': RKImage,
        'гидрораспределитель': HRImage,
        'бк': BKImage,
        'rk': RKImage,
        'hr': HRImage,
        'bk': BKImage,
      };

      for (const [key, image] of Object.entries(ImageByType)) {
        if (typeLower.includes(key)) {
          return image;
        }
      }
    }

    if ((typeLower === 'двс' || typeLower === 'dvs') && modelLower) {
      if (modelLower.includes('weichai')) return WeiImage;
      if (modelLower.includes('тмз') || modelLower.includes('tmz')) return TMZImage;
      if (modelLower.includes('ямз') || modelLower.includes('yamz') || modelLower.includes('ymz')) return JMZImage;
    }

    return DefaultImage;
  };

  const handleDownloadSoftware = async () => {
    const fileId = details.id_firmwares || details.id_Firmwares;
    if (!fileId) return;
    
    setDownloading(true);
    try {
      const response = await api.download(`/software/download/${fileId}`);
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = details.software_path || `software_${fileId}.bin`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (match && match[1]) filename = match[1].replace(/['"]/g, '');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка скачивания ПО:', error);
      alert('Не удалось скачать файл ПО');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadInstruction = async () => {
    const fileId = details.id_firmwares || details.id_Firmwares;
    if (!fileId) return;
    
    setDownloading(true);
    try {
      const response = await api.download(`/software/download/${fileId}/instruction`);
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = details.software_path_instruction || `instruction_${fileId}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (match && match[1]) filename = match[1].replace(/['"]/g, '');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      alert('Не удалось скачать файл');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusText = () => {
    if (details.software_status === 'serial') return 'Серийное';
    if (details.software_status === 'experienced' || details.software_status === 'experimental') return 'Опытное';
    if (details.software_status === 'in operation' || details.software_status === 'in_operation') return 'Для эксплуатации';
    return '—';
  };

  const getChange = () => {
    if(change === false){
      setChange(true)
    }else {
        setChange(false)
    }
    console.log(`нажатие на кнопку изменить ${change}`)
  }
  
  const offChange = () => {
    setChange(false)
  }
  
  const getStatusActualityText = () => {
    if (details.software_is_critical === true) return 'Требует обновление';
    if (details.software_is_actual === true && details.software_is_critical === false) return 'Актуальное';
    else {
      return 'Устаревшее';}
   
  };

  const changeStatus = (e) => {
    const query = e.target.value
    if(query === "serial"){
      setStatus("serial")
    }
    if(query === "experienced"){
      setStatus('experienced')
    }
    if(query === "in operation"){
      setStatus('in operation')
    }
  }

  const chooseActual = (e) => {
    const query = e.target.value
    if(query === "Актуальное"){
      setIsActual(true)
      setIsCritical(false)
    }
    if(query === "Требует обновление"){
      setIsCritical(true) 
    }
    else if (query === "Устаревшее") {
    setIsActual(false);
    setIsCritical(false);
  }
  }

 

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onBack} className="go-back" style={{top: '50px', left:'120px'}}></button>
      <div className="po-details-container ">
        {isModerator||isEngineer?(<button onClick={getChange}>Изменить</button>):<div></div>}
      {change === true?(<><button onClick={offChange}>Отменить</button> <button onClick={changePoInfo}>Принять</button></>):(<div></div>)}
      <div className="po-details-content ">
          <div className="left-column">
            <div className="section">
              <h2>
                <span>{details.name || 'ПО'} от {new Date(details.software_release_date).toLocaleDateString()}</span>
                <br />
                <span className='text-names'>{details.component_name}</span>
                <br />
                {details.software_tractor_models && details.software_tractor_models.length > 0 && (
                  <span className='text-names'>
                    <span>Модели тракторов: </span>
                    <span>{po.tractor_model.join(', ')}</span>
                  </span>
                )}
              </h2>
              <img
                className="object-po"
                src={ImageToComponent(details.component_type, details.component_name)}
                alt={details.component_type}
              />
            </div>
            <div className="section">
              <h3>Дата выпуска</h3>
              {(change === true && isModerator)?
                
                (<input
                  type="date"
                  value={releaseDate?.split('T')[0] || ''}
                  onChange={(e) => setReleaseDate(e.target.value)}/>):(<p>{formatDate(details.software_release_date)}</p>)
              }
            </div>
            <div className="section">

              {(isModerator && change === true)?(<><h3>Дата конца актуальности</h3><input
                                                    type='date'
                                                    value={(endActuality === null || endActuality === undefined)?(new Date().toISOString().split('T')[0]):(endActuality.split('T')[0])}
                                                    onChange={(e)=>setEndActuality(e.target.value)}/></>):(<><h3>Период актуальности</h3><p>{actualityPeriod}</p></>)}
            </div>
            {change===false?
          (<div>
              <h3>Назначение</h3>
              <p>{getStatusText()}</p>
            </div>):(<><h3>Назначение</h3>
                      <select value={status} onChange={changeStatus}>
                        <option value="serial">Серийное</option>
                        <option value="experienced">Опытное</option>
                        <option value="in operation">Для эксплуатации</option>
                    </select></>)}
            <div>
              <h3>Статус</h3>
              {(isModerator && change===true)?(<select defaultValue={getStatusActualityText()} onChange={chooseActual}>
                                                  <option value="Актуальное">Актуальное</option>
                                                  <option value="Устаревшее">Устаревшее</option>
                                                  <option value="Требует обновление">Требует обновление</option>
                                                </select> ):<p>{getStatusActualityText()}</p>}
            </div>
            <div style={{display:'flex', flexDirection:'row', gap:'5%'}}>
            <div className="section">
              <h3>Установщик</h3>
                {details.software_path ? (
                  <button
                    className="download-button"
                    onClick={handleDownloadSoftware}
                    disabled={downloading}
                  >
                    {downloading ? 'Скачивание...' : 'Скачать'}
                  </button>
                ) : (
                  <p>—</p>
                )}
              </div>
              <div className="section">
                <h3>Инструкция</h3>
                {
                  (change===true && isModerator)?(<input
                                    type="file"
                                    onChange={(e) => setInstruction(e.target.files[0])}/>):

                                (details.software_path_instruction ? (
                                  <button
                                    className="download-button"
                                    onClick={handleDownloadInstruction}
                                    disabled={downloading}
                                  >
                                    {downloading ? 'Скачивание...' : 'Скачать'}
                                  </button>
                                ) : (
                                  <p>—</p>
                                ))
            }
              </div>
            </div>
          </div>
          <div className="right-column">
            <div className="section">
              <h3>Описание</h3>
              {change===false?(<div className="description">
                {details.software_description || 'Описание отсутствует'}
              </div>):(<> <textarea
                        rows='4'
                        placeholder={details.software_description}
                        value={discr}
                        style={{width:'300px', maxHeight:'300px', overflowY:'auto'}}
                        onChange={(e) => {setDiscr(e.target.value)}}/></>)}
            </div>
            <div className="section">
              <h3>Предыдущие версии</h3>
              <div className='prev-version' style={{display:'flex', flexDirection:'column', gap:'1vh'}}>
                {loadingVersions ? (
                  <p>Загрузка версий...</p>
                ) : allPreviousVersions.length > 0 ? (
                  allPreviousVersions.map((version, index) => (
                    <div key={index} className='version'>
                      <a
                        href="#"
                        onClick={(e) => handleVersionClick(e, version.id_firmwares || version.id_Firmwares)}
                        className="prev-version-link"
                      >
                        {version.name || 'Версия'} от {formatDate(version.software_release_date)}
                      </a>
                    </div>
                  ))
                ) : (
                  <p>—</p>
                )}
              </div>
            </div>

            <div className="section">
              <h3>Новые версии</h3>
              <div className='prev-version' style={{display:'flex', flexDirection:'column', gap:'1vh'}}>
                {loadingNextVersions ? (
                  <p>Загрузка версий...</p>
                ) : nextVersions.length > 0 ? (
                  nextVersions.map((version, index) => (
                    <div key={index} className='version'>
                      <a
                        href="#"
                        onClick={(e) => handleVersionClick(e, version.id_firmwares || version.id_Firmwares)}
                        className="prev-version-link"
                      >
                        {version.name || 'Версия'} от {formatDate(version.software_release_date)}
                      </a>
                    </div>
                  ))
                ) : (
                  <p>—</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}