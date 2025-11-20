/**
 * Classe per gestire il profilo utente
 */
class UserManager {
    constructor() {
        this.user = auth.getUser();
    }

    /**
     * Recupera profilo utente
     */
    async getProfile(userId = null) {
        try {
            const id = userId || auth.getUser()._id;
            const response = await api.get(`/users/${id}`);
            this.user = response.data || response;
            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Aggiorna profilo utente
     */
    async updateProfile(userData) {
        try {
            const response = await api.put(`/users/${auth.getUser()._id}`, userData);
            this.user = response.data || response;
            
            // Aggiorna anche in auth
            auth.user = this.user;
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Cambia password
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await api.post('/users/change-password', {
                oldPassword,
                newPassword
            });
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Carica foto profilo
     */
    async uploadProfilePicture(file) {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await fetch(`${API_BASE_URL}/users/upload-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${api.token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            this.user = data.user;
            auth.user = this.user;
            localStorage.setItem('user', JSON.stringify(this.user));

            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Recupera statistiche utente
     */
    async getUserStats() {
        try {
            const response = await api.get(`/users/${auth.getUser()._id}/stats`);
            return { success: true, stats: response.data || response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Recupera storico eventi
     */
    async getEventHistory() {
        try {
            const response = await api.get(`/users/${auth.getUser()._id}/events`);
            return { success: true, events: response.data || response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina account
     */
    async deleteAccount(password) {
        try {
            await api.post('/users/delete-account', { password });
            auth.logout();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Istanza globale
const userManager = new UserManager();