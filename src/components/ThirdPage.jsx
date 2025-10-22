import { useState } from 'react';
import Image from '../img/Image.png'
import '../App.css'


function ThirdPage({ selectedCategory, onBackClick }) {
  const [activeButton, setActiveButton] = useState(selectedCategory);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return(
    <>
      <header>
        <div className='mainText'>
          <h3>Сервис просмотра версий ПО</h3>
          <button className="back-button" onClick={onBackClick}>
  ← Назад
</button>
        </div>
        <div className='navigation'>
          <h3>Помощь</h3>
          <h3>Выйти</h3>
        </div>
      </header>



      <main>
        <div className='table'>

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

            <div className='filters'>
              <div className='filter'>
                <label>  {/* Добавлен label для лучшей доступности */}
                  <span>ДВС</span>
                  <input type="checkbox"/>
                </label>
              </div>
              <div className='filter'>
                <label>  {/* Добавлен label для лучшей доступности */}
                  <span>КПП</span>
                  <input type="checkbox"/>
                </label>
              </div>
              <div className='filter'>
                <label>  {/* Добавлен label для лучшей доступности */}
                  <span>РК</span>
                  <input type="checkbox"/>
                </label>
              </div>
              <div className='filter'>
                <label>  {/* Добавлен label для лучшей доступности */}
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
          </div>

          <div class='MainPart'>
            <div className='maininfo'>
              <h3>Последние версии ПО для ДВС 1220 ЛС</h3>
              <div className='objectmenu'>
                <img className='object' src={Image} alt="" />
                <div className='inform'>
                  <h3>№123 от (даты) Maj/Min</h3>
                  <h4>Описание изменений  улучшений</h4>
                  <button className='download'>Скачать</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  ) 
}
export default ThirdPage
