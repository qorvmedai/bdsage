-- ============================================
-- Sagacious Tehilla — 23rd Birthday Experience
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: birthday_config
-- Stores editable site configuration
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_name TEXT NOT NULL DEFAULT 'Sagacious Tehilla',
    age INTEGER NOT NULL DEFAULT 23,
    birthday DATE NOT NULL DEFAULT '2026-09-29',
    hero_text TEXT DEFAULT 'A new level. A bigger story.',
    final_message TEXT DEFAULT 'Happy Birthday, Sagacious!

Honestly, I''m grateful our paths crossed and that I''ve had the chance to know you, work with you, have conversations with you and just build around different ideas with you.

We''ve talked about business, opportunities, money, ideas, the future and plenty other things 😂 and I genuinely believe there''s still a lot ahead of us.

For this new chapter, my prayer is that God gives you more wisdom, clarity, strength and favour. That the things you''re working on start making more sense and producing the results you want.

May you meet the right people, get the right opportunities and find yourself in rooms you never thought you''d be in.

And I pray that everything you''re building eventually becomes much bigger than what you can currently see.

Keep growing. Keep building. Keep becoming.

Happy Birthday once again, Boss Sage. More life, more wisdom, more opportunities and, of course, more wins.

We''ve got a lot ahead.',
    audio_url TEXT DEFAULT '/assets/audio/birthday-track.mp3',
    cash_gift_instructions TEXT DEFAULT 'Payment details coming soon. Contact the site admin for more information.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: messages
-- Birthday messages from people
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Friend',
    message TEXT NOT NULL,
    photo_url TEXT,
    optional_title TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: gifts
-- Gift intentions/submissions
-- ============================================
CREATE TABLE IF NOT EXISTS gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    gift_type TEXT NOT NULL DEFAULT 'physical' CHECK (gift_type IN ('cash', 'physical', 'other')),
    description TEXT,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: quiz_questions
-- Interactive quiz questions
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: media
-- Gallery photos and media
-- ============================================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    file_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE birthday_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC POLICIES (anon role)
-- ============================================

-- Anyone can read birthday config
CREATE POLICY "Public can read birthday config"
    ON birthday_config FOR SELECT
    TO anon
    USING (true);

-- Anyone can read approved messages only
CREATE POLICY "Public can read approved messages"
    ON messages FOR SELECT
    TO anon
    USING (status = 'approved');

-- Anyone can submit a new message (status defaults to pending)
CREATE POLICY "Public can submit messages"
    ON messages FOR INSERT
    TO anon
    WITH CHECK (status = 'pending' AND featured = false);

-- Anyone can read active quiz questions
CREATE POLICY "Public can read active quiz questions"
    ON quiz_questions FOR SELECT
    TO anon
    USING (active = true);

-- Anyone can read active media
CREATE POLICY "Public can read active media"
    ON media FOR SELECT
    TO anon
    USING (active = true);

-- Anyone can submit gift intentions
CREATE POLICY "Public can submit gifts"
    ON gifts FOR INSERT
    TO anon
    WITH CHECK (status = 'pending');

-- Gifts are NOT readable by public
-- No SELECT policy for anon on gifts table

-- ============================================
-- AUTHENTICATED (admin) POLICIES
-- ============================================

-- Admin full access to birthday_config
CREATE POLICY "Admin full access to config"
    ON birthday_config FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin full access to messages
CREATE POLICY "Admin full access to messages"
    ON messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin full access to gifts
CREATE POLICY "Admin full access to gifts"
    ON gifts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin full access to quiz
CREATE POLICY "Admin full access to quiz"
    ON quiz_questions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin full access to media
CREATE POLICY "Admin full access to media"
    ON media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these via Supabase Dashboard > Storage or SQL:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('birthday-media', 'birthday-media', true);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('message-uploads', 'message-uploads', true);

-- Storage policies for message-uploads:
-- CREATE POLICY "Anyone can upload message photos"
--     ON storage.objects FOR INSERT
--     TO anon
--     WITH CHECK (bucket_id = 'message-uploads');

-- CREATE POLICY "Anyone can view message photos"
--     ON storage.objects FOR SELECT
--     TO anon
--     USING (bucket_id = 'message-uploads');

-- CREATE POLICY "Admin can manage all storage"
--     ON storage.objects FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- ============================================
-- SEED DATA: Quiz Questions
-- ============================================
INSERT INTO quiz_questions (question, options, correct_answer, sort_order) VALUES
(
    'What is Sagacious Tehilla best known for?',
    '["Software Engineering", "Marketing & Strategy", "Real Estate", "Music"]',
    1,
    1
),
(
    'Who are the Mystics?',
    '["TAS clients", "Sagacious'' personal clients", "Studentpreneurs", "MMC members"]',
    3,
    2
),
(
    'Which best describes Sagacious Tehilla?',
    '["Strict and serious", "Quiet and reserved", "Funny, calm, ambitious and business-minded", "Always serious"]',
    2,
    3
),
(
    'What does Sagacious call the people in his community?',
    '["Bros", "Fellas", "Eriga", "Champs"]',
    2,
    4
),
(
    'What is Sagacious Tehilla''s favourite colour?',
    '["Blue", "Green", "Red", "Purple"]',
    2,
    5
);

-- ============================================
-- SEED DATA: Birthday Config
-- ============================================
INSERT INTO birthday_config (public_name, age, birthday) 
VALUES ('Sagacious Tehilla', 23, '2026-09-29');

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_birthday_config_updated_at
    BEFORE UPDATE ON birthday_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at
    BEFORE UPDATE ON gifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
