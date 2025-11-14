/**
 * @file Rotte per le Funzionalità del Profilo Utente.
 * @description Definisce gli endpoint per recuperare i dati specifici dell'utente autenticato, come gli eventi creati e quelli a cui si è iscritti. Tutte le rotte richiedono autenticazione.
 */

const express = require('express');
const router = express.Router();
const { 
    getCreatedEvents, 
    getAttendingEvents,
    updateProfile // Rotta di aggiornamento profilo
} = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // Middleware di protezione

// Tutte le rotte sotto /api/users/me richiedono l'autenticazione
router.use(protect);

// DASHBOARD UTENTE E DETTAGLI PROFILO

// GET /api/users/me/created-events: Ottieni gli eventi creati dall'utente
router.get('/me/created-events', getCreatedEvents);

// GET /api/users/me/attending-events: Ottieni gli eventi a cui l'utente è iscritto
router.get('/me/attending-events', getAttendingEvents);

// PUT /api/users/me: Aggiorna i dettagli del profilo utente
router.put('/me', updateProfile); // Rotta per l'aggiornamento del profilo

module.exports = router;