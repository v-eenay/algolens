/**
 * Authentication API Methods
 * Handles all authentication-related API calls
 */

import { apiClient } from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  RefreshResponse,
  UserProfile,
} from '../types/auth';

/**
 * Login user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with access token, refresh token, and expiration info
 * @throws Error if login fails
 * 
 * @example
 * ```typescript
 * const response = await login('user@example.com', 'password123');
 * console.log(response.access_token);
 * ```
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const payload: LoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register a new user
 * 
 * @param email - User's email address
 * @param password - User's password
 * @param full_name - User's full name
 * @param role - User's role (student, educator, or researcher)
 * @returns Promise with user registration details
 * @throws Error if registration fails
 * 
 * @example
 * ```typescript
 * const response = await register(
 *   'user@example.com',
 *   'password123',
 *   'John Doe',
 *   'student'
 * );
 * console.log(response.user_id);
 * ```
 */
export const register = async (
  email: string,
  password: string,
  full_name: string,
  role: 'student' | 'educator' | 'researcher'
): Promise<RegisterResponse> => {
  try {
    const payload: RegisterRequest = { email, password, full_name, role };
    const response = await apiClient.post<RegisterResponse>('/auth/register', payload);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Logout current user
 * Requires valid Bearer token in Authorization header
 * 
 * @returns Promise that resolves when logout is complete
 * @throws Error if logout fails
 * 
 * @example
 * ```typescript
 * await logout();
 * console.log('User logged out successfully');
 * ```
 */
export const logout = async (): Promise<void> => {
  try {
    // API returns 204 No Content on success
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 * 
 * @param refresh_token - Valid refresh token
 * @returns Promise with new access token and expiration info
 * @throws Error if token refresh fails
 * 
 * @example
 * ```typescript
 * const response = await refreshToken('refresh_token_here');
 * console.log(response.access_token);
 * ```
 */
export const refreshToken = async (
  refresh_token: string
): Promise<RefreshResponse> => {
  try {
    const payload: RefreshRequest = { refresh_token };
    const response = await apiClient.post<RefreshResponse>('/auth/refresh', payload);
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

/**
 * Get current user's profile
 * Requires valid Bearer token in Authorization header
 * 
 * @returns Promise with complete user profile including preferences and stats
 * @throws Error if request fails
 * 
 * @example
 * ```typescript
 * const profile = await getCurrentUser();
 * console.log(profile.full_name, profile.role);
 * ```
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

/**
 * Authentication API object with all methods
 * Provides a convenient way to access all auth-related API calls
 * 
 * @example
 * ```typescript
 * import { authApi } from './api/auth';
 * 
 * const loginResponse = await authApi.login('user@example.com', 'password');
 * const profile = await authApi.getCurrentUser();
 * await authApi.logout();
 * ```
 */
export const authApi = {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
};

export default authApi;
