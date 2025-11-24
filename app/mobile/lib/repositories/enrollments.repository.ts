/**
 * Enrollments Repository
 * 
 * Handles enrollment-related API calls.
 * Provides methods to manage student enrollments.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  Enrollment,
  CreateEnrollmentRequest,
  DeleteEnrollmentResponse,
} from "../api/types";

export class EnrollmentsRepository {
  /**
   * Get user's enrollments
   * 
   * @param semesterId - Optional semester ID (defaults to current)
   * 
   * Why: Returns enrollment data that any client can render.
   * The JSON structure is platform-agnostic.
   */
  async getEnrollments(semesterId?: string): Promise<Enrollment[]> {
    const url = semesterId
      ? `${API_ENDPOINTS.ENROLLMENTS.LIST}?semester_id=${semesterId}`
      : API_ENDPOINTS.ENROLLMENTS.LIST;

    return apiClient.get<Enrollment[]>(url);
  }

  /**
   * Register for a section
   * 
   * Why: Simple POST request that works identically for all clients.
   * The request/response format is standard JSON.
   */
  async createEnrollment(
    request: CreateEnrollmentRequest
  ): Promise<Enrollment> {
    return apiClient.post<Enrollment>(
      API_ENDPOINTS.ENROLLMENTS.CREATE,
      request
    );
  }

  /**
   * Drop an enrollment
   * 
   * @param enrollmentId - Enrollment ID to drop
   * 
   * Why: Standard DELETE operation that all HTTP clients support.
   */
  async deleteEnrollment(
    enrollmentId: string
  ): Promise<DeleteEnrollmentResponse> {
    return apiClient.delete<DeleteEnrollmentResponse>(
      API_ENDPOINTS.ENROLLMENTS.DELETE(enrollmentId)
    );
  }
}

export const enrollmentsRepository = new EnrollmentsRepository();

