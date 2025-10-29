import { createClient } from '@/supabase/server'
import type { Database } from '@/lib/types/database'

type TimelineEvent = Database['public']['Tables']['semester_timeline']['Row']
type TimelineEventInsert = Database['public']['Tables']['semester_timeline']['Insert']
type TimelineEventUpdate = Database['public']['Tables']['semester_timeline']['Update']
type TimelineNotificationLog = Database['public']['Tables']['timeline_notification_log']['Row']

export interface UpcomingDeadline {
	id: string
	title: string
	description: string | null
	event_type: string
	start_date: string
	end_date: string
	days_until_start: number
	days_until_end: number
	priority: string
	status: string
	requires_action: boolean
}

export interface OverdueEvent {
	id: string
	title: string
	description: string | null
	event_type: string
	end_date: string
	days_overdue: number
	target_roles: string[]
	priority: string
}

export interface EventNeedingNotification {
	event_id: string
	title: string
	description: string | null
	start_date: string
	end_date: string
	target_role: string
	days_before: number
	priority: string
	event_type: string
	category: string
}

export interface TimelineStatistics {
	total_events: number
	upcoming_events: number
	in_progress_events: number
	overdue_events: number
	completed_events: number
	high_priority_count: number
	critical_priority_count: number
}

/**
 * Get all timeline events for a semester
 */
export async function getTimelineEvents(semesterCode?: string) {
	const supabase = await createClient()

	let query = supabase
		.from('semester_timeline')
		.select('*')
		.order('start_date', { ascending: true })

	if (semesterCode) {
		query = query.eq('term_code', semesterCode)
	}

	const { data, error } = await query

	if (error) throw error
	return data as TimelineEvent[]
}

/**
 * Get a single timeline event by ID
 */
export async function getTimelineEventById(id: string) {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('semester_timeline')
		.select('*')
		.eq('id', id)
		.single()

	if (error) throw error
	return data as TimelineEvent
}

/**
 * Create a new timeline event
 */
export async function createTimelineEvent(event: TimelineEventInsert) {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('semester_timeline')
		.insert(event)
		.select()
		.single()

	if (error) throw error
	return data as TimelineEvent
}

/**
 * Update a timeline event
 */
export async function updateTimelineEvent(
	id: string,
	updates: TimelineEventUpdate
) {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('semester_timeline')
		.update(updates)
		.eq('id', id)
		.select()
		.single()

	if (error) throw error
	return data as TimelineEvent
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(id: string) {
	const supabase = await createClient()

	const { error } = await supabase
		.from('semester_timeline')
		.delete()
		.eq('id', id)

	if (error) throw error
}

/**
 * Get upcoming deadlines for a specific role
 */
export async function getUpcomingDeadlinesForRole(
	role: string,
	daysAhead: number = 30
) {
	const supabase = await createClient()

	const { data, error } = await supabase.rpc('get_upcoming_deadlines_for_role', {
		role_name: role,
		days_ahead: daysAhead,
	})

	if (error) throw error
	return (data || []) as UpcomingDeadline[]
}

/**
 * Get all overdue events
 */
export async function getOverdueEvents() {
	const supabase = await createClient()

	const { data, error } = await supabase.rpc('get_overdue_events')

	if (error) throw error
	return (data || []) as OverdueEvent[]
}

/**
 * Get events that need notifications sent
 */
export async function getEventsNeedingNotifications() {
	const supabase = await createClient()

	const { data, error } = await supabase.rpc('get_events_needing_notifications')

	if (error) throw error
	return (data || []) as EventNeedingNotification[]
}

/**
 * Update timeline event statuses based on current date
 */
export async function updateTimelineEventStatuses() {
	const supabase = await createClient()

	const { data, error } = await supabase.rpc('update_timeline_event_statuses')

	if (error) throw error
	return data as number
}

/**
 * Get timeline statistics
 */
export async function getTimelineStatistics(semesterCode?: string) {
	const supabase = await createClient()

	const { data, error } = await supabase.rpc('get_timeline_statistics', {
		semester_code: semesterCode || null,
	})

	if (error) throw error
	return (data && data.length > 0 ? data[0] : null) as TimelineStatistics | null
}

/**
 * Log that a notification was sent
 */
export async function logTimelineNotification(
	timelineEventId: string,
	notificationId: string | null,
	daysBefore: number,
	recipientRole: string,
	recipientCount: number
) {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('timeline_notification_log')
		.insert({
			timeline_event_id: timelineEventId,
			notification_id: notificationId,
			days_before: daysBefore,
			recipient_role: recipientRole,
			recipient_count: recipientCount,
		})
		.select()
		.single()

	if (error) throw error
	return data as TimelineNotificationLog
}

/**
 * Check if a notification has already been sent
 */
export async function hasNotificationBeenSent(
	eventId: string,
	daysBefore: number,
	role: string
) {
	const supabase = await createClient()

	const { data, error } = await supabase.rpc('has_notification_been_sent', {
		event_id: eventId,
		days_before_value: daysBefore,
		role_name: role,
	})

	if (error) throw error
	return data as boolean
}

/**
 * Get timeline events by status
 */
export async function getTimelineEventsByStatus(
	status: 'upcoming' | 'in_progress' | 'completed' | 'overdue' | 'cancelled',
	semesterCode?: string
) {
	const supabase = await createClient()

	let query = supabase
		.from('semester_timeline')
		.select('*')
		.eq('status', status)
		.order('start_date', { ascending: true })

	if (semesterCode) {
		query = query.eq('term_code', semesterCode)
	}

	const { data, error } = await query

	if (error) throw error
	return data as TimelineEvent[]
}

/**
 * Get timeline events by priority
 */
export async function getTimelineEventsByPriority(
	priority: 'low' | 'medium' | 'high' | 'critical',
	semesterCode?: string
) {
	const supabase = await createClient()

	let query = supabase
		.from('semester_timeline')
		.select('*')
		.eq('priority', priority)
		.order('start_date', { ascending: true })

	if (semesterCode) {
		query = query.eq('term_code', semesterCode)
	}

	const { data, error } = await query

	if (error) throw error
	return data as TimelineEvent[]
}

/**
 * Get timeline events by category
 */
export async function getTimelineEventsByCategory(
	category: string,
	semesterCode?: string
) {
	const supabase = await createClient()

	let query = supabase
		.from('semester_timeline')
		.select('*')
		.eq('category', category)
		.order('start_date', { ascending: true })

	if (semesterCode) {
		query = query.eq('term_code', semesterCode)
	}

	const { data, error } = await query

	if (error) throw error
	return data as TimelineEvent[]
}

/**
 * Get timeline events that require action
 */
export async function getActionRequiredEvents(semesterCode?: string) {
	const supabase = await createClient()

	let query = supabase
		.from('semester_timeline')
		.select('*')
		.eq('requires_action', true)
		.in('status', ['upcoming', 'in_progress'])
		.order('start_date', { ascending: true })

	if (semesterCode) {
		query = query.eq('term_code', semesterCode)
	}

	const { data, error } = await query

	if (error) throw error
	return data as TimelineEvent[]
}

/**
 * Mark a timeline event as completed
 */
export async function markEventAsCompleted(id: string) {
	return updateTimelineEvent(id, { status: 'completed' })
}

/**
 * Cancel a timeline event
 */
export async function cancelEvent(id: string) {
	return updateTimelineEvent(id, { status: 'cancelled' })
}

/**
 * Get notification logs for an event
 */
export async function getNotificationLogsForEvent(eventId: string) {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('timeline_notification_log')
		.select('*')
		.eq('timeline_event_id', eventId)
		.order('sent_at', { ascending: false })

	if (error) throw error
	return data as TimelineNotificationLog[]
}

