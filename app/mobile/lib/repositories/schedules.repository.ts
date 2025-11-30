/**
 * Schedules Repository
 * 
 * Handles schedule-related API calls.
 * Provides methods to fetch user schedules.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { StudentSchedule, FacultySchedule } from "../api/types";

export class SchedulesRepository {
  /**
   * Get current user's schedule
   * 
   * @param semesterId - Optional semester ID (defaults to current)
   * 
   * Why: Returns schedule data that can be rendered by any client.
   * The structure is role-aware (student vs faculty) but the format
   * is consistent JSON that any platform can parse.
   */
  async getMySchedule(semesterId?: string): Promise<
    StudentSchedule | FacultySchedule
  > {
    const url = semesterId
      ? `${API_ENDPOINTS.SCHEDULES.ME}?semester_id=${semesterId}`
      : API_ENDPOINTS.SCHEDULES.ME;

    return apiClient.get<StudentSchedule | FacultySchedule>(url);
  }
  /**
   * Generate schedule
   */
  async generateSchedule(termId: string): Promise<{ job_id: string }> {
    return apiClient.post<{ job_id: string }>(API_ENDPOINTS.SCHEDULES.GENERATE, { term_id: termId });
  }

  /**
   * Get generation status
   */
  async getGenerationStatus(jobId: string): Promise<{ status: string; progress: number; message?: string }> {
    return apiClient.get<{ status: string; progress: number; message?: string }>(
      `${API_ENDPOINTS.SCHEDULES.STATUS}?job_id=${jobId}`
    );
  }
}

export const schedulesRepository = new SchedulesRepository();

