/**
 * @file Controllore per le operazioni di Amministrazione.
 * @description Gestisce le rotte protette da ruolo 'amministratore', permettendo la gestione di utenti, eventi e segnalazioni (CRUD e moderazione).
 */

const User = require('../models/User');
const Event = require('../models/Event');
const Report = require('../models/Report'); // Importato per gestione segnalazioni


// @route   GET /api/admin/users
// @desc    Ottengo tutti gli utenti registrati
// @access  Private (Solo Amministratore)
exports.getUsers = async (req, res, next) => {
    try {
        // Ottengo tutti gli utenti escludendo la password
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero degli utenti.', error: err.message });
    }
};

// @route   PUT /api/admin/users/:id/block
// @desc    Blocco/Sblocco un utente
// @access  Private (Solo Amministratore)
exports.toggleUserBlock = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('+role');
        
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        // Impedisco all'admin di bloccare se stesso
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'Non puoi bloccare il tuo account amministratore.' });
        }

        // Logica di blocco/sblocco usando il ruolo 'bloccato'
        const currentRole = user.role;
        const newRole = (currentRole === 'bloccato') ? 'utente' : 'bloccato';

        user.role = newRole;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Utente ${user.username} ora in stato: ${newRole}.`,
            data: user
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore durante il blocco utente.', error: err.message });
    }
};

// @route   DELETE /api/admin/events/:id
// @desc    Cancellazione forzata di un evento
// @access  Private (Solo Amministratore)
exports.deleteEventAsAdmin = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato.' });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: `Evento '${event.title}' cancellato forzatamente.`,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nella cancellazione forzata dell\'evento.', error: err.message });
    }
};

// ----------------------------------------------------
// GESTIONE SEGNALAZIONI (REQUISITO C)
// ----------------------------------------------------

// @route   GET /api/admin/reports
// @desc    Ottengo tutte le segnalazioni aperte/irrisolte
// @access  Private (Solo Amministratore)
exports.getReportedEvents = async (req, res, next) => {
    try {
        // Cerca tutte le segnalazioni che non sono state risolte
        const reports = await Report.find({ isResolved: false })
            .populate('event', 'title creator')
            .populate('reportedBy', 'username');

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero delle segnalazioni.', error: err.message });
    }
};

// @route   PUT /api/admin/reports/:id/resolve
// @desc    Marchia una segnalazione come risolta
// @access  Private (Solo Amministratore)
exports.resolveReport = async (req, res, next) => {
    try {
        let report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Segnalazione non trovata.' });
        }

        if (report.isResolved) {
             return res.status(400).json({ message: 'Questa segnalazione è già stata risolta.' });
        }

        report.isResolved = true;
        report.resolvedBy = req.user.id; // L'ID dell'amministratore che risolve
        await report.save();

        res.status(200).json({
            success: true,
            message: `Segnalazione #${report._id} marcata come risolta.`,
            data: report
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore nel marcare la segnalazione come risolta.', error: err.message });
    }
};