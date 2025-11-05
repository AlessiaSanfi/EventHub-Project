// backend/controllers/adminController.js

const User = require('../models/User');
const Event = require('../models/Event');
// Nota: Userai il modello Event e User per moderare

// Funzione Helper per controllare il ruolo (assicura che sia 'amministratore')
// Anche se la rotta è protetta, è una buona prassi rifare il controllo qui.
const checkAdmin = (req, res) => {
    if (req.user.role !== 'amministratore') {
        return res.status(403).json({ message: 'Accesso negato. Richiede ruolo amministratore.' });
    }
    return true;
};

// @route   GET /api/admin/users
// @desc    Ottieni tutti gli utenti registrati
// @access  Private (Solo Amministratore)
exports.getUsers = async (req, res, next) => {
    try {
        if (checkAdmin(req, res) !== true) return;

        // Ottieni tutti gli utenti escludendo la password
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
// @desc    Blocca/Sblocca un utente
// @access  Private (Solo Amministratore)
exports.toggleUserBlock = async (req, res, next) => {
    try {
        if (checkAdmin(req, res) !== true) return;

        const user = await User.findById(req.params.id).select('+role');
        
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        // Impedisci all'admin di bloccare se stesso
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'Non puoi bloccare il tuo account amministratore.' });
        }

        // Toggle della proprietà 'isBlocked' (che potremmo aggiungere in models/User.js)
        // Per semplicità, in questo esempio modifichiamo il ruolo a un ruolo fittizio 'bloccato'
        // NOTA: Aggiungi un campo `isBlocked: { type: Boolean, default: false }` in User.js per un approccio corretto
        // Qui simuleremo il blocco cambiando il ruolo (Metodo meno pulito, ma rapido per l'esame)
        
        // Simulo la logica di blocco/sblocco:
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
        if (checkAdmin(req, res) !== true) return;

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

// Nota: Qui potresti aggiungere getReportedEvents e resolveReport