/**
 * Timeline Status Calculation Utilities
 * 
 * Calculates event status dynamically based on current date and event dates.
 * Status transitions:
 * - upcoming: start_date is in the future
 * - in_progress: start_date has passed but end_date hasn't
 * - overdue: end_date has passed (for deadlines) or event has ended
 * - completed: manually marked as completed
 * - cancelled: manually cancelled
 */

interface TimelineEvent {
	status: string
	start_date: string
	end_date: string
	is_deadline?: boolean
}

/**
 * Calculate the current status of a timeline event based on dates
 * 
 * @param event - Timeline event with status, start_date, and end_date
 * @returns Calculated status string
 */
export function calculateTimelineStatus(event: TimelineEvent): string {
	// Preserve manually set statuses
	if (event.status === 'completed' || event.status === 'cancelled') {
		return event.status
	}

	try {
		const now = new Date()
		const startDate = event.start_date ? new Date(event.start_date) : null
		const endDate = event.end_date ? new Date(event.end_date) : null

		// If dates are invalid, return current status
		if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return event.status || 'upcoming'
		}

		// If end date has passed, event is overdue/ended
		if (endDate < now) {
			return 'overdue'
		}

		// If start date has passed but end date hasn't, event is in progress
		if (startDate <= now && endDate >= now) {
			return 'in_progress'
		}

		// If start date is in the future, event is upcoming
		if (startDate > now) {
			return 'upcoming'
		}

		// Default fallback
		return event.status || 'upcoming'
	} catch {
		// On any error, return current status or default
		return event.status || 'upcoming'
	}
}

/**
 * Calculate status for multiple events
 * 
 * @param events - Array of timeline events
 * @returns Array of events with calculated status
 */
export function calculateTimelineStatuses<T extends TimelineEvent>(
	events: T[]
): Array<T & { calculated_status: string }> {
	return events.map((event) => ({
		...event,
		calculated_status: calculateTimelineStatus(event),
	}))
}

