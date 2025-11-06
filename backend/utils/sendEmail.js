/**
 * @file Utilità per l'Invio di Email.
 * @description Utilizza Nodemailer per inviare email (es. reset password, notifiche) configurandosi tramite variabili d'ambiente SMTP.
 */

const nodemailer = require('nodemailer');

/**
 * Funzione per inviare un'email utilizzando le configurazioni del file .env.
 * @param {object} options - Opzioni dell'email
 * @param {string} options.to - Indirizzo email del destinatario
 * @param {string} options.subject - Oggetto dell'email
 * @param {string} options.text - Corpo dell'email in formato testo (alternativa al HTML)
 * @param {string} [options.html] - Corpo dell'email in formato HTML (Opzionale)
 */
const sendEmail = async (options) => {
    // 1. Crea l'oggetto transporter (il "corriere" che invia l'email)
    const transporter = nodemailer.createTransport({
        // Configurazione Host e Porta
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // Usa true per la porta 465 (SSL), false per la porta 587 (TLS/STARTTLS)
        secure: process.env.SMTP_PORT == 465, // Imposta dinamicamente in base alla porta
        auth: {
            user: process.env.SMTP_USER, // Credenziali SMTP
            pass: process.env.SMTP_PASSWORD 
        }
    });

    // 2. Definisci le informazioni dell'email
    const message = {
        from: process.env.EMAIL_FROM || 'EventHub Supporto <supporto@eventhub.com>', 
        to: options.to,
        subject: options.subject,
        text: options.text,
        // Includi l'HTML solo se fornito
        html: options.html ? options.html : null
    };

    // 3. Invia l'email
    const info = await transporter.sendMail(message);

    console.log('Messaggio email inviato: %s', info.messageId);
};

module.exports = sendEmail;