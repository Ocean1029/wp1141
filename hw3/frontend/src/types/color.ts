// Type definitions for color-related data structures

export interface Color {
  id: number;
  hex_code: string;
  name: string;
  meaning?: string | null;
  created_at: string;
  themes_count?: number;
}

export interface ColorWithThemes extends Color {
  themes: Array<{
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

export interface ColorFormData {
  hexCode: string;
  name: string;
  meaning?: string;
}

export interface ColorListResponse {
  success: boolean;
  count: number;
  data: Color[];
}

export interface ColorDetailResponse {
  success: boolean;
  data: ColorWithThemes;
}

export interface ColorResponse {
  success: boolean;
  data: Color;
  message?: string;
}
