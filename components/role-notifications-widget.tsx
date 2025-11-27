'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle2, Clock, AlertTriangle, Info, Calendar, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRecentNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

interface RoleNotificationsWidgetProps {
	role: string
}

function getNotificationIcon(type: string) {
	switch (type) {
		case 'timeline_deadline':
			return <Clock className="h-4 w-4" />
		case 'section_updated':
		case 'section_deleted':
			return <Calendar className="h-4 w-4" />
		case 'exam_updated':
		case 'exam_deleted':
			return <AlertTriangle className="h-4 w-4" />
		case 'schedule_released':
			return <BookOpen className="h-4 w-4" />
		default:
			return <Info className="h-4 w-4" />
	}
}

function getNotificationColor(type: string) {
	switch (type) {
		case 'timeline_deadline':
			return 'text-orange-600 dark:text-orange-400'
		case 'section_updated':
		case 'section_deleted':
			return 'text-blue-600 dark:text-blue-400'
		case 'exam_updated':
		case 'exam_deleted':
			return 'text-red-600 dark:text-red-400'
		case 'schedule_released':
			return 'text-green-600 dark:text-green-400'
		default:
			return 'text-gray-600 dark:text-gray-400'
	}
}

function getNotificationTitle(type: string, payload: Record<string, any>): string {
	switch (type) {
		case 'timeline_deadline':
			return payload.event_title || 'Timeline Deadline'
		case 'section_updated':
			return 'Section Updated'
		case 'section_deleted':
			return 'Section Deleted'
		case 'exam_updated':
			return 'Exam Updated'
		case 'exam_deleted':
			return 'Exam Deleted'
		case 'schedule_released':
			return 'Schedule Released'
		default:
			return 'Notification'
	}
}

function getNotificationDescription(type: string, payload: Record<string, any>): string {
	switch (type) {
		case 'timeline_deadline':
			const daysBefore = payload.days_before || 0
			if (daysBefore > 0) {
				return `${daysBefore} day${daysBefore !== 1 ? 's' : ''} until deadline`
			}
			return payload.description || 'Deadline approaching'
		case 'section_updated':
			return payload.section_code || 'A section has been updated'
		case 'section_deleted':
			return payload.section_code || 'A section has been deleted'
		case 'exam_updated':
			return payload.exam_id || 'An exam has been updated'
		case 'exam_deleted':
			return payload.exam_id || 'An exam has been deleted'
		case 'schedule_released':
			return payload.release_tag || 'A new schedule has been released'
		default:
			return 'You have a new notification'
	}
}

export function RoleNotificationsWidget({ role }: RoleNotificationsWidgetProps) {
	const { data: notifications = [], isLoading, error } = useRecentNotifications()

	// Safely handle notifications array
	const safeNotifications = Array.isArray(notifications) ? notifications : []
	const unreadNotifications = safeNotifications.filter((n) => n && !n.read_at)
	const recentNotifications = safeNotifications.slice(0, 5) // Show only 5 most recent

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<p className="text-sm text-muted-foreground">Loading...</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	// Handle errors gracefully
	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
						<p className="text-sm font-medium">Unable to load notifications</p>
						<p className="text-xs text-muted-foreground mt-1">
							Please try refreshing the page
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Notifications
					{unreadNotifications.length > 0 && (
						<Badge variant="destructive" className="ml-2">
							{unreadNotifications.length} new
						</Badge>
					)}
				</CardTitle>
				<CardDescription>
					{unreadNotifications.length > 0
						? `${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`
						: 'Stay updated with important announcements'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{recentNotifications.length === 0 ? (
					<div className="text-center py-8">
						<CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
						<p className="text-sm font-medium">All caught up!</p>
						<p className="text-xs text-muted-foreground">
							No new notifications at the moment
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{recentNotifications
							.filter((n) => n && n.id) // Filter out invalid notifications
							.map((notification) => {
							if (!notification || !notification.id) return null
							
							const isUnread = !notification.read_at
							const iconColor = getNotificationColor(notification.type || '')
							const notificationType = notification.type || ''

							// Safely format date
							let formattedDate = 'Just now'
							try {
								if (notification.created_at) {
									formattedDate = format(new Date(notification.created_at), 'MMM d, h:mm a')
								}
							} catch {
								// Keep default if date parsing fails
							}

							return (
								<div
									key={notification.id}
									className={cn(
										'border rounded-lg p-3 hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950 dark:hover:border-indigo-700 transition-colors',
										isUnread && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
									)}
								>
									<div className="flex items-start gap-3">
										<div className={cn('mt-0.5 flex-shrink-0', iconColor)}>
											{getNotificationIcon(notificationType)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2 mb-1">
												<p className={cn(
													'text-sm font-medium',
													isUnread && 'font-semibold'
												)}>
													{getNotificationTitle(notificationType, notification.payload || {})}
												</p>
												{isUnread && (
													<div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0 mt-1.5" />
												)}
											</div>
											<p className="text-xs text-muted-foreground line-clamp-2 mb-1">
												{getNotificationDescription(notificationType, notification.payload || {})}
											</p>
											<p className="text-xs text-muted-foreground">
												{formattedDate}
											</p>
										</div>
									</div>
								</div>
							)
						})}

						{notifications.length > 5 && (
							<Button variant="ghost" className="w-full" asChild>
								<Link href="/dashboard/notifications">
									View all {notifications.length} notifications
								</Link>
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

