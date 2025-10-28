/**
 * Scheduling-related TypeScript types
 * 
 * These types define the structure of complex scheduling data
 * that is stored as JSON in the database.
 */

export interface MeetingPattern {
	days: string[]
	start: string
	duration: number
	is_lab: boolean
}

export interface SectionWithDetails {
	id: string
	section_no: string
	course_code: string
	capacity: number
	meeting_pattern: MeetingPattern | null
	room: {
		code: string
		type: string
	} | null
	course: {
		code: string
		title: string
		credits: number
		level: number
	} | null
}

export interface FacultySectionDisplay {
	id: string
	course_code: string
	course_title: string
	section_no: string
	capacity: number
	meeting_pattern: MeetingPattern | null
	room_code: string | null
	credits?: number
	level?: number
}

/**
 * Helper function to safely parse meeting pattern from database JSON
 */
export function parseMeetingPattern(pattern: unknown): MeetingPattern | null {
	if (!pattern || typeof pattern !== 'object') return null
	
	const p = pattern as Record<string, unknown>
	
	return {
		days: Array.isArray(p.days) ? p.days.filter((d): d is string => typeof d === 'string') : [],
		start: typeof p.start === 'string' ? p.start : 'TBD',
		duration: typeof p.duration === 'number' ? p.duration : 0,
		is_lab: typeof p.is_lab === 'boolean' ? p.is_lab : false,
	}
}

/**
 * Format meeting days for display
 */
export function formatMeetingDays(days: string[]): string {
	if (!days || days.length === 0) return 'TBD'
	return days.join(', ')
}

/**
 * Format time with duration
 */
export function formatTimeWithDuration(start: string, duration: number): string {
	if (!start || start === 'TBD') return 'TBD'
	return `${start} (${duration} min)`
}

