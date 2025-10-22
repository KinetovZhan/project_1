import { useState } from 'react';
import '../App.css'


export function SecondPage({ onButtonClick }) {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    
    // Если нажата кнопка "Агрегаты" - переходим на третью страницу
    if (buttonName === 'aggregates') {
      onButtonClick(buttonName);
    }
  };

  return(
    <>
      <header>
        <div className='mainText'>
          <h3>Сервис просмотра версий ПО</h3>
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
          </div>

          <div class='MainPart'>
          </div>
        </div>
      </main>
    </>
  ) 
}

export default SecondPage