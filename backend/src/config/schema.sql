-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT,
  skills TEXT[],
  linkedin_url VARCHAR(500),
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email OTP codes (login & password reset)
CREATE TABLE IF NOT EXISTS auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('login', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);

-- Events
CREATE TYPE event_type AS ENUM (
  'workshop', 'seminar', 'hackathon', 'conference', 'summit',
  'bootcamp', 'course', 'networking', 'competition', 'meetup', 'demo_day'
);
CREATE TYPE event_status AS ENUM ('draft', 'published', 'finished');

CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type event_type NOT NULL,
  date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location VARCHAR(500),
  price NUMERIC(10,2),
  is_online BOOLEAN DEFAULT FALSE,
  cover_image VARCHAR(500),
  agenda JSONB,
  resources JSONB,
  extra_fields JSONB,
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  status event_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Staff
CREATE TYPE staff_role AS ENUM ('owner', 'staff');

CREATE TABLE IF NOT EXISTS event_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  role staff_role NOT NULL DEFAULT 'staff',
  UNIQUE(event_id, user_id)
);

-- Event Invitations
CREATE TABLE IF NOT EXISTS event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role staff_role NOT NULL DEFAULT 'staff',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(event_id, email)
);

-- Registrations
CREATE TYPE registration_role AS ENUM ('attendee', 'mentor', 'jury', 'speaker');

CREATE TABLE IF NOT EXISTS registrations (
  registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  role registration_role DEFAULT 'attendee',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  member_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Q&A Questions
CREATE TABLE IF NOT EXISTS questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  asked_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  upvoted_by UUID[],
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Q&A Answers
CREATE TABLE IF NOT EXISTS answers (
  answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(question_id) ON DELETE CASCADE,
  answered_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements (badges awarded by event staff/owner — users cannot self-award)
CREATE TABLE IF NOT EXISTS achievements (
  achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL DEFAULT 'participant',
  label VARCHAR(120),
  team_name VARCHAR(255),
  awarded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_event ON achievements(event_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_questions_event ON questions(event_id);
