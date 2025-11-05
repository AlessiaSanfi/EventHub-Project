// backend/server.js

// Carica le variabili d'ambiente dal file .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');           // Importa il modulo HTTP di Node.js
const { Server } = require('socket.io'); // Importa la classe Server di Socket.IO

// Importa le rotte
const authRoutes = require('./routes/authRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { setIoInstance } = require('./socket/socketManager'); // <<< Import del Socket Manager

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// CREAZIONE SERVER HTTP
const server = http.createServer(app); // Crea il server HTTP usando l'istanza di Express

// CREAZIONE SERVER SOCKET.IO
// Configura l'istanza di Socket.IO per ascoltare il server HTTP
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Sostituisci con l'URL del tuo frontend
        methods: ['GET', 'POST']
    }
});

// Middleware di base per Express
app.use(express.json()); 

// -------------------------------------------------------------------
// 1. Connessione al Database MongoDB
// -------------------------------------------------------------------
mongoose.connect(MONGODB_URI) 
  .then(() => {
    console.log('✅ Connesso al database MongoDB');

    // -------------------------------------------------------------------
    // 3. LOGICA SOCKET.IO: Inizializza il manager
    // -------------------------------------------------------------------
    setIoInstance(io); // Passa l'istanza IO al gestore esterno

    // -------------------------------------------------------------------
    // 2. Definizione delle Routes API
    // -------------------------------------------------------------------

    app.use('/api/auth', authRoutes); 
    app.use('/api/events', eventRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);

    app.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'Benvenuto su EventHub API! Node.js Server attivo.',
        status: 'online'
      });
    });
    
    // Inizializza l'ascolto del Server usando l'istanza HTTP (server.listen)
    server.listen(PORT, () => { 
      console.log(`🚀 Server Node.js in esecuzione su http://localhost:${PORT}`);
    });

  }) 
  .catch((err) => {
    console.error('❌ Errore di connessione al database:', err);
    console.error('Verifica che la MONGODB_URI nel file .env sia corretta e completa, inclusa la password.');
    process.exit(1); 
  });