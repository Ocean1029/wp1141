// Service layer for segment-related API calls

import api from './api';
import type {
  Segment,
  SegmentFormData,
  BulkSegmentRequest,
  SegmentListResponse,
  SegmentResponse,
} from '../types/segment';

// Backend API response format (camelCase)
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
  theme?: {
    id: string;
    name: string;
    description: string | null;
    color?: {
      hexCode: string;
    };
  };
}

interface BackendSegmentListResponse {
  success: boolean;
  count: number;
  data: BackendSegment[];
}

interface BackendSegmentResponse {
  success: boolean;
  data: BackendSegment;
  message?: string;
}

export const segmentService = {
  /**
   * Fetch all segments, optionally filtered by diary_id or theme_id
   */
  getSegments: async (filters?: {
    diary_id?: string;
    theme_id?: string;
  }): Promise<Segment[]> => {
    let endpoint = '/api/segments';
    const params = new URLSearchParams();
    params.append('includeRelations', 'true');
    
    if (filters) {
      if (filters.diary_id) params.append('diaryId', filters.diary_id);
      if (filters.theme_id) params.append('themeId', filters.theme_id);
    }
    
    endpoint += `?${params.toString()}`;
    
    const response = await api.get<BackendSegmentListResponse>(endpoint);
    // Convert camelCase to snake_case
    return response.data.map(segment => ({
      id: segment.id,
      diary_id: segment.diaryId,
      theme_id: segment.themeId,
      content: segment.content,
      segment_order: segment.segmentOrder,
      created_at: segment.createdAt,
      updated_at: segment.updatedAt,
      theme_name: segment.theme?.name,
      theme_description: segment.theme?.description,
      theme_color: segment.theme?.color?.hexCode,
      diary_title: segment.diary?.title,
      diary_content: undefined, // Backend doesn't provide diary content in segment relations
      diary_created_at: segment.diary?.createdAt,
    }));
  },

  /**
   * Fetch a single segment by ID
   */
  getSegmentById: async (id: string): Promise<Segment> => {
    const response = await api.get<BackendSegmentResponse>(`/api/segments/${id}`);
    const segment = response.data;
    // Convert camelCase to snake_case
    return {
      id: segment.id,
      diary_id: segment.diaryId,
      theme_id: segment.themeId,
      content: segment.content,
      segment_order: segment.segmentOrder,
      created_at: segment.createdAt,
      updated_at: segment.updatedAt,
      theme_name: segment.theme?.name,
      theme_description: segment.theme?.description,
      theme_color: segment.theme?.color?.hexCode,
      diary_title: segment.diary?.title,
      diary_content: undefined, // Backend doesn't provide diary content in segment relations
      diary_created_at: segment.diary?.createdAt,
    };
  },

  /**
   * Create a new segment
   */
  createSegment: async (data: SegmentFormData): Promise<Segment> => {
    // Convert snake_case to camelCase for API
    const apiData = {
      diaryId: data.diary_id,
      themeId: data.theme_id,
      content: data.content,
      segmentOrder: data.segment_order,
    };
    const response = await api.post<BackendSegmentResponse>('/api/segments', apiData);
    const segment = response.data;
    // Convert camelCase to snake_case
    return {
      id: segment.id,
      diary_id: segment.diaryId,
      theme_id: segment.themeId,
      content: segment.content,
      segment_order: segment.segmentOrder,
      created_at: segment.createdAt,
      updated_at: segment.updatedAt,
      theme_name: segment.theme?.name,
      theme_description: segment.theme?.description,
      theme_color: segment.theme?.color?.hexCode,
      diary_title: segment.diary?.title,
      diary_content: undefined, // Backend doesn't provide diary content in segment relations
      diary_created_at: segment.diary?.createdAt,
    };
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

