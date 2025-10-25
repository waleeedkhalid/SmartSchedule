// import { TimeSlot, FacultyAvailability } from "@/types";

// /**
//  * TimeSlotManager - Phase 2: Data Services
//  *
//  * Manages time windows and detects scheduling conflicts:
//  * - Time slot overlap detection
//  * - Faculty availability checking
//  * - Room conflict detection
//  * - Exam scheduling constraints
//  */
// export class TimeSlotManager {
//   private readonly DAYS_OF_WEEK = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//   ] as const;

//   private readonly TIME_SLOTS = [
//     "08:00",
//     "09:00",
//     "10:00",
//     "11:00",
//     "12:00",
//     "13:00",
//     "14:00",
//     "15:00",
//     "16:00",
//     "17:00",
//   ] as const;

//   /**
//    * Check if two time slots overlap
//    */
//   doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
//     // Different days don't overlap
//     if (slot1.day !== slot2.day) {
//       return false;
//     }

//     // Convert times to minutes for easier comparison
//     const start1 = this.timeToMinutes(slot1.startTime);
//     const end1 = this.timeToMinutes(slot1.endTime);
//     const start2 = this.timeToMinutes(slot2.startTime);
//     const end2 = this.timeToMinutes(slot2.endTime);

//     // Check for overlap: slot1 ends after slot2 starts AND slot1 starts before slot2 ends
//     return end1 > start2 && start1 < end2;
//   }

//   /**
//    * Check if a time slot conflicts with any slots in a collection
//    */
//   hasConflict(slot: TimeSlot, existingSlots: TimeSlot[]): boolean {
//     return existingSlots.some((existing) =>
//       this.doTimeSlotsOverlap(slot, existing)
//     );
//   }

//   /**
//    * Check if faculty is available at a specific time slot
//    */
//   isFacultyAvailable(faculty: FacultyAvailability, slot: TimeSlot): boolean {
//     return faculty.availableSlots.some(
//       (availableSlot) =>
//         availableSlot.day === slot.day &&
//         this.doTimeSlotsOverlap(slot, availableSlot)
//     );
//   }

//   /**
//    * Get all available time slots for a faculty member
//    */
//   getFacultyAvailableSlots(faculty: FacultyAvailability): TimeSlot[] {
//     return faculty.availableSlots;
//   }

//   /**
//    * Find available faculty for a specific time slot
//    */
//   getAvailableFacultyAtTime(
//     faculty: FacultyAvailability[],
//     slot: TimeSlot
//   ): FacultyAvailability[] {
//     return faculty.filter((f) => this.isFacultyAvailable(f, slot));
//   }

//   /**
//    * Generate all possible time slots for a given duration
//    */
//   generateTimeSlots(durationHours: number = 1): TimeSlot[] {
//     const slots: TimeSlot[] = [];

//     for (const day of this.DAYS_OF_WEEK) {
//       for (const startTime of this.TIME_SLOTS) {
//         const startMinutes = this.timeToMinutes(startTime);
//         const endMinutes = startMinutes + durationHours * 60;
//         const endTime = this.minutesToTime(endMinutes);

//         // Skip if end time goes beyond 18:00 (6 PM)
//         if (endMinutes > this.timeToMinutes("18:00")) {
//           continue;
//         }

//         slots.push({
//           day,
//           startTime,
//           endTime,
//         });
//       }
//     }

//     return slots;
//   }

//   /**
//    * Get time slots that don't conflict with existing schedule
//    */
//   getAvailableSlots(
//     existingSlots: TimeSlot[],
//     durationHours: number = 1
//   ): TimeSlot[] {
//     const allSlots = this.generateTimeSlots(durationHours);
//     return allSlots.filter((slot) => !this.hasConflict(slot, existingSlots));
//   }

//   /**
//    * Calculate total hours for a collection of time slots
//    */
//   calculateTotalHours(slots: TimeSlot[]): number {
//     return slots.reduce((total, slot) => {
//       const start = this.timeToMinutes(slot.startTime);
//       const end = this.timeToMinutes(slot.endTime);
//       return total + (end - start) / 60;
//     }, 0);
//   }

//   /**
//    * Check if a faculty member's schedule exceeds their max hours
//    */
//   exceedsMaxHours(
//     faculty: FacultyAvailability,
//     assignedSlots: TimeSlot[]
//   ): boolean {
//     const totalHours = this.calculateTotalHours(assignedSlots);
//     return totalHours > faculty.maxTeachingHours;
//   }

//   /**
//    * Get faculty utilization percentage
//    */
//   getFacultyUtilization(
//     faculty: FacultyAvailability,
//     assignedSlots: TimeSlot[]
//   ): number {
//     const assignedHours = this.calculateTotalHours(assignedSlots);
//     const maxHours = faculty.maxTeachingHours;
//     return maxHours > 0 ? (assignedHours / maxHours) * 100 : 0;
//   }

//   /**
//    * Validate that a collection of time slots don't have internal conflicts
//    */
//   validateSlotCollection(slots: TimeSlot[]): {
//     valid: boolean;
//     conflicts: Array<{ slot1: TimeSlot; slot2: TimeSlot }>;
//   } {
//     const conflicts: Array<{ slot1: TimeSlot; slot2: TimeSlot }> = [];

//     for (let i = 0; i < slots.length; i++) {
//       for (let j = i + 1; j < slots.length; j++) {
//         if (this.doTimeSlotsOverlap(slots[i], slots[j])) {
//           conflicts.push({ slot1: slots[i], slot2: slots[j] });
//         }
//       }
//     }

//     return {
//       valid: conflicts.length === 0,
//       conflicts,
//     };
//   }

//   /**
//    * Group time slots by day
//    */
//   groupSlotsByDay(slots: TimeSlot[]): Record<string, TimeSlot[]> {
//     const grouped: Record<string, TimeSlot[]> = {};

//     for (const slot of slots) {
//       if (!grouped[slot.day]) {
//         grouped[slot.day] = [];
//       }
//       grouped[slot.day].push(slot);
//     }

//     return grouped;
//   }

//   /**
//    * Find optimal time slots for a course (prefer morning slots)
//    */
//   findOptimalSlots(
//     availableSlots: TimeSlot[],
//     count: number,
//     preferMorning: boolean = true
//   ): TimeSlot[] {
//     // Sort by preference (morning first if preferMorning is true)
//     const sorted = availableSlots.sort((a, b) => {
//       const timeA = this.timeToMinutes(a.startTime);
//       const timeB = this.timeToMinutes(b.startTime);

//       if (preferMorning) {
//         // Prefer earlier times
//         return timeA - timeB;
//       } else {
//         // Prefer later times
//         return timeB - timeA;
//       }
//     });

//     return sorted.slice(0, count);
//   }

//   // Helper methods for time conversion
//   private timeToMinutes(time: string): number {
//     const [hours, minutes] = time.split(":").map(Number);
//     return hours * 60 + minutes;
//   }

//   private minutesToTime(minutes: number): string {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours.toString().padStart(2, "0")}:${mins
//       .toString()
//       .padStart(2, "0")}`;
//   }
// }
