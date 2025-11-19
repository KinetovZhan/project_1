import { useState } from 'react'



export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');


  const handleSearch = () => {
    if (onSearch && typeof onSearch === 'function') {
      onSearch(query);
    }
  };

  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); 
    } 
  };


  return (
    <div className="search-bar">
      {/* Иконка фильтров (три полоски) */}
      <input
        type="text"
        placeholder="Поиск"
        value={query}
        onChange={(e) => setQuery(e.target.value)} 
        onKeyDown={handleKeydown}
      />
      <button 
        type="button"
        onClick={handleSearch}
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