/**
 * @file Server di Avvio Principale (EventHub Backend).
 * @description Inizializza l'applicazione Express, la connessione a MongoDB, integra Socket.IO e configura i middleware e le rotte principali.
 */

// Carica le variabili d'ambiente dal file .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');           // Modulo HTTP di Node.js
const { Server } = require('socket.io'); // Classe Server di Socket.IO
const cors = require('cors');             // Middleware CORS per Express
const helmet = require('helmet');         // Middleware Helmet per sicurezza

// Importa le rotte
const authRoutes = require('./routes/authRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { setIoInstance } = require('./socket/socketManager'); // Import del Socket Manager

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

// -------------------------------------------------------------------
// 1. CONFIGURAZIONE SOCKET.IO & SERVER HTTP
// -------------------------------------------------------------------
const server = http.createServer(app); 

const io = new Server(server, {
    // CORS per Socket.IO (Deve corrispondere all'URL del Frontend)
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000', 
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Passa l'istanza IO al gestore esterno
setIoInstance(io); 

// -------------------------------------------------------------------
// 2. MIDDLEWARE DI SICUREZZA E PARSING
// -------------------------------------------------------------------

// Protezione base contro vulnerabilità web note
app.use(helmet()); 

// Gestione delle richieste CORS per le API REST (deve essere prima delle rotte!)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Se usi cookie o sessioni JWT nel frontend
}));

// Parsing del corpo delle richieste in formato JSON
app.use(express.json()); 

// -------------------------------------------------------------------
// 3. DEFINIZIONE DELLE ROUTES API
// -------------------------------------------------------------------

app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Rotta di benvenuto (Root)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Benvenuto su EventHub API! Node.js Server attivo.',
    status: 'online',
    docs: '/api/docs' // Riferimento a una potenziale documentazione
  });
});


// -------------------------------------------------------------------
// 4. CONNESSIONE AL DB E AVVIO SERVER
// -------------------------------------------------------------------

mongoose.connect(MONGODB_URI) 
  .then(() => {
    console.log('----------------------------------------------------');
    console.log('✅ Connesso al database MongoDB');

    // Inizializza l'ascolto del Server usando l'istanza HTTP
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
    process.exit(1); // Chiude il processo in caso di errore critico
  });