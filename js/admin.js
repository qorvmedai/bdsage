// Admin Dashboard for Sagacious Tehilla Birthday Experience

const SUPABASE_URL = 'https://zsenubtfeirvrkijhuoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZW51YnRmZWlydnJraWpodW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjY1NzMsImV4cCI6MjEwNjIwMjU3M30.ykV41E_NPIAz7aKahgoSzR3BpFE624oLjzua14WtVOs';

let supabase;

document.addEventListener('DOMContentLoaded', () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    checkAuth();
    initSidebarNav();
    initAdminTabs();
});

// AUTH
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showDashboard(session.user);
    } else {
        showLogin();
    }
}

async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        showLoginError(error.message);
    } else {
        showDashboard(data.user);
    }
}

async function logout() {
    await supabase.auth.signOut();
    showLogin();
}

function showLogin() {
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function showDashboard(user) {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    // Show user email
    const userEl = document.querySelector('.admin-header__user');
    if (userEl) userEl.textContent = user.email;
    loadDashboardData();
}

function showLoginError(msg) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }
}

// Login form handler
document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    login(email, password);
});

// Logout
document.getElementById('admin-logout-btn')?.addEventListener('click', logout);

// SIDEBAR NAVIGATION
function initSidebarNav() {
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            // Update active state
            document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('admin-sidebar__link--active'));
            link.classList.add('admin-sidebar__link--active');
        });
    });
}

function showSection(sectionName) {
    ['dashboard', 'messages', 'gifts', 'settings'].forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.classList.toggle('hidden', s !== sectionName);
    });
    // Update header title
    const titles = { dashboard: 'Dashboard', messages: 'Messages', gifts: 'Gifts', settings: 'Settings' };
    const headerTitle = document.querySelector('.admin-header__title');
    if (headerTitle) headerTitle.textContent = titles[sectionName] || 'Dashboard';
    
    // Load section data
    if (sectionName === 'dashboard') loadDashboardData();
    if (sectionName === 'messages') loadMessages();
    if (sectionName === 'gifts') loadGifts();
    if (sectionName === 'settings') loadSettings();
}

// DASHBOARD DATA
async function loadDashboardData() {
    try {
        const { data: messages } = await supabase.from('messages').select('*');
        const { data: gifts } = await supabase.from('gifts').select('*');
        
        const total = messages?.length || 0;
        const pending = messages?.filter(m => m.status === 'pending').length || 0;
        const approved = messages?.filter(m => m.status === 'approved').length || 0;
        const featured = messages?.filter(m => m.featured).length || 0;
        const totalGifts = gifts?.length || 0;
        
        document.getElementById('stat-total-messages').textContent = total;
        document.getElementById('stat-pending-messages').textContent = pending;
        document.getElementById('stat-approved-messages').textContent = approved;
        document.getElementById('stat-featured-messages').textContent = featured;
        document.getElementById('stat-total-gifts').textContent = totalGifts;
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// MESSAGE MANAGEMENT
let currentMessageFilter = 'all';

function initAdminTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
            tab.classList.add('admin-tab--active');
            currentMessageFilter = tab.dataset.filter;
            loadMessages();
        });
    });
}

async function loadMessages() {
    try {
        let query = supabase.from('messages').select('*').order('created_at', { ascending: false });
        
        if (currentMessageFilter === 'pending') query = query.eq('status', 'pending');
        if (currentMessageFilter === 'approved') query = query.eq('status', 'approved');
        if (currentMessageFilter === 'rejected') query = query.eq('status', 'rejected');
        if (currentMessageFilter === 'featured') query = query.eq('featured', true);
        
        const { data, error } = await query;
        if (error) throw error;
        
        renderMessagesTable(data || []);
    } catch (err) {
        console.error('Load messages error:', err);
    }
}

function renderMessagesTable(messages) {
    const tbody = document.getElementById('messages-tbody');
    if (!tbody) return;
    
    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-light-gray);padding:2rem;">No messages found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = messages.map(m => {
        const date = new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const truncMsg = m.message.length > 60 ? m.message.substring(0, 60) + '...' : m.message;
        const statusClass = `badge--${m.status}`;
        const featuredBadge = m.featured ? ' <span class="badge badge--featured">★</span>' : '';
        
        return `<tr>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.relationship)}</td>
            <td>${escapeHtml(truncMsg)}</td>
            <td><span class="badge ${statusClass}">${m.status}</span>${featuredBadge}</td>
            <td>${date}</td>
            <td class="admin-table__actions">
                <button class="admin-table__btn admin-table__btn--view" onclick="viewMessage('${m.id}')">VIEW</button>
                ${m.status !== 'approved' ? `<button class="admin-table__btn admin-table__btn--approve" onclick="updateMessageStatus('${m.id}', 'approved')">APPROVE</button>` : ''}
                ${m.status !== 'rejected' ? `<button class="admin-table__btn admin-table__btn--reject" onclick="updateMessageStatus('${m.id}', 'rejected')">REJECT</button>` : ''}
                <button class="admin-table__btn admin-table__btn--feature" onclick="toggleFeature('${m.id}', ${!m.featured})">${m.featured ? 'UNFEATURE' : 'FEATURE'}</button>
                <button class="admin-table__btn admin-table__btn--delete" onclick="deleteMessage('${m.id}')">DELETE</button>
            </td>
        </tr>`;
    }).join('');
}

async function viewMessage(id) {
    const { data: msg } = await supabase.from('messages').select('*').eq('id', id).single();
    if (!msg) return;
    
    const modal = document.getElementById('admin-message-modal');
    if (!modal) return;
    
    modal.querySelector('.modal__body').innerHTML = `
        <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
        <p><strong>Relationship:</strong> ${escapeHtml(msg.relationship)}</p>
        ${msg.optional_title ? `<p><strong>Title:</strong> ${escapeHtml(msg.optional_title)}</p>` : ''}
        <p><strong>Status:</strong> <span class="badge badge--${msg.status}">${msg.status}</span> ${msg.featured ? '<span class="badge badge--featured">Featured</span>' : ''}</p>
        <p><strong>Date:</strong> ${new Date(msg.created_at).toLocaleString()}</p>
        <hr style="border-color:var(--color-dark-gray);margin:1rem 0;">
        <p style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(msg.message)}</p>
        ${msg.photo_url ? `<img src="${msg.photo_url}" alt="Uploaded photo" style="max-width:100%;border-radius:8px;margin-top:1rem;">` : ''}
    `;
    
    modal.classList.add('modal--active');
}

async function updateMessageStatus(id, status) {
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    if (!error) {
        loadMessages();
        loadDashboardData();
    }
}

async function toggleFeature(id, featured) {
    const { error } = await supabase.from('messages').update({ featured }).eq('id', id);
    if (!error) {
        loadMessages();
        loadDashboardData();
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
        loadMessages();
        loadDashboardData();
    }
}

// GIFT MANAGEMENT
async function loadGifts() {
    try {
        const { data, error } = await supabase.from('gifts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        renderGiftsTable(data || []);
    } catch (err) {
        console.error('Load gifts error:', err);
    }
}

function renderGiftsTable(gifts) {
    const tbody = document.getElementById('gifts-tbody');
    if (!tbody) return;
    
    if (gifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-light-gray);padding:2rem;">No gift submissions yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = gifts.map(g => {
        const date = new Date(g.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return `<tr>
            <td>${escapeHtml(g.name)}</td>
            <td>${escapeHtml(g.contact)}</td>
            <td>${escapeHtml(g.gift_type)}</td>
            <td>${escapeHtml(g.description ? (g.description.substring(0, 50) + (g.description.length > 50 ? '...' : '')) : '')}</td>
            <td><span class="badge badge--${g.status}">${g.status}</span></td>
            <td>${date}</td>
            <td class="admin-table__actions">
                <button class="admin-table__btn admin-table__btn--approve" onclick="updateGiftStatus('${g.id}', 'contacted')">CONTACTED</button>
                <button class="admin-table__btn admin-table__btn--feature" onclick="updateGiftStatus('${g.id}', 'completed')">COMPLETED</button>
                <button class="admin-table__btn admin-table__btn--delete" onclick="deleteGift('${g.id}')">DELETE</button>
            </td>
        </tr>`;
    }).join('');
}

async function updateGiftStatus(id, status) {
    const { error } = await supabase.from('gifts').update({ status }).eq('id', id);
    if (!error) loadGifts();
}

async function deleteGift(id) {
    if (!confirm('Delete this gift submission?')) return;
    const { error } = await supabase.from('gifts').delete().eq('id', id);
    if (!error) loadGifts();
}

// SETTINGS
async function loadSettings() {
    try {
        const { data } = await supabase.from('birthday_config').select('*').limit(1).single();
        if (data) {
            const ageInput = document.getElementById('setting-age');
            const heroInput = document.getElementById('setting-hero');
            const messageInput = document.getElementById('setting-message');
            const cashInput = document.getElementById('setting-cash');
            
            if (ageInput) ageInput.value = data.age;
            if (heroInput) heroInput.value = data.hero_text || '';
            if (messageInput) messageInput.value = data.final_message || '';
            if (cashInput) cashInput.value = data.cash_gift_instructions || '';
        }
    } catch (err) {
        console.error('Load settings error:', err);
    }
}

async function saveSettings() {
    try {
        const updates = {
            age: parseInt(document.getElementById('setting-age')?.value) || 23,
            hero_text: document.getElementById('setting-hero')?.value || '',
            final_message: document.getElementById('setting-message')?.value || '',
            cash_gift_instructions: document.getElementById('setting-cash')?.value || ''
        };
        
        const { data: existing } = await supabase.from('birthday_config').select('id').limit(1).single();
        
        if (existing) {
            await supabase.from('birthday_config').update(updates).eq('id', existing.id);
        }
        
        alert('Settings saved successfully!');
    } catch (err) {
        console.error('Save settings error:', err);
        alert('Failed to save settings.');
    }
}

// Utility
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Close modals
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('modal--active');
    }
    if (e.target.classList.contains('modal__close')) {
        e.target.closest('.modal').classList.remove('modal--active');
    }
});
