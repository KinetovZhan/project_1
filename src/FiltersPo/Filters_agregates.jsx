import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../auth/AuthContext.jsx';
import useCheckMobile from '../CheckMobile/checkMobile.jsx';
import { api } from '../fetchAPI.js'; // Импортируем единый экземпляр api

export function Filters( {onFilterChange, onFilterChange2, onModelChange, onProducerChange, onStatusChange,onActualChangePo}) { 


  // const tractorModelOptions = [
  //   { value: 'K7', label: 'К-7' },
  //   { value: 'K5', label: 'К-5' }
  // ];

  const [FilterItems, setFilterItems] = useState({
    DVS: false,
    KPP: false,
    RK: false,
    HR: false,
    BK: false
  });

  const [FilterItems2, setFilterItems2] = useState({
    K7: false,
    K5: false,
  });

  const statusOptions = [
    { value: "serial", label: "Серийное" },
    { value: "experienced", label: 'Опытное' },
    { value: "in_operation", label: 'Для эксплуатации' }
  ];

  const [selectedTractorModels, setSelectedTractorModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState([]);
  const [selectedProducers, setSelectedProducers] = useState([]);
  const [componentModels, setComponentModels] = useState([]);
  const [producerOptions, setProducerOptions] = useState([]);
  const [tractorOptions, setTractorOptions] = useState([])
  const [selectedActuality, setSelectedActuality] = useState(null);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [producerError, setProducerError] = useState(null);
  const [loadingTractorModels, setLoadingTractorModels] = useState(false);
  const [tractorError, setTractorError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState([])


  const isMobile = useCheckMobile();
  const { token } = useAuth();

  const options = componentModels;
 
  const selectedStatusOptions = statusOptions.filter(opt =>
    selectedStatus.includes(opt.value)
  );

  const actualityOptions = [
    {value:'critical', label: 'Требуется обновление'},
    {value:'actual', label: 'Актуальное'},
    {value:'old', label: 'Устаревшее'}
  ];
  useEffect (() => {
    const fetchProducers = async () => {
      if (!token) {
        setProducerOptions([]);
        return;
      }

      const typeCodeMap = {
      DVS: 'DVS',
      KPP: 'KPP', 
      RK: 'RK',
      hydrorasp: 'HR',   
      BK: 'BK'
    };

    const activeTypes = Object.keys(FilterItems)
      .filter(key => FilterItems[key])
      .map(key => typeCodeMap[key]);

    // Формируем тело запроса с правильными полями
    const requestBody = {
      trac_model: selectedTractorModels.length > 0 ? selectedTractorModels : [],
      type_comp: activeTypes,
      component_models: selectedModel,  //  name_comp → component_models
      software_status: selectedStatus   // status → software_status
    };

     
  try {
        setLoadingProducers(true);
        setProducerError(null);

        const producerData = await api.post('search/component-producers',requestBody)
        let filteredData = producerData;
        // Извлекаем уникальных производителей
        const producers = filteredData
          .map(item => item.producer)
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
  }, [token, selectedModel,selectedTractorModels,selectedStatus]);

  useEffect(() => {
  const fetchTractorModel = async () => {
    if (!token) {
      setTractorOptions([]);
      return;
    }

    const typeCodeMap = {
      DVS: 'DVS',
      KPP: 'KPP',
      RK: 'RK',
      HR: 'HR',
      BK: 'BK'
    };

    const activeTypes = Object.keys(FilterItems)
      .filter(key => FilterItems[key])
      .map(key => typeCodeMap[key]);

    // Используем ту же структуру, что и в Objects
    // const requestBody = {
    //   search: '', 
    //   trac_model: [], 
    //   type_comp: activeTypes,
    //   name_comp: selectedModel,
    //   producers: selectedProducers,
    //   status: selectedStatus
    // };
    const requestBody = {
    component_models: selectedModel.length > 0 ? selectedModel : [],
    component_types: activeTypes,
    component_producers: selectedProducers,
    software_status: selectedStatus
    };

    try {
      setLoadingTractorModels(true);
      setTractorError(null);

      // Используем тот же эндпоинт, что и в Objects
      
      // const response = await api.post('search/component-info', requestBody);
      // const response2 = await api.post('search/archive-component-info', requestBody);
      const response = await api.post('search/tractor-models', requestBody);

      // const combinedResponse = [...response, ...response2];
      
      // Извлекаем уникальные модели тракторов из поля tractor_model (которое является массивом)
       let tractorModels = [];
      
      // combinedResponse.forEach(item => {
      //   if (item.tractor_model && Array.isArray(item.tractor_model)) {
      //     item.tractor_model.forEach(model => {
      //       if (model && model.trim() !== '' && !tractorModels.includes(model)) {
      //         tractorModels.push(model);
      //       }
      //     });
      //   }
      // });
     
      if (Array.isArray(response)) {
          tractorModels = response;
        } else if (response && Array.isArray(response.tractor_models)) {
          tractorModels = response.tractor_models;
        } else {
          console.warn('Неожиданный формат ответа:', response);
          tractorModels = [];
        }

        const modelNames = tractorModels
          .map(item => item&&item.model)
          .filter(model => typeof model === 'string' && model.trim() !== '')
          .map(model => model.trim());

        // const uniqueNames = [...new Set(modelNames)].sort();

      // Формируем опции для react-select
      // const options = tractorModels.map(model => ({
      //   value: model,
      //   label: model
      // }));
      const options = modelNames.map(model => ({ value: model, label: model }));

      console.log('Найденные модели тракторов:', tractorModels); // Для отладки
      setTractorOptions(options);
      
    } catch (err) {
      console.error('Ошибка загрузки моделей тракторов:', err);
      setTractorError(err.message);
    } finally {
      setLoadingTractorModels(false);
    }
  };

  fetchTractorModel();
}, [token, FilterItems, selectedModel, selectedProducers, selectedStatus]);


  useEffect(() => {
  const fetchModels = async () => {
  if (!token) {
    setComponentModels([]);
    return;
  }

  // Сопоставление ключей чекбоксов с кодами в БД
  const typeCodeMap = {
    DVS: 'DVS',
    KPP: 'KPP',
    RK: 'RK',
    HR: 'HR',   // важно: hydrorasp -> HR
    BK: 'BK'
  };

  const activeTypes = Object.keys(FilterItems)
    .filter(key => FilterItems[key])
    .map(key => typeCodeMap[key]);

  const postData = {
    trac_model: selectedTractorModels.length > 0 ? selectedTractorModels : [],
    type_comp: activeTypes,
    producers: selectedProducers,
    status: selectedStatus
  };
  ;
        

  try {
    setLoading(true);
    const response = await api.post('search/component-models', postData);

        let modelsArray = [];
        if (Array.isArray(response)) {
          modelsArray = response;
        } else if (response && Array.isArray(response.component_models)) {
          modelsArray = response.component_models;
        } else {
          console.warn('Неожиданный формат ответа:', response);
          modelsArray = [];
        }

        const modelNames = modelsArray
          .map(item => item && item.name)
          .filter(name => typeof name === 'string' && name.trim() !== '')
          .map(name => name.trim());

        const uniqueNames = [...new Set(modelNames)].sort();

        // Формируем массив объектов для react-select
        const options = uniqueNames.map(name => ({ value: name, label: name }));
        setComponentModels(options);
      } catch (err) {
        console.error(err);
        setComponentModels([]);
      } finally {
        setLoading(false);
      }
    };
fetchModels();
}, [FilterItems, selectedTractorModels, selectedProducers, selectedStatus]);


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
      onFilterChange2(values);
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

  const handleStatusChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setSelectedStatus(values);
    if (onStatusChange) {
      onStatusChange(values);
    }
  };

  const selectedOptions = options.filter(opt => selectedModel.includes(opt.value));
  const selectedTractorOptions = tractorOptions.filter(opt =>
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
    console.log(`evfsd ${FilterItems.DVS}`)
  };
  const handleActualChange = (selectedOptions) => {
  const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
  setSelectedActuality(selectedOptions);
  if (onActualChangePo) {
    onActualChangePo(values); // передаём массив строк
  }
};

  // Форматирование опций с цветным кружком для фильтра актуальности
const formatActualityOptionLabel = ({ value, label }) => {
  let color;
  switch (value) {
    case 'critical': color = '#ff4444'; break; // красный
    case 'actual': color = '#44ff44'; break;   // зелёный
    case 'old': color = '#ffff44'; break;     // жёлтый
    default: color = '#ccc';
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: '8px',
        }}
      />
      {label}
    </div>
  );
};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 
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
              <span>Рулевая колонка</span>
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
                checked={FilterItems.HR}
                onChange={() => handleFilterChange('HR')}
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
      

      <div className='model model-tractor'>
        <Select
          className='modelSelect'
          isMulti
          options={tractorOptions}
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
          menuPortal: (base) => ({  
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
      <div className='model model-producer'>
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

      <div className='model model-uzel'>
        <Select
          className='modelSelect'
          isMulti
          options={options}
          value={selectedOptions}
          onChange={handleModelChange}
          placeholder="Название узла"
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

      <div className='model model-purpose'>
        <Select
          className='modelStatus'
          isMulti
          options={statusOptions}
          value={selectedStatusOptions}
          onChange={handleStatusChange}
          placeholder="Назначение"
          menuPortalTarget={document.body}
          menuPlacement="top" 
          isDisabled={loading}
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
        <div className="actuality-filter model-status">
          <Select
            isMulti
            className="actuality-select"
            options={actualityOptions}
            value={selectedActuality}
            onChange={handleActualChange}
            placeholder="Все статусы"
            isClearable={true}
            menuPlacement="top"
            menuPortalTarget={document.body}
            formatOptionLabel={formatActualityOptionLabel}   // <-- добавлено
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
              multiValue: (base) => ({
                ...base,
                fontSize: '13px'
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({
                ...base,
                maxHeight: 150,
                overflowY: 'auto',
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid rgba(217, 217, 217, 1)',
                scrollbarWidth: 'thin',
                fontSize: '16px'
              }),
              option: (base, state) => ({
                ...base,
                display: 'flex',
                alignItems: 'center',
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
            HR: false,
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
          setSelectedStatus([]);
          setSelectedActuality([])

          if (onFilterChange) onFilterChange([]);
          if (onFilterChange2) onFilterChange2([]);
          if (onModelChange) onModelChange([]);
          if (onProducerChange) onProducerChange([]);
          if (onStatusChange) {onStatusChange([])}
          if (onActualChangePo) {onActualChangePo([])}
          
        }}
      >
        Сброс
      </button>
    </>
  );
}

