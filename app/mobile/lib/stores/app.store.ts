/**
 * App Store
 * 
 * Manages application-level state (semesters, loading states, etc.).
 * This store provides shared state that multiple components can access.
 * 
 * Why this supports reusability: The same state management pattern
 * can be used across different client platforms.
 */

import { create } from "zustand";
import { semestersRepository } from "../repositories/semesters.repository";
import type { Semester } from "../api/types";

interface AppState {
  currentSemester: Semester | null;
  isLoadingSemester: boolean;
  semesterError: string | null;

  // Actions
  loadCurrentSemester: () => Promise<void>;
  setCurrentSemester: (semester: Semester | null) => void;
}

/**
 * App store
 * 
 * Why: Centralized app state that any component can access.
 * The same pattern works for PWA, React Native, and native apps.
 */
export const useAppStore = create<AppState>((set) => ({
  currentSemester: null,
  isLoadingSemester: false,
  semesterError: null,

  /**
   * Load current semester
   * 
   * Why: Uses repository pattern, so UI doesn't know about HTTP.
   * Same data fetching pattern works for all platforms.
   */
  loadCurrentSemester: async () => {
    set({ isLoadingSemester: true, semesterError: null });
    try {
      const semester = await semestersRepository.getCurrentSemester();
      set({
        currentSemester: semester,
        isLoadingSemester: false,
        semesterError: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load semester";
      set({
        currentSemester: null,
        isLoadingSemester: false,
        semesterError: errorMessage,
      });
    }
  },

  /**
   * Set current semester manually
   */
  setCurrentSemester: (semester: Semester | null) => {
    set({ currentSemester: semester });
  },
}));

