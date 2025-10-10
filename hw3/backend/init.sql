-- Database initialization script for Diary Reflection App

-- Create diaries table for main diary entries
CREATE TABLE IF NOT EXISTS diaries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create themes table for theme categories
CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create segments table for AI-generated segments
CREATE TABLE IF NOT EXISTS segments (
  id SERIAL PRIMARY KEY,
  diary_id INTEGER NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  theme_id INTEGER REFERENCES themes(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  segment_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_segments_diary_id ON segments(diary_id);
CREATE INDEX IF NOT EXISTS idx_segments_theme_id ON segments(theme_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);

-- Insert some default themes
INSERT INTO themes (name, description, color) VALUES
  ('Procrastination', 'Thoughts related to delaying tasks', '#FF6B6B'),
  ('Self-worth', 'Reflections on personal value and confidence', '#4ECDC4'),
  ('Relationships', 'Thoughts about connections with others', '#45B7D1'),
  ('Motivation', 'Entries about drive and inspiration', '#FFA07A'),
  ('Anxiety', 'Concerns and worries', '#DDA15E'),
  ('Growth', 'Personal development and learning', '#95E1D3'),
  ('Work', 'Professional life and career thoughts', '#A8DADC')
ON CONFLICT (name) DO NOTHING;

