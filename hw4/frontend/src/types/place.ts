// Place type definitions
export interface Place {
  id: string;
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
  id: string;
  placeId: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface PlaceFormData {
  title: string;
  lat: number;
  lng: number;
  address?: string;
  notes?: string;
  tags: string[]; // Tag IDs
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

