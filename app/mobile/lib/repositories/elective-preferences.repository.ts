/**
 * Elective Preferences Repository
 * 
 * Handles elective preference API calls.
 * Provides methods to fetch and update student elective preferences.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export interface ElectivePreference {
  id: string;
  course_code: string;
  rank: number;
  course?: {
    code: string;
    title: string;
    recommended_level: number | null;
    credits: number;
    is_elective: boolean;
  };
}

export interface AvailableElective {
  code: string;
  title: string;
  recommended_level: number | null;
  credits: number;
  is_elective: boolean;
  weekly_hours?: number;
}

export interface ElectivePreferencesResponse {
  preferences: ElectivePreference[];
  availableElectives: AvailableElective[];
}

export interface UpdatePreferencesRequest {
  preferences: Array<{
    course_code: string;
    rank: number;
  }>;
}

export interface UpdatePreferencesResponse {
  message: string;
  preferences: ElectivePreference[];
}

export class ElectivePreferencesRepository {
  /**
   * Get student's preferences and available electives
   */
  async getPreferences(): Promise<ElectivePreferencesResponse> {
    return apiClient.get<ElectivePreferencesResponse>(API_ENDPOINTS.ELECTIVE_PREFERENCES.GET);
  }

  /**
   * Update student's preferences
   * 
   * @param preferences - Array of preferences with course_code and rank
   */
  async updatePreferences(preferences: UpdatePreferencesRequest["preferences"]): Promise<UpdatePreferencesResponse> {
    return apiClient.post<UpdatePreferencesResponse>(
      API_ENDPOINTS.ELECTIVE_PREFERENCES.UPDATE,
      { preferences }
    );
  }
}

export const electivePreferencesRepository = new ElectivePreferencesRepository();

