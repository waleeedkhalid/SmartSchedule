/**
 * Timeline Deadline Check API Route
 * 
 * GET /api/timeline/check-deadlines - Preview notifications that would be sent
 * POST /api/timeline/check-deadlines - Trigger deadline check and send notifications
 * 
 * Supports cron job authentication via Bearer token (CRON_SECRET env var)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/supabase/server';
import { authenticateRequest, requireRole } from '@/lib/api/auth-utils';
import { createSuccessResponse, handleApiError } from '@/lib/api/error-handler';
import type { Database } from '@/lib/types/database';

type TimelineEvent = Database['public']['Tables']['semester_timeline']['Row'];

export async function GET(request: NextRequest) {
	try {
		const user = await authenticateRequest(request);
		requireRole(user, ['scheduling']);

		const supabase = await createClient();

		// Get events that need notifications
		// RPC function is missing, using direct query instead
		const { data: eventsNeedingNotifications, error: eventsError } = await supabase
			.from('semester_timeline')
			.select('*')
			.not('notification_days_before', 'is', null)
			.neq('status', 'completed')
			.neq('status', 'cancelled');

		if (eventsError) throw eventsError;

		// Preview what notifications would be sent
		const preview = (eventsNeedingNotifications || []).map((event: TimelineEvent) => ({
			event_id: event.id,
			event_title: event.title,
			target_roles: event.target_roles || [],
			days_before: event.notification_days_before || [],
			deadline: event.end_date,
		}));

		return createSuccessResponse(
			{
				preview: true,
				events_count: preview.length,
				events: preview,
			},
			200
		);
	} catch (error) {
		return handleApiError(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		// Check for cron job authentication
		const authHeader = request.headers.get('authorization');
		const cronSecret = process.env.CRON_SECRET;

		if (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) {
			// Cron job authentication - proceed without user check
		} else {
			// Regular user authentication
			const user = await authenticateRequest(request);
			requireRole(user, ['scheduling']);
		}

		const supabase = await createClient();

		// Update event statuses first
		// RPC function is missing, using direct updates instead
		const now = new Date().toISOString();

		// Update overdue events
		await supabase
			.from('semester_timeline')
			.update({ status: 'overdue' })
			.lt('end_date', now)
			.not('status', 'in', '("completed","cancelled","overdue")');

		// Update in-progress events
		await supabase
			.from('semester_timeline')
			.update({ status: 'in_progress' })
			.lte('start_date', now)
			.gte('end_date', now)
			.eq('status', 'upcoming');

		// Get events that need notifications
		// RPC function is missing, using direct query instead
		const { data: eventsNeedingNotifications, error: eventsError } = await supabase
			.from('semester_timeline')
			.select('*')
			.not('notification_days_before', 'is', null)
			.neq('status', 'completed')
			.neq('status', 'cancelled');

		if (eventsError) throw eventsError;

		interface NotificationSent {
			event_id: string;
			event_title: string;
			role: string;
			days_before: number;
			recipient_count: number;
		}
		const notificationsSent: NotificationSent[] = [];
		let totalRecipients = 0;

		// Process each event that needs notifications
		for (const event of eventsNeedingNotifications || []) {
			const targetRoles = event.target_roles || [];
			// The notification_days_before array is no longer used to determine *when* to send.
			// Instead, we calculate daysRemaining and send a notification for that specific remaining time.
			const eventDate = new Date(event.end_date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Calculate days remaining
			const timeDiff = eventDate.getTime() - today.getTime();
			const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

			// Check if notification already sent for this remaining time (effectively checks if sent today)
			const { data: existingLog } = await supabase
				.from('timeline_notification_log')
				.select('id')
				.eq('timeline_event_id', event.id)
				.eq('days_before', daysRemaining)
				.single();

			if (existingLog) {
				// Already sent for this timeframe, skip
				continue;
			}

			// Send notifications to each target role
			for (const role of targetRoles) {
				// Get users with this role with error handling
				let users;
				let usersError;

				try {
					const result = await supabase
						.from('user_roles')
						.select('user_id')
						.eq('role', role);

					users = result.data;
					usersError = result.error;
				} catch (error) {
					// Catch any unexpected errors (network issues, etc.)
					console.warn(`Unexpected error fetching users for role ${role}:`, error);
					usersError = error instanceof Error ? { message: error.message, status: 500 } : { message: 'Unknown error', status: 500 };
					users = null;
				}

				if (usersError) {
					// Handle PGRST errors gracefully
					if (usersError.code?.startsWith('PGRST')) {
						console.warn(`user_roles query error (PGRST) for role ${role}:`, {
							code: usersError.code,
							message: usersError.message,
						});
					} else {
						console.error(`Error fetching users for role ${role}:`, usersError);
					}
					continue;
				}

				const userIds = (users || []).map((u: { user_id: string }) => u.user_id);
				const recipientCount = userIds.length;

				if (recipientCount === 0) {
					continue;
				}

				// Create notifications for all users in this role
				const notifications = userIds.map((userId: string) => ({
					user_id: userId,
					type: 'timeline_deadline',
					payload: {
						timeline_event_id: event.id,
						event_title: event.title,
						deadline: event.end_date,
						days_before: daysRemaining,
						priority: event.priority,
						requires_action: event.requires_action,
						description: event.description,
						message: `This deadline is ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} away. ${event.description || ''}`
					},
				}));

				// Insert notifications
				const { data: insertedNotifications, error: notifyError } = await supabase
					.from('notification')
					.insert(notifications)
					.select();

				if (notifyError) {
					console.error(`Error creating notifications for role ${role}:`, notifyError);
					continue;
				}

				// Log the notification
				const { error: logError } = await supabase
					.from('timeline_notification_log')
					.insert({
						timeline_event_id: event.id,
						notification_id: insertedNotifications?.[0]?.id || null,
						days_before: daysRemaining,
						recipient_role: role,
						recipient_count: recipientCount,
					});

				if (logError) {
					console.error('Error logging notification:', logError);
				}

				notificationsSent.push({
					event_id: event.id,
					event_title: event.title,
					role,
					days_before: daysRemaining,
					recipient_count: recipientCount,
				});

				totalRecipients += recipientCount;
			}
		}

		return createSuccessResponse(
			{
				success: true,
				events_checked: eventsNeedingNotifications?.length || 0,
				notifications_sent: notificationsSent.length,
				total_recipients: totalRecipients,
				details: notificationsSent,
			},
			200
		);
	} catch (error) {
		return handleApiError(error);
	}
}

