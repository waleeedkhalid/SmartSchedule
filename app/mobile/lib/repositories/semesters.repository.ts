/**
 * Academic Terms Repository (formerly Semesters)
 * 
 * Handles academic term-related API calls.
 * Provides methods to fetch terms and current term.
 * 
 * NOTE: This repository still uses "semester" naming for backward compatibility,
 * but internally uses academic_term endpoints.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Semester } from "../api/types";

export class SemestersRepository {
  /**
   * Get all academic terms (backward compatible as "semesters")
   * 
   * @param currentOnly - If true, returns only the current active term
   */
  async getSemesters(currentOnly: boolean = false): Promise<Semester[]> {
    // Use backward-compatible semesters endpoint
    const url = currentOnly
      ? `${API_ENDPOINTS.SEMESTERS.LIST}?current=true`
      : API_ENDPOINTS.SEMESTERS.LIST;

    return apiClient.get<Semester[]>(url);
  }

  /**
   * Get current active term (backward compatible as "semester")
   * 
   * Why: Convenience method that clients use frequently.
   * The same endpoint works for all platforms.
   */
  async getCurrentSemester(): Promise<Semester | null> {
    // Use backward-compatible semesters/current endpoint
    // This endpoint internally uses academic_term
    return apiClient.get<Semester | null>(API_ENDPOINTS.SEMESTERS.CURRENT);
  }
}

export const semestersRepository = new SemestersRepository();

