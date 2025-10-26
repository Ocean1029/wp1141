// Places API endpoints
import axiosClient from './axiosClient';
import type { Place, PlaceFormData, PlaceListResponse, PlaceResponse } from '../types/place';

export const placesApi = {
  /**
   * Get all places
   */
  async getAll(params?: { search?: string; tagIds?: string[] }): Promise<Place[]> {
    const queryParams: any = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.tagIds && params.tagIds.length > 0) {
      queryParams.tagIds = params.tagIds;
    }
    
    const response = await axiosClient.get<PlaceListResponse>('/api/places', { params: queryParams });
    return response.data.data;
  },

  /**
   * Get place by ID
   */
  async getById(id: string): Promise<Place> {
    const response = await axiosClient.get<PlaceResponse>(`/api/places/${id}`);
    return response.data.data;
  },

  /**
   * Create a new place
   */
  async create(data: PlaceFormData): Promise<Place> {
    const response = await axiosClient.post<PlaceResponse>('/api/places', data);
    return response.data.data;
  },

  /**
   * Update a place
   */
  async update(id: string, data: Partial<Omit<PlaceFormData, 'tags'>>): Promise<Place> {
    const response = await axiosClient.patch<PlaceResponse>(`/api/places/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a place
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/places/${id}`);
  },

  /**
   * Add a tag to a place
   */
  async addTag(placeId: string, tagId: string): Promise<void> {
    await axiosClient.post(`/api/places/${placeId}/tags/${tagId}`);
  },

  /**
   * Remove a tag from a place
   */
  async removeTag(placeId: string, tagId: string): Promise<void> {
    await axiosClient.delete(`/api/places/${placeId}/tags/${tagId}`);
  },
};

