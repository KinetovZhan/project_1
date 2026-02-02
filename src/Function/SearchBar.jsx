
import { useEffect, useState } from 'react';

export function SearchBar({ onSearch, activeButton }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery('')
    onSearch?.(query)
  }, [activeButton])
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value); // ← вызывается сразу при вводе
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Поиск"
        value={query}
        onChange={handleChange}
      />
      {/* Кнопка можно оставить для UX, но она не обязательна */}
      <button 
        type="button"
        onClick={() => onSearch?.(query)}
        className='search-icon-button'
      >
        {/* иконка */}
      </button>  
    </div>
  );
}