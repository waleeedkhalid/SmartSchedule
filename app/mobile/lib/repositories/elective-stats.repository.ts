/**
 * Elective Stats Repository
 * 
 * Handles elective statistics API calls.
 * Provides methods to fetch aggregated elective preference statistics.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export interface ElectivePreferenceStat {
  course_code: string;
  course_title: string;
  level: number | null;
  total_requests: number;
  first_choice: number;
  second_choice: number;
  third_choice: number;
  other_choice: number;
}

export interface ElectiveStatsSummary {
  totalRequests: number;
  totalFirstChoice: number;
  totalCourses: number;
  avgRequestsPerCourse: number;
}

export interface ElectiveStatsResponse {
  stats: ElectivePreferenceStat[];
  summary: ElectiveStatsSummary;
}

export class ElectiveStatsRepository {
  /**
   * Get aggregated elective preference statistics
   * 
   * Returns statistics grouped by course with summary data.
   * Only accessible by scheduling role.
   */
  async getStats(): Promise<ElectiveStatsResponse> {
    return apiClient.get<ElectiveStatsResponse>(API_ENDPOINTS.ELECTIVE_STATS.GET);
  }
}

export const electiveStatsRepository = new ElectiveStatsRepository();

