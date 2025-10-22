import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SecondPage from './components/SecondPage.jsx';
import ThirdPage from './components/ThirdPage.jsx';
import { Header, Sidebar, MainPart } from '../Func' // ДОБАВИТЬ этот импорт
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'//Для переключения между страницами

function App() {
  const [currentPage, setCurrentPage] = useState('second');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Функция для перехода на третью страницу
  const goToThirdPage = (category) => {
    setSelectedCategory(category);
    setCurrentPage('third');
  };

  // Функция для возврата на вторую страницу
  function goToSecondPage() {
    setCurrentPage('second');
    setSelectedCategory(null);
  }
  
  return (
    <>
      {currentPage === 'second' ? (
        <SecondPage onButtonClick={goToThirdPage} />
      ) : (
        <ThirdPage 
          selectedCategory={selectedCategory}
          onBackClick={goToSecondPage} 
        />
      )}
    </>
  );
}
export default App;