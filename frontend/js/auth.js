/**
 * Classe per gestire l'autenticazione
 */
class AuthManager {
    constructor() {
        this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        this.token = localStorage.getItem('authToken');
    }

    /**
     * Login dell'utente
     */
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            this.user = response.user;
            this.token = response.token;

            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
            api.setToken(response.token);

            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Registrazione dell'utente
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);

            this.user = response.user;
            this.token = response.token;

            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
            api.setToken(response.token);

            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout dell'utente
     */
    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
    }

    /**
     * Controlla se l'utente è autenticato
     */
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    /**
     * Recupera l'utente corrente
     */
    getUser() {
        return this.user;
    }

    /**
     * Aggiorna il profilo utente
     */
    async updateProfile(userData) {
        try {
            const response = await api.put(`/users/${this.user._id}`, userData);
            this.user = response.user;
            localStorage.setItem('user', JSON.stringify(response.user));
            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Reset password
     */
    async resetPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Istanza globale dell'auth manager
const auth = new AuthManager();