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
            <li class="logout-item"><a href="#" id="logout-button">Logout</a></li>
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

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
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