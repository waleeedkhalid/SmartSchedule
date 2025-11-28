/**
 * Academic Plan Repository
 * 
 * Handles academic plan API calls.
 * Provides methods to fetch courses organized by level.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export interface AcademicPlanCourse {
  code: string;
  name: string;
  credits: number;
  level: number;
  course_type: "required" | "elective";
  created_at?: string;
}

export class AcademicPlanRepository {
  /**
   * Get all courses for academic plan
   * 
   * Returns courses organized by level with course type (required/elective).
   */
  async getCourses(): Promise<AcademicPlanCourse[]> {
    return apiClient.get<AcademicPlanCourse[]>(API_ENDPOINTS.ACADEMIC_PLAN.LIST);
  }
}

export const academicPlanRepository = new AcademicPlanRepository();

