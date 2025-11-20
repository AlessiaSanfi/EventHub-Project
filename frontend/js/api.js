const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Classe per gestire le chiamate API al backend
 */
class ApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('authToken');
    }

    /**
     * Metodo GET
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this._getHeaders()
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error('Errore GET:', error);
            throw error;
        }
    }

    /**
     * Metodo POST
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify(data)
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error('Errore POST:', error);
            throw error;
        }
    }

    /**
     * Metodo PUT
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: this._getHeaders(),
                body: JSON.stringify(data)
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error('Errore PUT:', error);
            throw error;
        }
    }

    /**
     * Metodo DELETE
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: this._getHeaders()
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error('Errore DELETE:', error);
            throw error;
        }
    }

    /**
     * Costruisce gli header della richiesta
     */
    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Gestisce la risposta e controlla gli errori
     */
    async _handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token scaduto, disconnetti l'utente
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/pages/login.html';
            }
            throw new Error(data.message || 'Errore della richiesta');
        }

        return data;
    }

    /**
     * Aggiorna il token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }
}

// Istanza globale dell'API client
const api = new ApiClient();