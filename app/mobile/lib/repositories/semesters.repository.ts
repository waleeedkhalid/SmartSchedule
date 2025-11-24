/**
 * Semesters Repository
 * 
 * Handles semester-related API calls.
 * Provides methods to fetch semesters and current semester.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Semester } from "../api/types";

export class SemestersRepository {
  /**
   * Get all semesters
   * 
   * @param currentOnly - If true, returns only the current active semester
   */
  async getSemesters(currentOnly: boolean = false): Promise<Semester[]> {
    const url = currentOnly
      ? `${API_ENDPOINTS.SEMESTERS.LIST}?current=true`
      : API_ENDPOINTS.SEMESTERS.LIST;

    return apiClient.get<Semester[]>(url);
  }

  /**
   * Get current active semester
   * 
   * Why: Convenience method that clients use frequently.
   * The same endpoint works for all platforms.
   */
  async getCurrentSemester(): Promise<Semester | null> {
    return apiClient.get<Semester | null>(API_ENDPOINTS.SEMESTERS.CURRENT);
  }
}

export const semestersRepository = new SemestersRepository();

