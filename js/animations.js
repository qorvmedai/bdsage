/**
 * GSAP + ScrollTrigger Animations Engine
 * Sagacious Tehilla — Level 23 Birthday Experience
 */

function initAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Refresh ScrollTrigger to update positions with Lenis
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);

    // 1. Text reveals
    const textReveals = document.querySelectorAll('.text-section-title, .chapter__title, .story-intro__line');
    textReveals.forEach(el => {
        gsap.fromTo(el, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
            }
        );
    });

    // 2. Chapter headers
    const chapterHeaders = document.querySelectorAll('.chapter__header');
    chapterHeaders.forEach(header => {
        const children = header.querySelectorAll('.chapter__year, .chapter__title, .chapter__subtitle');
        if (children.length > 0) {
            gsap.fromTo(children, 
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: header, start: 'top 90%' }
                }
            );
        }
    });

    // 3. Chapter numbers background text
    const chapterNumbers = document.querySelectorAll('.chapter__number');
    chapterNumbers.forEach(num => {
        gsap.fromTo(num,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 0.08,
                scale: 1,
                duration: 1.2,
                scrollTrigger: { trigger: num, start: 'top 90%' }
            }
        );
    });

    // 4. Image reveals (Safe fail-proof opacity + scale)
    const chapterImages = document.querySelectorAll('.chapter__image img, .hero__portrait img');
    chapterImages.forEach(img => {
        gsap.fromTo(img,
            { scale: 1.08, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: { trigger: img, start: 'top 90%' }
            }
        );
    });

    // 5. Cinematic text reveals
    const cinematicTexts = document.querySelectorAll('.cinematic__text, .cinematic__big');
    cinematicTexts.forEach(text => {
        gsap.fromTo(text,
            { opacity: 0, y: 25 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: { trigger: text, start: 'top 90%' }
            }
        );
    });

    // 6. Quote moments
    const quoteMoments = document.querySelectorAll('.quote-moment__text, .chapter__quote');
    quoteMoments.forEach(quote => {
        gsap.fromTo(quote,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: { trigger: quote, start: 'top 90%' }
            }
        );
    });

    // 7. Grids stagger (personality, books, gifts, gallery items)
    const grids = document.querySelectorAll('.personality-grid, .books__grid, .gifts__grid');
    grids.forEach(grid => {
        const children = grid.children;
        if (children.length > 0) {
            gsap.fromTo(children,
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: grid, start: 'top 90%' }
                }
            );
        }
    });

    // 8. Animated counters
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const targetValue = parseInt(counter.getAttribute('data-count'), 10);
        if (!isNaN(targetValue)) {
            let obj = { val: 0 };
            gsap.to(obj, {
                val: targetValue,
                duration: 2,
                scrollTrigger: { trigger: counter, start: 'top 90%' },
                onUpdate: () => {
                    counter.innerHTML = Math.floor(obj.val).toLocaleString() + '+';
                }
            });
        }
    });

    // 9. Finale sequence
    const finale = document.getElementById('finale');
    if (finale) {
        ScrollTrigger.create({
            trigger: finale,
            start: 'top 70%',
            onEnter: () => {
                const lines = finale.querySelectorAll('.finale__line');
                const num = finale.querySelector('.finale__number');
                const greeting = finale.querySelector('.finale__greeting');
                const messages = finale.querySelectorAll('.finale__message p');
                const closer = document.getElementById('finale-closer');

                const tl = gsap.timeline();
                if (lines.length) tl.fromTo(lines, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.8 });
                if (num) {
                    tl.fromTo(num, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, onComplete: () => {
                        if (typeof window.triggerConfetti === 'function') window.triggerConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    }}, "-=0.3");
                }
                if (greeting) tl.fromTo(greeting, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");
                if (messages.length) tl.fromTo(messages, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 }, "-=0.3");
                if (closer) tl.fromTo(closer, { opacity: 0 }, { opacity: 1, duration: 0.8 });
            }
        });
    }

    // Safety fallback: Ensure no element remains invisible after 2.5s
    setTimeout(() => {
        document.querySelectorAll('.chapter__content, .chapter__image img, .book-card, .gift-card, .personality-item, .quote-moment__text').forEach(el => {
            const computedOpacity = window.getComputedStyle(el).opacity;
            if (computedOpacity === '0') {
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
    }, 2500);
}
