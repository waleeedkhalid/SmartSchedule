/**
 * Timeline API Route
 * 
 * GET /api/timeline - List timeline events with optional filters
 * POST /api/timeline - Create new timeline event (scheduling/registrar only)
 * 
 * Query Parameters:
 * - semester: Filter by semester code
 * - status: Filter by status (upcoming, in_progress, completed, overdue, cancelled)
 * - priority: Filter by priority (low, medium, high, critical)
 * - category: Filter by category
 * - role: Get upcoming deadlines for specific role
 * - overdue: Get overdue events (true)
 * - stats: Get statistics summary (true)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/supabase/server';
import { authenticateRequest, requireRole } from '@/lib/api/auth-utils';
import { createSuccessResponse, handleApiError, createErrorResponse } from '@/lib/api/error-handler';
import { calculateTimelineStatus } from '@/lib/utils/timeline-status';

export async function GET(request: NextRequest) {
	try {
		await authenticateRequest(request);
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);

		const semester = searchParams.get('semester');
		const status = searchParams.get('status');
		const priority = searchParams.get('priority');
		const category = searchParams.get('category');
		const role = searchParams.get('role');
		const overdue = searchParams.get('overdue') === 'true';
		const stats = searchParams.get('stats') === 'true';

		// Get statistics if requested
		if (stats) {
			let query = supabase
				.from('semester_timeline')
				.select('status, priority, start_date, end_date, is_deadline', { count: 'exact', head: false });

			if (semester) {
				query = query.eq('term_code', semester);
			}

			const { data, error, count } = await query;

			if (error) throw error;

			// Calculate statistics with dynamically calculated statuses
			type TimelineEvent = { 
				status: string; 
				priority: string;
				start_date: string;
				end_date: string;
				is_deadline?: boolean;
			};
			const events = (data || []) as TimelineEvent[];
			
			// Calculate status for each event
			const eventsWithCalculatedStatus = events.map((e) => ({
				...e,
				status: calculateTimelineStatus({
					status: e.status,
					start_date: e.start_date,
					end_date: e.end_date,
					is_deadline: e.is_deadline,
				}),
			}));

			const statistics = {
				total: count || 0,
				upcoming: eventsWithCalculatedStatus.filter((e) => e.status === 'upcoming').length,
				in_progress: eventsWithCalculatedStatus.filter((e) => e.status === 'in_progress').length,
				overdue: eventsWithCalculatedStatus.filter((e) => e.status === 'overdue').length,
				completed: eventsWithCalculatedStatus.filter((e) => e.status === 'completed').length,
				cancelled: eventsWithCalculatedStatus.filter((e) => e.status === 'cancelled').length,
				by_priority: {
					low: events.filter((e) => e.priority === 'low').length,
					medium: events.filter((e) => e.priority === 'medium').length,
					high: events.filter((e) => e.priority === 'high').length,
					critical: events.filter((e) => e.priority === 'critical').length,
				},
			};

			return createSuccessResponse(statistics, 200);
		}

		// Get overdue events
		if (overdue) {
			const { data, error } = await supabase.rpc('get_overdue_events', {
				semester_code: semester || null,
			});

			if (error) throw error;
			return createSuccessResponse(data || [], 200);
		}

		// Get upcoming deadlines for specific role
		if (role) {
			const { data, error } = await supabase.rpc('get_upcoming_deadlines_for_role', {
				role_name: role,
				days_ahead: 30,
			});

			if (error) throw error;

			// Calculate status dynamically and filter to only show upcoming/in_progress
			const eventsWithCalculatedStatus = (data || []).map((event: any) => ({
				...event,
				status: calculateTimelineStatus({
					status: event.status,
					start_date: event.start_date,
					end_date: event.end_date,
					is_deadline: event.is_deadline,
				}),
			})).filter((event: any) => 
				event.status === 'upcoming' || event.status === 'in_progress'
			);

			return createSuccessResponse(eventsWithCalculatedStatus, 200);
		}

		// Get all events with filters
		let query = supabase
			.from('semester_timeline')
			.select('*')
			.order('start_date', { ascending: true });

		if (semester) {
			query = query.eq('term_code', semester);
		}

		if (status) {
			query = query.eq('status', status);
		}

		if (priority) {
			query = query.eq('priority', priority);
		}

		if (category) {
			query = query.eq('category', category);
		}

		const { data, error } = await query;

		if (error) throw error;

		// Calculate status dynamically based on dates
		const eventsWithCalculatedStatus = (data || []).map((event: any) => ({
			...event,
			status: calculateTimelineStatus({
				status: event.status,
				start_date: event.start_date,
				end_date: event.end_date,
				is_deadline: event.is_deadline,
			}),
		}));

		return createSuccessResponse(eventsWithCalculatedStatus, 200);
	} catch (error) {
		return handleApiError(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await authenticateRequest(request);
		requireRole(user, ['scheduling', 'registrar']);

		const supabase = await createClient();
		const body = await request.json();

		// Validate required fields
		if (!body.term_code || !body.title || !body.start_date || !body.end_date) {
			return createErrorResponse(
				400,
				'VALIDATION_ERROR',
				'Missing required fields: term_code, title, start_date, end_date'
			);
		}

		// Create timeline event
		const { data, error } = await supabase
			.from('semester_timeline')
			.insert({
				term_code: body.term_code,
				title: body.title,
				description: body.description || null,
				event_type: body.event_type || 'general',
				category: body.category || 'administrative',
				start_date: body.start_date,
				end_date: body.end_date,
				requires_action: body.requires_action || false,
				target_roles: body.target_roles || [],
				notification_days_before: body.notification_days_before || [],
				is_deadline: body.is_deadline || false,
				priority: body.priority || 'medium',
				status: body.status || 'upcoming',
				metadata: body.metadata || {},
			})
			.select()
			.single();

		if (error) throw error;

		return createSuccessResponse(data, 201);
	} catch (error) {
		return handleApiError(error);
	}
}

