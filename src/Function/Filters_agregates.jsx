import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../auth/AuthContext';
import useCheckMobile from '../shrineofvsakoe/checkMobile.jsx';
import { api } from '../fetchAPI.js'; // Импортируем единый экземпляр api

export function Filters( {onFilterChange, onFilterChange2, onModelChange, onProducerChange}) { 
  const componentTypeMap = {
    'DVS': 'dvs',
    'KPP': 'kpp',
    'RK': 'rk',
    'hydrorasp': 'hydro' ,
    'AP':'ap',
    'BK':'bk',
  };

  const tractorModelOptions = [
    { value: 'K7', label: 'К-7' },
    { value: 'K5', label: 'К-5' }
  ];

  const [FilterItems, setFilterItems] = useState({
    DVS: false,
    KPP: false,
    RK: false,
    hydrorasp: false,
    AP: false,
    BK: false
  });

  const [FilterItems2, setFilterItems2] = useState({
    K7: false,
    K5: false,
  });

  const [selectedTractorModels, setSelectedTractorModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState([]);
  const [selectedProducers, setSelectedProducers] = useState([]);
  const [componentModels, setComponentModels] = useState([]);
  const [producerOptions, setProducerOptions] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);
  
  const isMobile = useCheckMobile();
  const { token } = useAuth();

  const options = [...componentModels.map(item => ({ value: item, label: item }))];

  // Загружаем список производителей
  useEffect(() => {
    const fetchProducers = async () => {
      if (!token) {
        setProducerOptions([]);
        return;
      }
      
      try {
        setLoadingProducers(true);
        setProducerError(null);

        const data = await api.get('/components/');
        
        // Извлекаем уникальных производителей
        const producers = data
          .map(item => item.producer_comp)
          .filter(producer => producer && producer.trim() !== '')
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort(); // сортируем по алфавиту
        
        // Формируем опции для react-select
        const options = producers.map(producer => ({
          value: producer,
          label: producer
        }));
        
        setProducerOptions(options);
      } catch (err) {
        console.error('Ошибка загрузки производителей:', err);
        setProducerError(err.message);
      } finally {
        setLoadingProducers(false);
      }
    };
    
    fetchProducers();
  }, [token]);

  const handleModelChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map(opt => opt.value)
      : [];
    setSelectedModel(values);


    if (onModelChange) {
      onModelChange(values);
    }
  };

  const handleTractorModelChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map(opt => opt.value)
      : [];
    setSelectedTractorModels(values);


    if (onFilterChange2) {
      const activeTractorModels = values.map(key =>
        key === 'K7' ? 'K-7' : 'K-5'
      );
      onFilterChange2(activeTractorModels);
    }
  };

  const handleProducerChange = (selectedOptions) => {
    const values = selectedOptions 
      ? selectedOptions.map(opt => opt.value) 
      : [];
    setSelectedProducers(values);
    
    if (onProducerChange) {
      onProducerChange(values);
    }
  };

  const selectedOptions = options.filter(opt => selectedModel.includes(opt.value));
  const selectedTractorOptions = tractorModelOptions.filter(opt =>
    selectedTractorModels.includes(opt.value)
  );
  const selectedProducerOptions = producerOptions.filter(opt => 
    selectedProducers.includes(opt.value)
  );

  const handleFilterChange = (FilterType) => {
    const newFilter = {
      ...FilterItems,
      [FilterType]: !FilterItems[FilterType]
    };
    setFilterItems(newFilter);

    if (onFilterChange) {
      const activeFilters = Object.keys(newFilter).filter(key => newFilter[key]);
      onFilterChange(activeFilters);
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchModels = async () => {
    if (!token) {
      console.log('Нет токена, очищаем список моделей');
      setComponentModels([]);
      return;
    }


    const activeComponentTypes = Object.keys(FilterItems)
      .filter(key => FilterItems[key])
      .flatMap(key => componentTypeMap[key]);

    const activeTractorModels = selectedTractorModels.map(key =>
      key === 'K7' ? 'K-7' : 'K-5'
    );
    
    // Добавляем производителей в запрос
    const postData = {
      trac_model: activeTractorModels.length  > 0 ? activeTractorModels : [],
      type_comp: activeComponentTypes.length > 0 ? activeComponentTypes : [],
      producers: selectedProducers.length > 0 ? selectedProducers : [] // ← добавили производителей
    };


    try {
      setLoading(true);
      setError(null);
      
      console.log('Токен в Filters компоненте:', token ? 'Есть' : 'Нет');

      // Используем api.post вместо fetch
      const data = await api.post('/search/component-models', postData);
      setComponentModels(data.component_models || []);
    } catch (err) {
      console.error('Ошибка загрузки моделей компонентов:', err);
      setError('Не удалось загрузить модели компонентов');
      setComponentModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [FilterItems, selectedTractorModels, selectedProducers, token]); // ← добавили selectedProducers

  return (
    <>
      <div className='filters'>
        <div className='filters-scroll-bar' style={{height: '100%', width:'100%'}}>
          <div className='filter'>
            <label> 
              <span>ДВС</span>
              <input 
                type="checkbox"
                checked={FilterItems.DVS}
                onChange={() => handleFilterChange('DVS')}
              />
            </label>
          </div>
          <div className='filter'>
            <label>
              <span>КПП</span>
              <input 
                checked={FilterItems.KPP}
                onChange={() => handleFilterChange('KPP')}
                type="checkbox"/>
            </label>
          </div>
          <div className='filter'>
            <label>
              <span>РК</span>
              <input 
                checked={FilterItems.RK}
                onChange={() => handleFilterChange('RK')}
                type="checkbox"/>
            </label>
          </div>
          <div className='filter'>
            <label> 
              <span>Гидрораспределитель</span>
              <input 
                checked={FilterItems.hydrorasp}
                onChange={() => handleFilterChange('hydrorasp')}
                type="checkbox"/>
            </label>
          </div>
          <div className='filter'>
            <label> 
              <span>Автопилот</span>
              <input 
                checked={FilterItems.AP}
                onChange={() => handleFilterChange('AP')}
                type="checkbox"/>
            </label>
          </div>
          <div className='filter'>
            <label> 
              <span>БК</span>
              <input 
                checked={FilterItems.BK}
                onChange={() => handleFilterChange('BK')}
                type="checkbox"/>
            </label>
          </div>
        </div>
      </div>

      <div className='model' style={{ top: '370px' }}>
        <Select
          className='modelSelect'
          isMulti
          options={tractorModelOptions}
          value={selectedTractorOptions}
          onChange={handleTractorModelChange}
        menuPortalTarget={document.body}
          placeholder="Модель трактора"
          styles={{
            control: (base) => ({
              ...base,
              maxHeight: 200,
              overflowY: 'auto',
              color: 'black',
              backgroundColor: 'rgba(217, 217, 217, 1)',
              width: isMobile ? '100%' : '42vh',
              borderRadius: '15px',
              height: '53px',
              left: '50%',
              transform: 'Translate(-50%)',
            position: 'relative',
            zIndex: 1
          }),
          menu: (base) => ({ 
            ...base,
            zIndex: 9999,
            position: 'absolute',
            backgroundColor: 'white',
            marginBottom: '5px'
          }),
          menuPortal: (base) => ({  // ← ДОБАВЛЕНО!
            ...base,
            zIndex: 9999
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: 150,
              overflowY: 'auto',
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid rgba(217, 217, 217, 1)',
              scrollbarWidth: 'thin',
            zIndex: 9999
            }),
          }}
        />
      </div>

      {/* Фильтр по производителю */}
      <div className='model' style={{top: '444px'}}>
        <Select
          className='modelSelect'
          isMulti
          options={producerOptions}
          value={selectedProducerOptions}
          onChange={handleProducerChange}
          placeholder="Производитель"
          menuPortalTarget={document.body}
          menuPlacement="top" 
          isLoading={loadingProducers}
          isDisabled={!token || loadingProducers}
          noOptionsMessage={() => {
            if (!token) return "Требуется авторизация";
            if (loadingProducers) return "Загрузка...";
            if (producerError) return producerError;
            return "Нет доступных производителей";
          }}
          styles={{ 
            control: (base) => ({ 
              ...base, 
              maxHeight: 200, 
              overflowY: 'auto', 
              color: 'black', 
              backgroundColor:'rgba(217, 217, 217, 1)', 
              width: isMobile ? '100%':'42vh', 
              borderRadius: '15px', 
              height:'53px',
              left: '50%',
              transform: 'Translate(-50%)',
              position: 'relative',
              zIndex: 1
            }),
            menu: (base) => ({ 
              ...base,
              zIndex: 9999,
              position: 'absolute',
              backgroundColor: 'white',
              marginBottom: '5px'
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999
            }),
            menuList: (base) => ({ 
              ...base, 
              maxHeight: 150, 
              overflowY: 'auto', 
              backgroundColor:'white',
              color:'black', 
              border: '1px solid rgba(217, 217, 217, 1)',
              scrollbarWidth:'thin'
            }),
          }}
        />
        {producerError && token && (
          <div style={{ 
            color: 'red', 
            fontSize: '12px', 
            marginTop: '4px',
            textAlign: 'center',
            width: isMobile ? '100%' : '42vh',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Ошибка загрузки: {producerError}
          </div>
        )}
      </div>

      <div className='model' style={{top: '520px'}}>
        <Select
          className='modelSelect'
          isMulti
          options={options}
          value={selectedOptions}
          onChange={handleModelChange}
          placeholder="Модель"
          menuPortalTarget={document.body}
          menuPlacement="top" 
          isDisabled={loading || componentModels.length === 0}
          styles={{ 
            control: (base) => ({ 
              ...base, 
              maxHeight: 200, 
              overflowY: 'auto', 
              color: 'black', 
              backgroundColor:'rgba(217, 217, 217, 1)', 
              width: isMobile ? '100%':'42vh', 
              borderRadius: '15px', 
              height:'53px',
              left: '50%',
              transform: 'Translate(-50%)',
              position: 'relative',
              zIndex: 1
            }),
            menu: (base) => ({ 
              ...base,
              zIndex: 9999,
              position: 'absolute',
              backgroundColor: 'white',
              marginBottom: '5px'
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999
            }),
            menuList: (base) => ({ 
              ...base, 
              maxHeight: 150, 
              overflowY: 'auto', 
              backgroundColor:'white',
              color:'black', 
              border: '1px solid rgba(217, 217, 217, 1)',
              scrollbarWidth:'thin'
            }),
          }}
        />
      </div>

      <button 
        className='clear'
        data-testid="Clearbutton"
        onClick={() => {
          setFilterItems({
            DVS: false,
            KPP: false,
            RK: false,
            hydrorasp: false,
            AP:false,
            BK:false
          });
          setFilterItems2({
            K7: false,
            K5: false,
          });
          setSelectedModel([]);
          setSelectedProducers([]);
          setSelectedTractorModels([]);

          if (onFilterChange) onFilterChange([]);
          if (onFilterChange2) onFilterChange2([]);
          if (onModelChange) onModelChange([]);
          if (onProducerChange) onProducerChange([]);
        }}
      >
        Сброс
      </button>
    </>
  );
}