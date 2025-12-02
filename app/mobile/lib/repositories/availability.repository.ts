/**
 * Availability Repository
 * 
 * Handles faculty availability preferences.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export interface TimeSlot {
    day: string;
    start_time: string;
    end_time: string;
}

export interface AvailabilityPreference {
    id?: string;
    faculty_id?: string;
    available_slots: TimeSlot[];
    preferred_slots: TimeSlot[];
    unavailable_slots: TimeSlot[];
    notes?: string;
    updated_at?: string;
}

export class AvailabilityRepository {
    /**
     * Get faculty availability
     */
    async getAvailability(): Promise<AvailabilityPreference> {
        return apiClient.get<AvailabilityPreference>(API_ENDPOINTS.FACULTY_AVAILABILITY.GET);
    }

    /**
     * Update faculty availability
     */
    async updateAvailability(data: Partial<AvailabilityPreference>): Promise<AvailabilityPreference> {
        return apiClient.patch<AvailabilityPreference>(API_ENDPOINTS.FACULTY_AVAILABILITY.UPDATE, data);
    }
}

export const availabilityRepository = new AvailabilityRepository();
