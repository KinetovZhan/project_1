import React, { useState, useEffect } from 'react'; 
import Select from 'react-select';


export function Filters( {onFilterChange, onFilterChange2, onModelChange}) { 


  const componentTypeMap = {
    DVS: 'dvs',
    KPP: 'kpp',
    RK: 'rk',
    hydrorasp: 'hydro' 
  };

  const tractorModelMap = {
    K7: 'K-7',
    K5: 'K5'
  };

  const [FilterItems, setFilterItems] = useState({
    DVS: false,
    KPP: false,
    RK: false,
    hydrorasp: false
  });

  const [FilterItems2, setFilterItems2] = useState({
    K7: false,
    K5: false,
  })


  const [selectedModel, setSelectedModel] = useState([]);
  const [componentModels, setComponentModels] = useState([]);
  
  const options = [...componentModels.map(item => ({ value: item, label: item }))];


  const handleModelChange = (selectedOptions) => {
    const values = selectedOptions 
      ? selectedOptions.map(opt => opt.value) 
      : [];
    
    setSelectedModel(values);
    
    if (onModelChange) {
      onModelChange(values);
    }
  };


  const selectedOptions = options.filter(opt => selectedModel.includes(opt.value));

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


  const handleFilterChange2 = (FilterType2) => {
    const newFilter2 = {
      ...FilterItems2,
      [FilterType2]: !FilterItems2[FilterType2]
    }
    setFilterItems2(newFilter2);

    if (onFilterChange2) {
      const activeFilters2 = Object.keys(newFilter2).filter(key => newFilter2[key]);
      onFilterChange2(activeFilters2);
    }
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchModels = async () => {
    
    const activeComponentTypes = Object.keys(FilterItems)
      .filter(key => FilterItems[key])
      .map(key => componentTypeMap[key]);
    
    const activeTractorModels = Object.keys(FilterItems2)
      .filter(key => FilterItems2[key])
      .map(key => tractorModelMap[key]);

    
    
    const postData = {
      trac_model: activeTractorModels.length  > 0 ? activeTractorModels : [],
      type_comp: activeComponentTypes.length > 0 ? activeComponentTypes : []
    };
    
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://172.20.46.71:8000/component-models', {
        method: 'POST',
        headers: {  
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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
    
  }, [FilterItems,FilterItems2]);


  
  return(
    <>
      <div className='filters'>
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
      </div>

      <div className='filters2'>
        <div className='filter'>
          <label>
            <span>Выбрать все</span>
            <input type="checkbox" />
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>К-7</span>
            <input 
              checked={FilterItems2.K7}
              onChange={() => handleFilterChange2('K7')}
              type="checkbox" 
            />
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>К-5</span>
            <input 
              checked={FilterItems2.K5}
              onChange={() => handleFilterChange2('K5')}
              type="checkbox" />
          </label>
        </div>
  
      </div>
        <div className='model'>
          <Select
          className='modelSelect'
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleModelChange}
            // controlShouldRenderValue={false}          
            placeholder="Модель"
            isDisabled={loading || componentModels.length === 0}
            styles={{ 
              control: (base) => ({ ...base, maxHeight: 200, overflowY: 'auto', color: 'black', backgroundColor:'rgba(217, 217, 217, 1)', width:'360px', borderRadius: '15px', height:'53px'}),
              menuList: (base) => ({ ...base, maxHeight: 150, overflowY: 'auto', backgroundColor:'white',color:'black', border: '1px solid rgba(217, 217, 217, 1)',scrollbarWidth:'thin'}),
            }}
          />
        </div>
        {/* <div className="showModels">
          <div className="showModelsHeader">
            <strong>Выбранные модели:</strong>
            <h2
              className="deleteAll"
              onClick={() => {
                setSelectedModel([]);
                if (onModel) onModelChange([]);
              }}
            >
              Очистить
            </h2>
          </div>

          {selectedModel.length > 0 ? (
            <ul>
              {selectedModel.map((model, index) => (
                <li
                  key={index}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const newSelectedModel = selectedModel.filter(m => m !== model);
                    const newSelectedOptions = newSelectedModel.map(m => ({ value: m, label: m }));
                    handleModelChange(newSelectedOptions);
                  }}
                >
                  {model} ×
                </li>
              ))}
            </ul>
          ) : (
            <span></span>
          )}
        </div> */}
        <button 
          className='clear'
          onClick={() => {
            setFilterItems({
              DVS: false,
              KPP: false,
              RK: false,
              hydrorasp: false
            });
            setFilterItems2({
              K7: false,
              K5: false,
            });
            setSelectedModel([])

            // Уведомляем родителя
            if (onFilterChange) onFilterChange([]);
            if (onFilterChange2) onFilterChange2([]);
            if (onModelChange) onModelChange([]);
          }}
          
        >
          Сброс
        </button>

    </>
  )
}
