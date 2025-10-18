// Service layer for color-related API calls

import api from './api';
import type {
  Color,
  ColorWithThemes,
  ColorFormData,
  ColorListResponse,
  ColorDetailResponse,
  ColorResponse,
} from '../types/color';

export const colorService = {
  /**
   * Fetch all colors
   */
  getAllColors: async (search?: string): Promise<Color[]> => {
    let endpoint = '/api/colors';
    
    if (search) {
      endpoint += `?search=${encodeURIComponent(search)}`;
    }
    
    const response = await api.get<ColorListResponse>(endpoint);
    return response.data;
  },

  /**
   * Fetch a single color by ID
   */
  getColorById: async (id: number): Promise<ColorWithThemes> => {
    const response = await api.get<ColorDetailResponse>(`/api/colors/${id}`);
    return response.data;
  },

  /**
   * Create a new color
   */
  createColor: async (data: ColorFormData): Promise<Color> => {
    const response = await api.post<ColorResponse>('/api/colors', data);
    return response.data;
  },

  /**
   * Update an existing color
   */
  updateColor: async (id: number, data: Partial<ColorFormData>): Promise<Color> => {
    const response = await api.put<ColorResponse>(`/api/colors/${id}`, data);
    return response.data;
  },

  /**
   * Delete a color
   */
  deleteColor: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(
      `/api/colors/${id}`
    );
  },
};

export default colorService;
