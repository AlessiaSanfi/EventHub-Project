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
    try {
      // Formato: Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica il token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Trova l'utente dal payload del token (escludendo la password)
      req.user = await User.findById(decoded.id).select('-password');
      
      // 4. Passa al prossimo middleware/controller
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Non autorizzato, token fallito o scaduto.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorizzato, nessun token trovato.' });
  }
};


// Middleware per limitare l'accesso in base al ruolo
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // req.user è stato impostato dal middleware 'protect'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `L'utente con ruolo ${req.user.role} non è autorizzato ad accedere a questa risorsa.`
      });
    }
    next();
  };
};