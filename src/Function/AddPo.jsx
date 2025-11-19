import { useState, useEffect } from 'react';

export function AddPoForm({onBack, onSubmit}) {
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
        Добавление нового ПО
      </h3>

      <form className='add-po-form' onSubmit={onSubmit}>
        <div className='add-po-field'>
          <label className='add-po-label'>Номер ПО</label>
          <input
            type="text"
            name='poNumber'
            placeholder="Value"
            required
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Агрегат</label>
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
          <label className='add-po-label'>Модель трактора</label>
          <input
            type="text"
            name="tractorModel"
            placeholder="Value"
            required
            className='add-po-input'
          />
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Major/Minor</label>
          <select
            name="majorMinor"
            required
            className='add-po-select'
          >
            <option value="">Выберите тип</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>    
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Версия ПО</label>
          <select
            name="version"
            required
            className='add-po-select'
          >
            <option value="">Выберите версию</option>
            <option value="1.0">1.0</option>
            <option value="2.0">2.0</option>
            <option value="3.0">3.0</option>
          </select>
        </div>

        <div className='add-po-field'>
          <label className='add-po-label'>Описание</label>
          <textarea
            name="description"
            placeholder='Value'
            rows="5"
            required
            className='add-po-textarea'
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