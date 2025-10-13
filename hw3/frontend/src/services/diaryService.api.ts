// API-based implementation of diary service
// Connects to backend REST API

import api from './api';
import type {
  Diary,
  DiaryFormData,
  DiaryListResponse,
  DiaryResponse,
} from '../types/diary';

/**
 * API-based diary service
 */
export const apiDiaryService = {
  /**
   * Fetch all diaries, optionally filtered by search query
   */
  getAllDiaries: async (searchQuery?: string): Promise<Diary[]> => {
    const endpoint = searchQuery
      ? `/api/diaries?search=${encodeURIComponent(searchQuery)}`
      : '/api/diaries';
    
    const response = await api.get<DiaryListResponse>(endpoint);
    return response.data;
  },

  /**
   * Fetch a single diary by ID
   */
  getDiaryById: async (id: string): Promise<Diary> => {
    const response = await api.get<DiaryResponse>(`/api/diaries/${id}`);
    return response.data;
  },

  /**
   * Create a new diary entry
   */
  createDiary: async (data: DiaryFormData): Promise<Diary> => {
    const response = await api.post<DiaryResponse>('/api/diaries', data);
    return response.data;
  },

  /**
   * Update an existing diary entry
   */
  updateDiary: async (id: string, data: DiaryFormData): Promise<Diary> => {
    const response = await api.put<DiaryResponse>(`/api/diaries/${id}`, data);
    return response.data;
  },

  /**
   * Delete a diary entry
   */
  deleteDiary: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(
      `/api/diaries/${id}`
    );
  },
};

