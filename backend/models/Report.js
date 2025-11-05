// backend/models/Report.js

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Il motivo della segnalazione è obbligatorio.'],
        enum: ['Contenuto offensivo', 'Spam', 'Data errata', 'Altro'],
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', ReportSchema);