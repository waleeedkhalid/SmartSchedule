'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, AlertTriangle, Info, Calendar, BookOpen, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useRecentNotifications, useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/use-notifications'
import { format } from 'date-fns'
import { useIsClient } from '@/hooks/use-mounted'

interface Notification {
	id: string
	user_id: string
	type: string
	payload: Record<string, unknown>
	read_at: string | null
	created_at: string
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

function getNotificationTitle(type: string, payload: Record<string, unknown>): string {
	switch (type) {
		case 'timeline_deadline':
			return (typeof payload.event_title === 'string' ? payload.event_title : null) || 'Timeline Deadline'
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

function getNotificationDescription(type: string, payload: Record<string, unknown>): string {
	switch (type) {
		case 'timeline_deadline':
			const daysBefore = (typeof payload.days_before === 'number' ? payload.days_before : 0) || 0
			if (daysBefore > 0) {
				return `${daysBefore} day${daysBefore !== 1 ? 's' : ''} until deadline`
			}
			return (typeof payload.description === 'string' ? payload.description : null) || 'Deadline approaching'
		case 'section_updated':
			return (payload.section_code as string) || 'A section has been updated'
		case 'section_deleted':
			return (payload.section_code as string) || 'A section has been deleted'
		case 'exam_updated':
			return (payload.exam_id as string) || 'An exam has been updated'
		case 'exam_deleted':
			return (payload.exam_id as string) || 'An exam has been deleted'
		case 'schedule_released':
			return (payload.release_tag as string) || 'A new schedule has been released'
		default:
			return 'You have a new notification'
	}
}

function getNotificationLink(type: string, payload: Record<string, unknown>): string | null {
	switch (type) {
		case 'timeline_deadline':
			const eventId = payload.timeline_event_id as string
			return eventId ? `/dashboard/timeline?eventId=${eventId}` : '/dashboard/timeline'
		case 'section_updated':
		case 'section_deleted':
			return '/dashboard/sections'
		case 'exam_updated':
		case 'exam_deleted':
			return '/dashboard/exams'
		case 'schedule_released':
			return '/dashboard/scheduling'
		default:
			return null
	}
}

export function NotificationBell() {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
	const isClient = useIsClient()

	const { data: recentNotifications = [], isLoading } = useRecentNotifications()
	const { data: unreadNotifications = [] } = useUnreadNotifications()
	const markAsRead = useMarkAsRead()
	const markAllAsRead = useMarkAllAsRead()

	const unreadCount = unreadNotifications.length

	// Helper to safely format dates only on client
	const formatDate = (dateStr: string | null | undefined): string => {
		if (!isClient || !dateStr) return ''
		try {
			return format(new Date(dateStr), 'MMM d, h:mm a')
		} catch {
			return ''
		}
	}

	function handleNotificationClick(notification: Notification) {
		if (!notification.read_at) {
			markAsRead.mutate(notification.id)
		}
		setSelectedNotification(notification)
		setOpen(false)
	}



	function handleMarkAllAsRead() {
		markAllAsRead.mutate()
	}


	return (
		<>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="relative"
						aria-label="Notifications"
					>
						<Bell className="h-5 w-5" />
						{unreadCount > 0 && (
							<Badge
								variant="destructive"
								className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
							>
								{unreadCount > 9 ? '9+' : unreadCount}
							</Badge>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-80">
					<div className="flex items-center justify-between p-4 border-b">
						<h3 className="font-semibold text-sm">Notifications</h3>
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleMarkAllAsRead}
								className="h-7 text-xs"
								disabled={markAllAsRead.isPending}
							>
								<CheckCheck className="h-3 w-3 mr-1" />
								Mark all read
							</Button>
						)}
					</div>

					<ScrollArea className="h-[400px]">
						{isLoading ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								Loading notifications...
							</div>
						) : recentNotifications.length === 0 ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								<Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p>No notifications</p>
							</div>
						) : (
							<div className="py-2">
								{recentNotifications.map((notification) => {
									const isUnread = !notification.read_at
									const iconColor = getNotificationColor(notification.type)

									return (
										<DropdownMenuItem
											key={notification.id}
											className={cn(
												'flex items-start gap-3 p-3 cursor-pointer',
												isUnread && 'bg-blue-50 dark:bg-blue-950/20'
											)}
											onClick={() => handleNotificationClick(notification)}
										>
											<div className={cn('mt-0.5', iconColor)}>
												{getNotificationIcon(notification.type)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<p className={cn(
														'text-sm font-medium',
														isUnread && 'font-semibold'
													)}>
														{getNotificationTitle(notification.type, notification.payload)}
													</p>
													{isUnread && (
														<div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0 mt-1.5" />
													)}
												</div>
												<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
													{getNotificationDescription(notification.type, notification.payload)}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													{formatDate(notification.created_at)}
												</p>
											</div>
										</DropdownMenuItem>
									)
								})}
							</div>
						)}
					</ScrollArea>

				</DropdownMenuContent>
			</DropdownMenu >

			<Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedNotification && getNotificationTitle(selectedNotification.type, selectedNotification.payload)}
						</DialogTitle>
						<DialogDescription>
							{selectedNotification && format(new Date(selectedNotification.created_at), 'PPP p')}
						</DialogDescription>
					</DialogHeader>

					{selectedNotification && (
						<div className="space-y-4 py-4">
							<div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
								<div className={cn("mt-0.5", getNotificationColor(selectedNotification.type))}>
									{getNotificationIcon(selectedNotification.type)}
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium">
										{getNotificationDescription(selectedNotification.type, selectedNotification.payload)}
									</p>
									{typeof selectedNotification.payload.message === 'string' && (
										<p className="text-sm text-muted-foreground">
											{selectedNotification.payload.message}
										</p>
									)}
								</div>
							</div>

							{selectedNotification.type === 'timeline_deadline' && (
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">Deadline:</span>
										<p className="font-medium">
											{selectedNotification.payload.deadline ? format(new Date(selectedNotification.payload.deadline as string), 'PPP') : 'N/A'}
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">Priority:</span>
										<p className="font-medium capitalize">
											{selectedNotification.payload.priority as string || 'Normal'}
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setSelectedNotification(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
