import { useState, useEffect } from 'react';
export function AddAggForm({onBack, onSubmit}) {
  return(
    <div className="maininfo add-po-form-container">
      <button
        onClick={onBack}
        className="add-po-back-button"
      >
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <h3 className="add-po-title">
        Добавление агрегата
      </h3>

      <form className='add-po-form' onSubmit={onSubmit}>
        <div className='add-po-field'>
          <label className='add-po-label'>Тип</label>
          <select
            name="aggregate"
            required
            className='add-po-select'
          >
            <option value="">Выберите агрегат</option>
            <option value="dvs">ДВС</option>
            <option value="kpp">КПП</option>
            <option value="rk">РК</option>
            <option value="hydro">Гидрораспределитель</option>
          </select>
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Название</label>
          <input
            type="text"
            name='nameAgg'
            placeholder="Value"
            required
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Серийный номер</label>
          <input
            type="text"
            name="serialNum"
            placeholder="Value"
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Дата установки</label>
          <input
            type="date"
            name="installDate"
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>ID Трактора</label>
          <input
            type="text"
            name="tractorId"
            placeholder="Value"
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Количество подчастей</label>
          <input
            type="text"
            name="subdistricts"
            placeholder="Value"
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Producer Comp</label>
          <input
            type="text"
            name="producerComp"
            placeholder="Value"
            className='add-po-input'
          />
        </div>

        <button
          type="submit"
          className='add-po-submit-button'
        >
          Добавить
        </button> 
      </form> 
    </div>   
    
  );
}