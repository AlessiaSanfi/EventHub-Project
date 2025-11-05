// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { 
    getCreatedEvents, 
    getAttendingEvents 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // Middleware di protezione

// Tutte le rotte sotto /api/users/me richiedono l'autenticazione
router.use(protect);

// Dashboard Utente
router.get('/me/created-events', getCreatedEvents);
router.get('/me/attending-events', getAttendingEvents);

module.exports = router;