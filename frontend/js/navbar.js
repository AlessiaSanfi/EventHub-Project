// frontend/js/navbar.js

const navbarHTML = `
    <nav class="main-nav">
        <div class="nav-brand">
            <a href="/index.html">EventHub</a>
        </div>
        <ul class="nav-links">
            <li><a href="/pages/dashboard.html">Dashboard</a></li>
            <li><a href="/pages/events.html">Eventi</a></li>
            <li><a href="/pages/create-event.html">Crea Evento</a></li>
            <li><a href="/pages/profile.html">Profilo</a></li>
            <li id="admin-link" style="display: none;"><a href="/pages/admin.html">Admin</a></li>
            <li class="login-item"><a href="/pages/login.html" id="login-button">Accedi</a></li>
            <li class="register-item"><a href="#" id="logout-button">Registrati</a></li>
        </ul>
        <div class="nav-toggle" id="nav-toggle">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>
`;

export function getNavbarHTML() {
    return navbarHTML;
}

export function setupNavbar() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            navToggle.classList.toggle('toggle');
        });
    }

    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/pages/login.html';
        });
    }

    // Show admin link if user is admin (example logic, replace with actual role check)
    const userRole = localStorage.getItem('userRole'); // Assuming role is stored in localStorage
    const adminLink = document.getElementById('admin-link');
    if (userRole === 'admin' && adminLink) {
        adminLink.style.display = 'block';
    }
}