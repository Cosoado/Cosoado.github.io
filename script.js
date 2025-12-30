document.addEventListener('DOMContentLoaded', () => {
    
    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Only run cursor logic on desktop where elements exist
    if (cursorDot && cursorOutline && window.matchMedia("(min-width: 769px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with delay (handled by CSS transition: transform 0.15s)
            // But we need to update position.
            // Using animate for smoother trailing effect could be better, but direct update works with CSS transition.
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
            
            // Re-trigger animation frame if needed for very smooth logic, but CSS transition is efficient here.
        });

        // Hover Effect on Links
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
            });
            link.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Hero Animation on Load
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    setTimeout(() => {
        heroTitle.style.transition = "opacity 1s ease-out, transform 1s ease-out";
        heroTitle.style.opacity = "1";
        heroTitle.style.transform = "translateY(0)";
    }, 200);

    setTimeout(() => {
        heroSubtitle.style.transition = "opacity 1s ease-out, transform 1s ease-out";
        heroSubtitle.style.opacity = "1";
        heroSubtitle.style.transform = "translateY(0)";
    }, 600);


    // Scroll Observer for Fade-up Elements
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if you don't want it to fade out again
                 observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up, .card');
    fadeElements.forEach((el, index) => {
        el.classList.add('fade-up'); // Ensure class is present
        // Add stagger delay for grid items
        if (el.classList.contains('card')) {
             el.style.transitionDelay = `${index * 0.1}s`;
        }
        observer.observe(el);
    });
});
