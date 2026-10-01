// Admin Dashboard for Sagacious Tehilla Birthday Experience

const SUPABASE_URL = 'https://zsenubtfeirvrkijhuoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZW51YnRmZWlydnJraWpodW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjY1NzMsImV4cCI6MjEwNjIwMjU3M30.ykV41E_NPIAz7aKahgoSzR3BpFE624oLjzua14WtVOs';

let supabase = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch(e) {
        console.warn('Admin Supabase init fallback:', e);
    }

    checkAuth();
    initSidebarNav();
    initAdminTabs();
});

// AUTHENTICATION
async function checkAuth() {
    // Check if session exists in Supabase or local admin flag
    if (supabase) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                showDashboard(session.user);
                return;
            }
        } catch(e) {}
    }

    const localAdmin = localStorage.getItem('sage_admin_logged_in');
    if (localAdmin === 'true') {
        showDashboard({ email: 'admin@sagacioustehilla.com' });
    } else {
        showLogin();
    }
}

async function login(email, password) {
    let success = false;

    if (supabase) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error && data?.user) {
                showDashboard(data.user);
                return;
            }
        } catch(e) {}
    }

    // Local admin login fallback (accepts any admin email/password)
    if (email && password) {
        localStorage.setItem('sage_admin_logged_in', 'true');
        showDashboard({ email });
    } else {
        showLoginError('Invalid email or password.');
    }
}

async function logout() {
    if (supabase) {
        try { await supabase.auth.signOut(); } catch(e) {}
    }
    localStorage.removeItem('sage_admin_logged_in');
    showLogin();
}

function showLogin() {
    const loginEl = document.getElementById('admin-login');
    const dashEl = document.getElementById('admin-dashboard');
    if (loginEl) loginEl.classList.remove('hidden');
    if (dashEl) dashEl.classList.add('hidden');
}

function showDashboard(user) {
    const loginEl = document.getElementById('admin-login');
    const dashEl = document.getElementById('admin-dashboard');
    if (loginEl) loginEl.classList.add('hidden');
    if (dashEl) dashEl.classList.remove('hidden');
    
    const userEl = document.querySelector('.admin-header__user');
    if (userEl) userEl.textContent = user.email || 'admin@sagacioustehilla.com';
    
    loadDashboardData();
}

function showLoginError(msg) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }
}

// Form Handlers
document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email')?.value.trim();
    const password = document.getElementById('admin-password')?.value.trim();
    login(email, password);
});

document.getElementById('admin-logout-btn')?.addEventListener('click', logout);

// SIDEBAR NAVIGATION
function initSidebarNav() {
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
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
    
    const titles = { dashboard: 'Dashboard', messages: 'Messages', gifts: 'Gifts', settings: 'Settings' };
    const headerTitle = document.querySelector('.admin-header__title');
    if (headerTitle) headerTitle.textContent = titles[sectionName] || 'Dashboard';
    
    if (sectionName === 'dashboard') loadDashboardData();
    if (sectionName === 'messages') loadMessages();
    if (sectionName === 'gifts') loadGifts();
}

// DATA LOADERS
async function getAllMessagesCombined() {
    let remoteMsgs = [];
    if (supabase) {
        try {
            const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
            if (data) remoteMsgs = data;
        } catch(e) {}
    }

    let localMsgs = [];
    try {
        localMsgs = JSON.parse(localStorage.getItem('sage_local_messages') || '[]');
    } catch(e) {}

    const combined = [...localMsgs, ...remoteMsgs];
    const uniqueMap = new Map();
    combined.forEach(m => uniqueMap.set(m.id || m.name + m.created_at, m));
    return Array.from(uniqueMap.values());
}

async function loadDashboardData() {
    const messages = await getAllMessagesCombined();
    
    const total = messages.length;
    const pending = messages.filter(m => m.status === 'pending').length;
    const approved = messages.filter(m => m.status === 'approved').length;
    const featured = messages.filter(m => m.featured).length;
    
    document.getElementById('stat-total-messages').textContent = total;
    document.getElementById('stat-pending-messages').textContent = pending;
    document.getElementById('stat-approved-messages').textContent = approved;
    document.getElementById('stat-featured-messages').textContent = featured;
}

// MESSAGES MODERATION
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
    const all = await getAllMessagesCombined();
    let filtered = all;

    if (currentMessageFilter === 'pending') filtered = all.filter(m => m.status === 'pending');
    if (currentMessageFilter === 'approved') filtered = all.filter(m => m.status === 'approved');
    if (currentMessageFilter === 'rejected') filtered = all.filter(m => m.status === 'rejected');
    if (currentMessageFilter === 'featured') filtered = all.filter(m => m.featured);

    renderMessagesTable(filtered);
}

function renderMessagesTable(messages) {
    const tbody = document.getElementById('messages-tbody');
    if (!tbody) return;
    
    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-light-gray);padding:2rem;">No messages found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = messages.map(m => {
        const date = m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Today';
        const truncMsg = m.message.length > 50 ? m.message.substring(0, 50) + '...' : m.message;
        const statusClass = `badge--${m.status || 'approved'}`;
        const featuredBadge = m.featured ? ' <span class="badge badge--featured">★</span>' : '';
        
        return `<tr>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.relationship)}</td>
            <td>${escapeHtml(truncMsg)}</td>
            <td><span class="badge ${statusClass}">${m.status || 'approved'}</span>${featuredBadge}</td>
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
    const all = await getAllMessagesCombined();
    const msg = all.find(m => String(m.id) === String(id));
    if (!msg) return;
    
    const modal = document.getElementById('admin-message-modal');
    if (!modal) return;
    
    modal.querySelector('.modal__body').innerHTML = `
        <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
        <p><strong>Relationship:</strong> ${escapeHtml(msg.relationship)}</p>
        ${msg.optional_title ? `<p><strong>Title:</strong> ${escapeHtml(msg.optional_title)}</p>` : ''}
        <p><strong>Status:</strong> <span class="badge badge--${msg.status}">${msg.status}</span> ${msg.featured ? '<span class="badge badge--featured">Featured</span>' : ''}</p>
        <p><strong>Date:</strong> ${msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Recent'}</p>
        <hr style="border-color:var(--color-dark-gray);margin:1rem 0;">
        <p style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(msg.message)}</p>
        ${msg.photo_url ? `<img src="${msg.photo_url}" alt="Uploaded photo" style="max-width:100%;border-radius:8px;margin-top:1rem;">` : ''}
    `;
    
    modal.classList.add('modal--open');
    modal.classList.add('modal--active');
}

async function updateMessageStatus(id, status) {
    if (supabase) {
        try { await supabase.from('messages').update({ status }).eq('id', id); } catch(e) {}
    }
    // Update local storage
    try {
        const local = JSON.parse(localStorage.getItem('sage_local_messages') || '[]');
        const idx = local.findIndex(m => String(m.id) === String(id));
        if (idx !== -1) {
            local[idx].status = status;
            localStorage.setItem('sage_local_messages', JSON.stringify(local));
        }
    } catch(e) {}
    
    loadMessages();
    loadDashboardData();
}

async function toggleFeature(id, featured) {
    if (supabase) {
        try { await supabase.from('messages').update({ featured }).eq('id', id); } catch(e) {}
    }
    try {
        const local = JSON.parse(localStorage.getItem('sage_local_messages') || '[]');
        const idx = local.findIndex(m => String(m.id) === String(id));
        if (idx !== -1) {
            local[idx].featured = featured;
            localStorage.setItem('sage_local_messages', JSON.stringify(local));
        }
    } catch(e) {}

    loadMessages();
    loadDashboardData();
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    if (supabase) {
        try { await supabase.from('messages').delete().eq('id', id); } catch(e) {}
    }
    try {
        let local = JSON.parse(localStorage.getItem('sage_local_messages') || '[]');
        local = local.filter(m => String(m.id) !== String(id));
        localStorage.setItem('sage_local_messages', JSON.stringify(local));
    } catch(e) {}

    loadMessages();
    loadDashboardData();
}

// GIFTS MANAGEMENT
async function loadGifts() {
    const tbody = document.getElementById('gifts-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-light-gray);padding:2rem;">No physical gift submissions logged yet.</td></tr>';
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Modal closing
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('modal--open');
        e.target.classList.remove('modal--active');
    }
    if (e.target.classList.contains('modal__close')) {
        const m = e.target.closest('.modal');
        if (m) {
            m.classList.remove('modal--open');
            m.classList.remove('modal--active');
        }
    }
});
