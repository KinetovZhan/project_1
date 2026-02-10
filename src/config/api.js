const config = {
    api: {
        baseURL: process.env.REACT_APP_API_URL||'http://localhost:8000/api',
        timeout: 15000,
    },

    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: prosecc.env.NODE_ENV === 'production',
    debug: process.env.REACT_APP_DEBUG === 'true',

    getUrl: (endpoint) => {
        const base = config.api.baseURL.replace(/\/$/,'');
        const cleanEndpoint = endpoint.replace(/^\//,'');
        return `${base}/${cleanEndpoint}`;
    },
      // Логирование (только в development)
    log: (message, data) => {
      if (config.debug) {
        console.log(`${message}:`, data);
    }
  },

    validate: () => {
        if (!prosecc.env.REACT_APP_API_URL && config.isDevelopment) {
            console.warn('warning!!!');
        }

        if (config.debug) {
            console.log('Конфигурация загружена:',{
                api:config.api.baseURL,
                environment:process.env.NODE_ENV,
                degugMode:config.debug
            });
        }
    },
};

config.validate();

export default config;