/**
 * Formatta una data nel formato Italian
 */
function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('it-IT', options);
}

/**
 * Formatta una data breve (GG/MM/AAAA)
 */
function formatDateShort(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formatta l'ora (HH:MM)
 */
function formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Mostra un toast/notifica
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration);
}

/**
 * Valida un email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida una password
 */
function isValidPassword(password) {
    return password.length >= 8;
}

/**
 * Accorcia un testo
 */
function truncateText(text, length = 50) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Decodifica HTML entities
 */
function decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.documentElement.textContent;
}

/**
 * Copia testo negli appunti
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copiato negli appunti!', 'success');
    } catch (err) {
        showNotification('Errore nella copia', 'error');
    }
}

/**
 * Controlla se l'utente è autenticato
 */
function checkAuth() {
    if (!auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
    }
}

/**
 * Genera un ID univoco
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}