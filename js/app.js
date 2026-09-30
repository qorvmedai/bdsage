/**
 * Main Application Script
 * Sagacious Tehilla — Level 23 Birthday Experience
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lenis Smooth Scroll
    if (window.Lenis) {
        window.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2
        });

        if (window.ScrollTrigger && window.gsap) {
            window.lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => window.lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (time) => {
                window.lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
    }

    // 2. Initialize Audio immediately
    if (typeof initAudio === 'function') {
        initAudio();
    }

    // 3. Loading sequence
    const loaderFill = document.getElementById('loader-fill');
    const loader = document.getElementById('loader');

    if (window.gsap && loaderFill && loader) {
        gsap.to(loaderFill, {
            width: '100%',
            duration: 1.8,
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        loader.style.display = 'none';
                        startOpeningSequence();
                    }
                });
            }
        });
    } else {
        if (loader) loader.style.display = 'none';
        startOpeningSequence();
    }

    // 4. Setup global interactive components
    initCustomCursor();
    initScrollProgress();
    initMobileMenu();
    initSmoothScrollLinks();
});

function startOpeningSequence() {
    const opening = document.getElementById('opening');
    const opDate = document.getElementById('op-date');
    const opSubtitle = document.getElementById('op-subtitle');
    const opNumber = document.getElementById('op-number');
    const opName = document.getElementById('op-name');
    const opLevel = document.getElementById('op-level');
    const openingGlow = document.getElementById('opening-glow');
    const enterBtn = document.getElementById('enter-btn');
    const opHint = document.getElementById('op-hint');

    document.body.classList.add('no-scroll');

    if (window.gsap) {
        const tl = gsap.timeline();
        if (opDate) tl.fromTo(opDate, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2);
        if (opSubtitle) tl.fromTo(opSubtitle, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6);
        if (opNumber) tl.fromTo(opNumber, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.4)' }, 1.0);
        if (opName) tl.fromTo(opName, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.0 }, 1.6);
        if (opLevel) tl.fromTo(opLevel, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.2);
        if (openingGlow) tl.fromTo(openingGlow, { opacity: 0 }, { opacity: 0.6, duration: 1.5 }, 1.2);
        if (enterBtn) tl.fromTo(enterBtn, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 2.5);
        if (opHint) tl.fromTo(opHint, { opacity: 0 }, { opacity: 0.7, duration: 0.8 }, 2.8);
    }

    if (enterBtn) {
        enterBtn.addEventListener('click', handleEnterExperience);
    }
}

function handleEnterExperience() {
    const opening = document.getElementById('opening');
    const nav = document.getElementById('main-nav');
    const chapterProgress = document.getElementById('chapter-progress');

    if (window.gsap && opening) {
        gsap.to(opening, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                opening.style.display = 'none';
            }
        });
    } else if (opening) {
        opening.style.display = 'none';
    }

    document.body.classList.remove('no-scroll');

    if (nav) nav.classList.remove('nav--hidden');
    if (chapterProgress) chapterProgress.classList.remove('hidden');

    // Confetti celebration
    if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }

    // Start Birthday audio playback
    if (typeof window.startBirthdayAudio === 'function') {
        window.startBirthdayAudio();
    }

    // Initialize module scripts
    if (typeof initAnimations === 'function') initAnimations();
    if (typeof initStory === 'function') initStory();
    if (typeof initGallery === 'function') initGallery();
    if (typeof initQuiz === 'function') initQuiz();
    if (typeof initMessages === 'function') initMessages();
    if (typeof initGifts === 'function') initGifts();
}

/* Custom Cursor Logic */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const cursorLabel = document.getElementById('cursor-label');
    if (!cursor || window.innerWidth < 1024) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state handlers
    document.querySelectorAll('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const labelText = el.getAttribute('data-cursor');
            if (cursorLabel && labelText) cursorLabel.textContent = labelText;
            cursor.classList.add('cursor--active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor--active');
            if (cursorLabel) cursorLabel.textContent = '';
        });
    });
}

/* Scroll Progress Line */
function initScrollProgress() {
    const fill = document.getElementById('scroll-progress-fill');
    if (!fill) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        fill.style.width = `${progress}%`;
    }, { passive: true });
}

/* Mobile Navigation Menu */
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('mobile-menu-close');
    const menuLinks = document.querySelectorAll('.mobile-menu__link');

    if (!navToggle || !mobileMenu) return;

    function openMenu() {
        mobileMenu.classList.add('mobile-menu--active');
        mobileMenu.setAttribute('aria-hidden', 'false');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
    }

    function closeMenu() {
        mobileMenu.classList.remove('mobile-menu--active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }

    navToggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
}

/* Smooth Navigation Scroll Links & CTA Buttons */
function initSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"], button[data-scroll-to]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const targetId = trigger.getAttribute('href') || trigger.getAttribute('data-scroll-to');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (window.lenis) {
                        window.lenis.scrollTo(targetEl, { offset: -60 });
                    } else {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // Replay button
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            if (window.lenis) window.lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Start story button
    const startStoryBtn = document.getElementById('start-story-btn');
    if (startStoryBtn) {
        startStoryBtn.addEventListener('click', () => {
            const ch1 = document.getElementById('ch-1');
            if (ch1) {
                if (window.lenis) window.lenis.scrollTo(ch1, { offset: -60 });
                else ch1.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}
