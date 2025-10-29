'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TimelineEventsTable } from '@/components/timeline-events-table'
import { TimelineEventForm } from '@/components/timeline-event-form'
import {
	Calendar,
	Clock,
	AlertCircle,
	CheckCircle2,
	TrendingUp,
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

interface Semester {
	code: string
	name: string
	type: string
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
	const [events, setEvents] = useState<any[]>([])
	const [statistics, setStatistics] = useState<any>(null)
	const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
	const [overdueEvents, setOverdueEvents] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [editingEvent, setEditingEvent] = useState<any>(null)
	const [notificationPreview, setNotificationPreview] = useState<any>(null)
	const [activeTab, setActiveTab] = useState('all')

	useEffect(() => {
		loadData()
	}, [selectedSemester])

	async function loadData() {
		setIsLoading(true)
		try {
			await Promise.all([
				loadEvents(),
				loadStatistics(),
				loadUpcomingEvents(),
				loadOverdueEvents(),
			])
		} finally {
			setIsLoading(false)
		}
	}

	async function loadEvents() {
		const params = new URLSearchParams()
		if (selectedSemester) {
			params.append('semester', selectedSemester)
		}

		const response = await fetch(`/api/timeline?${params}`)
		if (response.ok) {
			const data = await response.json()
			setEvents(data)
		}
	}

	async function loadStatistics() {
		const params = new URLSearchParams({ stats: 'true' })
		if (selectedSemester) {
			params.append('semester', selectedSemester)
		}

		const response = await fetch(`/api/timeline?${params}`)
		if (response.ok) {
			const data = await response.json()
			setStatistics(data)
		}
	}

	async function loadUpcomingEvents() {
		const params = new URLSearchParams({ status: 'upcoming' })
		if (selectedSemester) {
			params.append('semester', selectedSemester)
		}

		const response = await fetch(`/api/timeline?${params}`)
		if (response.ok) {
			const data = await response.json()
			setUpcomingEvents(data)
		}
	}

	async function loadOverdueEvents() {
		const response = await fetch('/api/timeline?overdue=true')
		if (response.ok) {
			const data = await response.json()
			setOverdueEvents(data)
		}
	}

	async function handleCreateEvent(data: any) {
		const response = await fetch('/api/timeline', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (response.ok) {
			setShowCreateDialog(false)
			await loadData()
		} else {
			const error = await response.json()
			alert(error.error || 'Failed to create event')
		}
	}

	async function handleUpdateEvent(data: any) {
		if (!editingEvent) return

		const response = await fetch(`/api/timeline/${editingEvent.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (response.ok) {
			setEditingEvent(null)
			await loadData()
		} else {
			const error = await response.json()
			alert(error.error || 'Failed to update event')
		}
	}

	async function handleDeleteEvent(id: string) {
		if (!confirm('Are you sure you want to delete this event?')) return

		const response = await fetch(`/api/timeline/${id}`, {
			method: 'DELETE',
		})

		if (response.ok) {
			await loadData()
		} else {
			const error = await response.json()
			alert(error.error || 'Failed to delete event')
		}
	}

	async function handleMarkComplete(id: string) {
		await fetch(`/api/timeline/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'completed' }),
		})

		await loadData()
	}

	async function handleCancelEvent(id: string) {
		await fetch(`/api/timeline/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'cancelled' }),
		})

		await loadData()
	}

	async function handleCheckDeadlines() {
		const response = await fetch('/api/timeline/check-deadlines', {
			method: 'POST',
		})

		if (response.ok) {
			const result = await response.json()
			alert(
				`Deadline check completed!\n\n` +
					`Statuses updated: ${result.updated_statuses}\n` +
					`Notifications sent: ${result.notifications_sent}`
			)
			await loadData()
		} else {
			alert('Failed to check deadlines')
		}
	}

	async function handlePreviewNotifications() {
		const response = await fetch('/api/timeline/check-deadlines')
		if (response.ok) {
			const preview = await response.json()
			setNotificationPreview(preview)
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
					<Button onClick={handleCheckDeadlines} variant="outline">
						<Bell className="h-4 w-4 mr-2" />
						Check Deadlines
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
								events={events}
								onEdit={setEditingEvent}
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
								events={upcomingEvents}
								onEdit={setEditingEvent}
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
								events={events.filter((e) => e.status === 'in_progress')}
								onEdit={setEditingEvent}
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
								events={overdueEvents}
								onEdit={setEditingEvent}
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
								events={events.filter((e) => e.status === 'completed')}
								onEdit={setEditingEvent}
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
		</div>
	)
}

