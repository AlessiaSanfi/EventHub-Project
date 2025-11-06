/**
 * @file Controllore per l'Autenticazione e l'Autorizzazione (Auth).
 * @description Gestisce l'intero flusso di accesso utente, inclusa registrazione, login, recupero password e l'emissione dei JSON Web Token (JWT).
 */

const User = require('../models/User'); // Importa il Modello Utente
const sendEmail = require('../utils/sendEmail'); // Importa l'utilità per invio email
const crypto = require('crypto'); //Necessario per hashing del token di reset

// @route   POST /api/auth/register
// @desc    Registrazione di un nuovo utente (Utente base)
// @access  Public
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // 1. Verifica se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utente con questa email è già registrato.' });
    }
    
    // 2. Creazione dell'utente (l'hashing della password avviene nel hook 'pre save' di User.js)
    const user = await User.create({
      username,
      email,
      password,
      // Il ruolo di default è 'utente' (impostato nello schema)
    });

    // 3. Genera il JWT usando il metodo di istanza del modello User
    const token = user.getSignedJwtToken(); 

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    // Gestione degli errori di validazione Mongoose o generici
    res.status(500).json({ message: 'Errore durante la registrazione.', error: err.message });
  }
};


// @route   POST /api/auth/login
// @desc    Login Utente e Ottieni Token
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Inserisci email e password.' });
  }
    
  try {
    // 1. Cerca l'utente per email e recupera la password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide.' });
    }

    // 2. Confronta la password (metodo definito in models/User.js)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenziali non valide.' });
    }

    // 3. Genera il JWT (Coerente con register e resetPassword)
    const token = user.getSignedJwtToken();

    // 4. Invia la risposta con il token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Errore del server durante il login.', error: err.message });
  }
};

// @route   GET /api/auth/me
// @desc    Ottieni l'utente corrente
// @access  Private (protetto da JWT)
exports.getMe = async (req, res, next) => {
    // Trova l'utente basandosi sull'ID fornito dal middleware 'protect'
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
        success: true,
        data: user
    });
};

// @route   POST /api/auth/forgotpassword
// @desc    Richiesta di reset password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        // Per sicurezza, inviamo sempre un messaggio di successo, anche se l'email non esiste (previene l'enumerazione degli utenti).
        return res.status(200).json({ 
            success: true, 
            message: 'Se l\'email è registrata, riceverai un link per il reset.' 
        });
    }

    // 1. Genera il token di reset (non hashato)
    const resetToken = user.getResetPasswordToken();

    // 2. Salva l'hash del token e la data di scadenza nel DB
    await user.save({ validateBeforeSave: false }); // Ignora le validazioni standard

    // 3. Crea il link per il reset da inviare via email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`; 

// NOTA PER DOPO: In produzione, questo dovrebbe puntare al frontend per gestire la UI di reset.

    const message = `Hai richiesto il reset della password. Per favore, clicca sul link sottostante per completare il processo:\n\n ${resetUrl}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'EventHub - Richiesta di Reset Password',
            text: message
        });

        res.status(200).json({ 
            success: true, 
            message: 'Email di reset password inviata con successo.' 
        });
    } catch (err) {
        console.error('Errore invio email di reset:', err);
        
        // Se l'invio fallisce, resettiamo i campi nel DB per riprovare
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500).json({ 
            message: 'Errore nell\'invio dell\'email. Verifica le credenziali SMTP.', 
            error: err.message 
        });
    }
};


// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Resetta la password
// @access  Public
exports.resetPassword = async (req, res, next) => {
    // 1. Ottieni il token hashato dall'URL per la ricerca nel DB
    const resetPasswordTokenHashed = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    // 2. Trova l'utente con il token hashato e che non sia scaduto
    const user = await User.findOne({
        resetPasswordToken: resetPasswordTokenHashed,
        resetPasswordExpire: { $gt: Date.now() } // $gt: maggiore di (non scaduto)
    });

    if (!user) {
        return res.status(400).json({ message: 'Token non valido o scaduto.' });
    }

    // 3. Imposta la nuova password
    user.password = req.body.password;

    // 4. Invalida i token di reset usati
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // Il middleware 'pre save' hasherà automaticamente la nuova password

    // 5. Genera e invia il nuovo JWT (Coerente con Login/Register)
    const token = user.getSignedJwtToken(); 

    res.status(200).json({ 
        success: true, 
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }
    });
};