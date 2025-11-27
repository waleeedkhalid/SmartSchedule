/**
 * Timeline Event API Route
 * 
 * GET /api/timeline/[id] - Get specific timeline event
 * PATCH /api/timeline/[id] - Update timeline event (scheduling/registrar only)
 * DELETE /api/timeline/[id] - Delete timeline event (scheduling only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { authenticateRequest, requireRole } from '@/lib/api/auth-utils';
import { createSuccessResponse, handleApiError, createErrorResponse } from '@/lib/api/error-handler';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await authenticateRequest(request);
		const supabase = await createClient();
		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const includeLogs = searchParams.get('logs') === 'true';

		let query = supabase
			.from('semester_timeline')
			.select('*')
			.eq('id', id)
			.single();

		const { data: event, error: eventError } = await query;

		if (eventError) throw eventError;

		if (includeLogs) {
			const { data: logs, error: logsError } = await supabase
				.from('timeline_notification_log')
				.select('*')
				.eq('timeline_event_id', id)
				.order('sent_at', { ascending: false });

			if (logsError) throw logsError;

			return createSuccessResponse({ ...event, notification_logs: logs || [] }, 200);
		}

		return createSuccessResponse(event, 200);
	} catch (error) {
		return handleApiError(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await authenticateRequest(request);
		requireRole(user, ['scheduling', 'registrar']);

		const supabase = await createClient();
		const { id } = await params;
		const body = await request.json();

		// Update timeline event
		const { data, error } = await supabase
			.from('semester_timeline')
			.update({
				...(body.title && { title: body.title }),
				...(body.description !== undefined && { description: body.description }),
				...(body.event_type && { event_type: body.event_type }),
				...(body.category && { category: body.category }),
				...(body.start_date && { start_date: body.start_date }),
				...(body.end_date && { end_date: body.end_date }),
				...(body.requires_action !== undefined && { requires_action: body.requires_action }),
				...(body.target_roles && { target_roles: body.target_roles }),
				...(body.notification_days_before && { notification_days_before: body.notification_days_before }),
				...(body.is_deadline !== undefined && { is_deadline: body.is_deadline }),
				...(body.priority && { priority: body.priority }),
				...(body.status && { status: body.status }),
				...(body.metadata && { metadata: body.metadata }),
			})
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;

		return createSuccessResponse(data, 200);
	} catch (error) {
		return handleApiError(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await authenticateRequest(request);
		requireRole(user, ['scheduling']); // Only scheduling can delete

		const supabase = await createClient();
		const { id } = await params;

		const { error } = await supabase
			.from('semester_timeline')
			.delete()
			.eq('id', id);

		if (error) throw error;

		return createSuccessResponse({ message: 'Timeline event deleted successfully' }, 200);
	} catch (error) {
		return handleApiError(error);
	}
}

