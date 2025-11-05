// backend/utils/sendEmail.js

const nodemailer = require('nodemailer');

/**
 * Funzione per inviare un'email utilizzando le configurazioni del file .env.
 * @param {object} options - Opzioni dell'email
 * @param {string} options.to - Indirizzo email del destinatario
 * @param {string} options.subject - Oggetto dell'email
 * @param {string} options.text - Corpo dell'email in formato testo (alternativa al HTML)
 * @param {string} options.html - Corpo dell'email in formato HTML
 */
const sendEmail = async (options) => {
    // 1. Crea l'oggetto transporter (il "corriere" che invia l'email)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Usa SSL/TLS (true se port 465, false se port 587 con STARTTLS)
        auth: {
            user: process.env.SMTP_USER, // La tua email istituzionale (SMTP_USER)
            pass: process.env.SMTP_PASSWORD  // La password di autenticazione
        }
    });

    // 2. Definisci le informazioni dell'email
    const message = {
        from: process.env.EMAIL_FROM, // EventHub Supporto <supporto@eventhub.com>
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    // 3. Invia l'email
    const info = await transporter.sendMail(message);

    console.log('Messaggio inviato: %s', info.messageId);
};

module.exports = sendEmail;