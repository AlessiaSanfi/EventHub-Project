// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth'); // Importa entrambi
const { 
    getUsers, 
    toggleUserBlock, 
    deleteEventAsAdmin 
} = require('../controllers/adminController');

// Tutte le rotte in questo router richiedono un JWT valido (protect) 
// E richiedono che l'utente sia un 'amministratore' (authorize('amministratore'))

router.use(protect);
router.use(authorize('amministratore')); // Applica il controllo del ruolo a tutte le rotte sottostanti

// Gestione Utenti
router.route('/users')
    .get(getUsers);

router.route('/users/:id/block')
    .put(toggleUserBlock); // Blocca/Sblocca

// Gestione Eventi (Cancellazione Forzata)
router.route('/events/:id')
    .delete(deleteEventAsAdmin);

// Nota: Le rotte per le Segnalazioni saranno aggiunte al prossimo passo.

module.exports = router;