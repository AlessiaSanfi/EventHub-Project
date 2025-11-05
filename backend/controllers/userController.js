// backend/controllers/userController.js

const Event = require('../models/Event');
const User = require('../models/User');

// @route   GET /api/users/me/created-events
// @desc    Ottieni gli eventi creati dall'utente corrente
// @access  Private (protetto da JWT)
exports.getCreatedEvents = async (req, res, next) => {
    try {
        // req.user.id viene fornito dal middleware 'protect'
        const events = await Event.find({ creator: req.user.id })
            .select('-attendees') // Generalmente non necessario vedere gli iscritti in questa vista
            .sort({ date: 1 }); // Ordina per data crescente
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero degli eventi creati.', error: err.message });
    }
};


// @route   GET /api/users/me/attending-events
// @desc    Ottieni gli eventi a cui l'utente corrente è iscritto
// @access  Private (protetto da JWT)
exports.getAttendingEvents = async (req, res, next) => {
    try {
        // Cerca gli eventi dove l'array 'attendees' include l'ID dell'utente
        const events = await Event.find({ attendees: req.user.id })
            .populate('creator', 'username email') // Mostra chi ha creato l'evento
            .select('-attendees') // Per alleggerire la risposta (sappiamo che l'utente è iscritto)
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

// ... Qui potremmo aggiungere logica per la gestione del profilo utente ...