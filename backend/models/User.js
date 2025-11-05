// backend/models/User.js (AGGIORNATO)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // <<< IMPORTA IL MODULO CRYPTO

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Il nome utente è obbligatorio'],
        unique: true,
        maxlength: [30, 'Il nome utente non può superare i 30 caratteri']
    },
    email: {
        type: String,
        required: [true, 'L\'indirizzo email è obbligatorio'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Per favore, inserisci un indirizzo email valido'
        ]
    },
    password: {
        type: String,
        required: [true, 'La password è obbligatoria'],
        minlength: [6, 'La password deve contenere almeno 6 caratteri'],
        select: false // Non mostrare la password nelle query GET
    },
    role: {
        type: String,
        enum: ['utente', 'amministratore', 'bloccato'],
        default: 'utente'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // -------------------------------------------------------------------
    // CAMPI PER IL RECUPERO PASSWORD (Reset Token)
    // -------------------------------------------------------------------
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    // Opzione per includere campi virtuali (es. per il token di reset)
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// Middleware Mongoose: Hashing della password prima del salvataggio
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Metodo di istanza: Ottieni JWT (JSON Web Token)
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role, username: this.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Metodo di istanza: Confronta la password inserita con quella hashata nel DB
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// -------------------------------------------------------------------
// METODO DI ISTANZA: Genera e hasha il token di reset password
// -------------------------------------------------------------------
UserSchema.methods.getResetPasswordToken = function() {
    // 1. Genera un token casuale (stringa esadecimale non hashata)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hasha il token prima di salvarlo nel database (per sicurezza, solo l'hash viene memorizzato)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Imposta la data di scadenza (es. 15 minuti)
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    // 4. Ritorna il token NON hashato (da inviare via email)
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);