import {Filters} from '../Function/Filters_agregates.jsx'
import {Filters2} from '../Function/Filters_tractors.jsx'
import { useState, useEffect } from 'react';
import useCheckMobile from '../shrineofvsakoe/checkMobile.jsx';
import { useAuth } from '../auth/AuthContext';


export function Sidebar({ activeButton, handleButtonClick, handleMajMinButtonClick, activeMajMinButton, onFilterChange, onFilterChange2, onModelChange, onProducerChange, onStatusChange, onModelChangeTrac, onFilterChangeTracByModel, onFilterChangeByStatus, onDealerChange, onAddPoClick, onAddAggClick, onAddCompPartClick, selectedModel, onDateChange, onActualChange}) {

  const [isOpen,setIsOpen] = useState(false);
  const isMobile = useCheckMobile();
  const { user, isAuthenticated } = useAuth();


  const userRole = user?.role || 'user';

  // const userRole = 'moderator'; // 🔧 ВРЕМЕННО ХАРДКОДИМ
  // useEffect(() => {
  //   const checkMobile = () => {
  //     setIsMobile(window.innerWidth <= 768);
  //   };
  //   checkMobile();
  //   window.addEventListener('resize',checkMobile);

  //   return () => window.removeEventListener('resize',checkMobile);
  // }, []);

  // useEffect(() => {
  //   if (isMobile&&activeButton) {
  //     setIsOpen(false);
  //   }
  // }, [activeButton, isMobile]);
  useEffect(() => {
    if ((activeButton === 'aggregates')||(activeButton === 'tractor')) {
      if (onFilterChangeTracByModel) onFilterChangeTracByModel([]);
      if (onFilterChangeByStatus) onFilterChangeByStatus([]);
      if (onDealerChange) onDealerChange('');
      if (onDateChange) onDateChange(null);
      if (handleMajMinButtonClick) handleMajMinButtonClick(null);
      if (onActualChange) onActualChange(null);
    }
  },[activeButton]);

  const { token } = useAuth();

  const sidebarContent = (
    <div className='sidebar'> 
      <div className='choose'>
        <button 
          className={activeButton === 'tractor' ? 'active' : ''}
          onClick={() => {
            handleButtonClick('tractor');
            // if (isMobile) setIsOpen(false);
          }}
        >
          Трактор
        </button>
        <br />
        <button
          className={activeButton === 'aggregates' ? 'active' : ''}
          onClick={() => {
            handleButtonClick('aggregates');
            // if (isMobile) setIsOpen(false);
          }}
        >
          ПО
        </button>
      </div>


      {activeButton !== 'aggregates' && activeButton !== 'tractor' && userRole === 'moderator'  && (
        <div className='add-po-container'>
          <button className={activeButton === 'addPO' ? 'active':''}
            onClick={() =>{
              onAddPoClick();
              handleButtonClick('addPO');
              }}> 
            Добавить ПО
          </button>
        </div>
      )}

      {activeButton !== 'aggregates' && activeButton !== 'tractor' && isAuthenticated && userRole === 'moderator' &&(
        <div className='add-po-container2 '>
          <button className={activeButton === 'addAgg' ? 'active':''}
            onClick={() =>{
            onAddAggClick() 
            handleButtonClick('addAgg')
          }}> 
            Добавить узел
          </button>
        </div>
      )}

      {/* {activeButton !== 'aggregates' && activeButton !== 'tractor' && isAuthenticated && userRole === 'moderator' &&(
        <div className='add-po-container3'>
          <button className={activeButton === 'AddCompPart' ? 'active':''}
            onClick={() => {
            onAddCompPartClick()
            handleButtonClick('AddCompPart')
          }}>
            Добавить часть узла
          </button>
        </div>
      )} */}
      
      
      {activeButton === 'aggregates' && <Filters onFilterChange={onFilterChange} onFilterChange2={onFilterChange2} onModelChange={onModelChange} onProducerChange={onProducerChange} onStatusChange={onStatusChange}/>}
      {activeButton === 'tractor' && <Filters2 onFilterChangeTracByModel={onFilterChangeTracByModel} onFilterChangeByStatus={onFilterChangeByStatus} handleMajMinButtonClick={handleMajMinButtonClick} activeMajMinButton={activeMajMinButton} onDealerChange={onDealerChange} onDateChange={onDateChange} onActualChange={onActualChange}/>}
    </div>
  )
  return (
    <>
     {isMobile && (
      <button
       className = {`mobile-sidebar ${isOpen ? 'active' : ''}`}
       onClick = {()=>setIsOpen(!isOpen)}
      >
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          {/* <span className="toggle-text">Меню</span> */}
      </button>
     )}

     {isMobile && isOpen && (
      <div
      className = "sidebar-overlay"
      onClick ={() => setIsOpen(false)}
       />
     )} 
     
     {isMobile ? (
      <div className = {`mobile-sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className = "mobile-sidebar-header">
          <h3>Навигация</h3>
          <button
            className = "close-sidebar"
            onClick = {() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
        {sidebarContent}
      </div>
     ) : (
      sidebarContent
     )}
     </>
    );
   }
  
