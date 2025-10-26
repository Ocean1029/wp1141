// Events API endpoints
import axiosClient from './axiosClient';
import type { Event, EventFormData, EventListResponse, EventResponse } from '../types/event';

export const eventsApi = {
  /**
   * Get all events
   */
  async getAll(params?: { from?: string; to?: string; placeId?: string }): Promise<Event[]> {
    const response = await axiosClient.get<EventListResponse>('/api/events', { params });
    return response.data.data;
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event> {
    const response = await axiosClient.get<EventResponse>(`/api/events/${id}`);
    return response.data.data;
  },

  /**
   * Create a new event
   */
  async create(data: EventFormData): Promise<Event> {
    const response = await axiosClient.post<EventResponse>('/api/events', data);
    return response.data.data;
  },

  /**
   * Update an event
   */
  async update(id: string, data: Partial<Omit<EventFormData, 'placeIds'>>): Promise<Event> {
    const response = await axiosClient.patch<EventResponse>(`/api/events/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an event
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/events/${id}`);
  },

  /**
   * Add a place to an event
   */
  async addPlace(eventId: string, placeId: string): Promise<void> {
    await axiosClient.post(`/api/events/${eventId}/places/${placeId}`);
  },

  /**
   * Remove a place from an event
   */
  async removePlace(eventId: string, placeId: string): Promise<void> {
    await axiosClient.delete(`/api/events/${eventId}/places/${placeId}`);
  },
};

