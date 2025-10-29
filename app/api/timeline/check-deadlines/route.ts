import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
	getEventsNeedingNotifications,
	updateTimelineEventStatuses,
	logTimelineNotification,
} from '@/lib/db/timeline'
import { createBulkNotifications } from '@/lib/db/notifications'

/**
 * POST /api/timeline/check-deadlines
 * Check for upcoming deadlines and send notifications
 * This should be called periodically (e.g., daily via cron job)
 * 
 * Can be called by:
 * - Scheduling role manually
 * - Automated cron job/scheduled task
 */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient()

		// Check authentication
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		
		// Allow unauthenticated requests with a secret token for cron jobs
		const authHeader = request.headers.get('authorization')
		const cronSecret = process.env.CRON_SECRET
		
		const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`

		if (!isAuthorizedCron) {
			if (authError || !user) {
				return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
			}

			// Check if user is scheduling role
			const { data: userRole } = await supabase
				.from('user_roles')
				.select('role')
				.eq('user_id', user.id)
				.maybeSingle()

			if (!userRole || userRole.role !== 'scheduling') {
				return NextResponse.json(
					{ error: 'Only scheduling role can manually trigger deadline checks' },
					{ status: 403 }
				)
			}
		}

		// Update event statuses first
		const updatedCount = await updateTimelineEventStatuses()

		// Get events that need notifications
		const eventsNeedingNotifications = await getEventsNeedingNotifications()

		if (eventsNeedingNotifications.length === 0) {
			return NextResponse.json({
				message: 'No notifications to send',
				updated_statuses: updatedCount,
				notifications_sent: 0,
			})
		}

		// Group events by role and event to batch notifications
		const notificationsSent: Array<{
			event_id: string
			event_title: string
			role: string
			days_before: number
			recipient_count: number
		}> = []

		for (const event of eventsNeedingNotifications) {
			// Get all users with this role
			const { data: users, error: usersError } = await supabase
				.from('user_roles')
				.select('user_id')
				.eq('role', event.target_role)

			if (usersError || !users || users.length === 0) {
				console.warn(`No users found for role: ${event.target_role}`)
				continue
			}

			const userIds = users.map((u) => u.user_id)

			// Create notification payload
			const payload = {
				event_id: event.event_id,
				event_title: event.title,
				event_type: event.event_type,
				category: event.category,
				start_date: event.start_date,
				end_date: event.end_date,
				days_before: event.days_before,
				priority: event.priority,
				description: event.description,
			}

			// Create bulk notifications
			const notifications = await createBulkNotifications(
				userIds,
				'timeline_deadline',
				payload
			)

			// Log that notification was sent
			await logTimelineNotification(
				event.event_id,
				notifications[0]?.id || null,
				event.days_before,
				event.target_role,
				userIds.length
			)

			notificationsSent.push({
				event_id: event.event_id,
				event_title: event.title,
				role: event.target_role,
				days_before: event.days_before,
				recipient_count: userIds.length,
			})
		}

		return NextResponse.json({
			message: 'Deadline check completed',
			updated_statuses: updatedCount,
			notifications_sent: notificationsSent.length,
			details: notificationsSent,
		})
	} catch (error) {
		console.error('Error checking deadlines:', error)
		return NextResponse.json(
			{ error: 'Failed to check deadlines' },
			{ status: 500 }
		)
	}
}

/**
 * GET /api/timeline/check-deadlines
 * Get a preview of what notifications would be sent (scheduling role only)
 */
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient()

		// Check authentication
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user is scheduling role
		const { data: userRole } = await supabase
			.from('user_roles')
			.select('role')
			.eq('user_id', user.id)
			.maybeSingle()

		if (!userRole || userRole.role !== 'scheduling') {
			return NextResponse.json(
				{ error: 'Only scheduling role can preview deadline notifications' },
				{ status: 403 }
			)
		}

		// Get events that need notifications
		const eventsNeedingNotifications = await getEventsNeedingNotifications()

		// For each event, count how many users would receive the notification
		const preview = await Promise.all(
			eventsNeedingNotifications.map(async (event) => {
				const { count } = await supabase
					.from('user_roles')
					.select('*', { count: 'exact', head: true })
					.eq('role', event.target_role)

				return {
					event_id: event.event_id,
					event_title: event.title,
					event_type: event.event_type,
					target_role: event.target_role,
					days_before: event.days_before,
					start_date: event.start_date,
					end_date: event.end_date,
					priority: event.priority,
					recipient_count: count || 0,
				}
			})
		)

		return NextResponse.json({
			total_notifications: preview.length,
			preview,
		})
	} catch (error) {
		console.error('Error previewing deadline notifications:', error)
		return NextResponse.json(
			{ error: 'Failed to preview notifications' },
			{ status: 500 }
		)
	}
}

