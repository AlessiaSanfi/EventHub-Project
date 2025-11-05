# EventHub: Piattaforma di Gestione Eventi e Networking in Tempo Reale

EventHub è un'applicazione web completa sviluppata in ambiente **Node.js (Express)** e **MongoDB** (Backend) che funge da piattaforma centralizzata per la creazione, la gestione, la partecipazione e il networking in tempo reale di eventi.

Questo progetto è stato sviluppato per dimostrare competenze nell'architettura RESTful API, nella sicurezza (JWT), nella persistenza dei dati (Mongoose) e nella comunicazione in tempo reale (Socket.IO).

## Obiettivi del Progetto

L'obiettivo principale di EventHub è fornire un'esperienza utente completa attraverso l'implementazione dei seguenti moduli:

1.  **Gestione Utenti e Sicurezza (Requisito A):** Autenticazione protetta con ruoli distinti (`utente`, `amministratore`).
2.  **Gestione Eventi Avanzata (Requisito B):** CRUD completo per gli eventi, con sistemi di iscrizione/cancellazione, capienza e filtri dinamici.
3.  **Comunicazione in Tempo Reale (Requisito C):** Chat per evento e un sistema di notifica live.

---

## Architettura e Tecnologie

### Backend (API & Real-Time)

* **Linguaggio:** JavaScript (Node.js)
* **Framework:** Express.js
* **Database:** MongoDB (Tramite Mongoose ORM)
* **Sicurezza:** JSON Web Tokens (JWT) per l'autenticazione
* **Tempo Reale:** Socket.IO
* **Email:** Nodemailer (per il recupero password)

### Struttura Chiave del Backend

Il backend è organizzato secondo un modello modulare che separa le responsabilità:
* **`models/`:** Schemi di dati (User, Event, Report).
* **`controllers/`:** Logica di business per ogni dominio (auth, event, user, admin).
* **`routes/`:** Definizione degli endpoint API.
* **`middleware/auth.js`:** Logica di protezione e autorizzazione tramite ruoli.
* **`socket/socketManager.js`:** Gestione centralizzata delle connessioni e degli eventi Socket.IO.
* **`utils/`:** Funzioni helper (JWT, Nodemailer).

---

## Funzionalità Implementate (Per Valutazione)

Le seguenti funzionalità chiave sono state sviluppate per soddisfare i requisiti del progetto:

### I. Gestione Utenti e Accesso

| Funzionalità | Descrizione Tecnica | Requisito |
| :--- | :--- | :--- |
| **Autenticazione Sicura** | Utilizzo di **bcryptjs** per l'hashing delle password e **JWT** per la gestione delle sessioni. | A |
| **Recupero Password** | Implementazione del flusso completo con generazione di **Token Temporaneo** (`crypto` nativo) e invio email tramite **Nodemailer**. | A (Opzionale) |
| **Dashboard Utente** | Endpoint dedicati (`/api/users/me/*`) per visualizzare gli eventi **creati** e gli eventi **a cui si è iscritti** dall'utente corrente. | A |

### II. Gestione Eventi Avanzata

| Funzionalità | Descrizione Tecnica | Requisito |

| **CRUD & Controllo Accessi** | Creazione, Lettura, Aggiornamento e Cancellazione con verifica che solo il **Creatore** possa modificare l'evento. | B |
| **Filtri Dinamici** | Endpoint `/api/events` supporta query avanzate per **filtri** (es. `category=Musica`), **ordinamento** (`sort=-date`) e **paginazione** (`page`/`limit`). | B |
| **Iscrizione con Capienza** | Logica di iscrizione (`/attend`) che verifica e rispetta il limite massimo di partecipanti (`capacity`). | B |

### III. Tempo Reale e Moderazione

| Funzionalità | Descrizione Tecnica | Requisito |

| **Notifiche Live (Utente)** | Utilizzo di **Socket.IO** per inviare notifiche istantanee al **Creatore** dell'evento quando un utente si iscrive o annulla l'iscrizione. | C |
| **Segnalazioni Eventi** | Endpoint `/report` che crea un record nel DB (`Report.js`) e utilizza **Socket.IO** per inviare un **Avviso Live** a tutti gli amministratori connessi. | C |
| **Chat per Evento** | Implementazione di stanze (`socket.join(eventId)`) per isolare la comunicazione tra i partecipanti di un singolo evento. | C |
| **Dashboard Amministratore** | Rotte protette da ruolo (`/api/admin/*`) per ottenere tutti gli utenti e per la **cancellazione forzata** degli eventi (moderazione). | A |

---

## Istruzioni per l'Avvio

1.  **Clonare il Repository:** `git clone https://aws.amazon.com/it/what-is/repo/`
2.  **Installare Backend:** `cd backend && npm install`
3.  **Configurare Variabili d'Ambiente:** Creare un file `.env` nella directory `backend` e configurare le variabili (es. `MONGODB_URI`, `JWT_SECRET`, `SMTP_USER`, ecc.).
4.  **Avviare il Server:** `npm run dev` (utilizzando nodemon)
    * Il server API sarà disponibile su `http://localhost:3000/api`.
    * Il server Socket.IO sarà attivo sulla stessa porta.