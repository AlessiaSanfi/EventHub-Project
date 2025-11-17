/**
 * @file Setup Globale di Jest per i Test di Integrazione.
 * @description Configura la connessione a MongoDB (ambiente di test) prima di eseguire qualsiasi suite e gestisce la pulizia del database (database seeding e teardown) dopo ogni test.
 */

const mongoose = require('mongoose');
const path = require('path');

// Importa i modelli che voglio pulire tra i test
const User = require('./models/User'); 
const Event = require('./models/Event');
const Report = require('./models/Report');

// Carica le variabili d'ambiente per i test
require('dotenv').config({ 
    path: path.resolve(__dirname, '.env') 
});

// Tempo massimo per le operazioni di setup/teardown in millisecondi
const SETUP_TIMEOUT = 60000; // Aumentato a 60 secondi

// Connessione al DB di Test all'inizio di TUTTI i test
beforeAll(async () => {
    // Usa la variabile d'ambiente per il database di test
    const uri = process.env.TEST_MONGODB_URI; 

    if (!uri) {
        throw new Error("TEST_MONGODB_URI non è definito nel file .env.");
    }
    
    // Chiudi qualsiasi connessione esistente
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }

    try {
        // Connetti al database di test con opzioni aggiornate
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            bufferTimeoutMS: 20000,
        });
        console.log("✅ Connesso al database di test MongoDB Atlas");
    } catch (error) {
        console.error("❌ Errore di connessione al database di test:", error);
        throw error;
    }
}, SETUP_TIMEOUT);

// File di test che devono preservare lo stato tra gli it()
const SKIP_TEST_FILES = ['interaction.test.js'];

afterEach(async () => {
    const testPath = (expect.getState && expect.getState().testPath) || '';
    // Se il test corrente appartiene a un file nella lista, skip della pulizia
    const shouldSkip = SKIP_TEST_FILES.some(f => testPath.endsWith(f));

    if (shouldSkip) return;

    try {
        // Svuota le collezioni (deleteMany senza filtri)
        await User.deleteMany({});
        await Event.deleteMany({});
        await Report.deleteMany({});
        
    } catch (error) {
        console.error('Errore durante la pulizia del DB:', error);
    }
}, SETUP_TIMEOUT);

// Chiude la connessione al DB dopo che *tutti* i test sono stati eseguiti
afterAll(async () => {
    try {
        // Un controllo per assicurarmi che la connessione sia attiva
        if (mongoose.connection.readyState !== 0) { 
            await mongoose.connection.close();
            console.log("🔌 Disconnesso dal database di test.");
        }
    } catch (error) {
        console.error("Errore durante la disconnessione:", error);
    }
}, SETUP_TIMEOUT);