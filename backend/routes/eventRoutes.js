const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  attendEvent,
  unattendEvent,
  reportEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth'); // Importa il middleware di protezione

// Rotte Pubbliche (Eventi visibili a tutti)
router.route('/')
  .get(getEvents) // GET /api/events: Lista Eventi Pubblici

router.route('/:id')
  .get(getEvent) // GET /api/events/:id: Dettagli singolo evento

// Rotta per la Segnalazione (Protetta)
router.route('/:id/report')
  .post(protect, reportEvent); // POST /api/events/:id/report: Segnala Evento

// Rotte Protette (Richiedono JWT)
router.route('/')
  .post(protect, createEvent); // POST /api/events: Crea Evento (Solo Utente Loggato)

router.route('/:id')
  .put(protect, updateEvent)    // PUT /api/events/:id: Modifica Evento (Solo Creatore/Admin)
  .delete(protect, deleteEvent); // DELETE /api/events/:id: Cancella Evento (Solo Creatore/Admin)

// Rotte Protette per Iscrizione/Cancellazione
router.route('/:id/attend')
  .post(protect, attendEvent)    // POST /api/events/:id/attend: Iscrizione
  .delete(protect, unattendEvent); // DELETE /api/events/:id/attend: Cancellazione iscrizione

module.exports = router;