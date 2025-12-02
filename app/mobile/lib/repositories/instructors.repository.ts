/**
 * Instructors Repository
 * 
 * Handles instructor-related API calls.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Instructor } from "../api/types";

export class InstructorsRepository {
    /**
     * Get all instructors
     */
    async getInstructors(): Promise<Instructor[]> {
        return apiClient.get<Instructor[]>(API_ENDPOINTS.INSTRUCTORS.LIST);
    }
}

export const instructorsRepository = new InstructorsRepository();
