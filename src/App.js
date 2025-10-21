import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Image from './img/Image.png'


function App() {

 // Состояние для активной кнопки
  const [activeButton, setActiveButton] = useState(null);

  // Функция для обработки нажатия
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
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
        </div>
      </main>
    </>
  ) 
}

export default App