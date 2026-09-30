/**
 * Supabase Client Configuration
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
            console.warn('[Supabase] Library not loaded — running in demo mode');
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

// Demo data for when Supabase is not available
const DEMO_MESSAGES = [
    {
        id: 1,
        name: 'A Mystic',
        relationship: 'Community member',
        message: 'Happy Birthday Boss Sage! Your mentorship has changed my perspective on business and life. Keep winning! 🎉',
        optional_title: 'From one of your Mystics',
        status: 'approved',
        featured: true,
        created_at: '2026-09-28T10:00:00Z'
    },
    {
        id: 2,
        name: 'A Student',
        relationship: 'Student',
        message: 'The things I\'ve learned from you about marketing and psychology are things I carry every single day. Happy Birthday Sagacious!',
        optional_title: null,
        status: 'approved',
        featured: false,
        created_at: '2026-09-28T11:00:00Z'
    },
    {
        id: 3,
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

// API Helper Functions
async function fetchApprovedMessages() {
    if (!isSupabaseReady()) return DEMO_MESSAGES;
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('status', 'approved')
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data && data.length > 0 ? data : DEMO_MESSAGES;
    } catch (error) {
        console.error('[Supabase] Error fetching messages:', error);
        return DEMO_MESSAGES;
    }
}

async function submitMessage(messageData) {
    if (!isSupabaseReady()) {
        // Simulate successful submission in demo mode
        return { success: true, demo: true };
    }
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                name: messageData.name,
                relationship: messageData.relationship,
                message: messageData.message,
                optional_title: messageData.optional_title || null,
                photo_url: messageData.photo_url || null,
                status: 'pending',
                featured: false
            }]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('[Supabase] Error submitting message:', error);
        return { success: false, error: error.message };
    }
}

async function uploadMessagePhoto(file) {
    if (!isSupabaseReady()) {
        return { success: true, url: null, demo: true };
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
        
        const { data, error } = await supabase.storage
            .from('message-uploads')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
            .from('message-uploads')
            .getPublicUrl(fileName);
        
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        console.error('[Supabase] Error uploading photo:', error);
        return { success: false, error: "We couldn't upload that image. Please try another file." };
    }
}

async function submitGift(giftData) {
    if (!isSupabaseReady()) {
        return { success: true, demo: true };
    }
    
    try {
        const { data, error } = await supabase
            .from('gifts')
            .insert([{
                name: giftData.name,
                contact: giftData.contact,
                gift_type: giftData.gift_type,
                description: giftData.description,
                note: giftData.note || null,
                status: 'pending'
            }]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('[Supabase] Error submitting gift:', error);
        return { success: false, error: error.message };
    }
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
        console.error('[Supabase] Error fetching quiz:', error);
        return DEMO_QUIZ;
    }
}

// Export for use
window.SupabaseAPI = {
    init: initSupabase,
    getClient: getSupabase,
    isReady: isSupabaseReady,
    fetchApprovedMessages,
    submitMessage,
    uploadMessagePhoto,
    submitGift,
    fetchQuizQuestions,
    DEMO_MESSAGES,
    DEMO_QUIZ
};
