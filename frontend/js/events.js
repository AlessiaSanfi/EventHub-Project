/**
 * Classe per gestire gli eventi
 */
class EventManager {
    constructor() {
        this.events = [];
        this.currentEvent = null;
        this.filters = {
            search: '',
            category: 'all',
            status: 'all'
        };
    }

    /**
     * Recupera tutti gli eventi
     */
    async getAllEvents(filters = {}) {
        try {
            let endpoint = '/events';
            const params = new URLSearchParams();

            if (filters.search) params.append('search', filters.search);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);
            if (filters.status && filters.status !== 'all') params.append('status', filters.status);

            if (params.toString()) {
                endpoint += '?' + params.toString();
            }

            const response = await api.get(endpoint);
            this.events = response.data || response;
            return { success: true, events: this.events };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Recupera gli eventi dell'utente
     */
    async getMyEvents() {
        try {
            const response = await api.get('/events/my-events');
            this.events = response.data || response;
            return { success: true, events: this.events };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Recupera dettagli di un singolo evento
     */
    async getEventDetail(eventId) {
        try {
            const response = await api.get(`/events/${eventId}`);
            this.currentEvent = response.data || response;
            return { success: true, event: this.currentEvent };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Crea un nuovo evento
     */
    async createEvent(eventData) {
        try {
            const response = await api.post('/events', eventData);
            return { success: true, event: response.data || response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Aggiorna un evento
     */
    async updateEvent(eventId, eventData) {
        try {
            const response = await api.put(`/events/${eventId}`, eventData);
            return { success: true, event: response.data || response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina un evento
     */
    async deleteEvent(eventId) {
        try {
            await api.delete(`/events/${eventId}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Partecipa a un evento
     */
    async joinEvent(eventId) {
        try {
            const response = await api.post(`/events/${eventId}/join`, {});
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Lascia un evento
     */
    async leaveEvent(eventId) {
        try {
            const response = await api.post(`/events/${eventId}/leave`, {});
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Recupera i partecipanti di un evento
     */
    async getEventParticipants(eventId) {
        try {
            const response = await api.get(`/events/${eventId}/participants`);
            return { success: true, participants: response.data || response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Commenta su un evento
     */
    async addComment(eventId, comment) {
        try {
            const response = await api.post(`/events/${eventId}/comments`, { text: comment });
            return { success: true, comment: response.data || response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Filtra gli eventi
     */
    filterEvents(filters) {
        this.filters = { ...this.filters, ...filters };
        return this.events.filter(event => {
            let match = true;

            if (this.filters.search) {
                match = match && (
                    event.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                    event.description.toLowerCase().includes(this.filters.search.toLowerCase())
                );
            }

            if (this.filters.category !== 'all') {
                match = match && event.category === this.filters.category;
            }

            return match;
        });
    }
}

// Istanza globale
const eventManager = new EventManager();