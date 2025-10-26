// Maps/Google API type definitions
export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  types: string[];
}

export interface PlaceSearchResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  types: string[];
  rating?: number;
}

export interface GeocodeResponse {
  success: boolean;
  count?: number;
  data?: GeocodeResult[];
  error?: string;
}

export interface PlacesSearchResponse {
  success: boolean;
  count?: number;
  data?: PlaceSearchResult[];
  error?: string;
}

