// Service layer for segment-related API calls

import api from './api';
import type {
  Segment,
  SegmentFormData,
  BulkSegmentRequest,
  SegmentListResponse,
  SegmentResponse,
} from '../types/segment';

export const segmentService = {
  /**
   * Fetch all segments, optionally filtered by diary_id or theme_id
   */
  getSegments: async (filters?: {
    diary_id?: string;
    theme_id?: string;
  }): Promise<Segment[]> => {
    let endpoint = '/api/segments';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.diary_id) params.append('diary_id', filters.diary_id);
      if (filters.theme_id) params.append('theme_id', filters.theme_id);
      endpoint += `?${params.toString()}`;
    }
    
    const response = await api.get<SegmentListResponse>(endpoint);
    return response.data;
  },

  /**
   * Fetch a single segment by ID
   */
  getSegmentById: async (id: string): Promise<Segment> => {
    const response = await api.get<SegmentResponse>(`/api/segments/${id}`);
    return response.data;
  },

  /**
   * Create a new segment
   */
  createSegment: async (data: SegmentFormData): Promise<Segment> => {
    const response = await api.post<SegmentResponse>('/api/segments', data);
    return response.data;
  },

  /**
   * Create multiple segments at once (for AI segmentation)
   */
  createBulkSegments: async (data: BulkSegmentRequest): Promise<Segment[]> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Segment[];
    }>('/api/segments/bulk', data);
    return response.data;
  },

  /**
   * Update an existing segment
   */
  updateSegment: async (
    id: string,
    data: Partial<SegmentFormData>
  ): Promise<Segment> => {
    const response = await api.put<SegmentResponse>(`/api/segments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a segment
   */
  deleteSegment: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(
      `/api/segments/${id}`
    );
  },
};

export default segmentService;

