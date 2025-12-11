import {Filters} from '../Function/Filters_agregates.jsx'
import {Filters2} from '../Function/Filters_tractors.jsx'


export function Sidebar({ activeButton, handleButtonClick, handleMajMinButtonClick, activeMajMinButton, onFilterChange, onFilterChange2, onModelChange, onModelChangeTrac, onFilterChangeTracByModel, onFilterChangeByStatus, onDealerChange, onAddPoClick, onAddAggClick, selectedModel, onDateChange}) {
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


      {activeButton !== 'aggregates' && activeButton !== 'tractor' && activeButton !== 'addAgg' && (
        <div className='add-po-container'>
          <button 
            onClick={onAddPoClick}> 
            Добавить ПО
          </button>
        </div>
      )}

      {activeButton !== 'aggregates' && activeButton !== 'tractor' && activeButton !== 'addPO' &&(
        <div className='add-po-container2 '>
          <button onClick={onAddAggClick}> 
            Добавить агрегат
          </button>
        </div>
      )}
      
      
      {activeButton === 'aggregates' && <Filters onFilterChange={onFilterChange} onFilterChange2={onFilterChange2} onModelChange={onModelChange}/>}
      {activeButton === 'tractor' && <Filters2 onFilterChangeTracByModel={onFilterChangeTracByModel} onFilterChangeByStatus={onFilterChangeByStatus} handleMajMinButtonClick={handleMajMinButtonClick} activeMajMinButton={activeMajMinButton} onDealerChange={onDealerChange} onDateChange={onDateChange}/>}
    </div>
  )
}