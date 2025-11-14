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

// Importa l'istanza di Express configurata da app.js
const app = require('./app'); 

const PORT = process.env.PORT || 8080; 
const MONGODB_URI = process.env.MONGODB_URI;

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
    mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('----------------------------------------------------');
        console.log('✅ Connesso al database MongoDB');

        // Inizializza l'ascolto del Server
        server.listen(PORT, () => { 
            console.log(`🚀 Server Node.js in esecuzione su http://localhost:${PORT}`);
            console.log('----------------------------------------------------');
        });
    }) 
    .catch((err) => {
        console.log('----------------------------------------------------');
        console.error('❌ Errore di connessione al database:', err.message);
        console.error('FATAL: Verifica MONGODB_URI nel file .env.');
        console.log('----------------------------------------------------');
        process.exit(1); 
    });
}

// Esporta il server per eventuali utilizzi esterni (non necessario per i test con supertest)
module.exports = server;