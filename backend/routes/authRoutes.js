/**
 * @file Rotte per l'Autenticazione Utente (Auth).
 * @description Definisce tutti gli endpoint relativi alla gestione dell'utente: registrazione, login, recupero dati utente corrente e reset della password.
 */

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

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Richiede JWT valido)
router.get('/me', protect, getMe);

// ----------------------------------------------------
// ROTTE RECUPERO PASSWORD
// ----------------------------------------------------

// POST /api/auth/forgotpassword
router.post('/forgotpassword', forgotPassword); // Invia il link/token all'email

// PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', resetPassword); // Resetta la password

module.exports = router;