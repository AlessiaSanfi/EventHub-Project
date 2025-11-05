// backend/routes/authRoutes.js (AGGIORNATO)

const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// ----------------------------------------------------
// ROTTE RECUPERO PASSWORD (Opzionale A)
// ----------------------------------------------------
router.post('/forgotpassword', forgotPassword); // Invia il link/token all'email
router.put('/resetpassword/:resettoken', resetPassword); // Resetta la password
// ----------------------------------------------------

module.exports = router;