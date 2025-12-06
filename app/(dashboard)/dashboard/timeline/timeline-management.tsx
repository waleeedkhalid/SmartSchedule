'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TimelineEventsTable } from '@/components/timeline-events-table'
import { TimelineEventForm } from '@/components/timeline-event-form'
import type { Database } from '@/lib/types/database'

type TimelineEventInsert = Database['public']['Tables']['semester_timeline']['Insert']
type TimelineEventRow = Database['public']['Tables']['semester_timeline']['Row']
import {
	Calendar,
	Clock,
	AlertCircle,
	CheckCircle2,
	Bell,
	Plus,
	RefreshCw,
} from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { getAuthHeader } from '@/lib/utils/client-auth'

interface Semester {
	code: string
	name: string
}

// Use database type for TimelineEvent to match form expectations
// The database allows null for priority, but we'll handle it in the component
type TimelineEvent = TimelineEventRow

interface TimelineStatistics {
	total: number
	upcoming: number
	in_progress: number
	overdue: number
	completed: number
	cancelled: number
	by_priority: {
		low: number
		medium: number
		high: number
		critical: number
	}
	total_events?: number
	upcoming_events?: number
	in_progress_events?: number
	overdue_events?: number
	completed_events?: number
	high_priority_count?: number
}

interface TimelineManagementProps {
	activeSemesterCode: string | null
	semesters: Semester[]
	userRole: string
}

export function TimelineManagement({
	activeSemesterCode,
	semesters,
	userRole,
}: TimelineManagementProps) {
	const [selectedSemester, setSelectedSemester] = useState(activeSemesterCode || '')
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
	const [activeTab, setActiveTab] = useState('all')
	const [successDialog, setSuccessDialog] = useState<{
		open: boolean
		title: string
		message: string
	}>({
		open: false,
		title: '',
		message: '',
	})
	const [isCheckingDeadlines, setIsCheckingDeadlines] = useState(false)
	const queryClient = useQueryClient()
	const router = useRouter()
	const searchParams = useSearchParams()

	// OPTIMIZATION: Use React Query for all data fetching with proper caching
	// This reduces unnecessary API calls and provides automatic caching
	const { data: events = [], isLoading: isLoadingEvents } = useQuery({
		queryKey: ['timeline', 'events', selectedSemester],
		queryFn: async () => {
			const params = new URLSearchParams()
			if (selectedSemester) {
				params.append('semester', selectedSemester)
			}
			const authHeader = await getAuthHeader()
			const response = await fetch(`/api/timeline?${params}`, {
				headers: { 'Authorization': authHeader },
			})
			if (!response.ok) throw new Error('Failed to load events')
			const result = await response.json()
			return (result.data || []) as TimelineEvent[]
		},
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		refetchOnWindowFocus: false,
	})

	// OPTIMIZATION: Derive statistics and upcoming events from the main events list
	// This saves 2 extra API calls per page load
	const { statistics, upcomingEvents } = useMemo(() => {
		if (!events.length) return { statistics: null, upcomingEvents: [] }

		const upcoming = events.filter(e => e.status === 'upcoming')
		const inProgress = events.filter(e => e.status === 'in_progress')
		const overdue = events.filter(e => e.status === 'overdue')
		const completed = events.filter(e => e.status === 'completed')
		const cancelled = events.filter(e => e.status === 'cancelled')

		const stats: TimelineStatistics = {
			total: events.length,
			upcoming: upcoming.length,
			in_progress: inProgress.length,
			overdue: overdue.length,
			completed: completed.length,
			cancelled: cancelled.length,
			by_priority: {
				low: events.filter(e => e.priority === 'low').length,
				medium: events.filter(e => e.priority === 'medium').length,
				high: events.filter(e => e.priority === 'high').length,
				critical: events.filter(e => e.priority === 'critical').length,
			},
			total_events: events.length,
			upcoming_events: upcoming.length,
			in_progress_events: inProgress.length,
			overdue_events: overdue.length,
			completed_events: completed.length,
			high_priority_count: events.filter(e => e.priority === 'high').length,
		}

		return { statistics: stats, upcomingEvents: upcoming }
	}, [events])

	const { data: overdueEvents = [], isLoading: isLoadingOverdue } = useQuery({
		queryKey: ['timeline', 'overdue'],
		queryFn: async () => {
			const authHeader = await getAuthHeader()
			const response = await fetch('/api/timeline?overdue=true', {
				headers: { 'Authorization': authHeader },
			})
			if (!response.ok) throw new Error('Failed to load overdue events')
			const result = await response.json()
			return (result.data || []) as TimelineEvent[]
		},
		staleTime: 2 * 60 * 1000, // Shorter cache for overdue (2 minutes) as it's more time-sensitive
		gcTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})

	// Effect to handle deep linking to specific events
	useEffect(() => {
		const eventId = searchParams.get('eventId')
		if (eventId && events.length > 0) {
			const event = events.find(e => e.id === eventId)
			if (event) {
				setEditingEvent(event)
				// Clean up URL without refreshing
				const newParams = new URLSearchParams(searchParams.toString())
				newParams.delete('eventId')
				router.replace(`/dashboard/timeline?${newParams.toString()}`, { scroll: false })
			}
		}
	}, [searchParams, events, router])

	const isLoading = isLoadingEvents || isLoadingOverdue

	// Helper function to invalidate timeline queries after mutations
	const invalidateTimelineQueries = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['timeline'] })
	}, [queryClient])

	// Helper to map database events to table format
	const mapEventForTable = useCallback((e: TimelineEventRow) => ({
		id: e.id,
		title: e.title,
		description: e.description,
		event_type: e.event_type,
		category: e.category,
		start_date: e.start_date,
		end_date: e.end_date,
		priority: e.priority,
		status: e.status,
		requires_action: e.requires_action,
		target_roles: e.target_roles,
		is_deadline: e.is_deadline,
	}), [])

	async function handleCreateEvent(data: TimelineEventInsert) {
		try {
			const authHeader = await getAuthHeader()
			const response = await fetch('/api/timeline', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authHeader,
				},
				body: JSON.stringify(data),
			})

			if (response.ok) {
				setShowCreateDialog(false)
				invalidateTimelineQueries() // Invalidate cache instead of manual reload
			} else {
				const result = await response.json()
				alert(result.error || 'Failed to create event')
			}
		} catch (error) {
			console.error('Error creating event:', error)
			alert('Failed to create event. Please try again.')
		}
	}

	async function handleUpdateEvent(data: Partial<TimelineEvent>) {
		if (!editingEvent) return

		try {
			const authHeader = await getAuthHeader()
			const response = await fetch(`/api/timeline/${editingEvent.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authHeader,
				},
				body: JSON.stringify(data),
			})

			if (response.ok) {
				setEditingEvent(null)
				invalidateTimelineQueries()
			} else {
				const result = await response.json()
				alert(result.error || 'Failed to update event')
			}
		} catch (error) {
			console.error('Error updating event:', error)
			alert('Failed to update event. Please try again.')
		}
	}

	async function handleDeleteEvent(id: string) {
		if (!confirm('Are you sure you want to delete this event?')) return

		try {
			const authHeader = await getAuthHeader()
			const response = await fetch(`/api/timeline/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': authHeader,
				},
			})

			if (response.ok) {
				invalidateTimelineQueries()
			} else {
				const result = await response.json()
				alert(result.error || 'Failed to delete event')
			}
		} catch (error) {
			console.error('Error deleting event:', error)
			alert('Failed to delete event. Please try again.')
		}
	}

	async function handleMarkComplete(id: string) {
		try {
			const authHeader = await getAuthHeader()
			const response = await fetch(`/api/timeline/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authHeader,
				},
				body: JSON.stringify({ status: 'completed' }),
			})

			if (response.ok) {
				invalidateTimelineQueries()
			} else {
				const result = await response.json()
				alert(result.error || 'Failed to mark event as complete')
			}
		} catch (error) {
			console.error('Error marking event as complete:', error)
			alert('Failed to mark event as complete. Please try again.')
		}
	}

	async function handleCancelEvent(id: string) {
		try {
			const authHeader = await getAuthHeader()
			const response = await fetch(`/api/timeline/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authHeader,
				},
				body: JSON.stringify({ status: 'cancelled' }),
			})

			if (response.ok) {
				invalidateTimelineQueries()
			} else {
				const result = await response.json()
				alert(result.error || 'Failed to cancel event')
			}
		} catch (error) {
			console.error('Error cancelling event:', error)
			alert('Failed to cancel event. Please try again.')
		}
	}

	async function handleCheckDeadlines() {
		setIsCheckingDeadlines(true)
		try {
			const authHeader = await getAuthHeader()
			const response = await fetch('/api/timeline/check-deadlines', {
				method: 'POST',
				headers: {
					'Authorization': authHeader,
				},
			})

			if (response.ok) {
				const result = await response.json()
				// API returns { success: true, data: {...} }
				const data = result.data || result

				setSuccessDialog({
					open: true,
					title: 'Deadline Check Complete',
					message: `Checked ${data.events_checked || 0} active events.\n\nNotifications sent: ${data.notifications_sent || 0}\nTotal recipients: ${data.total_recipients || 0}`
				})

				invalidateTimelineQueries()
				queryClient.invalidateQueries({ queryKey: ['notifications'] })
			} else {
				const result = await response.json()
				alert(result.error || 'Failed to check deadlines')
			}
		} catch (error) {
			console.error('Error checking deadlines:', error)
			alert('Failed to check deadlines. Please try again.')
		} finally {
			setIsCheckingDeadlines(false)
		}
	}


	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
					<p className="text-muted-foreground">Loading timeline...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Timeline & Deadlines</h1>
					<p className="text-muted-foreground">
						Manage scheduling timeline and notify stakeholders of deadlines
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Select value={selectedSemester} onValueChange={setSelectedSemester}>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select semester" />
						</SelectTrigger>
						<SelectContent>
							{semesters.map((sem) => (
								<SelectItem key={sem.code} value={sem.code}>
									{sem.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						onClick={handleCheckDeadlines}
						variant="outline"
						disabled={isCheckingDeadlines}
					>
						{isCheckingDeadlines ? (
							<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Bell className="h-4 w-4 mr-2" />
						)}
						Notify
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="h-4 w-4 mr-2" />
						New Event
					</Button>
				</div>
			</div>

			{/* Statistics Cards */}
			{statistics && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Events</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statistics.total_events}</div>
							<p className="text-xs text-muted-foreground">
								{statistics.upcoming_events} upcoming
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">In Progress</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{statistics.in_progress_events}
							</div>
							<p className="text-xs text-muted-foreground">Active events</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Overdue</CardTitle>
							<AlertCircle className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">
								{statistics.overdue_events}
							</div>
							<p className="text-xs text-muted-foreground">Needs attention</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Completed</CardTitle>
							<CheckCircle2 className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{statistics.completed_events}
							</div>
							<p className="text-xs text-muted-foreground">
								{statistics.high_priority_count} high priority
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Overdue Events Alert */}
			{overdueEvents.length > 0 && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Warning:</strong> You have {overdueEvents.length} overdue event
						{overdueEvents.length !== 1 ? 's' : ''} that require attention.
					</AlertDescription>
				</Alert>
			)}

			{/* Timeline Events */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="all">All Events</TabsTrigger>
					<TabsTrigger value="upcoming">
						Upcoming ({upcomingEvents.length})
					</TabsTrigger>
					<TabsTrigger value="in_progress">In Progress</TabsTrigger>
					<TabsTrigger value="overdue">
						Overdue {overdueEvents.length > 0 && `(${overdueEvents.length})`}
					</TabsTrigger>
					<TabsTrigger value="completed">Completed</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Timeline Events</CardTitle>
							<CardDescription>
								Complete list of timeline events and milestones
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TimelineEventsTable
								events={events.map(mapEventForTable)}
								onEdit={(event) => setEditingEvent(event as TimelineEvent)}
								onDelete={handleDeleteEvent}
								onMarkComplete={handleMarkComplete}
								onCancel={handleCancelEvent}
								canEdit={userRole === 'scheduling'}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="upcoming" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Upcoming Events</CardTitle>
							<CardDescription>Events scheduled to start soon</CardDescription>
						</CardHeader>
						<CardContent>
							<TimelineEventsTable
								events={upcomingEvents.map(mapEventForTable)}
								onEdit={(event) => setEditingEvent(event as TimelineEvent)}
								onDelete={handleDeleteEvent}
								onMarkComplete={handleMarkComplete}
								onCancel={handleCancelEvent}
								canEdit={userRole === 'scheduling'}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="in_progress" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Events In Progress</CardTitle>
							<CardDescription>
								Events currently active and ongoing
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TimelineEventsTable
								events={events.filter((e) => e.status === 'in_progress').map(mapEventForTable)}
								onEdit={(event) => setEditingEvent(event as TimelineEvent)}
								onDelete={handleDeleteEvent}
								onMarkComplete={handleMarkComplete}
								onCancel={handleCancelEvent}
								canEdit={userRole === 'scheduling'}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="overdue" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Overdue Events</CardTitle>
							<CardDescription>Events past their deadline</CardDescription>
						</CardHeader>
						<CardContent>
							<TimelineEventsTable
								events={overdueEvents.map(mapEventForTable)}
								onEdit={(event) => setEditingEvent(event as TimelineEvent)}
								onDelete={handleDeleteEvent}
								onMarkComplete={handleMarkComplete}
								onCancel={handleCancelEvent}
								canEdit={userRole === 'scheduling'}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="completed" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Completed Events</CardTitle>
							<CardDescription>Events that have been completed</CardDescription>
						</CardHeader>
						<CardContent>
							<TimelineEventsTable
								events={events.filter((e) => e.status === 'completed').map(mapEventForTable)}
								onEdit={(event) => setEditingEvent(event as TimelineEvent)}
								onDelete={handleDeleteEvent}
								canEdit={userRole === 'scheduling'}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Create Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create Timeline Event</DialogTitle>
						<DialogDescription>
							Add a new deadline or milestone to the timeline
						</DialogDescription>
					</DialogHeader>
					<TimelineEventForm
						semester={selectedSemester}
						onSubmit={handleCreateEvent}
						onCancel={() => setShowCreateDialog(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Timeline Event</DialogTitle>
						<DialogDescription>Update event details and settings</DialogDescription>
					</DialogHeader>
					{editingEvent && (
						<TimelineEventForm
							event={editingEvent}
							semester={selectedSemester}
							onSubmit={handleUpdateEvent}
							onCancel={() => setEditingEvent(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Success Dialog */}
			<Dialog
				open={successDialog.open}
				onOpenChange={(open) => setSuccessDialog(prev => ({ ...prev, open }))}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{successDialog.title}</DialogTitle>
						<DialogDescription className="whitespace-pre-line">
							{successDialog.message}
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end">
						<Button onClick={() => setSuccessDialog(prev => ({ ...prev, open: false }))}>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
