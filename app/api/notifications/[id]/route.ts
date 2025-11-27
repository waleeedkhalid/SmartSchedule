/**
 * Single Notification API Route
 * 
 * PATCH /api/notifications/[id] - Mark single notification as read
 * DELETE /api/notifications/[id] - Delete single notification
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/supabase/server';
import { authenticateRequest } from '@/lib/api/auth-utils';
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from '@/lib/api/error-handler';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await authenticateRequest(request);
		const supabase = await createClient();

		// Verify notification belongs to user
		const { data: notification, error: fetchError } = await supabase
			.from('notification')
			.select('id, user_id')
			.eq('id', params.id)
			.single();

		if (fetchError) throw fetchError;

		if (!notification) {
			return createErrorResponse(
				404,
				ErrorCodes.NOT_FOUND,
				'Notification not found'
			);
		}

		if (notification.user_id !== user.id) {
			return createErrorResponse(
				403,
				ErrorCodes.FORBIDDEN,
				'Access denied'
			);
		}

		// Mark as read
		const { data, error } = await supabase
			.from('notification')
			.update({ read_at: new Date().toISOString() })
			.eq('id', params.id)
			.eq('user_id', user.id)
			.select()
			.single();

		if (error) throw error;

		return createSuccessResponse(data, 200, 'Notification marked as read');
	} catch (error) {
		return handleApiError(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await authenticateRequest(request);
		const supabase = await createClient();

		// Verify notification belongs to user
		const { data: notification, error: fetchError } = await supabase
			.from('notification')
			.select('id, user_id')
			.eq('id', params.id)
			.single();

		if (fetchError) throw fetchError;

		if (!notification) {
			return createErrorResponse(
				404,
				ErrorCodes.NOT_FOUND,
				'Notification not found'
			);
		}

		if (notification.user_id !== user.id) {
			return createErrorResponse(
				403,
				ErrorCodes.FORBIDDEN,
				'Access denied'
			);
		}

		// Delete notification
		const { error } = await supabase
			.from('notification')
			.delete()
			.eq('id', params.id)
			.eq('user_id', user.id);

		if (error) throw error;

		return createSuccessResponse(
			{ deleted: true },
			200,
			'Notification deleted'
		);
	} catch (error) {
		return handleApiError(error);
	}
}

