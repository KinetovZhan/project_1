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


export function Sidebar({ activeButton, handleButtonClick, onAddPoClick}) {
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
          // Не добавляем класс active — чтобы не было выделения как у активной кнопки
          onClick={onAddPoClick}> {}
          Добавить ПО
        </button>
      </div>

      {/* Фильтры — остаются как есть */}
      {activeButton === 'aggregates' && <Filters />}
      {activeButton === 'tractor' && <Filters2 />}
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


export function MainPart({activeButton, showAddForm, onCloseAddForm, onAddSubmit, onBack}) {
  if (showAddForm) {
    return (
      <div 
        className='MainPart'
        style={{
          position: 'relative'
        }}
      >
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '30px',
            left: '-30px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
            padding: '0',
            boxShadow: 'none',
            backgroundColor: 'transparent'
          }}
        >
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button> 

        <div 
          className="maininfo" 
          style={{
            padding: '50px 70px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: '710px',
            height: 'auto',
          }}
        >

          <h3 style={{
            marginTop: '-30px', 
            marginBottom: '30px', 
            fontWeight: 'bold',
            fontSize: '30px'
          }}>
            Добавление нового ПО
          </h3>

          <form style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
            <div style={{ marginBottom: '0px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Номер ПО</label>
              <input
                type="text"
                name='poNumber'
                placeholder="Value"
                required
                style={{
                  width: '97.28%',
                  padding: '10px',
                  fontSize: '16px',
                  marginBottom: '0px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ marginBottom: '0px'}}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Агрегат</label>
              <select
                name="aggregate"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  marginBottom: '0px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Выберите агрегат</option>
                <option value="dvs">ДВС</option>
                <option value="kpp">КПП</option>
                <option value="rk">РК</option>
                <option value="hydro">Гидрораспределитель</option>
              </select>
            </div>

            <div style={{marginBottom: '0px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Модель трактора</label>
              <input
                type="text"
                name="tractorModel"
                placeholder="Value"
                required
                style={{
                  width: '97.28%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{marginBottom: '0px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Major/Minor</label>
              <select
                name="majorMinor"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Выберите тип</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>    
            </div>

            <div style={{marginBottom: '0px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Версия ПО</label>
              <select
                name="version"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Выберите версию</option>
                <option value="1.0">1.0</option>
                <option value="2.0">2.0</option>
                <option value="3.0">3.0</option>
              </select>
            </div>

            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Описание</label>
              <textarea
                name="description"
                placeholder='Value'
                rows="5"
                required
                style={{
                  width: '97.28%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  resize: 'vertical',
                  minHeight: '20px',
                  maxHeight: '150px',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '15px'
              }}
            >
              Добавить
            </button>
            {/* <div style={{display: 'flex', gap: '10px'}}>
              <button
                type="button"
                className="download"
                onClick={onCloseAddForm}
                style={{flex: 1}}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="download"
                style={{flex:1, backgroundColor: '#007bff', color: 'white'}}
              >
                Сохранить
              </button>
            </div> */}
          </form>
        </div>
      </div>
    );
  }

  if (!activeButton) {
    return <div className='MainPart'></div>
  }
  
  return(
    <div className='MainPart'> 
      {activeButton === 'aggregates' && <Objects />}
      {activeButton === 'tractor' && <Filters2 />}
    </div>
  );
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