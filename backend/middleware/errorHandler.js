/**
 * Middleware centralizzato per la gestione degli errori.
 * Cattura gli errori e formatta la risposta HTTP.
 * * @param {Error} err L'oggetto errore sollevato.
 * @param {Object} req Oggetto Request.
 * @param {Object} res Oggetto Response.
 * @param {Function} next Funzione Next (non usata in un errorHandler finale).
 */
const errorHandler = (err, req, res, next) => {
    // Il codice di stato predefinito è 500 (Internal Server Error)
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Errore interno del server';

    // 1. Gestione degli errori Mongoose/Database
    if (err.name === 'CastError') {
        // Errore generato quando un ID non è formattato correttamente (es. ID di 24 caratteri)
        statusCode = 404;
        message = `Risorsa non trovata con id ${err.value}`;
    }

    if (err.code === 11000) {
        // Errore di duplicazione (es. email o username già esistente)
        statusCode = 400;
        // Estraggo il campo duplicato per un messaggio più specifico
        const field = Object.keys(err.keyValue).join(', ');
        message = `Valore duplicato per il campo: ${field}. Deve essere unico.`;
    }

    if (err.name === 'ValidationError') {
        // Errore generato da Mongoose per validazione dello schema fallita
        statusCode = 400;
        const errors = Object.values(err.errors).map(val => val.message);
        message = `Errore di validazione: ${errors.join(', ')}`;
    }
    
    // 2. Errore di Business Logico (es. Utente già iscritto)
    // Invia la risposta finale formattata
    res.status(statusCode).json({
        success: false,
        message: message
        // NOTA: Aggiungi l'oggetto 'stack' solo in ambiente di sviluppo per debug
        // stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;