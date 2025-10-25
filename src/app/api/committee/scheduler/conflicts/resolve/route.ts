/**
 * Conflict Resolution API
 * Auto-resolve and manually resolve schedule conflicts
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
import type { ScheduleConflict, ScheduledSection } from "@/types/scheduler";

/**
 * POST /api/committee/scheduler/conflicts/resolve
 * Resolve a conflict (auto or manual)
 * 
 * Body:
 * {
 *   conflict: ScheduleConflict;
 *   all_sections: ScheduledSection[];
 *   resolution_type: 'auto' | 'manual';
 *   manual_action?: {
 *     section_id: string;
 *     new_time_slot?: { day: string; start_time: string; end_time: string };
 *     new_room?: string;
 *     new_instructor?: string;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  try {
    const body = await request.json();
    const {
      conflict,
      all_sections,
      resolution_type,
      manual_action,
    } = body;

    // Validate required fields
    if (!conflict || !all_sections || !resolution_type) {
      return validationErrorResponse({
        message: "conflict, all_sections, and resolution_type are required",
      });
    }

    const resolutionEngine = new ConflictResolutionEngine();

    if (resolution_type === "auto") {
      // Attempt auto-resolution
      const result = await resolutionEngine.autoResolveConflict(conflict, all_sections);

      if (!result.success) {
        return errorResponse(result.message, 400);
      }

      // If auto-resolution successful, apply the action
      if (result.action?.action) {
        const { sectionId, newTimeSlot, newRoom, newInstructor } = result.action.action;

        // Update the section in database
        const updateData: Record<string, unknown> = {};
        if (newRoom) updateData.room_number = newRoom;
        if (newInstructor) updateData.instructor_id = newInstructor;

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from("scheduler_sections")
            .update(updateData)
            .eq("id", sectionId);

          if (updateError) {
            return errorResponse(`Failed to update section: ${updateError.message}`);
          }
        }

        // If time slot changed, update time slots
        if (newTimeSlot) {
          // Delete existing time slots
          await supabase
            .from("section_time_slots")
            .delete()
            .eq("section_id", sectionId);

          // Insert new time slot
          const { error: timeSlotError } = await supabase
            .from("section_time_slots")
            .insert({
              section_id: sectionId,
              day: newTimeSlot.day,
              start_time: newTimeSlot.start_time,
              end_time: newTimeSlot.end_time,
            });

          if (timeSlotError) {
            return errorResponse(`Failed to update time slot: ${timeSlotError.message}`);
          }
        }

        // Mark conflict as resolved
        if (conflict.id) {
          await supabase
            .from("schedule_conflicts")
            .update({
              resolved: true,
              resolved_by: user.id,
              resolved_at: new Date().toISOString(),
              resolution_notes: result.message,
            })
            .eq("id", conflict.id);
        }

        return successResponse({
          resolved: true,
          action: result.action,
          message: result.message,
        });
      }

      return errorResponse("Auto-resolution failed: No action generated", 400);
    } else if (resolution_type === "manual") {
      // Apply manual resolution
      if (!manual_action) {
        return validationErrorResponse({
          message: "manual_action is required for manual resolution",
        });
      }

      const { section_id, new_time_slot, new_room, new_instructor } = manual_action;

      // Update the section
      const updateData: Record<string, unknown> = {};
      if (new_room) updateData.room_number = new_room;
      if (new_instructor) updateData.instructor_id = new_instructor;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("scheduler_sections")
          .update(updateData)
          .eq("id", section_id);

        if (updateError) {
          return errorResponse(`Failed to update section: ${updateError.message}`);
        }
      }

      // If time slot changed, update time slots
      if (new_time_slot) {
        // Delete existing time slots
        await supabase
          .from("section_time_slots")
          .delete()
          .eq("section_id", section_id);

        // Insert new time slot
        const { error: timeSlotError } = await supabase
          .from("section_time_slots")
          .insert({
            section_id: section_id,
            day: new_time_slot.day,
            start_time: new_time_slot.start_time,
            end_time: new_time_slot.end_time,
          });

        if (timeSlotError) {
          return errorResponse(`Failed to update time slot: ${timeSlotError.message}`);
        }
      }

      // Mark conflict as resolved
      if (conflict.id) {
        await supabase
          .from("schedule_conflicts")
          .update({
            resolved: true,
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
            resolution_notes: "Manually resolved",
          })
          .eq("id", conflict.id);
      }

      return successResponse({
        resolved: true,
        message: "Conflict manually resolved successfully",
      });
    }

    return validationErrorResponse({
      message: "Invalid resolution_type. Must be 'auto' or 'manual'",
    });
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/conflicts/resolve:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

