import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial State
  user: null,
  token: null,
  isAuthenticated: false,

  // Actions
  setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
  setToken: (token: string | null) => set({ token }),
  
  login: (user: User, token: string) => 
    set({ 
      user, 
      token, 
      isAuthenticated: true 
    }),
    
  logout: () => 
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    }),
}));
