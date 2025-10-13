// Service layer for theme-related API calls

import api from './api';
import type {
  Theme,
  ThemeWithSegments,
  ThemeFormData,
  ThemeListResponse,
  ThemeDetailResponse,
} from '../types/theme';

export const themeService = {
  /**
   * Fetch all themes
   */
  getAllThemes: async (): Promise<Theme[]> => {
    const response = await api.get<ThemeListResponse>('/api/themes');
    return response.data;
  },

  /**
   * Fetch a single theme with its segments
   */
  getThemeById: async (id: string): Promise<ThemeWithSegments> => {
    const response = await api.get<ThemeDetailResponse>(`/api/themes/${id}`);
    return response.data;
  },

  /**
   * Create a new theme
   */
  createTheme: async (data: ThemeFormData): Promise<Theme> => {
    const response = await api.post<{ success: boolean; data: Theme }>(
      '/api/themes',
      data
    );
    return response.data;
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

