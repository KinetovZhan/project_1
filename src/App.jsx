import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Header, Sidebar, MainPart } from '../Func' // ДОБАВИТЬ этот импорт


function App() {

 // Состояние для активной кнопки
  const [activeButton, setActiveButton] = useState(null);

  // Функция для обработки нажатия
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };


  return(
    <>
      <Header />
      <main>
        <div className='table'>
          <Sidebar 
            activeButton={activeButton} 
            handleButtonClick={handleButtonClick} 
          />
          <MainPart />
        </div>
      </main>
    </>
  )  
}


export default App
