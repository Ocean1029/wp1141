// Service layer for theme-related API calls

import api from './api';
import type {
  Theme,
  ThemeWithSegments,
  ThemeFormData,
  ThemeListResponse,
  ThemeDetailResponse,
  ThemeSegment,
} from '../types/theme';

// Backend API response format (camelCase)
interface BackendTheme {
  id: string;
  name: string;
  description: string | null;
  colorId: number | null;
  createdAt: string;
  updatedAt: string;
  color?: {
    id: number;
    hexCode: string;
    name: string;
    meaning: string | null;
    createdAt: string;
  };
  segments?: BackendSegment[];
}

interface BackendSegment {
  id: string;
  diaryId: string;
  themeId: string | null;
  content: string;
  segmentOrder: number;
  createdAt: string;
  updatedAt: string;
  diary?: {
    id: string;
    title: string | null;
    createdAt: string;
  };
}

interface BackendThemeListResponse {
  success: boolean;
  count: number;
  data: BackendTheme[];
}

interface BackendThemeDetailResponse {
  success: boolean;
  data: BackendTheme;
}

export const themeService = {
  /**
   * Fetch all themes
   */
  getAllThemes: async (): Promise<Theme[]> => {
    const response = await api.get<BackendThemeListResponse>('/api/themes');
    // Convert camelCase to snake_case
    return response.data.map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color_hex: theme.color?.hexCode || null,
      color_name: theme.color?.name || null,
      color_meaning: theme.color?.meaning || null,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
    }));
  },

  /**
   * Fetch a single theme with its segments
   */
  getThemeById: async (id: string): Promise<ThemeWithSegments> => {
    const response = await api.get<BackendThemeDetailResponse>(`/api/themes/${id}`);
    const theme = response.data;
    
    // Convert segments from camelCase to snake_case
    const segments: ThemeSegment[] = theme.segments?.map(segment => ({
      id: segment.id,
      diary_id: segment.diaryId,
      theme_id: segment.themeId,
      content: segment.content,
      segment_order: segment.segmentOrder,
      created_at: segment.createdAt,
      updated_at: segment.updatedAt,
      diary_title: segment.diary?.title || null,
      diary_created_at: segment.diary?.createdAt || '',
    })) || [];
    
    // Convert theme from camelCase to snake_case
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color_hex: theme.color?.hexCode || null,
      color_name: theme.color?.name || null,
      color_meaning: theme.color?.meaning || null,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
      segments,
    };
  },

  /**
   * Create a new theme
   */
  createTheme: async (data: ThemeFormData): Promise<Theme> => {
    // Convert snake_case to camelCase for API
    const apiData = {
      name: data.name,
      description: data.description,
      colorId: data.color_id,
    };
    const response = await api.post<{ success: boolean; data: BackendTheme }>(
      '/api/themes',
      apiData
    );
    const theme = response.data;
    // Convert camelCase to snake_case
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color_hex: theme.color?.hexCode || null,
      color_name: theme.color?.name || null,
      color_meaning: theme.color?.meaning || null,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
    };
  },

  /**
   * Update an existing theme
   */
  updateTheme: async (id: string, data: ThemeFormData): Promise<Theme> => {
    const response = await api.put<{ success: boolean; data: Theme }>(
      `/api/themes/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a theme
   */
  deleteTheme: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(
      `/api/themes/${id}`
    );
  },
};

export default themeService;

