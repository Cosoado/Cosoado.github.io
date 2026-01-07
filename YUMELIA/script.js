document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initScrollAnimations();
    initHeaderScroll();
});

// Starfield Animation
function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    
    let w, h;
    let stars = [];
    const starCount = 200;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function Star() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random();
        this.opacitySpeed = (Math.random() - 0.5) * 0.02;
    }

    Star.prototype.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Twinkle effect
        this.opacity += this.opacitySpeed;
        if (this.opacity > 1 || this.opacity < 0.2) {
            this.opacitySpeed = -this.opacitySpeed;
        }

        // Wrap around screen
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
    };

    Star.prototype.draw = function() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    };

    function init() {
        resize();
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
        window.addEventListener('resize', resize);
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
}

// Scroll Animations (Intersection Observer)
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));
}

// Header Background on Scroll
function initHeaderScroll() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}
