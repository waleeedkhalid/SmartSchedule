/**
 * Sections Repository
 * 
 * Handles section-related API calls.
 * Provides methods to fetch sections with various filters.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Section } from "../api/types";

export interface SectionsFilters {
  semester_id?: string; // Backward compatible - maps to term_id
  term_id?: string; // New preferred parameter
  level?: number;
  state?: "draft" | "released";
  courseCode?: string;
  instructorId?: string;
  sectionType?: string;
}

export class SectionsRepository {
  /**
   * Get sections with optional filters
   * 
   * Why: Flexible filtering that works identically across all clients.
   * Query parameters are standard HTTP, so any client can use them.
   */
  async getSections(filters?: SectionsFilters): Promise<Section[]> {
    const params = new URLSearchParams();

    // Support both term_id and semester_id for backward compatibility
    if (filters?.term_id) {
      params.append("term_id", filters.term_id);
    } else if (filters?.semester_id) {
      params.append("semester_id", filters.semester_id);
    }
    if (filters?.level !== undefined) {
      params.append("level", filters.level.toString());
    }
    if (filters?.state) {
      params.append("state", filters.state);
    }
    if (filters?.courseCode) {
      params.append("courseCode", filters.courseCode);
    }
    if (filters?.instructorId) {
      params.append("instructorId", filters.instructorId);
    }
    if (filters?.sectionType) {
      params.append("sectionType", filters.sectionType);
    }

    const url = params.toString()
      ? `${API_ENDPOINTS.SECTIONS.LIST}?${params.toString()}`
      : API_ENDPOINTS.SECTIONS.LIST;

    return apiClient.get<Section[]>(url);
  }

  /**
   * Get section details by ID
   */
  async getSection(id: string): Promise<Section> {
    return apiClient.get<Section>(API_ENDPOINTS.SECTIONS.DETAIL(id));
  }

  /**
   * Update a section
   */
  async updateSection(id: string, section: Partial<Section>): Promise<Section> {
    return apiClient.patch<Section>(API_ENDPOINTS.SECTIONS.UPDATE(id), section);
  }
}

export const sectionsRepository = new SectionsRepository();

