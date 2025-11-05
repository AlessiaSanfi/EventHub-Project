// backend/socket/socketManager.js

// Mappa per tenere traccia degli utenti connessi per ID Utente
const connectedUsers = new Map(); 

const initSocketIO = (io) => {

    io.on('connection', (socket) => {
        console.log(`Un utente si è connesso via Socket.ID: ${socket.id}`);

        // ---------------------------------------------------------------
        // 1. GESTIONE CHAT EVENTO (Requisito C)
        // ---------------------------------------------------------------
        socket.on('joinEventChat', (eventId) => {
            socket.join(eventId); // Aggiunge il socket alla "stanza" dell'evento
            console.log(`Utente ${socket.id} si è unito alla chat dell'evento ${eventId}`);
        });

        socket.on('sendMessage', ({ eventId, userId, username, message }) => {
            // Invia il messaggio a tutti i membri della stanza (chat) tranne chi lo invia
            socket.to(eventId).emit('receiveMessage', { 
                eventId,
                userId,
                username,
                message,
                timestamp: new Date().toISOString()
            });
        });


        // ---------------------------------------------------------------
        // 2. GESTIONE NOTIFICHE (Requisito C - Notifiche Live)
        // ---------------------------------------------------------------
        // Quando un utente si autentica (o si connette), registra il suo ID Utente
        socket.on('registerUser', (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log(`Utente ID: ${userId} registrato con Socket ID: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            // Rimuove l'utente disconnesso dalla mappa
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

// Esporta la funzione per inviare notifiche esterne (es. da eventController)
const sendNotificationToUser = (userId, notification) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit('newNotification', notification);
        return true;
    }
    return false;
};

// Esporta l'istanza di IO (Socket.IO server) per l'uso esterno
let ioInstance;
const setIoInstance = (io) => {
    ioInstance = io;
    initSocketIO(io);
};

// Funzione helper per inviare notifiche a tutti gli admin (non implementato il fetching degli admin, ma l'impostazione è corretta)
const sendNotificationToAdmins = (notification) => {
    // Implementazione futura: trovare i socket IDs di tutti gli admin
    // e inviare: ioInstance.to(adminSocketId).emit('adminAlert', notification);
};


module.exports = { 
    setIoInstance, 
    sendNotificationToUser,
    sendNotificationToAdmins,
    // Nota: L'istanza ioInstance non è esportata direttamente per pulizia
};