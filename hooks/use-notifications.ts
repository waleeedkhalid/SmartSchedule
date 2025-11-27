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
export function useNotifications() {
	const { setNotifications } = useNotificationStore();
	
	const query = useQuery({
		queryKey: ['notifications', 'all'],
		queryFn: () => fetchNotifications(false),
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
		refetchInterval: 30 * 1000, // Poll every 30 seconds
	});
	
	// Sync with store when data changes - use useEffect to prevent infinite loops
	useEffect(() => {
		if (query.data) {
			setNotifications(query.data);
		}
	}, [query.data, setNotifications]);
	
	return query;
}

/**
 * Hook for fetching unread notifications only
 */
export function useUnreadNotifications() {
	const { setNotifications } = useNotificationStore();
	
	const query = useQuery({
		queryKey: ['notifications', 'unread'],
		queryFn: () => fetchNotifications(true),
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
		refetchInterval: 30 * 1000, // Poll every 30 seconds
	});
	
	// Sync with store when data changes - use useEffect to prevent infinite loops
	useEffect(() => {
		if (query.data) {
			setNotifications(query.data);
		}
	}, [query.data, setNotifications]);
	
	return query;
}

/**
 * Hook for fetching recent notifications (last 10)
 */
export function useRecentNotifications() {
	const { setNotifications } = useNotificationStore();
	
	const query = useQuery({
		queryKey: ['notifications', 'recent'],
		queryFn: async () => {
			const notifications = await fetchNotifications(false);
			return notifications.slice(0, 10);
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
		refetchInterval: 30 * 1000, // Poll every 30 seconds
	});
	
	// Sync with store when data changes - use useEffect to prevent infinite loops
	useEffect(() => {
		if (query.data) {
			setNotifications(query.data);
		}
	}, [query.data, setNotifications]);
	
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

