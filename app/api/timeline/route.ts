import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
	getTimelineEvents,
	createTimelineEvent,
	getTimelineEventsByStatus,
	getTimelineEventsByPriority,
	getTimelineEventsByCategory,
	getActionRequiredEvents,
	getUpcomingDeadlinesForRole,
	getOverdueEvents,
	getTimelineStatistics,
	updateTimelineEventStatuses,
} from '@/lib/db/timeline'

/**
 * GET /api/timeline
 * Get timeline events with optional filters
 * 
 * Query params:
 * - semester: semester code to filter by
 * - status: upcoming | in_progress | completed | overdue | cancelled
 * - priority: low | medium | high | critical
 * - category: category name
 * - actionRequired: 'true' to get only events requiring action
 * - role: get upcoming deadlines for specific role
 * - overdue: 'true' to get overdue events
 * - stats: 'true' to get statistics
 */
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient()

		// Check authentication
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const searchParams = request.nextUrl.searchParams
		const semester = searchParams.get('semester') || undefined
		const status = searchParams.get('status')
		const priority = searchParams.get('priority')
		const category = searchParams.get('category')
		const actionRequired = searchParams.get('actionRequired') === 'true'
		const role = searchParams.get('role')
		const overdue = searchParams.get('overdue') === 'true'
		const stats = searchParams.get('stats') === 'true'

		// Update statuses first
		await updateTimelineEventStatuses()

		// Get statistics
		if (stats) {
			const data = await getTimelineStatistics(semester)
			return NextResponse.json(data)
		}

		// Get overdue events
		if (overdue) {
			const data = await getOverdueEvents()
			return NextResponse.json(data)
		}

		// Get upcoming deadlines for role
		if (role) {
			const daysAhead = parseInt(searchParams.get('daysAhead') || '30')
			const data = await getUpcomingDeadlinesForRole(role, daysAhead)
			return NextResponse.json(data)
		}

		// Get events requiring action
		if (actionRequired) {
			const data = await getActionRequiredEvents(semester)
			return NextResponse.json(data)
		}

		// Filter by status
		if (status) {
			const data = await getTimelineEventsByStatus(
				status as 'upcoming' | 'in_progress' | 'completed' | 'overdue' | 'cancelled',
				semester
			)
			return NextResponse.json(data)
		}

		// Filter by priority
		if (priority) {
			const data = await getTimelineEventsByPriority(
				priority as 'low' | 'medium' | 'high' | 'critical',
				semester
			)
			return NextResponse.json(data)
		}

		// Filter by category
		if (category) {
			const data = await getTimelineEventsByCategory(category, semester)
			return NextResponse.json(data)
		}

		// Get all events
		const data = await getTimelineEvents(semester)
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error fetching timeline events:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch timeline events' },
			{ status: 500 }
		)
	}
}

/**
 * POST /api/timeline
 * Create a new timeline event (scheduling or registrar role only)
 */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient()

		// Check authentication
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check authorization
		const { data: userRole } = await supabase
			.from('user_roles')
			.select('role')
			.eq('user_id', user.id)
			.maybeSingle()

		if (!userRole || !['scheduling', 'registrar'].includes(userRole.role)) {
			return NextResponse.json(
				{ error: 'Only scheduling and registrar roles can create timeline events' },
				{ status: 403 }
			)
		}

		const body = await request.json()

		// Validate required fields
		if (!body.term_code || !body.title || !body.event_type || !body.category || !body.start_date || !body.end_date) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		const data = await createTimelineEvent(body)

		return NextResponse.json(data, { status: 201 })
	} catch (error) {
		console.error('Error creating timeline event:', error)
		return NextResponse.json(
			{ error: 'Failed to create timeline event' },
			{ status: 500 }
		)
	}
}

