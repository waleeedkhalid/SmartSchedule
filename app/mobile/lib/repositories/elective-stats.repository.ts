/**
 * Elective Stats Repository
 * 
 * Handles elective statistics API calls.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export interface ElectiveStat {
  course_code: string;
  course_name: string;
  demand: number;
  capacity: number;
}

export class ElectiveStatsRepository {
  /**
   * Get elective statistics
   */
  async getStats(): Promise<ElectiveStat[]> {
    return apiClient.get<ElectiveStat[]>(API_ENDPOINTS.ELECTIVE_STATS.GET);
  }
}

export const electiveStatsRepository = new ElectiveStatsRepository();
