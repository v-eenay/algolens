import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string, refreshToken?: string, expiresIn?: number) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  isTokenExpired: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Actions
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
      setToken: (token: string | null) => set({ token }),
      
      login: (user: User, token: string, refreshToken?: string, expiresIn?: number) => {
        // Also persist token to a separate key if explicitly required by legacy logic
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        
        // Calculate expiration timestamp if expiresIn is provided
        const expiresAt = expiresIn
          ? Date.now() + expiresIn * 1000
          : null;
        
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          expiresAt,
          isAuthenticated: true
        });
      },
        
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false
        });
      },

      /**
       * Update access and refresh tokens
       * Used by the API client after successful token refresh
       */
      updateTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken);
        }
        
        set({
          token: accessToken,
          refreshToken,
          expiresAt,
        });
      },

      /**
       * Check if the current access token is expired
       * Returns true if token is expired or expiration time is not set
       */
      isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        
        // Add 30 second buffer to refresh before actual expiration
        return Date.now() >= expiresAt - 30000;
      },

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'algolens-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
