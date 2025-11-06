/**
 * @file Rotte per la Gestione degli Eventi.
 * @description Definisce gli endpoint per la lettura (pubblica), creazione, modifica, cancellazione, iscrizione e segnalazione degli eventi, applicando il middleware di protezione dove necessario.
 */

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

// -------------------------------------------------------------------
// Rotte BASE: /api/events
// -------------------------------------------------------------------

router.route('/')
  // GET /api/events: Ottiene tutti gli eventi pubblici (Accesso Pubblico)
  .get(getEvents) 
  // POST /api/events: Crea un nuovo evento (Richiede Autenticazione)
  .post(protect, createEvent); 


// -------------------------------------------------------------------
// Rotte Dettaglio e Azioni: /api/events/:id
// -------------------------------------------------------------------

router.route('/:id')
  // GET /api/events/:id: Ottiene i dettagli di un singolo evento (Accesso Pubblico)
  .get(getEvent) 
  // PUT /api/events/:id: Aggiorna un evento (Richiede Autenticazione)
  .put(protect, updateEvent) 
  // DELETE /api/events/:id: Cancella un evento (Richiede Autenticazione)
  .delete(protect, deleteEvent); 


// -------------------------------------------------------------------
// Rotte Azioni Secondarie (Richiedono Autenticazione)
// -------------------------------------------------------------------

// Iscrizione / Cancellazione Iscrizione
router.route('/:id/attend')
  // POST /api/events/:id/attend: Iscrizione all'evento
  .post(protect, attendEvent) 
  // DELETE /api/events/:id/attend: Cancellazione iscrizione
  .delete(protect, unattendEvent); 

// Segnalazione Evento
router.route('/:id/report')
  // POST /api/events/:id/report: Segnala l'evento
  .post(protect, reportEvent); 

module.exports = router;