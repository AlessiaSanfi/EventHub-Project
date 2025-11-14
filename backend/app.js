/**
 * @file app.js
 * @description Configura i middleware e le rotte di Express. L'istanza 'app' viene esportata per essere usata dai test e dal server principale.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importa l'handler degli errori (NUOVO)
const errorHandler = require('./middleware/errorHandler'); 

// Importa le rotte
const authRoutes = require('./routes/authRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// -------------------------------------------------------------------
// MIDDLEWARE DI SICUREZZA E PARSING
// -------------------------------------------------------------------

// Protezione base contro vulnerabilità web note
app.use(helmet()); 

// Gestione delle richieste CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));

// Parsing del corpo delle richieste in formato JSON
app.use(express.json()); 

// -------------------------------------------------------------------
// DEFINIZIONE DELLE ROUTES API
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
        docs: '/api/docs'
    });
});

// -------------------------------------------------------------------
// GESTIONE DEGLI ERRORI (DA APPLICARE DOPO TUTTE LE ROTTE)
// -------------------------------------------------------------------

/**
 * Middleware di gestione degli errori finale. 
 * Questo deve essere l'ULTIMO app.use() chiamato.
 * Cattura tutti gli errori sollevati da next(err).
 */
app.use(errorHandler);

// Esporta l'istanza 'app' di Express
module.exports = app;