/**
 * Change Request Validator
 * Validates teaching load change requests against irregular student requirements
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ChangeRequestValidationResult {
  isValid: boolean;
  error?: string;
  affectsIrregular: boolean;
  affectedStudents: string[];
  warnings?: string[];
}

interface TimeSlot {
  day: string;
  start_time: string;
  end_time: string;
}

/**
 * Validate a change request
 */
export async function validateChangeRequest(
  supabase: SupabaseClient,
  sectionId: string,
  requestType: string,
  changes: { from: any; to: any }
): Promise<ChangeRequestValidationResult> {
  try {
    // Get all irregular students who need this section
    const { data: irregularStudents, error: irregularError } = await supabase
      .from('irregular_students')
      .select(`
        student_id,
        required_courses,
        students:student_id (
          id,
          full_name,
          level
        )
      `);
    
    if (irregularError) {
      console.error('Error fetching irregular students:', irregularError);
      return {
        isValid: false,
        error: 'Failed to validate against irregular students',
        affectsIrregular: false,
        affectedStudents: [],
      };
    }
    
    // Get section details
    const { data: section, error: sectionError } = await supabase
      .from('section')
      .select(`
        section_id,
        course_code,
        capacity,
        instructor_id,
        room_number
      `)
      .eq('section_id', sectionId)
      .single();
    
    if (sectionError || !section) {
      return {
        isValid: false,
        error: 'Section not found',
        affectsIrregular: false,
        affectedStudents: [],
      };
    }
    
    // Find irregular students who need this course
    const affectedStudents: string[] = [];
    
    if (irregularStudents && irregularStudents.length > 0) {
      for (const irregular of irregularStudents) {
        const requiredCourses = irregular.required_courses as string[];
        if (requiredCourses && requiredCourses.includes(section.course_code)) {
          affectedStudents.push(irregular.student_id);
        }
      }
    }
    
    // If no irregular students affected, change is valid
    if (affectedStudents.length === 0) {
      return {
        isValid: true,
        affectsIrregular: false,
        affectedStudents: [],
      };
    }
    
    // Validate based on request type
    switch (requestType) {
      case 'REASSIGN_INSTRUCTOR':
        // Instructor changes don't affect irregular students
        return {
          isValid: true,
          affectsIrregular: true,
          affectedStudents,
          warnings: [
            `This section is required by ${affectedStudents.length} irregular student(s), but instructor changes don't affect their schedules.`
          ],
        };
      
      case 'CHANGE_TIME_SLOT':
        return await validateTimeSlotChange(
          supabase,
          sectionId,
          affectedStudents,
          changes.from.time_slots,
          changes.to.time_slots
        );
      
      case 'ADJUST_CAPACITY':
        return validateCapacityChange(
          affectedStudents,
          changes.from.capacity,
          changes.to.capacity
        );
      
      case 'CHANGE_ROOM':
        // Room changes don't affect irregular students
        return {
          isValid: true,
          affectsIrregular: true,
          affectedStudents,
          warnings: [
            `This section is required by ${affectedStudents.length} irregular student(s), but room changes don't affect their schedules.`
          ],
        };
      
      default:
        return {
          isValid: false,
          error: 'Unknown request type',
          affectsIrregular: false,
          affectedStudents: [],
        };
    }
    
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      error: 'Validation failed',
      affectsIrregular: false,
      affectedStudents: [],
    };
  }
}

/**
 * Validate time slot changes
 */
async function validateTimeSlotChange(
  supabase: SupabaseClient,
  sectionId: string,
  affectedStudents: string[],
  oldTimeSlots: TimeSlot[],
  newTimeSlots: TimeSlot[]
): Promise<ChangeRequestValidationResult> {
  try {
    // For each affected student, check if new time creates conflicts
    const conflictingStudents: string[] = [];
    const studentDetails: { id: string; name: string; conflicts: string[] }[] = [];
    
    for (const studentId of affectedStudents) {
      // Get student's current schedule
      const { data: studentSchedule, error: scheduleError } = await supabase
        .from('schedules')
        .select('data')
        .eq('student_id', studentId)
        .eq('is_published', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (scheduleError) {
        console.error('Error fetching student schedule:', scheduleError);
        continue;
      }
      
      if (!studentSchedule) {
        continue;
      }
      
      const scheduleData = studentSchedule.data as any;
      const sections = scheduleData?.sections || [];
      
      // Check for conflicts with new time slots
      const conflicts: string[] = [];
      
      for (const newSlot of newTimeSlots) {
        for (const existingSection of sections) {
          // Skip the section being changed
          if (existingSection.section_id === sectionId) {
            continue;
          }
          
          const existingTimeSlots = existingSection.time_slots || [];
          
          for (const existingSlot of existingTimeSlots) {
            if (timeSlotsOverlap(newSlot, existingSlot)) {
              conflicts.push(
                `${existingSection.course_code} (${existingSlot.day} ${existingSlot.start_time}-${existingSlot.end_time})`
              );
            }
          }
        }
      }
      
      if (conflicts.length > 0) {
        conflictingStudents.push(studentId);
        
        // Get student name
        const { data: student } = await supabase
          .from('students')
          .select('full_name')
          .eq('id', studentId)
          .single();
        
        studentDetails.push({
          id: studentId,
          name: student?.full_name || 'Unknown',
          conflicts,
        });
      }
    }
    
    if (conflictingStudents.length > 0) {
      const conflictMessages = studentDetails.map(
        s => `${s.name}: conflicts with ${s.conflicts.join(', ')}`
      );
      
      return {
        isValid: false,
        error: `Time slot change would create conflicts for ${conflictingStudents.length} irregular student(s): ${conflictMessages.join('; ')}`,
        affectsIrregular: true,
        affectedStudents: conflictingStudents,
      };
    }
    
    return {
      isValid: true,
      affectsIrregular: true,
      affectedStudents,
      warnings: [
        `Time slot change verified for ${affectedStudents.length} irregular student(s) - no conflicts detected.`
      ],
    };
    
  } catch (error) {
    console.error('Time slot validation error:', error);
    return {
      isValid: false,
      error: 'Failed to validate time slot change',
      affectsIrregular: true,
      affectedStudents,
    };
  }
}

/**
 * Validate capacity changes
 */
function validateCapacityChange(
  affectedStudents: string[],
  oldCapacity: number,
  newCapacity: number
): ChangeRequestValidationResult {
  // If capacity is reduced, check if it can still accommodate irregular students
  if (newCapacity < oldCapacity) {
    // We need at least as many seats as irregular students who need this course
    if (newCapacity < affectedStudents.length) {
      return {
        isValid: false,
        error: `Cannot reduce capacity to ${newCapacity}. This section is required by ${affectedStudents.length} irregular student(s).`,
        affectsIrregular: true,
        affectedStudents,
      };
    }
    
    return {
      isValid: true,
      affectsIrregular: true,
      affectedStudents,
      warnings: [
        `Capacity reduced from ${oldCapacity} to ${newCapacity}, but still accommodates ${affectedStudents.length} irregular student(s).`
      ],
    };
  }
  
  // Capacity increase is always valid
  return {
    isValid: true,
    affectsIrregular: true,
    affectedStudents,
    warnings: [
      `Capacity increased from ${oldCapacity} to ${newCapacity}. ${affectedStudents.length} irregular student(s) will benefit.`
    ],
  };
}

/**
 * Check if two time slots overlap
 */
function timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Must be same day
  if (slot1.day !== slot2.day) {
    return false;
  }
  
  // Convert times to minutes for easier comparison
  const start1 = timeToMinutes(slot1.start_time);
  const end1 = timeToMinutes(slot1.end_time);
  const start2 = timeToMinutes(slot2.start_time);
  const end2 = timeToMinutes(slot2.end_time);
  
  // Check overlap
  return start1 < end2 && start2 < end1;
}

/**
 * Convert time string (HH:MM:SS) to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Apply an approved change request to a schedule
 */
export async function applyChangeRequest(
  supabase: SupabaseClient,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the change request
    const { data: request, error: requestError } = await supabase
      .from('teaching_load_change_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (requestError || !request) {
      return { success: false, error: 'Change request not found' };
    }
    
    // Only apply approved requests
    if (request.validation_status !== 'APPROVED') {
      return { success: false, error: 'Only approved requests can be applied' };
    }
    
    if (request.applied) {
      return { success: false, error: 'Request has already been applied' };
    }
    
    // Apply changes to the section
    const changes = request.changes as { from: any; to: any };
    const updateData: any = {};
    
    switch (request.request_type) {
      case 'REASSIGN_INSTRUCTOR':
        updateData.instructor_id = changes.to.instructor_id;
        break;
      
      case 'CHANGE_ROOM':
        updateData.room_number = changes.to.room_number;
        break;
      
      case 'ADJUST_CAPACITY':
        updateData.capacity = changes.to.capacity;
        break;
      
      case 'CHANGE_TIME_SLOT':
        // Time slots might be stored differently depending on schema
        // This would need to update section_time table
        return { 
          success: false, 
          error: 'Time slot changes require manual application through section_time table' 
        };
      
      default:
        return { success: false, error: 'Unknown request type' };
    }
    
    // Update the section
    const { error: updateError } = await supabase
      .from('section')
      .update(updateData)
      .eq('section_id', request.section_id);
    
    if (updateError) {
      console.error('Error applying changes:', updateError);
      return { success: false, error: 'Failed to apply changes to section' };
    }
    
    // Mark request as applied
    const { error: markError } = await supabase
      .from('teaching_load_change_requests')
      .update({
        applied: true,
        applied_at: new Date().toISOString(),
      })
      .eq('id', requestId);
    
    if (markError) {
      console.error('Error marking request as applied:', markError);
      return { success: false, error: 'Changes applied but failed to update request status' };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Apply change request error:', error);
    return { success: false, error: 'Failed to apply change request' };
  }
}

