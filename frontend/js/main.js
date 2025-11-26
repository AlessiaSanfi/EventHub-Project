document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navbarMenu = document.getElementById('navbarMenu');

    if (hamburger && navbarMenu) {
        hamburger.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });

        // Chiudi menu quando clicchi su un link
        navbarMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navbarMenu.classList.remove('active');
            });
        });

        // Chiudi menu quando clicchi fuori
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navbarMenu.contains(event.target)) {
                navbarMenu.classList.remove('active');
            }
        });
    }

    // Smooth scroll per i link di navigazione
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Hero Background Image Slider
    const heroBackground = document.querySelector('.hero-motivec .hero-background');
    const leftArrow = document.querySelector('.hero-navigation .left-arrow');
    const rightArrow = document.querySelector('.hero-navigation .right-arrow');

    const heroImages = [
        { src: 'assets/images/evento 1.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 2.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 3.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 4.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 5.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 6.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 7.png', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 8.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 9.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 10.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 11.jpeg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 12.jpg', size: 'cover', position: 'center' },
        { src: 'assets/images/evento 13.jpg', size: 'cover', position: 'center' },        // Aggiungi qui altri percorsi di immagini se ne hai
    ];
    let currentImageIndex = 0;

    function updateHeroBackground() {
        const currentImage = heroImages[currentImageIndex];
        heroBackground.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${currentImage.src}')`;
        heroBackground.style.backgroundSize = currentImage.size;
        heroBackground.style.backgroundPosition = currentImage.position;
    }

    if (leftArrow && rightArrow && heroBackground) {
        leftArrow.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : heroImages.length - 1;
            updateHeroBackground();
        });

        rightArrow.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex < heroImages.length - 1) ? currentImageIndex + 1 : 0;
            updateHeroBackground();
        });

        // Imposta l'immagine iniziale all'avvio
        updateHeroBackground();
    }

    console.log('✅ EventHub Frontend Caricato');
});