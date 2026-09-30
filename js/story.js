function initStory() {
    // Chapter progress indicator
    const progressDots = document.querySelectorAll('.chapter-progress__dot');
    const chapters = document.querySelectorAll('.chapter[data-chapter]');
    
    if (!chapters.length) return;

    // Click chapter dot to scroll
    progressDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const chNum = dot.getAttribute('data-chapter');
            const target = document.querySelector(`[data-chapter="${chNum}"]`);
            if (target) {
                if (window.lenis) window.lenis.scrollTo(target, { offset: -100 });
                else target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Update active dot on scroll
    chapters.forEach(chapter => {
        ScrollTrigger.create({
            trigger: chapter,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => updateProgress(chapter.dataset.chapter),
            onEnterBack: () => updateProgress(chapter.dataset.chapter),
        });
    });

    function updateProgress(num) {
        progressDots.forEach(dot => {
            dot.classList.toggle('active', dot.dataset.chapter === num);
        });
    }

    // Tooltip on hover for chapter dots
    progressDots.forEach(dot => {
        dot.addEventListener('mouseenter', () => {
            dot.setAttribute('title', dot.dataset.label || '');
        });
    });
}
