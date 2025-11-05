// backend/controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const Report = require('../models/Report');
const { sendNotificationToUser, sendNotificationToAdmins } = require('../socket/socketManager');

// @route   GET /api/events
// @desc    Ottieni tutti gli eventi pubblici con filtri, ordinamento e paginazione
// @access  Public
exports.getEvents = async (req, res, next) => {
    try {
        let query;

        // 1. FILTRAGGIO (Per Category e Location)
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
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Event.countDocuments(JSON.parse(queryStr));

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
        // Spesso errori di query Mongoose
        res.status(400).json({ message: 'Errore durante la ricerca avanzata degli eventi.', error: err.message });
    }
};


// @route   GET /api/events/:id
// @desc    Ottieni un singolo evento
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username email') 
      .populate('attendees', 'username email'); 

    if (!event) {
      return res.status(404).json({ message: `Evento non trovato con id ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dell\'evento.', error: err.message });
  }
};


// @route   POST /api/events
// @desc    Crea un nuovo evento
// @access  Private (Solo Utente Autenticato)
exports.createEvent = async (req, res, next) => {
  try {
    // 1. Aggiungi l'ID del creatore 
    req.body.creator = req.user.id;
    
    // 2. Creazione dell'evento nel database
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Errore nella creazione dell\'evento.', error: err.message });
  }
};


// @route   PUT /api/events/:id
// @desc    Aggiorna un evento (Solo il creatore)
// @access  Private (Solo Utente Autenticato)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: `Evento non trovato con id ${req.params.id}` });
    }

    // Controllo di Autorizzazione
    if (event.creator.toString() !== req.user.id && req.user.role !== 'amministratore') {
      return res.status(401).json({ 
        message: `Non autorizzato ad aggiornare questo evento.`,
      });
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
    res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'evento.', error: err.message });
  }
};


// @route   DELETE /api/events/:id
// @desc    Cancella un evento (Solo il creatore o un amministratore)
// @access  Private (Solo Utente Autenticato)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: `Evento non trovato con id ${req.params.id}` });
    }

    // Controllo di Autorizzazione
    if (event.creator.toString() !== req.user.id && req.user.role !== 'amministratore') {
      return res.status(401).json({ message: `Non autorizzato a cancellare questo evento.` });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (err) {
    res.status(500).json({ message: 'Errore nella cancellazione dell\'evento.', error: err.message });
  }
};


// @route   POST /api/events/:id/attend
// @desc    Iscrizione a un evento
// @access  Private (Solo Utente Autenticato)
exports.attendEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; 

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Evento non trovato.' });
    }
    
    // 1. Verifica se l'utente è già iscritto
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Sei già iscritto a questo evento.' });
    }

    // 2. Verifica se l'evento è pieno
    if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: 'L\'evento ha raggiunto la capienza massima.' });
    }

    // 3. Aggiungi l'utente alla lista attendees
    event.attendees.push(userId);
    await event.save();
    
    // ------------------------------------------------------
    // LOGICA NOTIFICA LIVE (REQUISITO C)
    // ------------------------------------------------------
    const notification = {
        type: 'iscrizione',
        message: `${req.user.username} si è iscritto al tuo evento: ${event.title}`,
        eventId: event._id,
        timestamp: new Date().toISOString()
    };
    // Invia la notifica al creatore dell'evento
    sendNotificationToUser(event.creator.toString(), notification);
    // ------------------------------------------------------

    res.status(200).json({
      success: true,
      message: 'Iscrizione all\'evento avvenuta con successo!',
      data: event.attendees.length 
    });

  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'iscrizione.', error: err.message });
  }
};


// @route   DELETE /api/events/:id/attend
// @desc    Cancellazione dell'iscrizione a un evento
// @access  Private (Solo Utente Autenticato)
exports.unattendEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato.' });
        }
        
        // 1. Verifica se l'utente non è iscritto
        if (!event.attendees.includes(userId)) {
            return res.status(400).json({ message: 'Non eri iscritto a questo evento.' });
        }

        // 2. Rimuovi l'utente dalla lista attendees
        event.attendees = event.attendees.filter(
            (attendeeId) => attendeeId.toString() !== userId.toString()
        );
        await event.save();

        // ------------------------------------------------------
        // LOGICA NOTIFICA LIVE (REQUISITO C)
        // ------------------------------------------------------
        const notification = {
            type: 'cancellazione',
            message: `${req.user.username} ha annullato l'iscrizione al tuo evento: ${event.title}`,
            eventId: event._id,
            timestamp: new Date().toISOString()
        };
        // Invia la notifica al creatore dell'evento
        sendNotificationToUser(event.creator.toString(), notification);
        // ------------------------------------------------------

        res.status(200).json({
            success: true,
            message: 'Cancellazione dell\'iscrizione avvenuta con successo!',
            data: event.attendees.length
        });

    } catch (err) {
        res.status(500).json({ message: 'Errore durante la cancellazione dell\'iscrizione.', error: err.message });
    }
};

// @route   POST /api/events/:id/report
// @desc    Segnala un evento
// @access  Private (Solo Utente Autenticato)
exports.reportEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const { reason } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato.' });
        }

        // 1. Crea la Segnalazione
        const report = await Report.create({
            event: eventId,
            reportedBy: req.user.id,
            reason
        });

        // 2. Notifica Live agli Amministratori (Requisito C)
        const notification = {
            type: 'segnalazione',
            message: `NUOVA SEGNALAZIONE per l'evento: ${event.title}. Motivo: ${reason}`,
            reportId: report._id,
            eventId: event._id,
            timestamp: new Date().toISOString()
        };
        // Implementazione semplificata: invia a tutti i client registrati come admin
        sendNotificationToAdmins(notification);

        res.status(201).json({
            success: true,
            message: 'Evento segnalato con successo. Gli amministratori saranno avvisati.',
            data: report
        });

    } catch (err) {
        res.status(500).json({ message: 'Errore durante la segnalazione dell\'evento.', error: err.message });
    }
};