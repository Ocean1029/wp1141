// Places API endpoints
import axiosClient from './axiosClient';
import type { Place, PlaceFormData, PlaceListResponse, PlaceResponse } from '../types/place';

export const placesApi = {
  /**
   * Get all places
   */
  async getAll(params?: { search?: string; tagNames?: string[] }): Promise<Place[]> {
    const queryParams: any = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.tagNames && params.tagNames.length > 0) {
      queryParams.tagNames = params.tagNames;
    }
    
    const response = await axiosClient.get<PlaceListResponse>('/api/places', { params: queryParams });
    return response.data.data;
  },

  /**
   * Get place by Google Place ID
   */
  async getById(id: string): Promise<Place> {
    const response = await axiosClient.get<PlaceResponse>(`/api/places/${encodeURIComponent(id)}`);
    return response.data.data;
  },

  /**
   * Create a new place with Google Place ID
   */
  async create(data: PlaceFormData): Promise<Place> {
    const response = await axiosClient.post<PlaceResponse>('/api/places', data);
    return response.data.data;
  },

  /**
   * Update a place
   */
  async update(id: string, data: Partial<Omit<PlaceFormData, 'id' | 'tags'>>): Promise<Place> {
    const response = await axiosClient.patch<PlaceResponse>(`/api/places/${encodeURIComponent(id)}`, data);
    return response.data.data;
  },

  /**
   * Delete a place
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/places/${encodeURIComponent(id)}`);
  },

  /**
   * Add a tag to a place
   */
  async addTag(placeId: string, tagName: string): Promise<void> {
    await axiosClient.post(`/api/places/${encodeURIComponent(placeId)}/tags/${encodeURIComponent(tagName)}`);
  },

  /**
   * Remove a tag from a place
   */
  async removeTag(placeId: string, tagName: string): Promise<void> {
    await axiosClient.delete(`/api/places/${encodeURIComponent(placeId)}/tags/${encodeURIComponent(tagName)}`);
  },
};

