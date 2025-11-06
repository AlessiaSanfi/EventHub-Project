/**
 * @file Middleware di Autenticazione e Autorizzazione (JWT).
 * @description Contiene le funzioni per la protezione delle rotte, verificando la validità del JWT e il ruolo dell'utente.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa il Modello Utente

// Middleware per proteggere le rotte (richiede un JWT valido)
exports.protect = async (req, res, next) => {
  let token;

  // 1. Controlla l'intestazione e estrai il token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Formato: Bearer <token>
    token = req.headers.authorization.split(' ')[1];
  } 

  // 2. Gestione del token mancante (pulito e immediato)
  if (!token) {
    // Utilizza 401 Unauthorized se nessun token è presente
    return res.status(401).json({ message: 'Non autorizzato, nessun token trovato nell\'intestazione.' });
  }


  try {
    // 3. Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Trova l'utente dal payload del token (escludendo la password)
    // Imposta req.user per i middleware/controller successivi
    req.user = await User.findById(decoded.id).select('-password');
    
    // 5. Passa al prossimo middleware/controller
    next();

  } catch (error) {
    // Gestione di errori specifici di JWT come scadenza o firma non valida
    console.error('Errore di verifica JWT:', error.message);
    // Utilizza 401 Unauthorized per token non validi
    return res.status(401).json({ message: 'Non autorizzato, token non valido o scaduto.' });
  }
};


// Middleware per limitare l'accesso in base al ruolo
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // req.user è stato impostato con successo dal middleware 'protect'
    if (!req.user || !roles.includes(req.user.role)) { // Aggiunto !req.user per sicurezza extra
      // Utilizza 403 Forbidden per autorizzazione negata
      return res.status(403).json({
        message: `Accesso negato. L'utente non dispone dei permessi necessari (${roles.join(', ')}).`
      });
    }
    next();
  };
};