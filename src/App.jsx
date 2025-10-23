import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Header, Sidebar, MainPart } from './Func.jsx' // ДОБАВИТЬ этот импорт

import SecondPage from './components/SecondPage.jsx';
import ThirdPage from './components/ThirdPage.jsx';
import { Header, Sidebar, MainPart } from '../Func' // ДОБАВИТЬ этот импорт
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'//Для переключения между страницами

function App() {
  const [currentPage, setCurrentPage] = useState('second');
  const [selectedCategory, setSelectedCategory] = useState(null);

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
          <MainPart activeButton={activeButton}/>
        </div>
      </main>
    </>
  );
}
export default App;