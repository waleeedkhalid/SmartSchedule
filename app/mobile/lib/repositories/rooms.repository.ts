/**
 * Rooms Repository
 * 
 * Handles room-related API calls.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Room } from "../api/types";

export class RoomsRepository {
    /**
     * Get all rooms
     */
    async getRooms(): Promise<Room[]> {
        return apiClient.get<Room[]>(API_ENDPOINTS.ROOMS.LIST);
    }
}

export const roomsRepository = new RoomsRepository();
