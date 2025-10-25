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
              <div className="inform">
                <h3>№{ver.id} от {ver.date} ({ver.type})</h3>
                <h4>{ver.description}</h4>
                <button className="download">Скачать</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


export function MainPart({activeButton}) {
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects />}
    </div>
  )
}




//Трактор

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
}