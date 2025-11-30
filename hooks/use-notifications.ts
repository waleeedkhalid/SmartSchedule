/**
 * Custom hook for managing notifications
 * 
 * Provides React Query integration for fetching and managing notifications
 * Integrates with notification store for global state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { getAuthHeader } from '@/lib/utils/client-auth';

interface Notification {
	id: string;
	user_id: string;
	type: string;
	payload: Record<string, any>;
	read_at: string | null;
	created_at: string;
}

/**
 * Fetch notifications from API
 */
async function fetchNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
	const authHeader = await getAuthHeader();
	const url = unreadOnly ? '/api/notifications?unread=true' : '/api/notifications';

	const response = await fetch(url, {
		headers: {
			'Authorization': authHeader,
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch notifications');
	}

	const result = await response.json();
	return result.data || [];
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(id: string): Promise<Notification> {
	const authHeader = await getAuthHeader();

	const response = await fetch(`/api/notifications/${id}`, {
		method: 'PATCH',
		headers: {
			'Authorization': authHeader,
		},
	});

	if (!response.ok) {
		throw new Error('Failed to mark notification as read');
	}

	const result = await response.json();
	return result.data;
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(): Promise<{ updated: number }> {
	const authHeader = await getAuthHeader();

	const response = await fetch('/api/notifications', {
		method: 'PATCH',
		headers: {
			'Authorization': authHeader,
		},
	});

	if (!response.ok) {
		throw new Error('Failed to mark all as read');
	}

	const result = await response.json();
	return result.data;
}

/**
 * Delete notification
 */
async function deleteNotification(id: string): Promise<void> {
	const authHeader = await getAuthHeader();

	const response = await fetch(`/api/notifications/${id}`, {
		method: 'DELETE',
		headers: {
			'Authorization': authHeader,
		},
	});

	if (!response.ok) {
		throw new Error('Failed to delete notification');
	}
}

/**
 * Hook for fetching all notifications
 */
/**
 * Hook for fetching all notifications
 */
export function useNotifications() {
	const { setNotifications } = useNotificationStore();

	const query = useQuery({
		queryKey: ['notifications', 'all'],
		queryFn: () => fetchNotifications(false),
		staleTime: 60 * 1000, // Cache for 1 minute
		gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
		refetchOnWindowFocus: true,
		refetchInterval: 60 * 1000, // Poll every minute
	});

	// Sync with store when data changes
	useEffect(() => {
		if (query.data) {
			setNotifications(query.data);
		}
	}, [query.data, setNotifications]);

	return query;
}

/**
 * Hook for fetching unread notifications only
 * OPTIMIZATION: Derives from the main notifications query to avoid extra API calls
 */
export function useUnreadNotifications() {
	const { setNotifications } = useNotificationStore();

	// Use the same query key to share cache
	const query = useQuery({
		queryKey: ['notifications', 'all'],
		queryFn: () => fetchNotifications(false),
		staleTime: 60 * 1000,
		refetchOnWindowFocus: true,
		refetchInterval: 60 * 1000,
		select: (data) => data.filter((n: Notification) => !n.read_at), // Filter on client
	});

	return query;
}

/**
 * Hook for fetching recent notifications (last 10)
 * OPTIMIZATION: Derives from the main notifications query
 */
export function useRecentNotifications() {
	const { setNotifications } = useNotificationStore();

	// Use the same query key to share cache
	const query = useQuery({
		queryKey: ['notifications', 'all'],
		queryFn: () => fetchNotifications(false),
		staleTime: 60 * 1000,
		refetchOnWindowFocus: true,
		refetchInterval: 60 * 1000,
		select: (data) => data.slice(0, 10), // Slice on client
	});

	return query;
}

/**
 * Hook for marking notification as read
 */
export function useMarkAsRead() {
	const queryClient = useQueryClient();
	const { markAsRead: markAsReadStore } = useNotificationStore();

	return useMutation({
		mutationFn: markNotificationAsRead,
		onSuccess: (data) => {
			// Update store
			markAsReadStore(data.id);

			// Invalidate queries to refetch
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllAsRead() {
	const queryClient = useQueryClient();
	const { markAllAsRead: markAllAsReadStore } = useNotificationStore();

	return useMutation({
		mutationFn: markAllAsRead,
		onSuccess: () => {
			// Update store
			markAllAsReadStore();

			// Invalidate queries to refetch
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});
}

/**
 * Hook for deleting notification
 */
export function useDeleteNotification() {
	const queryClient = useQueryClient();
	const { deleteNotification: deleteNotificationStore } = useNotificationStore();

	return useMutation({
		mutationFn: deleteNotification,
		onSuccess: (_, id) => {
			// Update store
			deleteNotificationStore(id);

			// Invalidate queries to refetch
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});
}

