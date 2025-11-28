/**
 * Notifications API Route
 * 
 * GET /api/notifications - List user's notifications
 * PATCH /api/notifications - Mark all notifications as read
 * DELETE /api/notifications - Delete all read notifications
 * 
 * Query Parameters:
 * - unread: Filter to unread notifications only (true)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/supabase/server';
import { authenticateRequest } from '@/lib/api/auth-utils';
import { createSuccessResponse, handleApiError } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
	try {
		const user = await authenticateRequest(request);
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);

		const unreadOnly = searchParams.get('unread') === 'true';

		let query = supabase
			.from('notification')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		if (unreadOnly) {
			query = query.is('read_at', null);
		}

		const { data, error } = await query;

		if (error) throw error;

		return createSuccessResponse(data || [], 200);
	} catch (error) {
		return handleApiError(error);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const user = await authenticateRequest(request);
		const supabase = await createClient();

		// Mark all unread notifications as read
		const { data, error } = await supabase
			.from('notification')
			.update({ read_at: new Date().toISOString() })
			.eq('user_id', user.id)
			.is('read_at', null)
			.select();

		if (error) throw error;

		return createSuccessResponse(
			{ updated: data?.length || 0 },
			200,
			`Marked ${data?.length || 0} notification(s) as read`
		);
	} catch (error) {
		return handleApiError(error);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const user = await authenticateRequest(request);
		const supabase = await createClient();

		// Delete all read notifications
		const { data, error } = await supabase
			.from('notification')
			.delete()
			.eq('user_id', user.id)
			.not('read_at', 'is', null)
			.select();

		if (error) throw error;

		return createSuccessResponse(
			{ deleted: data?.length || 0 },
			200,
			`Deleted ${data?.length || 0} read notification(s)`
		);
	} catch (error) {
		return handleApiError(error);
	}
}

