// Определяем окружение
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Для Create React App
const API_URL = isProduction 
  ? (process.env.REACT_APP_API_URL || 'https://your-api-domain.com')
  : 'http://localhost:8000';

// Для Vite раскомментируйте:
// const API_URL = import.meta.env.PROD
//   ? (import.meta.env.VITE_API_URL || 'https://your-api-domain.com')
//   : 'http://localhost:8000';

export const config = {
  API_URL,
  isDevelopment,
  isProduction,
  endpoints: {
    searchTractorByVin: (vin) => `${API_URL}/search/search-tractor-vin?request=${encodeURIComponent(vin)}`,
    // другие эндпоинты можно добавить здесь
  }
};