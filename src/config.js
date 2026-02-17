export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const MODE = import.meta.env.MODE;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Таймауты и настройки запросов
export const API_TIMEOUT = IS_PROD ? 10000 : 30000; // 10s в проде, 30s в dev
export const RETRY_COUNT = IS_PROD ? 3 : 1; // 3 попытки в проде, 1 в dev


export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  isProduction: import.meta.env.PROD,
};

export const buildApiUrl = (endpoint) => {
  const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  // Если API на том же домене в продакшене (VITE_API_URL пустой)
  if (!API_BASE_URL && IS_PROD) {
    return `/${cleanEndpoint}`;
  }
  
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};