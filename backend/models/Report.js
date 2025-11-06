/**
 * @file Schema Mongoose per il Modello Segnalazione (Report).
 * @description Definisce la struttura dati di una segnalazione relativa a un evento, tracciando chi l'ha inviata, il motivo e lo stato di risoluzione.
 */

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    // Riferimento all'evento che è stato segnalato.
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event', // Fa riferimento al Modello 'Event'
        required: true
    },
    // Riferimento all'utente che ha inviato la segnalazione.
    reportedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Fa riferimento al Modello 'User'
        required: true
    },
    // Motivo della segnalazione (campo a scelta limitata).
    reason: {
        type: String,
        required: [true, 'Il motivo della segnalazione è obbligatorio.'],
        enum: ['Contenuto offensivo', 'Spam', 'Data errata', 'Altro', 'Informazioni false', 'Violazione Termini'],
    },
    // Stato di risoluzione della segnalazione (inizialmente false).
    isResolved: {
        type: Boolean,
        default: false
    },
    // Riferimento all'amministratore che ha risolto la segnalazione (opzionale).
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    // Data e ora della creazione della segnalazione.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', ReportSchema);