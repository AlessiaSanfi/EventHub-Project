/**
 * @file Server di Avvio Principale (EventHub Backend).
 * @description Gestisce l'avvio del server HTTP/Socket.IO e la connessione a MongoDB. 
 * La configurazione di Express (middleware e rotte) è importata da app.js.
 */

// Carica le variabili d'ambiente dal file .env
require('dotenv').config();

const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io'); 
const { setIoInstance } = require('./socket/socketManager');
const connectDB = require('./utils/db'); // Importa il modulo di connessione al DB

// Importa l'istanza di Express configurata da app.js
const app = require('./app'); 

const PORT = process.env.PORT || 8080; 
// RIMOSSO: const MONGODB_URI = process.env.MONGODB_URI; // connectDB ora gestisce l'URI tramite config.js

// -------------------------------------------------------------------
// 1. CONFIGURAZIONE SOCKET.IO & SERVER HTTP
// -------------------------------------------------------------------

// Crea il server HTTP usando l'istanza di Express
const server = http.createServer(app); 

// Configura l'istanza di Socket.IO per ascoltare il server HTTP
const io = new Server(server, {
    // CORS per Socket.IO
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000', 
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Passa l'istanza IO al gestore esterno
setIoInstance(io); 

// -------------------------------------------------------------------
// 2. CONNESSIONE AL DB E AVVIO SERVER (SOLO SE NON IN AMBIENTE TEST)
// -------------------------------------------------------------------

// Avvia il server SOLO se NON siamo in ambiente di test
if (process.env.NODE_ENV !== 'test') {
    // Sostituzione dell'implementazione temporanea con la funzione connectDB
    connectDB() // Chiama la funzione asincrona per connettersi al DB
    .then(() => {
        // Dopo la connessione di successo (loggata in db.js)
        
        // Inizializza l'ascolto del Server
        server.listen(PORT, () => { 
            console.log('----------------------------------------------------');
            console.log('✅ Connessione al database stabilita.'); // Logga il successo
            console.log(`🚀 Server Node.js in esecuzione su http://localhost:${PORT}`);
            console.log('----------------------------------------------------');
        });
    }) 
    .catch((err) => {
        // L'errore è già loggato in db.js
        console.log('----------------------------------------------------');
        console.error('❌ FATAL: Errore di connessione al database. Arresto del server.');
        console.log('----------------------------------------------------');
        process.exit(1); // Uscita forzata in caso di errore DB
    });
}

module.exports = server;