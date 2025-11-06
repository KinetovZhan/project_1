import Image from './img/Image.png'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';



export function Header({ onLogout }) {
  return(
    <>
      <header>
        <div className='mainText'>
          <h3>Сервис просмотра версий ПО</h3>
        </div>
        <div className='navigation'>
          <h3>Помощь</h3>
          {onLogout && (
            <h3 onClick={onLogout} style={{cursor: 'pointer'}}>Выйти</h3>
          )}
        </div>
      </header>
    </>
  )
}


export function Filters() {
  return(
    <>
      <div className='filters'>
        <div className='filter'>
          <label> 
            <span>ДВС</span>
            <input type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>КПП</span>
            <input type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>РК</span>
            <input type="checkbox"/>
          </label>
        </div>
        <div className='filter'>
          <label> 
            <span>Гидрораспределитель</span>
            <input type="checkbox"/>
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
            <span>К-525</span>
            <input type="checkbox" />
          </label>
        </div>
        <div className='filter'>
          <label>
            <span>К-742МСТ1</span>
            <input type="checkbox" />
          </label>
        </div>

        <div className='model'>
          <select id="tractor-select" name="tractor">
            <option value=""><h3>Модель</h3></option>
            <option value="m1"><h3>К-743</h3></option>
            <option value="m2"><h3>К-745</h3></option>
            <option value="m3"><h3>К-743</h3></option>
          </select>
        </div>
      </div>
    </>
  )
}



/*export function Sidebar({ activeButton, handleButtonClick}) {
  return (
    <div className='sidebar'>
      { Блок с кнопками "Трактор" и "Агрегаты" }
      <div className='choose'>
        <button 
          className={activeButton === 'tractor' ? 'active' : ''}
          onClick={() => handleButtonClick('tractor')}
        >
          Трактор
        </button>
        <br />
        <button
          className={activeButton === 'aggregates' ? 'active' : ''}
          onClick={() => handleButtonClick('aggregates')}
        >
          Агрегаты
        </button>
      </div>


      { 🔹 Новая кнопка — использует тот же стиль, что и другие }
      <div className='add-po-container'>
        <button 
          // Не добавляем класс active — чтобы не было выделения как у активной кнопки
          onClick={() => alert('Пока не реализовано')}
        >
          Добавить ПО
        </button>
      </div>

      { Фильтры — остаются как есть 
      {activeButton === 'aggregates' && <Filters />}
      {activeButton === 'tractor' && <Filters2 />}
    </div>
  );
}*/
export function Sidebar({ activeButton, handleButtonClick, selectedModel, onModelChange }) {
  return (
    <div className='sidebar'>
      {/* Блок с кнопками "Трактор" и "Агрегаты" */}
      <div className='choose'>
        <button 
          className={activeButton === 'tractor' ? 'active' : ''}
          onClick={() => handleButtonClick('tractor')}
        >
          Трактор
        </button>
        <br />
        <button
          className={activeButton === 'aggregates' ? 'active' : ''}
          onClick={() => handleButtonClick('aggregates')}
        >
          Агрегаты
        </button>
      </div>

      {/* 🔹 Новая кнопка — использует тот же стиль, что и другие */}
      <div className='add-po-container'>
        <button 
          onClick={() => alert('Пока не реализовано')}
        >
          Добавить ПО
        </button>
      </div>

      {/* Фильтры — остаются как есть */}
      {activeButton === 'aggregates' && <Filters />}
      {activeButton === 'tractor' && (
        <Filters2 
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
      )}
    </div>
  );
}



export function Objects() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Запрос к твоему серверу
    fetch('http://localhost:5000/api/dvs')
      .then(response => response.json())
      .then(data => {
        setVersions(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки данных:', error);
        setLoading(false);
      });
  }, []);
  const handleDownload = (id) => {
    window.open(`http://localhost:5000/api/download/${ id }`, '_blank');
  };

  if (loading) {
    return <div className="maininfo">Загрузка версий ДВС...</div>;
  }

  return (
    <div className="maininfo">
      <h3>Последние версии ПО для ДВС</h3>
      <ul className="List">
        {versions.map(ver => (
          <li key={ver.id}>
            <div className="objectmenu">
              <img className="object" src={Image} alt="ДВС" />
              <div className="inform">
                <h3>№{ver.id} от {ver.date} ({ver.type})</h3>
                <h4>{ver.description}</h4>
                <button 
                  className="download"
                  onClick={() => handleDownload(ver.id)}
                >
                  Скачать
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


/*export function MainPart({activeButton}) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects />}
       {activeButton === 'tractor' && <TractorTable />}
      <SearchBar/>

    </div>
  )
} */
// Более менее норм, вызывает таблицу с конкретной моделью
export function MainPart({ activeButton, selectedModel }) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects />}
      {activeButton === 'tractor' && (selectedModel ? <TractorTable selectedModel={selectedModel}/>: '') }
      <SearchBar/>
    </div>
  );
}


//Поле поиска в правом верхнем углу
export function SearchBar({onSearch}) {
  const [query, setQuery] = useState('');
  const handleSearch = () => {
    if (onSearch && typeof onSearch === 'function') {
      onSearch(query);
    }
  };
  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
     handleSearch(); 
    } 
  };

  return (
    <div className = "search-bar">
      <input
        type = "text"
        placeholder = "Поиск"
        value = {query}
        onChange = {(e) => setQuery(e.target.value)} 
        onKeyDown = {handleKeydown}
      />
      <button type = "button" //Кнопка поиска с иконкой лупв
      onClick = {handleSearch}
      className='search-icon-button'
      >
        <svg width = "16" height = "16" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2">
          <circle cx = "11" cy = "11" r = "8" />
          <line x1 = "21" y1 = "21" x2 = "16.65" y2 = "16.65" />
        </svg>
      </button>  
    </div>
  
  );
  
};





//Трактор

/*export function Filters2() {
  return (
    <>
      <div className='filterstrac'>
        <label>
          <span>К-742МСТ</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>К-735</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>К-525</span>
          <input type="checkbox" />
        </label>
      </div>

      <div className='Дата выпуска'>
      </div>

      <div className='Поиск по дилеру'>
      </div>


      <div className='filterstrac2'>
        <label>
          <span>Серийное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Опытное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Актуальное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Критические</span>
          <input type="checkbox" />
        </label>
      </div>


      <div className='Majmin'>
        <button className='majmin_button'>Требуется MAJ</button>
        <button className='majmin_button'>Требуется MIN</button>
      </div>
    </>
  )
}*/
export function Filters2({ selectedModel, onModelChange }) {
  const models = ['К-742МСТ', 'К-735', 'К-525'];

  const handleModelChange = (modelName) => {
    onModelChange(modelName);
  };

  return (
    <>
      <div className='filterstrac'>
        {models.map(model => (
          <label key={model} >
            <span>{model}</span>
            <input 
              type="checkbox"
              checked={selectedModel === model}
              onChange={(e) => handleModelChange(model, e.target.checked)}
            />
          </label>
        ))}
      </div>

      <div className='Дата выпуска'>
      </div>

      <div className='Поиск по дилеру'>
      </div>

      <div className='filterstrac2'>
        <label>
          <span>Серийное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Опытное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Актуальное</span>
          <input type="checkbox" />
        </label>

        <label>
          <span>Критические</span>
          <input type="checkbox" />
        </label>
      </div>

      <div className='Majmin'>
        <button className='majmin_button'>Требуется MAJ</button>
        <button className='majmin_button'>Требуется MIN</button>
      </div>
    </>
  );
}

//фулл неправильно, просто макет таблицы тракторов!!!!!!!!!!!!!!!

export function TractorTable({ selectedModel }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mockTractors = [
    {
      id: 1,
      VIN: "1HGBH41JXMN109186",
      model: "К-742МСТ",
      releaseDate: "2023-01-15",
      region: "Московская область",
      motoHours: 1250,
      lastActivity: "2024-01-20",
      DVS: "Исправен",
      KPP: "Исправна",
      RK: "Требует проверки",
      BK: "Исправен"
    },
    {
      id: 2,
      VIN: "2FMDK3GC5DBA53674", 
      model: "К-735",
      releaseDate: "2022-08-10",
      region: "Ленинградская область",
      motoHours: 890,
      lastActivity: "2024-01-18",
      DVS: "Исправен",
      KPP: "Исправна",
      RK: "Исправен",
      BK: "Исправен"
    },
    /*{
      id: 3,
      VIN: "3TMXK3GC5DBA98765",
      model: "К-525",
      releaseDate: "2023-05-20", 
      region: "Краснодарский край",
      motoHours: 1560,
      lastActivity: "2024-01-22",
      DVS: "На обслуживании",
      KPP: "Исправна",
      RK: "Исправен", 
      BK: "Требует замены"
    }*/,
    {
      id: 4,
      VIN: "4HGBH41JXMN109187",
      model: "К-742МСТ",
      releaseDate: "2023-03-20",
      region: "Новосибирская область",
      motoHours: 980,
      lastActivity: "2024-01-19",
      DVS: "Исправен",
      KPP: "Требует ремонта",
      RK: "Исправен",
      BK: "Исправен"
    },
    {
      id: 5,
      VIN: "5FMDK3GC5DBA53675",
      model: "К-735", 
      releaseDate: "2022-11-05",
      region: "Ростовская область",
      motoHours: 1340,
      lastActivity: "2024-01-21",
      DVS: "На обслуживании",
      KPP: "Исправна",
      RK: "Требует проверки",
      BK: "Исправен"
    },
    /*{
      id: 6,
      VIN: "6TMXK3GC5DBA98766",
      model: "К-525",
      releaseDate: "2023-07-12", 
      region: "Тюменская область",
      motoHours: 720,
      lastActivity: "2024-01-23",
      DVS: "Исправен",
      KPP: "Исправна",
      RK: "Исправен", 
      BK: "Исправен"
    }*/
  ];

  const filteredTractors = selectedModel 
    ? tractors.filter(tractor => tractor.model === selectedModel)
    : tractors;

  useEffect(() => {
    const API_URL = '/api/tractors';
    
    const fetchTractors = async () => {
      try {
        const USE_MOCK_DATA = true;
        
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setTractors(mockTractors);
          return;
        }
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Сервер вернул не JSON формат');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Сервер вернул не массив');
        }
       
        setTractors(data);  
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
          setError('Ошибка: Сервер вернул HTML вместо JSON. Проверьте API endpoint.');
        } else {
          setError(`Ошибка: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTractors();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div>Загрузка данных о тракторах...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error">
        <div>Ошибка: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  if (tractors.length === 0) {
    return <div className="no-data">Нет данных о тракторах</div>;
  }

  return (
    <div className="tractor-table-container">
      {filteredTractors.length === 0 ? (
        <div className="no-data" >
          {selectedModel 
            ? `Нет тракторов модели "${selectedModel}"`
            : "Нет данных о тракторах"
          }
        </div>
      ) : (
        <>
          <table className="tractor-table">
            <thead>
              <tr>
                <th>Vin</th>
                <th>Модель</th>
                <th>Дата выпуска</th>
                <th>Регион</th>
                <th>Моточасы</th>
                <th>Последняя активность</th>
                <th>ДВС</th>
                <th>КПП</th>
                <th>РК</th>
                <th>БК</th>
              </tr>
            </thead>
            <tbody>
              {filteredTractors.map(tractor => (
                <tr key={tractor.id}>
                  <td>{tractor.VIN}</td>
                  <td> {tractor.model}</td>
                  <td>{tractor.releaseDate}</td>
                  <td>{tractor.region}</td>
                  <td>{tractor.motoHours}</td>
                  <td>{tractor.lastActivity}</td>
                  <td>{tractor.DVS}</td>
                  <td>{tractor.KPP}</td>
                  <td>{tractor.RK}</td>
                  <td>{tractor.BK}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
