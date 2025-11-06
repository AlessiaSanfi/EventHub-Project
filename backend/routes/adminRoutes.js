/**
 * @file Rotte per le Funzionalità di Amministrazione.
 * @description Definisce tutti gli endpoint riservati al ruolo 'amministratore' per la gestione di utenti, eventi e segnalazioni. Tutte le rotte sono protette da autenticazione e autorizzazione.
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth'); // Importa entrambi
const { 
    getUsers, 
    toggleUserBlock, 
    deleteEventAsAdmin,
    getReportedEvents,
    resolveReport 
} = require('../controllers/adminController');

// Tutte le rotte in questo router richiedono un JWT valido (protect) 
// E richiedono che l'utente sia un 'amministratore' (authorize('amministratore'))

router.use(protect);
router.use(authorize('amministratore')); // Applica il controllo del ruolo a tutte le rotte sottostanti

// Gestione Utenti
// GET /api/admin/users
router.route('/users')
    .get(getUsers);

// PUT /api/admin/users/:id/block
router.route('/users/:id/block')
    .put(toggleUserBlock); // Blocca/Sblocca

// Gestione Eventi (Cancellazione Forzata)
// DELETE /api/admin/events/:id
router.route('/events/:id')
    .delete(deleteEventAsAdmin);

// Gestione Segnalazioni
// GET /api/admin/reports
router.route('/reports')
    .get(getReportedEvents);

// PUT /api/admin/reports/:id/resolve
router.route('/reports/:id/resolve')
    .put(resolveReport);

module.exports = router;