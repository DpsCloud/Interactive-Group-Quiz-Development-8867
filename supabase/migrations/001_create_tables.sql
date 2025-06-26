-- Create Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes_biblical123 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  max_players INTEGER DEFAULT 10,
  time_type TEXT DEFAULT 'perQuestion' CHECK (time_type IN ('perQuestion', 'totalQuiz')),
  time_per_question INTEGER DEFAULT 30,
  total_time INTEGER DEFAULT 10,
  lives INTEGER DEFAULT 3,
  shuffle_answers BOOLEAN DEFAULT true,
  questions JSONB NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Players Table  
CREATE TABLE IF NOT EXISTS players_biblical123 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes_biblical123(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar JSONB,
  lives INTEGER DEFAULT 3 CHECK (lives >= 0),
  score INTEGER DEFAULT 0 CHECK (score >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Game Answers Table (for tracking answers)
CREATE TABLE IF NOT EXISTS game_answers_biblical123 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players_biblical123(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes_biblical123(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  answer_index INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_spent INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quizzes_biblical123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE players_biblical123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers_biblical123 ENABLE ROW LEVEL SECURITY;

-- Create Policies for Public Access
CREATE POLICY "Public read access on quizzes" ON quizzes_biblical123 FOR SELECT USING (true);
CREATE POLICY "Public insert access on quizzes" ON quizzes_biblical123 FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on quizzes" ON quizzes_biblical123 FOR UPDATE USING (true);

CREATE POLICY "Public read access on players" ON players_biblical123 FOR SELECT USING (true);
CREATE POLICY "Public insert access on players" ON players_biblical123 FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on players" ON players_biblical123 FOR UPDATE USING (true);

CREATE POLICY "Public read access on answers" ON game_answers_biblical123 FOR SELECT USING (true);
CREATE POLICY "Public insert access on answers" ON game_answers_biblical123 FOR INSERT WITH CHECK (true);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_players_quiz_id ON players_biblical123(quiz_id);
CREATE INDEX IF NOT EXISTS idx_players_score ON players_biblical123(score DESC);
CREATE INDEX IF NOT EXISTS idx_answers_player_id ON game_answers_biblical123(player_id);
CREATE INDEX IF NOT EXISTS idx_answers_quiz_id ON game_answers_biblical123(quiz_id);

-- Create Functions for Real-time Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes_biblical123 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players_biblical123 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();