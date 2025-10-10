-- Database initialization script for Diary Reflection App
-- Version 2.0: UUID-based with separate color table

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create colors table for color scheme management
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hex_code VARCHAR(7) NOT NULL UNIQUE, -- e.g., '#FF6B6B'
  name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'Coral Red'
  meaning TEXT, -- Description of what this color represents
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create themes table for theme categories
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create diaries table for main diary entries
CREATE TABLE IF NOT EXISTS diaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create segments table for AI-generated segments
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_id UUID NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  segment_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_segments_diary_id ON segments(diary_id);
CREATE INDEX IF NOT EXISTS idx_segments_theme_id ON segments(theme_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_themes_color_id ON themes(color_id);

-- Insert default colors with meanings
INSERT INTO colors (hex_code, name, meaning) VALUES
  ('#FF6B6B', 'Coral Red', 'Represents urgency, procrastination, and time-sensitive matters'),
  ('#4ECDC4', 'Turquoise', 'Symbolizes self-reflection, personal value, and inner peace'),
  ('#45B7D1', 'Sky Blue', 'Associated with relationships, communication, and connections'),
  ('#FFA07A', 'Light Salmon', 'Reflects motivation, energy, and drive'),
  ('#DDA15E', 'Sandy Brown', 'Represents anxiety, concerns, and thoughtful worry'),
  ('#95E1D3', 'Mint Green', 'Symbolizes growth, learning, and personal development'),
  ('#A8DADC', 'Powder Blue', 'Associated with work, professional life, and career'),
  ('#F4A261', 'Sandy Orange', 'Represents creativity and self-expression'),
  ('#E76F51', 'Terra Cotta', 'Symbolizes passion and strong emotions'),
  ('#2A9D8F', 'Teal', 'Associated with balance and harmony')
ON CONFLICT (hex_code) DO NOTHING;

-- Insert default themes with color references
INSERT INTO themes (name, description, color_id)
SELECT 
  'Procrastination',
  'Thoughts related to delaying tasks and time management struggles',
  (SELECT id FROM colors WHERE hex_code = '#FF6B6B')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Procrastination');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Self-worth',
  'Reflections on personal value, confidence, and self-esteem',
  (SELECT id FROM colors WHERE hex_code = '#4ECDC4')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Self-worth');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Relationships',
  'Thoughts about connections with others, family, friends, and romantic partners',
  (SELECT id FROM colors WHERE hex_code = '#45B7D1')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Relationships');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Motivation',
  'Entries about drive, inspiration, goals, and aspirations',
  (SELECT id FROM colors WHERE hex_code = '#FFA07A')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Motivation');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Anxiety',
  'Concerns, worries, fears, and stress-related thoughts',
  (SELECT id FROM colors WHERE hex_code = '#DDA15E')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Anxiety');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Growth',
  'Personal development, learning experiences, and self-improvement',
  (SELECT id FROM colors WHERE hex_code = '#95E1D3')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Growth');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Work',
  'Professional life, career thoughts, and workplace experiences',
  (SELECT id FROM colors WHERE hex_code = '#A8DADC')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Work');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Creativity',
  'Creative thoughts, artistic expression, and imaginative ideas',
  (SELECT id FROM colors WHERE hex_code = '#F4A261')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Creativity');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Emotions',
  'Strong feelings, emotional experiences, and affective states',
  (SELECT id FROM colors WHERE hex_code = '#E76F51')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Emotions');

INSERT INTO themes (name, description, color_id)
SELECT 
  'Balance',
  'Life balance, harmony, and equilibrium in daily life',
  (SELECT id FROM colors WHERE hex_code = '#2A9D8F')
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE name = 'Balance');
