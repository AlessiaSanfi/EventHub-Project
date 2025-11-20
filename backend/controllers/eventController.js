/**
 * @file Controllore per la gestione degli Eventi.
 * @description Gestisce tutte le operazioni relative agli eventi (CRUD, ricerca avanzata, paginazione) e la logica di partecipazione/iscrizione.
 */

const Event = require('../models/Event');
const User = require('../models/User'); // Importato, ma non strettamente usato in questo file
const Report = require('../models/Report');
const { sendNotificationToUser, sendNotificationToAdmins } = require('../socket/socketManager');
const ErrorResponse = require('../utils/errorResponse'); // Importazione del gestore di errori personalizzato

// @route   GET /api/events
// @desc    Ottieni tutti gli eventi pubblici con filtri, ordinamento e paginazione
// @access  Public
exports.getEvents = async (req, res, next) => {
    try {
        let query;

        // 1. FILTRAGGIO (per Category, Location, ecc.)
        const reqQuery = { ...req.query };

        // Campi da escludere dalla query di ricerca Mongoose
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        
        // Permette operatori avanzati come gt, gte, lt, lte (es. /api/events?price[lte]=50)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        
        // Costruisci la query Mongoose
        query = Event.find(JSON.parse(queryStr));
        
        // 2. ORDINAMENTO
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            // Default: ordina per data creazione discendente
            query = query.sort('-createdAt');
        }

        // 3. SELEZIONE CAMPI
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // 4. PAGINAZIONE
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default 10 eventi per pagina
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit; // Utile per la paginazione
        const total = await Event.countDocuments(JSON.parse(queryStr)); // Trova il totale dei documenti per la paginazione

        // Applica skip e limit e popola i dati del creatore
        query = query.skip(startIndex).limit(limit).populate('creator', 'username email');

        // Esecuzione della query
        const events = await query;
        
        // Risultati della paginazione
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: events.length,
            total,
            pagination,
            data: events
        });

    } catch (err) {
        next(err);// Gestione degli errori Mongoose/Logica: passa l'errore al middleware
    }

};


// @route   GET /api/events/:id
// @desc    Ottieni un singolo evento
// @access  Public
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('creator', 'username email') 
            .populate('attendees', 'username email'); // Popola gli iscritti con username ed email

        if (!event) {
            // Usiamo ErrorResponse per i 404
            return next(new ErrorResponse(`Evento non trovato con id ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        next(err); // La gestione di CastError (ID non valido) sarà gestita nell'errorHandler globale.
    }
};


// @route   POST /api/events
// @desc    Crea un nuovo evento
// @access  Private (Solo Utente Autenticato)
exports.createEvent = async (req, res, next) => {
    try {
        // 1. Aggiungi l'ID del creatore, preso dal token JWT
        req.body.creator = req.user.id;
        
        // 2. Creazione dell'evento nel database
        const event = await Event.create(req.body);

        res.status(201).json({
            success: true,
            data: event
        });

    } catch (err) {
        next(err); // La gestione di ValidationError sarà gestita nell'errorHandler globale.
    }
};


// @route   PUT /api/events/:id
// @desc    Aggiorna un evento (Solo il creatore o amministratore)
// @access  Private (Solo Utente Autenticato)
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse(`Evento non trovato con id ${req.params.id}`, 404));
        }

        // Controllo di Autorizzazione: Deve essere il creatore O un amministratore
        if (event.creator.toString() !== req.user.id && req.user.role !== 'amministratore') {
            return next(new ErrorResponse(`Non autorizzato ad aggiornare questo evento. Solo il creatore o l'amministratore possono modificarlo.`, 401));
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true 
        });

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (err) {
        next(err); // La gestione di CastError e ValidationError sarà gestita nell'errorHandler globale.
    }
};


// @route   DELETE /api/events/:id
// @desc    Cancella un evento (Solo il creatore o un amministratore)
// @access  Private (Solo Utente Autenticato)
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse(`Evento non trovato con id ${req.params.id}`, 404));
        }

        // Controllo di Autorizzazione: Deve essere il creatore O un amministratore
        if (event.creator.toString() !== req.user.id && req.user.role !== 'amministratore') {
            return next(new ErrorResponse(`Non autorizzato a cancellare questo evento.`, 401));
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Evento cancellato con successo.',
            data: {}
        });

    } catch (err) {
        next(err); // La gestione di CastError sarà gestita nell'errorHandler globale.
    }
};


// @route   POST /api/events/:id/attend
// @desc    Iscrizione a un evento
// @access  Private (Solo Utente Autenticato)
exports.attendEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const event = await Event.findById(eventId);

        if (!event) {
            // Utilizzo di ErrorResponse per 404
            return next(new ErrorResponse('Evento non trovato.', 404));
        }
        
        // 1. Verifica se l'utente è già iscritto
        if (event.attendees.includes(userId)) {
            // Soluzione al Mismatch 400 vs 500: uso di next(ErrorResponse)
            return next(new ErrorResponse('Sei già registrato a questo evento.', 400));
        }

        // 2. Verifica se l'evento è pieno
        if (event.attendees.length >= event.capacity) {
            // Soluzione al Mismatch 400 vs 500: uso di next(ErrorResponse)
            return next(new ErrorResponse('L\'evento ha raggiunto la capienza massima.', 400));
        }

        // 3. Aggiungi l'utente alla lista attendees
        event.attendees.push(userId);
        await event.save();
        
        // ------------------------------------------------------
        // LOGICA NOTIFICA LIVE (REQUISITO C)
        // ------------------------------------------------------
        const userWhoAttended = req.user.username; // Ottengo l'username per la notifica
        const notification = {
            type: 'iscrizione',
            message: `${userWhoAttended} si è iscritto al tuo evento: ${event.title}`,
            eventId: event._id,
            timestamp: new Date().toISOString()
        };
        // Invia la notifica al creatore dell'evento
        sendNotificationToUser(event.creator.toString(), notification);

        res.status(200).json({
            success: true,
            message: 'Registrazione all\'evento avvenuta con successo.', 
            data: event.attendees.length
        });

    } catch (err) {
        // Passa qualsiasi altro errore (es. CastError) al middleware centrale
        next(err);
    }
};


// @route   DELETE /api/events/:id/attend
// @desc    Cancellazione dell'iscrizione a un evento
// @access  Private (Solo Utente Autenticato)
exports.unattendEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const event = await Event.findById(eventId);

        if (!event) {
            return next(new ErrorResponse('Evento non trovato.', 404));
        }
        
        // 1. Verifica se l'utente non è iscritto
        if (!event.attendees.includes(userId)) {
            // Soluzione al Mismatch 400 vs 500: uso di next(ErrorResponse)
            return next(new ErrorResponse('Non eri iscritto a questo evento.', 400));
        }

        // 2. Rimuove l'utente dalla lista attendees
        event.attendees = event.attendees.filter(
            (attendeeId) => attendeeId.toString() !== userId.toString()
        );
        await event.save();

        // ------------------------------------------------------
        // LOGICA NOTIFICA LIVE (REQUISITO C)
        // ------------------------------------------------------
        const userWhoUnattended = req.user.username; // Ottengo l'username per la notifica
        const notification = {
            type: 'cancellazione',
            message: `${userWhoUnattended} ha annullato l'iscrizione al tuo evento: ${event.title}`,
            eventId: event._id,
            timestamp: new Date().toISOString()
        };
        // Invia la notifica al creatore dell'evento
        sendNotificationToUser(event.creator.toString(), notification);

        res.status(200).json({
            success: true,
            message: 'Cancellazione dall\'evento avvenuta con successo.', // AGGIORNATO per il test
            data: event.attendees.length
        });

    } catch (err) {
        next(err); // Passa qualsiasi altro errore (es. CastError) al middleware centrale
    }
};

// @route   POST /api/events/:id/report
// @desc    Segnala un evento
// @access  Private (Solo Utente Autenticato)
exports.reportEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const { reason } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return next(new ErrorResponse('Evento non trovato.', 404));
        }

        // 1. Crea la Segnalazione
        const report = await Report.create({
            event: eventId,
            reportedBy: req.user.id,
            reason
        });

        // 2. Notifica Live agli Amministratori (Requisito C)
        const userWhoReported = req.user.username;
        const notification = {
            type: 'segnalazione',
            message: `NUOVA SEGNALAZIONE da ${userWhoReported} per l'evento: ${event.title}. Motivo: ${reason}`,
            reportId: report._id,
            eventId: event._id,
            timestamp: new Date().toISOString()
        };
        // Invia notifica specifica a tutti i client admin connessi
        sendNotificationToAdmins(notification);

        res.status(201).json({
            success: true,
            message: 'Evento segnalato con successo. Gli amministratori saranno avvisati.',
            data: report
        });

    } catch (err) {
        next(err); // Passa qualsiasi altro errore (es. CastError) al middleware centrale
    }
};