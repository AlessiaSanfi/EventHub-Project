/**
 * @file Classe di Risposta agli Errori Personalizzata.
 * @description Estende la classe nativa Error di JavaScript per includere un codice di stato HTTP.
 * Utilizzata per creare errori specifici (es. 404, 401) che possono essere gestiti dal middleware `errorHandler`.
 */

class ErrorResponse extends Error {
    /**
     * Costruttore per creare un nuovo oggetto di errore con codice di stato HTTP.
     * @param {string} message - Il messaggio di errore leggibile dall'utente.
     * @param {number} statusCode - Il codice di stato HTTP associato all'errore (es. 404 Not Found).
     */
    constructor(message, statusCode) {
        super(message); // Chiama il costruttore della classe Error (imposta la proprietà 'message')
        this.statusCode = statusCode; // Aggiunge la proprietà 'statusCode' personalizzata
    }
}

module.exports = ErrorResponse; // Esporta la classe per l'utilizzo nei controller