// Axios client configuration with credentials support
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: send cookies with requests
});

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Only attempt to refresh if not on login page and not calling refresh endpoint
        const isLoginPage = window.location.pathname === '/login';
        const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
        const isGetCurrentUser = originalRequest.url?.includes('/auth/me');
        const isLoginEndpoint = originalRequest.url?.includes('/auth/login');
        
        // Don't try to refresh if:
        // 1. Already on login page
        // 2. The request itself is to refresh endpoint
        // 3. It's a getCurrentUser request (called on mount, expected to fail if not authenticated)
        // 4. It's a login request (initial authentication attempt)
        if (isLoginPage || isRefreshEndpoint || isGetCurrentUser || isLoginEndpoint) {
          return Promise.reject(error);
        }

        // Attempt to refresh the access token
        await axiosClient.post('/auth/refresh');
        
        // Retry the original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

