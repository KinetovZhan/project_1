// Режим работы приложения
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const MODE = import.meta.env.MODE;

// API конфигурация - ИСПРАВЛЕНО: добавлен http://
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1';
console.log('API_BASE_URL =', API_BASE_URL);

// Таймауты и настройки запросов
export const API_TIMEOUT = IS_PROD ? 10000 : 30000;
export const RETRY_COUNT = IS_PROD ? 3 : 1;

// Коды ошибок
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  TIMEOUT: 408,
};

// Логгер
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

// Построение URL для API - ИСПРАВЛЕНО
export const buildApiUrl = (endpoint) => {
  // Убираем ведущие и trailing слеши
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Получаем базовый URL
  let baseUrl = API_BASE_URL;
  
  // Если нет базового URL, используем относительный путь
  if (!baseUrl) {
    return `/${cleanEndpoint}`;
  }
  
  // Добавляем протокол если его нет
//  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
//    baseUrl = 'http://' + baseUrl;
//  }
  
  // Убираем trailing слеш у базового URL
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  
  const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
  logger.log('buildApiUrl:', { baseUrl: cleanBaseUrl, endpoint: cleanEndpoint, fullUrl });
  
  return fullUrl;
};

class fetchAPI {
    constructor() {
        this.defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }

    async request(endpoint, options = {}, retryCount = RETRY_COUNT) {
        const url = buildApiUrl(endpoint);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        try {
            const token = localStorage.getItem('accessToken');
            const headers = {
               ...this.defaultHeaders,
               ...options.headers,
            };

            if (token && !options.skipAuth) {
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
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        
        // Если ответ не успешный (не 2xx)
        if (!response.ok) {
            // Проверяем статус ошибки
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
                    // Для других ошибок пытаемся получить текст ошибки
                    let errorMessage;
                    
                    if (contentType && contentType.includes('application/json')) {
                        // Если это JSON, парсим его
                        try {
                            const errorData = await response.json();
                            if (errorData.detail) {
                                if (Array.isArray(errorData.detail)) {
                                    errorMessage = errorData.detail.map(err => err.msg).join('; ');
                                } else if (typeof errorData.detail === 'string') {
                                    errorMessage = errorData.detail;
                                } else {
                                    errorMessage = JSON.stringify(errorData.detail);
                                }
                            } else if (errorData.message) {
                                errorMessage = errorData.message;
                            } else {
                                errorMessage = JSON.stringify(errorData);
                            }
                        } catch (e) {
                            errorMessage = await response.text();
                        }
                    } else {
                        // Если это не JSON, получаем как текст
                        errorMessage = await response.text();
                    }
                    
                    throw new Error(errorMessage || `Ошибка ${response.status}`);
            }
        }

        // Если ответ успешный (2xx)
        if (contentType && contentType.includes('application/json')) {
            // Парсим JSON только если это JSON
            try {
                return await response.json();
            } catch (e) {
                logger.error('Ошибка парсинга JSON:', e);
                // Если не удалось распарсить JSON, возвращаем текст
                return await response.text();
            }
        } else {
            // Если это не JSON, возвращаем текст
            return await response.text();
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

    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    /**
     * Upload a file to the server
     */
    async uploadFile(endpoint, file, fieldName = 'file', additionalData = {}, options = {}) {
        const formData = new FormData();
        
        // Append the file to the form data
        formData.append(fieldName, file);
        
        // Append any additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        // Remove Content-Type header for file uploads as it will be set automatically
        const headers = { ...options.headers };
        delete headers['Content-Type'];

        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: formData,
            headers,
        }, options.retryCount || RETRY_COUNT);
    }

    /**
     * Update a file on the server (PUT method)
     */
    async updateFile(endpoint, file, fieldName = 'file', additionalData = {}, options = {}) {
        const formData = new FormData();
        
        // Append the file to the form data
        formData.append(fieldName, file);
        
        // Append any additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        // Remove Content-Type header for file uploads as it will be set automatically
        const headers = { ...options.headers };
        delete headers['Content-Type'];

        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: formData,
            headers,
        }, options.retryCount || RETRY_COUNT);
    }

    /**
     * Replace the main software file
     */
    async replaceSoftwareFile(softwareId, file, options = {}) {
        // Validate inputs
        if (!softwareId || !file) {
            throw new Error('Software ID and file are required');
        }

        // Create FormData and append the file with the expected field name
        const formData = new FormData();
        // Server expects the file parameter to be named 'file' according to the backend API
        formData.append('file', file, file.name);

        // Remove Content-Type header for file uploads as it will be set automatically by the browser
        const headers = { ...options.headers };
        delete headers['Content-Type'];

        // Make the request using native fetch to bypass any content-type issues
        const url = buildApiUrl(`/software/upload-file/${softwareId}`);
        const token = localStorage.getItem('accessToken');
        
        const fetchOptions = {
            method: 'POST',
            headers: {
                ...headers,
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
            ...options
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        try {
            logger.log(`Uploading file to: ${url}`, fetchOptions);
            
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            // Handle response using the same logic as other methods
            return await this.handleResponse(response, `/software/upload-file/${softwareId}`, options);
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Запрос превысил время ожидания');
            }
            
            throw error;
        }
    }
}

// Создаем и экспортируем единственный экземпляр
export const api = new fetchAPI();
