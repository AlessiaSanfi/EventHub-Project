/**
 * @file Gestore Centrale per Socket.IO.
 * @description Inizializza il server Socket.IO e gestisce le connessioni in tempo reale per la chat degli eventi e le notifiche live tra utenti.
 */

const connectedUsers = new Map(); // Mappa per tenere traccia degli utenti connessi per ID Utente
let ioInstance; // Variabile per mantenere l'istanza di Socket.IO accessibile esternamente

const initSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log(`Un utente si è connesso via Socket.ID: ${socket.id}`);

        // ---------------------------------------------------------------
        // 1. GESTIONE CHAT EVENTO 💬
        // ---------------------------------------------------------------
        socket.on('joinEventChat', (eventId) => {
            socket.join(eventId); // Aggiunge il socket alla "stanza" dell'evento
            console.log(`Utente ${socket.id} si è unito alla chat dell'evento ${eventId}`);
        });

        socket.on('sendMessage', ({ eventId, userId, username, message }) => {
            // Invia il messaggio a tutti i membri della stanza (chat) INCLUSO chi lo invia, 
            // se il client non lo aggiunge da sé. Per escludere: usa socket.to(eventId)
            io.to(eventId).emit('receiveMessage', { 
                eventId,
                userId,
                username,
                message,
                timestamp: new Date().toISOString()
            });
        });


        // ---------------------------------------------------------------
        // 2. GESTIONE NOTIFICHE (Registrazione Utente) 🔔
        // ---------------------------------------------------------------
        socket.on('registerUser', (userId) => {
            // Registra l'ID Utente associato al Socket ID corrente
            connectedUsers.set(userId, socket.id);
            console.log(`Utente ID: ${userId} registrato con Socket ID: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log(`Utente disconnesso: ${socket.id}`);
            // Rimuove l'utente disconnesso dalla mappa in modo efficiente
            for (let [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    console.log(`Utente ID: ${userId} rimosso dalla mappa.`);
                    break;
                }
            }
        });
    });
};

// Funzione esterna: imposta l'istanza di IO e inizializza i listener
const setIoInstance = (io) => {
    ioInstance = io; // Salva l'istanza IO per l'uso esterno
    initSocketIO(io);
};

// Funzione esterna: Esporta la logica per inviare notifiche a un singolo utente
const sendNotificationToUser = (userId, notification) => {
    if (!ioInstance) return false; // Controllo di sicurezza
    
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        // Usa ioInstance per inviare
        ioInstance.to(socketId).emit('newNotification', notification); 
        return true;
    }
    return false;
};

// Funzione esterna: Esporta la logica per inviare notifiche a tutti gli admin
const sendNotificationToAdmins = (notification) => {
    if (!ioInstance) return false; 
    
    // NOTA PER DOPO:
    // Implementazione futura: 
    // 1. Trovare gli ID degli amministratori dal DB
    // 2. Iterare sugli admin e usare connectedUsers.get(adminId) per ottenere il socketId
    // 3. Inviare: ioInstance.to(adminSocketId).emit('adminAlert', notification);
    console.log("Funzione di notifica admin chiamata. Implementazione DB necessaria.");
    return true; // Finge successo per ora
};


module.exports = { 
    setIoInstance, 
    sendNotificationToUser,
    sendNotificationToAdmins,
};