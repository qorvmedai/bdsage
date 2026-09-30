function initGifts() {
    const cashBtn = document.getElementById('gift-cash-btn');
    const physicalBtn = document.getElementById('gift-physical-btn');
    const cashModal = document.getElementById('gift-cash-modal');
    const physicalModal = document.getElementById('gift-physical-modal');
    const copyBtn = document.getElementById('copy-account-btn');
    const giftForm = document.getElementById('gift-form');
    const giftSubmitBtn = document.getElementById('gift-submit-btn');
    const giftSuccess = document.getElementById('gift-success');
    const giftError = document.getElementById('gift-error');
    
    // Also allow clicking the card itself
    const cashCard = document.getElementById('gift-cash-card');
    const physicalCard = document.getElementById('gift-physical-card');
    
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('modal--open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }
    
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }
    
    // Open modals
    if (cashBtn) cashBtn.addEventListener('click', (e) => { e.stopPropagation(); openModal(cashModal); });
    if (physicalBtn) physicalBtn.addEventListener('click', (e) => { e.stopPropagation(); openModal(physicalModal); });
    // Card-level click too
    if (cashCard) cashCard.addEventListener('click', () => openModal(cashModal));
    if (physicalCard) physicalCard.addEventListener('click', () => openModal(physicalModal));
    
    // Close modals
    document.querySelectorAll('.modal__close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close on backdrop click
    document.querySelectorAll('.modal__backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            const modal = backdrop.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal--open').forEach(modal => closeModal(modal));
        }
    });
    
    // Copy account number
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('9042447293').then(() => {
                copyBtn.textContent = 'COPIED ✓';
                copyBtn.style.borderColor = 'var(--gold)';
                copyBtn.style.color = 'var(--gold)';
                setTimeout(() => {
                    copyBtn.textContent = 'COPY ACCOUNT NUMBER';
                    copyBtn.style.borderColor = '';
                    copyBtn.style.color = '';
                }, 2000);
            }).catch(() => {
                // Fallback: select text
                const num = document.getElementById('account-number');
                if (num) {
                    const range = document.createRange();
                    range.selectNodeContents(num);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
            });
        });
    }
    
    // Physical gift form
    if (giftForm) {
        giftForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('gift-name')?.value.trim();
            const contact = document.getElementById('gift-contact')?.value.trim();
            const description = document.getElementById('gift-description')?.value.trim();
            const note = document.getElementById('gift-note')?.value.trim();
            
            if (!name || !contact || !description) return;
            
            if (giftSubmitBtn) { giftSubmitBtn.textContent = 'SENDING...'; giftSubmitBtn.disabled = true; }
            
            try {
                const result = await window.SupabaseAPI.submitGift({
                    name, contact, gift_type: 'physical', description, note
                });
                
                if (result.success) {
                    giftForm.classList.add('hidden');
                    giftSuccess?.classList.remove('hidden');
                    giftError?.classList.add('hidden');
                } else {
                    throw new Error(result.error);
                }
            } catch (err) {
                console.error('[Gifts] Submit error:', err);
                giftError?.classList.remove('hidden');
            } finally {
                if (giftSubmitBtn) { giftSubmitBtn.textContent = 'SUBMIT'; giftSubmitBtn.disabled = false; }
            }
        });
    }
}
