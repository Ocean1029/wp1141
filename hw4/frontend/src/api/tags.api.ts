// Tags API endpoints
import axiosClient from './axiosClient';
import type { Tag, TagFormData, TagListResponse, TagResponse } from '../types/tag';

export const tagsApi = {
  /**
   * Get all tags
   */
  async getAll(searchQuery?: string): Promise<Tag[]> {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await axiosClient.get<TagListResponse>('/api/tags', { params });
    return response.data.data;
  },

  /**
   * Get tag by name
   */
  async getByName(name: string): Promise<Tag> {
    const response = await axiosClient.get<TagResponse>(`/api/tags/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  /**
   * Create a new tag
   */
  async create(data: TagFormData): Promise<Tag> {
    const response = await axiosClient.post<TagResponse>('/api/tags', data);
    return response.data.data;
  },

  /**
   * Update a tag
   */
  async update(name: string, data: Partial<TagFormData>): Promise<Tag> {
    const response = await axiosClient.patch<TagResponse>(`/api/tags/${encodeURIComponent(name)}`, data);
    return response.data.data;
  },

  /**
   * Delete a tag
   */
  async delete(name: string): Promise<void> {
    await axiosClient.delete(`/api/tags/${encodeURIComponent(name)}`);
  },
};

