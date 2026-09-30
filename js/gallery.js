function initGallery() {
    const strip = document.getElementById('gallery-strip');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const counterEl = document.getElementById('lightbox-counter');
    
    if (!strip) return;
    
    const items = strip.querySelectorAll('.gallery__item');
    let currentIndex = 0;
    let images = [];
    
    // Collect all images
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            images.push({ src: img.src, alt: img.alt, index });
            item.addEventListener('click', () => {
                currentIndex = index;
                openLightbox();
            });
        }
    });
    
    function openLightbox() {
        if (!lightbox || !images[currentIndex]) return;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt;
        lightbox.classList.add('lightbox--active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        updateCounter();
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('lightbox--active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }
    
    function navigate(direction) {
        currentIndex = (currentIndex + direction + images.length) % images.length;
        if (images[currentIndex] && lightboxImg) {
            // Animate transition
            if (window.gsap) {
                gsap.to(lightboxImg, { opacity: 0, x: direction * -30, duration: 0.2, onComplete: () => {
                    lightboxImg.src = images[currentIndex].src;
                    lightboxImg.alt = images[currentIndex].alt;
                    gsap.fromTo(lightboxImg, { opacity: 0, x: direction * 30 }, { opacity: 1, x: 0, duration: 0.3 });
                }});
            } else {
                lightboxImg.src = images[currentIndex].src;
                lightboxImg.alt = images[currentIndex].alt;
            }
            updateCounter();
        }
    }
    
    function updateCounter() {
        if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
    }
    
    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('lightbox--active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });
    
    // Click outside
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    // Touch swipe
    let touchStartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
        }, { passive: true });
    }
}
