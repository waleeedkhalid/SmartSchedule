import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
	getTimelineEventById,
	updateTimelineEvent,
	deleteTimelineEvent,
	getNotificationLogsForEvent,
} from '@/lib/db/timeline'

/**
 * GET /api/timeline/[id]
 * Get a single timeline event
 * 
 * Query params:
 * - logs: 'true' to include notification logs
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const supabase = await createClient()

		// Check authentication
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const id = params.id
		const searchParams = request.nextUrl.searchParams
		const includeLogs = searchParams.get('logs') === 'true'

		const event = await getTimelineEventById(id)

		if (includeLogs) {
			const logs = await getNotificationLogsForEvent(id)
			return NextResponse.json({ ...event, notification_logs: logs })
		}

		return NextResponse.json(event)
	} catch (error) {
		console.error('Error fetching timeline event:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch timeline event' },
			{ status: 500 }
		)
	}
}

/**
 * PATCH /api/timeline/[id]
 * Update a timeline event (scheduling or registrar role only)
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
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
				{ error: 'Only scheduling and registrar roles can update timeline events' },
				{ status: 403 }
			)
		}

		const id = params.id
		const body = await request.json()

		const data = await updateTimelineEvent(id, body)

		return NextResponse.json(data)
	} catch (error) {
		console.error('Error updating timeline event:', error)
		return NextResponse.json(
			{ error: 'Failed to update timeline event' },
			{ status: 500 }
		)
	}
}

/**
 * DELETE /api/timeline/[id]
 * Delete a timeline event (scheduling role only)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
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

		if (!userRole || userRole.role !== 'scheduling') {
			return NextResponse.json(
				{ error: 'Only scheduling role can delete timeline events' },
				{ status: 403 }
			)
		}

		const id = params.id
		await deleteTimelineEvent(id)

		return NextResponse.json({ message: 'Timeline event deleted successfully' })
	} catch (error) {
		console.error('Error deleting timeline event:', error)
		return NextResponse.json(
			{ error: 'Failed to delete timeline event' },
			{ status: 500 }
		)
	}
}

