function initMessages() {
    const wall = document.getElementById('message-wall');
    const featuredContainer = document.getElementById('featured-messages');
    const form = document.getElementById('message-submit-form');
    const successEl = document.getElementById('msg-success');
    const errorEl = document.getElementById('msg-error');
    const submitBtn = document.getElementById('msg-submit-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    let allMessages = [];
    let displayedCount = 0;
    const MESSAGES_PER_PAGE = 9;
    let currentFilter = 'all';
    
    // Load messages
    async function loadMessages() {
        if (window.SupabaseAPI && typeof window.SupabaseAPI.fetchApprovedMessages === 'function') {
            allMessages = await window.SupabaseAPI.fetchApprovedMessages();
        } else {
            allMessages = window.SupabaseAPI?.DEMO_MESSAGES || [];
        }
        renderFeatured();
        renderWall();
    }
    
    function renderFeatured() {
        if (!featuredContainer) return;
        const featured = allMessages.filter(m => m.featured);
        if (featured.length === 0) { featuredContainer.innerHTML = ''; return; }
        
        featuredContainer.innerHTML = featured.map(m => `
            <div class="glass" style="padding:2.5rem;text-align:center;margin-bottom:3rem;">
                <p style="font-size:clamp(1.2rem,2.5vw,1.6rem);font-style:italic;color:var(--cream-dim);line-height:1.8;">${escapeHtml(m.message)}</p>
                <p style="margin-top:1.5rem;font-size:0.85rem;color:var(--cream-muted);">— ${escapeHtml(m.name)}${m.relationship ? ', ' + escapeHtml(m.relationship) : ''}</p>
                ${m.optional_title ? `<p style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-top:0.25rem;">${escapeHtml(m.optional_title)}</p>` : ''}
            </div>
        `).join('');
    }
    
    function renderWall() {
        if (!wall) return;
        let filtered = currentFilter === 'all' ? allMessages.filter(m => !m.featured) : allMessages.filter(m => {
            const rel = (m.relationship || '').toLowerCase();
            return rel.includes(currentFilter.toLowerCase());
        });
        
        displayedCount = Math.min(MESSAGES_PER_PAGE, filtered.length);
        const toShow = filtered.slice(0, displayedCount);
        
        wall.innerHTML = toShow.map(m => `
            <div class="message-card glass">
                <p class="message-card__text">"${escapeHtml(m.message)}"</p>
                <p class="message-card__author">— ${escapeHtml(m.name)}</p>
                ${m.relationship ? `<span class="message-card__tag">${escapeHtml(m.relationship)}</span>` : ''}
            </div>
        `).join('');
        
        if (loadMoreBtn) {
            loadMoreBtn.classList.toggle('hidden', displayedCount >= filtered.length);
        }

        // Animate cards in if GSAP available
        if (window.gsap) {
            gsap.fromTo(wall.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 });
        }
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => { b.classList.remove('filter-btn--active'); b.classList.remove('btn--secondary'); b.classList.add('btn--ghost'); });
            btn.classList.add('filter-btn--active');
            btn.classList.add('btn--secondary');
            btn.classList.remove('btn--ghost');
            currentFilter = btn.dataset.filter;
            renderWall();
        });
    });
    
    // Load more
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayedCount += MESSAGES_PER_PAGE;
            renderWall();
        });
    }
    
    // Submit form
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!submitBtn) return;
            
            const name = document.getElementById('msg-name')?.value.trim();
            const relationship = document.getElementById('msg-relationship')?.value;
            const message = document.getElementById('msg-message')?.value.trim();
            const title = document.getElementById('msg-title')?.value.trim();
            const photoInput = document.getElementById('msg-photo');
            
            if (!name || !relationship || !message) return;
            
            submitBtn.textContent = 'SENDING...';
            submitBtn.disabled = true;
            
            try {
                let photoUrl = null;
                if (photoInput?.files?.length > 0) {
                    const uploadResult = await window.SupabaseAPI.uploadMessagePhoto(photoInput.files[0]);
                    if (uploadResult.success) photoUrl = uploadResult.url;
                }
                
                const result = await window.SupabaseAPI.submitMessage({
                    name, relationship, message,
                    optional_title: title || null,
                    photo_url: photoUrl
                });
                
                if (result.success) {
                    form.classList.add('hidden');
                    successEl?.classList.remove('hidden');
                    errorEl?.classList.add('hidden');
                } else {
                    throw new Error(result.error);
                }
            } catch (err) {
                console.error('[Messages] Submit error:', err);
                errorEl?.classList.remove('hidden');
            } finally {
                submitBtn.textContent = 'ADD YOUR CHAPTER';
                submitBtn.disabled = false;
            }
        });
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Initialize
    loadMessages();
}
