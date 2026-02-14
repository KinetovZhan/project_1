import config from '../config/api';

class Api {
    constructor() {
        this.baseURL = config.api.baseURL;
    }

    async request (endpoint, options = {}) {
       const url = config.getUrl(endpoint);
       config.log('API Request', { endpoint, url });
    

        const response = await fetch(url, {
          ...options,
           headers: {
           'Content-Type':'appication/json',
            ...options.headers,
        },
    });

        if (!this.response.ok) {
        throw new Error(`HTTP ${response.status}:${response.statusText}`);
    }

    return response.json();
}
    //CRUD методы

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint,data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
    });
  }

    async delete(endpoint) {
        return this.request(endpoint, {
           method: 'DELETE',
    });
  }
}

export const api = new Api();



