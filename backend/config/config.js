const path = require('path');
// 1. Usa path.resolve per trovare .env in modo robusto
require('dotenv').config({ 
    // Risale da 'config' a 'backend', e poi cerca '.env'
    path: path.resolve(__dirname, '../.env') 
}); 

// 2. Definizione delle configurazioni
const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
};

// 3. Logica Condizionale per l'URI del Database
if (config.NODE_ENV === 'test') {
    // Usa la variabile di test (TEST_MONGODB_URI dal tuo .env)
    config.MONGO_URI = process.env.TEST_MONGODB_URI; 
} else {
    // Usa la variabile di sviluppo/produzione
    config.MONGO_URI = process.env.MONGODB_URI; 
}

module.exports = config;