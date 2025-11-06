/**
 * @file Schema Mongoose per il Modello Evento.
 * @description Definisce la struttura dati di un evento, incluse le validazioni, i riferimenti agli utenti (creatore e iscritti) e la gestione della data.
 */

const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  // Titolo dell'evento. Obbligatorio e limitato.
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true,
    maxlength: [100, 'Il titolo non può superare i 100 caratteri']
  },
  // Descrizione dettagliata dell'evento. Obbligatoria e limitata.
  description: {
    type: String,
    required: [true, 'La descrizione è obbligatoria'],
    maxlength: [1000, 'La descrizione non può superare i 1000 caratteri']
  },
  // Data e ora in cui l'evento avrà luogo. Non deve essere nel passato.
  date: {
    type: Date,
    required: [true, 'La data dell\'evento è obbligatoria'],
    // Funzione per la validazione dinamica
    validate: {
      validator: function(v) {
        // Verifica che la data sia successiva o uguale al momento attuale (con un piccolo margine)
        return v >= Date.now(); 
      },
      message: 'La data e l\'ora dell\'evento non possono essere nel passato.'
    }
  },
  // Luogo fisico o virtuale dell'evento.
  location: {
    type: String,
    required: [true, 'Il luogo è obbligatorio']
  },
  // Categoria dell'evento (a scelta limitata).
  category: {
    type: String,
    enum: ['Musica', 'Sport', 'Conferenza', 'Altro', 'Cultura', 'Tecnologia'], // Opzioni ampliate
    default: 'Altro'
  },
  // Numero massimo di partecipanti.
  capacity: {
    type: Number,
    required: [true, 'La capienza è obbligatoria'],
    min: [1, 'La capienza deve essere almeno 1']
  },
  // Riferimento all'utente che ha creato l'evento
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Fa riferimento al Modello 'User'
    required: true
  },
  // Array di riferimenti agli ID degli utenti iscritti.
  attendees: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  // Campo opzionale per l'URL o il percorso dell'immagine di copertina.
  image: String, 
  // Data di creazione del record nel database.
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);