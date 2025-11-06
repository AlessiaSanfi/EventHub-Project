/**
 * @file Schema Mongoose per il Modello Utente.
 * @description Definisce la struttura dati di un utente, implementando la crittografia della password (hashing), la gestione dei ruoli e la logica per i token JWT e il reset della password.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Per l'hashing delle password
const jwt = require('jsonwebtoken'); // Per la generazione dei token di accesso
const crypto = require('crypto'); // Per generare token casuali e hasharli

const UserSchema = new mongoose.Schema({
    // Nome utente: obbligatorio, unico e limitato.
    username: {
        type: String,
        required: [true, 'Il nome utente è obbligatorio'],
        unique: true,
        maxlength: [30, 'Il nome utente non può superare i 30 caratteri']
    },
    // Email: obbligatoria, unica e validata tramite regex.
    email: {
        type: String,
        required: [true, 'L\'indirizzo email è obbligatorio'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Per favore, inserisci un indirizzo email valido'
        ]
    },
    // Password: obbligatoria, con lunghezza minima e ESCLUSA dalle query di lettura.
    password: {
        type: String,
        required: [true, 'La password è obbligatoria'],
        minlength: [6, 'La password deve contenere almeno 6 caratteri'],
        select: false // Importante: non restituita di default
    },
    // Ruolo dell'utente (utilizzato per l'autorizzazione).
    role: {
        type: String,
        enum: ['utente', 'amministratore', 'bloccato'],
        default: 'utente'
    },
    // Timestamp di creazione.
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Campo per memorizzare l'hash del token di reset (NON il token non hashato).
    resetPasswordToken: String,
    // Data di scadenza del token di reset.
    resetPasswordExpire: Date
}, {
    // Opzioni dello schema (mantenute per completezza, anche se non strettamente necessarie qui)
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// Middleware Mongoose: Hashing della password prima del salvataggio
// Esegue l'hashing SOLO se il campo 'password' è stato modificato
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Metodo di istanza: Restituisce un JWT firmato con ID, Ruolo e Username.
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role, username: this.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Metodo di istanza: Confronta la password inserita (chiara) con l'hash nel DB.
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Metodo di istanza: Genera il token di reset, lo hasha (per il DB) e ritorna il token non hashato (per l'email).
UserSchema.methods.getResetPasswordToken = function() {
    // 1. Genera un token casuale (stringa esadecimale non hashata)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hasha il token PRIMA di salvarlo nel database (sicurezza)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Imposta la data di scadenza (15 minuti)
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    // 4. Ritorna il token NON hashato (da inviare via email)
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);