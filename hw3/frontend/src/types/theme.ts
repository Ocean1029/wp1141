// Type definitions for theme-related data structures

export interface Color {
  hex_code: string;
  name: string;
  meaning?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  color_hex: string | null;
  color_name: string | null;
  color_meaning: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeWithSegments extends Theme {
  segments: ThemeSegment[];
}

export interface ThemeSegment {
  id: string;
  diary_id: string;
  theme_id?: string | null;
  content: string;
  segment_order: number;
  created_at: string;
  updated_at?: string;
  diary_title: string | null;
  diary_created_at: string;
  theme_name?: string | null;
  theme_description?: string | null;
  theme_color?: string | null;
}

export interface ThemeFormData {
  name: string;
  description?: string;
  color_id?: number;
}

export interface ThemeListResponse {
  success: boolean;
  count: number;
  data: Theme[];
}

export interface ThemeDetailResponse {
  success: boolean;
  data: ThemeWithSegments;
}

