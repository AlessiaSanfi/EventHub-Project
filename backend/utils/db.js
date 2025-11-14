/**
 * @file Modulo di Connessione al Database.
 * @description Contiene la funzione asincrona per stabilire la connessione a MongoDB utilizzando Mongoose.
 * Questa funzione è utilizzata principalmente dal server di produzione/sviluppo (`server.js`).
 */

const mongoose = require('mongoose');
const config = require('../config/config'); // Importa le variabili di configurazione (es. MONGO_URI)

const connectDB = async () => {
    try {
        // Tenta di connettersi al database utilizzando l'URI specificato
        const conn = await mongoose.connect(config.MONGO_URI, {
            // Timeout estesi per la selezione del server
            serverSelectionTimeoutMS: 30000, 
            // Timeout esteso per il socket, per gestire eventuali cluster inattivi
            socketTimeoutMS: 45000,         
        });

        // Logga la connessione solo se non siamo in ambiente di test (dove il logging è gestito da jest.setup.js)
        if (config.NODE_ENV !== 'test') {
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (err) {
        // Cattura e logga qualsiasi errore di connessione
        console.error(`Error connecting to MongoDB: ${err.message}`);
        throw err; // Rilancia l'errore per permettere al server di terminare (visto in server.js)
    }
};

module.exports = connectDB; // Esporta la funzione di connessione per l'uso nel server principale