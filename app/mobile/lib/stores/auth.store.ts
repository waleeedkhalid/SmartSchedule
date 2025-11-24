/**
 * Authentication Store
 * 
 * Manages authentication state using Zustand.
 * This store is used by UI components to access auth state and perform auth operations.
 * 
 * Why this supports reusability: The same store pattern can be used in React Native
 * with Zustand, or adapted for Redux, MobX, or native state management solutions.
 */

import { create } from "zustand";
import { authRepository } from "../repositories/auth.repository";
import type { UserResponse, LoginRequest } from "../api/types";

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication store
 * 
 * Why: Centralized auth state that any UI component can access.
 * The same pattern works for PWA, React Native, and can be adapted for native apps.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  /**
   * Login action
   * 
   * Why: Uses repository pattern, so UI doesn't know about HTTP details.
   * Same login flow works for all client platforms.
   */
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authRepository.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Logout action
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authRepository.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Even if logout fails, clear local state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Check authentication status
   * 
   * Why: Used on app startup to restore auth state.
   * Works the same way for all client platforms.
   */
  checkAuth: async () => {
    if (!authRepository.isAuthenticated()) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authRepository.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Token is invalid, clear auth state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

