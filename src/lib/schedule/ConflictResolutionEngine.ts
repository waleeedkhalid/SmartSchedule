/**
 * ConflictResolutionEngine - Phase 5: Conflict Resolution
 * 
 * Provides automated and semi-automated conflict resolution:
 * - Suggests alternative time slots
 * - Suggests alternative rooms
 * - Auto-resolves simple conflicts
 * - Provides manual resolution options
 */

import { TimeSlotManager } from "./TimeSlotManager";
import type {
  ScheduleConflict,
  ScheduledSection,
  SectionTimeSlot,
  SchedulerSection,
} from "@/types/scheduler";
import type { DayOfWeek } from "@/types/database";

export interface AlternativeTimeSlot {
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  score: number; // 0-100, higher is better
  reason: string;
}

export interface AlternativeRoom {
  room_number: string;
  capacity: number;
  score: number; // 0-100, higher is better
  reason: string;
}

export interface ResolutionOption {
  type: 'change_time' | 'change_room' | 'change_instructor' | 'add_section' | 'manual';
  description: string;
  impact: 'low' | 'medium' | 'high';
  autoResolvable: boolean;
  action?: {
    sectionId: string;
    newTimeSlot?: AlternativeTimeSlot;
    newRoom?: string;
    newInstructor?: string;
  };
}

export class ConflictResolutionEngine {
  private timeManager: TimeSlotManager;

  // Available time slots (standard university schedule)
  private readonly STANDARD_TIME_SLOTS: Array<{ start: string; end: string }> = [
    { start: "08:00", end: "09:30" },
    { start: "09:45", end: "11:15" },
    { start: "11:30", end: "13:00" },
    { start: "13:00", end: "14:30" },
    { start: "14:45", end: "16:15" },
    { start: "16:30", end: "18:00" },
  ];

  private readonly DAYS_OF_WEEK: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
  ];

  // Available rooms
  private readonly AVAILABLE_ROOMS = [
    { number: "CCIS 1A101", capacity: 35 },
    { number: "CCIS 1A102", capacity: 35 },
    { number: "CCIS 1A103", capacity: 35 },
    { number: "CCIS 1A104", capacity: 35 },
    { number: "CCIS 1B101", capacity: 30 },
    { number: "CCIS 1B102", capacity: 30 },
    { number: "CCIS 1B103", capacity: 30 },
    { number: "CCIS 1B104", capacity: 30 },
    { number: "CCIS 2A101", capacity: 40 },
    { number: "CCIS 2A102", capacity: 40 },
    { number: "CCIS 2A103", capacity: 40 },
    { number: "CCIS 2A104", capacity: 40 },
  ];

  constructor() {
    this.timeManager = new TimeSlotManager();
  }

  // =====================================================
  // ALTERNATIVE TIME SLOT SUGGESTIONS
  // =====================================================

  /**
   * Suggest alternative time slots for a section
   */
  suggestAlternativeTimeSlots(
    section: ScheduledSection,
    occupiedSlots: SectionTimeSlot[],
    maxSuggestions: number = 5
  ): AlternativeTimeSlot[] {
    const alternatives: AlternativeTimeSlot[] = [];
    const currentDuration = this.calculateDuration(
      section.time_slots[0].start_time,
      section.time_slots[0].end_time
    );

    // Try each day and time combination
    for (const day of this.DAYS_OF_WEEK) {
      for (const timeSlot of this.STANDARD_TIME_SLOTS) {
        const slotDuration = this.calculateDuration(timeSlot.start, timeSlot.end);

        // Skip if duration doesn't match
        if (Math.abs(slotDuration - currentDuration) > 15) {
          continue;
        }

        const proposedSlot: SectionTimeSlot = {
          id: "",
          section_id: section.section_id,
          day,
          start_time: timeSlot.start,
          end_time: timeSlot.end,
        };

        // Check if this slot conflicts with occupied slots
        const hasConflict = occupiedSlots.some((occupied) =>
          this.checkSectionTimeSlotsOverlap(proposedSlot, occupied)
        );

        if (!hasConflict) {
          const score = this.calculateTimeSlotScore(proposedSlot, section);
          alternatives.push({
            day,
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            score,
            reason: this.getTimeSlotReason(score),
          });
        }
      }
    }

    // Sort by score and return top suggestions
    return alternatives
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }

  /**
   * Calculate score for a time slot (0-100)
   */
  private calculateTimeSlotScore(slot: SectionTimeSlot, section: ScheduledSection): number {
    let score = 70; // Base score

    // Prefer mid-day slots (10:00-14:00)
    const startMinutes = this.timeToMinutes(slot.start_time);
    if (startMinutes >= 600 && startMinutes <= 840) {
      score += 20;
    } else if (startMinutes < 540 || startMinutes > 960) {
      score -= 20; // Penalize very early or very late
    }

    // Prefer middle of week (Tuesday, Wednesday)
    if (slot.day === "TUESDAY" || slot.day === "WEDNESDAY") {
      score += 10;
    } else if (slot.day === "SUNDAY" || slot.day === "THURSDAY") {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get reason for time slot score
   */
  private getTimeSlotReason(score: number): string {
    if (score >= 90) return "Optimal time - mid-week, mid-day";
    if (score >= 80) return "Good time - convenient for most students";
    if (score >= 70) return "Acceptable time - standard schedule";
    if (score >= 60) return "Fair time - may require adjustment";
    return "Less ideal - early morning or late afternoon";
  }

  // =====================================================
  // ALTERNATIVE ROOM SUGGESTIONS
  // =====================================================

  /**
   * Suggest alternative rooms for a section
   */
  suggestAlternativeRooms(
    section: ScheduledSection,
    occupiedRooms: Set<string>,
    requiredCapacity: number,
    maxSuggestions: number = 5
  ): AlternativeRoom[] {
    const alternatives: AlternativeRoom[] = [];

    for (const room of this.AVAILABLE_ROOMS) {
      // Skip if room is occupied or too small
      if (occupiedRooms.has(room.number) || room.capacity < requiredCapacity) {
        continue;
      }

      const score = this.calculateRoomScore(room, requiredCapacity);
      alternatives.push({
        room_number: room.number,
        capacity: room.capacity,
        score,
        reason: this.getRoomReason(room, requiredCapacity, score),
      });
    }

    // Sort by score and return top suggestions
    return alternatives
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }

  /**
   * Calculate score for a room (0-100)
   */
  private calculateRoomScore(
    room: { number: string; capacity: number },
    requiredCapacity: number
  ): number {
    let score = 70; // Base score

    // Prefer rooms that match capacity well (not too big, not too small)
    const capacityRatio = room.capacity / requiredCapacity;
    if (capacityRatio >= 1.0 && capacityRatio <= 1.2) {
      score += 30; // Perfect fit
    } else if (capacityRatio > 1.2 && capacityRatio <= 1.5) {
      score += 20; // Good fit
    } else if (capacityRatio > 1.5) {
      score += 10; // Too big, but usable
    } else {
      score -= 50; // Too small
    }

    // Prefer first floor rooms (easier access)
    if (room.number.includes("1A") || room.number.includes("1B")) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get reason for room score
   */
  private getRoomReason(
    room: { number: string; capacity: number },
    requiredCapacity: number,
    score: number
  ): string {
    const capacityRatio = room.capacity / requiredCapacity;

    if (score >= 90) {
      return `Optimal match - capacity ${room.capacity} for ${requiredCapacity} students`;
    }
    if (score >= 80) {
      return `Good fit - ${Math.round((capacityRatio - 1) * 100)}% extra capacity`;
    }
    if (score >= 70) {
      return `Acceptable - room available and meets requirements`;
    }
    if (score >= 50) {
      return `Usable but oversized - ${room.capacity} capacity for ${requiredCapacity} students`;
    }
    return `Insufficient capacity`;
  }

  // =====================================================
  // RESOLUTION OPTIONS
  // =====================================================

  /**
   * Generate resolution options for a conflict
   */
  generateResolutionOptions(
    conflict: ScheduleConflict,
    allSections: ScheduledSection[]
  ): ResolutionOption[] {
    const options: ResolutionOption[] = [];

    switch (conflict.type) {
      case "time_overlap":
        options.push(...this.generateTimeConflictResolutions(conflict, allSections));
        break;

      case "room_conflict":
        options.push(...this.generateRoomConflictResolutions(conflict, allSections));
        break;

      case "faculty_conflict":
        options.push(...this.generateFacultyConflictResolutions(conflict, allSections));
        break;

      case "capacity_exceeded":
        options.push(...this.generateCapacityResolutions(conflict, allSections));
        break;

      case "exam_overlap":
        options.push(...this.generateExamConflictResolutions(conflict));
        break;

      default:
        // For other conflict types, provide manual resolution
        options.push({
          type: "manual",
          description: "Manual intervention required",
          impact: "high",
          autoResolvable: false,
        });
    }

    return options;
  }

  /**
   * Generate resolutions for time conflicts
   */
  private generateTimeConflictResolutions(
    conflict: ScheduleConflict,
    allSections: ScheduledSection[]
  ): ResolutionOption[] {
    const options: ResolutionOption[] = [];
    const affectedSections = conflict.affected_entities
      .filter((e) => e.type === "section")
      .map((e) => e.id);

    for (const sectionId of affectedSections) {
      const section = allSections.find((s) => s.section_id === sectionId);
      if (!section) continue;

      // Get all occupied time slots (excluding this section)
      const occupiedSlots = allSections
        .filter((s) => s.section_id !== sectionId)
        .flatMap((s) => s.time_slots);

      // Suggest alternative time slots
      const alternatives = this.suggestAlternativeTimeSlots(section, occupiedSlots, 3);

      alternatives.forEach((alt) => {
        options.push({
          type: "change_time",
          description: `Move ${section.course_code} to ${alt.day} ${alt.start_time}-${alt.end_time}`,
          impact: "medium",
          autoResolvable: alt.score >= 80,
          action: {
            sectionId,
            newTimeSlot: alt,
          },
        });
      });
    }

    return options;
  }

  /**
   * Generate resolutions for room conflicts
   */
  private generateRoomConflictResolutions(
    conflict: ScheduleConflict,
    allSections: ScheduledSection[]
  ): ResolutionOption[] {
    const options: ResolutionOption[] = [];
    const affectedSections = conflict.affected_entities
      .filter((e) => e.type === "section")
      .map((e) => e.id);

    for (const sectionId of affectedSections) {
      const section = allSections.find((s) => s.section_id === sectionId);
      if (!section) continue;

      // Get occupied rooms at this time
      const occupiedRooms = new Set(
        allSections
          .filter((s) => s.section_id !== sectionId && s.room_number)
          .filter((s) =>
            s.time_slots.some((slot) =>
              section.time_slots.some((sectionSlot) =>
                this.checkSectionTimeSlotsOverlap(slot, sectionSlot)
              )
            )
          )
          .map((s) => s.room_number!)
      );

      // Suggest alternative rooms
      const alternatives = this.suggestAlternativeRooms(
        section,
        occupiedRooms,
        section.section_id ? 30 : 25, // Assume default capacity
        3
      );

      alternatives.forEach((alt) => {
        options.push({
          type: "change_room",
          description: `Move ${section.course_code} to room ${alt.room_number}`,
          impact: "low",
          autoResolvable: alt.score >= 80,
          action: {
            sectionId,
            newRoom: alt.room_number,
          },
        });
      });
    }

    return options;
  }

  /**
   * Generate resolutions for faculty conflicts
   */
  private generateFacultyConflictResolutions(
    conflict: ScheduleConflict,
    allSections: ScheduledSection[]
  ): ResolutionOption[] {
    const options: ResolutionOption[] = [];

    // Option 1: Change time for one section
    options.push(...this.generateTimeConflictResolutions(conflict, allSections));

    // Option 2: Manual reassignment of instructor
    const affectedSections = conflict.affected_entities.filter((e) => e.type === "section");
    affectedSections.forEach((entity) => {
      options.push({
        type: "change_instructor",
        description: `Assign different instructor to ${entity.name}`,
        impact: "high",
        autoResolvable: false,
      });
    });

    return options;
  }

  /**
   * Generate resolutions for capacity violations
   */
  private generateCapacityResolutions(
    conflict: ScheduleConflict,
    allSections: ScheduledSection[]
  ): ResolutionOption[] {
    const options: ResolutionOption[] = [];

    options.push({
      type: "add_section",
      description: "Create an additional section to accommodate overflow",
      impact: "high",
      autoResolvable: false,
    });

    // Suggest room change to larger room
    const affectedSection = conflict.affected_entities.find((e) => e.type === "section");
    if (affectedSection) {
      const section = allSections.find((s) => s.section_id === affectedSection.id);
      if (section) {
        const largeRooms = this.AVAILABLE_ROOMS.filter((r) => r.capacity >= 40);
        largeRooms.forEach((room) => {
          options.push({
            type: "change_room",
            description: `Move to larger room ${room.number} (capacity ${room.capacity})`,
            impact: "low",
            autoResolvable: true,
            action: {
              sectionId: section.section_id,
              newRoom: room.number,
            },
          });
        });
      }
    }

    return options;
  }

  /**
   * Generate resolutions for exam conflicts
   */
  private generateExamConflictResolutions(conflict: ScheduleConflict): ResolutionOption[] {
    return [
      {
        type: "manual",
        description: "Reschedule one of the exams to a different date",
        impact: "high",
        autoResolvable: false,
      },
      {
        type: "manual",
        description: "Contact academic affairs for special arrangement",
        impact: "medium",
        autoResolvable: false,
      },
    ];
  }

  // =====================================================
  // AUTO-RESOLUTION
  // =====================================================

  /**
   * Attempt to auto-resolve a conflict
   */
  async autoResolveConflict(
    conflict: ScheduleConflict,
    allSections: ScheduledSection[]
  ): Promise<{
    success: boolean;
    action?: ResolutionOption;
    message: string;
  }> {
    // Only auto-resolve if marked as auto-resolvable
    if (!conflict.auto_resolvable) {
      return {
        success: false,
        message: "Conflict requires manual intervention",
      };
    }

    // Generate resolution options
    const options = this.generateResolutionOptions(conflict, allSections);
    const autoResolvableOption = options.find((opt) => opt.autoResolvable);

    if (!autoResolvableOption) {
      return {
        success: false,
        message: "No auto-resolvable options available",
      };
    }

    return {
      success: true,
      action: autoResolvableOption,
      message: `Auto-resolved: ${autoResolvableOption.description}`,
    };
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  /**
   * Check if two section time slots overlap
   */
  private checkSectionTimeSlotsOverlap(
    slot1: SectionTimeSlot,
    slot2: SectionTimeSlot
  ): boolean {
    if (slot1.day !== slot2.day) return false;

    const start1 = this.timeToMinutes(slot1.start_time);
    const end1 = this.timeToMinutes(slot1.end_time);
    const start2 = this.timeToMinutes(slot2.start_time);
    const end2 = this.timeToMinutes(slot2.end_time);

    return start1 < end2 && start2 < end1;
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate duration between two times in minutes
   */
  private calculateDuration(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return end - start;
  }
}

