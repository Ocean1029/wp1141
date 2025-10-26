// Event type definitions
export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  places: EventPlace[];
}

export interface EventPlace {
  id: string;
  eventId: string;
  placeId: string;
  place: {
    id: string;
    title: string;
    lat: number;
    lng: number;
    address: string | null;
  };
}

export interface EventFormData {
  title: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  notes?: string;
  placeIds?: string[];
}

export interface EventListResponse {
  success: boolean;
  count: number;
  data: Event[];
}

export interface EventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

