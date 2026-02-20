// Режим работы приложения
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const MODE = import.meta.env.MODE;

// API конфигурация
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.102:8000';
console.log('API_BASE_URL =', API_BASE_URL);

// Таймауты и настройки запросов
export const API_TIMEOUT = IS_PROD ? 10000 : 30000;
export const RETRY_COUNT = IS_PROD ? 3 : 1;

// Коды ошибок - добавлено!
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  TIMEOUT: 408,
};

// Логгер - добавлено!
export const logger = {
  log: (...args) => {
    if (IS_DEV) {
      console.log('[DEV]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    if (IS_DEV) {
      console.warn('[WARN]', ...args);
    }
  },
  info: (...args) => {
    if (IS_DEV) {
      console.info('[INFO]', ...args);
    }
  },
};

// ИСПРАВЛЕНО: было builqApiUrl, стало buildApiUrl
export const buildApiUrl = (endpoint) => {
  // Убираем ведущие и trailing слеши
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Если API на том же домене в продакшене (VITE_API_URL пустой)
  if (!API_BASE_URL && IS_PROD) {
    return `/${cleanEndpoint}`;
  }
  
  // Убираем trailing слеш у базового URL
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

class fetchAPI {
    constructor() {
        this.defaultHeaders = {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        };
    }

    async request (endpoint, options = {}, retryCount = RETRY_COUNT) {
        const url = buildApiUrl(endpoint);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        try {
            const token = localStorage.getItem('accessToken');//11111
            const headers = {
               ...this.defaultHeaders,
               ...options.headers,
            };

            if(token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const fetchOptions = {
        ...options,
        headers,
        signal: controller.signal,
      };

      logger.log(`Fetching: ${url}`, fetchOptions);

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Обработка ответа
      return await this.handleResponse(response, endpoint, options, retryCount);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Обработка ошибок сети/таймаута
      if (error.name === 'AbortError') {
        throw new Error('Запрос превысил время ожидания');
      }
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        // Ошибка сети (сервер недоступен)
        if (retryCount > 0) {
          logger.log(`Повторная попытка... Осталось попыток: ${retryCount}`);
          await this.delay(1000); // Ждем 1 секунду перед повтором
          return this.request(endpoint, options, retryCount - 1);
        }
        throw new Error('Сервер недоступен. Проверьте подключение к интернету');
      }
      
      throw error;
    }
  }

  /**
   * Обработка ответа от сервера
   */
  async handleResponse(response, endpoint, options, retryCount) {
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  switch (response.status) {
    case ERROR_CODES.UNAUTHORIZED:
      logger.error('Unauthorized access');
      if (!options.skipAuth) {
        this.handleUnauthorized();
      }
      throw new Error('Сессия истекла. Пожалуйста, войдите снова');

    case ERROR_CODES.FORBIDDEN:
      throw new Error('У вас нет прав для этого действия');

    case ERROR_CODES.NOT_FOUND:
      throw new Error('Данные не найдены');

    case ERROR_CODES.SERVER_ERROR:
      if (retryCount > 0) {
        logger.log(`Серверная ошибка, повторная попытка... Осталось: ${retryCount}`);
        await this.delay(2000);
        return this.request(endpoint, options, retryCount - 1);
      }
      throw new Error('Ошибка сервера. Попробуйте позже');

    default:
  let errorMessage = '';
  if (data.detail) {
    if (Array.isArray(data.detail)) {
      // FastAPI validation errors: array of objects with loc, msg, type
      errorMessage = data.detail.map(err => err.msg).join('; ');
    } else if (typeof data.detail === 'string') {
      errorMessage = data.detail;
    } else {
      errorMessage = JSON.stringify(data.detail);
    }
  } else if (data.message) {
    errorMessage = data.message;
  } else {
    errorMessage = `Ошибка ${response.status}`;
  }
  throw new Error(errorMessage);
  }
}


  async download(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const token = localStorage.getItem('accessToken');
        const headers = {
            ...this.defaultHeaders,
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Важно: для скачивания не указываем Content-Type
        delete headers['Content-Type'];

        const fetchOptions = {
            ...options,
            headers,
            signal: controller.signal,
            method: options.method || 'GET',
        };

        logger.log(`Downloading: ${url}`);

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            // Пробуем получить текст ошибки
            const errorText = await response.text();
            throw new Error(`Ошибка скачивания: ${response.status} - ${errorText}`);
        }

        return response; // Возвращаем response для дальнейшей обработки blob

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Скачивание превысило время ожидания');
        }
        
        logger.error('Download error:', error);
        throw error;
    }
}

  /**
   * Обработка неавторизованного доступа
   */
  handleUnauthorized() {
    // Очищаем токены
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Перенаправляем на страницу логина
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Задержка для retry
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Удобные методы для разных типов запросов
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Создаем и экспортируем единственный экземпляр
export const api = new fetchAPI();
        
    