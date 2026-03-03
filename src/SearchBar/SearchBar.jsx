
import { useEffect, useState } from 'react';

export function SearchBar({ onSearch, activeButton }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);



  useEffect(() => {
    setQuery('')
    onSearch?.(query)
  }, [activeButton])
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value); 
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={ !isFocused ? "Поиск": ''}
        value={query}
        onFocus={() => setIsFocused(true)}
        onChange={handleChange}
        onBlur={() => {
          if(!query) {
            setIsFocused(false)
          }
        }}
      />
      {/* Кнопка можно оставить для UX, но она не обязательна */}
      <button 
        type="button"
        onClick={() => onSearch?.(query)}
        className='search-icon-button'
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
      </button>  
    </div>
  );
}