/**
 * Conflict Resolution Suggestions API
 * Get alternative time slots and rooms for conflict resolution
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";
import { ConflictResolutionEngine } from "@/lib/schedule/ConflictResolutionEngine";
import type { ScheduledSection, SectionTimeSlot } from "@/types/scheduler";

/**
 * POST /api/committee/scheduler/conflicts/suggestions
 * Get alternative suggestions for conflict resolution
 * 
 * Body:
 * {
 *   section: ScheduledSection;
 *   occupied_slots: SectionTimeSlot[];
 *   occupied_rooms?: string[];
 *   required_capacity?: number;
 *   suggestion_type: 'time' | 'room' | 'both';
 * }
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const {
      section,
      occupied_slots = [],
      occupied_rooms = [],
      required_capacity = 30,
      suggestion_type = "both",
    } = body;

    // Validate required fields
    if (!section) {
      return validationErrorResponse({
        message: "section is required",
      });
    }

    const resolutionEngine = new ConflictResolutionEngine();
    const suggestions: {
      time_slots?: Array<{
        day: string;
        start_time: string;
        end_time: string;
        score: number;
        reason: string;
      }>;
      rooms?: Array<{
        room_number: string;
        capacity: number;
        score: number;
        reason: string;
      }>;
    } = {};

    // Get time slot suggestions
    if (suggestion_type === "time" || suggestion_type === "both") {
      suggestions.time_slots = resolutionEngine.suggestAlternativeTimeSlots(
        section,
        occupied_slots,
        10
      );
    }

    // Get room suggestions
    if (suggestion_type === "room" || suggestion_type === "both") {
      const occupiedRoomSet = new Set(occupied_rooms);
      suggestions.rooms = resolutionEngine.suggestAlternativeRooms(
        section,
        occupiedRoomSet,
        required_capacity,
        10
      );
    }

    return successResponse({
      section_id: section.section_id,
      course_code: section.course_code,
      suggestions,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/conflicts/suggestions:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

