/**
 * Authentication-related TypeScript types
 * Centralized type definitions for authentication API requests and responses
 */

/**
 * User role types
 */
export type UserRole = 'student' | 'educator' | 'researcher';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // seconds (900 = 15 minutes)
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

/**
 * Registration response from API
 */
export interface RegisterResponse {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

/**
 * Token refresh request payload
 */
export interface RefreshRequest {
  refresh_token: string;
}

/**
 * Token refresh response from API
 */
export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: string;
  language: string;
  notifications_enabled: boolean;
}

/**
 * User statistics
 */
export interface UserStats {
  total_sessions: number;
  algorithms_explored: number;
  total_execution_time: number;
}

/**
 * Complete user profile from /users/me endpoint
 */
export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  last_login: string;
  preferences: UserPreferences;
  stats: UserStats;
}

/**
 * API error response structure
 */
export interface ApiError {
  detail: string;
  status?: number;
}
