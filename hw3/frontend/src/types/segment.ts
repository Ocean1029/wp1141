// Type definitions for segment-related data structures

export interface Segment {
  id: string;
  diary_id: string;
  theme_id: string | null;
  content: string;
  segment_order: number;
  created_at: string;
  updated_at: string;
  theme_name?: string | null;
  theme_description?: string | null;
  theme_color?: string | null;
  diary_title?: string | null;
  diary_content?: string;
  diary_created_at?: string;
}

export interface SegmentFormData {
  diary_id: string;
  theme_id?: string;
  content: string;
  segment_order: number;
}

export interface BulkSegmentData {
  content: string;
  theme_id?: string;
  segment_order: number;
}

export interface BulkSegmentRequest {
  diary_id: string;
  segments: BulkSegmentData[];
}

export interface SegmentListResponse {
  success: boolean;
  count: number;
  data: Segment[];
}

export interface SegmentResponse {
  success: boolean;
  data: Segment;
  message?: string;
}

