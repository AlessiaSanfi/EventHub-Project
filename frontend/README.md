# EventHub Frontend

Frontend moderno e responsivo per la gestione di eventi.

## 📁 Struttura del Progetto

```
frontend/
├── index.html                 # Landing page
├── css/
│   ├── variables.css         # Variabili CSS (colori, spacing, font)
│   ├── style.css             # Stili principali
│   └── responsive.css        # Media queries
├── js/
│   ├── main.js               # Script principale
│   ├── api.js                # Client API
│   ├── auth.js               # Gestione autenticazione
│   ├── events.js             # Gestione eventi
│   ├── user.js               # Gestione profilo utente
│   └── utils.js              # Funzioni utility
├── pages/
│   ├── login.html            # Pagina login
│   ├── register.html         # Pagina registrazione
│   ├── dashboard.html        # Dashboard principale
│   ├── events.html           # Lista eventi
│   ├── event-detail.html     # Dettagli evento
│   ├── create-event.html     # Creazione evento
│   ├── profile.html          # Profilo utente
│   └── admin.html            # Panel admin
├── assets/
│   ├── icons/                # Icone SVG
│   └── images/               # Immagini
└── README.md                 # Questo file
```

## 🎨 Tema e Colori

- **Primario**: Indigo (#6366f1)
- **Secondario**: Pink (#ec4899)
- **Sfondo**: Light Gray (#f9fafb)
- **Testo**: Dark Gray (#111827)

## 🚀 Come Iniziare

1. Assicurati che il backend sia in esecuzione su `http://localhost:8080`
2. Apri `index.html` nel tuo browser
3. Registrati o accedi con credenziali valide

## 📱 Responsive Design

- **Desktop**: Layout completo a 2-3 colonne
- **Tablet**: Layout a 2 colonne
- **Mobile**: Layout a 1 colonna

## 🔐 Autenticazione

L'app utilizza JWT tokens salvati in `localStorage`. I token vengono inviati in ogni richiesta tramite l'header `Authorization: Bearer TOKEN`.

## 🛠️ Tecnologie

- HTML5
- CSS3 (con custom properties)
- JavaScript (ES6+)
- Fetch API
- LocalStorage

## 📝 Note Sviluppo

- Non usa framework (vanilla JavaScript)
- Design pulito e moderno
- Tema coerente con la piattaforma di gestione eventi
- Fully responsive