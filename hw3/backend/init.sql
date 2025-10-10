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
