// Auth API endpoints
import axiosClient from './axiosClient';
import type { User, AuthResponse, RegisterRequest, LoginRequest } from '../types/user';

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await axiosClient.post('/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosClient.get<AuthResponse>('/auth/me');
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refresh(): Promise<void> {
    await axiosClient.post('/auth/refresh');
  },
};

