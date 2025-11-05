const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true,
    maxlength: [100, 'Il titolo non può superare i 100 caratteri']
  },
  description: {
    type: String,
    required: [true, 'La descrizione è obbligatoria'],
    maxlength: [1000, 'La descrizione non può superare i 1000 caratteri']
  },
  date: {
    type: Date,
    required: [true, 'La data dell\'evento è obbligatoria'],
    min: [Date.now(), 'La data non può essere nel passato'] 
  },
  location: {
    type: String,
    required: [true, 'Il luogo è obbligatorio']
  },
  category: {
    type: String,
    enum: ['Musica', 'Sport', 'Conferenza', 'Altro'], 
    default: 'Altro'
  },
  capacity: {
    type: Number,
    required: [true, 'La capienza è obbligatoria'],
    min: [1, 'La capienza deve essere almeno 1']
  },
  // Riferimento all'utente che ha creato l'evento
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', 
    required: true
  },
  // Lista degli ID degli utenti iscritti
  attendees: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  image: String, // URL o percorso dell'immagine
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);