import { useState, useEffect,useMemo } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import DefaultImage from '../img/default.jpg';
import KPPImage from '../img/КПП.png';
import RKImage from '../img/РК.png';
import HRImage from '../img/Гидрораспределитель.png';
import WeiImage from '../img/ДВС Weichai.png';
import TMZImage from '../img/ДВС ТМЗ.png';
import JMZImage from '../img/ДВС ЯМЗ.png';
import BKImage from '../img/БК дисплей контроллер.png';
import { api, buildApiUrl } from '../fetchAPI.js';
import Select from 'react-select';


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
  const isEngineer = userRole === 'engineer';

  // Стейты для редактирования
  const [discr, setDiscr] = useState('');
  const [producer, setProducer] = useState('');
  const [isActual, setIsActual] = useState(false);
  const [isArchive, setIsArchive] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [status, setStatus] = useState('');
  const [type,setType] = useState ('');
  const [releaseDate, setReleaseDate] = useState('');
  const [change, setChange] = useState(false);
  const [endActuality, setEndActuality] = useState('');
  const [instructionFile, setInstructionFile] = useState(null);
  const [uploadingInstruction, setUploadingInstruction] = useState(false);
  const [softwareFile, setSoftwareFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [uploadingSoftware, setUploadingSoftware] = useState(false);
  const [previousSWVersion, setPreviousSWVersion] = useState(null);
  const [allTractorModels, setAllTractorModels] = useState([]);
  const [selectedTractorModels, setSelectedTractorModels] = useState([]);

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
        const data = await api.get(url);
        const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!item) throw new Error('Данные не найдены');
        setDetails(item);
      } catch (err) {
        console.error('Ошибка загрузки деталей ПО:', err);
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [po]); // удалили лишние зависимости

  // Синхронизация стейтов с текущей версией
  useEffect(() => {
    if (details) {
      setDiscr(details.software_description || '');
      setStatus(details.software_status || '');
      setIsActual(details.software_is_actual || false);
      setIsCritical(details.software_is_critical || false);
      setIsArchive(details.software_is_archive || false);
      setReleaseDate(details.software_release_date?.split('T')[0] || '');
      setEndActuality(details.software_end_actuality?.split('T')[0] || '');
      setProducer(details.software_producer || '');
      setType(details.component_type|| '')
      setPreviousSWVersion(details.software_previous_sw_version || null);
      // инструкция – только путь, файл не восстанавливаем
      setInstructionFile(null);
      setSoftwareFile(null);
       const initialSelected = (details.software_tractor_models || []).map(model => ({
            label: model,
            value: model
        }));
        setSelectedTractorModels(initialSelected);
    }
  }, [details]);

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
      const currentComponentId = po.id_Component;
      while (currentVersionId) {
        try {
          const url = `/search/software-component-info?id_firmwares=${encodeURIComponent(currentVersionId)}&id_component=${encodeURIComponent(currentComponentId)}`;
          const data = await api.get(url);
          const versionData = Array.isArray(data) && data.length > 0 ? data[0] : null;
          if (versionData) {
            versions.push(versionData);
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

  // Загрузка новых версий
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

  // Сохранение изменений
  const changePoInfo = async () => {
    const swId = details?.id_firmwares;
    const componentId = details?.id_component;
    if (!swId||!componentId) {
      alert('Нет ID прошивки для обновления');
      return;
    }

    try {
      if (type !== details.component_type && isModerator) {
        await api.patch(`/components/${componentId}`,{type:type});
        console.log('Тип компонента обновлён');
      }
      // 1. Загрузка файла инструкции, если выбран
      if (instructionFile && isModerator) {
        setUploadingInstruction(true);
        const formData = new FormData();
        formData.append('instruction_file', instructionFile);
        const uploadUrl = buildApiUrl(`/software/upload-instruction/${swId}`);
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
        console.log('Инструкция успешно загружена');
      }

      // 2. Обновление метаданных ПО
      const payload = isModerator ? {
        description: discr,
        producer: producer,
        status: status,
        component_type:type,
        release_date: releaseDate,
        is_actual: isActual,
        is_archive: isArchive,
        is_critical: isCritical,
        end_actuality: endActuality || null,
        previous_sw_version: previousSWVersion,
        tractor_model: selectedTractorModels.map(item => item.value), 
      } : {
        description: discr,
        status: status,
      };

      await api.patch(`/software/${swId}`, payload);
      console.log('Метаданные обновлены');

      // 3. Замена основного файла ПО, если выбран
      if (softwareFile && isModerator) {
        setUploadingSoftware(true);
        await api.replaceSoftwareFile(swId, softwareFile);
        console.log('Основной файл ПО заменён');
      }

      // 4. Перезагрузка деталей и сброс режима
      const url = `/search/software-component-info?id_firmwares=${encodeURIComponent(swId)}&id_component=${encodeURIComponent(po.id_Component)}`;
      const data = await api.get(url);
      const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (item) setDetails(item);

      setChange(false);
      setInstructionFile(null);
      setSoftwareFile(null);
      alert('Данные успешно обновлены');
    } catch (err) {
      console.error('Ошибка:', err);
      alert(`Ошибка: ${err.message}`);
    } finally {
      setUploadingInstruction(false);
      setUploadingSoftware(false);
    }
  };

  useEffect(() => {
  const fetchTractorModels = async () => {
    try {
       const response = await api.post('/search/tractor-models', {
        component_types: [],
        component_models: [],
        component_producers: [],
        software_status: []
      });
      const modelsArray = Array.isArray(response) ? response : [];
      const modelNames = modelsArray.map(item => item.model).filter(Boolean);
      setAllTractorModels(modelNames);
    } catch (err) {
      console.error('Ошибка загрузки моделей тракторов:', err);
      setAllTractorModels([]);
    }
  };
  fetchTractorModels();
}, []);
  const tractorOptions = useMemo(() => {
    return allTractorModels.map(model => ({
        label: model,
        value: model
    }));
}, [allTractorModels]);

  // Переключение на другую версию
  const handleVersionClick = async (e, versionId) => {
    e.preventDefault();
    if (!versionId) return;
    setChange(false); // сбрасываем режим редактирования
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

  // Вспомогательные функции
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const getStatusText = () => {
    if (details.software_status === 'serial') return 'Серийное';
    if (details.software_status === 'experienced' || details.software_status === 'experimental') return 'Опытное';
    if (details.software_status === 'in operation' || details.software_status === 'in_operation') return 'Для эксплуатации';
    return '—';
  };

  const getStatusActualityText = () => {
    if (details.software_is_critical) return 'Требует обновление';
    if (details.software_is_actual && !details.software_is_critical) return 'Актуальное';
    return 'Устаревшее';
  };
  const typeRus = (type) => {
     const rusNames = {
      'HR':'Гидрораспределитель',
      'BK':'БК',
      'RK':'РК',
      'KPP':'КПП',
      'DVS':'ДВС',
      'AUTOPILOT':'Автопилот',
     } 
     return rusNames[type]
  }

  const chooseActual = (e) => {
    const val = e.target.value;
    if (val === 'Актуальное') {
      setIsActual(true);
      setIsCritical(false);
    } else if (val === 'Требует обновление') {
      setIsActual(false);
      setIsCritical(true);
    } else { // Устаревшее
      setIsActual(false);
      setIsCritical(false);
    }
  };

  const removeExtension = (filename) => {
    if (!filename) return '';
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
  };

  const ImageToComponent = (type_component, name_component) => {
    const typeLower = type_component?.toLowerCase() || '';
    const modelLower = name_component?.toLowerCase() || '';
    if (typeLower.includes('кпп') || typeLower.includes('kpp')) return KPPImage;
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
        if (typeLower.includes(key)) return image;
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
    const fileId = details.id_firmwares;
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
    const fileId = details.id_firmwares;
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
      console.error('Ошибка скачивания инструкции:', error);
      alert('Не удалось скачать инструкцию');
    } finally {
      setDownloading(false);
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


  const actualityPeriod = details.software_end_actuality
    ? `${formatDate(details.software_release_date)} — ${formatDate(details.software_end_actuality)}`
    : `с ${formatDate(details.software_release_date)} (бессрочно)`;

    

  
  return (
    <div className='bolvanchyk' style={{ position: 'relative' }}>
      <button onClick={onBack} className="go-back" style={{ top: '50px', left: '120px' }}></button>
      <div className="po-details-container">
        <div className="po-details-content">
          <div className="left-column">
            <div className="section">
              <h2>
                <span>{details.software_name || 'ПО'} от {formatDate(details.software_release_date)}</span>
                <br />
                {(change&&isModerator) ? 
                 (<select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="HR">Гидрораспределитель</option>
                  <option value="DVS">ДВС</option>
                  <option value="KPP">КПП</option>
                  <option value="RK">РК</option>
                  <option value="BK">БК</option>
                  <option value="AUTOPILOT">Автопилот</option>
                </select>)
                  :
                   (<span className='text-names'>{typeRus(details.component_type)}</span>)
            }
            <br />
            <span className='text-names'>{details.component_name}</span>
            <br />
      {(change && isModerator) ? (
          <div className="tractor-models-editor">
              <label>Модели тракторов:</label>
              <Select
                  options={tractorOptions}
                  value={selectedTractorModels}
                  onChange={setSelectedTractorModels}
                  isMulti
                  placeholder="Выберите модели..."
                  className="tractor-multiselect"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={{
            control: (base) => ({
              ...base,
              maxHeight: 50,
              overflowY: 'auto',
              color: 'black',
              backgroundColor: 'rgb(255, 255, 255)',
              width:  '30vh',
              borderRadius: '15px',
              height: '53px',
              left: '0%',
              fontSize:'14px',
              // transform: 'Translate(-50%)',
            // position: 'relative',
            zIndex: 1
          }),
          menu: (base) => ({ 
            ...base,
            zIndex: 9999,
            position: 'absolute',
            backgroundColor: 'white',
            marginBottom: '5px',
          }),
          menuPortal: (base) => ({  
            ...base,
            zIndex: 9999
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: 150,
              overflowY: 'auto',
              fontSize:'16px',
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid rgb(255, 255, 255)',
              scrollbarWidth: 'thin',
            zIndex: 9999
            }),
          }}
              />
          </div>
      ) : (
          details.software_tractor_models && details.software_tractor_models.length > 0 && (
              <span className='text-names'>
                  <span>Модели тракторов: </span>
                  <span>{details.software_tractor_models.join(', ')}</span>
              </span>
          )
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
              {(change && isModerator) ? (
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              ) : (
                <p>{formatDate(details.software_release_date)}</p>
              )}
            </div>

            <div className="section">
              {(isModerator && change) ? (
                <>
                  <h3>Дата конца актуальности</h3>
                  <input
                    type='date'
                    value={endActuality || ''}
                    onChange={(e) => setEndActuality(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <h3>Период актуальности</h3>
                  <p>{actualityPeriod}</p>
                </>
              )}
            </div>

            <div>
              <h3>Назначение</h3>
              {!change ? (
                <p>{getStatusText()}</p>
              ) : (
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="serial">Серийное</option>
                  <option value="experienced">Опытное</option>
                  <option value="in operation">Для эксплуатации</option>
                </select>
              )}
            </div>

            <div>
              <h3>Статус</h3>
              {(isModerator && change) ? (
                <select value={getStatusActualityText()} onChange={chooseActual}>
                  <option value="Актуальное">Актуальное</option>
                  <option value="Устаревшее">Устаревшее</option>
                  <option value="Требует обновление">Требует обновление</option>
                </select>
              ) : (
                <p>{getStatusActualityText()}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '5%' }}>
              <div className="section">
                <h3>Установщик</h3>
                {change && isModerator ? (
                  <div>
                    <input type="file" onChange={(e) => setSoftwareFile(e.target.files[0])} />
                    {softwareFile && <p style={{ fontSize: '12px' }}>Выбран: {removeExtension(softwareFile.name)}</p>}
                    {uploadingSoftware && <p>Загрузка...</p>}
                  </div>
                ) : (
                  details.software_path ? (
                    <button className="download-button" onClick={handleDownloadSoftware} disabled={downloading}>
                      {downloading ? 'Скачивание...' : 'Скачать'}
                    </button>
                  ) : (
                    <p>—</p>
                  )
                )}
              </div>
              <div className="section">
                <h3>Инструкция</h3>
                {change && isModerator ? (
                  <div>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setInstructionFile(e.target.files[0])} />
                    {instructionFile && <p style={{ fontSize: '12px' }}>Выбран: {removeExtension(instructionFile.name)}</p>}
                    {uploadingInstruction && <p>Загрузка...</p>}
                  </div>
                ) : (
                  details.software_path_instruction ? (
                    <button className="download-button" onClick={handleDownloadInstruction} disabled={downloading}>
                      {downloading ? 'Скачивание...' : 'Скачать'}
                    </button>
                  ) : (
                    <p>—</p>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="section">
              <h3>Описание</h3>
              {!change ? (
                <div className="description">{details.software_description || 'Описание отсутствует'}</div>
              ) : (
                <textarea
                  rows="4"
                  placeholder="Описание"
                  value={discr}
                  style={{ width: '300px', maxHeight: '300px', overflowY: 'auto' }}
                  onChange={(e) => setDiscr(e.target.value)}
                />
              )}
            </div>

            <div className="section">
              <h3>Предыдущие версии</h3>
              <div className='prev-version' >
                {loadingVersions ? (
                  <p>Загрузка версий...</p>
                ) : allPreviousVersions.length > 0 ? (
                  allPreviousVersions.map((version, idx) => (
                    <div key={idx} className="version">
                      <a href="#" onClick={(e) => handleVersionClick(e, version.id_firmwares)}
                        className="prev-version-link">
                        {removeExtension(version.name) || 'Версия'} от {formatDate(version.software_release_date)}
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
              <div className='prev-version'>
                {loadingNextVersions ? (
                  <p>Загрузка версий...</p>
                ) : nextVersions.length > 0 ? (
                  nextVersions.map((version, idx) => (
                    <div key={idx} className="version">
                      <a href="#" onClick={(e) => handleVersionClick(e, version.id_firmwares)}
                        className="prev-version-link">
                        {removeExtension(version.name) || 'Версия'} от {formatDate(version.software_release_date)}
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
        <div className='change-buttons-container'>
          {(isModerator || isEngineer) && (
            <button onClick={() => setChange(true)} className='change-buttons'>Изменить</button>
          )}
          {change && (
            <>
              <button onClick={() => setChange(false)} className='change-buttons'>Отменить</button>
              <button onClick={changePoInfo} className='change-buttons'>Принять</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}