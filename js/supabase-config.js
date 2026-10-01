/**
 * Supabase Client Configuration & API Module
 * Sagacious Tehilla — 23rd Birthday Experience
 */

const SUPABASE_URL = 'https://zsenubtfeirvrkijhuoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZW51YnRmZWlydnJraWpodW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjY1NzMsImV4cCI6MjEwNjIwMjU3M30.ykV41E_NPIAz7aKahgoSzR3BpFE624oLjzua14WtVOs';

// Initialize Supabase client
let supabase = null;
let supabaseReady = false;

function initSupabase() {
    try {
        if (typeof window !== 'undefined' && window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            supabaseReady = true;
            console.log('[Supabase] Connected successfully');
        } else {
            console.warn('[Supabase] Library not loaded — running in fallback mode');
            supabaseReady = false;
        }
    } catch (error) {
        console.error('[Supabase] Initialization failed:', error);
        supabaseReady = false;
    }
    return supabase;
}

function getSupabase() {
    if (!supabase && !supabaseReady) {
        initSupabase();
    }
    return supabase;
}

function isSupabaseReady() {
    return supabaseReady && supabase !== null;
}

// Demo & Fallback Initial Messages
const DEMO_MESSAGES = [
    {
        id: 'demo_1',
        name: 'A Mystic',
        relationship: 'Community member',
        message: 'Happy Birthday Boss Sage! Your mentorship has changed my perspective on business and life. Keep winning! 🎉',
        optional_title: 'From one of your Mystics',
        status: 'approved',
        featured: true,
        created_at: '2026-09-28T10:00:00Z'
    },
    {
        id: 'demo_2',
        name: 'A Student',
        relationship: 'Student',
        message: 'The things I\'ve learned from you about marketing and psychology are things I carry every single day. Happy Birthday Sagacious!',
        optional_title: null,
        status: 'approved',
        featured: false,
        created_at: '2026-09-28T11:00:00Z'
    },
    {
        id: 'demo_3',
        name: 'Team TAS',
        relationship: 'Team member',
        message: 'Working with you has been an incredible journey. From the early days to seven-figure months — we\'re just getting started. Happy Birthday! 🥂',
        optional_title: 'From the TAS Family',
        status: 'approved',
        featured: true,
        created_at: '2026-09-28T12:00:00Z'
    }
];

const DEMO_QUIZ = [
    {
        id: 1,
        question: 'What is Sagacious Tehilla best known for?',
        options: ['Software Engineering', 'Marketing & Strategy', 'Real Estate', 'Music'],
        correct_answer: 1,
        sort_order: 1
    },
    {
        id: 2,
        question: 'Who are the Mystics?',
        options: ['TAS clients', "Sagacious' personal clients", 'Studentpreneurs', 'MMC members'],
        correct_answer: 3,
        sort_order: 2
    },
    {
        id: 3,
        question: 'Which best describes Sagacious Tehilla?',
        options: ['Strict and serious', 'Quiet and reserved', 'Funny, calm, ambitious and business-minded', 'Always serious'],
        correct_answer: 2,
        sort_order: 3
    },
    {
        id: 4,
        question: 'What does Sagacious call the people in his community?',
        options: ['Bros', 'Fellas', 'Eriga', 'Champs'],
        correct_answer: 2,
        sort_order: 4
    },
    {
        id: 5,
        question: "What is Sagacious Tehilla's favourite colour?",
        options: ['Blue', 'Green', 'Red', 'Purple'],
        correct_answer: 2,
        sort_order: 5
    }
];

// Helper to get local stored messages
function getLocalMessages() {
    try {
        const stored = localStorage.getItem('sage_local_messages');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

// API Functions
async function fetchApprovedMessages() {
    let remoteMsgs = [];
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('status', 'approved')
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false });
            
            if (!error && data) remoteMsgs = data;
        } catch (error) {
            console.warn('[Supabase] Error fetching messages:', error);
        }
    }
    
    const localMsgs = getLocalMessages();
    const combined = [...localMsgs, ...remoteMsgs];
    
    if (combined.length === 0) {
        return DEMO_MESSAGES;
    }
    
    // Remove duplicates by ID if any
    const uniqueMap = new Map();
    combined.forEach(m => uniqueMap.set(m.id || m.name + m.created_at, m));
    return Array.from(uniqueMap.values());
}

async function submitMessage(messageData) {
    let savedRemotely = false;

    if (isSupabaseReady()) {
        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    name: messageData.name,
                    relationship: messageData.relationship,
                    message: messageData.message,
                    optional_title: messageData.optional_title || null,
                    photo_url: messageData.photo_url || null,
                    status: 'approved', // Instant display for birthday feel
                    featured: false
                }]);
            
            if (!error) savedRemotely = true;
            else console.warn('[Supabase] Insert error (will store locally):', error.message);
        } catch (error) {
            console.warn('[Supabase] Error submitting message (will store locally):', error);
        }
    }

    // Always store in local storage as fail-safe
    try {
        const local = getLocalMessages();
        const newMsg = {
            id: 'msg_' + Date.now(),
            name: messageData.name,
            relationship: messageData.relationship,
            message: messageData.message,
            optional_title: messageData.optional_title || null,
            photo_url: messageData.photo_url || null,
            status: 'approved',
            featured: false,
            created_at: new Date().toISOString()
        };
        local.unshift(newMsg);
        localStorage.setItem('sage_local_messages', JSON.stringify(local));
    } catch(e) {
        console.warn('LocalStorage write failed:', e);
    }

    return { success: true, savedRemotely };
}

async function uploadMessagePhoto(file) {
    if (!isSupabaseReady()) {
        return { success: true, url: null, fallback: true };
    }
    
    try {
        const fileExt = file.name.split('.').pop().toLowerCase();
        const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
        
        if (!allowedTypes.includes(fileExt)) {
            return { success: false, error: 'Unsupported file type. Please use JPG, PNG, or WEBP.' };
        }
        
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: 'File is too large. Maximum size is 5MB.' };
        }
        
        const fileName = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error } = await supabase.storage
            .from('message-uploads')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
            .from('message-uploads')
            .getPublicUrl(fileName);
        
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        console.warn('[Supabase] Storage upload failed:', error);
        return { success: true, url: null, fallback: true };
    }
}

async function submitGift(giftData) {
    if (isSupabaseReady()) {
        try {
            await supabase.from('gifts').insert([{
                name: giftData.name,
                contact: giftData.contact,
                gift_type: giftData.gift_type,
                description: giftData.description,
                note: giftData.note || null,
                status: 'pending'
            }]);
        } catch (e) {
            console.warn('[Supabase] Gift submission error:', e);
        }
    }
    return { success: true };
}

async function fetchQuizQuestions() {
    if (!isSupabaseReady()) return DEMO_QUIZ;
    try {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        return data && data.length > 0 ? data : DEMO_QUIZ;
    } catch (error) {
        return DEMO_QUIZ;
    }
}

// Export for global access
window.SupabaseAPI = {
    init: initSupabase,
    getClient: getSupabase,
    isReady: isSupabaseReady,
    fetchApprovedMessages,
    submitMessage,
    uploadMessagePhoto,
    submitGift,
    fetchQuizQuestions,
    getLocalMessages,
    DEMO_MESSAGES,
    DEMO_QUIZ
};

// Initialize immediately
initSupabase();
