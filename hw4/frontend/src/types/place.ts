// Place type definitions
export interface Place {
  id: string; // Google Place ID
  title: string;
  lat: number;
  lng: number;
  address: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: PlaceTag[];
  _count?: {
    events: number;
  };
}

export interface PlaceTag {
  name: string;
  description: string | null;
}

export interface PlaceFormData {
  id: string; // Google Place ID (required)
  title: string;
  lat: number;
  lng: number;
  address?: string;
  notes?: string;
  tags: string[]; // Tag names (not IDs)
}

export interface PlaceListResponse {
  success: boolean;
  count: number;
  data: Place[];
}

export interface PlaceResponse {
  success: boolean;
  message?: string;
  data: Place;
}

