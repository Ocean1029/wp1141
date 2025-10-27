// Tag type definitions
export interface Tag {
  name: string; // Primary key (with userId)
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    places: number;
  };
}

export interface TagFormData {
  name: string;
  description?: string;
}

export interface TagListResponse {
  success: boolean;
  count: number;
  data: Tag[];
}

export interface TagResponse {
  success: boolean;
  message?: string;
  data: Tag;
}

