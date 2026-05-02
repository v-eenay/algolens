/**
 * Axios API Client with Authentication Interceptors
 * Handles automatic token injection and refresh on 401 errors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { RefreshResponse } from '../types/auth';

/**
 * Base API URL from environment variable with fallback
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Flag to prevent infinite loops during token refresh
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh
 */
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Create and configure Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
  });

  /**
   * Request Interceptor
   * Adds Authorization header with Bearer token from auth store
   */
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Only add token if we're in browser environment
      if (typeof window !== 'undefined') {
        const token = useAuthStore.getState().token;
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   * Handles 401 errors and automatic token refresh
   */
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Only handle 401 errors in browser environment
      if (
        typeof window === 'undefined' ||
        !error.response ||
        error.response.status !== 401 ||
        !originalRequest
      ) {
        return Promise.reject(error);
      }

      // Prevent infinite loops
      if (originalRequest._retry) {
        // Token refresh failed, logout user
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // Don't retry refresh or login endpoints
      if (
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { access_token, expires_in } = response.data;

        // Update tokens in store
        useAuthStore.getState().updateTokens(access_token, refreshToken, expires_in);

        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        // Process queued requests
        processQueue(null, access_token);

        isRefreshing = false;

        // Retry the original request
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
  );

  return client;
};

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient();

/**
 * Helper function to check if we're in browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};
