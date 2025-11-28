/**
 * Courses Repository
 * 
 * Handles course-related API calls.
 * Provides methods to fetch courses and course details.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Course } from "../api/types";

export class CoursesRepository {
  /**
   * Get all courses
   * 
   * Why: Returns list of courses that any client can display
   * in their native UI components (React, React Native, SwiftUI, Jetpack Compose).
   */
  async getCourses(): Promise<Course[]> {
    return apiClient.get<Course[]>(API_ENDPOINTS.COURSES.LIST);
  }

  /**
   * Get course details by code
   * 
   * @param code - Course code (e.g., "CS301")
   */
  async getCourse(code: string): Promise<Course> {
    return apiClient.get<Course>(API_ENDPOINTS.COURSES.DETAIL(code));
  }
}

export const coursesRepository = new CoursesRepository();

