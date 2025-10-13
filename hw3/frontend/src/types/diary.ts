// Type definitions for diary-related data structures

export interface Diary {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DiaryFormData {
  title?: string;
  content: string;
}

export interface DiaryListResponse {
  success: boolean;
  count: number;
  data: Diary[];
}

export interface DiaryResponse {
  success: boolean;
  data: Diary;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

