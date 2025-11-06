/**
 * @file Controllore per le operazioni specifiche dell'utente autenticato.
 * @description Gestisce l'aggiornamento del profilo utente (`/me`) e il recupero degli eventi creati o a cui si è iscritti.
 */

const Event = require('../models/Event');
const User = require('../models/User');

// @route   GET /api/users/me/created-events
// @desc    Ottieni gli eventi creati dall'utente corrente
// @access  Private (protetto da JWT)
exports.getCreatedEvents = async (req, res, next) => {
    try {
        // req.user.id viene fornito dal middleware 'protect'
        const events = await Event.find({ creator: req.user.id })
            .select('-attendees') // Esclude l'array completo degli iscritti per alleggerire la risposta
            .sort({ date: 1 }); // Ordina per data crescente (più vicini prima)
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero degli eventi creati.', error: err.message });
    }
};


// @route   GET /api/users/me/attending-events
// @desc    Ottieni gli eventi a cui l'utente corrente è iscritto
// @access  Private (protetto da JWT)
exports.getAttendingEvents = async (req, res, next) => {
    try {
        // Cerca gli eventi dove l'array 'attendees' include l'ID dell'utente
        const events = await Event.find({ attendees: req.user.id })
            .populate('creator', 'username email') // Mostra chi ha creato l'evento
            .select('-attendees') // Per alleggerire la risposta
            .sort({ date: 1 });
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero degli eventi a cui si è iscritti.', error: err.message });
    }
};

// @route   PUT /api/users/me
// @desc    Aggiorna i dettagli del profilo dell'utente corrente
// @access  Private (protetto da JWT)
exports.updateProfile = async (req, res, next) => {
    try {
        // Filtra i campi che l'utente NON DEVE poter modificare tramite questa rotta
        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email,
            // Non permettiamo di modificare il ruolo o la password qui
        };

        // Rimuovi i campi non definiti per evitare aggiornamenti a null/undefined
        Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true, // Restituisce il documento aggiornato
            runValidators: true, // Esegue le validazioni dello schema
        }).select('-password'); // Esclude la password nella risposta

        if (!user) {
            // Questo caso dovrebbe essere raro se il middleware 'protect' funziona
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        res.status(200).json({
            success: true,
            message: 'Profilo aggiornato con successo.',
            data: user
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: `Errore di validazione: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo.', error: err.message });
    }
};