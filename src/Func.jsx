import Image from './img/Image.png'
import { useState, useEffect } from 'react';

export function Header({ onLogout }) {
  return(
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
            <option value="">Модель</option>
            <option value="m1">К-743</option>
            <option value="m2">К-745</option>
            <option value="m3">К-743</option>
          </select>
        </div>
      </div>
    </>
  )
}

export function Sidebar({ activeButton, handleButtonClick }) {
  return (
    <div className='sidebar'>
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
      {activeButton === 'aggregates' && <Filters />}
      {activeButton === 'tractor' && <Filters2 />}
    </div>
  )
}




export function Objects() {
  const [softwareItems, setSoftwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchSoftware = async () => {
    try {
      console.log('Начало загрузки данных...');
      
      const response = await fetch('http://localhost:8000/component-version/0/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Данные компонента:', data);
      console.log('Структура download_link:', data.download_link);
      console.log('Тип download_link:', typeof data.download_link);

      if (Array.isArray(data)) {
          // data уже является массивом объектов
          setSoftwareItems(data);
        } else if (data && typeof data === 'object') {
          // Если это один объект, оборачиваем в массив
          setSoftwareItems([data]);
        } else {
          setSoftwareItems([]);
        }
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(`Ошибка подключения к серверу: ${error.message}`);
      
    } finally {
      setLoading(false);
    }
  };

  fetchSoftware();
}, []);

  const handleDownload = (item) => {
    console.log('Детали компонента:', item);
    
    if (item && (item.download_link).length > 10) {
      window.open(item.download_link, '_blank');
    } else {
      console.warn('Ссылка для скачивания не найдена для элемента:', item);
      alert('Ссылка для скачивания недоступна');
    }
  };

  if (loading) {
    return (
      <div className='maininfo'>
        <h3>Последние версии ПО для ДВС 1 220 ЛС</h3>
        <div>Загрузка данных с сервера...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='maininfo'>
        <h3>Внимание: режим разработки</h3>
        <div style={{color: 'orange'}}>{error}</div>
        <div style={{marginTop: '10px', color: '#666'}}>
          Используются демо-данные для тестирования интерфейса
        </div>
      </div>
    );
  }

  console.log('Рендеринг компонентов:', softwareItems);

  return (
    <div className='maininfo'>
      <h3>Последние версии ПО для ДВС 1 220 ЛС</h3>
      
      <div>
        <h4>Компоненты ({softwareItems.length})</h4>
        
          <ul className='List'>
            {softwareItems.map((item) => ( 
              <li key={item.id_Firmwares}>
                <div className='objectmenu'>
                  <img className='object' src={Image} alt='Компонент' />
                  <div className='inform'>
                    <h4>Тип: {item.model_component} от {new   Date(item.release_date).toLocaleDateString()}</h4>
                    <button 
                      className='download'
                      onClick={() => handleDownload(item)}
                      disabled={!item.download_link}
                    >
                      Скачать
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        
      </div>
    </div>
  );
}



export function MainPart({activeButton}) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects />}
      {activeButton === 'tractor'}
    </div>
  )
}

// Трактор
export function Filters2() {
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
        {/* Добавьте поля для даты выпуска */}
      </div>

      <div className='Поиск по дилеру'>
        {/* Добавьте поля для поиска по дилеру */}
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
}