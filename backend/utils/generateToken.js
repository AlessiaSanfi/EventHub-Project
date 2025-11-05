const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // Payload: dati dell'utente da includere nel token
    process.env.JWT_SECRET, // Chiave segreta (dal file .env)
    {
      expiresIn: '1d', // Il token scade dopo 1 giorno
    }
  );
};

module.exports = generateToken;